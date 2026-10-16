// Suporte Server Smart Brasil Online - Client Application Logic
// Com Autenticação de Clientes / Técnicos e Bloqueio de Preços para Visitantes Não Logados

const CUSTOMER_SESSION_KEY = 'sss_customer_session_v1';
const CUSTOMER_ACCOUNTS_KEY = 'sss_customer_accounts_v1';

const DEFAULT_ACCOUNTS = [
  {
    name: "Técnico Assistência Express",
    email: "cliente@smart.com",
    password: "123",
    whatsapp: "11999999999",
    balance: 0.00
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentCategory = 'all';
let searchQuery = '';
let activeServiceForCheckout = null;

async function initApp() {
  renderSettings();
  renderAuthUI();
  renderServices();
  setupEventListeners();

  // Sincronizar serviços em tempo real da nuvem (Supabase)
  if (window.SSB && window.SSB.syncServicesFromCloud) {
    try {
      const cloudServices = await window.SSB.syncServicesFromCloud();
      if (cloudServices && cloudServices.length > 0) {
        renderServices();
      }
    } catch (e) {
      console.warn("Usando serviços locais em cache:", e);
    }
  }
}

// 1. Gerenciamento de Sessão de Cliente
function getCurrentCustomer() {
  try {
    const session = localStorage.getItem(CUSTOMER_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (e) {
    return null;
  }
}

function getCustomerAccounts() {
  try {
    const stored = localStorage.getItem(CUSTOMER_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS;
  } catch (e) {
    return DEFAULT_ACCOUNTS;
  }
}

function saveCustomerAccounts(accounts) {
  localStorage.setItem(CUSTOMER_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function renderAuthUI() {
  const customer = getCurrentCustomer();
  const navContainer = document.getElementById('nav-auth-container');
  const catalogBanner = document.getElementById('catalog-auth-banner');
  const topAuthAction = document.getElementById('top-auth-action');

  if (customer) {
    // Logado
    if (navContainer) {
      navContainer.innerHTML = `
        <div class="user-pill" title="Conta de Técnico Conectada">
          <i class="fa-solid fa-user-check" style="color: var(--accent-cyan);"></i>
          <span>${escapeHtml(customer.name.split(' ')[0])}</span>
          <span class="user-pill-balance">R$ ${(customer.balance || 0).toFixed(2)}</span>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="handleCustomerLogout()" style="color: var(--accent-red); padding: 0.45rem 0.65rem;" title="Sair da Conta">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      `;
    }

    if (topAuthAction) {
      topAuthAction.innerHTML = `<i class="fa-solid fa-user-check"></i> Olá, ${escapeHtml(customer.name.split(' ')[0])}`;
      topAuthAction.onclick = () => {
        showToast('info', `Você está logado como: ${customer.name}`);
      };
    }

    if (catalogBanner) {
      catalogBanner.innerHTML = '';
      catalogBanner.style.display = 'none';
    }
  } else {
    // Não Logado
    if (navContainer) {
      navContainer.innerHTML = `
        <button type="button" class="btn btn-secondary btn-sm" onclick="openCustomerAuthModal('login')">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar
        </button>
        <button type="button" class="btn btn-primary btn-sm" onclick="openCustomerAuthModal('register')">
          <i class="fa-solid fa-user-plus"></i> Criar Conta
        </button>
      `;
    }

    if (topAuthAction) {
      topAuthAction.innerHTML = `<i class="fa-solid fa-user"></i> Área do Cliente / Revenda`;
      topAuthAction.onclick = () => openCustomerAuthModal('login');
    }

    if (catalogBanner) {
      catalogBanner.style.display = 'block';
      catalogBanner.innerHTML = `
        <div class="auth-banner-locked">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(255, 183, 3, 0.15); border: 1px solid rgba(255, 183, 3, 0.4); display: flex; align-items: center; justify-content: center; color: var(--accent-yellow); font-size: 1.3rem;">
              <i class="fa-solid fa-lock"></i>
            </div>
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.15rem;">
                Valores de Serviços e Pedidos Exclusivos para Técnicos Cadastrados
              </h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">
                Crie sua conta gratuitamente ou faça login para desbloquear a tabela de preços de atacado e enviar ordens de serviço.
              </p>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="openCustomerAuthModal('register')">
            <i class="fa-solid fa-user-plus"></i> Criar Minha Conta Grátis
          </button>
        </div>
      `;
    }
  }
}

// 2. Modais e Controle de Auth
function openCustomerAuthModal(tab = 'login') {
  switchAuthTab(tab);
  openModal('customer-auth-modal');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('customer-login-form');
  const registerForm = document.getElementById('customer-register-form');
  const tabLogin = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');

  if (tab === 'register') {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabRegister) tabRegister.classList.add('active');
  } else {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (tabLogin) tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
  }
}

function handleCustomerLogin(email, password) {
  const accounts = getCustomerAccounts();
  const customer = accounts.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);

  if (customer) {
    localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customer));
    closeModal('customer-auth-modal');
    renderAuthUI();
    renderServices();
    showToast('success', `Bem-vindo de volta, ${customer.name}!`);
  } else {
    showToast('error', 'E-mail ou senha incorretos! Se ainda não tem cadastro, crie uma conta.');
  }
}

function handleCustomerRegister(name, email, whatsapp, password) {
  const accounts = getCustomerAccounts();
  const exists = accounts.find(c => c.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    showToast('error', 'Este e-mail já está cadastrado! Faça login.');
    switchAuthTab('login');
    return;
  }

  const newCustomer = {
    name,
    email,
    whatsapp,
    password,
    balance: 0.00
  };

  accounts.push(newCustomer);
  saveCustomerAccounts(accounts);
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(newCustomer));

  // Sincronizar novo revendedor no Supabase
  if (window.SSB_Supabase && window.SSB_Supabase.isConfigured && window.SSB_Supabase.client) {
    window.SSB_Supabase.client.from('resellers').insert([{
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newCustomer.name,
      email: newCustomer.email,
      role: 'Cliente Técnico',
      balance_brl: 0.00
    }]).then(res => {
      console.log("☁️ Revendedor sincronizado com Supabase:", newCustomer.name);
    }).catch(e => console.warn(e));
  }

  closeModal('customer-auth-modal');
  renderAuthUI();
  renderServices();
  showToast('success', `Conta criada com sucesso! Bem-vindo, ${newCustomer.name}!`);
}

function handleCustomerLogout() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  renderAuthUI();
  renderServices();
  showToast('warning', 'Você saiu da sua conta.');
}

// 3. Render system settings on page
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

// 4. Render dynamic services grid com Bloqueio de Preços para Não Logados
function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;

  const services = window.SSB.getServices();
  const customer = getCurrentCustomer();

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
          ${customer ? `
            <div class="price-box">
              <span class="price-brl">R$ ${srv.priceBRL.toFixed(2).replace('.', ',')}</span>
              <span class="price-usd">~ US$ ${(srv.priceUSD || 0).toFixed(2)}</span>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="openCheckoutModal('${srv.id}')">
              <i class="fa-solid fa-bolt"></i> Ativar Agora
            </button>
          ` : `
            <div class="price-locked-box" title="Faça login para ver o valor">
              <i class="fa-solid fa-lock"></i> <span>Preço sob login</span>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="openCustomerAuthModal('login')">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> Ver Preço / Pedir
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// 5. Event listeners
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

  // Customer Login Form
  const loginForm = document.getElementById('customer-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      handleCustomerLogin(email, password);
    });
  }

  // Customer Register Form
  const registerForm = document.getElementById('customer-register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const whatsapp = document.getElementById('reg-whatsapp').value.trim();
      const password = document.getElementById('reg-password').value.trim();
      handleCustomerRegister(name, email, whatsapp, password);
    });
  }
}

// 6. Order tracking logic
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

// 7. Checkout Modal (Bloqueado se não estiver logado)
function openCheckoutModal(serviceId) {
  const customer = getCurrentCustomer();
  if (!customer) {
    showToast('warning', 'Faça login ou crie sua conta para solicitar ativações no servidor!');
    openCustomerAuthModal('login');
    return;
  }

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
  inputEl.placeholder = service.inputPlaceholder || 'Digite os dados requeridos';

  // Pré-preencher com dados do cliente logado
  const customerNameInput = document.getElementById('modal-customer-name');
  if (customerNameInput) customerNameInput.value = customer.name;

  const customerContactInput = document.getElementById('modal-customer-contact');
  if (customerContactInput) customerContactInput.value = customer.whatsapp || '';

  // PIX QR Code & key
  const pixKeyText = document.getElementById('modal-pix-key-text');
  pixKeyText.textContent = settings.pixKey;

  const qrImg = document.getElementById('modal-pix-qr-img');
  const qrData = encodeURIComponent(`PIX:${settings.pixKey}:VALOR:${service.priceBRL.toFixed(2)}:${service.name}`);
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  openModal('checkout-modal');
}

// 8. Create Order Handler
function handleCreateOrder() {
  if (!activeServiceForCheckout) return;

  const customer = getCurrentCustomer();
  const dataInput = document.getElementById('modal-data-input').value.trim();
  const customerName = document.getElementById('modal-customer-name').value.trim() || (customer ? customer.name : 'Cliente');
  const customerContact = document.getElementById('modal-customer-contact').value.trim() || (customer ? customer.whatsapp : '');

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

// 9. Modals helper
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// 10. Copy PIX Key helper
function copyPixKey() {
  const settings = window.SSB.getSettings();
  navigator.clipboard.writeText(settings.pixKey).then(() => {
    showToast('success', 'Chave PIX copiada para a área de transferência!');
  }).catch(() => {
    showToast('warning', `Chave PIX: ${settings.pixKey}`);
  });
}

// 11. Toast notification helper
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
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
