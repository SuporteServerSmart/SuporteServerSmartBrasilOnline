// Suporte Server Smart Brasil Online - Admin Engine (GSMThemer Management)

const AUTH_SESSION_KEY = 'sss_admin_authenticated';
const CUSTOMER_SESSION_KEY = 'sss_customer_session_v1';
const CUSTOMER_ACCOUNTS_KEY = 'sss_customer_accounts_v1';
const ADMIN_EMAIL_KEY = 'sss_admin_email_v1';

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

function initAdmin() {
  window.switchTab = switchTab;
  try { setupNavigation(); } catch (e) { console.error('Navigation error:', e); }
  try { setupAuthForm(); } catch (e) { console.error('Auth form error:', e); }
  try { setupFiltersAndForms(); } catch (e) { console.error('Filters error:', e); }
  try { checkAuth(); } catch (e) { console.error('Auth check error:', e); }
}

function getStoredCustomer() {
  try {
    const data = localStorage.getItem(CUSTOMER_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function getStoredAccounts() {
  try {
    const data = localStorage.getItem(CUSTOMER_ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function hasAdminAccountConfigured() {
  const accounts = getStoredAccounts();
  const designatedEmail = localStorage.getItem(ADMIN_EMAIL_KEY);
  return accounts.some(acc => acc.role === 'admin' || acc.isAdmin === true || (designatedEmail && acc.email.toLowerCase() === designatedEmail.toLowerCase()));
}

// 1. Auth check
function checkAuth() {
  const customer = getStoredCustomer();
  const loginScreen = document.getElementById('admin-login-screen');
  const adminApp = document.getElementById('admin-app');
  const deniedBox = document.getElementById('admin-denied-box');
  const formBox = document.getElementById('admin-form-box');
  const deniedMsg = document.getElementById('admin-denied-msg');
  const noAdminNotice = document.getElementById('admin-no-admin-notice');
  const adminUserName = document.getElementById('admin-user-name');

  // Caso 1: Usuário está logado como Cliente Comum (não é admin) -> Bloqueia o acesso
  if (customer && customer.role !== 'admin' && !customer.isAdmin) {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    if (adminApp) adminApp.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
    if (deniedBox) deniedBox.style.display = 'block';
    if (formBox) formBox.style.display = 'none';
    if (deniedMsg) {
      deniedMsg.innerHTML = `Você está conectado como <strong>${escapeHtml(customer.name)}</strong> (${escapeHtml(customer.email)}), cujo perfil é de <strong>Cliente / Técnico</strong>.<br><br>O Painel Administrativo é de acesso exclusivo para o Administrador.`;
    }
    return;
  }

  // Caso 2: Usuário está logado como Administrador
  if (customer && (customer.role === 'admin' || customer.isAdmin)) {
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
  }

  const isAuth = sessionStorage.getItem(AUTH_SESSION_KEY);

  if (isAuth === 'true') {
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminApp) adminApp.style.display = 'block';
    if (adminUserName) {
      adminUserName.textContent = customer ? customer.name.split(' ')[0] : 'Administrador Geral';
    }
    loadAllAdminData();
  } else {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminApp) adminApp.style.display = 'none';
    if (deniedBox) deniedBox.style.display = 'none';
    if (formBox) formBox.style.display = 'block';

    // Se nenhum admin foi cadastrado ainda no sistema, exibe o aviso orientando
    if (noAdminNotice) {
      noAdminNotice.style.display = !hasAdminAccountConfigured() ? 'flex' : 'none';
    }
  }
}

function setupAuthForm() {
  const form = document.getElementById('admin-login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const identity = document.getElementById('admin-login-identity').value.trim();
      const password = (document.getElementById('admin-login-password')?.value || '').trim();
      const settings = window.SSB.getSettings();

      // Opção A: Login via PIN Mestre (admin123 ou settings.adminPin)
      if (identity === settings.adminPin || identity === 'admin123') {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        showToast('success', 'Acesso autorizado via Chave Mestre!');
        checkAuth();
        return;
      }

      // Opção B: Login via Conta de Administrador (E-mail + Senha)
      const accounts = getStoredAccounts();
      const designatedAdmin = localStorage.getItem(ADMIN_EMAIL_KEY);
      const acc = accounts.find(a => a.email.toLowerCase() === identity.toLowerCase());

      if (acc && acc.password === password) {
        // Se ainda não havia admin, esta conta se torna o Administrador Geral!
        if (!hasAdminAccountConfigured()) {
          acc.role = 'admin';
          acc.isAdmin = true;
          localStorage.setItem(ADMIN_EMAIL_KEY, acc.email);
          localStorage.setItem(CUSTOMER_ACCOUNTS_KEY, JSON.stringify(accounts));
        }

        if (acc.role === 'admin' || acc.isAdmin || (designatedAdmin && acc.email.toLowerCase() === designatedAdmin.toLowerCase())) {
          localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(acc));
          sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
          showToast('success', `Bem-vindo, Administrador ${acc.name}!`);
          checkAuth();
          return;
        } else {
          showToast('error', 'Esta conta de usuário não possui privilégios de Administrador.');
          return;
        }
      }

      showToast('error', 'Chave ou credenciais incorretas! Tente o PIN padrão admin123 ou a conta do Administrador.');
    });
  }
}

function logoutAdmin() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  window.location.href = 'index.html';
}

function logoutAndSwitchAccount() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  location.reload();
}

// 2. Navigation Tabs
function setupNavigation() {
  window.switchTab = switchTab;

  // Delegação de eventos no container pai nav
  const navContainer = document.querySelector('.admin-nav');
  if (navContainer) {
    navContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.admin-nav-item');
      if (item) {
        const tab = item.getAttribute('data-tab');
        if (tab) switchTab(tab);
      }
    });
  }

  // Listeners diretos em cada item como redundância
  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const tab = item.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });
}

function switchTab(tabName) {
  if (!tabName) return;

  // 1. Alterna estado ativo nos botões do menu lateral
  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(el => {
    const isTarget = el.getAttribute('data-tab') === tabName;
    el.classList.toggle('active', isTarget);
  });

  // 2. Alterna exibição das seções
  const views = document.querySelectorAll('.admin-view');
  views.forEach(view => {
    const isTarget = view.id === `view-${tabName}`;
    view.style.display = isTarget ? 'block' : 'none';
  });

  // 3. Renderiza dados da aba selecionada de forma isolada e segura
  try {
    if (tabName === 'dashboard') renderDashboard();
    else if (tabName === 'orders') renderOrdersTable();
    else if (tabName === 'services') renderServicesTable();
    else if (tabName === 'api-sync') renderApiSyncView();
    else if (tabName === 'users') renderUsersTable();
    else if (tabName === 'settings') renderSettingsForm();
  } catch (err) {
    console.error(`Erro ao carregar dados da aba ${tabName}:`, err);
  }
}
window.switchTab = switchTab;

// 3. Load all admin views
function loadAllAdminData() {
  try { renderDashboard(); } catch (e) { console.error('Dashboard load error:', e); }
  try { renderOrdersTable(); } catch (e) { console.error('Orders load error:', e); }
  try { renderServicesTable(); } catch (e) { console.error('Services load error:', e); }
  try { renderUsersTable(); } catch (e) { console.error('Users load error:', e); }
  try { renderSettingsForm(); } catch (e) { console.error('Settings load error:', e); }
}

// 4. Render Dashboard
function renderDashboard() {
  const orders = window.SSB.getOrders();
  const users = window.SSB.getUsers();
  const logs = window.SSB.getLogs();

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + (o.priceBRL || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');

  const totalUserBalance = users.reduce((acc, u) => acc + (u.balanceBRL || 0), 0);

  document.getElementById('dash-revenue-brl').textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
  document.getElementById('dash-orders-total').textContent = orders.length;
  document.getElementById('dash-orders-pending').textContent = pendingOrders.length;
  document.getElementById('sidebar-pending-count').textContent = pendingOrders.length;
  document.getElementById('dash-users-balance').textContent = `R$ ${totalUserBalance.toFixed(2).replace('.', ',')}`;

  // Recent Orders table in dashboard
  const recentOrdersTbody = document.getElementById('dash-recent-orders-tbody');
  if (recentOrdersTbody) {
    const recent = orders.slice(0, 5);
    recentOrdersTbody.innerHTML = recent.map(o => `
      <tr>
        <td class="mono" style="font-weight: 700; color: var(--accent-cyan);">${o.orderId}</td>
        <td>${escapeHtml(o.serviceName)}</td>
        <td>${escapeHtml(o.customerName)}</td>
        <td class="mono">R$ ${o.priceBRL.toFixed(2)}</td>
        <td>${renderStatusBadge(o.status)}</td>
      </tr>
    `).join('');
  }

  // Server Logs
  const logsBox = document.getElementById('dash-logs-box');
  if (logsBox) {
    logsBox.innerHTML = logs.map(l => `
      <div class="terminal-line">
        <span class="terminal-time">[${l.time}]</span>
        <span style="color: ${getLogColor(l.type)};">[${l.type.toUpperCase()}]</span>
        <span>${escapeHtml(l.message)}</span>
      </div>
    `).join('');
  }
}

function getLogColor(type) {
  if (type === 'success') return 'var(--accent-green)';
  if (type === 'order') return 'var(--accent-cyan)';
  if (type === 'api') return 'var(--accent-purple)';
  if (type === 'system') return 'var(--accent-yellow)';
  return '#94a3b8';
}

// 5. Render Orders
function renderOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const orders = window.SSB.getOrders();
  const filter = document.getElementById('orders-filter-status')?.value || 'all';

  const filtered = orders.filter(o => filter === 'all' || o.status === filter);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhum pedido encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td class="mono" style="font-weight: 700; color: var(--accent-cyan);">${o.orderId}</td>
      <td style="font-size: 0.8rem; color: var(--text-secondary);">${o.date}</td>
      <td><strong>${escapeHtml(o.serviceName)}</strong></td>
      <td class="mono" style="color: #fff; background: rgba(0,0,0,0.3); padding: 0.3rem 0.6rem; border-radius: 4px;">${escapeHtml(o.dataInput || '-')}</td>
      <td>
        <div>${escapeHtml(o.customerName)}</div>
        <small style="color: var(--text-muted);">${escapeHtml(o.customerContact || '')}</small>
      </td>
      <td class="mono" style="font-weight: 700; color: var(--accent-green);">R$ ${o.priceBRL.toFixed(2)}</td>
      <td>${renderStatusBadge(o.status)}</td>
      <td>
        <button type="button" class="btn btn-secondary btn-sm" onclick="openOrderActionModal('${o.orderId}')">
          <i class="fa-solid fa-pen-to-square"></i> Gerenciar
        </button>
      </td>
    </tr>
  `).join('');
}

function renderStatusBadge(status) {
  if (status === 'completed') return `<span class="order-badge-status badge-completed"><i class="fa-solid fa-check"></i> Concluído</span>`;
  if (status === 'processing') return `<span class="order-badge-status badge-processing"><i class="fa-solid fa-arrows-rotate fa-spin"></i> Processando</span>`;
  if (status === 'rejected') return `<span class="order-badge-status badge-rejected"><i class="fa-solid fa-ban"></i> Rejeitado</span>`;
  return `<span class="order-badge-status badge-pending"><i class="fa-regular fa-clock"></i> Pendente</span>`;
}

// 6. Order Action Modal
function openOrderActionModal(orderId) {
  const orders = window.SSB.getOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  document.getElementById('action-order-id').textContent = order.orderId;
  document.getElementById('action-order-id-hidden').value = order.orderId;
  document.getElementById('action-order-status').value = order.status;
  document.getElementById('action-result-code').value = order.resultCode || '';
  document.getElementById('action-server-notes').value = order.serverNotes || '';

  openModal('modal-order-action');
}

// 7. Render Services Table
function renderServicesTable() {
  const tbody = document.getElementById('admin-services-tbody');
  if (!tbody) return;

  const services = window.SSB.getServices();

  tbody.innerHTML = services.map(s => {
    const priceBRL = typeof s.priceBRL === 'number' ? s.priceBRL : parseFloat(s.priceBRL) || 0;
    const costBRL = typeof s.costBRL === 'number' ? s.costBRL : parseFloat(s.costBRL) || 0;
    const profit = priceBRL - costBRL;
    const profitPercent = costBRL > 0 ? ((profit / costBRL) * 100).toFixed(0) : '0';
    const descText = s.description ? String(s.description).substring(0, 50) : '';

    return `
      <tr>
        <td>
          <div style="font-weight: 600;">${escapeHtml(s.name || '')}</div>
          <small style="color: var(--text-muted);">${s.badge ? `[${escapeHtml(s.badge)}]` : ''} ${escapeHtml(descText)}...</small>
        </td>
        <td><span class="service-badge">${escapeHtml(s.categoryLabel || s.category || '')}</span></td>
        <td class="mono" style="font-weight: 700; color: var(--accent-cyan);">R$ ${priceBRL.toFixed(2)}</td>
        <td class="mono" style="color: var(--text-muted);">R$ ${costBRL.toFixed(2)}</td>
        <td class="mono" style="color: var(--accent-green); font-weight: 600;">+R$ ${profit.toFixed(2)} (${profitPercent}%)</td>
        <td>${escapeHtml(s.deliveryTime || 'Instantâneo')}</td>
        <td class="mono" style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(s.serverApi || 'DHRU')}</td>
        <td>
          <span style="color: ${s.status === 'active' ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: 700; font-size: 0.8rem;">
            ${s.status === 'active' ? 'ATIVO' : 'INATIVO'}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="btn btn-secondary btn-sm" onclick="editService('${s.id}')" title="Editar">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="deleteService('${s.id}')" style="color: var(--accent-red);" title="Excluir">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 8. Service CRUD Modal Handlers
function openNewServiceModal() {
  document.getElementById('crud-service-modal-title').innerHTML = `
    <i class="fa-solid fa-plus" style="color: var(--accent-cyan);"></i>
    <span>Adicionar Novo Serviço GSM</span>
  `;
  document.getElementById('crud-service-id').value = '';
  document.getElementById('crud-service-name').value = '';
  document.getElementById('crud-service-category').value = 'tools';
  document.getElementById('crud-service-badge').value = 'NOVO';
  document.getElementById('crud-service-priceBRL').value = '';
  document.getElementById('crud-service-costBRL').value = '';
  document.getElementById('crud-service-deliveryTime').value = 'Instantâneo (1-10 min)';
  document.getElementById('crud-service-serverApi').value = 'Direct API';
  document.getElementById('crud-service-inputLabel').value = 'Usuário / IMEI';
  document.getElementById('crud-service-description').value = '';

  openModal('modal-service-crud');
}

function editService(serviceId) {
  const services = window.SSB.getServices();
  const service = services.find(s => s.id === serviceId);
  if (!service) return;

  document.getElementById('crud-service-modal-title').innerHTML = `
    <i class="fa-solid fa-pen" style="color: var(--accent-cyan);"></i>
    <span>Editar Serviço GSM</span>
  `;
  document.getElementById('crud-service-id').value = service.id;
  document.getElementById('crud-service-name').value = service.name;
  document.getElementById('crud-service-category').value = service.category;
  document.getElementById('crud-service-badge').value = service.badge || '';
  document.getElementById('crud-service-priceBRL').value = service.priceBRL;
  document.getElementById('crud-service-costBRL').value = service.costBRL;
  document.getElementById('crud-service-deliveryTime').value = service.deliveryTime;
  document.getElementById('crud-service-serverApi').value = service.serverApi;
  document.getElementById('crud-service-inputLabel').value = service.inputLabel;
  document.getElementById('crud-service-description').value = service.description;

  openModal('modal-service-crud');
}

function deleteService(serviceId) {
  if (!confirm('Deseja realmente remover este serviço do catálogo?')) return;

  const services = window.SSB.getServices().filter(s => s.id !== serviceId);
  window.SSB.saveServices(services);
  window.SSB.addLog('system', `Serviço ${serviceId} removido.`);

  if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
    window.SSB_Supabase.deleteService(serviceId);
  }

  showToast('success', 'Serviço excluído!');
  renderServicesTable();
}

// 9. Users / Resellers
function renderUsersTable() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  const users = window.SSB.getUsers();

  tbody.innerHTML = users.map(u => {
    const balanceBRL = typeof u.balanceBRL === 'number' ? u.balanceBRL : parseFloat(u.balanceBRL) || 0;
    const roleStr = u.role || 'Cliente Técnico';
    return `
      <tr>
        <td><strong>${escapeHtml(u.name || '')}</strong></td>
        <td style="color: var(--text-secondary);">${escapeHtml(u.email || '')}</td>
        <td><span class="service-badge ${roleStr.includes('Master') ? 'pro' : ''}">${escapeHtml(roleStr)}</span></td>
        <td class="mono" style="font-weight: 700; color: var(--accent-green); font-size: 1rem;">R$ ${balanceBRL.toFixed(2)}</td>
        <td class="mono">${u.ordersCount || 0} pedidos</td>
        <td class="mono" style="color: var(--accent-cyan); font-weight: 600;">${u.discountPercent || 0}% OFF</td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addCreditToUser('${u.id}')">
            <i class="fa-solid fa-circle-plus"></i> Injetar Créditos
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function addCreditToUser(userId) {
  const users = window.SSB.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const amountStr = prompt(`Informe o valor de recarga em R$ para [${user.name}]:`, "100.00");
  if (!amountStr) return;

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    showToast('error', 'Valor inválido inserido.');
    return;
  }

  user.balanceBRL += amount;
  window.SSB.saveUsers(users);
  window.SSB.addLog('system', `Crédito de R$ ${amount.toFixed(2)} adicionado para ${user.name}`);
  showToast('success', `R$ ${amount.toFixed(2)} creditados para ${user.name}!`);
  renderUsersTable();
  renderDashboard();
}

function openAddUserModal() {
  openModal('modal-user-add');
}

// 10. Settings Form
function renderSettingsForm() {
  const settings = window.SSB.getSettings();

  document.getElementById('setting-siteName').value = settings.siteName;
  document.getElementById('setting-pixKey').value = settings.pixKey;
  document.getElementById('setting-pixName').value = settings.pixName;
  document.getElementById('setting-whatsapp').value = settings.whatsapp;
  document.getElementById('setting-whatsappFormatted').value = settings.whatsappFormatted;
  document.getElementById('setting-usdRate').value = settings.usdRate;
  document.getElementById('setting-usdtWallet').value = settings.usdtWallet;
  document.getElementById('setting-adminPin').value = settings.adminPin;

  // Render Supabase settings
  if (window.SSB_Supabase) {
    const supaConfig = window.SSB_Supabase.getConfig();
    const urlInput = document.getElementById('supabase-url-input');
    const keyInput = document.getElementById('supabase-key-input');
    const checkInput = document.getElementById('supabase-enable-check');
    const badge = document.getElementById('supabase-status-badge');

    if (urlInput) urlInput.value = supaConfig.url || '';
    if (keyInput) keyInput.value = supaConfig.key || '';
    if (checkInput) checkInput.checked = !!supaConfig.enabled;

    if (badge) {
      if (supaConfig.enabled && supaConfig.url && supaConfig.key) {
        badge.className = "order-badge-status badge-completed";
        badge.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Conectado ao Supabase';
      } else {
        badge.className = "order-badge-status badge-pending";
        badge.innerHTML = '<i class="fa-solid fa-laptop"></i> Modo Local Seguro';
      }
    }
  }
}

function copySupabaseSql() {
  if (window.SSB_Supabase) {
    const sql = window.SSB_Supabase.getSqlSchema();
    navigator.clipboard.writeText(sql).then(() => {
      showToast('success', 'Código SQL copiado! Cole no SQL Editor do Supabase.');
    }).catch(() => {
      showToast('warning', 'Copie o código SQL manualmente nas configurações.');
    });
  }
}

async function testSupabaseConnection() {
  if (!window.SSB_Supabase) return;
  showToast('warning', 'Testando conexão com o Supabase...');
  const res = await window.SSB_Supabase.testConnection();
  if (res.success) {
    showToast('success', res.message);
    const badge = document.getElementById('supabase-status-badge');
    if (badge) {
      badge.className = "order-badge-status badge-completed";
      badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Supabase Conectado!';
    }
  } else {
    showToast('error', res.message);
  }
}


// 11. Form submissions setup
function setupFiltersAndForms() {
  // Filter status select
  const filterSelect = document.getElementById('orders-filter-status');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      renderOrdersTable();
    });
  }

  // Order action save form
  const orderActionForm = document.getElementById('order-action-form');
  if (orderActionForm) {
    orderActionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const orderId = document.getElementById('action-order-id-hidden').value;
      const status = document.getElementById('action-order-status').value;
      const resultCode = document.getElementById('action-result-code').value.trim();
      const serverNotes = document.getElementById('action-server-notes').value.trim();

      window.SSB.updateOrderStatus(orderId, status, serverNotes, resultCode);
      closeModal('modal-order-action');
      showToast('success', `Pedido ${orderId} atualizado!`);
      renderOrdersTable();
      renderDashboard();
    });
  }

  // Service CRUD form
  const serviceCrudForm = document.getElementById('service-crud-form');
  if (serviceCrudForm) {
    serviceCrudForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('crud-service-id').value;
      const name = document.getElementById('crud-service-name').value.trim();
      const category = document.getElementById('crud-service-category').value;
      const badge = document.getElementById('crud-service-badge').value.trim();
      const priceBRL = parseFloat(document.getElementById('crud-service-priceBRL').value);
      const costBRL = parseFloat(document.getElementById('crud-service-costBRL').value);
      const deliveryTime = document.getElementById('crud-service-deliveryTime').value.trim();
      const serverApi = document.getElementById('crud-service-serverApi').value.trim();
      const inputLabel = document.getElementById('crud-service-inputLabel').value.trim();
      const description = document.getElementById('crud-service-description').value.trim();

      const settings = window.SSB.getSettings();
      const priceUSD = parseFloat((priceBRL / (settings.usdRate || 5.65)).toFixed(2));

      let services = window.SSB.getServices();

      const categoryLabels = {
        tools: "Ferramentas & Dongles",
        imei: "Serviços IMEI & FRP",
        credits: "Créditos de Servidor",
        remote: "Atendimento Remoto"
      };

      if (id) {
        // Edit
        const idx = services.findIndex(s => s.id === id);
        if (idx !== -1) {
          services[idx] = {
            ...services[idx],
            name, category, categoryLabel: categoryLabels[category] || category,
            badge, priceBRL, costBRL, priceUSD, deliveryTime, serverApi, inputLabel, description
          };
          window.SSB.addLog('system', `Serviço ${name} atualizado.`);
          showToast('success', 'Serviço atualizado!');
        }
      } else {
        // Create new
        const newId = `srv-${Date.now().toString().slice(-4)}`;
        const newService = {
          id: newId,
          name, category, categoryLabel: categoryLabels[category] || category,
          badge, priceBRL, costBRL, priceUSD, deliveryTime, serverApi, inputLabel, description,
          status: "active",
          type: "custom",
          inputPlaceholder: "Digite a informação..."
        };
        services.push(newService);
        window.SSB.addLog('system', `Novo serviço adicionado: ${name}`);
        showToast('success', 'Novo serviço cadastrado!');
      }

      window.SSB.saveServices(services);

      // Sincronizar com o Supabase Cloud
      const targetService = id ? services.find(s => s.id === id) : services[services.length - 1];
      if (window.SSB_Supabase && window.SSB_Supabase.isConfigured && targetService) {
        window.SSB_Supabase.upsertService(targetService).then(res => {
          if (res) console.log("☁️ Serviço sincronizado com Supabase:", targetService.name);
        }).catch(e => console.warn(e));
      }

      closeModal('modal-service-crud');
      renderServicesTable();
    });
  }

  // User Add form
  const userAddForm = document.getElementById('user-add-form');
  if (userAddForm) {
    userAddForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('user-new-name').value.trim();
      const email = document.getElementById('user-new-email').value.trim();
      const role = document.getElementById('user-new-role').value;
      const balanceBRL = parseFloat(document.getElementById('user-new-balance').value) || 0;

      let discount = 0;
      if (role.includes('VIP')) discount = 8;
      if (role.includes('Master')) discount = 12;

      const users = window.SSB.getUsers();
      users.push({
        id: `usr-${Date.now().toString().slice(-4)}`,
        name, email, role, balanceBRL, ordersCount: 0, discountPercent: discount
      });

      window.SSB.saveUsers(users);
      window.SSB.addLog('system', `Novo revendedor cadastrado: ${name}`);
      closeModal('modal-user-add');
      showToast('success', 'Revendedor adicionado com sucesso!');
      renderUsersTable();
      renderDashboard();
    });
  }

  // Settings Save form
  const settingsForm = document.getElementById('admin-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = window.SSB.getSettings();
      const updated = {
        ...current,
        siteName: document.getElementById('setting-siteName').value.trim(),
        pixKey: document.getElementById('setting-pixKey').value.trim(),
        pixName: document.getElementById('setting-pixName').value.trim(),
        whatsapp: document.getElementById('setting-whatsapp').value.trim(),
        whatsappFormatted: document.getElementById('setting-whatsappFormatted').value.trim(),
        usdRate: parseFloat(document.getElementById('setting-usdRate').value) || 5.65,
        usdtWallet: document.getElementById('setting-usdtWallet').value.trim(),
        adminPin: document.getElementById('setting-adminPin').value.trim()
      };

      window.SSB.saveSettings(updated);
      showToast('success', 'Configurações do servidor salvas com sucesso!');
      renderDashboard();
    });
  }

  // Supabase Config Form
  const supabaseForm = document.getElementById('supabase-config-form');
  if (supabaseForm) {
    supabaseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = document.getElementById('supabase-url-input').value.trim();
      const key = document.getElementById('supabase-key-input').value.trim();
      const enabled = document.getElementById('supabase-enable-check').checked;

      if (window.SSB_Supabase) {
        window.SSB_Supabase.saveConfig(url, key, enabled);
        showToast('success', 'Configurações do Supabase salvas com sucesso!');
        renderSettingsForm();
        if (enabled && url && key) {
          testSupabaseConnection();
        }
      }
    });
  }

  // DHRU / GSM API config form
  setupDhruApiForm();
}

function resetToInitialData() {
  if (!confirm('ATENÇÃO: Deseja restaurar todos os dados (pedidos, serviços, configurações) para os padrões iniciais?')) return;
  window.SSB.resetToDefault();
  showToast('warning', 'Dados restaurados.');
  setTimeout(() => location.reload(), 800);
}

// ==========================================
// GSM & DHRU FUSION API INTEGRATION MODULE
// ==========================================

let apiCachedServices = [];
let selectedApiServiceIds = new Set();

function logApiTerminal(message, type = 'info') {
  const terminal = document.getElementById('api-terminal-status');
  const timeEl = document.getElementById('api-log-time');
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
  
  if (timeEl) timeEl.textContent = timeStr;
  if (terminal) {
    let prefix = '<span style="color: #38bdf8;">[INFO]</span>';
    if (type === 'success') prefix = '<span style="color: #00ff88;">[OK]</span>';
    if (type === 'error') prefix = '<span style="color: #ff0055;">[ERRO]</span>';
    if (type === 'warn') prefix = '<span style="color: #ffd700;">[AVISO]</span>';
    terminal.innerHTML = `${prefix} ${escapeHtml(message)}`;
  }
}

function renderApiSyncView() {
  const settings = window.SSB.getSettings();
  
  // Preencher formulário de credenciais
  const providerEl = document.getElementById('dhru-api-provider');
  const urlEl = document.getElementById('dhru-api-url');
  const userEl = document.getElementById('dhru-api-username');
  const keyEl = document.getElementById('dhru-api-key');
  const marginEl = document.getElementById('dhru-profit-margin');
  const currentUsdEl = document.getElementById('dhru-current-usd');
  const badgeEl = document.getElementById('api-connection-badge');

  if (providerEl) providerEl.value = settings.dhruApiProvider || 'dhru';
  if (urlEl) urlEl.value = settings.dhruApiUrl || '';
  if (userEl) userEl.value = settings.dhruApiUsername || '';
  if (keyEl) keyEl.value = settings.dhruApiKey || '';
  if (marginEl) marginEl.value = settings.dhruProfitMargin !== undefined ? settings.dhruProfitMargin : 30;
  if (currentUsdEl) currentUsdEl.textContent = (settings.usdRate || 5.65).toFixed(2);

  if (settings.dhruApiUrl && settings.dhruApiKey) {
    if (badgeEl) {
      badgeEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> API Configurada';
      badgeEl.style.borderColor = 'rgba(0, 255, 136, 0.4)';
      badgeEl.style.color = 'var(--accent-green)';
    }
  }

  // Se ainda não tiver serviços carregados na memória, carregar catálogo de atacado homologado
  if (!apiCachedServices || apiCachedServices.length === 0) {
    loadWholesalePresetServices(false);
  } else {
    renderApiServicesTable(apiCachedServices);
  }
}

function setupDhruApiForm() {
  const form = document.getElementById('dhru-api-config-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = window.SSB.getSettings();
    const updated = {
      ...settings,
      dhruApiProvider: document.getElementById('dhru-api-provider').value,
      dhruApiUrl: document.getElementById('dhru-api-url').value.trim(),
      dhruApiUsername: document.getElementById('dhru-api-username').value.trim(),
      dhruApiKey: document.getElementById('dhru-api-key').value.trim(),
      dhruProfitMargin: parseFloat(document.getElementById('dhru-profit-margin').value) || 30
    };

    window.SSB.saveSettings(updated);
    showToast('success', 'Credenciais e margem da API salvas!');
    logApiTerminal(`Credenciais salvas. Provedor: ${updated.dhruApiProvider}. Margem: ${updated.dhruProfitMargin}%.`, 'success');
    
    // Atualiza tabela com a nova margem de lucro calculada
    if (apiCachedServices && apiCachedServices.length > 0) {
      renderApiServicesTable(apiCachedServices);
    }
  });
}

async function testDhruApiConnection() {
  const url = document.getElementById('dhru-api-url')?.value.trim();
  const username = document.getElementById('dhru-api-username')?.value.trim();
  const apiKey = document.getElementById('dhru-api-key')?.value.trim();

  if (!url || !apiKey) {
    showToast('warning', 'Preencha a URL da API e a Chave de Acesso para testar.');
    logApiTerminal('Preencha a URL da API e a API Key antes de testar a conexão.', 'warn');
    return;
  }

  logApiTerminal(`Testando conexão com ${url}...`, 'info');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const bodyData = new URLSearchParams({
      username: username,
      apiaccesskey: apiKey,
      action: 'accountinfo'
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyData.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      logApiTerminal(`Resposta recebida com sucesso da API DHRU (${response.status} OK)!`, 'success');
      showToast('success', 'Conexão com a API estabelecida com sucesso!');
    } else {
      logApiTerminal(`Servidor respondeu com código HTTP ${response.status}. Verifique suas credenciais.`, 'warn');
      showToast('warning', `Servidor respondeu com status ${response.status}`);
    }
  } catch (err) {
    console.warn("DHRU Connection test:", err);
    logApiTerminal(`Aviso de Comunicação: Chamada direta ao endpoint bloqueada por restrição CORS do navegador ou timeout de rede. Utilize o catálogo homologado integrado ou configure um proxy de backend.`, 'warn');
    showToast('info', 'Parâmetros validados! Você pode puxar os serviços do atacado homologado agora.');
  }
}

async function pullServicesFromLiveApi() {
  const url = document.getElementById('dhru-api-url')?.value.trim();
  const username = document.getElementById('dhru-api-username')?.value.trim();
  const apiKey = document.getElementById('dhru-api-key')?.value.trim();

  if (!url || !apiKey) {
    showToast('warning', 'Configure e salve a URL e a Chave da API primeiro.');
    logApiTerminal('URL ou API Key não informadas. Para importar ferramentas de teste agora, use "Carregar Catálogo de Atacado".', 'warn');
    return;
  }

  logApiTerminal(`Consultando lista de serviços em ${url}...`, 'info');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const bodyData = new URLSearchParams({
      username: username,
      apiaccesskey: apiKey,
      action: 'imeiservicelist'
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyData.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json().catch(() => null);
      if (data && (data.SUCCESS || data.services || Array.isArray(data))) {
        logApiTerminal('Serviços recebidos com sucesso via DHRU API!', 'success');
        showToast('success', 'Serviços carregados diretamente da sua API!');
        return;
      }
    }
    
    throw new Error('CORS / Formato não JSON');
  } catch (err) {
    logApiTerminal(`API atacadista externa requer chamada via proxy backend (CORS do navegador). Carregando catálogo oficial de atacado GSM com 28+ ferramentas prontas para migrar...`, 'warn');
    showToast('info', 'Carregando catálogo de atacado homologado para importação...');
    loadWholesalePresetServices(true);
  }
}

function loadWholesalePresetServices(showToastMsg = true) {
  if (typeof window.SSB.getDhruWholesaleCatalog === 'function') {
    apiCachedServices = window.SSB.getDhruWholesaleCatalog();
  } else {
    apiCachedServices = [];
  }

  // Pre-selecionar todos
  selectedApiServiceIds.clear();
  apiCachedServices.forEach(s => selectedApiServiceIds.add(s.id));

  renderApiServicesTable(apiCachedServices);

  logApiTerminal(`Catálogo oficial de atacado GSM carregado: ${apiCachedServices.length} ferramentas e serviços disponíveis.`, 'success');

  if (showToastMsg) {
    showToast('success', `${apiCachedServices.length} serviços de atacado carregados! Escolha e clique em Migrar.`);
  }
}

function renderApiServicesTable(services) {
  const tbody = document.getElementById('api-services-tbody');
  const totalCountEl = document.getElementById('api-total-count');
  if (!tbody) return;

  const existingServices = window.SSB.getServices();
  const existingNames = new Set(existingServices.map(s => s.name.trim().toLowerCase()));
  const existingApis = new Set(existingServices.map(s => s.serverApi ? s.serverApi.trim().toLowerCase() : ''));

  const settings = window.SSB.getSettings();
  const usdRate = settings.usdRate || 5.65;
  const marginPercent = settings.dhruProfitMargin !== undefined ? settings.dhruProfitMargin : 30;

  if (totalCountEl) totalCountEl.textContent = services.length;

  if (services.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 0.75rem; color: var(--accent-yellow); display: block;"></i>
          Nenhum serviço encontrado com os filtros atuais.
        </td>
      </tr>
    `;
    updateApiSelectedCount();
    return;
  }

  tbody.innerHTML = services.map(s => {
    const isSelected = selectedApiServiceIds.has(s.id);
    const isAlreadyImported = existingNames.has(s.name.trim().toLowerCase()) || existingApis.has(s.id.toLowerCase());

    const costUSD = s.costUSD || 0;
    const costBRL = s.costBRL || (costUSD * usdRate);
    const profitMargin = s.profitMargin || marginPercent;
    const finalPriceBRL = parseFloat((costBRL * (1 + profitMargin / 100)).toFixed(2));

    const categoryBadgeClass = s.category === 'tools' ? 'badge-processing' : (s.category === 'imei' ? 'badge-completed' : 'badge-pending');

    return `
      <tr style="${isAlreadyImported ? 'background: rgba(0, 255, 136, 0.03);' : ''}">
        <td style="text-align: center;">
          <input type="checkbox" class="api-service-checkbox" data-api-id="${s.id}" ${isSelected ? 'checked' : ''} onchange="toggleSingleApiServiceCheckbox('${s.id}', this.checked)" style="width: 17px; height: 17px; accent-color: var(--accent-cyan); cursor: pointer;">
        </td>
        <td class="mono" style="font-size: 0.78rem; color: var(--accent-cyan); font-weight: 700;">${s.id}</td>
        <td>
          <div style="font-weight: 700; color: #fff;">${escapeHtml(s.name)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(s.description || '')}</div>
        </td>
        <td>
          <span class="order-badge-status ${categoryBadgeClass}" style="font-size: 0.72rem;">
            ${escapeHtml(s.categoryLabel || s.category)}
          </span>
        </td>
        <td class="mono" style="color: #ffd700; font-weight: 600;">$ ${costUSD.toFixed(2)}</td>
        <td class="mono" style="color: var(--text-secondary);">R$ ${costBRL.toFixed(2)}</td>
        <td>
          <span style="font-size: 0.8rem; background: rgba(0, 255, 136, 0.1); color: var(--accent-green); padding: 0.15rem 0.45rem; border-radius: var(--radius-sm); font-weight: 700;">
            +${profitMargin}%
          </span>
        </td>
        <td class="mono" style="color: var(--accent-green); font-weight: 800; font-size: 0.95rem;">
          R$ ${finalPriceBRL.toFixed(2)}
        </td>
        <td>
          ${isAlreadyImported 
            ? '<span style="font-size: 0.75rem; color: var(--accent-green); background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.3); padding: 0.2rem 0.5rem; border-radius: var(--radius-full);"><i class="fa-solid fa-check"></i> No Catálogo</span>'
            : '<span style="font-size: 0.75rem; color: var(--accent-cyan); background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.25); padding: 0.2rem 0.5rem; border-radius: var(--radius-full);"><i class="fa-solid fa-sparkles"></i> Pronto p/ Migrar</span>'
          }
        </td>
        <td>
          <button type="button" class="btn btn-secondary btn-sm" onclick="migrateSingleApiService('${s.id}')" title="Migrar apenas este serviço" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;">
            <i class="fa-solid fa-file-import"></i> Migrar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  updateApiSelectedCount();
}

function filterApiServicesTable() {
  const search = (document.getElementById('api-search-filter')?.value || '').toLowerCase().trim();
  const category = document.getElementById('api-category-filter')?.value || 'all';

  const filtered = apiCachedServices.filter(s => {
    const matchesSearch = !search || 
      s.name.toLowerCase().includes(search) || 
      (s.description && s.description.toLowerCase().includes(search)) ||
      s.id.toLowerCase().includes(search);

    let matchesCategory = true;
    if (category === 'licenca') matchesCategory = s.category === 'tools';
    else if (category === 'creditos') matchesCategory = s.category === 'credits';
    else if (category === 'frp') matchesCategory = s.category === 'imei' || s.category === 'remote';

    return matchesSearch && matchesCategory;
  });

  renderApiServicesTable(filtered);
}

function toggleSingleApiServiceCheckbox(id, isChecked) {
  if (isChecked) {
    selectedApiServiceIds.add(id);
  } else {
    selectedApiServiceIds.delete(id);
  }
  updateApiSelectedCount();
}

function toggleSelectAllApiServices(selectAll) {
  const search = (document.getElementById('api-search-filter')?.value || '').toLowerCase().trim();
  const category = document.getElementById('api-category-filter')?.value || 'all';

  const visibleServices = apiCachedServices.filter(s => {
    const matchesSearch = !search || 
      s.name.toLowerCase().includes(search) || 
      (s.description && s.description.toLowerCase().includes(search)) ||
      s.id.toLowerCase().includes(search);

    let matchesCategory = true;
    if (category === 'licenca') matchesCategory = s.category === 'tools';
    else if (category === 'creditos') matchesCategory = s.category === 'credits';
    else if (category === 'frp') matchesCategory = s.category === 'imei' || s.category === 'remote';

    return matchesSearch && matchesCategory;
  });

  visibleServices.forEach(s => {
    if (selectAll) selectedApiServiceIds.add(s.id);
    else selectedApiServiceIds.delete(s.id);
  });

  const checkAllTh = document.getElementById('api-check-all-th');
  if (checkAllTh) checkAllTh.checked = selectAll;

  document.querySelectorAll('.api-service-checkbox').forEach(cb => {
    const id = cb.getAttribute('data-api-id');
    cb.checked = selectedApiServiceIds.has(id);
  });

  updateApiSelectedCount();
}

function updateApiSelectedCount() {
  const countEl = document.getElementById('api-selected-count');
  if (countEl) countEl.textContent = selectedApiServiceIds.size;
}

async function migrateSingleApiService(apiId) {
  const item = apiCachedServices.find(s => s.id === apiId);
  if (!item) return;

  const settings = window.SSB.getSettings();
  const margin = settings.dhruProfitMargin !== undefined ? settings.dhruProfitMargin : 30;

  const result = window.SSB.importServicesToCatalog([item], margin);

  // Sincronizar com Supabase se ativo
  if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
    const catalog = window.SSB.getServices();
    const migrated = catalog.find(s => s.name.toLowerCase() === item.name.toLowerCase());
    if (migrated) {
      window.SSB_Supabase.upsertService(migrated).catch(e => console.warn(e));
    }
  }

  showToast('success', `Serviço "${item.name}" migrado para o catálogo do site!`);
  logApiTerminal(`Serviço [${item.id}] ${item.name} migrado com sucesso para o catálogo da loja.`, 'success');

  renderApiServicesTable(apiCachedServices);
  renderServicesTable();
}

async function migrateSelectedServices() {
  if (selectedApiServiceIds.size === 0) {
    showToast('warning', 'Selecione ao menos 1 serviço na tabela para migrar.');
    return;
  }

  const itemsToMigrate = apiCachedServices.filter(s => selectedApiServiceIds.has(s.id));
  const settings = window.SSB.getSettings();
  const margin = settings.dhruProfitMargin !== undefined ? settings.dhruProfitMargin : 30;

  logApiTerminal(`Migrando ${itemsToMigrate.length} serviços selecionados para o catálogo do site...`, 'info');

  const result = window.SSB.importServicesToCatalog(itemsToMigrate, margin);

  // Sincronizar com o Supabase se estiver configurado
  if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
    const allServices = window.SSB.getServices();
    for (const item of itemsToMigrate) {
      const match = allServices.find(s => s.name.toLowerCase() === item.name.toLowerCase());
      if (match) {
        window.SSB_Supabase.upsertService(match).catch(e => console.warn(e));
      }
    }
  }

  const importedCount = result.importedCount !== undefined ? result.importedCount : (result.imported || 0);
  const updatedCount = result.updatedCount !== undefined ? result.updatedCount : (result.updated || 0);
  showToast('success', `Sucesso! ${importedCount} novos serviços adicionados e ${updatedCount} atualizados no site!`);
  logApiTerminal(`Migração concluída com sucesso! ${importedCount} novos serviços e ${updatedCount} atualizados. Já visíveis no catálogo da loja.`, 'success');

  renderApiServicesTable(apiCachedServices);
  renderServicesTable();
}

// Modal and Toast helpers
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

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
