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

  let targetUrl = (params.url || params.targetUrl || '').trim();
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

  // Normalização de protocolo (se não tiver http:// ou https://, assumir https://)
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  // Se o usuário digitou uma pasta pública comum (ex: /public ou /public/), direcionar para o endpoint real da API DHRU
  if (/\/public\/?$/i.test(targetUrl)) {
    targetUrl = targetUrl.replace(/\/public\/?$/i, '/public/api/index.php');
  }

  // DHRU Fusion aceita envio em form urlencoded ou parameters JSON
  const postPayload = new URLSearchParams({
    username: username,
    apiaccesskey: apiKey,
    action: action,
    requestformat: 'JSON'
  }).toString();

  try {
    let targetResponse = await executeRequestWithRedirects(targetUrl, postPayload);

    // Se o retorno foi HTML puro ou erro 404 e a URL informada não continha '.php', tentar endpoints clássicos do DHRU
    let rawBody = targetResponse.body.trim();
    const isHtmlOrError = targetResponse.statusCode === 404 || 
      (targetResponse.statusCode === 200 && (rawBody.toLowerCase().startsWith('<!doctype html') || rawBody.toLowerCase().startsWith('<html')));

    if (isHtmlOrError && !targetUrl.toLowerCase().includes('.php')) {
      const candidates = [
        targetUrl.replace(/\/+$/, '') + '/public/api/index.php',
        targetUrl.replace(/\/+$/, '') + '/api/index.php'
      ];

      for (const cand of candidates) {
        try {
          const retryResponse = await executeRequestWithRedirects(cand, postPayload);
          const retryBody = retryResponse.body.trim();
          const retryIsXml = retryBody.startsWith('<?xml') || retryBody.startsWith('<RESPONSE') || retryBody.startsWith('<response');
          let retryIsJson = false;
          try { JSON.parse(retryBody); retryIsJson = true; } catch (e) {}

          if (retryResponse.statusCode === 200 && (retryIsJson || retryIsXml)) {
            targetResponse = retryResponse;
            rawBody = retryBody;
            targetUrl = cand;
            break;
          }
        } catch (retryErr) {}
      }
    }

    // 1. Verificar se retornou erro HTTP do fornecedor (após seguir redirecionamentos)
    if (targetResponse.statusCode !== 200 && targetResponse.statusCode !== 201) {
      let advice = '';
      if (targetResponse.statusCode === 301 || targetResponse.statusCode === 302) {
        advice = ' O servidor atacadista enviou um redirecionamento sem rota válida. Verifique se o endereço da API está correto (ex: https://conectproo.com/public/api/index.php).';
      } else if (targetResponse.statusCode === 404) {
        advice = ' O endpoint da API não foi encontrado. Em servidores DHRU Fusion, a URL costuma terminar em /public/api/index.php ou /api/index.php.';
      } else if (targetResponse.statusCode === 403) {
        advice = ' Acesso negado pelo servidor atacadista. Verifique se o seu IP está liberado na API do fornecedor.';
      }

      return res.end(JSON.stringify({
        success: false,
        httpStatus: targetResponse.statusCode,
        finalUrl: targetResponse.finalUrl,
        error: `O servidor atacadista respondeu com erro HTTP ${targetResponse.statusCode}.${advice} ${rawBody.substring(0, 200)}`
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
        let errorMsg = '';
        const errEntry = Array.isArray(parsedData.ERROR) ? parsedData.ERROR[0] : parsedData.ERROR;
        if (errEntry && errEntry.MESSAGE) {
          if (typeof errEntry.MESSAGE === 'string') {
            errorMsg = errEntry.MESSAGE;
          } else if (typeof errEntry.MESSAGE === 'object') {
            // Caso como {"username":["User name must be an email"]}
            const parts = [];
            for (const [field, val] of Object.entries(errEntry.MESSAGE)) {
              const msgText = Array.isArray(val) ? val.join(', ') : String(val);
              parts.push(`${field}: ${msgText}`);
            }
            errorMsg = parts.join(' | ');
          }
        }
        if (!errorMsg) errorMsg = JSON.stringify(parsedData.ERROR);

        // Traduzir ou amigabilizar mensagens comuns da API
        if (errorMsg.includes('must be an email')) {
          errorMsg = 'O Usuário da API deve ser o seu e-mail de login no painel do fornecedor (ex: seuemail@gmail.com).';
        }

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
      let extraHint = '';
      if (rawBody.toLowerCase().includes('<html') || rawBody.toLowerCase().includes('login')) {
        extraHint = ' O servidor retornou uma página de navegação HTML em vez da resposta da API. Certifique-se de colocar a URL do arquivo de API (ex: https://seuservidor.com/api/index.php).';
      }

      return res.end(JSON.stringify({
        success: false,
        error: `Resposta da API em formato inesperado (não é JSON nem XML).${extraHint} Resposta recebida: ${rawBody.substring(0, 160)}`
      }));
    }

    return res.end(JSON.stringify({
      success: true,
      count: services.length,
      action: action,
      services: services,
      source: targetResponse.finalUrl || targetUrl
    }));

  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({
      success: false,
      error: `Falha na requisição ao servidor atacadista: ${err.message}`
    }));
  }
};

// Envia requisição POST seguindo redirecionamentos (301, 302, 303, 307, 308) automaticamente
async function executeRequestWithRedirects(startUrl, postPayload, maxRedirects = 5) {
  let currentUrl = startUrl.trim();
  if (!/^https?:\/\//i.test(currentUrl)) {
    currentUrl = 'https://' + currentUrl;
  }

  let redirects = 0;
  const history = [currentUrl];

  while (redirects <= maxRedirects) {
    const parsedTarget = new URL(currentUrl);
    const isHttps = parsedTarget.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedTarget.hostname,
      port: parsedTarget.port || (isHttps ? 443 : 80),
      path: (parsedTarget.pathname || '/') + (parsedTarget.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postPayload),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GSMServerClient/2.0',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 15000
    };

    const res = await new Promise((resolve, reject) => {
      const req = client.request(requestOptions, (extRes) => {
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

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout de 15 segundos excedido ao conectar no servidor atacadista.'));
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(postPayload);
      req.end();
    });

    // Se respondeu status de redirecionamento e tem cabeçalho Location
    if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
      redirects++;
      const nextUrl = new URL(res.headers.location, currentUrl).href;

      // Detectar loop de redirecionamento cíclico (ex: https://site.com/public <-> https://site.com/public/)
      const isLoop = history.includes(nextUrl) || (nextUrl.replace(/\/$/, '') === currentUrl.replace(/\/$/, ''));
      if (isLoop) {
        if (/\/public\/?$/i.test(nextUrl)) {
          // No Laravel/DHRU, pasta /public em loop deve apontar para o endpoint real de API:
          currentUrl = nextUrl.replace(/\/public\/?$/i, '/public/api/index.php');
          history.push(currentUrl);
          continue;
        } else if (!nextUrl.toLowerCase().includes('.php')) {
          currentUrl = nextUrl.replace(/\/+$/, '') + '/api/index.php';
          history.push(currentUrl);
          continue;
        } else {
          throw new Error(`Loop de redirecionamento detectado no servidor atacadista (${currentUrl} <-> ${nextUrl}). Verifique se a URL termina com o arquivo da API (ex: https://conectproo.com/public/api/index.php).`);
        }
      }

      history.push(nextUrl);
      currentUrl = nextUrl;
      continue;
    }

    return {
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body,
      finalUrl: currentUrl,
      redirectsFollowed: redirects,
      history: history
    };
  }

  throw new Error(`Limite de redirecionamentos excedido (${maxRedirects}): ${history.join(' -> ')}`);
}

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
