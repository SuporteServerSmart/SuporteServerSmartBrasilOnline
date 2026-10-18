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
  window.toggleServicesSubmenu = toggleServicesSubmenu;
  window.renderUsersTable = renderUsersTable;
  window.toggleSingleUserCheckbox = toggleSingleUserCheckbox;
  window.toggleSelectAllUsers = toggleSelectAllUsers;
  window.deleteSingleUserPermanent = deleteSingleUserPermanent;
  window.deleteSelectedUsersPermanent = deleteSelectedUsersPermanent;
  window.deleteAllUsersPermanent = deleteAllUsersPermanent;
  window.openEditUserModal = openEditUserModal;
  window.addCreditToUser = addCreditToUser;
  window.openAddUserModal = openAddUserModal;

  // Gerenciador de APIs GSM & DHRU
  window.handleSaveApi = handleSaveApi;
  window.editApiItem = editApiItem;
  window.deleteApiItem = deleteApiItem;
  window.resetApiForm = resetApiForm;
  window.syncServicesFromApi = syncServicesFromApi;
  window.updateApiColorPreview = updateApiColorPreview;
  window.renderApisTable = renderApisTable;
  window.fetchApiBalanceLive = fetchApiBalanceLive;
  window.refreshMainApiBalance = refreshMainApiBalance;
  window.sendAllPulledServicesToPublicSite = sendAllPulledServicesToPublicSite;
  window.pullServicesFromLiveApi = pullServicesFromLiveApi;
  window.changeServicesListPage = changeServicesListPage;
  window.changeApiServicesPage = changeApiServicesPage;
  window.onServicesSearchInput = onServicesSearchInput;
  window.onApiSearchFilterInput = onApiSearchFilterInput;
  window.updateApiProfitMarginControl = updateApiProfitMarginControl;
  window.setApiMarginZero = setApiMarginZero;

  // Gerenciador de Serviços e Grupos (Novas telas fotos 2, 3 e 4)
  window.renderServicesListTable = renderServicesListTable;
  window.toggleSelectAllServicesList = toggleSelectAllServicesList;
  window.toggleSingleServiceListCheckbox = toggleSingleServiceListCheckbox;
  window.toggleServiceActiveStatus = toggleServiceActiveStatus;
  window.applyBulkGroupToSelected = applyBulkGroupToSelected;
  window.removeSelectedServicesFromCatalog = removeSelectedServicesFromCatalog;
  window.promptBulkPriceUpdate = promptBulkPriceUpdate;
  window.applyBulkPriceUpdate = applyBulkPriceUpdate;
  window.openNewServiceModal = openNewServiceModal;
  window.editService = editService;
  window.deleteService = deleteService;

  window.renderServicesGroupsTable = renderServicesGroupsTable;
  window.openNewGroupModal = openNewGroupModal;
  window.editGroupItem = editGroupItem;
  window.handleSaveGroup = handleSaveGroup;
  window.deleteGroupItem = deleteGroupItem;

  window.renderAddCreditView = renderAddCreditView;
  window.handleQuickAddCredit = handleQuickAddCredit;
  window.renderFinancialView = renderFinancialView;

  window.renderCoursesTable = renderCoursesTable;
  window.openNewCourseModal = openNewCourseModal;
  window.deleteCourseItem = deleteCourseItem;

  window.renderFilesTable = renderFilesTable;
  window.openNewFileModal = openNewFileModal;
  window.deleteFileItem = deleteFileItem;

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

      // Opção A: Login via Conta Mestre Oficial (suporteserversmart@gmail.com)
      if (identity.toLowerCase() === 'suporteserversmart@gmail.com' && password === 'Picopico102030@&') {
        const masterAdminAcc = {
          id: 'admin_master_official',
          name: 'Suporte Server Smart',
          email: 'suporteserversmart@gmail.com',
          role: 'admin',
          isAdmin: true
        };
        localStorage.setItem(ADMIN_EMAIL_KEY, 'suporteserversmart@gmail.com');
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(masterAdminAcc));
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        showToast('success', 'Bem-vindo, Administrador Oficial Server Smart!');
        checkAuth();
        return;
      }

      // Opção B: Login via PIN Mestre (admin123 ou settings.adminPin)
      if (identity === settings.adminPin || identity === 'admin123') {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        showToast('success', 'Acesso autorizado via Chave Mestre!');
        checkAuth();
        return;
      }

      // Opção C: Login via Outras Contas de Usuários Cadastrados
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
function toggleServicesSubmenu(e) {
  if (e) e.stopPropagation();
  const submenu = document.getElementById('submenu-manage-services');
  const arrow = document.getElementById('services-submenu-arrow');
  if (!submenu) return;

  const isOpen = submenu.style.display === 'flex';
  if (isOpen) {
    submenu.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  } else {
    submenu.style.display = 'flex';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    // Se nenhuma sub-aba estiver ativa, já abre por padrão a aba de Serviços
    const activeSub = submenu.querySelector('.admin-sub-item.active');
    if (!activeSub) {
      switchTab('services-list');
    }
  }
}

// 2. Navigation Tabs
function setupNavigation() {
  window.switchTab = switchTab;
  window.toggleServicesSubmenu = toggleServicesSubmenu;

  // Delegação de eventos no container pai nav
  const navContainer = document.querySelector('.admin-nav');
  if (navContainer) {
    navContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.admin-nav-item');
      if (item && !item.classList.contains('nav-has-submenu')) {
        const tab = item.getAttribute('data-tab');
        if (tab) switchTab(tab);
      }
    });
  }
}

function switchTab(tabName) {
  if (!tabName) return;

  // Mapeamentos de compatibilidade
  if (tabName === 'services') tabName = 'services-list';
  if (tabName === 'api-sync') tabName = 'apis';

  // Se a aba for uma sub-aba de Gerenciar Serviços, manter o submenu aberto
  const submenu = document.getElementById('submenu-manage-services');
  const arrow = document.getElementById('services-submenu-arrow');
  const parentNavItem = document.getElementById('nav-item-manage-services');

  if (tabName === 'services-list' || tabName === 'services-groups') {
    if (submenu) submenu.style.display = 'flex';
    if (arrow) arrow.style.transform = 'rotate(-90deg)';
    if (parentNavItem) parentNavItem.classList.add('active');
  } else {
    if (parentNavItem) parentNavItem.classList.remove('active');
  }

  // 1. Alterna estado ativo nos botões do menu lateral
  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(el => {
    const itemTab = el.getAttribute('data-tab');
    const isTarget = itemTab === tabName;
    el.classList.toggle('active', isTarget);
  });

  // 2. Alterna exibição das seções
  const views = document.querySelectorAll('.admin-view');
  views.forEach(view => {
    let isTarget = view.id === `view-${tabName}`;
    // Fallbacks para compatibilidade
    if (tabName === 'apis' && view.id === 'view-api-sync') isTarget = true;
    if (tabName === 'services-list' && view.id === 'view-services') isTarget = false;
    view.style.display = isTarget ? 'block' : 'none';
  });

  // 3. Renderiza dados da aba selecionada
  try {
    if (tabName === 'dashboard') renderDashboard();
    else if (tabName === 'orders') renderOrdersTable();
    else if (tabName === 'services-list') renderServicesListTable();
    else if (tabName === 'services-groups') renderServicesGroupsTable();
    else if (tabName === 'apis') renderApiSyncView();
    else if (tabName === 'users') renderUsersTable();
    else if (tabName === 'add-credit') renderAddCreditView();
    else if (tabName === 'financial') renderFinancialView();
    else if (tabName === 'courses') renderCoursesTable();
    else if (tabName === 'files') renderFilesTable();
    else if (tabName === 'settings') renderSettingsForm();
  } catch (err) {
    console.error(`Erro ao carregar dados da aba ${tabName}:`, err);
  }
}
window.switchTab = switchTab;
window.toggleServicesSubmenu = toggleServicesSubmenu;

// 3. Load all admin views
function loadAllAdminData() {
  try { renderDashboard(); } catch (e) { console.error('Dashboard load error:', e); }
  try { renderOrdersTable(); } catch (e) { console.error('Orders load error:', e); }
  try { renderServicesListTable(); } catch (e) { console.error('Services list load error:', e); }
  try { renderServicesTable(); } catch (e) { console.error('Services load error:', e); }
  try { renderServicesGroupsTable(); } catch (e) { console.error('Groups load error:', e); }
  try { renderUsersTable(); } catch (e) { console.error('Users load error:', e); }
  try { renderSettingsForm(); } catch (e) { console.error('Settings load error:', e); }
  try { refreshMainApiBalance(false); } catch (e) { console.error('API balance load error:', e); }
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

  const apis = window.SSB.getApis();
  const activeApi = apis.find(a => a.status === 'Habilitado') || apis[0];
  if (activeApi) {
    updateBalanceDisplays(activeApi);
  }

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

let selectedOrderIds = new Set();

// 5. Render Orders
function renderOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const orders = window.SSB.getOrders();
  const filter = document.getElementById('orders-filter-status')?.value || 'all';

  const filtered = orders.filter(o => filter === 'all' || o.status === filter);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">Nenhum pedido encontrado.</td></tr>`;
    updateOrdersSelectedCount();
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const isSelected = selectedOrderIds.has(o.orderId);
    const priceBRL = typeof o.priceBRL === 'number' ? o.priceBRL : parseFloat(o.priceBRL) || 0;

    return `
      <tr style="${isSelected ? 'background: rgba(255, 0, 85, 0.08);' : ''}">
        <td style="text-align: center;">
          <input type="checkbox" class="order-select-checkbox" data-order-id="${o.orderId}" ${isSelected ? 'checked' : ''} onchange="toggleSingleOrderCheckbox('${o.orderId}', this.checked)" style="width: 17px; height: 17px; accent-color: var(--accent-red); cursor: pointer;">
        </td>
        <td class="mono" style="font-weight: 700; color: var(--accent-cyan);">${escapeHtml(o.orderId)}</td>
        <td style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(o.date || '')}</td>
        <td><strong>${escapeHtml(o.serviceName || '')}</strong></td>
        <td class="mono" style="color: #fff; background: rgba(0,0,0,0.3); padding: 0.3rem 0.6rem; border-radius: 4px;">${escapeHtml(o.dataInput || '-')}</td>
        <td>
          <div>${escapeHtml(o.customerName || '')}</div>
          <small style="color: var(--text-muted);">${escapeHtml(o.customerContact || '')}</small>
        </td>
        <td class="mono" style="font-weight: 700; color: var(--accent-green);">R$ ${priceBRL.toFixed(2)}</td>
        <td>${renderStatusBadge(o.status)}</td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="btn btn-secondary btn-sm" onclick="openOrderActionModal('${o.orderId}')" title="Gerenciar Status / Responder">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="deleteSingleOrderPermanent('${o.orderId}')" style="color: var(--accent-red);" title="Excluir Permanentemente">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updateOrdersSelectedCount();
}

function toggleSingleOrderCheckbox(orderId, isChecked) {
  if (isChecked) {
    selectedOrderIds.add(orderId);
  } else {
    selectedOrderIds.delete(orderId);
  }
  updateOrdersSelectedCount();
}

function toggleSelectAllOrders(selectAll) {
  const filter = document.getElementById('orders-filter-status')?.value || 'all';
  const orders = window.SSB.getOrders().filter(o => filter === 'all' || o.status === filter);

  orders.forEach(o => {
    if (selectAll) selectedOrderIds.add(o.orderId);
    else selectedOrderIds.delete(o.orderId);
  });

  const checkAllTh = document.getElementById('orders-check-all-th');
  if (checkAllTh) checkAllTh.checked = selectAll;

  document.querySelectorAll('.order-select-checkbox').forEach(cb => {
    const id = cb.getAttribute('data-order-id');
    cb.checked = selectedOrderIds.has(id);
  });

  updateOrdersSelectedCount();
}

function updateOrdersSelectedCount() {
  const countEl = document.getElementById('orders-selected-count');
  if (countEl) countEl.textContent = selectedOrderIds.size;
}

function deleteSingleOrderPermanent(orderId) {
  if (!confirm(`ATENÇÃO: Deseja realmente EXCLUIR PERMANENTEMENTE o pedido [${orderId}]?\nEsta ação apagará o pedido da base de dados e não pode ser desfeita!`)) {
    return;
  }

  window.SSB.deleteOrder(orderId);
  selectedOrderIds.delete(orderId);
  showToast('success', `Pedido ${orderId} excluído permanentemente!`);
  renderOrdersTable();
  renderDashboard();
}

function deleteSelectedOrdersPermanent() {
  if (selectedOrderIds.size === 0) {
    showToast('warning', 'Selecione ao menos 1 pedido para excluir.');
    return;
  }

  const count = selectedOrderIds.size;
  if (!confirm(`ATENÇÃO: Deseja realmente EXCLUIR PERMANENTEMENTE os ${count} pedidos selecionados?\nEles serão apagados de forma irreversível!`)) {
    return;
  }

  const removed = window.SSB.deleteOrders(Array.from(selectedOrderIds));
  selectedOrderIds.clear();
  showToast('success', `${removed} pedidos excluídos permanentemente com sucesso!`);
  renderOrdersTable();
  renderDashboard();
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

  const services = window.SSB.getServices().slice(0, 50);

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
  renderServicesListTable();
}

let selectedUserIds = new Set();

// 9. Users / Resellers
function renderUsersTable() {
  const tbody = document.getElementById('admin-users-tbody');
  const totalCountEl = document.getElementById('users-total-count');
  if (!tbody) return;

  let users = window.SSB.getUsers();
  const search = (document.getElementById('users-search-filter')?.value || '').toLowerCase().trim();
  const roleFilter = document.getElementById('users-role-filter')?.value || 'all';

  // Filtragem de busca e cargo
  users = users.filter(u => {
    const matchesSearch = !search ||
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search));

    let matchesRole = true;
    const r = (u.role || '').toLowerCase();
    if (roleFilter === 'admin') matchesRole = r.includes('admin');
    else if (roleFilter === 'master') matchesRole = r.includes('master');
    else if (roleFilter === 'vip') matchesRole = r.includes('vip');
    else if (roleFilter === 'cliente') matchesRole = !r.includes('admin') && !r.includes('master') && !r.includes('vip');

    return matchesSearch && matchesRole;
  });

  if (totalCountEl) totalCountEl.textContent = users.length;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">Nenhum cliente ou revendedor encontrado.</td></tr>`;
    updateUsersSelectedCount();
    return;
  }

  tbody.innerHTML = users.map(u => {
    const isSelected = selectedUserIds.has(u.id);
    const balanceBRL = typeof u.balanceBRL === 'number' ? u.balanceBRL : parseFloat(u.balanceBRL) || 0;
    const roleStr = u.role || 'Cliente Técnico';
    const isAdm = roleStr.includes('Admin');

    let badgeClass = 'badge-pending';
    if (isAdm) badgeClass = 'badge-processing';
    else if (roleStr.includes('Master')) badgeClass = 'badge-completed';
    else if (roleStr.includes('VIP')) badgeClass = 'badge-processing';

    return `
      <tr style="${isSelected ? 'background: rgba(255, 0, 85, 0.08);' : ''}">
        <td style="text-align: center;">
          <input type="checkbox" class="user-select-checkbox" data-user-id="${u.id}" ${isSelected ? 'checked' : ''} onchange="toggleSingleUserCheckbox('${u.id}', this.checked)" style="width: 17px; height: 17px; accent-color: var(--accent-red); cursor: pointer;">
        </td>
        <td>
          <div style="font-weight: 700; color: #fff;">${escapeHtml(u.name || 'Sem Nome')}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">ID: ${escapeHtml(u.id)}</div>
        </td>
        <td style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem;">
          ${escapeHtml(u.email || '-')}
        </td>
        <td>
          <span class="order-badge-status ${badgeClass}" style="font-size: 0.75rem;">
            ${escapeHtml(roleStr)}
          </span>
        </td>
        <td class="mono" style="font-weight: 800; color: var(--accent-green); font-size: 0.95rem;">
          R$ ${balanceBRL.toFixed(2)}
        </td>
        <td class="mono">${u.ordersCount || 0} ordens</td>
        <td class="mono" style="color: var(--accent-cyan); font-weight: 700;">
          ${u.discountPercent || 0}% OFF
        </td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="btn btn-secondary btn-sm" onclick="openEditUserModal('${u.id}')" title="Gerenciar Conta / Redefinir Senha / Nível">
              <i class="fa-solid fa-user-pen"></i>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="addCreditToUser('${u.id}')" title="Injetar / Alterar Créditos">
              <i class="fa-solid fa-coins" style="color: #ffd700;"></i>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="deleteSingleUserPermanent('${u.id}')" style="color: var(--accent-red);" title="Excluir Permanentemente">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updateUsersSelectedCount();
}

function toggleSingleUserCheckbox(userId, isChecked) {
  if (isChecked) selectedUserIds.add(userId);
  else selectedUserIds.delete(userId);
  updateUsersSelectedCount();
}

function toggleSelectAllUsers(selectAll) {
  const users = window.SSB.getUsers();
  users.forEach(u => {
    if (selectAll) selectedUserIds.add(u.id);
    else selectedUserIds.delete(u.id);
  });

  const checkAllTh = document.getElementById('users-check-all-th');
  if (checkAllTh) checkAllTh.checked = selectAll;

  document.querySelectorAll('.user-select-checkbox').forEach(cb => {
    const id = cb.getAttribute('data-user-id');
    cb.checked = selectedUserIds.has(id);
  });

  updateUsersSelectedCount();
}

function updateUsersSelectedCount() {
  const countEl = document.getElementById('users-selected-count');
  if (countEl) countEl.textContent = selectedUserIds.size;
}

function deleteSingleUserPermanent(userId) {
  const users = window.SSB.getUsers();
  const u = users.find(x => x.id === userId);
  const userName = u ? u.name : userId;

  if (!confirm(`ATENÇÃO: Deseja realmente EXCLUIR PERMANENTEMENTE a conta de [${userName}]?\nO cliente não poderá mais fazer login nem acessar o saldo!`)) {
    return;
  }

  window.SSB.deleteUser(userId);
  selectedUserIds.delete(userId);
  showToast('success', `Usuário ${userName} excluído permanentemente!`);
  renderUsersTable();
  renderDashboard();
}

function deleteSelectedUsersPermanent() {
  if (selectedUserIds.size === 0) {
    showToast('warning', 'Selecione ao menos 1 usuário para excluir.');
    return;
  }

  const count = selectedUserIds.size;
  if (!confirm(`ATENÇÃO: Deseja realmente EXCLUIR PERMANENTEMENTE os ${count} clientes/revendedores selecionados?\nEsta ação apagará as contas de forma definitiva!`)) {
    return;
  }

  const removed = window.SSB.deleteUsers(Array.from(selectedUserIds));
  selectedUserIds.clear();
  showToast('success', `${removed} contas de clientes/revendedores excluídas permanentemente!`);
  renderUsersTable();
  renderDashboard();
}

function deleteAllUsersPermanent() {
  const users = window.SSB.getUsers();
  if (users.length === 0) {
    showToast('info', 'Não há usuários cadastrados para excluir.');
    return;
  }

  if (!confirm(`⚠️ ALERTA MÁXIMO:\nDeseja realmente EXCLUIR TODAS AS CONTAS DE CLIENTES E REVENDEDORES (${users.length} usuários)?\n\nTodos os acessos e saldos serão apagados definitivamente!\n(Seu login com PIN mestre admin123 continuará funcionando normalmente).`)) {
    return;
  }

  window.SSB.deleteAllUsers();
  selectedUserIds.clear();
  showToast('success', 'Todas as contas de clientes e revendedores foram excluídas permanentemente!');
  renderUsersTable();
  renderDashboard();
}

function openEditUserModal(userId) {
  const users = window.SSB.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  document.getElementById('user-edit-id').value = user.id;
  document.getElementById('user-edit-name').value = user.name || '';
  document.getElementById('user-edit-email').value = user.email || '';
  document.getElementById('user-edit-password').value = '';
  document.getElementById('user-edit-role').value = user.role || 'Cliente Técnico';
  document.getElementById('user-edit-balance').value = (user.balanceBRL || 0).toFixed(2);
  document.getElementById('user-edit-discount').value = user.discountPercent || 0;

  const delBtn = document.getElementById('user-edit-delete-btn');
  if (delBtn) {
    delBtn.onclick = () => {
      closeModal('modal-user-edit');
      deleteSingleUserPermanent(user.id);
    };
  }

  openModal('modal-user-edit');
}

function addCreditToUser(userId) {
  const users = window.SSB.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const currentBal = (user.balanceBRL || 0).toFixed(2);
  const actionChoice = prompt(
    `Gerenciador de Saldo para [${user.name}]:\n` +
    `Saldo atual: R$ ${currentBal}\n\n` +
    `Digite o valor para ADICIONAR (ex: 50)\n` +
    `Ou digite um valor negativo para SUBTRAIR (ex: -20)\n` +
    `Ou digite '=VALOR' para DEFINIR direto (ex: =100):`,
    "50.00"
  );
  if (!actionChoice) return;

  const trimmed = actionChoice.trim();
  let newBalance = user.balanceBRL || 0;

  if (trimmed.startsWith('=')) {
    const directVal = parseFloat(trimmed.slice(1));
    if (isNaN(directVal) || directVal < 0) {
      showToast('error', 'Valor de saldo inválido.');
      return;
    }
    newBalance = directVal;
  } else {
    const delta = parseFloat(trimmed);
    if (isNaN(delta)) {
      showToast('error', 'Valor inválido.');
      return;
    }
    newBalance += delta;
    if (newBalance < 0) newBalance = 0;
  }

  user.balanceBRL = newBalance;
  window.SSB.updateUser({ id: user.id, email: user.email, name: user.name, balanceBRL: newBalance });
  showToast('success', `Saldo de ${user.name} atualizado para R$ ${newBalance.toFixed(2)}!`);
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
      renderServicesListTable();
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

  // User Edit form (Controle Total de Clientes e Revendedores)
  const userEditForm = document.getElementById('user-edit-form');
  if (userEditForm) {
    userEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('user-edit-id').value;
      const name = document.getElementById('user-edit-name').value.trim();
      const email = document.getElementById('user-edit-email').value.trim();
      const password = document.getElementById('user-edit-password').value.trim();
      const role = document.getElementById('user-edit-role').value;
      const balanceBRL = parseFloat(document.getElementById('user-edit-balance').value) || 0;
      const discountPercent = parseInt(document.getElementById('user-edit-discount').value) || 0;

      const updated = { id, name, email, role, balanceBRL, discountPercent };
      if (password) updated.password = password;

      window.SSB.updateUser(updated);
      closeModal('modal-user-edit');
      showToast('success', `Conta de ${name} atualizada com sucesso!`);
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

function updateApiColorPreview(color) {
  const bar = document.getElementById('api-mgr-color-bar');
  if (bar) bar.style.background = color || '#8b5cf6';
}

function resetApiForm() {
  document.getElementById('api-mgr-id').value = '';
  document.getElementById('api-mgr-name').value = '';
  document.getElementById('api-mgr-type').value = 'DHRU';
  document.getElementById('api-mgr-status').value = 'Habilitado';
  document.getElementById('api-mgr-url').value = '';
  document.getElementById('api-mgr-username').value = '';
  document.getElementById('api-mgr-key').value = '';
  document.getElementById('api-mgr-color').value = '#8b5cf6';
  updateApiColorPreview('#8b5cf6');

  const titleEl = document.getElementById('api-form-title');
  if (titleEl) titleEl.textContent = 'Adicionar Nova API';

  const btnText = document.getElementById('api-btn-save-text');
  if (btnText) btnText.textContent = 'Salvar API';

  const cancelBtn = document.getElementById('api-form-cancel-btn');
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function handleSaveApi(e) {
  if (e) e.preventDefault();

  const id = document.getElementById('api-mgr-id')?.value.trim();
  const name = document.getElementById('api-mgr-name')?.value.trim();
  const type = document.getElementById('api-mgr-type')?.value;
  const status = document.getElementById('api-mgr-status')?.value;
  let url = (document.getElementById('api-mgr-url')?.value || '').trim();
  const username = document.getElementById('api-mgr-username')?.value.trim();
  const apiKey = document.getElementById('api-mgr-key')?.value.trim();
  const color = document.getElementById('api-mgr-color')?.value || '#8b5cf6';

  if (!name || !url || !username || !apiKey) {
    showToast('warning', 'Preencha todos os campos da API.');
    return;
  }

  // Normalização de URL inteligente
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  if (/\/public\/?$/i.test(url)) {
    url = url.replace(/\/public\/?$/i, '/public/api/index.php');
  } else if (!url.includes('.php') && !url.includes('/api/')) {
    if (url.includes('conectproo.com')) {
      url = url.replace(/\/+$/, '') + '/public/api/index.php';
    }
  }

  const currencyMode = document.getElementById('api-mgr-currency')?.value || 'auto';
  const profitMarginVal = parseFloat(document.getElementById('api-mgr-margin')?.value);
  const profitMargin = isNaN(profitMarginVal) ? 30 : Math.max(0, profitMarginVal);

  const apiObj = {
    id: id || undefined,
    name,
    type,
    status,
    url,
    username,
    apiKey,
    color,
    currencyMode,
    profitMargin
  };

  const saved = window.SSB.saveApi(apiObj);
  showToast('success', `API [${name}] salva com sucesso! (Moeda: ${currencyMode.toUpperCase()}, Margem: ${profitMargin}%)`);
  logApiTerminal(`API [${name}] salva com sucesso no gerenciador de provedores. Moeda: ${currencyMode.toUpperCase()}, Margem: ${profitMargin}%.`, 'success');

  resetApiForm();
  renderApisTable();
  fetchApiBalanceLive(saved.id, false);
}

function editApiItem(apiId) {
  const apis = window.SSB.getApis();
  const api = apis.find(a => a.id === apiId);
  if (!api) return;

  document.getElementById('api-mgr-id').value = api.id;
  document.getElementById('api-mgr-name').value = api.name || '';
  document.getElementById('api-mgr-type').value = api.type || 'DHRU';
  document.getElementById('api-mgr-status').value = api.status || 'Habilitado';
  document.getElementById('api-mgr-url').value = api.url || '';
  document.getElementById('api-mgr-username').value = api.username || '';
  document.getElementById('api-mgr-key').value = api.apiKey || '';
  document.getElementById('api-mgr-color').value = api.color || '#8b5cf6';
  updateApiColorPreview(api.color || '#8b5cf6');

  const currSelect = document.getElementById('api-mgr-currency');
  if (currSelect) currSelect.value = api.currencyMode || 'auto';
  const marginInput = document.getElementById('api-mgr-margin');
  if (marginInput) marginInput.value = api.profitMargin !== undefined ? api.profitMargin : 30;

  const titleEl = document.getElementById('api-form-title');
  if (titleEl) titleEl.textContent = `Editar API: ${api.name}`;

  const btnText = document.getElementById('api-btn-save-text');
  if (btnText) btnText.textContent = 'Atualizar API';

  const cancelBtn = document.getElementById('api-form-cancel-btn');
  if (cancelBtn) cancelBtn.style.display = 'inline-flex';

  // Rolar suavemente até o formulário
  document.getElementById('api-mgr-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast('info', `Editando API [${api.name}]. Altere os campos e clique em Atualizar.`);
}

function deleteApiItem(apiId) {
  const apis = window.SSB.getApis();
  const api = apis.find(a => a.id === apiId);
  const name = api ? api.name : 'esta API';

  if (!confirm(`Deseja realmente remover a API [${name}] do gerenciador?`)) {
    return;
  }

  window.SSB.deleteApi(apiId);
  showToast('success', `API [${name}] removida com sucesso!`);
  logApiTerminal(`API [${name}] removida do painel.`, 'info');
  renderApisTable();
}

async function syncServicesFromApi(apiId) {
  const apis = window.SSB.getApis();
  const api = apis.find(a => a.id === apiId);

  if (!api) {
    showToast('error', 'API não encontrada.');
    return;
  }

  if (api.status === 'Desabilitado') {
    showToast('warning', `A API [${api.name}] está marcada como Desabilitada. Ative-a para sincronizar.`);
    logApiTerminal(`API [${api.name}] desabilitada. Habilite nas configurações para sincronizar.`, 'warn');
    return;
  }

  logApiTerminal(`Conectando à API [${api.name}] (${api.url})...`, 'info');
  showToast('info', `Sincronizando serviços da API [${api.name}]...`);

  let url = api.url;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  if (/\/public\/?$/i.test(url)) url = url.replace(/\/public\/?$/i, '/public/api/index.php');

  let pulledServices = [];
  let lastError = '';

  try {
    logApiTerminal(`Buscando catálogo completo na API [${api.name}] (Server & IMEI)...`, 'info');
    const response = await fetch('/api/proxy-dhru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url,
        username: api.username,
        apiKey: api.apiKey,
        action: 'get_all_services',
        provider: api.type.toLowerCase().includes('gsm') ? 'gsmserver' : 'dhru'
      })
    });

    const resData = await response.json().catch(() => null);

    if (resData && resData.success && Array.isArray(resData.services) && resData.services.length > 0) {
      pulledServices = resData.services;
      logApiTerminal(`Sucesso! ${resData.services.length} serviços encontrados em [${api.name}].`, 'success');
    } else if (resData && !resData.success && resData.error) {
      lastError = resData.error;
    }
  } catch (e) {
    console.warn(`Erro na sincronização:`, e);
    lastError = e.message;
  }

  if (pulledServices.length > 0) {
    const seen = new Set();
    const unique = [];
    for (const s of pulledServices) {
      const key = `${s.id}-${s.name.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    }

    // Identificar moeda do servidor atacadista (BRL ou USD)
    const detectedCurrency = (api.currencyMode && api.currencyMode !== 'auto') 
      ? api.currencyMode 
      : (resData.currency || (api.name && api.name.toLowerCase().includes('conectproo') ? 'BRL' : 'USD'));

    const settings = window.SSB.getSettings();
    const usdRate = settings.usdRate || 5.65;
    const margin = getActiveApiProfitMargin(api);

    // Associar dados exatos de custo e API a cada serviço importado
    unique.forEach(s => {
      s.serverApi = api.name || 'DHRU Fusion API';
      s.apiName = api.name || 'DHRU Fusion API';
      s.currency = s.currency || detectedCurrency;
      const raw = typeof s.rawCost === 'number' ? s.rawCost : (parseFloat(s.cost) || parseFloat(s.costUSD) || 0);
      s.rawCost = raw;
      if (s.currency === 'BRL') {
        s.costBRL = raw;
        s.costUSD = parseFloat((raw / usdRate).toFixed(4));
      } else {
        s.costUSD = raw;
        s.costBRL = parseFloat((raw * usdRate).toFixed(2));
      }
      s.profitMargin = margin;
      s.priceBRL = parseFloat((s.costBRL * (1 + margin / 100)).toFixed(2));
    });

    apiCachedServices = unique;
    selectedApiServiceIds.clear();
    apiCachedServices.forEach(s => selectedApiServiceIds.add(s.id));

    // Publicar automaticamente todos os serviços puxados diretamente no catálogo do site público
    const importResult = window.SSB.importServicesToCatalog(unique, margin);

    try { renderServicesListTable(); } catch (e) {}
    try { renderServicesTable(); } catch (e) {}
    renderApiServicesTable(apiCachedServices);

    const impCount = importResult.importedCount !== undefined ? importResult.importedCount : (importResult.imported || 0);
    const updCount = importResult.updatedCount !== undefined ? importResult.updatedCount : (importResult.updated || 0);

    const badge = document.getElementById('api-connection-badge');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${unique.length} Serviços Publicados no Site`;
      badge.style.borderColor = 'rgba(0, 255, 136, 0.4)';
      badge.style.color = 'var(--accent-green)';
    }

    logApiTerminal(`Sincronização concluída! ${unique.length} serviços importados e PUBLICADOS no site (${impCount} novos, ${updCount} atualizados).`, 'success');
    showToast('success', `Sucesso! ${unique.length} serviços da API [${api.name}] foram enviados e já estão visíveis no site público!`);
    fetchApiBalanceLive(api.id, false);

    // Rolar até a tabela de migração
    document.querySelector('.admin-main')?.scrollTo({ top: 750, behavior: 'smooth' });
  } else {
    logApiTerminal(`Falha ao obter lista de serviços da API [${api.name}]: ${lastError || 'Nenhum serviço retornado pelo servidor.'}`, 'error');
    showToast('error', `Erro na API: ${lastError || 'Não foi possível puxar os serviços.'}`);
  }
}

function renderApisTable() {
  const tbody = document.getElementById('admin-apis-tbody');
  const countEl = document.getElementById('apis-total-count');
  if (!tbody) return;

  const apis = window.SSB.getApis();
  if (countEl) countEl.textContent = apis.length;

  if (apis.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhuma API cadastrada. Use o formulário acima para adicionar uma nova API.</td></tr>`;
    return;
  }

  tbody.innerHTML = apis.map(api => {
    const isEnabled = api.status === 'Habilitado';
    const statusBadge = isEnabled
      ? `<span class="order-badge-status badge-completed" style="font-size: 0.75rem;">Habilitado</span>`
      : `<span class="order-badge-status badge-pending" style="font-size: 0.75rem;">Desabilitado</span>`;

    const apiColor = api.color || '#8b5cf6';
    const hasBalance = api.balance !== undefined && api.balance !== null && !isNaN(api.balance);
    const balanceText = hasBalance ? `${api.currency || 'USD'} ${Number(api.balance).toFixed(2)}` : (api.balanceError ? 'Verificar' : '--');
    const balanceColor = hasBalance ? '#00ff88' : (api.balanceError ? 'var(--accent-red)' : 'var(--text-muted)');

    return `
      <tr>
        <td style="text-align: center;">
          <div style="width: 22px; height: 22px; border-radius: 50%; background: ${apiColor}; border: 2px solid rgba(255,255,255,0.25); display: inline-block; box-shadow: 0 0 8px ${apiColor}88;"></div>
        </td>
        <td>
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${escapeHtml(api.name)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">ID: ${escapeHtml(api.id)}</div>
        </td>
        <td>
          <span class="order-badge-status badge-processing" style="font-size: 0.75rem;">
            ${escapeHtml(api.type || 'DHRU')}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(api.url)}">
          ${escapeHtml(api.url)}
        </td>
        <td style="font-family: var(--font-mono); font-size: 0.82rem; color: #cbd5e1;">
          ${escapeHtml(api.username)}
        </td>
        <!-- Saldo em Tempo Real -->
        <td style="text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(0, 255, 136, 0.08); border: 1px solid rgba(0, 255, 136, 0.25); padding: 0.3rem 0.75rem; border-radius: 20px;">
            <i class="fa-solid fa-wallet" style="color: #00ff88; font-size: 0.75rem;"></i>
            <span id="api-bal-text-${api.id}" class="mono" style="font-weight: 700; color: ${balanceColor}; font-size: 0.85rem;">
              ${balanceText}
            </span>
            <button type="button" onclick="fetchApiBalanceLive('${api.id}', true)" title="Sincronizar saldo de ${escapeHtml(api.name)} em tempo real" style="background: none; border: none; color: var(--accent-cyan); cursor: pointer; padding: 2px; display: inline-flex; align-items: center;">
              <i class="fa-solid fa-arrows-rotate" id="api-bal-spin-${api.id}" style="font-size: 0.75rem;"></i>
            </button>
          </div>
        </td>
        <td style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
            <!-- Botão Azul: Sincronizar Serviços (Idêntico ao solicitado) -->
            <button type="button" onclick="syncServicesFromApi('${api.id}')" title="Sincronizar e Puxar Serviços de ${escapeHtml(api.name)}" style="background: #0284c7; color: #fff; border: none; border-radius: 9px; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s, background 0.15s; box-shadow: 0 3px 10px rgba(2, 132, 199, 0.4);">
              <i class="fa-solid fa-arrows-rotate" style="font-size: 1.05rem;"></i>
            </button>

            <!-- Botão Roxo: Editar API (Idêntico ao solicitado) -->
            <button type="button" onclick="editApiItem('${api.id}')" title="Editar Configurações da API ${escapeHtml(api.name)}" style="background: #8b5cf6; color: #fff; border: none; border-radius: 9px; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s, background 0.15s; box-shadow: 0 3px 10px rgba(139, 92, 246, 0.4);">
              <i class="fa-solid fa-pencil" style="font-size: 1.05rem;"></i>
            </button>

            <!-- Botão Excluir -->
            <button type="button" onclick="deleteApiItem('${api.id}')" title="Excluir API" style="background: rgba(255, 0, 85, 0.15); color: var(--accent-red); border: 1px solid rgba(255, 0, 85, 0.3); border-radius: 9px; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s;">
              <i class="fa-solid fa-trash" style="font-size: 0.95rem;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Consulta saldo em tempo real na API do fornecedor
async function fetchApiBalanceLive(apiId, showFeedback = false) {
  const apis = window.SSB.getApis();
  const api = (apiId ? apis.find(a => a.id === apiId) : null) || apis.find(a => a.status === 'Habilitado') || apis[0];
  if (!api || !api.url || !api.apiKey) {
    if (showFeedback) showToast('warning', 'Configure a URL e a API Key da API primeiro.');
    return null;
  }

  const spinEl = document.getElementById(`api-bal-spin-${api.id}`);
  const headerSpin = document.getElementById('header-api-balance-spin');
  const dashSpin = document.getElementById('dash-api-balance-spin');

  if (spinEl) spinEl.classList.add('fa-spin');
  if (headerSpin) headerSpin.classList.add('fa-spin');
  if (dashSpin) dashSpin.classList.add('fa-spin');

  try {
    let url = api.url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    if (/\/public\/?$/i.test(url)) url = url.replace(/\/public\/?$/i, '/public/api/index.php');

    const response = await fetch('/api/proxy-dhru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url,
        username: api.username,
        apiKey: api.apiKey,
        action: 'accountinfo',
        provider: (api.type || '').toLowerCase().includes('gsm') ? 'gsmserver' : 'dhru'
      })
    });

    const resData = await response.json().catch(() => null);

    if (resData && resData.success && resData.credit !== undefined && resData.credit !== null && !isNaN(parseFloat(resData.credit))) {
      api.balance = parseFloat(resData.credit);
      api.currency = resData.currency || 'USD';
      api.balanceUpdatedAt = new Date().toISOString();
      delete api.balanceError;
      window.SSB.saveApi(api);

      updateBalanceDisplays(api);
      if (showFeedback) {
        showToast('success', `Saldo em tempo real: ${api.currency} ${api.balance.toFixed(2)} em [${api.name}]`);
        logApiTerminal(`Saldo atualizado com sucesso em [${api.name}]: ${api.currency} ${api.balance.toFixed(2)}`, 'success');
      }
      return api;
    } else {
      const err = (resData && resData.error) || 'Não foi possível ler o saldo na resposta da API';
      api.balanceError = err;
      window.SSB.saveApi(api);
      if (showFeedback) {
        showToast('error', `Aviso de saldo: ${err}`);
        logApiTerminal(`Consulta de saldo na API [${api.name}]: ${err}`, 'warn');
      }
      updateBalanceDisplays(api, err);
      return null;
    }
  } catch (e) {
    console.warn('Erro ao consultar saldo da API:', e);
    if (showFeedback) showToast('error', `Falha de rede ao consultar saldo: ${e.message}`);
    updateBalanceDisplays(api, e.message);
    return null;
  } finally {
    if (spinEl) spinEl.classList.remove('fa-spin');
    if (headerSpin) headerSpin.classList.remove('fa-spin');
    if (dashSpin) dashSpin.classList.remove('fa-spin');
  }
}

function refreshMainApiBalance(showFeedback = false) {
  const apis = window.SSB.getApis();
  const activeApi = apis.find(a => a.status === 'Habilitado') || apis[0];
  if (!activeApi) return;
  return fetchApiBalanceLive(activeApi.id, showFeedback);
}

function updateBalanceDisplays(api, errorMsg) {
  const headerVal = document.getElementById('header-api-balance-val');
  const dashVal = document.getElementById('dash-api-balance');
  const dashName = document.getElementById('dash-api-balance-name');
  const rowBal = document.getElementById(`api-bal-text-${api ? api.id : ''}`);

  if (api && api.balance !== undefined && api.balance !== null && !isNaN(api.balance)) {
    const formatted = `${api.currency || 'USD'} ${Number(api.balance).toFixed(2)}`;
    if (headerVal) {
      headerVal.textContent = formatted;
      headerVal.style.color = '#00ff88';
      headerVal.title = `Última consulta: ${api.balanceUpdatedAt ? new Date(api.balanceUpdatedAt).toLocaleTimeString() : 'Agora'} (${api.name})`;
    }
    if (dashVal) {
      dashVal.textContent = formatted;
      dashVal.style.color = '#00ff88';
    }
    if (dashName) {
      dashName.textContent = `Saldo na API [${api.name}]`;
    }
    if (rowBal) {
      rowBal.textContent = formatted;
      rowBal.style.color = '#00ff88';
    }
  } else if (errorMsg) {
    if (headerVal && (!api || api.balance === undefined)) {
      headerVal.textContent = 'Verificar';
      headerVal.style.color = 'var(--accent-red)';
      headerVal.title = errorMsg;
    }
    if (dashVal && (!api || api.balance === undefined)) {
      dashVal.textContent = 'Verificar';
      dashVal.style.color = 'var(--accent-red)';
    }
    if (rowBal) {
      rowBal.textContent = 'Verificar';
      rowBal.style.color = 'var(--accent-red)';
    }
  }
}

// Monitoramento automático de saldo em tempo real a cada 60 segundos
setInterval(() => {
  if (sessionStorage.getItem(AUTH_SESSION_KEY) === 'true') {
    refreshMainApiBalance(false);
  }
}, 60000);

function renderApiSyncView() {
  renderApisTable();

  // Se ainda não tiver serviços carregados na memória, carregar catálogo de atacado homologado
  if (!apiCachedServices || apiCachedServices.length === 0) {
    loadWholesalePresetServices(false);
  } else {
    renderApiServicesTable(apiCachedServices);
  }
}

async function testDhruApiConnection() {
  const urlInput = document.getElementById('dhru-api-url');
  let url = (urlInput?.value || '').trim();
  const username = document.getElementById('dhru-api-username')?.value.trim();
  const apiKey = document.getElementById('dhru-api-key')?.value.trim();

  if (!url || !apiKey) {
    showToast('warning', 'Preencha a URL da API e a Chave de Acesso para testar.');
    logApiTerminal('Preencha a URL da API e a API Key antes de testar a conexão.', 'warn');
    return;
  }

  // Auto-completar https:// se o usuário digitou sem protocolo
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // Se o usuário digitou /public ou esqueceu /api/index.php
  if (/\/public\/?$/i.test(url)) {
    url = url.replace(/\/public\/?$/i, '/public/api/index.php');
  } else if (!url.includes('.php') && !url.includes('/api/')) {
    if (url.includes('conectproo.com')) {
      url = url.replace(/\/+$/, '') + '/public/api/index.php';
    }
  }
  if (urlInput) urlInput.value = url;

  const provider = document.getElementById('dhru-api-provider')?.value || 'dhru';
  logApiTerminal(`Iniciando teste de conexão na API: ${url}...`, 'info');
  showToast('info', 'Verificando conexão e seguindo redirecionamentos HTTP...');

  try {
    const response = await fetch('/api/proxy-dhru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url,
        username: username,
        apiKey: apiKey,
        action: 'accountinfo',
        provider: provider
      })
    });

    const data = await response.json().catch(() => null);

    if (data && data.success) {
      if (data.source && urlInput && data.source !== url) {
        urlInput.value = data.source;
        logApiTerminal(`Redirecionamento seguido com sucesso: URL atualizada para ${data.source}`, 'info');
      }

      logApiTerminal(`Conexão com a API estabelecida com sucesso! Acesso validado no servidor.`, 'success');
      showToast('success', 'Conexão com a API estabelecida com sucesso!');
      const badge = document.getElementById('api-connection-badge');
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> API Autenticada';
        badge.style.borderColor = 'rgba(0, 255, 136, 0.4)';
        badge.style.color = 'var(--accent-green)';
      }
    } else {
      // Se a ação accountinfo falhou, tentar validar através de serverservicelist ou imeiservicelist
      logApiTerminal(`Tentativa com 'accountinfo' retornou aviso. Verificando via 'serverservicelist' e 'imeiservicelist'...`, 'info');
      
      let verifiedOk = false;
      let finalErrMsg = data ? data.error : 'Falha na resposta';

      for (const testAct of ['serverservicelist', 'imeiservicelist']) {
        try {
          const retryResponse = await fetch('/api/proxy-dhru', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: url,
              username: username,
              apiKey: apiKey,
              action: testAct,
              provider: provider
            })
          });

          const retryData = await retryResponse.json().catch(() => null);

          if (retryData && retryData.success) {
            if (retryData.source && urlInput && retryData.source !== url) {
              urlInput.value = retryData.source;
            }
            logApiTerminal(`Conexão com a API estabelecida com sucesso via [${testAct}]!`, 'success');
            showToast('success', 'Conexão com a API autenticada com sucesso!');
            const badge = document.getElementById('api-connection-badge');
            if (badge) {
              badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> API Autenticada';
              badge.style.borderColor = 'rgba(0, 255, 136, 0.4)';
              badge.style.color = 'var(--accent-green)';
            }
            verifiedOk = true;
            break;
          } else if (retryData && retryData.error) {
            finalErrMsg = retryData.error;
          }
        } catch (e) {}
      }

      if (!verifiedOk) {
        logApiTerminal(`Resposta do servidor: ${finalErrMsg}`, 'error');
        showToast('error', `Erro na API: ${finalErrMsg}`);
      }
    }
  } catch (err) {
    console.warn("DHRU Connection test:", err);
    logApiTerminal(`Falha ao conectar com o gateway da API: ${err.message}`, 'error');
    showToast('error', 'Falha ao testar conexão.');
  }
}

async function pullServicesFromLiveApi() {
  const urlInput = document.getElementById('dhru-api-url');
  let url = (urlInput?.value || '').trim();
  const username = document.getElementById('dhru-api-username')?.value.trim();
  const apiKey = document.getElementById('dhru-api-key')?.value.trim();
  const provider = document.getElementById('dhru-api-provider')?.value || 'dhru';

  if (!url || !apiKey) {
    showToast('warning', 'Configure e salve a URL e a Chave da API primeiro.');
    logApiTerminal('URL ou API Key não informadas. Preencha os campos da API.', 'warn');
    return;
  }

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  if (/\/public\/?$/i.test(url)) {
    url = url.replace(/\/public\/?$/i, '/public/api/index.php');
  } else if (!url.includes('.php') && !url.includes('/api/')) {
    if (url.includes('conectproo.com')) {
      url = url.replace(/\/+$/, '') + '/public/api/index.php';
    }
  }
  if (urlInput) urlInput.value = url;

  logApiTerminal(`Consultando lista de serviços via proxy seguro em ${url}...`, 'info');
  showToast('info', 'Consultando serviços no servidor atacadista...');

  let pulledServices = [];
  let lastError = '';

  try {
    logApiTerminal(`Consultando catálogo completo na API via proxy em ${url}...`, 'info');
    const response = await fetch('/api/proxy-dhru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url,
        username: username,
        apiKey: apiKey,
        action: 'get_all_services',
        provider: provider
      })
    });

    const resData = await response.json().catch(() => null);

    if (resData && resData.source && urlInput && resData.source !== url) {
      urlInput.value = resData.source;
      url = resData.source;
    }

    if (resData && resData.success && Array.isArray(resData.services) && resData.services.length > 0) {
      pulledServices = resData.services;
      logApiTerminal(`Sucesso! ${resData.services.length} serviços encontrados no fornecedor.`, 'success');
    } else if (resData && !resData.success && resData.error) {
      lastError = resData.error;
    }
  } catch (e) {
    console.warn(`Erro na ação get_all_services:`, e);
    lastError = e.message;
  }

  // Deduplicar serviços por ID ou Nome se alguma ação repetiu
  if (pulledServices.length > 0) {
    const seen = new Set();
    const unique = [];
    for (const s of pulledServices) {
      const key = `${s.id}-${s.name.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    }

    const detectedCurrency = resData.currency || (url.includes('conectproo') ? 'BRL' : 'USD');
    const settings = window.SSB.getSettings();
    const usdRate = settings.usdRate || 5.65;
    const margin = getActiveApiProfitMargin();

    unique.forEach(s => {
      s.serverApi = 'API GSM Direta';
      s.apiName = 'API GSM Direta';
      s.currency = s.currency || detectedCurrency;
      const raw = typeof s.rawCost === 'number' ? s.rawCost : (parseFloat(s.cost) || parseFloat(s.costUSD) || 0);
      s.rawCost = raw;
      if (s.currency === 'BRL') {
        s.costBRL = raw;
        s.costUSD = parseFloat((raw / usdRate).toFixed(4));
      } else {
        s.costUSD = raw;
        s.costBRL = parseFloat((raw * usdRate).toFixed(2));
      }
      s.profitMargin = margin;
      s.priceBRL = parseFloat((s.costBRL * (1 + margin / 100)).toFixed(2));
    });

    apiCachedServices = unique;
    selectedApiServiceIds.clear();
    apiCachedServices.forEach(s => selectedApiServiceIds.add(s.id));

    // Publicar automaticamente todos os serviços puxados diretamente no catálogo do site público
    const importResult = window.SSB.importServicesToCatalog(unique, margin);

    try { renderServicesListTable(); } catch (e) {}
    try { renderServicesTable(); } catch (e) {}
    renderApiServicesTable(apiCachedServices);

    const impCount = importResult.importedCount !== undefined ? importResult.importedCount : (importResult.imported || 0);
    const updCount = importResult.updatedCount !== undefined ? importResult.updatedCount : (importResult.updated || 0);

    const badge = document.getElementById('api-connection-badge');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${unique.length} Serviços Publicados no Site`;
      badge.style.borderColor = 'rgba(0, 255, 136, 0.4)';
      badge.style.color = 'var(--accent-green)';
    }

    logApiTerminal(`Busca concluída! ${unique.length} serviços carregados e PUBLICADOS no catálogo público (${impCount} novos, ${updCount} atualizados).`, 'success');
    showToast('success', `${unique.length} serviços reais puxados da API e enviados para o site público!`);
    return;
  }

  // Se não retornou nenhum serviço das ações
  logApiTerminal(`Não foi possível puxar serviços automaticamente da sua API: ${lastError || 'Nenhum serviço retornado pelo servidor'}.`, 'error');
  showToast('error', `Falha ao puxar da API: ${lastError || 'Verifique usuário, API Key e se seu IP está liberado no provedor'}`);
}

function processPastedJsonServices(jsonText) {
  if (!jsonText || !jsonText.trim()) {
    showToast('warning', 'Cole o JSON ou texto da resposta da API.');
    return;
  }

  try {
    let parsed = JSON.parse(jsonText.trim());
    let list = [];

    // Se for array de serviços direto
    if (Array.isArray(parsed)) {
      list = parsed.map((s, idx) => ({
        id: String(s.SERVICEID || s.id || `custom-${idx + 1}`),
        name: String(s.SERVICENAME || s.name || 'Serviço GSM').trim(),
        category: s.category || (String(s.name || '').toLowerCase().includes('credit') ? 'credits' : 'tools'),
        categoryLabel: s.categoryLabel || 'Ferramentas & Dongles',
        costUSD: parseFloat(s.CREDIT || s.costUSD || s.price || s.cost || 0),
        time: s.TIME || s.deliveryTime || '1-24 Horas',
        description: s.description || s.INFO || 'Importado via JSON da API'
      }));
    } else if (typeof parsed === 'object') {
      // Formato DHRU SUCCESS
      const block = parsed.SUCCESS || parsed.services || parsed;
      if (Array.isArray(block)) {
        for (const grp of block) {
          const svcs = grp.SERVICES || grp.services || [grp];
          if (Array.isArray(svcs)) {
            for (const s of svcs) {
              if (s.SERVICENAME || s.name) {
                list.push({
                  id: String(s.SERVICEID || s.id || `dhru-${list.length + 1}`),
                  name: String(s.SERVICENAME || s.name).trim(),
                  category: String(s.SERVICENAME || '').toLowerCase().includes('credit') ? 'credits' : 'tools',
                  categoryLabel: 'Ferramentas & Dongles',
                  costUSD: parseFloat(s.CREDIT || s.costUSD || s.price || 0),
                  time: s.TIME || '1-24 Horas',
                  description: s.INFO || 'Importado via JSON DHRU'
                });
              }
            }
          }
        }
      }
    }

    if (list.length === 0) {
      showToast('warning', 'Nenhum serviço identificado no formato colado.');
      return;
    }

    apiCachedServices = list;
    selectedApiServiceIds.clear();
    apiCachedServices.forEach(s => selectedApiServiceIds.add(s.id));

    renderApiServicesTable(apiCachedServices);
    closeModal('modal-paste-json');
    logApiTerminal(`JSON processado com sucesso! ${list.length} serviços carregados na tabela de migração.`, 'success');
    showToast('success', `${list.length} serviços carregados do JSON! Escolha e clique em Migrar.`);
  } catch (err) {
    showToast('error', 'O texto colado não é um JSON válido. Verifique a formatação.');
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

let apiServicesPage = 1;
const apiServicesPageSize = 40;

function changeApiServicesPage(delta) {
  apiServicesPage += delta;
  filterApiServicesTable();
}

// Helper para obter margem ativa configurada pelo usuário (suporta 0% para vender a preço de custo)
function getActiveApiProfitMargin(api) {
  const marginInput = document.getElementById('api-profit-margin-control');
  if (marginInput && marginInput.value !== '' && !isNaN(Number(marginInput.value))) {
    return Math.max(0, Number(marginInput.value));
  }
  if (api && api.profitMargin !== undefined && api.profitMargin !== null && !isNaN(Number(api.profitMargin))) {
    return Math.max(0, Number(api.profitMargin));
  }
  const settings = window.SSB.getSettings();
  if (settings.dhruProfitMargin !== undefined && !isNaN(Number(settings.dhruProfitMargin))) {
    return Math.max(0, Number(settings.dhruProfitMargin));
  }
  return 30;
}

function updateApiProfitMarginControl(val) {
  const margin = isNaN(Number(val)) ? 0 : Math.max(0, Number(val));
  const marginInput = document.getElementById('api-profit-margin-control');
  if (marginInput) marginInput.value = margin;
  filterApiServicesTable();
}

function setApiMarginZero() {
  const marginInput = document.getElementById('api-profit-margin-control');
  if (marginInput) marginInput.value = 0;
  updateApiProfitMarginControl(0);
  showToast('info', 'Margem 0% ativada: Os serviços serão importados pelo Custo Exato da API!');
}

let apiFilterSearchDebounceTimer = null;
function onApiSearchFilterInput() {
  clearTimeout(apiFilterSearchDebounceTimer);
  apiFilterSearchDebounceTimer = setTimeout(() => {
    apiServicesPage = 1;
    filterApiServicesTable();
  }, 150);
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
  const activeMargin = getActiveApiProfitMargin();

  const totalCount = services.length;
  if (totalCountEl) totalCountEl.textContent = totalCount;

  if (totalCount === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 0.75rem; color: var(--accent-yellow); display: block;"></i>
          Nenhum serviço encontrado com os filtros atuais.
        </td>
      </tr>
    `;
    const pageInfoEl = document.getElementById('api-services-page-info');
    if (pageInfoEl) pageInfoEl.textContent = '0 - 0 de 0';
    updateApiSelectedCount();
    return;
  }

  // Paginação ultra-rápida (40 itens por página)
  const totalPages = Math.ceil(totalCount / apiServicesPageSize) || 1;
  if (apiServicesPage > totalPages) apiServicesPage = totalPages;
  if (apiServicesPage < 1) apiServicesPage = 1;
  const startIdx = (apiServicesPage - 1) * apiServicesPageSize;
  const pageServices = services.slice(startIdx, startIdx + apiServicesPageSize);

  // Atualizar controles da paginação
  const pageInfoEl = document.getElementById('api-services-page-info');
  if (pageInfoEl) pageInfoEl.textContent = `${startIdx + 1} - ${Math.min(startIdx + apiServicesPageSize, totalCount)} de ${totalCount}`;
  const currPageEl = document.getElementById('api-services-current-page');
  if (currPageEl) currPageEl.textContent = `Pág ${apiServicesPage} de ${totalPages}`;
  const prevBtn = document.getElementById('btn-api-services-prev');
  if (prevBtn) prevBtn.disabled = apiServicesPage <= 1;
  const nextBtn = document.getElementById('btn-api-services-next');
  if (nextBtn) nextBtn.disabled = apiServicesPage >= totalPages;

  tbody.innerHTML = pageServices.map(s => {
    const isSelected = selectedApiServiceIds.has(s.id);
    const isAlreadyImported = existingNames.has(s.name.trim().toLowerCase()) || existingApis.has(s.id.toLowerCase());

    const isBrl = s.currency === 'BRL' || (!s.currency && s.serverApi && s.serverApi.toLowerCase().includes('conectproo'));
    const rawCost = typeof s.rawCost === 'number' ? s.rawCost : (parseFloat(s.cost) || parseFloat(s.costUSD) || 0);
    const costBRL = typeof s.costBRL === 'number' ? s.costBRL : (isBrl ? rawCost : parseFloat((rawCost * usdRate).toFixed(2)));
    const costUSD = typeof s.costUSD === 'number' ? s.costUSD : (isBrl ? parseFloat((rawCost / usdRate).toFixed(4)) : rawCost);

    const profitMargin = activeMargin;
    const finalPriceBRL = parseFloat((costBRL * (1 + profitMargin / 100)).toFixed(2));

    const categoryBadgeClass = s.category === 'tools' ? 'badge-processing' : (s.category === 'imei' ? 'badge-completed' : 'badge-pending');
    const wholesaleDisplay = isBrl ? `R$ ${rawCost.toFixed(2)}` : `$ ${costUSD.toFixed(2)}`;

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
        <td class="mono" style="color: #ffd700; font-weight: 600;" title="Custo original do provedor">${wholesaleDisplay}</td>
        <td class="mono" style="color: var(--text-secondary);" title="Custo convertido para Real">R$ ${costBRL.toFixed(2)}</td>
        <td>
          <span style="font-size: 0.8rem; background: ${profitMargin === 0 ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 255, 136, 0.1)'}; color: ${profitMargin === 0 ? 'var(--accent-cyan)' : 'var(--accent-green)'}; padding: 0.15rem 0.45rem; border-radius: var(--radius-sm); font-weight: 700;">
            ${profitMargin === 0 ? 'Custo Puro (0%)' : '+' + profitMargin + '%'}
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

  const margin = getActiveApiProfitMargin();
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
  const margin = getActiveApiProfitMargin();

  logApiTerminal(`Migrando ${itemsToMigrate.length} serviços selecionados com margem de ${margin}% para o catálogo...`, 'info');

  const result = window.SSB.importServicesToCatalog(itemsToMigrate, margin);

  const importedCount = result.importedCount !== undefined ? result.importedCount : (result.imported || 0);
  const updatedCount = result.updatedCount !== undefined ? result.updatedCount : (result.updated || 0);
  showToast('success', `Sucesso! ${importedCount} novos serviços adicionados e ${updatedCount} atualizados no site!`);
  logApiTerminal(`Migração concluída com sucesso! ${importedCount} novos serviços e ${updatedCount} atualizados. Já visíveis no catálogo da loja.`, 'success');

  renderApiServicesTable(apiCachedServices);
  renderServicesTable();
}

// Publica TODOS os serviços da API diretamente para o site público
async function sendAllPulledServicesToPublicSite() {
  if (!apiCachedServices || apiCachedServices.length === 0) {
    const apis = window.SSB.getApis();
    const activeApi = apis.find(a => a.status === 'Habilitado') || apis[0];
    if (activeApi) {
      showToast('info', `Puxando e enviando catálogo completo da API [${activeApi.name}] para o site público...`);
      return syncServicesFromApi(activeApi.id);
    }
    showToast('warning', 'Nenhum serviço carregado na memória. Sincronize a API primeiro.');
    return;
  }

  const margin = getActiveApiProfitMargin();

  logApiTerminal(`Publicando ${apiCachedServices.length} serviços com margem de ${margin}% no catálogo do site público...`, 'info');

  const result = window.SSB.importServicesToCatalog(apiCachedServices, margin);

  try { renderServicesListTable(); } catch (e) {}
  try { renderServicesTable(); } catch (e) {}
  renderApiServicesTable(apiCachedServices);

  const impCount = result.importedCount !== undefined ? result.importedCount : (result.imported || 0);
  const updCount = result.updatedCount !== undefined ? result.updatedCount : (result.updated || 0);

  showToast('success', `Sucesso! ${apiCachedServices.length} serviços foram enviados para a loja pública (${impCount} novos, ${updCount} atualizados)!`);
  logApiTerminal(`Publicação concluída! ${apiCachedServices.length} serviços agora estão disponíveis para venda no site público.`, 'success');
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

// ==========================================
// SEÇÃO: GERENCIAR SERVIÇOS & GRUPOS (FOTOS 1, 2, 3, 4)
// ==========================================

let selectedServicesListIds = new Set();
let servicesListPage = 1;
const servicesListPageSize = 40;

function changeServicesListPage(delta) {
  servicesListPage += delta;
  renderServicesListTable();
}

let servicesListSearchDebounceTimer = null;
function onServicesSearchInput() {
  clearTimeout(servicesListSearchDebounceTimer);
  servicesListSearchDebounceTimer = setTimeout(() => {
    servicesListPage = 1;
    renderServicesListTable();
  }, 150);
}

function renderServicesListTable() {
  const tbody = document.getElementById('services-list-tbody');
  if (!tbody) return;

  const services = window.SSB.getServices();
  const groups = window.SSB.getGroups();
  const apis = window.SSB.getApis ? window.SSB.getApis() : [];

  // 1. Atualizar dropdowns de grupos e APIs apenas se estiverem vazios para não recriar DOM
  const bulkGroupSelect = document.getElementById('services-bulk-group-select');
  if (bulkGroupSelect && bulkGroupSelect.options.length <= 1) {
    bulkGroupSelect.innerHTML = '<option value="">Selecionar Grupo</option>' +
      groups.map(g => `<option value="${escapeHtml(g.name)}">${escapeHtml(g.name)}</option>`).join('');
  }

  const groupFilterSelect = document.getElementById('services-group-filter');
  if (groupFilterSelect && groupFilterSelect.options.length <= 1) {
    groupFilterSelect.innerHTML = '<option value="all">Todos os Grupos</option>' +
      groups.map(g => `<option value="${escapeHtml(g.name)}">${escapeHtml(g.name)}</option>`).join('');
  }

  const apiFilterSelect = document.getElementById('services-api-filter');
  if (apiFilterSelect && apiFilterSelect.options.length <= 1) {
    apiFilterSelect.innerHTML = '<option value="all">Todas APIs</option>' +
      apis.map(a => `<option value="${escapeHtml(a.name)}">${escapeHtml(a.name)} (${escapeHtml(a.type)})</option>`).join('');
  }

  // 2. Aplicar Filtros
  const search = (document.getElementById('services-search-filter')?.value || '').toLowerCase().trim();
  const apiFilter = document.getElementById('services-api-filter')?.value || 'all';
  const typeFilter = document.getElementById('services-type-filter')?.value || 'all';
  const groupFilter = document.getElementById('services-group-filter')?.value || 'all';

  const filtered = services.filter(s => {
    // Busca por texto
    if (search) {
      const matchName = s.name && s.name.toLowerCase().includes(search);
      const matchDesc = s.description && s.description.toLowerCase().includes(search);
      const matchId = s.id && s.id.toLowerCase().includes(search);
      const matchApi = (s.apiName || s.serverApi) && (s.apiName || s.serverApi).toLowerCase().includes(search);
      if (!matchName && !matchDesc && !matchId && !matchApi) return false;
    }

    // Filtro por API
    if (apiFilter !== 'all') {
      const sApi = s.apiName || s.serverApi || '';
      if (sApi.toLowerCase() !== apiFilter.toLowerCase()) return false;
    }

    // Filtro por Tipo / Categoria
    if (typeFilter !== 'all') {
      if (s.category !== typeFilter) return false;
    }

    // Filtro por Grupo
    if (groupFilter !== 'all') {
      const sGroup = s.group || s.categoryLabel || '';
      if (sGroup.toLowerCase() !== groupFilter.toLowerCase()) return false;
    }

    return true;
  });

  const totalCount = filtered.length;

  if (totalCount === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-wrench" style="font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.4; display: block;"></i>
          Nenhum serviço cadastrado encontrado com os filtros aplicados.
        </td>
      </tr>
    `;
    const pageInfo = document.getElementById('services-page-info');
    if (pageInfo) pageInfo.textContent = '0 - 0 de 0';
    return;
  }

  // Paginação inteligente de 40 itens por página
  const totalPages = Math.ceil(totalCount / servicesListPageSize) || 1;
  if (servicesListPage > totalPages) servicesListPage = totalPages;
  if (servicesListPage < 1) servicesListPage = 1;
  const startIdx = (servicesListPage - 1) * servicesListPageSize;
  const pageItems = filtered.slice(startIdx, startIdx + servicesListPageSize);

  // Atualizar controles da paginação
  const pageInfo = document.getElementById('services-page-info');
  if (pageInfo) pageInfo.textContent = `${startIdx + 1} - ${Math.min(startIdx + servicesListPageSize, totalCount)} de ${totalCount}`;
  const currPage = document.getElementById('services-current-page');
  if (currPage) currPage.textContent = `Pág ${servicesListPage} de ${totalPages}`;
  const prevBtn = document.getElementById('btn-services-prev');
  if (prevBtn) prevBtn.disabled = servicesListPage <= 1;
  const nextBtn = document.getElementById('btn-services-next');
  if (nextBtn) nextBtn.disabled = servicesListPage >= totalPages;

  tbody.innerHTML = pageItems.map(s => {
    const isChecked = selectedServicesListIds.has(s.id);
    const cost = (typeof s.costBRL === 'number' ? s.costBRL : parseFloat(s.costBRL) || s.priceBRL || 0).toFixed(2);
    const groupName = s.group || s.categoryLabel || 'Sem Grupo';
    const apiName = s.apiName || s.serverApi || 'DHRU / GSM';
    const categoryName = s.categoryLabel || s.category || 'Ferramentas';
    const isActive = s.status !== 'inactive';

    return `
      <tr style="${isChecked ? 'background: rgba(37, 99, 235, 0.08);' : ''}">
        <td style="text-align: center;">
          <input type="checkbox" class="services-list-cb" data-id="${s.id}" ${isChecked ? 'checked' : ''} onchange="toggleSingleServiceListCheckbox('${s.id}', this.checked)" style="width: 17px; height: 17px; accent-color: #2563eb; cursor: pointer;">
        </td>
        <td>
          <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">${escapeHtml(s.name)}</div>
          ${s.badge ? `<span style="font-size: 0.7rem; background: rgba(0, 240, 255, 0.15); color: var(--accent-cyan); border: 1px solid rgba(0, 240, 255, 0.3); padding: 1px 6px; border-radius: 4px; font-weight: 700;">${escapeHtml(s.badge)}</span>` : ''}
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #94a3b8;">${escapeHtml(apiName)}</span>
        </td>
        <td>
          <span style="background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.35); font-size: 0.78rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; display: inline-block;">
            ${escapeHtml(groupName)}
          </span>
        </td>
        <td>
          <span style="font-size: 0.82rem; color: #cbd5e1;">${escapeHtml(categoryName)}</span>
        </td>
        <td>
          <span class="mono" style="color: var(--accent-cyan); font-weight: 700;">R$ ${cost}</span>
        </td>
        <td>
          <span onclick="toggleServiceActiveStatus('${s.id}')" style="cursor: pointer; font-size: 0.76rem; font-weight: 800; color: ${isActive ? 'var(--accent-green)' : 'var(--accent-red)'}; background: ${isActive ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255, 0, 85, 0.12)'}; border: 1px solid ${isActive ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 0, 85, 0.3)'}; padding: 3px 8px; border-radius: 4px; display: inline-block;" title="Clique para ativar/desativar">
            ${isActive ? 'ATIVO' : 'INATIVO'}
          </span>
        </td>
        <td style="text-align: center;">
          <div class="action-btn-group" style="justify-content: center;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="editService('${s.id}')" title="Editar">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="deleteService('${s.id}')" style="color: var(--accent-red);" title="Remover">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Atualizar master checkbox
  const masterCheck = document.getElementById('services-check-all');
  if (masterCheck) {
    const allChecked = filtered.length > 0 && filtered.every(s => selectedServicesListIds.has(s.id));
    masterCheck.checked = allChecked;
  }
}

function toggleSingleServiceListCheckbox(serviceId, checked) {
  if (checked) selectedServicesListIds.add(serviceId);
  else selectedServicesListIds.delete(serviceId);
  renderServicesListTable();
}

function toggleSelectAllServicesList(checked) {
  const services = window.SSB.getServices();
  const search = (document.getElementById('services-search-filter')?.value || '').toLowerCase().trim();
  const apiFilter = document.getElementById('services-api-filter')?.value || 'all';
  const typeFilter = document.getElementById('services-type-filter')?.value || 'all';
  const groupFilter = document.getElementById('services-group-filter')?.value || 'all';

  const visible = services.filter(s => {
    if (search && !(s.name && s.name.toLowerCase().includes(search))) return false;
    if (apiFilter !== 'all' && (s.apiName || s.serverApi || '').toLowerCase() !== apiFilter.toLowerCase()) return false;
    if (typeFilter !== 'all' && s.category !== typeFilter) return false;
    if (groupFilter !== 'all' && (s.group || s.categoryLabel || '').toLowerCase() !== groupFilter.toLowerCase()) return false;
    return true;
  });

  visible.forEach(s => {
    if (checked) selectedServicesListIds.add(s.id);
    else selectedServicesListIds.delete(s.id);
  });

  renderServicesListTable();
}

function toggleServiceActiveStatus(serviceId) {
  const services = window.SSB.getServices();
  const target = services.find(s => s.id === serviceId);
  if (!target) return;

  target.status = target.status === 'inactive' ? 'active' : 'inactive';
  window.SSB.saveServices(services);

  if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
    window.SSB_Supabase.upsertService(target).catch(e => console.warn(e));
  }

  showToast('info', `Serviço "${target.name}" marcado como ${target.status.toUpperCase()}`);
  renderServicesListTable();
  renderServicesTable();
}

function applyBulkGroupToSelected() {
  const groupName = document.getElementById('services-bulk-group-select')?.value;
  if (!groupName) {
    showToast('warning', 'Selecione um grupo no dropdown antes de aplicar.');
    return;
  }

  let targetIds = Array.from(selectedServicesListIds);
  if (targetIds.length === 0) {
    const services = window.SSB.getServices();
    const search = (document.getElementById('services-search-filter')?.value || '').toLowerCase().trim();
    const visible = services.filter(s => !search || (s.name && s.name.toLowerCase().includes(search)));
    if (visible.length === 0) {
      showToast('warning', 'Nenhum serviço disponível para aplicar grupo.');
      return;
    }
    if (!confirm(`Nenhum serviço marcado individualmente. Deseja aplicar o grupo "${groupName}" a TODOS os ${visible.length} serviços filtrados na tela?`)) {
      return;
    }
    targetIds = visible.map(s => s.id);
  }

  const updatedCount = window.SSB.applyGroupToServices(targetIds, groupName);

  if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
    const allServices = window.SSB.getServices();
    targetIds.forEach(id => {
      const s = allServices.find(item => item.id === id);
      if (s) window.SSB_Supabase.upsertService(s).catch(e => console.warn(e));
    });
  }

  showToast('success', `Grupo "${groupName}" aplicado com sucesso a ${updatedCount} serviços!`);
  selectedServicesListIds.clear();
  renderServicesListTable();
  renderServicesGroupsTable();
}

function removeSelectedServicesFromCatalog() {
  if (selectedServicesListIds.size === 0) {
    showToast('warning', 'Selecione ao menos um serviço com a caixinha marcada para remover.');
    return;
  }

  if (!confirm(`Deseja realmente remover os ${selectedServicesListIds.size} serviços selecionados do catálogo público?`)) {
    return;
  }

  const ids = Array.from(selectedServicesListIds);
  const count = window.SSB.deleteServicesBatch(ids);

  if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
    ids.forEach(id => {
      window.SSB_Supabase.deleteService(id).catch(e => console.warn(e));
    });
  }

  selectedServicesListIds.clear();
  showToast('success', `${count} serviços foram removidos do catálogo com sucesso.`);
  renderServicesListTable();
  renderServicesTable();
  renderServicesGroupsTable();
}

function promptBulkPriceUpdate() {
  if (selectedServicesListIds.size === 0) {
    showToast('warning', 'Marque os serviços que deseja reajustar o preço.');
    return;
  }
  openModal('modal-bulk-price');
}

function applyBulkPriceUpdate() {
  const percentVal = parseFloat(document.getElementById('bulk-price-percent')?.value);
  if (isNaN(percentVal) || percentVal === 0) {
    showToast('warning', 'Informe uma porcentagem válida de reajuste (ex: 10 para aumentar ou -5 para reduzir).');
    return;
  }

  const targetIds = Array.from(selectedServicesListIds);
  const updatedCount = window.SSB.updatePricesBatch(targetIds, percentVal);

  if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
    const allServices = window.SSB.getServices();
    targetIds.forEach(id => {
      const s = allServices.find(item => item.id === id);
      if (s) window.SSB_Supabase.upsertService(s).catch(e => console.warn(e));
    });
  }

  closeModal('modal-bulk-price');
  showToast('success', `Preço de ${updatedCount} serviços reajustado em ${percentVal}% com sucesso!`);
  renderServicesListTable();
  renderServicesTable();
}

// ----------------------------------------------------
// GRUPOS DE SERVIÇOS (FOTO 4)
// ----------------------------------------------------
function renderServicesGroupsTable() {
  const tbody = document.getElementById('services-groups-tbody');
  if (!tbody) return;

  const groups = window.SSB.getGroups();
  const services = window.SSB.getServices();

  if (groups.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.4; display: block;"></i>
          Nenhum grupo de serviços cadastrado ainda. Clique em "+ Novo Grupo" para criar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = groups.map(g => {
    const count = services.filter(s => (s.group && s.group.toLowerCase() === g.name.toLowerCase()) || (s.categoryLabel && s.categoryLabel.toLowerCase() === g.name.toLowerCase())).length;

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: #fff; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
            <i class="fa-solid fa-folder-closed" style="color: #8b5cf6;"></i>
            <span>${escapeHtml(g.name)}</span>
          </div>
        </td>
        <td>
          <span style="background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 4px; font-size: 0.82rem; color: #cbd5e1;">
            ${escapeHtml(g.type || 'Geral')}
          </span>
        </td>
        <td>
          <span class="badge mono" style="background: rgba(139, 92, 246, 0.2); color: #c084fc; font-weight: 700; padding: 3px 10px; border-radius: 999px; font-size: 0.82rem;">
            ${count} serviços
          </span>
        </td>
        <td style="text-align: center;">
          <div class="action-btn-group" style="justify-content: center;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="editGroupItem('${g.id}')" title="Editar Grupo">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="deleteGroupItem('${g.id}')" style="color: var(--accent-red);" title="Excluir Grupo">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openNewGroupModal() {
  document.getElementById('group-modal-title').textContent = 'Novo Grupo de Serviços';
  document.getElementById('group-edit-id').value = '';
  document.getElementById('group-edit-name').value = '';
  document.getElementById('group-edit-type').value = 'Ferramentas';
  openModal('modal-group-edit');
}

function editGroupItem(groupId) {
  const groups = window.SSB.getGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  document.getElementById('group-modal-title').textContent = 'Editar Grupo de Serviços';
  document.getElementById('group-edit-id').value = group.id;
  document.getElementById('group-edit-name').value = group.name;
  document.getElementById('group-edit-type').value = group.type || 'Ferramentas';
  openModal('modal-group-edit');
}

function handleSaveGroup(event) {
  event.preventDefault();
  const id = document.getElementById('group-edit-id').value;
  const name = document.getElementById('group-edit-name').value.trim();
  const type = document.getElementById('group-edit-type').value;

  if (!name) {
    showToast('warning', 'Preencha o nome do grupo.');
    return;
  }

  window.SSB.saveGroup({ id: id || undefined, name, type });
  closeModal('modal-group-edit');
  showToast('success', `Grupo "${name}" salvo com sucesso!`);
  renderServicesGroupsTable();
  renderServicesListTable();
}

function deleteGroupItem(groupId) {
  const groups = window.SSB.getGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) return;

  if (!confirm(`Deseja realmente excluir o grupo "${group.name}"? Os serviços vinculados não serão deletados, apenas ficarão sem grupo.`)) {
    return;
  }

  window.SSB.deleteGroup(groupId);
  showToast('success', `Grupo "${group.name}" removido com sucesso.`);
  renderServicesGroupsTable();
  renderServicesListTable();
}

// ----------------------------------------------------
// ADICIONAR CRÉDITO RÁPIDO & FINANCEIRO & CURSOS & ARQUIVOS
// ----------------------------------------------------
function renderAddCreditView() {
  const select = document.getElementById('quick-credit-user-select');
  if (!select) return;

  const users = window.SSB.getUsers();
  select.innerHTML = '<option value="">Selecione o Cliente / Revendedor...</option>' +
    users.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (${escapeHtml(u.email)}) - Saldo Atual: R$ ${(u.balanceBRL || 0).toFixed(2)}</option>`).join('');
}

function handleQuickAddCredit(event) {
  event.preventDefault();
  const userId = document.getElementById('quick-credit-user-select')?.value;
  const amount = parseFloat(document.getElementById('quick-credit-amount')?.value);
  const obs = document.getElementById('quick-credit-obs')?.value.trim();

  if (!userId) {
    showToast('warning', 'Selecione um cliente para injetar saldo.');
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showToast('warning', 'Digite um valor válido maior que zero.');
    return;
  }

  const users = window.SSB.getUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return;

  target.balanceBRL = (target.balanceBRL || 0) + amount;
  window.SSB.updateUser({ id: target.id, email: target.email, name: target.name, balanceBRL: target.balanceBRL });
  window.SSB.addLog('order', `Crédito de R$ ${amount.toFixed(2)} adicionado para ${target.name}. Obs: ${obs || 'Sem obs'}`);

  showToast('success', `R$ ${amount.toFixed(2)} injetados na conta de ${target.name}! Novo saldo: R$ ${target.balanceBRL.toFixed(2)}`);
  document.getElementById('quick-add-credit-form').reset();
  renderAddCreditView();
  renderUsersTable();
  renderDashboard();
}

function renderFinancialView() {
  const orders = window.SSB.getOrders();
  const completed = orders.filter(o => o.status === 'completed');

  const totalRevenue = completed.reduce((acc, o) => acc + (o.priceBRL || 0), 0);
  const totalCost = completed.reduce((acc, o) => acc + (o.costBRL || (o.priceBRL ? o.priceBRL * 0.7 : 0)), 0);
  const netProfit = totalRevenue - totalCost;

  const revEl = document.getElementById('fin-total-revenue');
  const costEl = document.getElementById('fin-total-cost');
  const profEl = document.getElementById('fin-net-profit');

  if (revEl) revEl.textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
  if (costEl) costEl.textContent = `R$ ${totalCost.toFixed(2).replace('.', ',')}`;
  if (profEl) profEl.textContent = `R$ ${netProfit.toFixed(2).replace('.', ',')}`;
}

function renderCoursesTable() {
  const tbody = document.getElementById('courses-tbody');
  if (!tbody) return;

  const courses = window.SSB.getCourses();
  tbody.innerHTML = courses.map(c => `
    <tr>
      <td style="font-weight: 700; color: #fff;">${escapeHtml(c.title)}</td>
      <td><span style="color: #94a3b8;">${escapeHtml(c.instructor || 'Suporte Server Smart')}</span></td>
      <td><span class="mono" style="color: var(--accent-cyan);">${c.modules || 1} módulos</span></td>
      <td><span class="badge mono" style="background: rgba(168, 85, 247, 0.15); color: #c084fc;">${c.students || 0} alunos</span></td>
      <td><span style="color: var(--accent-green); font-weight: 700;">${escapeHtml(c.status || 'Ativo')}</span></td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="deleteCourseItem('${c.id}')" style="color: var(--accent-red);" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openNewCourseModal() {
  const title = prompt('Digite o título do novo curso / treinamento GSM:');
  if (!title) return;
  const instructor = prompt('Nome do instrutor / ministrante:', 'Equipe Suporte Server Smart') || 'Equipe Suporte Server Smart';
  const modules = parseInt(prompt('Quantidade de módulos:', '10'), 10) || 10;

  window.SSB.saveCourse({ title, instructor, modules, students: 0, status: 'Ativo' });
  showToast('success', `Curso "${title}" criado com sucesso!`);
  renderCoursesTable();
}

function deleteCourseItem(courseId) {
  if (!confirm('Deseja realmente remover este curso?')) return;
  window.SSB.deleteCourse(courseId);
  showToast('success', 'Curso removido com sucesso.');
  renderCoursesTable();
}

function renderFilesTable() {
  const tbody = document.getElementById('files-tbody');
  if (!tbody) return;

  const files = window.SSB.getFiles();
  tbody.innerHTML = files.map(f => `
    <tr>
      <td style="font-weight: 700; color: #fff;">
        <i class="fa-solid fa-file-arrow-down" style="color: var(--accent-cyan); margin-right: 0.4rem;"></i>
        ${escapeHtml(f.name)}
      </td>
      <td><span style="background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px; font-size: 0.8rem;">${escapeHtml(f.category || 'Drivers')}</span></td>
      <td class="mono" style="color: #94a3b8;">${escapeHtml(f.size || '10 MB')}</td>
      <td class="mono" style="color: var(--accent-green);">${f.downloads || 0} downloads</td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="deleteFileItem('${f.id}')" style="color: var(--accent-red);" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function openNewFileModal() {
  const name = prompt('Nome do arquivo / driver / loader:');
  if (!name) return;
  const category = prompt('Categoria (ex: Drivers, Firmwares, Ferramentas):', 'Drivers') || 'Drivers';
  const size = prompt('Tamanho do arquivo (ex: 25 MB):', '25 MB') || '25 MB';
  const url = prompt('Link de download (URL direta ou nuvem):', 'https://') || '#';

  window.SSB.saveFile({ name, category, size, url, downloads: 0 });
  showToast('success', `Arquivo "${name}" adicionado ao repositório!`);
  renderFilesTable();
}

function deleteFileItem(fileId) {
  if (!confirm('Deseja remover este arquivo da lista de downloads?')) return;
  window.SSB.deleteFile(fileId);
  showToast('success', 'Arquivo removido com sucesso.');
  renderFilesTable();
}

