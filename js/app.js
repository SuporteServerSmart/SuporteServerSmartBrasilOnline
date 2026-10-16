// Suporte Server Smart Brasil Online - Client Application Logic

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentCategory = 'all';
let searchQuery = '';
let activeServiceForCheckout = null;

function initApp() {
  renderSettings();
  renderServices();
  setupEventListeners();
}

// 1. Render system settings on page
function renderSettings() {
  const settings = window.SSB.getSettings();

  const usdRateEl = document.getElementById('top-usd-rate');
  if (usdRateEl) {
    usdRateEl.textContent = `R$ ${settings.usdRate.toFixed(2).replace('.', ',')}`;
  }

  const serverStatusEl = document.getElementById('top-server-status');
  if (serverStatusEl) {
    serverStatusEl.textContent = `${settings.serverStatus.toUpperCase()} (18ms)`;
  }

  const topWhatsappBtn = document.getElementById('btn-top-whatsapp');
  if (topWhatsappBtn) {
    topWhatsappBtn.href = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Olá, gostaria de suporte sobre o servidor GSM Brasil Online.")}`;
    topWhatsappBtn.title = `Falar no WhatsApp: ${settings.whatsappFormatted}`;
  }

  const footerWhatsappEl = document.getElementById('footer-whatsapp');
  if (footerWhatsappEl) {
    footerWhatsappEl.textContent = settings.whatsappFormatted;
  }
}

// 2. Render dynamic services grid
function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  const services = window.SSB.getServices();
  const settings = window.SSB.getSettings();

  const filtered = services.filter(srv => {
    if (srv.status !== 'active') return false;
    const matchCategory = currentCategory === 'all' || srv.category === currentCategory;
    const matchSearch = !searchQuery || 
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.serverApi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-box-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">Nenhum serviço encontrado</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Tente buscar por outro termo ou mude a categoria acima.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(srv => {
    let badgeClass = '';
    if (srv.badge === 'PRO') badgeClass = 'pro';
    else if (srv.badge === 'ONLINE 24/7' || srv.badge === 'DEFINITIVO') badgeClass = 'green';

    return `
      <div class="service-card">
        <div>
          <div class="service-header">
            <span class="service-badge ${badgeClass}">${srv.badge || srv.categoryLabel}</span>
            <span style="font-size: 0.75rem; color: var(--accent-cyan);" class="mono">
              <i class="fa-solid fa-bolt"></i> ${srv.serverApi}
            </span>
          </div>

          <h3 class="service-title">${srv.name}</h3>
          <p class="service-desc">${srv.description}</p>

          <div class="service-meta">
            <div class="meta-row">
              <span><i class="fa-regular fa-clock"></i> Tempo de Envio:</span>
              <span class="meta-val">${srv.deliveryTime}</span>
            </div>
            <div class="meta-row">
              <span><i class="fa-solid fa-cube"></i> Tipo de Entrada:</span>
              <span class="meta-val">${srv.inputLabel.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        <div class="service-footer">
          <div class="price-box">
            <span class="price-brl">R$ ${srv.priceBRL.toFixed(2).replace('.', ',')}</span>
            <span class="price-usd">~ US$ ${srv.priceUSD.toFixed(2)}</span>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="openCheckoutModal('${srv.id}')">
            <i class="fa-solid fa-bolt"></i> Ativar Agora
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 3. Event listeners
function setupEventListeners() {
  // Category tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderServices();
    });
  });

  // Search input
  const searchInput = document.getElementById('service-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderServices();
    });
  }

  // Order Tracker Form
  const trackerForm = document.getElementById('tracker-form');
  if (trackerForm) {
    trackerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('tracker-input');
      handleTrackOrder(input.value);
    });
  }

  // Checkout Form Submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleCreateOrder();
    });
  }
}

// 4. Order tracking logic
function handleTrackOrder(query) {
  const resultContainer = document.getElementById('tracker-result-container');
  if (!resultContainer) return;

  const order = window.SSB.findOrder(query);

  resultContainer.style.display = 'block';

  if (!order) {
    resultContainer.innerHTML = `
      <div class="order-result-card" style="border-color: rgba(255, 51, 102, 0.4);">
        <div style="display: flex; align-items: center; gap: 0.75rem; color: var(--accent-red); margin-bottom: 0.5rem;">
          <i class="fa-solid fa-circle-xmark" style="font-size: 1.4rem;"></i>
          <h4 style="font-size: 1.1rem;">Nenhum pedido encontrado</h4>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">
          Não localizamos nenhuma ordem com o termo "<strong>${escapeHtml(query)}</strong>". Verifique se digitou o ID correto (Ex: SSB-98421) ou contate nosso suporte via WhatsApp.
        </p>
      </div>
    `;
    return;
  }

  let statusBadge = '';
  let statusIcon = '';
  let statusText = '';

  switch (order.status) {
    case 'completed':
      statusBadge = 'badge-completed';
      statusIcon = '<i class="fa-solid fa-circle-check"></i>';
      statusText = 'CONCLUÍDO COM SUCESSO';
      break;
    case 'processing':
      statusBadge = 'badge-processing';
      statusIcon = '<i class="fa-solid fa-arrows-rotate fa-spin"></i>';
      statusText = 'EM PROCESSAMENTO NO SERVIDOR';
      break;
    case 'rejected':
      statusBadge = 'badge-rejected';
      statusIcon = '<i class="fa-solid fa-ban"></i>';
      statusText = 'REJEITADO / ESTORNADO';
      break;
    default:
      statusBadge = 'badge-pending';
      statusIcon = '<i class="fa-regular fa-clock"></i>';
      statusText = 'AGUARDANDO PAGAMENTO';
  }

  resultContainer.innerHTML = `
    <div class="order-result-card">
      <div class="order-result-header">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">ID do Pedido:</span>
          <h3 class="mono" style="font-size: 1.35rem; color: var(--accent-cyan);">${order.orderId}</h3>
        </div>
        <span class="order-badge-status ${statusBadge}">
          ${statusIcon} ${statusText}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Serviço Solicitado:</span>
          <p style="font-weight: 600; font-size: 0.95rem;">${order.serviceName}</p>
        </div>
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Dado Informado (IMEI/Usuário):</span>
          <p class="mono" style="font-weight: 600; font-size: 0.95rem; color: #fff;">${order.dataInput}</p>
        </div>
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Cliente / Responsável:</span>
          <p style="font-weight: 600; font-size: 0.95rem;">${order.customerName}</p>
        </div>
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">Data da Solicitação:</span>
          <p style="font-weight: 500; font-size: 0.88rem; color: var(--text-secondary);">${order.date}</p>
        </div>
      </div>

      <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem;">
        <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem;">
          <i class="fa-solid fa-terminal"></i> Resposta do Servidor & Instruções:
        </span>
        <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.5;">${order.serverNotes || 'Processando envio...'}</p>
        ${order.resultCode ? `
          <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.06);">
            <span style="font-size: 0.75rem; color: var(--text-muted);">Código de Liberação / Token: </span>
            <code class="mono" style="color: var(--accent-green); background: rgba(0,255,136,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">${order.resultCode}</code>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 5. Checkout Modal
function openCheckoutModal(serviceId) {
  const services = window.SSB.getServices();
  const service = services.find(s => s.id === serviceId);
  if (!service) return;

  activeServiceForCheckout = service;
  const settings = window.SSB.getSettings();

  document.getElementById('modal-service-id').value = service.id;
  document.getElementById('modal-service-name').textContent = service.name;
  document.getElementById('modal-service-time').innerHTML = `<i class="fa-regular fa-clock"></i> ${service.deliveryTime}`;
  document.getElementById('modal-service-price').textContent = `R$ ${service.priceBRL.toFixed(2).replace('.', ',')}`;

  const labelEl = document.getElementById('modal-input-label');
  const inputEl = document.getElementById('modal-data-input');
  labelEl.textContent = `${service.inputLabel}:`;
  inputEl.placeholder = service.inputPlaceholder;

  // PIX QR Code & key
  const pixKeyText = document.getElementById('modal-pix-key-text');
  pixKeyText.textContent = settings.pixKey;

  // Generate dynamic QR Code for PIX using QR server API
  const qrImg = document.getElementById('modal-pix-qr-img');
  const qrData = encodeURIComponent(`PIX:${settings.pixKey}:VALOR:${service.priceBRL.toFixed(2)}:${service.name}`);
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  openModal('checkout-modal');
}

// 6. Create Order Handler
function handleCreateOrder() {
  if (!activeServiceForCheckout) return;

  const dataInput = document.getElementById('modal-data-input').value.trim();
  const customerName = document.getElementById('modal-customer-name').value.trim();
  const customerContact = document.getElementById('modal-customer-contact').value.trim();

  const newOrder = window.SSB.addOrder({
    serviceId: activeServiceForCheckout.id,
    serviceName: activeServiceForCheckout.name,
    customerName: customerName,
    customerContact: customerContact,
    dataInput: dataInput,
    priceBRL: activeServiceForCheckout.priceBRL,
    paymentMethod: "PIX Instantâneo"
  });

  closeModal('checkout-modal');

  // Show Success Modal
  document.getElementById('success-order-id').textContent = newOrder.orderId;
  document.getElementById('success-service-name').textContent = newOrder.serviceName;

  const settings = window.SSB.getSettings();
  const whatsappMsg = `Olá! Acabei de realizar o pedido *${newOrder.orderId}* no Servidor Smart Brasil Online.\n\n*Serviço:* ${newOrder.serviceName}\n*Valor:* R$ ${newOrder.priceBRL.toFixed(2)}\n*Dado:* ${newOrder.dataInput}\n\nEnvio em anexo o comprovante PIX para liberação imediata.`;
  
  const successWaBtn = document.getElementById('btn-success-whatsapp');
  successWaBtn.href = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(whatsappMsg)}`;

  openModal('success-modal');

  // Pre-fill tracker input and search
  const trackerInput = document.getElementById('tracker-input');
  if (trackerInput) {
    trackerInput.value = newOrder.orderId;
    handleTrackOrder(newOrder.orderId);
  }

  showToast('success', `Pedido ${newOrder.orderId} criado com sucesso!`);
}

// 7. Modals helper
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// 8. Copy PIX Key helper
function copyPixKey() {
  const settings = window.SSB.getSettings();
  navigator.clipboard.writeText(settings.pixKey).then(() => {
    showToast('success', 'Chave PIX copiada para a área de transferência!');
  }).catch(() => {
    showToast('warning', `Chave PIX: ${settings.pixKey}`);
  });
}

// 9. Toast notification helper
function showToast(type, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '<i class="fa-solid fa-circle-info" style="color: var(--accent-cyan);"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-circle-check" style="color: var(--accent-green);"></i>';
  else if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-red);"></i>';
  else if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-yellow);"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
