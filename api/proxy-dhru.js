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

  // Ações de serviços conhecidas no padrão DHRU Fusion / GSM Server / GSMTheme
  const serviceActions = [
    'serverservicelist',
    'imeiservicelist',
    'fileservicelist',
    'services',
    'servicelist',
    'getservices',
    'getserverservicelist',
    'getimeiservicelist'
  ];

  // Função auxiliar para enviar uma ação específica para a API DHRU
  async function queryDhruAction(actionName, endpointUrl) {
    const postPayload = new URLSearchParams({
      username: username,
      apiaccesskey: apiKey,
      action: actionName,
      requestformat: 'JSON'
    }).toString();

    let targetResponse = await executeRequestWithRedirects(endpointUrl, postPayload);
    let rawBody = (targetResponse.body || '').trim();

    // Se o retorno foi HTML puro ou erro 404 e a URL informada não continha '.php', tentar endpoints clássicos do DHRU
    const isHtmlOrError = targetResponse.statusCode === 404 || 
      (targetResponse.statusCode === 200 && (rawBody.toLowerCase().startsWith('<!doctype html') || rawBody.toLowerCase().startsWith('<html')));

    if (isHtmlOrError && !endpointUrl.toLowerCase().includes('.php')) {
      const candidates = [
        endpointUrl.replace(/\/+$/, '') + '/public/api/index.php',
        endpointUrl.replace(/\/+$/, '') + '/api/index.php'
      ];

      for (const cand of candidates) {
        try {
          const retryResponse = await executeRequestWithRedirects(cand, postPayload);
          const retryBody = (retryResponse.body || '').trim();
          const retryIsXml = retryBody.startsWith('<?xml') || retryBody.startsWith('<RESPONSE') || retryBody.startsWith('<response');
          let retryIsJson = false;
          try { JSON.parse(retryBody); retryIsJson = true; } catch (e) {}

          if (retryResponse.statusCode === 200 && (retryIsJson || retryIsXml)) {
            targetResponse = retryResponse;
            rawBody = retryBody;
            endpointUrl = cand;
            break;
          }
        } catch (retryErr) {}
      }
    }

    return {
      statusCode: targetResponse.statusCode,
      finalUrl: targetResponse.finalUrl || endpointUrl,
      rawBody: rawBody
    };
  }

  try {
    // Determinar quais ações consultar
    let actionsToExecute = [];
    if (action === 'get_all_services' || action === 'all') {
      actionsToExecute = serviceActions;
    } else if (action === 'accountinfo' || action === 'get_balance') {
      actionsToExecute = ['accountinfo', 'serverservicelist', 'imeiservicelist'];
    } else {
      actionsToExecute = [action];
    }

    let allCollectedServices = [];
    let lastError = null;
    let authFailed = false;
    let effectiveUrl = targetUrl;
    let detectedApiGlobalCurrency = '';

    for (let i = 0; i < actionsToExecute.length; i++) {
      const currentAct = actionsToExecute[i];
      const resp = await queryDhruAction(currentAct, effectiveUrl);
      if (resp.finalUrl) effectiveUrl = resp.finalUrl;

      const rawBody = resp.rawBody;

      // Se retornou erro HTTP
      if (resp.statusCode !== 200 && resp.statusCode !== 201) {
        lastError = `O servidor atacadista respondeu com erro HTTP ${resp.statusCode}.`;
        continue;
      }

      // Tentar analisar JSON ou XML
      let parsedData = null;
      let isXml = rawBody.startsWith('<?xml') || rawBody.startsWith('<RESPONSE') || rawBody.startsWith('<response');

      if (!isXml) {
        try {
          parsedData = JSON.parse(rawBody);
        } catch (jsonErr) {
          if (rawBody.includes('<RESPONSE>') || rawBody.includes('<response>') || rawBody.includes('<SUCCESS>')) {
            isXml = true;
          }
        }
      }

      if (parsedData) {
        // Verificar se houve erro DHRU
        if (parsedData.ERROR) {
          let errorMsg = '';
          const errEntry = Array.isArray(parsedData.ERROR) ? parsedData.ERROR[0] : parsedData.ERROR;
          if (errEntry && errEntry.MESSAGE) {
            if (typeof errEntry.MESSAGE === 'string') {
              errorMsg = errEntry.MESSAGE;
            } else if (typeof errEntry.MESSAGE === 'object') {
              const parts = [];
              for (const [field, val] of Object.entries(errEntry.MESSAGE)) {
                parts.push(`${field}: ${Array.isArray(val) ? val.join(', ') : val}`);
              }
              errorMsg = parts.join(' | ');
            }
          }
          if (!errorMsg) errorMsg = JSON.stringify(parsedData.ERROR);

          // Se for erro de autenticação / credenciais, interromper imediatamente
          const lowerErr = errorMsg.toLowerCase();
          if (lowerErr.includes('authentication') || lowerErr.includes('must be an email') || lowerErr.includes('ip not allowed') || lowerErr.includes('access denied')) {
            authFailed = true;
            if (lowerErr.includes('must be an email')) {
              errorMsg = 'O Usuário da API deve ser o seu e-mail de login no painel do fornecedor (ex: seuemail@gmail.com).';
            }
            return res.end(JSON.stringify({
              success: false,
              error: `Erro retornado pela API DHRU: ${errorMsg}`
            }));
          }

          // Se for "Invalid Action" e estávamos tentando listar serviços com uma ação específica:
          // Tentar automaticamente as outras ações de serviço (ex: serverservicelist)
          if (lowerErr.includes('invalid action')) {
            lastError = `Erro retornado pela API DHRU: ${errorMsg}`;
            // Se o usuário pediu só 1 ação de serviço (ex: imeiservicelist) e deu Invalid Action, adiciona os outros serviços para tentar
            if (actionsToExecute.length === 1 && serviceActions.includes(currentAct)) {
              const fallbacks = serviceActions.filter(a => a !== currentAct);
              actionsToExecute.push(...fallbacks);
            }
            continue;
          }

          lastError = `Erro retornado pela API DHRU: ${errorMsg}`;
          continue;
        }

        // Se for requisição de accountinfo / saldo
        if (currentAct === 'accountinfo') {
          const accountInfo = extractDhruAccountInfo(parsedData, rawBody);
          return res.end(JSON.stringify({
            success: true,
            action: 'accountinfo',
            credit: accountInfo.credit,
            currency: accountInfo.currency || 'USD',
            email: accountInfo.email,
            data: parsedData.SUCCESS || parsedData,
            source: effectiveUrl
          }));
        }

        const c = detectApiCurrency(parsedData, rawBody);
        if (c && !detectedApiGlobalCurrency) detectedApiGlobalCurrency = c;

        const currentServices = parseDhruJsonServices(parsedData, detectedApiGlobalCurrency || 'USD');
        if (currentServices && currentServices.length > 0) {
          allCollectedServices.push(...currentServices);
        }
      } else if (isXml) {
        if (currentAct === 'accountinfo') {
          const accountInfo = extractDhruAccountInfo(null, rawBody);
          return res.end(JSON.stringify({
            success: true,
            action: 'accountinfo',
            credit: accountInfo.credit,
            currency: accountInfo.currency || 'USD',
            email: accountInfo.email,
            source: effectiveUrl
          }));
        }

        const c = detectApiCurrency(null, rawBody);
        if (c && !detectedApiGlobalCurrency) detectedApiGlobalCurrency = c;

        const currentServices = parseDhruXmlServices(rawBody, detectedApiGlobalCurrency || 'USD');
        if (currentServices && currentServices.length > 0) {
          allCollectedServices.push(...currentServices);
        }
      } else {
        lastError = `Resposta inesperada: ${rawBody.substring(0, 150)}`;
      }
    }

    // Se a ação original era accountinfo e falhou com Invalid Action, mas o teste de conexão precisava saber se a chave é válida:
    if (action === 'accountinfo' && allCollectedServices.length > 0) {
      return res.end(JSON.stringify({
        success: true,
        action: 'accountinfo',
        message: 'Conexão validada com sucesso através do catálogo de serviços.',
        currency: detectedApiGlobalCurrency || 'USD',
        source: effectiveUrl
      }));
    }

    // Se serviços foram encontrados em qualquer uma das ações
    if (allCollectedServices.length > 0) {
      // Deduplicar por id
      const uniqueServices = [];
      const seenIds = new Set();
      for (const s of allCollectedServices) {
        const key = `${s.id}-${(s.name || '').toLowerCase()}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          uniqueServices.push(s);
        }
      }

      return res.end(JSON.stringify({
        success: true,
        count: uniqueServices.length,
        action: action,
        currency: detectedApiGlobalCurrency || 'USD',
        services: uniqueServices,
        source: effectiveUrl
      }));
    }

    // Se nenhum serviço foi obtido e houve erro
    if (lastError) {
      if (lastError.toLowerCase().includes('invalid action')) {
        lastError = 'O servidor atacadista informou "Invalid Action". O seu fornecedor pode exigir que você ative as permissões de API (Server Services / IMEI Services) no perfil da sua conta.';
      }
      return res.end(JSON.stringify({
        success: false,
        error: lastError
      }));
    }

    return res.end(JSON.stringify({
      success: true,
      count: 0,
      services: [],
      source: effectiveUrl
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

// Limpa e converte strings de valor monetário sem perder centavos ou sofrer com formatação local
function parseExactAmount(val) {
  if (typeof val === 'number') return Math.round(val * 10000) / 10000;
  if (!val) return 0;
  let s = String(val).trim();
  // Remover caracteres não numéricos exceto ponto e vírgula
  s = s.replace(/[^0-9.,]/g, '');
  if (!s) return 0;

  // Lidar com separadores mistos (ex: 1,250.50 ou 1.250,50)
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // Padrão brasileiro/europeu: 1.250,50 -> 1250.50
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // Padrão americano: 1,250.50 -> 1250.50
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    // Apenas vírgula: 25,50 -> 25.50
    s = s.replace(',', '.');
  }

  const num = parseFloat(s);
  return isNaN(num) ? 0 : Math.round(num * 10000) / 10000;
}

// Extrai o custo exato do objeto de serviço usando qualquer chave compatível com DHRU e GSM
function extractExactCost(obj) {
  if (!obj || typeof obj !== 'object') return 0;

  const costKeys = [
    'CREDIT', 'credit', 'Credit',
    'USER_PRICE', 'UserPrice', 'user_price',
    'SPECIAL_PRICE', 'SpecialPrice', 'special_price',
    'PRICE', 'price', 'Price',
    'COST', 'cost', 'Cost',
    'AMOUNT', 'amount', 'Amount',
    'RATE', 'rate', 'Rate',
    'CREDITS', 'credits', 'Credits'
  ];

  for (const k of costKeys) {
    if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
      const parsed = parseExactAmount(obj[k]);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
  }

  return 0;
}

// Detecta a moeda retornada pela API (USD, BRL, EUR)
function detectApiCurrency(data, rawBody = '') {
  let currency = '';

  function scan(obj) {
    if (!obj || typeof obj !== 'object' || currency) return;
    if (Array.isArray(obj)) {
      for (const item of obj) scan(item);
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase();
      if ((lower === 'currency' || lower === 'curr' || lower === 'currency_code' || lower === 'currencyname') && typeof v === 'string') {
        const c = v.trim().toUpperCase();
        if (c.length <= 4) {
          currency = c;
          return;
        }
      }
      if (typeof v === 'object' && v !== null) scan(v);
    }
  }

  if (data) scan(data);

  if (!currency && rawBody) {
    const m = rawBody.match(/<currency>([A-Za-z]{3,4})<\/currency>|<CURRENCY>([A-Za-z]{3,4})<\/CURRENCY>/i);
    if (m) currency = (m[1] || m[2]).trim().toUpperCase();
  }

  if (currency === 'R$' || currency === 'REAL' || currency === 'REAIS') currency = 'BRL';
  return currency || '';
}

// Parser inteligente para estruturas JSON retornadas por servidores DHRU Fusion e GSM Theme
function parseDhruJsonServices(data, defaultCurrency = 'USD') {
  const result = [];
  const seenIds = new Set();
  const globalCurrency = detectApiCurrency(data) || defaultCurrency;

  function isService(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    const hasName = Boolean(obj.SERVICENAME || obj.servicename || obj.ServiceName || obj.service_name || obj.name);
    const hasId = Boolean(obj.SERVICEID || obj.serviceid || obj.ServiceID || obj.service_id || obj.id);
    const hasCredit = obj.CREDIT !== undefined || obj.credit !== undefined || obj.price !== undefined || obj.cost !== undefined || obj.Cost !== undefined || obj.amount !== undefined;
    
    return hasName || (hasId && hasCredit);
  }

  function extractService(obj, groupName = '') {
    const name = String(obj.SERVICENAME || obj.servicename || obj.ServiceName || obj.service_name || obj.name || '').trim();
    if (!name) return;

    const id = String(obj.SERVICEID || obj.serviceid || obj.ServiceID || obj.service_id || obj.id || `dhru-${Date.now()}-${result.length}`).trim();
    const key = `${id}-${name.toLowerCase()}`;
    if (seenIds.has(key)) return;
    seenIds.add(key);

    const exactCost = extractExactCost(obj);
    const time = String(obj.TIME || obj.time || obj.DeliveryTime || obj.delivery_time || obj.timeframe || '1-24 Horas').trim();
    const group = String(obj.GROUPNAME || obj.groupname || obj.GroupName || obj.GROUP_NAME || groupName || '').trim();
    const info = String(obj.INFO || obj.info || obj.description || obj.Description || '').trim();
    const svcCurrency = detectApiCurrency(obj) || globalCurrency;

    result.push({
      id: id,
      name: name,
      category: detectCategory(name, group),
      categoryLabel: detectCategoryLabel(name, group),
      cost: exactCost,            // Custo exato sem arredondamento
      rawCost: exactCost,         // Custo exato original da API
      costUSD: exactCost,         // Campo de compatibilidade
      costBRL: exactCost,         // Campo de compatibilidade
      currency: svcCurrency,      // Moeda nativa da API
      time: time,
      description: info || (group ? `${name} (${group})` : `${name} - Via API DHRU Fusion`)
    });
  }

  function traverse(node, currentGroup = '') {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      for (const item of node) {
        traverse(item, currentGroup);
      }
      return;
    }

    // Se o próprio objeto é um item de serviço
    if (isService(node)) {
      extractService(node, currentGroup);
      return;
    }

    // Obter nome de grupo se especificado no nó
    const nodeGroup = node.GROUPNAME || node.groupname || node.GroupName || node.GROUP_NAME || '';
    const activeGroup = nodeGroup || currentGroup;

    // Percorrer chaves e sub-objetos
    for (const [key, val] of Object.entries(node)) {
      if (typeof val === 'object' && val !== null) {
        const isNumeric = /^\d+$/.test(key);
        const childGroup = (val.GROUPNAME || val.groupname || val.GroupName || val.GROUP_NAME || (!isNumeric && key !== 'LIST' && key !== 'SERVICES' && key !== 'SUCCESS' && key !== 'success' ? key : '')) || activeGroup;
        traverse(val, childGroup);
      }
    }
  }

  const successBlock = data.SUCCESS || data.success || data;
  traverse(successBlock);

  return result;
}

// Parser para respostas XML de servidores DHRU Fusion
function parseDhruXmlServices(xmlStr, defaultCurrency = 'USD') {
  const result = [];
  const globalCurrency = detectApiCurrency(null, xmlStr) || defaultCurrency;
  const serviceRegex = /<SERVICES>([\s\S]*?)<\/SERVICES>|<SERVICE>([\s\S]*?)<\/SERVICE>/gi;
  let match;

  while ((match = serviceRegex.exec(xmlStr)) !== null) {
    const block = match[1] || match[2];
    const idMatch = block.match(/<SERVICEID>([\s\S]*?)<\/SERVICEID>|<id>([\s\S]*?)<\/id>/i);
    const nameMatch = block.match(/<SERVICENAME>([\s\S]*?)<\/SERVICENAME>|<name>([\s\S]*?)<\/name>/i);
    const creditMatch = block.match(/<CREDIT>([\s\S]*?)<\/CREDIT>|<price>([\s\S]*?)<\/price>|<cost>([\s\S]*?)<\/cost>|<amount>([\s\S]*?)<\/amount>|<rate>([\s\S]*?)<\/rate>/i);
    const timeMatch = block.match(/<TIME>([\s\S]*?)<\/TIME>|<delivery_time>([\s\S]*?)<\/delivery_time>/i);
    const groupMatch = block.match(/<GROUP_NAME>([\s\S]*?)<\/GROUP_NAME>|<group>([\s\S]*?)<\/group>/i);

    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim();
      const id = idMatch ? idMatch[1].trim() : `dhru-xml-${result.length}`;
      const exactCost = creditMatch ? parseExactAmount(creditMatch[1] || creditMatch[2] || creditMatch[3] || creditMatch[4] || creditMatch[5] || 0) : 0;
      const time = timeMatch ? timeMatch[1].trim() : '1-24 Horas';
      const group = groupMatch ? groupMatch[1].trim() : '';

      result.push({
        id: id,
        name: name,
        category: detectCategory(name, group),
        categoryLabel: detectCategoryLabel(name, group),
        cost: exactCost,
        rawCost: exactCost,
        costUSD: exactCost,
        costBRL: exactCost,
        currency: globalCurrency,
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

// Extrai saldo e moeda da resposta do accountinfo
function extractDhruAccountInfo(data, rawBody) {
  let credit = null;
  let currency = 'USD';
  let email = '';

  function scan(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      for (const item of obj) scan(item);
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase();
      if ((lower === 'credit' || lower === 'credits' || lower === 'balance' || lower === 'saldo' || lower === 'acc_credit') && (typeof v === 'string' || typeof v === 'number')) {
        const parsed = parseExactAmount(v);
        if (!isNaN(parsed)) credit = parsed;
      }
      if ((lower === 'currency' || lower === 'curr' || lower === 'currency_code') && typeof v === 'string') {
        let c = v.trim().toUpperCase();
        if (c === 'R$' || c === 'REAL' || c === 'REAIS') c = 'BRL';
        currency = c;
      }
      if ((lower === 'username' || lower === 'mail' || lower === 'email' || lower === 'acc_username') && typeof v === 'string') {
        email = v.trim();
      }
      if (typeof v === 'object' && v !== null) {
        scan(v);
      }
    }
  }

  if (data) {
    scan(data);
  }
  if (credit === null && rawBody) {
    const credMatch = rawBody.match(/<credit>([\s\S]*?)<\/credit>|<balance>([\s\S]*?)<\/balance>/i);
    if (credMatch) {
      const parsed = parseExactAmount(credMatch[1] || credMatch[2] || '');
      if (!isNaN(parsed)) credit = parsed;
    }
    const currMatch = rawBody.match(/<currency>([\s\S]*?)<\/currency>/i);
    if (currMatch) {
      let c = (currMatch[1] || 'USD').trim().toUpperCase();
      if (c === 'R$' || c === 'REAL' || c === 'REAIS') c = 'BRL';
      currency = c;
    }
    const mailMatch = rawBody.match(/<mail>([\s\S]*?)<\/mail>|<username>([\s\S]*?)<\/username>|<email>([\s\S]*?)<\/email>/i);
    if (mailMatch) email = (mailMatch[1] || mailMatch[2] || mailMatch[3] || '').trim();
  }

  return { credit, currency, email };
}

