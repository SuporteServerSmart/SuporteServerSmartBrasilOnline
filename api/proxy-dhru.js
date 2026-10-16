// Vercel Serverless Function & Local Gateway: Proxy de Conexão DHRU Fusion e GSM Server
const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = async function handler(req, res) {
  // Configurar CORS para permitir que o painel admin chame o proxy livremente
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Apenas requisições POST são aceitas' }));
  }

  // Obter body
  let bodyStr = '';
  if (typeof req.body === 'object' && req.body !== null) {
    bodyStr = JSON.stringify(req.body);
  } else {
    bodyStr = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
    });
  }

  let params = {};
  try {
    params = bodyStr ? JSON.parse(bodyStr) : {};
  } catch (e) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ success: false, error: 'JSON de requisição inválido' }));
  }

  const targetUrl = (params.url || params.targetUrl || '').trim();
  const username = (params.username || '').trim();
  const apiKey = (params.apiKey || params.apiaccesskey || '').trim();
  const action = (params.action || 'imeiservicelist').trim();
  const provider = (params.provider || 'dhru').trim();

  if (!targetUrl || !apiKey) {
    res.statusCode = 400;
    return res.end(JSON.stringify({
      success: false,
      error: 'Parâmetros obrigatórios ausentes: informe a URL da API e a Chave de Acesso (API Key).'
    }));
  }

  try {
    const parsedTarget = new URL(targetUrl);
    const isHttps = parsedTarget.protocol === 'https:';
    const client = isHttps ? https : http;

    // DHRU Fusion aceita envio em form urlencoded ou parameters JSON
    const postPayload = new URLSearchParams({
      username: username,
      apiaccesskey: apiKey,
      action: action,
      requestformat: 'JSON'
    }).toString();

    const requestOptions = {
      hostname: parsedTarget.hostname,
      port: parsedTarget.port || (isHttps ? 443 : 80),
      path: parsedTarget.pathname + parsedTarget.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postPayload),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GSMServerClient/2.0',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 15000
    };

    const targetResponse = await new Promise((resolve, reject) => {
      const externalReq = client.request(requestOptions, (extRes) => {
        let rawData = '';
        extRes.on('data', chunk => rawData += chunk);
        extRes.on('end', () => {
          resolve({
            statusCode: extRes.statusCode,
            headers: extRes.headers,
            body: rawData
          });
        });
      });

      externalReq.on('timeout', () => {
        externalReq.destroy();
        reject(new Error('Timeout de 15 segundos excedido ao conectar no servidor atacadista.'));
      });

      externalReq.on('error', (err) => {
        reject(err);
      });

      externalReq.write(postPayload);
      externalReq.end();
    });

    const rawBody = targetResponse.body.trim();

    // 1. Verificar se retornou erro HTTP do fornecedor
    if (targetResponse.statusCode !== 200 && targetResponse.statusCode !== 201) {
      return res.end(JSON.stringify({
        success: false,
        httpStatus: targetResponse.statusCode,
        error: `O servidor atacadista respondeu com erro HTTP ${targetResponse.statusCode}: ${rawBody.substring(0, 300)}`
      }));
    }

    // 2. Tentar analisar como JSON
    let parsedData = null;
    let isXml = rawBody.startsWith('<?xml') || rawBody.startsWith('<RESPONSE') || rawBody.startsWith('<response');

    if (!isXml) {
      try {
        parsedData = JSON.parse(rawBody);
      } catch (jsonErr) {
        // Se falhou ao parsear JSON, pode ser XML com caracteres antes
        if (rawBody.includes('<RESPONSE>') || rawBody.includes('<response>') || rawBody.includes('<SUCCESS>')) {
          isXml = true;
        }
      }
    }

    // 3. Extrair serviços
    let services = [];

    if (parsedData) {
      // Verificar se o DHRU retornou erro explícito na resposta JSON
      if (parsedData.ERROR) {
        const errorMsg = Array.isArray(parsedData.ERROR) && parsedData.ERROR[0] && parsedData.ERROR[0].MESSAGE
          ? parsedData.ERROR[0].MESSAGE
          : JSON.stringify(parsedData.ERROR);
        return res.end(JSON.stringify({
          success: false,
          error: `Erro retornado pela API DHRU: ${errorMsg}`
        }));
      }

      services = parseDhruJsonServices(parsedData);
    } else if (isXml) {
      services = parseDhruXmlServices(rawBody);
    } else {
      // Se não for nem JSON nem XML válido
      return res.end(JSON.stringify({
        success: false,
        error: `Resposta da API em formato inesperado (não é JSON nem XML): ${rawBody.substring(0, 200)}`
      }));
    }

    return res.end(JSON.stringify({
      success: true,
      count: services.length,
      action: action,
      services: services,
      source: targetUrl
    }));

  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({
      success: false,
      error: `Falha na requisição ao servidor atacadista: ${err.message}`
    }));
  }
};

// Parser inteligente para estruturas JSON retornadas por servidores DHRU Fusion
function parseDhruJsonServices(data) {
  const result = [];

  // Caso A: { SUCCESS: [ { LIST: { GROUP_NAME: "...", SERVICES: [ ... ] } } ] }
  // Ou: { SUCCESS: [ { GROUPNAME: "...", SERVICES: [ ... ] } ] }
  const successBlock = data.SUCCESS || data.success || data;

  function processServiceItem(item, groupName = '') {
    if (!item) return;
    const name = String(item.SERVICENAME || item.servicename || item.name || item.ServiceName || '').trim();
    if (!name) return;

    const id = String(item.SERVICEID || item.serviceid || item.id || `dhru-${Date.now()}-${result.length}`).trim();
    const credit = parseFloat(item.CREDIT || item.credit || item.price || item.Cost || item.cost || 0);
    const time = String(item.TIME || item.time || item.DeliveryTime || item.delivery_time || '1-24 Horas').trim();
    const info = String(item.INFO || item.info || item.description || groupName || '').trim();

    result.push({
      id: id,
      name: name,
      category: detectCategory(name, groupName),
      categoryLabel: detectCategoryLabel(name, groupName),
      costUSD: credit,
      time: time,
      description: info || `${name} - Via API DHRU Fusion`
    });
  }

  if (Array.isArray(successBlock)) {
    for (const group of successBlock) {
      const groupName = group.GROUPNAME || group.groupname || group.GROUP_NAME || (group.LIST && group.LIST.GROUP_NAME) || '';
      const list = group.SERVICES || group.services || (group.LIST && group.LIST.SERVICES) || [];

      if (Array.isArray(list)) {
        for (const s of list) {
          processServiceItem(s, groupName);
        }
      } else if (typeof list === 'object' && list !== null) {
        Object.values(list).forEach(s => processServiceItem(s, groupName));
      } else if (group.SERVICEID || group.SERVICENAME || group.name) {
        processServiceItem(group, groupName);
      }
    }
  } else if (typeof successBlock === 'object' && successBlock !== null) {
    // Pode ser um dicionário { "1": { ... }, "2": { ... } }
    Object.keys(successBlock).forEach(k => {
      const val = successBlock[k];
      if (typeof val === 'object' && val !== null) {
        if (val.SERVICES && Array.isArray(val.SERVICES)) {
          val.SERVICES.forEach(s => processServiceItem(s, val.GROUP_NAME || k));
        } else if (val.SERVICENAME || val.name || val.SERVICEID) {
          processServiceItem(val, k);
        }
      }
    });
  }

  return result;
}

// Parser para respostas XML de servidores DHRU Fusion
function parseDhruXmlServices(xmlStr) {
  const result = [];
  const serviceRegex = /<SERVICES>([\s\S]*?)<\/SERVICES>|<SERVICE>([\s\S]*?)<\/SERVICE>/gi;
  let match;

  while ((match = serviceRegex.exec(xmlStr)) !== null) {
    const block = match[1] || match[2];
    const idMatch = block.match(/<SERVICEID>([\s\S]*?)<\/SERVICEID>|<id>([\s\S]*?)<\/id>/i);
    const nameMatch = block.match(/<SERVICENAME>([\s\S]*?)<\/SERVICENAME>|<name>([\s\S]*?)<\/name>/i);
    const creditMatch = block.match(/<CREDIT>([\s\S]*?)<\/CREDIT>|<price>([\s\S]*?)<\/price>/i);
    const timeMatch = block.match(/<TIME>([\s\S]*?)<\/TIME>|<delivery_time>([\s\S]*?)<\/delivery_time>/i);
    const groupMatch = block.match(/<GROUP_NAME>([\s\S]*?)<\/GROUP_NAME>|<group>([\s\S]*?)<\/group>/i);

    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim();
      const id = idMatch ? idMatch[1].trim() : `dhru-xml-${result.length}`;
      const credit = creditMatch ? parseFloat(creditMatch[1].trim()) || 0 : 0;
      const time = timeMatch ? timeMatch[1].trim() : '1-24 Horas';
      const group = groupMatch ? groupMatch[1].trim() : '';

      result.push({
        id: id,
        name: name,
        category: detectCategory(name, group),
        categoryLabel: detectCategoryLabel(name, group),
        costUSD: credit,
        time: time,
        description: `${name} - Via API DHRU Fusion`
      });
    }
  }

  return result;
}

function detectCategory(name, group = '') {
  const text = (name + ' ' + group).toLowerCase();
  if (text.includes('credit') || text.includes('crédito') || text.includes('server')) return 'credits';
  if (text.includes('frp') || text.includes('edl') || text.includes('remote') || text.includes('imei') || text.includes('icloud') || text.includes('remoto')) return 'imei';
  return 'tools';
}

function detectCategoryLabel(name, group = '') {
  const cat = detectCategory(name, group);
  if (cat === 'credits') return 'Servidor & Créditos';
  if (cat === 'imei') return 'FRP & EDL Remoto';
  return 'Ferramentas & Dongles';
}
