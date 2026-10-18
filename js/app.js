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

// Credenciais Oficiais e Exclusivas do Administrador Geral
const MASTER_ADMIN = {
  email: 'suporteserversmart@gmail.com',
  password: 'Picopico102030@&',
  username: 'suporteserversmart',
  role: 'superadmin',
  isAdmin: true
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
  updateVersionDisplay();
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

  // Garantir que a conta oficial suporteserversmart@gmail.com sempre exista e seja o único Super Admin
  let masterAccount = AppState.users.find(u => u.email && u.email.toLowerCase() === MASTER_ADMIN.email);
  if (!masterAccount) {
    masterAccount = {
      id: 'admin_master_serversmart',
      username: MASTER_ADMIN.username,
      email: MASTER_ADMIN.email,
      whatsapp: '(11) 99999-9999',
      password: MASTER_ADMIN.password,
      role: 'superadmin',
      isAdmin: true,
      plan: 'Plano Super Admin Vitalício',
      daysRemaining: 99999,
      expireDate: 'Vitalício',
      status: 'active',
      createdAt: '17/10/2026'
    };
    AppState.users.unshift(masterAccount);
  } else {
    // Sincronizar credenciais e permissões
    masterAccount.password = MASTER_ADMIN.password;
    masterAccount.role = 'superadmin';
    masterAccount.isAdmin = true;
    masterAccount.status = 'active';
  }

  // REGRA ESTRITA: NENHUM OUTRO USUÁRIO PODE SER ADMIN!
  AppState.users.forEach(u => {
    if (u.email && u.email.toLowerCase() !== MASTER_ADMIN.email) {
      u.role = 'tecnico';
      u.isAdmin = false;
      if (u.plan && u.plan.includes('Admin')) {
        u.plan = 'Plano Técnico Autorizado';
      }
    }
  });
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));

  // 5. Usuário Logado
  const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (savedCurrentUser) {
    const parsed = JSON.parse(savedCurrentUser);
    if (parsed.email && parsed.email.toLowerCase() === MASTER_ADMIN.email) {
      parsed.role = 'superadmin';
      parsed.isAdmin = true;
      parsed.password = MASTER_ADMIN.password;
      AppState.currentUser = parsed;
    } else {
      parsed.role = 'tecnico';
      parsed.isAdmin = false;
      AppState.currentUser = parsed;
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(AppState.currentUser));
  } else {
    AppState.currentUser = null;
  }
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
// AUTENTICAÇÃO & CONTROLE EXCLUSIVO DE ADMIN (suporteserversmart@gmail.com)
// ==========================================================================
function checkAuth() {
  const userCardEl = document.getElementById('heroUserCard');
  const sidebarAdminSection = document.getElementById('navAdminSection');
  const sidebarUserSnippet = document.getElementById('sidebarUserSnippet');

  const u = AppState.currentUser;
  const isMasterAdmin = !!(u && u.email && u.email.toLowerCase() === MASTER_ADMIN.email);

  if (u) {
    const isSpecialPlan = isMasterAdmin || u.daysRemaining > 300;

    userCardEl.innerHTML = `
      <div class="user-info-group">
        <i class="fa-solid fa-user-circle"></i>
        <div>
          <div class="user-name-label">${escapeHtml(u.username)}</div>
          <div style="font-size: 10px; color: ${isMasterAdmin ? '#fef08a' : '#bae6fd'}; font-weight: 700;">
            ${isMasterAdmin ? '👑 Super Administrador' : 'Técnico Autorizado'}
          </div>
        </div>
      </div>

      <div class="license-pill" style="background-color: ${u.daysRemaining <= 0 ? '#ef4444' : '#16a34a'};">
        <div class="license-pill-days">
          <i class="fa-solid fa-check"></i>
          <span>${isMasterAdmin ? 'Acesso Vitalício' : `${u.daysRemaining} dias`}</span>
        </div>
        <div class="license-pill-expire">
          ${isMasterAdmin ? 'Encerra: Nunca' : `Encerra: ${u.expireDate || 'Ativo'}`}
        </div>
      </div>

      ${isMasterAdmin ? `
        <button class="btn-plan-premium" onclick="showAdminView()" title="Abrir Painel Admin">
          <i class="fa-solid fa-shield-halved"></i> Painel Admin
        </button>
      ` : `
        <button class="btn-plan-premium" onclick="openProfileModal()">
          <i class="fa-solid fa-star"></i> ${isSpecialPlan ? 'Plano Premium' : 'Meu Plano'}
        </button>
      `}

      <button class="btn-logout-hero" onclick="logout()" title="Sair da Plataforma">
        <i class="fa-solid fa-right-from-bracket"></i> Sair
      </button>
    `;

    // Atualizar rodapé da sidebar
    if (sidebarUserSnippet) {
      sidebarUserSnippet.innerHTML = `
        <div class="user-snippet">
          <div class="user-avatar-sm">${u.username.substring(0, 2).toUpperCase()}</div>
          <div class="user-snippet-info">
            <div class="user-snippet-name">${escapeHtml(u.username)}</div>
            <div class="user-snippet-role">${isMasterAdmin ? '👑 Super Admin' : 'Técnico'}</div>
          </div>
          <button class="btn-sidebar-logout" onclick="logout()" title="Sair da Conta">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      `;
    }

    // BOTÃO/SEÇÃO DE ADMIN: EXCLUSIVO PARA suporteserversmart@gmail.com!
    if (sidebarAdminSection) {
      sidebarAdminSection.style.display = isMasterAdmin ? 'block' : 'none';
    }

  } else {
    // Não logado: Exibir botão de login e cadastro no banner
    userCardEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 12px; opacity: 0.9;">Visitante Técnico</span>
        <button class="btn-login-cta" onclick="openAuthModal('login')">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar
        </button>
        <button class="btn-plan-premium" onclick="openAuthModal('register')">
          <i class="fa-solid fa-user-plus"></i> Cadastre-se
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

    // Ocultar completamente qualquer menu Admin para visitantes
    if (sidebarAdminSection) {
      sidebarAdminSection.style.display = 'none';
    }
  }
}

// Abrir Modal de Autenticação (Login / Cadastro)
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  const firstUserBanner = document.getElementById('firstUserBanner');
  if (firstUserBanner) {
    firstUserBanner.style.display = 'none';
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

// Executar Cadastro (Apenas contas de Técnicos; suporteserversmart@gmail.com é exclusivo Admin)
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

  // Se tentar cadastrar o e-mail oficial do Administrador, orientar login
  if (email === MASTER_ADMIN.email) {
    alert('O e-mail suporteserversmart@gmail.com é a conta oficial do Administrador Geral.\nPor favor, faça o login com sua senha de administrador!');
    switchAuthTab('login');
    document.getElementById('loginIdentifier').value = MASTER_ADMIN.email;
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
    return;
  }

  // Verificar se e-mail ou username já existe
  const exists = AppState.users.some(u => (u.email && u.email.toLowerCase() === email) || (u.username && u.username.toLowerCase() === username.toLowerCase()));
  if (exists) {
    alert('Este e-mail ou nome de usuário já está cadastrado. Faça login!');
    switchAuthTab('login');
    document.getElementById('loginIdentifier').value = username;
    return;
  }

  // Todo novo cadastro é estritamente Técnico (NUNCA Admin)
  const newUser = {
    id: 'user_' + Date.now(),
    username: username,
    email: email,
    whatsapp: whatsapp,
    password: password,
    role: 'tecnico',
    isAdmin: false,
    plan: 'Plano Técnico (Período de Teste)',
    daysRemaining: (AppState.systemConfig.trialDaysDefault || 7),
    expireDate: calculateExpireDate(AppState.systemConfig.trialDaysDefault || 7),
    status: 'active',
    createdAt: new Date().toLocaleDateString('pt-BR')
  };

  AppState.users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));

  // Resetar formulário de cadastro
  document.getElementById('registerForm').reset();

  // Direcionar imediatamente para a tela de login
  switchAuthTab('login');
  document.getElementById('loginIdentifier').value = username;
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginPassword').focus();

  alert(`Cadastro realizado com sucesso, ${username}!\nPor favor, insira suas credenciais para entrar na plataforma.`);
}

// Executar Login (com verificação direta do Administrador Geral)
function handleLogin(e) {
  e.preventDefault();
  const loginInput = document.getElementById('loginIdentifier').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  // 1. Verificação da Conta Mestre do Administrador Oficial
  if ((loginInput === MASTER_ADMIN.email || loginInput === MASTER_ADMIN.username) && password === MASTER_ADMIN.password) {
    let master = AppState.users.find(u => u.email && u.email.toLowerCase() === MASTER_ADMIN.email);
    if (!master) {
      master = {
        id: 'admin_master_serversmart',
        username: MASTER_ADMIN.username,
        email: MASTER_ADMIN.email,
        whatsapp: '(11) 99999-9999',
        password: MASTER_ADMIN.password,
        role: 'superadmin',
        isAdmin: true,
        plan: 'Plano Super Admin Vitalício',
        daysRemaining: 99999,
        expireDate: 'Vitalício',
        status: 'active',
        createdAt: '17/10/2026'
      };
      AppState.users.unshift(master);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));
    } else {
      master.role = 'superadmin';
      master.isAdmin = true;
      master.password = MASTER_ADMIN.password;
    }

    AppState.currentUser = master;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(master));

    closeAuthModal();
    checkAuth();
    alert('👑 Bem-vindo, Administrador Oficial (suporteserversmart@gmail.com)!\nPainel Admin e botões administrativos liberados.');
    return;
  }

  // 2. Verificação de Usuários Comuns (Técnicos)
  const user = AppState.users.find(u => 
    (u.email.toLowerCase() === loginInput || u.username.toLowerCase() === loginInput) && u.password === password
  );

  if (!user) {
    alert('Credenciais incorretas! Verifique o e-mail/usuário e a senha.');
    return;
  }

  if (user.status === 'blocked') {
    alert('Esta conta foi bloqueada pelo administrador. Entre em contato com o suporte.');
    return;
  }

  // Assegurar que nenhum outro usuário tenha privilégios de Admin
  if (user.email.toLowerCase() !== MASTER_ADMIN.email) {
    user.role = 'tecnico';
    user.isAdmin = false;
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
    openAuthModal('login'); // Retorna imediatamente para a tela de login!
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
      <div style="text-align: center; padding: 40px; color: #c4b5fd;">
        <i class="fa-solid fa-microchip" style="font-size: 38px; margin-bottom: 14px; color: #a855f7;"></i>
        <h4 style="color: #ffffff; font-size: 16px;">Nenhuma solução cadastrada ainda para ${brandName}.</h4>
        <p style="font-size: 13px; margin-top: 8px; color: #a78bfa;">O administrador pode adicionar esquemas e soluções a qualquer momento.</p>
        ${(AppState.currentUser && AppState.currentUser.email && AppState.currentUser.email.toLowerCase() === MASTER_ADMIN.email) ? `
          <button class="btn-plan-premium" style="margin: 18px auto 0;" onclick="closeSolutionsModal(); showAdminView('tab-add-solution');">
            <i class="fa-solid fa-plus"></i> Adicionar Solução para ${brandName}
          </button>
        ` : ''}
      </div>
    `;
  } else {
    container.innerHTML = list.map(sol => `
      <div class="tech-card" style="margin-bottom: 14px; cursor: pointer; background: #190f30; border: 1px solid rgba(168, 85, 247, 0.25);" onclick="openSolutionDetail('${sol.id}')">
        <div class="card-top" style="margin-bottom: 8px;">
          <div class="card-brand-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35); width: 38px; height: 38px; font-size: 16px;">
            <i class="fa-solid fa-screwdriver-wrench"></i>
          </div>
          <div class="card-brand-info">
            <h3 style="font-size: 14.5px; color: #ffffff; font-weight: 700;">${escapeHtml(sol.title)}</h3>
            <p style="font-size: 12px; color: #c084fc; font-weight: 600;">${escapeHtml(sol.model)} &bull; ${escapeHtml(sol.category)}</p>
          </div>
        </div>
        <div style="font-size: 12.5px; color: #cbd5e1; line-height: 1.45; margin-bottom: 10px;">
          ${escapeHtml(sol.symptoms.substring(0, 140))}...
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(168, 85, 247, 0.2); padding-top: 10px; font-size: 11.5px; color: #a78bfa;">
          <span><i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${sol.date || 'Recente'}</span>
          <span style="color: #c084fc; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">Abrir Procedimento Completo &rarr;</span>
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
      <h2 style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px;">${escapeHtml(sol.model)}</h2>
      <div style="font-size: 12px; color: #c4b5fd; margin-top: 4px;">
        Publicado por: <strong style="color: #ffffff;">${escapeHtml(sol.author || 'Suporte Server Smart')}</strong> &bull; Dificuldade: <strong style="color: #c084fc;">${sol.difficulty || 'Intermediário'}</strong>
      </div>
    </div>

    <div class="solution-symptom-box">
      <strong><i class="fa-solid fa-triangle-exclamation"></i> Sintoma do Aparelho:</strong><br>
      ${escapeHtml(sol.symptoms)}
    </div>

    <h4 style="font-size: 14px; font-weight: 800; margin-bottom: 10px; color: #ffffff;">
      <i class="fa-solid fa-list-check" style="color: #c084fc; margin-right: 6px;"></i> Procedimento e Análise Técnica Passo a Passo:
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
  if (!AppState.currentUser || !AppState.currentUser.email || AppState.currentUser.email.toLowerCase() !== MASTER_ADMIN.email) {
    alert('Acesso negado! O Painel Admin é restrito exclusivamente para o e-mail ' + MASTER_ADMIN.email);
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

  if (tabId === 'tab-config') {
    loadConfigForm();
  }
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('adminUsersTbody');
  if (!tbody) return;

  if (AppState.users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  tbody.innerHTML = AppState.users.map(u => {
    const isMaster = u.email && u.email.toLowerCase() === MASTER_ADMIN.email;
    return `
      <tr>
        <td>
          <strong>${escapeHtml(u.username)}</strong><br>
          <span style="font-size: 11px; color: #94a3b8;">${escapeHtml(u.email)}</span>
        </td>
        <td>${escapeHtml(u.whatsapp || '-')}</td>
        <td>
          <span class="badge-pill" style="background: ${isMaster ? 'rgba(234, 179, 8, 0.2)' : 'rgba(168, 85, 247, 0.2)'}; color: ${isMaster ? '#fde047' : '#c084fc'}; border: 1px solid ${isMaster ? 'rgba(234, 179, 8, 0.4)' : 'rgba(168, 85, 247, 0.4)'};">
            ${isMaster ? '👑 Super Admin' : 'Técnico'}
          </span>
        </td>
        <td>
          <strong>${isMaster ? 'Vitalício' : `${u.daysRemaining} dias`}</strong>
        </td>
        <td>
          <span style="color: ${u.status === 'active' ? '#16a34a' : '#dc2626'}; font-weight: 700;">
            ${u.status === 'active' ? '● Ativo' : '● Bloqueado'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${!isMaster ? `
              <button class="btn-action-sm btn-action-green" onclick="adminAddDays('${u.id}', 30)" title="Adicionar 30 Dias">+30D</button>
              <button class="btn-action-sm btn-action-green" onclick="adminAddDays('${u.id}', 365)" title="Adicionar 1 Ano">+365D</button>
              <button class="btn-action-sm btn-action-red" onclick="adminToggleStatus('${u.id}')" title="Bloquear / Desbloquear">
                ${u.status === 'active' ? 'Bloquear' : 'Ativar'}
              </button>
            ` : `
              <span style="font-size: 11px; color: #fde047; font-weight: 700;">Admin Supremo Oficial</span>
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
  alert('Regra de Segurança: Apenas a conta oficial suporteserversmart@gmail.com possui acesso de Administrador.');
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

  title.innerHTML = '<i class="fa-solid fa-bullhorn" style="color: #c084fc; margin-right: 8px;"></i> Todas as Notícias & Atualizações';
  list.innerHTML = AppState.tickerNews.map(item => `
    <div class="tech-card" style="margin-bottom: 12px; padding: 14px; background: #190f30; border: 1px solid rgba(168, 85, 247, 0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge-pill" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); font-weight: 700;">${escapeHtml(item.brand || 'GERAL')}</span>
        <span style="font-size: 11.5px; color: #a78bfa;"><i class="fa-regular fa-calendar-days" style="margin-right: 4px;"></i>${escapeHtml(item.date || '')}</span>
      </div>
      <h4 style="font-size: 14.5px; margin-top: 10px; color: #ffffff; font-weight: 700; line-height: 1.45; letter-spacing: 0.3px;">${escapeHtml(item.text)}</h4>
    </div>
  `).join('');

  modal.classList.add('active');
}

function openToolsModal(categoryName) {
  const modal = document.getElementById('solutionsModal');
  const title = document.getElementById('solutionsModalTitle');
  const list = document.getElementById('solutionsListContainer');

  title.innerHTML = `<i class="fa-solid fa-wrench" style="color: #c084fc; margin-right: 8px;"></i> Ferramentas: <strong>${categoryName}</strong>`;
  list.innerHTML = window.TECH_UNION_DATA.tools.map(tool => `
    <div class="tech-card" style="margin-bottom: 14px; background: #190f30; border: 1px solid rgba(168, 85, 247, 0.25);">
      <div class="card-top">
        <div class="card-brand-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35);">
          <i class="${tool.icon}"></i>
        </div>
        <div class="card-brand-info">
          <h3 style="color: #ffffff;">${tool.name} ${tool.badge ? `<span class="nav-badge-new">${tool.badge}</span>` : ''}</h3>
          <p style="color: #cbd5e1; font-size: 12px; margin-top: 4px;">${tool.description}</p>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid rgba(168, 85, 247, 0.18); padding-top: 10px;">
        <span style="font-size: 11.5px; color: #a78bfa;">Versão: <strong style="color: #ffffff;">${tool.version}</strong></span>
        <a href="${tool.downloadUrl}" target="_blank" class="btn-ticker-all" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-download"></i> Baixar Ferramenta
        </a>
      </div>
    </div>
  `).join('');

  modal.classList.add('active');
}

// ==========================================================================
// CONTROLE DINÂMICO DE VERSÃO & CONFIGURAÇÕES PELO PAINEL ADMIN
// ==========================================================================
function updateVersionDisplay() {
  const version = (AppState.systemConfig && AppState.systemConfig.version) || '1.3.4';
  const heroVersionText = document.getElementById('heroVersionText');
  if (heroVersionText) {
    heroVersionText.innerText = version;
  }
}

function loadConfigForm() {
  const cfg = AppState.systemConfig || {};
  const cfgVersion = document.getElementById('cfgVersion');
  const cfgWhatsapp = document.getElementById('cfgWhatsapp');
  const cfgTrialDays = document.getElementById('cfgTrialDays');

  if (cfgVersion) cfgVersion.value = cfg.version || '1.3.4';
  if (cfgWhatsapp) cfgWhatsapp.value = cfg.supportWhatsapp || '';
  if (cfgTrialDays) cfgTrialDays.value = cfg.trialDaysDefault || 7;
}

function saveSystemConfig(e) {
  if (e) e.preventDefault();

  if (!AppState.currentUser || !AppState.currentUser.email || AppState.currentUser.email.toLowerCase() !== MASTER_ADMIN.email) {
    alert('Acesso negado! Apenas o Administrador Principal pode alterar as configurações do sistema.');
    return;
  }

  const versionInput = document.getElementById('cfgVersion');
  const whatsappInput = document.getElementById('cfgWhatsapp');
  const trialDaysInput = document.getElementById('cfgTrialDays');

  const newVersion = versionInput ? versionInput.value.trim() : '';
  const newWhatsapp = whatsappInput ? whatsappInput.value.trim() : '';
  const newTrialDays = trialDaysInput ? (parseInt(trialDaysInput.value) || 7) : 7;

  if (!newVersion) {
    alert('Por favor, informe a versão do sistema (ex: 1.3.4 ou 2.0.0).');
    return;
  }

  AppState.systemConfig.version = newVersion;
  AppState.systemConfig.supportWhatsapp = newWhatsapp;
  AppState.systemConfig.trialDaysDefault = newTrialDays;

  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(AppState.systemConfig));

  // Atualizar visualmente o selo de versão no topo
  updateVersionDisplay();

  alert(`✅ Configurações salvas com sucesso!\nA versão foi alterada para: Versão ${newVersion}`);
}

window.saveSystemConfig = saveSystemConfig;
window.updateVersionDisplay = updateVersionDisplay;
window.loadConfigForm = loadConfigForm;
