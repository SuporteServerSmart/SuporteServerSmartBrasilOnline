// ==========================================================================
// TECH UNION SOLUTIONS - APLICAÇÃO PRINCIPAL (APP.JS)
// ==========================================================================

const STORAGE_KEYS = {
  USERS: 'tu_users_db_v1',
  CURRENT_USER: 'tu_current_user_v1',
  SOLUTIONS: 'tu_custom_solutions_v1',
  TICKER: 'tu_custom_ticker_v1',
  CONFIG: 'tu_system_config_v1'
};

const AppState = {
  currentUser: null,
  users: [],
  solutions: [],
  tickerNews: [],
  systemConfig: {},
  activeView: 'dashboard'
};

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  renderBrandCards();
  renderTicker();
  setupEventListeners();
  checkAuth();
});

function initStorage() {
  // 1. Configurações do Sistema
  const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
  AppState.systemConfig = savedConfig 
    ? { ...window.TECH_UNION_DATA.system, ...JSON.parse(savedConfig) }
    : { ...window.TECH_UNION_DATA.system };

  // 2. Notícias do Ticker
  const savedTicker = localStorage.getItem(STORAGE_KEYS.TICKER);
  AppState.tickerNews = savedTicker
    ? JSON.parse(savedTicker)
    : [...window.TECH_UNION_DATA.tickerNews];

  // 3. Soluções
  const savedSolutions = localStorage.getItem(STORAGE_KEYS.SOLUTIONS);
  AppState.solutions = savedSolutions
    ? JSON.parse(savedSolutions)
    : [...window.TECH_UNION_DATA.solutions];

  // 4. Usuários
  const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  AppState.users = savedUsers ? JSON.parse(savedUsers) : [];

  // 5. Usuário Logado
  const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  AppState.currentUser = savedCurrentUser ? JSON.parse(savedCurrentUser) : null;
}

// ==========================================================================
// RENDERIZAÇÃO DOS 16 CARDS DO GRID
// ==========================================================================
function renderBrandCards() {
  const container = document.getElementById('cardsGrid');
  if (!container) return;

  container.innerHTML = '';
  window.TECH_UNION_DATA.cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'tech-card';
    cardEl.innerHTML = `
      <div class="card-top">
        <div class="card-brand-badge" style="background-color: ${card.badgeBg}; color: ${card.badgeColor};">
          <i class="${card.icon}"></i>
        </div>
        <div class="card-brand-info">
          <h3>${card.name}</h3>
          <p>${card.description}</p>
        </div>
      </div>
      <button class="btn-ver-solucoes ${card.btnColor}" onclick="openSolutionsForBrand('${card.id}', '${card.name}')">
        Ver Soluções
      </button>
    `;
    container.appendChild(cardEl);
  });
}

// ==========================================================================
// TICKER DE NOTÍCIAS ROLANTE
// ==========================================================================
function renderTicker() {
  const tickerEl = document.getElementById('tickerText');
  if (!tickerEl) return;

  const newsItems = AppState.tickerNews.map(item => `🔥 ${item.text}`).join(' &nbsp;&nbsp;|&nbsp;&nbsp; ');
  tickerEl.innerHTML = newsItems;
}

// ==========================================================================
// AUTENTICAÇÃO & REGRA CENTRAL (1º USUÁRIO = ADMIN SUPREMO)
// ==========================================================================
function checkAuth() {
  const userCardEl = document.getElementById('heroUserCard');
  const sidebarAdminSection = document.getElementById('navAdminSection');
  const sidebarUserSnippet = document.getElementById('sidebarUserSnippet');

  if (AppState.currentUser) {
    const u = AppState.currentUser;
    const isSuperAdmin = u.role === 'superadmin';
    const isSpecialPlan = isSuperAdmin || u.daysRemaining > 300;

    userCardEl.innerHTML = `
      <div class="user-info-group">
        <i class="fa-solid fa-user-circle"></i>
        <div>
          <div class="user-name-label">${escapeHtml(u.username)}</div>
          <div style="font-size: 10px; color: ${isSuperAdmin ? '#fef08a' : '#bae6fd'}; font-weight: 700;">
            ${isSuperAdmin ? '👑 Super Administrador' : (u.role === 'admin' ? 'Administrador' : 'Técnico Autorizado')}
          </div>
        </div>
      </div>

      <div class="license-pill" style="background-color: ${u.daysRemaining <= 0 ? '#ef4444' : '#16a34a'};">
        <div class="license-pill-days">
          <i class="fa-solid fa-check"></i>
          <span>${isSuperAdmin ? 'Acesso Vitalício' : `${u.daysRemaining} dias`}</span>
        </div>
        <div class="license-pill-expire">
          ${isSuperAdmin ? 'Encerra: Nunca' : `Encerra: ${u.expireDate || 'Ativo'}`}
        </div>
      </div>

      ${isSuperAdmin ? `
        <button class="btn-plan-premium" onclick="showAdminView()" title="Abrir Painel Admin">
          <i class="fa-solid fa-shield-halved"></i> Painel Admin
        </button>
      ` : `
        <button class="btn-plan-premium" onclick="openProfileModal()">
          <i class="fa-solid fa-star"></i> ${isSpecialPlan ? 'Plano Premium' : 'Meu Plano'}
        </button>
      `}
    `;

    // Atualizar rodapé da sidebar
    if (sidebarUserSnippet) {
      sidebarUserSnippet.innerHTML = `
        <div class="user-snippet">
          <div class="user-avatar-sm">${u.username.substring(0, 2).toUpperCase()}</div>
          <div class="user-snippet-info">
            <div class="user-snippet-name">${escapeHtml(u.username)}</div>
            <div class="user-snippet-role">${isSuperAdmin ? '👑 Super Admin' : 'Técnico'}</div>
          </div>
          <button class="btn-sidebar-logout" onclick="logout()" title="Sair da Conta">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      `;
    }

    // Se for admin, mostrar menu Admin
    if (sidebarAdminSection) {
      sidebarAdminSection.style.display = (u.role === 'superadmin' || u.role === 'admin') ? 'block' : 'none';
    }

  } else {
    // Não logado: Exibir botão de login no banner
    const isFirstRegistration = AppState.users.length === 0;

    userCardEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 12px; opacity: 0.9;">Visitante Técnico</span>
        <button class="btn-login-cta" onclick="openAuthModal('login')">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar
        </button>
        <button class="btn-plan-premium" onclick="openAuthModal('register')">
          <i class="fa-solid ${isFirstRegistration ? 'fa-crown' : 'fa-user-plus'}"></i> 
          ${isFirstRegistration ? 'Cadastre-se (Seja o Admin)' : 'Criar Conta'}
        </button>
      </div>
    `;

    if (sidebarUserSnippet) {
      sidebarUserSnippet.innerHTML = `
        <div class="user-snippet" style="cursor: pointer;" onclick="openAuthModal('login')">
          <div class="user-avatar-sm"><i class="fa-solid fa-user"></i></div>
          <div class="user-snippet-info">
            <div class="user-snippet-name">Não Conectado</div>
            <div class="user-snippet-role">Clique para entrar</div>
          </div>
        </div>
      `;
    }

    if (sidebarAdminSection) {
      sidebarAdminSection.style.display = 'none';
    }
  }
}

// Abrir Modal de Autenticação (Login / Cadastro)
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  const isFirst = AppState.users.length === 0;
  
  const firstUserBanner = document.getElementById('firstUserBanner');
  if (firstUserBanner) {
    firstUserBanner.style.display = isFirst ? 'flex' : 'none';
  }

  switchAuthTab(tab);
  modal.classList.add('active');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegBtn = document.getElementById('tabRegBtn');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    tabLoginBtn.classList.add('active');
    tabRegBtn.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    tabLoginBtn.classList.remove('active');
    tabRegBtn.classList.add('active');
  }
}

// Executar Cadastro (com a regra do 1º usuário = ADMIN)
function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const whatsapp = document.getElementById('regWhatsapp').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!username || !email || !password) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  // Verificar se e-mail ou username já existe
  const exists = AppState.users.some(u => u.email === email || u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    alert('Este e-mail ou nome de usuário já está cadastrado. Faça login!');
    return;
  }

  // REGRA DE OURO: O primeiro usuário a se cadastrar torna-se SUPER ADMIN!
  const isFirstUser = AppState.users.length === 0;

  const newUser = {
    id: 'user_' + Date.now(),
    username: username,
    email: email,
    whatsapp: whatsapp,
    password: password,
    role: isFirstUser ? 'superadmin' : 'tecnico',
    isAdmin: isFirstUser,
    plan: isFirstUser ? 'Plano Super Admin Vitalício' : 'Plano Técnico (Período de Teste)',
    daysRemaining: isFirstUser ? 9999 : (AppState.systemConfig.trialDaysDefault || 7),
    expireDate: isFirstUser ? 'Vitalício' : calculateExpireDate(AppState.systemConfig.trialDaysDefault || 7),
    status: 'active',
    createdAt: new Date().toLocaleDateString('pt-BR')
  };

  AppState.users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));

  // Logar imediatamente
  AppState.currentUser = newUser;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

  closeAuthModal();
  checkAuth();

  if (isFirstUser) {
    alert(`🎉 PARABÉNS, ${username}!\n\nVocê é o PRIMEIRO USUÁRIO CADASTRADO no sistema e acaba de receber o cargo de SUPER ADMINISTRADOR SUPREMO com controle total da plataforma!`);
    showAdminView();
  } else {
    alert(`Bem-vindo, ${username}! Sua conta foi criada com sucesso com ${newUser.daysRemaining} dias de acesso teste.`);
  }
}

// Executar Login
function handleLogin(e) {
  e.preventDefault();
  const loginInput = document.getElementById('loginIdentifier').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const user = AppState.users.find(u => 
    (u.email === loginInput || u.username.toLowerCase() === loginInput) && u.password === password
  );

  if (!user) {
    alert('Credenciais incorretas! Verifique o e-mail/usuário e a senha.');
    return;
  }

  if (user.status === 'blocked') {
    alert('Esta conta foi bloqueada pelo administrador. Entre em contato com o suporte.');
    return;
  }

  AppState.currentUser = user;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

  closeAuthModal();
  checkAuth();
}

function logout() {
  if (confirm('Deseja realmente sair da sua conta?')) {
    AppState.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    checkAuth();
    showDashboardView();
  }
}

// ==========================================================================
// VISUALIZAÇÃO DE SOLUÇÕES POR MARCA
// ==========================================================================
function openSolutionsForBrand(brandId, brandName) {
  const modal = document.getElementById('solutionsModal');
  const modalTitle = document.getElementById('solutionsModalTitle');
  const container = document.getElementById('solutionsListContainer');

  modalTitle.innerHTML = `<i class="fa-solid fa-folder-open"></i> Soluções: <strong>${brandName}</strong>`;
  
  // Filtrar soluções da marca
  const list = AppState.solutions.filter(s => s.brandId === brandId);

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #64748b;">
        <i class="fa-solid fa-microchip" style="font-size: 36px; margin-bottom: 12px; color: #cbd5e1;"></i>
        <h4>Nenhuma solução cadastrada ainda para ${brandName}.</h4>
        <p style="font-size: 13px; margin-top: 6px;">O administrador pode adicionar esquemas e soluções a qualquer momento.</p>
        ${AppState.currentUser && AppState.currentUser.isAdmin ? `
          <button class="btn-plan-premium" style="margin: 16px auto 0;" onclick="closeSolutionsModal(); showAdminView('tab-add-solution');">
            <i class="fa-solid fa-plus"></i> Adicionar Solução para ${brandName}
          </button>
        ` : ''}
      </div>
    `;
  } else {
    container.innerHTML = list.map(sol => `
      <div class="tech-card" style="margin-bottom: 14px; cursor: pointer;" onclick="openSolutionDetail('${sol.id}')">
        <div class="card-top" style="margin-bottom: 8px;">
          <div class="card-brand-badge" style="background-color: #e0edff; color: #0284c7; width: 38px; height: 38px; font-size: 16px;">
            <i class="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <div class="card-brand-info">
            <h3 style="font-size: 14px; color: #0f172a;">${escapeHtml(sol.title)}</h3>
            <p style="font-size: 12px; color: #2563eb; font-weight: 600;">${escapeHtml(sol.model)} &bull; ${escapeHtml(sol.category)}</p>
          </div>
        </div>
        <div style="font-size: 12px; color: #64748b; line-height: 1.4; margin-bottom: 10px;">
          ${escapeHtml(sol.symptoms.substring(0, 140))}...
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 8px; font-size: 11px; color: #94a3b8;">
          <span><i class="fa-regular fa-clock"></i> ${sol.date || 'Recente'}</span>
          <span style="color: #2563eb; font-weight: 700;">Abrir Procedimento Completo &rarr;</span>
        </div>
      </div>
    `).join('');
  }

  modal.classList.add('active');
}

function closeSolutionsModal() {
  document.getElementById('solutionsModal').classList.remove('active');
}

// Abrir Detalhe da Solução Passo a Passo
function openSolutionDetail(solId) {
  const sol = AppState.solutions.find(s => s.id === solId);
  if (!sol) return;

  const modal = document.getElementById('solutionDetailModal');
  const titleEl = document.getElementById('solDetailTitle');
  const bodyEl = document.getElementById('solDetailBody');

  titleEl.innerText = sol.title;

  const guideHtml = sol.guide.map(step => `
    <div class="solution-guide-step">
      ${escapeHtml(step)}
    </div>
  `).join('');

  bodyEl.innerHTML = `
    <div class="solution-detail-header">
      <span class="solution-detail-badge">${escapeHtml(sol.category)}</span>
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">${escapeHtml(sol.model)}</h2>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
        Publicado por: <strong>${escapeHtml(sol.author || 'Tech Union')}</strong> &bull; Dificuldade: <strong>${sol.difficulty || 'Intermediário'}</strong>
      </div>
    </div>

    <div class="solution-symptom-box">
      <strong><i class="fa-solid fa-triangle-exclamation"></i> Sintoma do Aparelho:</strong><br>
      ${escapeHtml(sol.symptoms)}
    </div>

    <h4 style="font-size: 14px; font-weight: 800; margin-bottom: 10px; color: #1e293b;">
      <i class="fa-solid fa-list-check"></i> Procedimento e Análise Técnica Passo a Passo:
    </h4>
    <div class="solution-guide-list">
      ${guideHtml}
    </div>

    ${sol.jumperTip ? `
      <div class="jumper-tip-box">
        <i class="fa-solid fa-bolt" style="font-size: 18px; color: #16a34a;"></i>
        <div>
          <strong>Dica de Bancada / Jumper:</strong><br>
          ${escapeHtml(sol.jumperTip)}
        </div>
      </div>
    ` : ''}

    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
      <button class="btn-ticker-all" onclick="window.print()">
        <i class="fa-solid fa-print"></i> Imprimir Guia
      </button>
      <button class="btn-primary-block" style="width: auto; margin-top: 0; padding: 8px 18px;" onclick="closeSolutionDetailModal()">
        Fechar
      </button>
    </div>
  `;

  modal.classList.add('active');
}

function closeSolutionDetailModal() {
  document.getElementById('solutionDetailModal').classList.remove('active');
}

// ==========================================================================
// PAINEL DE CONTROLE ADMINISTRATIVO (ADMIN VIEW)
// ==========================================================================
function showAdminView(initialTab = 'tab-users') {
  if (!AppState.currentUser || !AppState.currentUser.isAdmin) {
    alert('Acesso restrito para Administradores!');
    return;
  }

  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('adminView').style.display = 'block';

  // Atualizar botões da sidebar
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const adminNavItem = document.getElementById('navAdminLink');
  if (adminNavItem) adminNavItem.classList.add('active');

  renderAdminUsersTable();
  switchAdminTab(initialTab);
}

function showDashboardView() {
  document.getElementById('dashboardView').style.display = 'block';
  document.getElementById('adminView').style.display = 'none';

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const dashNavItem = document.getElementById('navDashboardLink');
  if (dashNavItem) dashNavItem.classList.add('active');
}

function switchAdminTab(tabId) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

  const btn = document.getElementById(`btn-${tabId}`);
  const content = document.getElementById(tabId);
  if (btn) btn.classList.add('active');
  if (content) content.style.display = 'block';
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('adminUsersTbody');
  if (!tbody) return;

  if (AppState.users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = AppState.users.map(u => {
    const isSuper = u.role === 'superadmin';
    return `
      <tr>
        <td>
          <strong>${escapeHtml(u.username)}</strong><br>
          <span style="font-size: 11px; color: #94a3b8;">${escapeHtml(u.email)}</span>
        </td>
        <td>${escapeHtml(u.whatsapp || '-')}</td>
        <td>
          <span class="badge-pill" style="background: ${isSuper ? '#fef3c7' : '#e0edff'}; color: ${isSuper ? '#854d0e' : '#1e40af'};">
            ${isSuper ? '👑 Super Admin' : (u.role === 'admin' ? 'Admin' : 'Técnico')}
          </span>
        </td>
        <td>
          <strong>${isSuper ? 'Vitalício' : `${u.daysRemaining} dias`}</strong>
        </td>
        <td>
          <span style="color: ${u.status === 'active' ? '#16a34a' : '#dc2626'}; font-weight: 700;">
            ${u.status === 'active' ? '● Ativo' : '● Bloqueado'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${!isSuper ? `
              <button class="btn-action-sm btn-action-green" onclick="adminAddDays('${u.id}', 30)" title="Adicionar 30 Dias">+30D</button>
              <button class="btn-action-sm btn-action-green" onclick="adminAddDays('${u.id}', 365)" title="Adicionar 1 Ano">+365D</button>
              <button class="btn-action-sm btn-action-blue" onclick="adminToggleRole('${u.id}')" title="Mudar Cargo">
                ${u.role === 'admin' ? 'Tornar Técnico' : 'Promover Admin'}
              </button>
              <button class="btn-action-sm btn-action-red" onclick="adminToggleStatus('${u.id}')" title="Bloquear / Desbloquear">
                ${u.status === 'active' ? 'Bloquear' : 'Ativar'}
              </button>
            ` : `
              <span style="font-size: 11px; color: #ca8a04; font-weight: 700;">Admin Supremo</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Ações do Admin nos Usuários
function adminAddDays(userId, days) {
  const user = AppState.users.find(u => u.id === userId);
  if (!user) return;

  user.daysRemaining = (parseInt(user.daysRemaining) || 0) + days;
  user.expireDate = calculateExpireDate(user.daysRemaining);
  saveUsers();
  renderAdminUsersTable();
  alert(`Foram adicionados +${days} dias para ${user.username}. Total: ${user.daysRemaining} dias.`);
}

function adminToggleRole(userId) {
  const user = AppState.users.find(u => u.id === userId);
  if (!user) return;

  user.role = user.role === 'admin' ? 'tecnico' : 'admin';
  user.isAdmin = user.role === 'admin';
  saveUsers();
  renderAdminUsersTable();
}

function adminToggleStatus(userId) {
  const user = AppState.users.find(u => u.id === userId);
  if (!user) return;

  user.status = user.status === 'active' ? 'blocked' : 'active';
  saveUsers();
  renderAdminUsersTable();
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));
}

// Formulário de Adicionar Nova Solução (Admin)
function handleAddSolution(e) {
  e.preventDefault();
  const brandId = document.getElementById('newSolBrand').value;
  const model = document.getElementById('newSolModel').value.trim();
  const category = document.getElementById('newSolCategory').value.trim();
  const title = document.getElementById('newSolTitle').value.trim();
  const symptoms = document.getElementById('newSolSymptoms').value.trim();
  const stepsRaw = document.getElementById('newSolSteps').value.trim();
  const jumper = document.getElementById('newSolJumper').value.trim();

  if (!model || !title || !symptoms || !stepsRaw) {
    alert('Preencha os campos obrigatórios!');
    return;
  }

  const newSol = {
    id: 'sol_custom_' + Date.now(),
    brandId: brandId,
    model: model,
    title: title,
    category: category || 'Geral',
    date: new Date().toLocaleDateString('pt-BR'),
    author: AppState.currentUser ? AppState.currentUser.username : 'Admin',
    difficulty: 'Intermediário',
    symptoms: symptoms,
    guide: stepsRaw.split('\n').filter(s => s.trim().length > 0),
    jumperTip: jumper,
    tags: [model, category]
  };

  AppState.solutions.unshift(newSol);
  localStorage.setItem(STORAGE_KEYS.SOLUTIONS, JSON.stringify(AppState.solutions));

  // Adicionar ao ticker automaticamente
  const tickerText = `${model.toUpperCase()} - ${title.toUpperCase()} (${newSol.date})`;
  AppState.tickerNews.unshift({
    id: Date.now(),
    text: tickerText,
    brand: brandId.toUpperCase(),
    date: newSol.date
  });
  localStorage.setItem(STORAGE_KEYS.TICKER, JSON.stringify(AppState.tickerNews));
  renderTicker();

  alert('Solução cadastrada e publicada no catálogo com sucesso!');
  document.getElementById('formAddSolution').reset();
  showDashboardView();
  openSolutionsForBrand(brandId, brandId.toUpperCase());
}

// ==========================================================================
// UTILITÁRIOS
// ==========================================================================
function calculateExpireDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + parseInt(days));
  return d.toLocaleDateString('pt-BR');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setupEventListeners() {
  // Fechar modais ao clicar no overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
}

function openAllNewsModal() {
  const modal = document.getElementById('solutionsModal');
  const title = document.getElementById('solutionsModalTitle');
  const list = document.getElementById('solutionsListContainer');

  title.innerHTML = '<i class="fa-solid fa-bullhorn"></i> Todas as Notícias & Atualizações';
  list.innerHTML = AppState.tickerNews.map(item => `
    <div class="tech-card" style="margin-bottom: 12px; padding: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge-pill" style="background: #e0edff; color: #0066ff;">${item.brand || 'GERAL'}</span>
        <span style="font-size: 11px; color: #94a3b8;">${item.date || ''}</span>
      </div>
      <h4 style="font-size: 14px; margin-top: 8px; color: #0f172a;">${escapeHtml(item.text)}</h4>
    </div>
  `).join('');

  modal.classList.add('active');
}

function openToolsModal(categoryName) {
  const modal = document.getElementById('solutionsModal');
  const title = document.getElementById('solutionsModalTitle');
  const list = document.getElementById('solutionsListContainer');

  title.innerHTML = `<i class="fa-solid fa-wrench"></i> Ferramentas: <strong>${categoryName}</strong>`;
  list.innerHTML = window.TECH_UNION_DATA.tools.map(tool => `
    <div class="tech-card" style="margin-bottom: 14px;">
      <div class="card-top">
        <div class="card-brand-badge" style="background-color: #ffedd5; color: #ea580c;">
          <i class="${tool.icon}"></i>
        </div>
        <div class="card-brand-info">
          <h3>${tool.name} ${tool.badge ? `<span class="nav-badge-new">${tool.badge}</span>` : ''}</h3>
          <p style="color: #64748b; font-size: 12px;">${tool.description}</p>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
        <span style="font-size: 11px; color: #94a3b8;">Versão: ${tool.version}</span>
        <a href="${tool.downloadUrl}" target="_blank" class="btn-ticker-all" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-download"></i> Baixar Ferramenta
        </a>
      </div>
    </div>
  `).join('');

  modal.classList.add('active');
}
