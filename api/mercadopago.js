const https = require('https');

// Token Oficial de Produção do Mercado Pago da Conta Suporte Server Smart
const DEFAULT_ACCESS_TOKEN = 'APP_USR-2750012879381679-051115-2dc1610e908f48d05dd63736d9473db7-615957613';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  let body = {};
  if (req.method === 'POST') {
    if (typeof req.body === 'object' && req.body !== null) {
      body = req.body;
    } else {
      try {
        const raw = await new Promise((resolve, reject) => {
          let str = '';
          req.on('data', chunk => str += chunk);
          req.on('end', () => resolve(str));
          req.on('error', reject);
        });
        if (raw) body = JSON.parse(raw);
      } catch (e) {
        body = {};
      }
    }
  }

  const query = req.query || (req.url && req.url.includes('?') ? Object.fromEntries(new URLSearchParams(req.url.split('?')[1])) : {});
  const action = (body.action || query.action || '').toLowerCase();

  // 1. Consultar Status do Pagamento
  if (action === 'check_payment' || action === 'check_status' || (query.payment_id && !action.includes('create'))) {
    const paymentId = body.payment_id || query.payment_id;
    const accessToken = (body.accessToken && body.accessToken.trim().length > 15)
      ? body.accessToken.trim()
      : (process.env.MERCADO_PAGO_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN);

    if (accessToken && accessToken.length > 15 && paymentId && !String(paymentId).startsWith('pay_')) {
      try {
        const mpRes = await new Promise((resolve, reject) => {
          const mpReq = https.request(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }, (r) => {
            let data = '';
            r.on('data', chunk => data += chunk);
            r.on('end', () => resolve({ status: r.statusCode, data }));
          });
          mpReq.on('error', reject);
          mpReq.end();
        });

        const mpJson = JSON.parse(mpRes.data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          status: mpJson.status,
          approved: mpJson.status === 'approved'
        }));
      } catch (err) {
        console.warn('Erro ao verificar status no Mercado Pago:', err);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      status: 'pending',
      approved: false
    }));
  }

  // 2. Criar Cobrança PIX Oficial via Mercado Pago API
  if (action === 'create_pix' || action === 'create_payment' || req.method === 'POST') {
    const accessToken = (body.accessToken && body.accessToken.trim().length > 15)
      ? body.accessToken.trim()
      : (process.env.MERCADO_PAGO_ACCESS_TOKEN || DEFAULT_ACCESS_TOKEN);
    const amount = parseFloat(body.amount) || 29.90;
    const title = body.title || 'Arquivo Técnico / Solução';
    const customerEmail = body.customerEmail || 'cliente@suporteserversmart.com';
    const customerName = body.customerName || 'Cliente Técnico';

    if (!accessToken || accessToken.length < 15) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Token do Mercado Pago não configurado.' }));
    }

    try {
      const mpPayload = JSON.stringify({
        transaction_amount: amount,
        description: title,
        payment_method_id: 'pix',
        payer: {
          email: customerEmail,
          first_name: customerName
        }
      });

      const mpRes = await new Promise((resolve, reject) => {
        const mpReq = https.request('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': 'pix_' + Date.now() + '_' + Math.random().toString(36).substring(7)
          }
        }, (r) => {
          let data = '';
          r.on('data', chunk => data += chunk);
          r.on('end', () => resolve({ status: r.statusCode, data }));
        });
        mpReq.on('error', reject);
        mpReq.write(mpPayload);
        mpReq.end();
      });

      let mpJson = {};
      try {
        mpJson = JSON.parse(mpRes.data);
      } catch (pe) {
        console.warn('Erro ao parsear resposta do Mercado Pago:', mpRes.data);
      }

      if (mpRes.status >= 200 && mpRes.status < 300 && mpJson.id) {
        const point = mpJson.point_of_interaction && mpJson.point_of_interaction.transaction_data;
        const collectorName = (point && point.bank_info && point.bank_info.collector && point.bank_info.collector.account_holder_name) || 'Meire Izidoro';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          mode: 'live_mercadopago',
          payment_id: mpJson.id,
          status: mpJson.status,
          collector_name: collectorName,
          qr_code: point ? point.qr_code : '',
          qr_code_base64: point ? point.qr_code_base64 : '',
          ticket_url: point ? point.ticket_url : ''
        }));
      } else {
        console.warn('Mercado Pago retornou erro:', mpJson);
        const errMsg = mpJson.message || (mpJson.cause && mpJson.cause[0] && mpJson.cause[0].description) || 'Falha ao gerar cobrança no Mercado Pago';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: errMsg
        }));
      }
    } catch (err) {
      console.warn('Erro ao conectar ao Mercado Pago:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Erro de conexão com o Mercado Pago: ' + (err.message || 'tente novamente')
      }));
    }
  }

  res.writeHead(400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Ação não informada' }));
};
