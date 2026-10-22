// ==========================================================================
// TECH UNION SOLUTIONS - APLICAÇÃO PRINCIPAL (APP.JS)
// ==========================================================================

const SUPABASE_CONFIG = {
  url: 'https://vyiixpbgeuvenmpdbxyx.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5aWl4cGJnZXV2ZW5tcGRieHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMDY5MjAsImV4cCI6MjEwNzY4MjkyMH0.DRiFMA_Pwm8kYUc2WMZaXjszRyfep7K44YOBVFs9_pE'
};

const STORAGE_KEYS = {
  USERS: 'tu_users_db_v1',
  CURRENT_USER: 'tu_current_user_v1',
  SOLUTIONS: 'tu_custom_solutions_v1',
  TICKER: 'tu_custom_ticker_v1',
  CONFIG: 'tu_system_config_v1',
  ACTIVE_VIEW: 'tu_active_view_v1',
  ADMIN_TAB: 'tu_admin_tab_v1',
  CARDS: 'tu_custom_cards_v1',
  ORDERS: 'tu_user_orders_v1',
  MENU: 'tu_custom_menu_v1',
  OFFICIAL_STORE_PRODUCTS: 'tu_official_store_products_v1',
  OFFICIAL_STORE_USERS: 'tu_official_store_users_v1',
  OFFICIAL_STORE_ORDERS: 'tu_official_store_orders_v1',
  OFFICIAL_STORE_SESSION: 'tu_official_store_session_v1',
  OFFICIAL_STORE_CART: 'tu_official_store_cart_v1'
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
  cards: [],
  orders: [],
  sidebarMenu: [],
  systemConfig: {},
  activeView: 'dashboard',
  officialStoreProducts: [],
  officialStoreUsers: [],
  officialStoreOrders: [],
  officialStoreUser: null,
  officialStoreCart: [],
  officialStoreFilterCategory: 'all',
  officialStoreSearchQuery: '',
  currentStoreProductDetail: null,
  currentStorePixOrder: null,
  storePixPollingInterval: null
};

// ==========================================================================
// CAIXA DE ALERTA PERSONALIZADA (Substitui o alerta nativo feio do navegador)
// Exibe sempre o cabeçalho oficial "SuporteServerSmart-Brasil Online"
// e elimina o aviso do navegador com traços "suporte-server-smart-brasil-online.vercel.app diz"
// ==========================================================================
window.alert = function(message) {
  let overlay = document.getElementById('customAlertOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'customAlertOverlay';
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '999999';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width: 440px; border: 1.5px solid rgba(168, 85, 247, 0.45); box-shadow: 0 10px 40px rgba(0,0,0,0.85), 0 0 30px rgba(168, 85, 247, 0.35); border-radius: 12px; background: #120a22; overflow: hidden; animation: portlinkFadeIn 0.25s ease;">
        <div class="modal-header" style="background: linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(91, 26, 141, 0.4)); padding: 12px 16px; border-bottom: 1px solid rgba(168, 85, 247, 0.3); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="assets/logo.png?v=2.0" alt="Logo" style="width: 24px; height: 24px; object-fit: contain; border-radius: 50%; border: 1px solid rgba(168, 85, 247, 0.5);">
            <span style="font-weight: 800; font-size: 13.5px; color: #ffffff; letter-spacing: 0.3px;">SuporteServerSmart-Brasil Online</span>
          </div>
          <button type="button" id="customAlertCloseBtn" style="background: transparent; border: none; color: #c4b5fd; font-size: 20px; cursor: pointer; padding: 2px 6px; line-height: 1;">&times;</button>
        </div>
        <div class="modal-body" style="padding: 18px 20px; font-size: 13px; color: #f1f5f9; line-height: 1.55; white-space: pre-line;" id="customAlertMessage">
        </div>
        <div style="padding: 10px 18px 14px; display: flex; justify-content: flex-end; background: #0c0617; border-top: 1px solid rgba(168, 85, 247, 0.15);">
          <button id="customAlertOkBtn" type="button" class="btn-primary-block" style="width: auto; min-width: 90px; padding: 7px 22px; margin: 0; font-size: 13px; font-weight: 700; border-radius: 6px; background: linear-gradient(135deg, #7c3aed, #9333ea); cursor: pointer;">
            OK
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const closeAlert = () => overlay.classList.remove('active');
    overlay.querySelector('#customAlertCloseBtn').addEventListener('click', closeAlert);
    overlay.querySelector('#customAlertOkBtn').addEventListener('click', closeAlert);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAlert();
    });
  }

  const msgBox = overlay.querySelector('#customAlertMessage');
  if (msgBox) msgBox.textContent = String(message || '');
  overlay.classList.add('active');
};

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  updateVersionDisplay();
  renderBrandCards();
  renderSidebarMenu();
  renderTicker();
  setupEventListeners();
  checkAuth();
  updateOrdersBadge();
  updateStoreCartBadge();

  // Garantir visão principal no Dashboard
  if (window.location.hash === '#loja-oficial') {
    window.location.hash = '';
  }

  // Sincronização em nuvem automática
  syncSystemConfigFromCloud();
  syncUsersFromCloud();
  syncCardsFromCloud();
  syncTickerFromCloud();
  syncMenuFromCloud();
});

function initStorage() {
  // 1. Configurações do Sistema
  const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
  AppState.systemConfig = savedConfig 
    ? { ...window.TECH_UNION_DATA.system, ...JSON.parse(savedConfig) }
    : { ...window.TECH_UNION_DATA.system };

  if (!AppState.systemConfig.mpAccessToken || AppState.systemConfig.mpAccessToken.trim() === '') {
    AppState.systemConfig.mpAccessToken = window.TECH_UNION_DATA.system.mpAccessToken;
  }

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

  // 4. Menu Lateral (Sidebar)
  const savedMenu = localStorage.getItem(STORAGE_KEYS.MENU);
  AppState.sidebarMenu = savedMenu
    ? JSON.parse(savedMenu)
    : JSON.parse(JSON.stringify(window.TECH_UNION_DATA.sidebarMenu || []));

  // Adiciona a nova aba Port Link apenas se não estiver presente na lista (sem recriar itens apagados pelo admin)
  if (!AppState.sidebarMenu.some(item => item.id === 'nav_port_link')) {
    const portLinkDef = (window.TECH_UNION_DATA && Array.isArray(window.TECH_UNION_DATA.sidebarMenu))
      ? (window.TECH_UNION_DATA.sidebarMenu.find(m => m.id === 'nav_port_link') || {
          id: 'nav_port_link',
          section: 'Sistema',
          label: 'Port Link',
          icon: 'fa-solid fa-network-wired',
          actionType: 'port_link',
          badge: 'NOVO',
          active: true
        })
      : {
          id: 'nav_port_link',
          section: 'Sistema',
          label: 'Port Link',
          icon: 'fa-solid fa-network-wired',
          actionType: 'port_link',
          badge: 'NOVO',
          active: true
        };

    const sysIdx = AppState.sidebarMenu.findIndex(item => item.section === 'Sistema');
    if (sysIdx >= 0) {
      AppState.sidebarMenu.splice(sysIdx, 0, JSON.parse(JSON.stringify(portLinkDef)));
    } else {
      AppState.sidebarMenu.push(JSON.parse(JSON.stringify(portLinkDef)));
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));
  }

  // Adiciona a nova aba FRP MTK Motorola apenas se não estiver presente na lista
  if (!AppState.sidebarMenu.some(item => item.id === 'nav_frp_mtk_moto')) {
    const frpMtkDef = (window.TECH_UNION_DATA && Array.isArray(window.TECH_UNION_DATA.sidebarMenu))
      ? (window.TECH_UNION_DATA.sidebarMenu.find(m => m.id === 'nav_frp_mtk_moto') || {
          id: 'nav_frp_mtk_moto',
          section: 'Sistema',
          label: 'FRP MTK Motorola',
          icon: 'fa-solid fa-mobile-screen-button',
          actionType: 'frp_mtk_moto',
          badge: 'NOVO',
          active: true
        })
      : {
          id: 'nav_frp_mtk_moto',
          section: 'Sistema',
          label: 'FRP MTK Motorola',
          icon: 'fa-solid fa-mobile-screen-button',
          actionType: 'frp_mtk_moto',
          badge: 'NOVO',
          active: true
        };

    const portLinkIdx = AppState.sidebarMenu.findIndex(item => item.id === 'nav_port_link');
    if (portLinkIdx >= 0) {
      AppState.sidebarMenu.splice(portLinkIdx + 1, 0, JSON.parse(JSON.stringify(frpMtkDef)));
    } else {
      const sysIdx = AppState.sidebarMenu.findIndex(item => item.section === 'Sistema');
      if (sysIdx >= 0) {
        AppState.sidebarMenu.splice(sysIdx, 0, JSON.parse(JSON.stringify(frpMtkDef)));
      } else {
        AppState.sidebarMenu.push(JSON.parse(JSON.stringify(frpMtkDef)));
      }
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));
  }

  // 5. Usuários
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

  // 6. Cards Customizados (com títulos, descrições, imagens, preços, arquivos, ativo e disponível)
  const savedCards = localStorage.getItem(STORAGE_KEYS.CARDS);
  let baseCards;
  if (savedCards !== null) {
    try {
      baseCards = JSON.parse(savedCards);
      if (!Array.isArray(baseCards)) {
        baseCards = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.cards || []));
      }
    } catch (e) {
      baseCards = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.cards || []));
    }
  } else {
    baseCards = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.cards || []));
  }
  AppState.cards = baseCards.map(c => ({
    ...c,
    price: c.price !== undefined ? parseFloat(c.price) : 29.90,
    fileUrl: c.fileUrl || 'https://suporteserversmart.com/download',
    active: c.active !== false,
    available: c.available !== false
  }));

  // 7. Pedidos / Compras
  const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  AppState.orders = savedOrders ? JSON.parse(savedOrders) : [];

  // 8. Remover aba Loja Oficial da Sidebar do site
  if (AppState.sidebarMenu && AppState.sidebarMenu.length > 0) {
    AppState.sidebarMenu = AppState.sidebarMenu.filter(item => item.id !== 'nav_official_store');
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));
  }
  if (localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW) === 'officialStoreView') {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, 'dashboard');
    AppState.activeView = 'dashboard';
  }

  const savedStoreProducts = localStorage.getItem(STORAGE_KEYS.OFFICIAL_STORE_PRODUCTS);
  let storeProductsList = [];
  try {
    storeProductsList = savedStoreProducts ? JSON.parse(savedStoreProducts) : [];
  } catch (e) {
    storeProductsList = [];
  }
  const defaultStoreCatalog = (window.TECH_UNION_DATA && Array.isArray(window.TECH_UNION_DATA.officialStoreProducts))
    ? window.TECH_UNION_DATA.officialStoreProducts
    : [];

  if (!Array.isArray(storeProductsList) || storeProductsList.length < defaultStoreCatalog.length) {
    const existingIds = new Set((storeProductsList || []).map(p => p.id));
    defaultStoreCatalog.forEach(dp => {
      if (!existingIds.has(dp.id)) {
        storeProductsList.push(JSON.parse(JSON.stringify(dp)));
      }
    });
    localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_PRODUCTS, JSON.stringify(storeProductsList));
  }
  AppState.officialStoreProducts = storeProductsList;

  const savedStoreUsers = localStorage.getItem(STORAGE_KEYS.OFFICIAL_STORE_USERS);
  AppState.officialStoreUsers = savedStoreUsers
    ? JSON.parse(savedStoreUsers)
    : JSON.parse(JSON.stringify(window.TECH_UNION_DATA.officialStoreUsers || []));

  const savedStoreOrders = localStorage.getItem(STORAGE_KEYS.OFFICIAL_STORE_ORDERS);
  AppState.officialStoreOrders = savedStoreOrders
    ? JSON.parse(savedStoreOrders)
    : JSON.parse(JSON.stringify(window.TECH_UNION_DATA.officialStoreOrders || []));

  const savedStoreSession = localStorage.getItem(STORAGE_KEYS.OFFICIAL_STORE_SESSION);
  AppState.officialStoreUser = savedStoreSession ? JSON.parse(savedStoreSession) : null;

  const savedStoreCart = localStorage.getItem(STORAGE_KEYS.OFFICIAL_STORE_CART);
  AppState.officialStoreCart = savedStoreCart ? JSON.parse(savedStoreCart) : [];
}

// ==========================================================================
// RENDERIZAÇÃO DOS CARDS DO GRID (COM CONTROLE DE ATIVAÇÃO E DISPONIBILIDADE)
// ==========================================================================
function renderBrandCards() {
  const container = document.getElementById('cardsGrid');
  if (!container) return;

  container.innerHTML = '';
  // Usar AppState.cards se for array (respeitando remoções e desativações salvas pelo admin)
  const cards = Array.isArray(AppState.cards) ? AppState.cards : (window.TECH_UNION_DATA.cards || []);
  
  // Filtrar apenas cards ATIVOS (ocultar os desativados do site público)
  const visibleCards = cards.filter(c => c.active !== false);

  if (visibleCards.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted); background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-box-open" style="font-size: 32px; color: #c084fc; margin-bottom: 10px;"></i>
        <p style="font-size: 14px;">Nenhum card ativo no momento.</p>
      </div>
    `;
    return;
  }

  visibleCards.forEach(card => {
    const isAvailable = card.available !== false;
    const cardEl = document.createElement('div');
    cardEl.className = 'tech-card' + (!isAvailable ? ' card-unavailable' : '');

    // Imagem personalizada mantendo exatamente o tamanho do card (44x44px)
    const badgeHtml = card.imageUrl 
      ? `<img src="${escapeHtml(card.imageUrl)}" alt="${escapeHtml(card.name)}" class="card-brand-badge" style="object-fit: cover; padding: 0; border: 1px solid rgba(168, 85, 247, 0.35);">`
      : `<div class="card-brand-badge" style="background-color: ${card.badgeBg || '#1e1035'}; color: ${card.badgeColor || '#c084fc'};">
          <i class="${card.icon || 'fa-solid fa-folder-open'}"></i>
        </div>`;

    const priceText = card.price !== undefined ? `R$ ${parseFloat(card.price).toFixed(2).replace('.', ',')}` : 'R$ 29,90';

    const statusBadge = !isAvailable
      ? `<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5); padding: 3px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; display: inline-flex; align-items: center; gap: 4px;">
           <i class="fa-solid fa-ban"></i> Indisponível
         </span>`
      : `<span style="font-size: 11.5px; font-weight: 700; color: #4ade80; display: inline-flex; align-items: center;">
           <i class="fa-solid fa-tag" style="margin-right: 4px;"></i>${priceText}
         </span>`;

    const btnHtml = !isAvailable
      ? `<button class="btn-ver-solucoes btn-unavailable" onclick="handleBuyCardClick('${card.id}')" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
           <i class="fa-solid fa-ban"></i> Indisponível
         </button>`
      : `<button class="btn-ver-solucoes ${card.btnColor || 'btn-blue'}" onclick="handleBuyCardClick('${card.id}')" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
           <i class="fa-solid fa-cart-shopping"></i> Comprar Agora
         </button>`;

    cardEl.innerHTML = `
      <div class="card-top">
        ${badgeHtml}
        <div class="card-brand-info">
          <h3>${escapeHtml(card.name)}</h3>
          <p>${escapeHtml(card.description)}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
            ${statusBadge}
            ${!isAvailable ? `<span style="font-size: 11px; text-decoration: line-through; color: #94a3b8;">${priceText}</span>` : ''}
          </div>
        </div>
      </div>
      ${btnHtml}
    `;
    container.appendChild(cardEl);
  });
}

function handleBuyCardClick(cardId) {
  const cards = Array.isArray(AppState.cards) ? AppState.cards : (window.TECH_UNION_DATA.cards || []);
  const card = cards.find(c => c.id === cardId);
  if (!card) return;

  if (card.available === false) {
    alert(`⚠️ ITEM INDISPONÍVEL!\n\nO produto "${card.name}" está temporariamente INDISPONÍVEL para compra.\n\nNão é possível realizar a compra deste item agora. Por favor, volte mais tarde ou entre em contato com nosso suporte!`);
    return;
  }

  openCheckoutModal(cardId);
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

    // Se for o Master Admin e a view salva for adminView, restaurar sem sair do Painel Admin no F5!
    if (isMasterAdmin) {
      const savedView = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
      const savedTab = localStorage.getItem(STORAGE_KEYS.ADMIN_TAB) || 'tab-users';
      if (savedView === 'adminView') {
        showAdminView(savedTab);
      } else {
        showDashboardView();
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_VIEW);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TAB);
      showDashboardView();
    }

  } else {
    // Não logado: Exibir botão de login e cadastro no banner com os dias de teste dinâmicos
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_VIEW);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TAB);
    showDashboardView();

    const trialDays = (AppState.systemConfig && AppState.systemConfig.trialDaysDefault !== undefined) 
      ? parseInt(AppState.systemConfig.trialDaysDefault) 
      : 7;

    userCardEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; align-items: flex-end;">
          <span style="font-size: 12px; font-weight: 700; color: #ffffff;">Visitante Técnico</span>
          <span style="font-size: 11px; color: #4ade80; font-weight: 700;">
            <i class="fa-solid fa-gift"></i> <span class="trial-days-val">${trialDays}</span> Dias Grátis
          </span>
        </div>
        <button class="btn-login-cta" onclick="openAuthModal('login')">
          <i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar
        </button>
        <button class="btn-plan-premium" onclick="openAuthModal('register')">
          <i class="fa-solid fa-user-plus"></i> Cadastre-se (<span class="trial-days-val">${trialDays}</span>D Grátis)
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
  const forgotForm = document.getElementById('forgotForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegBtn = document.getElementById('tabRegBtn');
  const tabForgotBtn = document.getElementById('tabForgotBtn');
  const authModalTitle = document.getElementById('authModalTitle');

  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
  if (forgotForm) forgotForm.style.display = 'none';

  if (tabLoginBtn) tabLoginBtn.classList.remove('active');
  if (tabRegBtn) tabRegBtn.classList.remove('active');
  if (tabForgotBtn) tabForgotBtn.classList.remove('active');

  if (tab === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (tabLoginBtn) tabLoginBtn.classList.add('active');
    if (authModalTitle) authModalTitle.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket" style="color: #c084fc; margin-right: 8px;"></i> Acesso à Plataforma Técnica';
  } else if (tab === 'register') {
    if (registerForm) registerForm.style.display = 'block';
    if (tabRegBtn) tabRegBtn.classList.add('active');
    if (authModalTitle) authModalTitle.innerHTML = '<i class="fa-solid fa-user-plus" style="color: #10b981; margin-right: 8px;"></i> Cadastrar Novo Técnico';
  } else if (tab === 'forgot') {
    if (forgotForm) forgotForm.style.display = 'block';
    if (tabForgotBtn) tabForgotBtn.classList.add('active');
    if (authModalTitle) authModalTitle.innerHTML = '<i class="fa-solid fa-key" style="color: #f59e0b; margin-right: 8px;"></i> Redefinir Senha do Técnico';
  }
}

// Redefinir Senha do Cliente pelo Gmail / E-mail da Conta
async function handleResetPassword(e) {
  e.preventDefault();
  const emailInput = document.getElementById('resetEmail').value.trim().toLowerCase();
  const newPassword = document.getElementById('resetNewPassword').value;
  const confirmPassword = document.getElementById('resetConfirmPassword').value;

  if (!emailInput || !newPassword) {
    alert('Por favor, preencha o seu e-mail/Gmail e a nova senha.');
    return;
  }

  if (newPassword.length < 4) {
    alert('A nova senha deve ter no mínimo 4 caracteres.');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('As senhas não coincidem. Digite a mesma senha nos dois campos!');
    return;
  }

  // Proteção da conta mestre do administrador
  if (emailInput === MASTER_ADMIN.email) {
    alert('A conta oficial do Administrador Geral possui credenciais mestres protegidas e exclusivas.');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Atualizando senha...';
  }

  // 1. Procurar usuário no cache local
  let user = AppState.users.find(u => u.email && u.email.toLowerCase() === emailInput);

  // 2. Se não estiver no cache local, buscar diretamente no banco em nuvem Supabase
  if (!user) {
    try {
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/resellers?email=eq.${encodeURIComponent(emailInput)}`, {
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
        }
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && cloudData.length > 0) {
          const cu = cloudData[0];
          let meta = {};
          if (cu.role && (cu.role.startsWith('{') || cu.role.startsWith('['))) {
            try { meta = JSON.parse(cu.role); } catch(err) {}
          }
          user = {
            id: cu.id,
            username: cu.name || emailInput.split('@')[0],
            email: emailInput,
            whatsapp: meta.whatsapp || '',
            password: newPassword,
            role: 'tecnico',
            isAdmin: false,
            plan: meta.plan || 'Plano Técnico Autorizado',
            daysRemaining: meta.daysRemaining !== undefined ? meta.daysRemaining : 7,
            expireDate: meta.expireDate || calculateExpireDate(meta.daysRemaining || 7),
            status: meta.status || 'active',
            createdAt: cu.created_at ? new Date(cu.created_at).toLocaleDateString('pt-BR') : '18/10/2026'
          };
          AppState.users.push(user);
        }
      }
    } catch(err) {
      console.warn('Erro ao consultar usuário na nuvem para redefinir senha:', err);
    }
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  }

  if (!user) {
    alert('Não encontramos nenhuma conta cadastrada com o e-mail: ' + emailInput + '\nPor favor, verifique se digitou o e-mail correto ou crie uma conta na aba "Cadastrar Novo Técnico".');
    return;
  }

  // 3. Atualizar a nova senha no cache e banco de dados
  user.password = newPassword;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));

  // 4. Salvar na nuvem Supabase imediatamente
  await saveUserToCloud(user);

  // Limpar formulário de redefinição
  document.getElementById('forgotForm').reset();

  alert(`✅ Senha alterada com sucesso para ${user.username}!\nVocê já pode entrar na sua conta com a nova senha criada.`);

  // Direcionar imediatamente para a aba de login com o e-mail preenchido
  switchAuthTab('login');
  document.getElementById('loginIdentifier').value = emailInput;
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginPassword').focus();
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

  // Salvar novo usuário imediatamente no banco de dados na nuvem Supabase
  saveUserToCloud(newUser);

  // Resetar formulário de cadastro
  document.getElementById('registerForm').reset();

  // Direcionar imediatamente para a tela de login
  switchAuthTab('login');
  document.getElementById('loginIdentifier').value = username;
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginPassword').focus();

  alert(`Cadastro realizado com sucesso, ${username}!\nPor favor, insira suas credenciais para entrar na plataforma.`);
}

// Executar Login (com verificação direta do Administrador Geral e consulta à nuvem)
async function handleLogin(e) {
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

  // 2. Verificação de Usuários Comuns (Técnicos) no cache local
  let user = AppState.users.find(u => 
    (u.email.toLowerCase() === loginInput || u.username.toLowerCase() === loginInput) && u.password === password
  );

  // Se não encontrou no cache local, tentar sincronizar da nuvem Supabase em tempo real
  if (!user) {
    try {
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/resellers?or=(email.eq.${encodeURIComponent(loginInput)},name.eq.${encodeURIComponent(loginInput)})`, {
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
        }
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && cloudData.length > 0) {
          const cu = cloudData[0];
          let meta = {};
          if (cu.role && (cu.role.startsWith('{') || cu.role.startsWith('['))) {
            try { meta = JSON.parse(cu.role); } catch(e){}
          }
          if (meta.password === password) {
            user = {
              id: cu.id,
              username: cu.name,
              email: cu.email.toLowerCase(),
              whatsapp: meta.whatsapp || '',
              password: meta.password,
              role: 'tecnico',
              isAdmin: false,
              plan: meta.plan || 'Plano Técnico Autorizado',
              daysRemaining: meta.daysRemaining !== undefined ? meta.daysRemaining : 7,
              expireDate: meta.expireDate || calculateExpireDate(meta.daysRemaining || 7),
              status: meta.status || 'active',
              createdAt: cu.created_at ? new Date(cu.created_at).toLocaleDateString('pt-BR') : '18/10/2026'
            };
            AppState.users.push(user);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));
          }
        }
      }
    } catch(err) {
      console.warn('Erro ao consultar usuário na nuvem:', err);
    }
  }

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
    showDashboardView();
    return;
  }

  // Persistir que o Admin está no painel para não sair ao atualizar a página (F5)
  AppState.activeView = 'admin';
  localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, 'adminView');
  localStorage.setItem(STORAGE_KEYS.ADMIN_TAB, initialTab);

  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('adminView').style.display = 'block';
  const storeView = document.getElementById('officialStoreView');
  if (storeView) storeView.style.display = 'none';
  const ordersView = document.getElementById('ordersView');
  if (ordersView) ordersView.style.display = 'none';

  // Atualizar botões da sidebar
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const adminNavItem = document.getElementById('navAdminLink');
  if (adminNavItem) adminNavItem.classList.add('active');

  renderAdminUsersTable();
  switchAdminTab(initialTab);

  // Sincronizar usuários da nuvem em tempo real
  syncUsersFromCloud();
}

function showDashboardView() {
  AppState.activeView = 'dashboard';
  localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, 'dashboardView');
  document.getElementById('dashboardView').style.display = 'block';
  document.getElementById('adminView').style.display = 'none';
  const storeView = document.getElementById('officialStoreView');
  if (storeView) storeView.style.display = 'none';
  const ordersView = document.getElementById('ordersView');
  if (ordersView) ordersView.style.display = 'none';

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const dashNavItem = document.getElementById('navDashboardLink');
  if (dashNavItem) dashNavItem.classList.add('active');
}

function switchAdminTab(tabId) {
  // Salvar aba ativa para restaurar no F5
  localStorage.setItem(STORAGE_KEYS.ADMIN_TAB, tabId);

  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

  const btn = document.getElementById(`btn-${tabId}`);
  const content = document.getElementById(tabId);
  if (btn) btn.classList.add('active');
  if (content) content.style.display = 'block';

  if (tabId === 'tab-users') {
    renderAdminUsersTable();
  }
  if (tabId === 'tab-cards') {
    renderAdminCardsTable();
  }
  if (tabId === 'tab-ticker') {
    renderAdminTickerTable();
    const dateInput = document.getElementById('newTickerDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toLocaleDateString('pt-BR');
    }
  }
  if (tabId === 'tab-menu') {
    renderAdminMenuTable();
  }
  if (tabId === 'tab-config') {
    loadConfigForm();
  }
  if (tabId === 'tab-store-products') {
    renderAdminStoreProducts();
  }
  if (tabId === 'tab-store-users') {
    renderAdminStoreUsers();
  }
  if (tabId === 'tab-store-orders') {
    renderAdminStoreOrders();
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
  saveUserToCloud(user);
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
  saveUserToCloud(user);
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
function updateAllConfigDisplays() {
  const cfg = AppState.systemConfig || {};
  const version = cfg.version || '1.3.5';
  const trialDays = cfg.trialDaysDefault !== undefined ? parseInt(cfg.trialDaysDefault) : 7;

  // 1. Selo de Versão no topo
  const heroVersionText = document.getElementById('heroVersionText');
  if (heroVersionText) {
    heroVersionText.innerText = version;
  }

  // 2. Selo de Dias de Teste no Topo
  const heroTrialDaysText = document.getElementById('heroTrialDaysText');
  if (heroTrialDaysText) {
    heroTrialDaysText.innerText = trialDays;
  }

  // 3. Todos os elementos com a classe .trial-days-val na página
  document.querySelectorAll('.trial-days-val').forEach(el => {
    el.innerText = trialDays;
  });

  // 4. Preencher formulário de configuração do admin se estiver aberto
  const cfgTrialDays = document.getElementById('cfgTrialDays');
  if (cfgTrialDays && document.activeElement !== cfgTrialDays) {
    cfgTrialDays.value = trialDays;
  }
  const cfgVersion = document.getElementById('cfgVersion');
  if (cfgVersion && document.activeElement !== cfgVersion) {
    cfgVersion.value = version;
  }

  // 5. Atualizar o card do usuário na barra superior (para visitantes e logados)
  checkAuth();
}

function updateVersionDisplay() {
  updateAllConfigDisplays();
}

function loadConfigForm() {
  const cfg = AppState.systemConfig || {};
  const cfgVersion = document.getElementById('cfgVersion');
  const cfgWhatsapp = document.getElementById('cfgWhatsapp');
  const cfgTrialDays = document.getElementById('cfgTrialDays');
  const cfgMpAccessToken = document.getElementById('cfgMpAccessToken');

  if (cfgVersion) cfgVersion.value = cfg.version || '1.3.5';
  if (cfgWhatsapp) cfgWhatsapp.value = cfg.supportWhatsapp || '';
  if (cfgTrialDays) cfgTrialDays.value = cfg.trialDaysDefault !== undefined ? cfg.trialDaysDefault : 7;
  if (cfgMpAccessToken) cfgMpAccessToken.value = cfg.mpAccessToken || '';
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
  const mpAccessTokenInput = document.getElementById('cfgMpAccessToken');

  const newVersion = versionInput ? versionInput.value.trim() : '';
  const newWhatsapp = whatsappInput ? whatsappInput.value.trim() : '';
  const newTrialDays = trialDaysInput ? (parseInt(trialDaysInput.value) || 7) : 7;
  const newMpAccessToken = mpAccessTokenInput ? mpAccessTokenInput.value.trim() : '';

  if (!newVersion) {
    alert('Por favor, informe a versão do sistema (ex: 1.3.4 ou 2.0.0).');
    return;
  }

  AppState.systemConfig.version = newVersion;
  AppState.systemConfig.supportWhatsapp = newWhatsapp;
  AppState.systemConfig.trialDaysDefault = newTrialDays;
  AppState.systemConfig.mpAccessToken = newMpAccessToken;

  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(AppState.systemConfig));

  // 1. Atualizar todos os usuários que estão no período de teste para os novos dias
  AppState.users.forEach(u => {
    if (u.email && u.email.toLowerCase() !== MASTER_ADMIN.email) {
      if (!u.plan || u.plan.includes('Teste') || u.daysRemaining <= 30) {
        u.daysRemaining = newTrialDays;
        u.expireDate = calculateExpireDate(newTrialDays);
        saveUserToCloud(u);
      }
    }
  });
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));

  if (AppState.currentUser && AppState.currentUser.email && AppState.currentUser.email.toLowerCase() !== MASTER_ADMIN.email) {
    AppState.currentUser.daysRemaining = newTrialDays;
    AppState.currentUser.expireDate = calculateExpireDate(newTrialDays);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(AppState.currentUser));
  }

  // 2. Atualizar todos os selos, botões e formulários do site
  updateAllConfigDisplays();

  // 3. Atualizar a tabela de gestão de usuários do admin
  renderAdminUsersTable();

  // 4. Salvar no Supabase para que TODOS os clientes em qualquer aparelho vejam instantaneamente!
  fetch(`${SUPABASE_CONFIG.url}/rest/v1/services`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_CONFIG.key,
      'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id: 'system_version_config',
      name: newVersion,
      category: 'system_config',
      status: 'active',
      price_brl: 0,
      cost_brl: 0,
      description: JSON.stringify(AppState.systemConfig)
    })
  }).then(() => {
    console.log('Versão, dias de teste e Mercado Pago sincronizados na nuvem com sucesso!');
  }).catch(err => {
    console.warn('Erro ao sincronizar versão na nuvem:', err);
  });

  alert(`✅ Configurações salvas com sucesso!\n• Versão: Versão ${newVersion}\n• Dias de Acesso Teste: ${newTrialDays} dias\n• Credenciais do Mercado Pago salvas!\nTodos os usuários do site público e cadastrados já foram atualizados!`);
}

// ==========================================================================
// SINCRONIZAÇÃO EM NUVEM (SUPABASE)
// ==========================================================================

async function syncSystemConfigFromCloud() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services?id=eq.system_version_config`, {
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
      }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.length > 0) {
      const item = data[0];
      let configData = {};
      if (item.description) {
        try {
          configData = typeof item.description === 'string' ? JSON.parse(item.description) : item.description;
        } catch (e) {
          console.warn('Erro ao ler config da nuvem:', e);
        }
      }
      AppState.systemConfig = {
        ...AppState.systemConfig,
        ...configData,
        version: item.name || configData.version || AppState.systemConfig.version || '1.3.4',
        trialDaysDefault: configData.trialDaysDefault !== undefined ? parseInt(configData.trialDaysDefault) : (AppState.systemConfig.trialDaysDefault || 7)
      };
      if (!AppState.systemConfig.mpAccessToken || AppState.systemConfig.mpAccessToken.trim() === '') {
        AppState.systemConfig.mpAccessToken = window.TECH_UNION_DATA.system.mpAccessToken;
      }
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(AppState.systemConfig));

      // Se houver usuário técnico comum logado em teste, atualizar para os dias configurados
      if (AppState.currentUser && AppState.currentUser.email && AppState.currentUser.email.toLowerCase() !== MASTER_ADMIN.email) {
        if (!AppState.currentUser.plan || AppState.currentUser.plan.includes('Teste') || AppState.currentUser.daysRemaining <= 30) {
          AppState.currentUser.daysRemaining = AppState.systemConfig.trialDaysDefault;
          AppState.currentUser.expireDate = calculateExpireDate(AppState.systemConfig.trialDaysDefault);
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(AppState.currentUser));
        }
      }

      updateAllConfigDisplays();
    }
  } catch (err) {
    console.warn('Falha na sincronização de configurações:', err);
  }
}

async function syncUsersFromCloud() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/resellers?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
      }
    });
    if (!res.ok) return;
    const cloudUsers = await res.json();
    if (!Array.isArray(cloudUsers)) return;

    let hasChanges = false;
    cloudUsers.forEach(cu => {
      if (!cu.email) return;
      const emailLower = cu.email.toLowerCase();
      if (emailLower === MASTER_ADMIN.email) return;

      let meta = {};
      if (cu.role && (cu.role.startsWith('{') || cu.role.startsWith('['))) {
        try {
          meta = JSON.parse(cu.role);
        } catch (e) {}
      }

      const existingIndex = AppState.users.findIndex(u => u.email && u.email.toLowerCase() === emailLower);
      const userObj = {
        id: cu.id || ('usr_' + Date.now()),
        username: cu.name || meta.username || emailLower.split('@')[0],
        email: emailLower,
        whatsapp: meta.whatsapp || '',
        password: meta.password || '123456',
        role: 'tecnico',
        isAdmin: false,
        plan: meta.plan || 'Plano Técnico Autorizado',
        daysRemaining: meta.daysRemaining !== undefined ? meta.daysRemaining : 7,
        expireDate: meta.expireDate || calculateExpireDate(meta.daysRemaining || 7),
        status: meta.status || 'active',
        createdAt: cu.created_at ? new Date(cu.created_at).toLocaleDateString('pt-BR') : '18/10/2026'
      };

      if (existingIndex >= 0) {
        AppState.users[existingIndex] = { ...AppState.users[existingIndex], ...userObj };
      } else {
        AppState.users.push(userObj);
      }
      hasChanges = true;
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));
      if (document.getElementById('adminView') && document.getElementById('adminView').style.display === 'block') {
        renderAdminUsersTable();
      }
    }
  } catch (err) {
    console.warn('Falha na sincronização de usuários da nuvem:', err);
  }
}

async function saveUserToCloud(user) {
  if (!user || (user.email && user.email.toLowerCase() === MASTER_ADMIN.email)) return;
  try {
    const payload = {
      id: user.id || ('usr_' + Date.now()),
      name: user.username,
      email: user.email.toLowerCase(),
      role: JSON.stringify({
        role: 'tecnico',
        whatsapp: user.whatsapp || '',
        password: user.password || '',
        daysRemaining: user.daysRemaining !== undefined ? user.daysRemaining : 7,
        expireDate: user.expireDate || '',
        status: user.status || 'active',
        plan: user.plan || 'Plano Técnico'
      }),
      balance_brl: 0
    };

    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/resellers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Erro ao salvar usuário na nuvem:', err);
  }
}

async function refreshAdminUsers() {
  const tbody = document.getElementById('adminUsersTbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #a78bfa;"><i class="fa-solid fa-spinner fa-spin"></i> Sincronizando usuários cadastrados na nuvem...</td></tr>';
  }
  await syncUsersFromCloud();
  renderAdminUsersTable();
}

// ==========================================================================
// MODAL DE PERFIL DO TÉCNICO & TROCA DE SENHA
// ==========================================================================
function openProfileModal() {
  const u = AppState.currentUser;
  if (!u) {
    openAuthModal('login');
    return;
  }

  const modal = document.getElementById('profileModal');
  const body = document.getElementById('profileModalBody');
  if (!modal || !body) return;

  const isMaster = !!(u.email && u.email.toLowerCase() === MASTER_ADMIN.email);

  body.innerHTML = `
    <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div class="user-avatar-sm" style="width: 44px; height: 44px; font-size: 18px;">
          ${escapeHtml(u.username.substring(0, 2).toUpperCase())}
        </div>
        <div>
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 700;">${escapeHtml(u.username)}</h3>
          <span style="font-size: 12px; color: #c4b5fd;">${escapeHtml(u.email)}</span>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12.5px; border-top: 1px solid rgba(168, 85, 247, 0.15); padding-top: 10px;">
        <div>Status da Licença: <strong style="color: #4ade80;">${isMaster ? 'Vitalício' : `${u.daysRemaining} dias`}</strong></div>
        <div>WhatsApp: <strong style="color: #ffffff;">${escapeHtml(u.whatsapp || '-')}</strong></div>
        <div>Plano: <strong style="color: #c084fc;">${escapeHtml(u.plan || 'Técnico')}</strong></div>
        <div>Vencimento: <strong style="color: #fde047;">${isMaster ? 'Nunca' : (u.expireDate || 'Ativo')}</strong></div>
      </div>
    </div>

    ${!isMaster ? `
      <form onsubmit="handleProfileChangePassword(event)">
        <h4 style="font-size: 14px; color: #ffffff; margin-bottom: 12px; font-weight: 700;">
          <i class="fa-solid fa-lock" style="color: #c084fc; margin-right: 6px;"></i> Alterar Minha Senha
        </h4>
        <div class="form-group" style="margin-bottom: 12px;">
          <label>Nova Senha:</label>
          <input type="password" id="profileNewPassword" placeholder="Digite sua nova senha" required minlength="4">
        </div>
        <div class="form-group" style="margin-bottom: 16px;">
          <label>Confirmar Nova Senha:</label>
          <input type="password" id="profileConfirmPassword" placeholder="Confirme a nova senha" required minlength="4">
        </div>
        <button type="submit" class="btn-primary-block" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
          <i class="fa-solid fa-floppy-disk"></i> Atualizar Minha Senha
        </button>
      </form>
    ` : ''}

    <div style="margin-top: 16px; text-align: right;">
      <button class="btn-ticker-all" onclick="closeProfileModal()">Fechar</button>
    </div>
  `;

  modal.classList.add('active');
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.remove('active');
}

async function handleProfileChangePassword(e) {
  e.preventDefault();
  if (!AppState.currentUser) return;

  const newPass = document.getElementById('profileNewPassword').value;
  const confPass = document.getElementById('profileConfirmPassword').value;

  if (!newPass || newPass.length < 4) {
    alert('A nova senha deve ter no mínimo 4 caracteres.');
    return;
  }

  if (newPass !== confPass) {
    alert('As senhas não coincidem!');
    return;
  }

  AppState.currentUser.password = newPass;
  const index = AppState.users.findIndex(u => u.email && u.email.toLowerCase() === AppState.currentUser.email.toLowerCase());
  if (index >= 0) {
    AppState.users[index].password = newPass;
  }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(AppState.currentUser));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(AppState.users));

  await saveUserToCloud(AppState.currentUser);
  closeProfileModal();
  alert('✅ Sua senha foi alterada com sucesso!');
}

// ==========================================================================
// GESTÃO DOS CARDS / PRODUTOS PELO PAINEL ADMIN
// ==========================================================================
function renderAdminCardsTable() {
  const tbody = document.getElementById('adminCardsTbody');
  if (!tbody) return;

  const cards = Array.isArray(AppState.cards) ? AppState.cards : (window.TECH_UNION_DATA.cards || []);
  
  if (!cards || cards.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
          Nenhum card cadastrado. Clique em Restaurar Cards Padrão ou Adicione um Novo Card acima!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cards.map(c => {
    const isAct = c.active !== false;
    const isAvail = c.available !== false;

    const thumbHtml = c.imageUrl 
      ? `<img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.name)}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(168, 85, 247, 0.4);">`
      : `<div style="width: 44px; height: 44px; border-radius: 8px; background: ${c.badgeBg || '#1e1035'}; color: ${c.badgeColor || '#c084fc'}; display: flex; align-items: center; justify-content: center; font-size: 18px;">
          <i class="${c.icon || 'fa-solid fa-folder-open'}"></i>
        </div>`;

    const priceFormatted = c.price !== undefined ? `R$ ${parseFloat(c.price).toFixed(2).replace('.', ',')}` : 'R$ 29,90';
    const fileUrlText = c.fileUrl 
      ? `<a href="${escapeHtml(c.fileUrl)}" target="_blank" style="color: #38bdf8; text-decoration: underline; font-size: 11.5px; word-break: break-all;"><i class="fa-solid fa-link"></i> ${escapeHtml(c.fileUrl.length > 24 ? c.fileUrl.substring(0, 24) + '...' : c.fileUrl)}</a>` 
      : '<span style="color: #ef4444; font-size: 11px;">Sem link configurado</span>';

    const activeBadge = isAct
      ? `<span class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 11px; font-weight: 700;">
           <i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i> ATIVO
         </span>`
      : `<span class="badge-pill" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 11px; font-weight: 700;">
           <i class="fa-solid fa-circle-xmark" style="margin-right: 4px;"></i> DESATIVADO
         </span>`;

    const availBadge = isAvail
      ? `<span class="badge-pill" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-size: 11px; font-weight: 700;">
           <i class="fa-solid fa-check" style="margin-right: 4px;"></i> DISPONÍVEL
         </span>`
      : `<span class="badge-pill" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.5); font-size: 11px; font-weight: 800;">
           <i class="fa-solid fa-ban" style="margin-right: 4px;"></i> INDISPONÍVEL
         </span>`;

    const toggleActiveBtn = isAct
      ? `<button type="button" class="btn-ticker-all" style="padding: 4px 8px; font-size: 11px; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35); color: #fca5a5;" onclick="toggleCardActive('${c.id}')" title="Ocultar do site público">
           <i class="fa-solid fa-eye-slash"></i> Desativar
         </button>`
      : `<button type="button" class="btn-ticker-all" style="padding: 4px 8px; font-size: 11px; background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.35); color: #86efac;" onclick="toggleCardActive('${c.id}')" title="Exibir no site público">
           <i class="fa-solid fa-eye"></i> Ativar
         </button>`;

    const toggleAvailBtn = isAvail
      ? `<button type="button" class="btn-ticker-all" style="padding: 4px 8px; font-size: 11px; background: rgba(234, 179, 8, 0.15); border-color: rgba(234, 179, 8, 0.4); color: #fde047;" onclick="toggleCardAvailable('${c.id}')" title="Marcar como Indisponível (bloqueia compras)">
           <i class="fa-solid fa-ban"></i> Indisponível
         </button>`
      : `<button type="button" class="btn-ticker-all" style="padding: 4px 8px; font-size: 11px; background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #7dd3fc;" onclick="toggleCardAvailable('${c.id}')" title="Marcar como Disponível (libera compras)">
           <i class="fa-solid fa-check"></i> Disponível
         </button>`;

    return `
      <tr style="${!isAct ? 'opacity: 0.6;' : ''}">
        <td>${thumbHtml}</td>
        <td>
          <strong style="color: #ffffff; font-size: 13.5px;">${escapeHtml(c.name)}</strong><br>
          <span style="font-size: 10px; color: #94a3b8;">ID: ${escapeHtml(c.id)}</span>
          <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 2px;">${escapeHtml(c.description)}</div>
        </td>
        <td>
          <strong style="color: #4ade80;">${priceFormatted}</strong>
        </td>
        <td>${activeBadge}</td>
        <td>${availBadge}</td>
        <td>${fileUrlText}</td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${toggleActiveBtn}
            ${toggleAvailBtn}
            <button class="btn-action-sm btn-action-green" onclick="openEditCardModal('${c.id}')" title="Editar este Card">
              <i class="fa-solid fa-pen"></i> Editar
            </button>
            <button type="button" class="btn-ticker-all" style="padding: 4px 8px; font-size: 11px; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #fca5a5;" onclick="handleDeleteCard('${c.id}')" title="Excluir card permanentemente">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleCardActive(cardId) {
  if (!Array.isArray(AppState.cards)) {
    AppState.cards = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.cards || []));
  }
  const card = AppState.cards.find(c => c.id === cardId);
  if (!card) return;

  card.active = card.active === false ? true : false;
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(AppState.cards));

  renderBrandCards();
  renderAdminCardsTable();
  await saveCardsToCloud();
}

async function toggleCardAvailable(cardId) {
  if (!Array.isArray(AppState.cards)) {
    AppState.cards = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.cards || []));
  }
  const card = AppState.cards.find(c => c.id === cardId);
  if (!card) return;

  card.available = card.available === false ? true : false;
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(AppState.cards));

  renderBrandCards();
  renderAdminCardsTable();
  await saveCardsToCloud();
}

async function handleDeleteCard(cardId) {
  if (!Array.isArray(AppState.cards)) {
    AppState.cards = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.cards || []));
  }
  const card = AppState.cards.find(c => c.id === cardId);
  const name = card ? card.name : 'este card';

  if (!confirm(`Deseja realmente excluir o card "${name}" permanentemente do catálogo?`)) {
    return;
  }

  AppState.cards = AppState.cards.filter(c => c.id !== cardId);
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(AppState.cards));

  renderBrandCards();
  renderAdminCardsTable();
  await saveCardsToCloud();
  alert(`Card "${name}" excluído com sucesso!`);
}

async function handleAddCard(e) {
  e.preventDefault();
  const name = document.getElementById('newCardName').value.trim();
  const description = document.getElementById('newCardDescription').value.trim();
  const price = parseFloat(document.getElementById('newCardPrice').value) || 29.90;
  const imageUrl = document.getElementById('newCardImageUrl').value.trim();
  const fileUrl = document.getElementById('newCardFileUrl').value.trim();
  const active = document.getElementById('newCardActive').value === 'true';
  const available = document.getElementById('newCardAvailable').value === 'true';

  if (!name) {
    alert('Por favor, informe o título do card.');
    return;
  }

  const newId = 'card_' + Date.now();
  const newCard = {
    id: newId,
    name: name,
    description: description,
    price: price,
    imageUrl: imageUrl,
    fileUrl: fileUrl,
    active: active,
    available: available,
    badgeBg: '#1e1035',
    badgeColor: '#c084fc',
    icon: 'fa-solid fa-folder-open',
    btnColor: 'btn-blue'
  };

  AppState.cards.push(newCard);
  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(AppState.cards));

  renderBrandCards();
  renderAdminCardsTable();
  document.getElementById('formAddCard').reset();
  await saveCardsToCloud();
  alert(`✅ Card "${name}" cadastrado com sucesso!`);
}

function openEditCardModal(cardId) {
  const card = AppState.cards.find(c => c.id === cardId);
  if (!card) return;

  document.getElementById('editCardId').value = card.id;
  document.getElementById('editCardName').value = card.name || '';
  document.getElementById('editCardDescription').value = card.description || '';
  document.getElementById('editCardImageUrl').value = card.imageUrl || '';
  document.getElementById('editCardPrice').value = card.price !== undefined ? card.price : 29.90;
  document.getElementById('editCardFileUrl').value = card.fileUrl || 'https://suporteserversmart.com/download';

  const activeSelect = document.getElementById('editCardActive');
  if (activeSelect) activeSelect.value = card.active !== false ? 'true' : 'false';

  const availSelect = document.getElementById('editCardAvailable');
  if (availSelect) availSelect.value = card.available !== false ? 'true' : 'false';

  document.getElementById('editCardModal').classList.add('active');
}

function closeEditCardModal() {
  document.getElementById('editCardModal').classList.remove('active');
}

async function handleSaveCardEdit(e) {
  e.preventDefault();
  const cardId = document.getElementById('editCardId').value;
  const name = document.getElementById('editCardName').value.trim();
  const description = document.getElementById('editCardDescription').value.trim();
  const imageUrl = document.getElementById('editCardImageUrl').value.trim();
  const price = parseFloat(document.getElementById('editCardPrice').value) || 29.90;
  const fileUrl = document.getElementById('editCardFileUrl').value.trim();

  const activeSelect = document.getElementById('editCardActive');
  const availableSelect = document.getElementById('editCardAvailable');
  const active = activeSelect ? activeSelect.value === 'true' : true;
  const available = availableSelect ? availableSelect.value === 'true' : true;

  const card = AppState.cards.find(c => c.id === cardId);
  if (!card) return;

  card.name = name;
  card.description = description;
  card.imageUrl = imageUrl;
  card.price = price;
  card.fileUrl = fileUrl;
  card.active = active;
  card.available = available;

  localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(AppState.cards));

  await saveCardsToCloud();

  renderBrandCards();
  renderAdminCardsTable();
  closeEditCardModal();
  alert(`✅ Card "${name}" atualizado com sucesso!\nAs configurações de visibilidade e disponibilidade já estão ativas no site.`);
}

async function resetCardsToDefault() {
  if (confirm('Deseja realmente restaurar todos os cards para as configurações padrão originais?')) {
    AppState.cards = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.cards)).map(c => ({
      ...c,
      price: 29.90,
      fileUrl: 'https://suporteserversmart.com/download',
      active: true,
      available: true
    }));
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(AppState.cards));
    await saveCardsToCloud();
    renderBrandCards();
    renderAdminCardsTable();
    alert('Cards restaurados para os padrões originais com sucesso!');
  }
}

async function saveCardsToCloud() {
  try {
    const payload = {
      id: 'system_cards_config',
      name: 'Cards Configuration',
      category: 'system_cards',
      status: 'active',
      price_brl: 0,
      cost_brl: 0,
      description: JSON.stringify(AppState.cards)
    };

    // 1. Tentar PATCH diretamente na linha existente (garante atualização confiável)
    let res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services?id=eq.system_cards_config`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ description: JSON.stringify(AppState.cards) })
    });

    let updated = false;
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        updated = true;
      }
    }

    // 2. Se o registro ainda não existia no banco, faz POST com resolução de duplicatas
    if (!updated) {
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services?on_conflict=id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    }
  } catch (err) {
    console.warn('Erro ao salvar cards na nuvem:', err);
  }
}

async function syncCardsFromCloud() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services?id=eq.system_cards_config`, {
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
      }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.length > 0 && data[0].description) {
      let parsed = null;
      try {
        parsed = typeof data[0].description === 'string' ? JSON.parse(data[0].description) : data[0].description;
      } catch (err) {
        console.warn('Erro ao parsear cards da nuvem:', err);
        return;
      }

      // Permite array vazio [] (quando o admin excluiu todos os cards)
      if (Array.isArray(parsed)) {
        AppState.cards = parsed.map(c => ({
          ...c,
          active: c.active !== false,
          available: c.available !== false
        }));
        localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(AppState.cards));
        renderBrandCards();
        if (document.getElementById('adminView') && document.getElementById('adminView').style.display === 'block') {
          renderAdminCardsTable();
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao sincronizar cards da nuvem:', err);
  }
}

// ==========================================================================
// CHECKOUT PIX MERCADO PAGO & LIBERAÇÃO DE DOWNLOAD
// ==========================================================================
let currentCheckoutCard = null;
let checkoutPollInterval = null;

function openCheckoutModal(cardId) {
  const cards = Array.isArray(AppState.cards) ? AppState.cards : (window.TECH_UNION_DATA.cards || []);
  const card = cards.find(c => c.id === cardId);
  if (!card) return;

  if (card.available === false) {
    alert(`⚠️ ITEM INDISPONÍVEL!\n\nO produto "${card.name}" está temporariamente INDISPONÍVEL para compra.\n\nNão é possível realizar a compra deste item no momento.`);
    return;
  }

  currentCheckoutCard = card;
  const modal = document.getElementById('checkoutModal');
  const body = document.getElementById('checkoutModalBody');

  const u = AppState.currentUser;
  const defaultName = u ? u.username : '';
  const defaultEmail = u ? u.email : '';
  const priceFormatted = card.price !== undefined ? `R$ ${parseFloat(card.price).toFixed(2).replace('.', ',')}` : 'R$ 29,90';

  const thumbHtml = card.imageUrl 
    ? `<img src="${escapeHtml(card.imageUrl)}" alt="${escapeHtml(card.name)}" style="width: 50px; height: 50px; border-radius: 10px; object-fit: cover; border: 1px solid rgba(168, 85, 247, 0.4);">`
    : `<div style="width: 50px; height: 50px; border-radius: 10px; background: ${card.badgeBg || '#1e1035'}; color: ${card.badgeColor || '#c084fc'}; display: flex; align-items: center; justify-content: center; font-size: 22px;">
        <i class="${card.icon || 'fa-solid fa-folder-open'}"></i>
      </div>`;

  body.innerHTML = `
    <!-- Top Product Card Summary -->
    <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 10px; padding: 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 12px;">
        ${thumbHtml}
        <div>
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 700; margin-bottom: 2px;">${escapeHtml(card.name)}</h3>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0;">${escapeHtml(card.description)}</p>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11px; color: #a78bfa;">Valor do Arquivo:</div>
        <div style="font-size: 20px; font-weight: 800; color: #4ade80;">${priceFormatted}</div>
      </div>
    </div>

    <!-- Step 1: Preencher Dados -->
    <div id="checkoutStep1">
      <div class="form-grid" style="margin-bottom: 14px;">
        <div class="form-group">
          <label>Seu Nome ou Usuário:</label>
          <input type="text" id="pixCustomerName" value="${escapeHtml(defaultName)}" placeholder="Nome do Técnico" required>
        </div>
        <div class="form-group">
          <label>Seu E-mail / Gmail (para envio do comprovante):</label>
          <input type="email" id="pixCustomerEmail" value="${escapeHtml(defaultEmail)}" placeholder="seu-email@gmail.com" required>
        </div>
      </div>
      <button type="button" class="btn-primary-block" style="background: linear-gradient(135deg, #009ee3, #007eb5); padding: 12px; font-size: 14px;" onclick="processMercadoPagoPix('${card.id}')">
        <i class="fa-brands fa-pix" style="font-size: 18px; margin-right: 6px;"></i> Pagar com PIX Mercado Pago & Liberar Download
      </button>
    </div>

    <!-- Step 2: Área do PIX & Confirmação -->
    <div id="checkoutStep2" style="display: none; text-align: center; margin-top: 10px;">
      <div id="pixLoadingBox" style="padding: 20px; color: #c4b5fd;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #009ee3;"></i>
        <p style="margin-top: 10px; font-size: 13px;">Gerando cobrança PIX no Mercado Pago...</p>
      </div>

      <div id="pixQrContainer" style="display: none;">
        <div style="background: #ffffff; padding: 12px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); margin-bottom: 8px;">
          <img id="pixQrImage" src="" alt="QR Code PIX Mercado Pago" style="width: 220px; height: 220px; display: block; object-fit: contain;">
        </div>
        <div id="pixCollectorHolder" style="display: none; font-size: 13px; color: #4ade80; margin-bottom: 8px; font-weight: 600;"></div>
        <div style="font-size: 12.5px; color: #e2e8f0; margin-bottom: 10px;">
          Abra o app do seu banco e escaneie o <strong>QR Code PIX</strong> acima.
        </div>

        <!-- Status de Aguardo em Tempo Real -->
        <div id="pixPollingBadge" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 999px; color: #38bdf8; font-size: 12.5px; font-weight: 600; margin-top: 6px;">
          <i class="fa-solid fa-spinner fa-spin"></i> Aguardando identificação do pagamento pelo Mercado Pago...
        </div>
      </div>

      <!-- Step 3: Pagamento Confirmado & Download Liberado -->
      <div id="pixApprovedContainer" style="display: none; padding: 15px; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 12px; margin-top: 10px;">
        <div style="width: 55px; height: 55px; border-radius: 50%; background: rgba(34, 197, 94, 0.2); color: #4ade80; font-size: 26px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="color: #4ade80; font-size: 18px; font-weight: 800; margin-bottom: 6px;">Pagamento Confirmado pelo Mercado Pago!</h3>
        <p style="font-size: 13px; color: #e2e8f0; margin-bottom: 16px;">
          O seu arquivo para download já foi liberado com sucesso.
        </p>
        <a id="downloadReleaseBtn" href="#" target="_blank" class="btn-primary-block" style="background: linear-gradient(135deg, #16a34a, #15803d); text-decoration: none; padding: 14px 20px; font-size: 15px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          <i class="fa-solid fa-download"></i> BAIXAR ARQUIVO AGORA
        </a>
        <div style="font-size: 11.5px; color: #a78bfa; margin-top: 14px;">
          <i class="fa-solid fa-box-open"></i> Este arquivo também foi adicionado à sua aba <strong>"Meus Pedidos"</strong> para você baixar quando quiser.
        </div>
      </div>

    </div>
  `;

  modal.classList.add('active');
}

function closeCheckoutModal() {
  if (checkoutPollInterval) clearInterval(checkoutPollInterval);
  document.getElementById('checkoutModal').classList.remove('active');
}

async function processMercadoPagoPix(cardId) {
  const card = AppState.cards.find(c => c.id === cardId);
  if (!card) return;

  const customerName = document.getElementById('pixCustomerName').value.trim() || 'Cliente Técnico';
  const customerEmail = document.getElementById('pixCustomerEmail').value.trim() || 'cliente@suporteserversmart.com';

  document.getElementById('checkoutStep1').style.display = 'none';
  document.getElementById('checkoutStep2').style.display = 'block';
  document.getElementById('pixLoadingBox').style.display = 'block';
  document.getElementById('pixQrContainer').style.display = 'none';
  document.getElementById('pixApprovedContainer').style.display = 'none';

  const defaultMpToken = 'APP_USR-2750012879381679-051115-2dc1610e908f48d05dd63736d9473db7-615957613';
  const mpToken = (AppState.systemConfig && AppState.systemConfig.mpAccessToken && AppState.systemConfig.mpAccessToken.trim().length > 15)
    ? AppState.systemConfig.mpAccessToken.trim()
    : defaultMpToken;

  try {
    const res = await fetch('/api/mercadopago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_pix',
        accessToken: mpToken,
        amount: card.price || 29.90,
        title: card.name,
        customerName: customerName,
        customerEmail: customerEmail
      })
    });

    const data = await res.json();
    document.getElementById('pixLoadingBox').style.display = 'none';

    if (data.success && (data.qr_code_base64 || data.qr_code || data.qr_code_url)) {
      document.getElementById('pixQrContainer').style.display = 'block';
      const qrImg = document.getElementById('pixQrImage');
      if (data.qr_code_base64) {
        qrImg.src = 'data:image/png;base64,' + data.qr_code_base64;
      } else if (data.qr_code_url) {
        qrImg.src = data.qr_code_url;
      } else if (data.qr_code) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qr_code)}`;
      }

      const holderEl = document.getElementById('pixCollectorHolder');
      if (holderEl) {
        const holderName = data.collector_name || 'Meire Izidoro';
        holderEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4ade80;"></i> Beneficiário: <strong>${escapeHtml(holderName)}</strong> (Mercado Pago)`;
        holderEl.style.display = 'block';
      }

      // Iniciar polling seguro para checar se o pagamento foi aprovado
      const paymentIdStr = String(data.payment_id || '');
      if (paymentIdStr && !paymentIdStr.startsWith('pay_')) {
        startPaymentPolling(paymentIdStr, cardId, customerEmail);
      }
    } else {
      alert('Erro ao gerar PIX no Mercado Pago: ' + (data.error || 'Tente novamente.'));
      document.getElementById('checkoutStep1').style.display = 'block';
      document.getElementById('checkoutStep2').style.display = 'none';
    }
  } catch (err) {
    console.error('Erro ao chamar API de PIX:', err);
    document.getElementById('pixLoadingBox').style.display = 'none';
    alert('Erro de conexão com o Mercado Pago. Por favor, tente novamente.');
    document.getElementById('checkoutStep1').style.display = 'block';
    document.getElementById('checkoutStep2').style.display = 'none';
  }
}

function copyPixCode() {
  const input = document.getElementById('pixCopiaColaInput');
  if (!input) return;
  input.select();
  navigator.clipboard.writeText(input.value);
  alert('Código PIX copiado para a área de transferência! Cole no aplicativo do seu banco.');
}

function startPaymentPolling(paymentId, cardId, customerEmail) {
  if (checkoutPollInterval) clearInterval(checkoutPollInterval);
  const defaultMpToken = 'APP_USR-2750012879381679-051115-2dc1610e908f48d05dd63736d9473db7-615957613';
  const mpToken = (AppState.systemConfig && AppState.systemConfig.mpAccessToken && AppState.systemConfig.mpAccessToken.trim().length > 15)
    ? AppState.systemConfig.mpAccessToken.trim()
    : defaultMpToken;

  const paymentIdStr = String(paymentId);

  checkoutPollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/mercadopago?action=check_payment&payment_id=${encodeURIComponent(paymentIdStr)}&accessToken=${encodeURIComponent(mpToken)}`);
      const data = await res.json();
      if (data.approved) {
        clearInterval(checkoutPollInterval);
        confirmPurchaseAndReleaseDownload(cardId, paymentIdStr, customerEmail);
      }
    } catch (e) {
      console.warn('Polling check error:', e);
    }
  }, 4000);
}

function simulatePaymentApproval(cardId) {
  const customerEmail = (document.getElementById('pixCustomerEmail') && document.getElementById('pixCustomerEmail').value) || (AppState.currentUser ? AppState.currentUser.email : 'cliente@teste.com');
  confirmPurchaseAndReleaseDownload(cardId, 'simulated_' + Date.now(), customerEmail);
}

function confirmPurchaseAndReleaseDownload(cardId, paymentId, customerEmail) {
  if (checkoutPollInterval) clearInterval(checkoutPollInterval);
  const card = AppState.cards.find(c => c.id === cardId);
  if (!card) return;

  document.getElementById('pixQrContainer').style.display = 'none';
  const approvedBox = document.getElementById('pixApprovedContainer');
  approvedBox.style.display = 'block';

  const downloadBtn = document.getElementById('downloadReleaseBtn');
  downloadBtn.href = card.fileUrl || 'https://suporteserversmart.com/download';

  // Registrar pedido
  const order = {
    id: 'ped_' + Date.now(),
    paymentId: paymentId,
    cardId: card.id,
    cardName: card.name,
    cardImageUrl: card.imageUrl || '',
    cardIcon: card.icon || 'fa-solid fa-folder-open',
    price: card.price || 29.90,
    fileUrl: card.fileUrl || 'https://suporteserversmart.com/download',
    date: new Date().toLocaleString('pt-BR'),
    customerEmail: customerEmail.toLowerCase(),
    status: 'approved'
  };

  AppState.orders.unshift(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(AppState.orders));
  updateOrdersBadge();
}

function showOrdersView() {
  AppState.activeView = 'orders';
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('adminView').style.display = 'none';
  const storeView = document.getElementById('officialStoreView');
  if (storeView) storeView.style.display = 'none';
  document.getElementById('ordersView').style.display = 'block';

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const ordersNav = document.getElementById('navOrdersLink');
  if (ordersNav) ordersNav.classList.add('active');

  renderOrdersList();
}

function renderOrdersList() {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  const u = AppState.currentUser;
  let userOrders = AppState.orders;
  if (u && u.email && u.email.toLowerCase() !== MASTER_ADMIN.email) {
    userOrders = AppState.orders.filter(o => !o.customerEmail || o.customerEmail.toLowerCase() === u.email.toLowerCase());
  }

  if (userOrders.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px; background: rgba(168, 85, 247, 0.05); border: 1px dashed rgba(168, 85, 247, 0.3); border-radius: 12px;">
        <i class="fa-solid fa-box-open" style="font-size: 40px; color: #a78bfa; margin-bottom: 12px;"></i>
        <h3 style="color: #ffffff; font-size: 16px; font-weight: 700;">Nenhum arquivo comprado ainda</h3>
        <p style="color: #94a3b8; font-size: 13px; margin: 6px auto 18px; max-width: 400px;">
          Quando você comprar uma solução ou arquivo via PIX, ele ficará disponível aqui permanentemente para você baixar quando quiser!
        </p>
        <button class="btn-primary-block" style="width: auto; padding: 10px 24px; display: inline-flex; align-items: center; gap: 8px;" onclick="showDashboardView()">
          <i class="fa-solid fa-store"></i> Ver Arquivos & Soluções Disponíveis
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = userOrders.map(order => {
    const thumbHtml = order.cardImageUrl 
      ? `<img src="${escapeHtml(order.cardImageUrl)}" alt="${escapeHtml(order.cardName)}" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover; border: 1px solid rgba(168, 85, 247, 0.4);">`
      : `<div style="width: 48px; height: 48px; border-radius: 10px; background: #1e1035; color: #c084fc; display: flex; align-items: center; justify-content: center; font-size: 20px;">
          <i class="${order.cardIcon || 'fa-solid fa-file-arrow-down'}"></i>
        </div>`;

    return `
      <div class="tech-card" style="margin-bottom: 14px; padding: 16px; background: #190f30; border: 1px solid rgba(168, 85, 247, 0.28); flex-direction: row; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 14px;">
          ${thumbHtml}
          <div>
            <h3 style="color: #ffffff; font-size: 15px; font-weight: 800; margin-bottom: 3px;">${escapeHtml(order.cardName)}</h3>
            <div style="font-size: 11.5px; color: #a78bfa;">
              <i class="fa-regular fa-calendar-check" style="margin-right: 4px;"></i> Comprado em: ${escapeHtml(order.date)} &bull; Valor: <strong style="color: #4ade80;">R$ ${parseFloat(order.price || 0).toFixed(2).replace('.', ',')}</strong>
            </div>
            <span class="badge-pill" style="margin-top: 6px; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.35); font-size: 10px; font-weight: 700;">
              ● Pagamento Confirmado &bull; Acesso Vitalício
            </span>
          </div>
        </div>

        <div>
          <a href="${escapeHtml(order.fileUrl)}" target="_blank" class="btn-primary-block" style="background: linear-gradient(135deg, #16a34a, #15803d); text-decoration: none; padding: 10px 20px; font-size: 13px; font-weight: 800; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-download"></i> BAIXAR ARQUIVO
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function updateOrdersBadge() {
  const badge = document.getElementById('sidebarOrdersBadge');
  if (!badge) return;
  const count = AppState.orders ? AppState.orders.length : 0;
  if (count > 0) {
    badge.innerText = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

window.saveSystemConfig = saveSystemConfig;
window.updateVersionDisplay = updateVersionDisplay;
window.loadConfigForm = loadConfigForm;
window.refreshAdminUsers = refreshAdminUsers;
window.syncUsersFromCloud = syncUsersFromCloud;
window.syncSystemConfigFromCloud = syncSystemConfigFromCloud;
window.handleResetPassword = handleResetPassword;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.handleProfileChangePassword = handleProfileChangePassword;
window.renderAdminCardsTable = renderAdminCardsTable;
window.openEditCardModal = openEditCardModal;
window.closeEditCardModal = closeEditCardModal;
window.handleSaveCardEdit = handleSaveCardEdit;
window.resetCardsToDefault = resetCardsToDefault;
window.handleBuyCardClick = handleBuyCardClick;
window.toggleCardActive = toggleCardActive;
window.toggleCardAvailable = toggleCardAvailable;
window.handleDeleteCard = handleDeleteCard;
window.handleAddCard = handleAddCard;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.processMercadoPagoPix = processMercadoPagoPix;
window.copyPixCode = copyPixCode;
window.simulatePaymentApproval = simulatePaymentApproval;
window.showOrdersView = showOrdersView;
window.renderOrdersList = renderOrdersList;
window.syncCardsFromCloud = syncCardsFromCloud;

// Funções de Gestão do Ticker de Notícias
window.renderAdminTickerTable = renderAdminTickerTable;
window.handleAddTicker = handleAddTicker;
window.handleDeleteTicker = handleDeleteTicker;
window.openEditTickerModal = openEditTickerModal;
window.closeEditTickerModal = closeEditTickerModal;
window.handleSaveTickerEdit = handleSaveTickerEdit;
window.resetTickerToDefault = resetTickerToDefault;
window.saveTickerToCloud = saveTickerToCloud;
window.syncTickerFromCloud = syncTickerFromCloud;

// Funções de Gestão do Menu Lateral (Sidebar)
window.renderSidebarMenu = renderSidebarMenu;
window.renderAdminMenuTable = renderAdminMenuTable;
window.toggleMenuItemActive = toggleMenuItemActive;
window.handleAddMenuItem = handleAddMenuItem;
window.openEditMenuItemModal = openEditMenuItemModal;
window.closeEditMenuItemModal = closeEditMenuItemModal;
window.handleSaveMenuItemEdit = handleSaveMenuItemEdit;
window.handleDeleteMenuItem = handleDeleteMenuItem;
window.resetSidebarMenuToDefault = resetSidebarMenuToDefault;
window.saveMenuToCloud = saveMenuToCloud;
window.syncMenuFromCloud = syncMenuFromCloud;

// ==========================================================================
// GESTÃO DO TICKER DE NOTÍCIAS / AVISOS ROLANTE PELO ADMIN
// ==========================================================================
function renderAdminTickerTable() {
  const tbody = document.getElementById('adminTickerTbody');
  if (!tbody) return;

  if (!AppState.tickerNews || AppState.tickerNews.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 24px; color: var(--text-muted);">
          Nenhum aviso ou notícia cadastrado no momento. Adicione um novo item acima!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = AppState.tickerNews.map((item) => {
    const brandName = escapeHtml(item.brand || 'GERAL');
    const badgeColor = '#c084fc';
    const badgeBg = 'rgba(168, 85, 247, 0.15)';

    return `
      <tr>
        <td>
          <span class="badge-pill" style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid rgba(168, 85, 247, 0.35); font-weight: 700; font-size: 11px;">
            ${brandName}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: #ffffff; font-size: 13px; line-height: 1.4;">
            ${escapeHtml(item.text)}
          </div>
        </td>
        <td>
          <span style="font-size: 12px; color: #94a3b8; font-family: monospace;">
            <i class="fa-regular fa-calendar-days" style="margin-right: 4px; color: #a78bfa;"></i>${escapeHtml(item.date || '')}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-ticker-all" style="padding: 4px 10px; font-size: 11px;" onclick="openEditTickerModal('${item.id}')">
              <i class="fa-solid fa-pen"></i> Editar
            </button>
            <button type="button" class="btn-ticker-all" style="padding: 4px 10px; font-size: 11px; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #fca5a5;" onclick="handleDeleteTicker('${item.id}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleAddTicker(e) {
  e.preventDefault();
  const textInput = document.getElementById('newTickerText');
  const brandInput = document.getElementById('newTickerBrand');
  const dateInput = document.getElementById('newTickerDate');

  const text = textInput ? textInput.value.trim() : '';
  const brand = brandInput ? brandInput.value.trim().toUpperCase() : 'GERAL';
  const date = dateInput && dateInput.value.trim() ? dateInput.value.trim() : new Date().toLocaleDateString('pt-BR');

  if (!text) {
    alert('Por favor, informe o texto do aviso ou notícia.');
    return;
  }

  const newItem = {
    id: 'tick_' + Date.now(),
    text: text,
    brand: brand,
    date: date
  };

  AppState.tickerNews.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.TICKER, JSON.stringify(AppState.tickerNews));

  renderTicker();
  renderAdminTickerTable();

  if (textInput) textInput.value = '';

  await saveTickerToCloud();

  alert('✅ Novo aviso adicionado com sucesso à barra rolante do site!');
}

async function handleDeleteTicker(id) {
  const item = AppState.tickerNews.find(t => String(t.id) === String(id));
  const desc = item ? item.text : 'este aviso';
  if (!confirm(`Deseja realmente remover do ticker rolante o aviso:\n"${desc}"?`)) {
    return;
  }

  AppState.tickerNews = AppState.tickerNews.filter(t => String(t.id) !== String(id));
  localStorage.setItem(STORAGE_KEYS.TICKER, JSON.stringify(AppState.tickerNews));

  renderTicker();
  renderAdminTickerTable();

  await saveTickerToCloud();
}

function openEditTickerModal(id) {
  const item = AppState.tickerNews.find(t => String(t.id) === String(id));
  if (!item) return;

  document.getElementById('editTickerId').value = item.id;
  document.getElementById('editTickerText').value = item.text || '';
  document.getElementById('editTickerBrand').value = item.brand || 'GERAL';
  document.getElementById('editTickerDate').value = item.date || new Date().toLocaleDateString('pt-BR');

  const modal = document.getElementById('editTickerModal');
  if (modal) modal.classList.add('active');
}

function closeEditTickerModal() {
  const modal = document.getElementById('editTickerModal');
  if (modal) modal.classList.remove('active');
}

async function handleSaveTickerEdit(e) {
  e.preventDefault();
  const id = document.getElementById('editTickerId').value;
  const text = document.getElementById('editTickerText').value.trim();
  const brand = document.getElementById('editTickerBrand').value.trim().toUpperCase();
  const date = document.getElementById('editTickerDate').value.trim();

  const item = AppState.tickerNews.find(t => String(t.id) === String(id));
  if (!item) return;

  item.text = text;
  item.brand = brand;
  item.date = date;

  localStorage.setItem(STORAGE_KEYS.TICKER, JSON.stringify(AppState.tickerNews));

  renderTicker();
  renderAdminTickerTable();
  closeEditTickerModal();

  await saveTickerToCloud();
  alert('✅ Aviso do ticker atualizado com sucesso!');
}

async function resetTickerToDefault() {
  if (confirm('Deseja realmente restaurar os avisos padrão do ticker?')) {
    AppState.tickerNews = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.tickerNews));
    localStorage.setItem(STORAGE_KEYS.TICKER, JSON.stringify(AppState.tickerNews));
    renderTicker();
    renderAdminTickerTable();
    await saveTickerToCloud();
    alert('Avisos do ticker restaurados com sucesso!');
  }
}

async function saveTickerToCloud() {
  try {
    await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: 'system_ticker_news',
        name: 'Ticker News Configuration',
        category: 'system_ticker',
        status: 'active',
        price_brl: 0,
        cost_brl: 0,
        description: JSON.stringify(AppState.tickerNews)
      })
    });
  } catch (err) {
    console.warn('Erro ao salvar ticker na nuvem:', err);
  }
}

async function syncTickerFromCloud() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services?id=eq.system_ticker_news`, {
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
      }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.length > 0 && data[0].description) {
      const parsed = typeof data[0].description === 'string' ? JSON.parse(data[0].description) : data[0].description;
      if (Array.isArray(parsed) && parsed.length > 0) {
        AppState.tickerNews = parsed;
        localStorage.setItem(STORAGE_KEYS.TICKER, JSON.stringify(AppState.tickerNews));
        renderTicker();
        if (document.getElementById('adminView') && document.getElementById('adminView').style.display === 'block') {
          renderAdminTickerTable();
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao sincronizar ticker da nuvem:', err);
  }
}

// ==========================================================================
// GESTÃO DINÂMICA DO MENU LATERAL (SIDEBAR) & CONTROLE DE VISIBILIDADE
// ==========================================================================
function renderSidebarMenu() {
  const container = document.getElementById('sidebarNavContainer');
  if (!container) return;

  const sections = ['Principal', 'Ferramentas', 'Sistema'];

  container.innerHTML = sections.map(secName => {
    // Filtrar estritamente apenas itens ATIVOS para exibir aos usuários!
    const items = (AppState.sidebarMenu || []).filter(item => item.section === secName && item.active !== false);
    if (items.length === 0) return '';

    const listHtml = items.map(item => {
      let badgeHtml = '';
      if (item.isOrders) {
        const count = AppState.orders ? AppState.orders.length : 0;
        badgeHtml = `<span class="nav-badge-new" id="sidebarOrdersBadge" style="display: ${count > 0 ? 'inline-block' : 'none'}; background: #0284c7;">${count}</span>`;
      } else if (item.badge && item.badge.trim() !== '') {
        badgeHtml = `<span class="nav-badge-new">${escapeHtml(item.badge)}</span>`;
      } else if (item.hasArrow) {
        badgeHtml = `<i class="fa-solid fa-angle-right" style="margin-left: auto; font-size: 10px;"></i>`;
      }

      let hrefAttr = 'href="javascript:void(0)"';
      let targetAttr = '';
      let onclickStr = '';

      // Se tiver link/URL configurado, redireciona diretamente ao clicar!
      if (item.linkUrl && item.linkUrl.trim() !== '') {
        const rawUrl = item.linkUrl.trim();
        const safeUrl = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/') || rawUrl.startsWith('#'))
          ? rawUrl
          : 'https://' + rawUrl;
        hrefAttr = `href="${escapeHtml(safeUrl)}"`;
        const targetVal = item.linkTarget || '_blank';
        targetAttr = `target="${targetVal}" rel="noopener noreferrer"`;
      } else if (item.actionType === 'dashboard') {
        onclickStr = 'showDashboardView()';
      } else if (item.actionType === 'brand') {
        onclickStr = `openSolutionsForBrand('${item.brandId || 'samsung'}', '${escapeHtml(item.brandName || item.label)}')`;
      } else if (item.actionType === 'all_news') {
        onclickStr = 'openAllNewsModal()';
      } else if (item.actionType === 'tool_modal') {
        onclickStr = `openToolsModal('${escapeHtml(item.toolCategory || item.label)}')`;
      } else if (item.actionType === 'official_store' || item.id === 'nav_official_store') {
        onclickStr = 'openOfficialStore()';
      } else if (item.actionType === 'port_link' || item.id === 'nav_port_link') {
        onclickStr = 'openPortLinkModal()';
      } else if (item.actionType === 'frp_mtk_moto' || item.id === 'nav_frp_mtk_moto') {
        onclickStr = 'openFrpMtkMotorolaModal()';
      } else if (item.actionType === 'orders') {
        onclickStr = 'showOrdersView()';
      } else {
        onclickStr = 'showDashboardView()';
      }

      const linkId = item.id === 'nav_dashboard' ? 'id="navDashboardLink"' : (item.id === 'nav_official_store' ? 'id="navOfficialStoreLink"' : (item.id === 'nav_orders' ? 'id="navOrdersLink"' : ''));
      const activeClass = (item.id === 'nav_dashboard' && AppState.activeView === 'dashboard') || (item.id === 'nav_official_store' && AppState.activeView === 'official_store') ? 'active' : '';

      return `
        <li>
          <a class="nav-item ${activeClass}" ${linkId} ${hrefAttr} ${targetAttr} ${onclickStr ? `onclick="${onclickStr}"` : ''}>
            <i class="${escapeHtml(item.icon || 'fa-solid fa-folder')}"></i>
            <span>${escapeHtml(item.label)}</span>
            ${badgeHtml}
          </a>
        </li>
      `;
    }).join('');

    const isCollapsed = localStorage.getItem('sidebar_section_collapsed_' + secName) === 'true';

    return `
      <div class="nav-section" id="navSection_${escapeHtml(secName)}">
        <div class="nav-section-title" onclick="toggleNavSection('${escapeHtml(secName)}')" style="cursor: pointer; user-select: none;" title="Clique para alternar o menu ${escapeHtml(secName)}">
          <span>${escapeHtml(secName)}</span>
          <button type="button" class="btn-toggle-nav-section ${isCollapsed ? 'is-collapsed' : ''}" id="btnToggle_${escapeHtml(secName)}" onclick="event.stopPropagation(); toggleNavSection('${escapeHtml(secName)}');" title="${isCollapsed ? 'Mostrar menu ' + escapeHtml(secName) : 'Esconder menu ' + escapeHtml(secName)}">
            <span class="toggle-text">${isCollapsed ? 'Mostrar' : 'Esconder'}</span>
            <i class="fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} toggle-icon"></i>
          </button>
        </div>
        <ul class="nav-list ${isCollapsed ? 'collapsed' : ''}" id="navList_${escapeHtml(secName)}">
          ${listHtml}
        </ul>
      </div>
    `;
  }).join('');
}

function toggleNavSection(secName) {
  const navList = document.getElementById('navList_' + secName);
  const btn = document.getElementById('btnToggle_' + secName);
  if (!navList) return;

  const isCurrentlyCollapsed = navList.classList.contains('collapsed');

  if (isCurrentlyCollapsed) {
    // Abrir / Mostrar o menu
    navList.classList.remove('collapsed');
    localStorage.setItem('sidebar_section_collapsed_' + secName, 'false');
    if (btn) {
      btn.classList.remove('is-collapsed');
      btn.title = 'Esconder menu ' + secName;
      const textSpan = btn.querySelector('.toggle-text');
      const icon = btn.querySelector('.toggle-icon');
      if (textSpan) textSpan.textContent = 'Esconder';
      if (icon) {
        icon.className = 'fa-solid fa-chevron-up toggle-icon';
      }
    }
  } else {
    // Fechar / Esconder o menu
    navList.classList.add('collapsed');
    localStorage.setItem('sidebar_section_collapsed_' + secName, 'true');
    if (btn) {
      btn.classList.add('is-collapsed');
      btn.title = 'Mostrar menu ' + secName;
      const textSpan = btn.querySelector('.toggle-text');
      const icon = btn.querySelector('.toggle-icon');
      if (textSpan) textSpan.textContent = 'Mostrar';
      if (icon) {
        icon.className = 'fa-solid fa-chevron-down toggle-icon';
      }
    }
  }
}
window.toggleNavSection = toggleNavSection;

function renderAdminMenuTable() {
  const tbody = document.getElementById('adminMenuTbody');
  if (!tbody) return;

  if (!AppState.sidebarMenu || AppState.sidebarMenu.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">
          Nenhuma opção no menu lateral cadastrada. Clique em Restaurar Menu Original acima!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = AppState.sidebarMenu.map(item => {
    const isAct = item.active !== false;
    const statusHtml = isAct
      ? `<span class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 11px; font-weight: 700;">
           <i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i> ATIVO (Visível)
         </span>`
      : `<span class="badge-pill" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 11px; font-weight: 700;">
           <i class="fa-solid fa-circle-xmark" style="margin-right: 4px;"></i> DESATIVADO (Oculto)
         </span>`;

    const toggleBtn = isAct
      ? `<button type="button" class="btn-ticker-all" style="padding: 4px 10px; font-size: 11px; background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35); color: #fca5a5;" onclick="toggleMenuItemActive('${item.id}')" title="Ocultar esta opção do site">
           <i class="fa-solid fa-eye-slash"></i> Desativar
         </button>`
      : `<button type="button" class="btn-ticker-all" style="padding: 4px 10px; font-size: 11px; background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.35); color: #86efac;" onclick="toggleMenuItemActive('${item.id}')" title="Exibir esta opção no site">
           <i class="fa-solid fa-eye"></i> Ativar
         </button>`;

    return `
      <tr style="${!isAct ? 'opacity: 0.65;' : ''}">
        <td>
          <span class="badge-pill" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35); font-weight: 700; font-size: 11px;">
            ${escapeHtml(item.section)}
          </span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 6px; background: #190f30; display: flex; align-items: center; justify-content: center; color: #c084fc; font-size: 14px; flex-shrink: 0;">
              <i class="${escapeHtml(item.icon || 'fa-solid fa-folder')}"></i>
            </div>
            <div>
              <strong style="color: #ffffff; font-size: 13.5px;">${escapeHtml(item.label)}</strong>
              ${item.linkUrl ? `
                <div style="font-size: 11px; color: #38bdf8; margin-top: 2px;">
                  <i class="fa-solid fa-link" style="margin-right: 4px;"></i>
                  <a href="${escapeHtml(item.linkUrl)}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${escapeHtml(item.linkUrl)}</a>
                  <span style="font-size: 9.5px; color: #94a3b8; margin-left: 4px;">(${item.linkTarget || '_blank'})</span>
                </div>
              ` : ''}
            </div>
          </div>
        </td>
        <td>
          ${item.badge ? `<span class="nav-badge-new" style="font-size: 10px;">${escapeHtml(item.badge)}</span>` : '<span style="color: var(--text-muted); font-size: 11px;">-</span>'}
        </td>
        <td>
          ${statusHtml}
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${toggleBtn}
            <button type="button" class="btn-ticker-all" style="padding: 4px 10px; font-size: 11px;" onclick="openEditMenuItemModal('${item.id}')">
              <i class="fa-solid fa-pen"></i> Editar
            </button>
            <button type="button" class="btn-ticker-all" style="padding: 4px 10px; font-size: 11px; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #fca5a5;" onclick="handleDeleteMenuItem('${item.id}')" title="Excluir opção permanentemente">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleMenuItemActive(id) {
  const item = AppState.sidebarMenu.find(m => m.id === id);
  if (!item) return;

  item.active = !item.active;
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));

  renderSidebarMenu();
  renderAdminMenuTable();

  await saveMenuToCloud();
}

async function handleAddMenuItem(e) {
  e.preventDefault();
  const label = document.getElementById('newMenuLabel').value.trim();
  const section = document.getElementById('newMenuSection').value;
  const icon = document.getElementById('newMenuIcon').value.trim() || 'fa-solid fa-folder-open';
  const badge = document.getElementById('newMenuBadge').value.trim();
  const linkUrl = document.getElementById('newMenuLink') ? document.getElementById('newMenuLink').value.trim() : '';
  const linkTarget = document.getElementById('newMenuTarget') ? document.getElementById('newMenuTarget').value : '_blank';

  if (!label) {
    alert('Por favor, informe o nome da opção.');
    return;
  }

  const newItem = {
    id: 'nav_custom_' + Date.now(),
    section: section,
    label: label,
    icon: icon,
    badge: badge,
    linkUrl: linkUrl,
    linkTarget: linkTarget,
    actionType: linkUrl ? 'external_link' : 'tool_modal',
    toolCategory: label,
    active: true
  };

  AppState.sidebarMenu.push(newItem);
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));

  renderSidebarMenu();
  renderAdminMenuTable();

  document.getElementById('formAddMenuItem').reset();
  await saveMenuToCloud();

  alert(`✅ Opção "${label}" adicionada ao menu lateral com sucesso!`);
}

function openEditMenuItemModal(id) {
  const item = AppState.sidebarMenu.find(m => m.id === id);
  if (!item) return;

  document.getElementById('editMenuItemId').value = item.id;
  document.getElementById('editMenuItemLabel').value = item.label || '';
  document.getElementById('editMenuItemSection').value = item.section || 'Principal';
  document.getElementById('editMenuItemIcon').value = item.icon || 'fa-solid fa-folder';
  document.getElementById('editMenuItemBadge').value = item.badge || '';
  document.getElementById('editMenuItemActive').value = item.active !== false ? 'true' : 'false';

  const linkInput = document.getElementById('editMenuItemLink');
  if (linkInput) linkInput.value = item.linkUrl || '';

  const targetSelect = document.getElementById('editMenuItemTarget');
  if (targetSelect) targetSelect.value = item.linkTarget || '_blank';

  const modal = document.getElementById('editMenuItemModal');
  if (modal) modal.classList.add('active');
}

function closeEditMenuItemModal() {
  const modal = document.getElementById('editMenuItemModal');
  if (modal) modal.classList.remove('active');
}

async function handleSaveMenuItemEdit(e) {
  e.preventDefault();
  const id = document.getElementById('editMenuItemId').value;
  const item = AppState.sidebarMenu.find(m => m.id === id);
  if (!item) return;

  item.label = document.getElementById('editMenuItemLabel').value.trim();
  item.section = document.getElementById('editMenuItemSection').value;
  item.icon = document.getElementById('editMenuItemIcon').value.trim();
  item.badge = document.getElementById('editMenuItemBadge').value.trim();
  item.active = document.getElementById('editMenuItemActive').value === 'true';

  const linkInput = document.getElementById('editMenuItemLink');
  item.linkUrl = linkInput ? linkInput.value.trim() : '';

  const targetSelect = document.getElementById('editMenuItemTarget');
  item.linkTarget = targetSelect ? targetSelect.value : '_blank';

  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));

  renderSidebarMenu();
  renderAdminMenuTable();
  closeEditMenuItemModal();

  await saveMenuToCloud();
  alert(`✅ Opção "${item.label}" atualizada com sucesso!\nO menu lateral já foi atualizado no site.`);
}

async function handleDeleteMenuItem(id) {
  const item = AppState.sidebarMenu.find(m => m.id === id);
  const name = item ? item.label : 'esta opção';
  if (!confirm(`Deseja realmente excluir a opção "${name}" do menu lateral?`)) {
    return;
  }

  AppState.sidebarMenu = AppState.sidebarMenu.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));

  renderSidebarMenu();
  renderAdminMenuTable();

  await saveMenuToCloud();
}

async function resetSidebarMenuToDefault() {
  if (confirm('Deseja realmente restaurar todas as opções do menu lateral para as originais de fábrica?')) {
    AppState.sidebarMenu = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.sidebarMenu));
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));
    renderSidebarMenu();
    renderAdminMenuTable();
    await saveMenuToCloud();
    alert('Menu lateral restaurado com sucesso para os padrões originais!');
  }
}

async function saveMenuToCloud() {
  try {
    const payload = {
      id: 'system_sidebar_menu',
      name: 'Sidebar Menu Configuration',
      category: 'system_menu',
      status: 'active',
      price_brl: 0,
      cost_brl: 0,
      description: JSON.stringify(AppState.sidebarMenu)
    };

    let res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services?id=eq.system_sidebar_menu`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ description: JSON.stringify(AppState.sidebarMenu) })
    });

    let updated = false;
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) updated = true;
    }

    if (!updated) {
      await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services?on_conflict=id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_CONFIG.key,
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
    }
  } catch (err) {
    console.warn('Erro ao salvar menu lateral na nuvem:', err);
  }
}

async function syncMenuFromCloud() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/services?id=eq.system_sidebar_menu`, {
      headers: {
        'apikey': SUPABASE_CONFIG.key,
        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`
      }
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.length > 0 && data[0].description) {
      let parsed = null;
      try {
        parsed = typeof data[0].description === 'string' ? JSON.parse(data[0].description) : data[0].description;
      } catch (e) {
        console.warn('Erro ao interpretar menu lateral da nuvem:', e);
        return;
      }

      if (Array.isArray(parsed)) {
        let menuNeedsCloudSave = false;

        // 1. Remover Loja Oficial caso exista na nuvem
        if (parsed.some(item => item.id === 'nav_official_store')) {
          parsed = parsed.filter(item => item.id !== 'nav_official_store');
          menuNeedsCloudSave = true;
        }

        // 2. Garantir que Port Link exista no menu Sistema
        if (!parsed.some(item => item.id === 'nav_port_link')) {
          const portLinkDef = (window.TECH_UNION_DATA && Array.isArray(window.TECH_UNION_DATA.sidebarMenu))
            ? window.TECH_UNION_DATA.sidebarMenu.find(m => m.id === 'nav_port_link')
            : null;
          if (portLinkDef) {
            const sysIdx = parsed.findIndex(item => item.section === 'Sistema');
            if (sysIdx >= 0) {
              parsed.splice(sysIdx, 0, JSON.parse(JSON.stringify(portLinkDef)));
            } else {
              parsed.push(JSON.parse(JSON.stringify(portLinkDef)));
            }
            menuNeedsCloudSave = true;
          }
        }

        // 3. Garantir que FRP MTK Motorola exista no menu Sistema
        if (!parsed.some(item => item.id === 'nav_frp_mtk_moto')) {
          const frpMtkDef = (window.TECH_UNION_DATA && Array.isArray(window.TECH_UNION_DATA.sidebarMenu))
            ? window.TECH_UNION_DATA.sidebarMenu.find(m => m.id === 'nav_frp_mtk_moto')
            : null;
          if (frpMtkDef) {
            const portIdx = parsed.findIndex(item => item.id === 'nav_port_link');
            if (portIdx >= 0) {
              parsed.splice(portIdx + 1, 0, JSON.parse(JSON.stringify(frpMtkDef)));
            } else {
              const sysIdx = parsed.findIndex(item => item.section === 'Sistema');
              if (sysIdx >= 0) parsed.splice(sysIdx, 0, JSON.parse(JSON.stringify(frpMtkDef)));
              else parsed.push(JSON.parse(JSON.stringify(frpMtkDef)));
            }
            menuNeedsCloudSave = true;
          }
        }

        AppState.sidebarMenu = parsed;
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(AppState.sidebarMenu));
        renderSidebarMenu();

        if (menuNeedsCloudSave) {
          saveMenuToCloud();
        }

        if (document.getElementById('adminView') && document.getElementById('adminView').style.display === 'block') {
          renderAdminMenuTable();
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao sincronizar menu lateral da nuvem:', err);
  }
}

// ==========================================================================
// PORT LINK - SERVIÇO DE ACESSO USB REMOTO (MODAL, PLANOS & WHATSAPP)
// ==========================================================================
let currentSelectedPortLinkPlan = null;

function renderPortLinkPlans() {
  const container = document.getElementById('portLinkPlansContainer');
  if (!container) return;

  const plans = (window.TECH_UNION_DATA && window.TECH_UNION_DATA.portLinkPlans) || [
    { id: "portlink_1h", name: "Aluguel de 1 Hora", duration: "1 Hora", price: 35.00, badge: "EXPRESS", popular: false, desc: "Acesso rápido e direto sem VPN para um reparo imediato." },
    { id: "portlink_24h", name: "Aluguel de 24 Horas", duration: "24 Horas", price: 45.00, badge: "DIÁRIO", popular: false, desc: "Acesso de 24h para múltiplos procedimentos no dia." },
    { id: "portlink_1m", name: "Plano de 1 Mês", duration: "30 Dias", price: 100.00, badge: "POPULAR", popular: true, desc: "Perfeito para assistência técnica com fluxo frequente." },
    { id: "portlink_3m", name: "Plano de 3 Meses", duration: "90 Dias", price: 200.00, badge: "TRIMESTRAL", popular: false, desc: "Economia e estabilidade por 3 meses contínuos." },
    { id: "portlink_6m", name: "Plano de 6 Meses", duration: "180 Dias", price: 150.00, badge: "SEMESTRAL", popular: false, desc: "Super promoção especial de 6 meses." },
    { id: "portlink_1y", name: "Plano de 1 Ano", duration: "365 Dias", price: 200.00, badge: "ANUAL VIP", popular: false, desc: "Acesso ilimitado de 1 ano completo com suporte prioritário." }
  ];

  if (!currentSelectedPortLinkPlan) {
    currentSelectedPortLinkPlan = plans.find(p => p.popular) || plans[0];
  }

  container.innerHTML = plans.map(plan => {
    const isSel = currentSelectedPortLinkPlan && currentSelectedPortLinkPlan.id === plan.id;
    return `
      <div class="portlink-plan-card ${isSel ? 'active' : ''}" onclick="selectPortLinkPlan('${plan.id}')">
        <div class="portlink-plan-header">
          <span class="portlink-plan-badge">${escapeHtml(plan.badge)}</span>
          <div class="portlink-plan-radio">
            <i class="fa-solid fa-check"></i>
          </div>
        </div>
        <div class="portlink-plan-title" title="${escapeHtml(plan.name)}">${escapeHtml(plan.name)}</div>
        <div class="portlink-plan-footer">
          <span class="portlink-plan-duration">${escapeHtml(plan.duration)}</span>
          <div class="portlink-plan-price">
            <small style="font-size: 10px; color: #cbd5e1;">R$</small> ${plan.price.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>
    `;
  }).join('');

  updatePortLinkSummary();
}

function selectPortLinkPlan(planId) {
  const plans = (window.TECH_UNION_DATA && window.TECH_UNION_DATA.portLinkPlans) || [];
  const found = plans.find(p => p.id === planId);
  if (found) {
    currentSelectedPortLinkPlan = found;
    renderPortLinkPlans();
  }
}

function updatePortLinkSummary() {
  const sumEl = document.getElementById('portLinkSummaryPlan');
  if (sumEl && currentSelectedPortLinkPlan) {
    sumEl.innerHTML = `<strong>${escapeHtml(currentSelectedPortLinkPlan.name)}</strong> (R$ ${currentSelectedPortLinkPlan.price.toFixed(2).replace('.', ',')})`;
  }
}

function openPortLinkModal() {
  const modal = document.getElementById('portLinkModal');
  if (!modal) return;

  // Esconder alerta de sucesso caso estivesse aberto
  const alertEl = document.getElementById('portLinkSuccessAlert');
  if (alertEl) alertEl.style.display = 'none';

  // Se o usuário logado tiver dados, preenche automaticamente
  const u = AppState.currentUser;
  const nameInput = document.getElementById('portLinkCustomerName');
  const waInput = document.getElementById('portLinkCustomerWhatsapp');
  if (nameInput && !nameInput.value.trim() && u) {
    nameInput.value = u.username || '';
  }
  if (waInput && !waInput.value.trim() && u) {
    waInput.value = u.whatsapp || '';
  }

  renderPortLinkPlans();
  modal.classList.add('active');
}

function closePortLinkModal() {
  const modal = document.getElementById('portLinkModal');
  if (modal) modal.classList.remove('active');
}

function sendPortLinkOrderWhatsApp() {
  if (!currentSelectedPortLinkPlan) {
    alert('Por favor, selecione um dos planos do Port Link para prosseguir.');
    return;
  }

  const nameInput = document.getElementById('portLinkCustomerName');
  const waInput = document.getElementById('portLinkCustomerWhatsapp');

  const customerName = nameInput ? nameInput.value.trim() : '';
  const customerWa = waInput ? waInput.value.trim() : '';

  if (!customerName) {
    alert('Por favor, informe seu nome ou nome da sua assistência técnica.');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!customerWa) {
    alert('Por favor, informe seu número de WhatsApp com DDD para contato.');
    if (waInput) waInput.focus();
    return;
  }

  const planName = currentSelectedPortLinkPlan.name;
  const planPrice = `R$ ${currentSelectedPortLinkPlan.price.toFixed(2).replace('.', ',')}`;
  const planDuration = currentSelectedPortLinkPlan.duration;

  // Montar mensagem para o WhatsApp do suporte oficial 41996378029
  const message = 
    `🚀 *NOVO PEDIDO - PORT LINK USB REMOTO*\n` +
    `--------------------------------------\n` +
    `🔌 *Serviço:* PORT LINK (Serviço de Acesso USB Remoto)\n` +
    `📦 *Plano Escolhido:* ${planName}\n` +
    `💰 *Valor:* ${planPrice}\n` +
    `⏳ *Duração:* ${planDuration}\n` +
    `--------------------------------------\n` +
    `👤 *Cliente:* ${customerName}\n` +
    `📱 *WhatsApp:* ${customerWa}\n` +
    `--------------------------------------\n` +
    `Olá Suporte Server Smart! Acabei de solicitar a contratação do Port Link pelo site. Aguardo instruções para ativação do meu acesso!`;

  const targetPhone = '5541996378029';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`;

  // Atualizar link manual na tela
  const manualBtn = document.getElementById('portLinkManualWaBtn');
  if (manualBtn) {
    manualBtn.href = whatsappUrl;
  }

  // Exibir a mensagem na tela conforme solicitado pelo usuário:
  // "AO TER ENVIADO APAREÇA UMA MENSAGEN NA TELA PEDIDO ENVIADO A NOSSA EQUIPE DE SUPORTE AGUARDE ENTRAREMOS EM CONTATO"
  const alertEl = document.getElementById('portLinkSuccessAlert');
  if (alertEl) {
    alertEl.style.display = 'block';
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Disparar abertura imediata do WhatsApp (via link simulado)
  try {
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.warn('Falha no link clique:', e);
  }

  // Redirecionamento direto garantido para o WhatsApp (sem bloqueio de pop-up no navegador/celular)
  setTimeout(() => {
    window.location.href = whatsappUrl;
  }, 400);
}

window.openPortLinkModal = openPortLinkModal;
window.closePortLinkModal = closePortLinkModal;
window.selectPortLinkPlan = selectPortLinkPlan;
window.sendPortLinkOrderWhatsApp = sendPortLinkOrderWhatsApp;

// ==========================================================================
// FRP MTK MOTOROLA - CONTA GOOGLE VIA FASTBOOT
// ==========================================================================
let currentFrpMotorolaCategory = 'all';
let currentFrpMotorolaSearch = '';
let currentSelectedMotorolaModel = null;
let currentSelectedFrpService = 'frp'; // 'frp' | 'payjoy' | 'frp_payjoy'

function openFrpMtkMotorolaModal() {
  const modal = document.getElementById('frpMtkMotorolaModal');
  if (!modal) return;

  // Esconder mensagem de sucesso anterior
  const alertEl = document.getElementById('frpMtkSuccessAlert');
  if (alertEl) alertEl.style.display = 'none';

  // Se o usuário logado tiver dados, preenche automaticamente
  const u = AppState.currentUser;
  const nameInput = document.getElementById('frpCustomerName');
  const waInput = document.getElementById('frpCustomerWhatsapp');
  if (nameInput && !nameInput.value.trim() && u) {
    nameInput.value = u.username || '';
  }
  if (waInput && !waInput.value.trim() && u) {
    waInput.value = u.whatsapp || '';
  }

  // Resetar busca e selecionar primeiro modelo por padrão se nenhum estiver selecionado
  const searchInput = document.getElementById('frpMtkSearchInput');
  if (searchInput) searchInput.value = '';
  currentFrpMotorolaSearch = '';
  currentFrpMotorolaCategory = 'all';

  const models = window.TECH_UNION_DATA.motorolaMtkModels || [];
  if (!currentSelectedMotorolaModel && models.length > 0) {
    currentSelectedMotorolaModel = models[0];
  }

  // Atualizar botões de abas de categoria
  document.querySelectorAll('.frp-cat-tab').forEach(tab => {
    if (tab.dataset.category === 'all') {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  selectFrpServiceType(currentSelectedFrpService || 'frp');
  renderMotorolaModels();
  updateFrpSelectedSummary();

  modal.classList.add('active');
}

function closeFrpMtkMotorolaModal() {
  const modal = document.getElementById('frpMtkMotorolaModal');
  if (modal) modal.classList.remove('active');
}

function filterFrpMotorolaCategory(category) {
  currentFrpMotorolaCategory = category;

  document.querySelectorAll('.frp-cat-tab').forEach(tab => {
    if (tab.dataset.category === category) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  renderMotorolaModels();
}

function filterFrpMotorolaSearch(query) {
  currentFrpMotorolaSearch = (query || '').trim().toLowerCase();
  renderMotorolaModels();
}

function renderMotorolaModels() {
  const container = document.getElementById('frpMotorolaModelsGrid');
  if (!container) return;

  const allModels = window.TECH_UNION_DATA.motorolaMtkModels || [];
  let filtered = allModels;

  // Filtro por categoria
  if (currentFrpMotorolaCategory && currentFrpMotorolaCategory !== 'all') {
    filtered = filtered.filter(m => m.category === currentFrpMotorolaCategory);
  }

  // Filtro por busca de texto (código ou nome)
  if (currentFrpMotorolaSearch) {
    filtered = filtered.filter(m => 
      m.code.toLowerCase().includes(currentFrpMotorolaSearch) || 
      m.name.toLowerCase().includes(currentFrpMotorolaSearch) ||
      m.categoryLabel.toLowerCase().includes(currentFrpMotorolaSearch)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 24px 10px; color: var(--text-muted); font-size: 12px;">
        <i class="fa-solid fa-mobile-screen" style="font-size: 24px; color: #94a3b8; margin-bottom: 6px; display: block;"></i>
        Nenhum modelo encontrado para a busca "${escapeHtml(currentFrpMotorolaSearch)}".
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(model => {
    const isSelected = currentSelectedMotorolaModel && currentSelectedMotorolaModel.id === model.id;
    return `
      <div class="frp-model-card ${isSelected ? 'selected' : ''}" onclick="selectMotorolaModel('${model.id}')" title="Clique para selecionar ${escapeHtml(model.name)}">
        <div class="frp-model-card-header">
          <span class="frp-model-code">${escapeHtml(model.code)}</span>
          <span class="frp-model-chip"><i class="fa-solid fa-microchip"></i> ${escapeHtml(model.chip)}</span>
        </div>
        <div class="frp-model-name">${escapeHtml(model.name)}</div>
        <div class="frp-model-footer">
          <span class="frp-model-mode"><i class="fa-solid fa-bolt"></i> ${escapeHtml(model.mode)}</span>
          <span class="frp-model-check">
            <i class="fa-solid ${isSelected ? 'fa-circle-check' : 'fa-circle'}"></i>
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function selectMotorolaModel(modelId) {
  const allModels = window.TECH_UNION_DATA.motorolaMtkModels || [];
  const found = allModels.find(m => m.id === modelId);
  if (found) {
    currentSelectedMotorolaModel = found;
    renderMotorolaModels();
    updateFrpSelectedSummary();
  }
}

function selectFrpServiceType(serviceType) {
  currentSelectedFrpService = serviceType;

  // Atualizar visual dos botões/cards de serviço
  document.querySelectorAll('.frp-service-card').forEach(card => {
    if (card.dataset.service === serviceType) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  // Atualizar aviso de formatação
  const noticeText = document.getElementById('frpFormattingNoticeText');
  if (noticeText) {
    if (serviceType === 'frp') {
      noticeText.innerHTML = '<strong>⚠️ ATENÇÃO OBRIGATÓRIA (FRP):</strong> Como o serviço é <strong>Conta Google (FRP)</strong>, já deixe o aparelho <strong>FORMATADO DE FÁBRICA</strong> e ligado na tela de início (ou já em modo Fastboot) antes de chamar!';
    } else if (serviceType === 'frp_payjoy') {
      noticeText.innerHTML = '<strong>⚠️ ATENÇÃO OBRIGATÓRIA (FRP + PAYJOY):</strong> Como o serviço inclui <strong>FRP Conta Google</strong>, já deixe o aparelho <strong>FORMATADO DE FÁBRICA</strong> e no modo Fastboot para remoção completa!';
    } else {
      noticeText.innerHTML = '<strong>ℹ️ ATENÇÃO (PAYJOY):</strong> Para o desbloqueio <strong>PayJoy</strong>, conecte o aparelho via cabo USB no modo Fastboot e mantenha o AnyDesk aberto!';
    }
  }

  updateFrpSelectedSummary();
}

function updateFrpSelectedSummary() {
  const modelEl = document.getElementById('frpSummaryModelName');
  const serviceEl = document.getElementById('frpSummaryServiceName');

  if (modelEl) {
    if (currentSelectedMotorolaModel) {
      modelEl.innerHTML = `<strong style="color: #60a5fa;">${escapeHtml(currentSelectedMotorolaModel.code)}</strong> - ${escapeHtml(currentSelectedMotorolaModel.name)}`;
    } else {
      modelEl.textContent = 'Nenhum selecionado';
    }
  }

  if (serviceEl) {
    if (currentSelectedFrpService === 'frp') {
      serviceEl.textContent = 'Conta Google (FRP)';
    } else if (currentSelectedFrpService === 'payjoy') {
      serviceEl.textContent = 'Bloqueio PayJoy';
    } else if (currentSelectedFrpService === 'frp_payjoy') {
      serviceEl.textContent = 'FRP + PAYJOY (Combo Completo)';
    }
  }
}

function sendFrpMotorolaOrderWhatsApp() {
  if (!currentSelectedMotorolaModel) {
    alert('Por favor, selecione um dos modelos Motorola na lista acima.');
    return;
  }

  const nameInput = document.getElementById('frpCustomerName');
  const waInput = document.getElementById('frpCustomerWhatsapp');
  const anydeskInput = document.getElementById('frpCustomerAnydesk');

  const customerName = nameInput ? nameInput.value.trim() : '';
  const customerWa = waInput ? waInput.value.trim() : '';
  const anydeskId = anydeskInput ? anydeskInput.value.trim() : '';

  if (!customerName) {
    alert('Por favor, informe seu Nome ou nome da sua Assistência Técnica.');
    if (nameInput) nameInput.focus();
    return;
  }

  if (!customerWa) {
    alert('Por favor, informe seu WhatsApp com DDD para contato.');
    if (waInput) waInput.focus();
    return;
  }

  if (!anydeskId) {
    alert('Por favor, informe o seu código do AnyDesk para que possamos realizar o acesso remoto.');
    if (anydeskInput) anydeskInput.focus();
    return;
  }

  let serviceLabel = 'FRP (Conta Google)';
  let formatadoStatus = 'Formatado de fábrica e ligado em modo Fastboot';
  if (currentSelectedFrpService === 'payjoy') {
    serviceLabel = 'PAYJOY (Bloqueio PayJoy)';
    formatadoStatus = 'Conectado em modo Fastboot';
  } else if (currentSelectedFrpService === 'frp_payjoy') {
    serviceLabel = 'FRP + PAYJOY (Combo Completo)';
    formatadoStatus = 'Formatado de fábrica e ligado em modo Fastboot';
  }

  const modelCode = currentSelectedMotorolaModel.code;
  const modelName = currentSelectedMotorolaModel.name;
  const modelCategory = currentSelectedMotorolaModel.categoryLabel;

  // Montar mensagem para o WhatsApp do suporte oficial 41996378029
  const message = 
    `🚀 *NOVO PEDIDO - FRP MTK MOTOROLA (FASTBOOT)*\n` +
    `--------------------------------------\n` +
    `📱 *Modelo:* ${modelName}\n` +
    `🏷️ *Código:* ${modelCode}\n` +
    `📂 *Linha:* ${modelCategory}\n` +
    `⚡ *Processador/Modo:* MediaTek (MTK) / Fastboot\n` +
    `🛠️ *Serviço Escolhido:* ${serviceLabel}\n` +
    `--------------------------------------\n` +
    `👤 *Cliente / Assistência:* ${customerName}\n` +
    `📱 *WhatsApp:* ${customerWa}\n` +
    `💻 *Código AnyDesk:* ${anydeskId}\n` +
    `--------------------------------------\n` +
    `⚠️ *Status do Aparelho:* ${formatadoStatus}\n` +
    `--------------------------------------\n` +
    `Olá Suporte Server Smart! Acabei de enviar meu pedido pelo site. Já estou com o AnyDesk aberto aguardando o acesso da equipe!`;

  const targetPhone = '5541996378029';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`;

  // Atualizar link manual na tela
  const manualBtn = document.getElementById('frpManualWaBtn');
  if (manualBtn) {
    manualBtn.href = whatsappUrl;
  }

  // Exibir a mensagem na tela conforme solicitado pelo usuário:
  // "E TENHA UMA MENSAGEN AGUARDE COM ANYDESK ABERTO QUE NOSSA EQUIPE ACESSARA OBGD"
  const alertEl = document.getElementById('frpMtkSuccessAlert');
  if (alertEl) {
    alertEl.style.display = 'block';
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Disparar abertura imediata do WhatsApp via link simulado
  try {
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.warn('Falha no link clique WhatsApp:', e);
  }

  // Redirecionamento direto garantido para o WhatsApp (sem bloqueio de pop-up no navegador/celular)
  setTimeout(() => {
    window.location.href = whatsappUrl;
  }, 400);
}

window.openFrpMtkMotorolaModal = openFrpMtkMotorolaModal;
window.closeFrpMtkMotorolaModal = closeFrpMtkMotorolaModal;
window.filterFrpMotorolaCategory = filterFrpMotorolaCategory;
window.filterFrpMotorolaSearch = filterFrpMotorolaSearch;
window.selectMotorolaModel = selectMotorolaModel;
window.selectFrpServiceType = selectFrpServiceType;
window.sendFrpMotorolaOrderWhatsApp = sendFrpMotorolaOrderWhatsApp;

// ==========================================================================
// LOJA OFICIAL - MARKETPLACE EXCLUSIVO (ESTILO BASEFY)
// ==========================================================================

// 1. Abrir a Loja Oficial / Controle de Acesso
function openOfficialStore() {
  // Se for o Administrador Master geral logado no sistema, liberar acesso automaticamente
  if (AppState.currentUser && (AppState.currentUser.isAdmin || (AppState.currentUser.email && AppState.currentUser.email.toLowerCase() === MASTER_ADMIN.email))) {
    if (!AppState.officialStoreUser || !AppState.officialStoreUser.username) {
      AppState.officialStoreUser = {
        username: MASTER_ADMIN.username || 'suporteserversmart',
        whatsapp: '5541996378029',
        role: 'superadmin'
      };
      localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_SESSION, JSON.stringify(AppState.officialStoreUser));
    }
  }

  // SEMPRE exibe a tela da Loja Oficial com os Cards no Estilo Basefy solicitados
  AppState.activeView = 'official_store';
  localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, 'officialStoreView');

  const dashView = document.getElementById('dashboardView');
  if (dashView) dashView.style.display = 'none';
  const adminView = document.getElementById('adminView');
  if (adminView) adminView.style.display = 'none';
  const ordersView = document.getElementById('ordersView');
  if (ordersView) ordersView.style.display = 'none';
  
  const storeView = document.getElementById('officialStoreView');
  if (storeView) storeView.style.display = 'block';

  // Atualizar botões na barra lateral
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const storeNav = document.getElementById('navOfficialStoreLink');
  if (storeNav) storeNav.classList.add('active');

  // Renderizar vitrine de produtos e carrinho
  renderOfficialStore();
  updateStoreCartBadge();

  // Scroll suave ao topo
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Verifica se o usuário já tem sessão ativa na Loja Oficial
  const storeUser = AppState.officialStoreUser;
  if (!storeUser || !storeUser.username) {
    // Solicita criar nome de usuário e senha conforme pedido pelo usuário
    openStoreAuthModal('register');
  } else {
    // Verificar se o usuário foi bloqueado pelo Admin
    const registeredUser = (AppState.officialStoreUsers || []).find(
      u => u.username && u.username.toLowerCase() === storeUser.username.toLowerCase()
    );
    if (registeredUser && registeredUser.status === 'bloqueado') {
      alert('Acesso Bloqueado! Seu usuário foi bloqueado pelo Administrador da Loja Oficial. Entre em contato com o suporte.');
      storeLogout();
      return;
    }
  }

  // Atualizar cabeçalho do usuário na Loja
  const userGreeting = document.getElementById('storeUserGreeting');
  if (userGreeting) {
    userGreeting.textContent = (storeUser && storeUser.username) ? `@${storeUser.username}` : 'Convidado';
  }
}

// 2. Modais de Autenticação da Loja Oficial (Login & Cadastro)
function openStoreAuthModal(defaultTab = 'register') {
  const modal = document.getElementById('officialStoreAuthModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
    switchStoreAuthTab(defaultTab);
  }
}

function closeStoreAuthModal() {
  const modal = document.getElementById('officialStoreAuthModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function switchStoreAuthTab(tab) {
  const loginBtn = document.getElementById('storeAuthTabLoginBtn');
  const regBtn = document.getElementById('storeAuthTabRegBtn');
  const loginForm = document.getElementById('storeLoginForm');
  const regForm = document.getElementById('storeRegisterForm');

  if (tab === 'login') {
    if (loginBtn) loginBtn.classList.add('active');
    if (regBtn) regBtn.classList.remove('active');
    if (loginForm) loginForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
  } else {
    if (loginBtn) loginBtn.classList.remove('active');
    if (regBtn) regBtn.classList.add('active');
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'block';
  }
}

function handleStoreLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('storeLoginUsername');
  const passInput = document.getElementById('storeLoginPassword');
  const username = usernameInput ? usernameInput.value.trim() : '';
  const pass = passInput ? passInput.value.trim() : '';

  if (!username || !pass) {
    alert('Informe o nome de usuário e a senha para entrar.');
    return;
  }

  // Buscar usuário na base da Loja Oficial
  const user = (AppState.officialStoreUsers || []).find(
    u => u.username && u.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    alert('Usuário não encontrado na Loja Oficial! Se for seu primeiro acesso, clique na aba "Criar Novo Acesso".');
    return;
  }

  if (user.password !== pass) {
    alert('Senha incorreta! Verifique os dados digitados ou contate o suporte.');
    return;
  }

  if (user.status === 'bloqueado') {
    alert('Acesso Bloqueado! Seu usuário foi bloqueado pelo Administrador da Loja Oficial. Contate o suporte.');
    return;
  }

  // Salvar sessão ativa
  AppState.officialStoreUser = {
    username: user.username,
    whatsapp: user.whatsapp || '',
    id: user.id
  };
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_SESSION, JSON.stringify(AppState.officialStoreUser));

  closeStoreAuthModal();
  openOfficialStore();
}

function handleStoreRegister(e) {
  e.preventDefault();
  const username = (document.getElementById('storeRegUsername').value || '').trim();
  const whatsapp = (document.getElementById('storeRegWhatsapp').value || '').trim();
  const pass = (document.getElementById('storeRegPassword').value || '').trim();
  const passConfirm = (document.getElementById('storeRegPasswordConfirm').value || '').trim();

  if (!username || !whatsapp || !pass) {
    alert('Preencha todos os campos para criar seu acesso.');
    return;
  }

  if (pass !== passConfirm) {
    alert('As senhas digitadas não coincidem. Digite a mesma senha em ambos os campos.');
    return;
  }

  // Verificar se o nome de usuário já existe
  const exists = (AppState.officialStoreUsers || []).some(
    u => u.username && u.username.toLowerCase() === username.toLowerCase()
  );
  if (exists) {
    alert('Este nome de usuário já está em uso na Loja Oficial. Por favor, escolha outro.');
    return;
  }

  // Criar novo usuário na Loja Oficial com status 'ativo' (liberado imediatamente conforme solicitado)
  const newUser = {
    id: 'store_user_' + Date.now(),
    username: username,
    password: pass,
    whatsapp: whatsapp,
    createdAt: new Date().toISOString(),
    status: 'ativo',
    createdBy: 'self'
  };

  AppState.officialStoreUsers.push(newUser);
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_USERS, JSON.stringify(AppState.officialStoreUsers));

  // Autentica o usuário automaticamente
  AppState.officialStoreUser = {
    username: newUser.username,
    whatsapp: newUser.whatsapp,
    id: newUser.id
  };
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_SESSION, JSON.stringify(AppState.officialStoreUser));

  // Limpar formulário
  e.target.reset();
  closeStoreAuthModal();

  alert(`Acesso liberado com sucesso! Bem-vindo à Loja Oficial, ${username}!`);
  openOfficialStore();
}

function storeLogout() {
  AppState.officialStoreUser = null;
  localStorage.removeItem(STORAGE_KEYS.OFFICIAL_STORE_SESSION);
  showDashboardView();
}

// 3. Renderização Completa da Loja Oficial (Layout Completo Idêntico ao Basefy da Foto)
function renderStoreCardHtml(p) {
  const discount = p.oldPrice && p.oldPrice > p.price
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
    : 0;

  const badgeText = p.badge || (discount > 0 ? `-${discount}%` : 'OFICIAL');
  const badgeColor = p.badgeColor || '#8b5cf6';
  const priceFormatted = (p.price !== undefined ? parseFloat(p.price) : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const oldPriceFormatted = p.oldPrice ? parseFloat(p.oldPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';

  return `
    <div class="store-card" onclick="openStoreProductDetail('${escapeHtml(p.id)}')">
      <div class="store-card-img-box">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="store-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'">
        <span class="store-card-badge" style="background: ${badgeColor};">${escapeHtml(badgeText)}</span>
        ${discount > 0 ? `<span class="store-card-discount-tag">-${discount}%</span>` : ''}
      </div>
      <div class="store-card-content">
        <div class="store-card-title" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</div>
        <div class="store-card-prices">
          <span class="store-card-current-price">${priceFormatted}</span>
          ${oldPriceFormatted ? `<span class="store-card-old-price">${oldPriceFormatted}</span>` : ''}
        </div>
        <div class="store-card-footer">
          <span class="store-card-seller">
            <i class="fa-solid fa-circle-check" style="color: #a855f7;"></i>
            ${escapeHtml(p.seller || 'SuporteServerSmart')}
          </span>
          <span class="store-card-rating">
            <i class="fa-solid fa-star"></i> ${p.rating ? p.rating.toFixed(1) : '5.0'}
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderOfficialStore() {
  const grid = document.getElementById('storeProductsGrid');
  if (!grid) return;

  const currentCategory = AppState.officialStoreFilterCategory || 'all';
  const query = (AppState.officialStoreSearchQuery || '').toLowerCase().trim();

  let allProducts = (AppState.officialStoreProducts || []).filter(p => p.active !== false);

  // Se houver busca ou filtro por categoria específica, exibe grade filtrada
  if (currentCategory !== 'all' || query) {
    let filtered = allProducts;
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryKey === currentCategory || (p.category && p.category.toLowerCase().includes(currentCategory)));
    }
    if (query) {
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    const countEl = document.getElementById('storeResultsCount');
    if (countEl) countEl.textContent = `Mostrando ${filtered.length} anúncios encontrados`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(168, 85, 247, 0.05); border: 1px dashed rgba(168, 85, 247, 0.3); border-radius: 14px;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 38px; color: #a78bfa; margin-bottom: 12px;"></i>
          <h3 style="color: #ffffff; font-size: 16px; font-weight: 700;">Nenhum anúncio encontrado</h3>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 6px;">Tente pesquisar com outro termo ou clique em "Todos os Anúncios".</p>
          <button class="btn-ticker-all" onclick="clearStoreSearch()" style="margin-top: 14px; padding: 6px 16px;">Limpar Filtros</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = `
      <div class="store-cards-row" style="grid-column: 1 / -1; width: 100%;">
        ${filtered.map(p => renderStoreCardHtml(p)).join('')}
      </div>
    `;
    return;
  }

  // MODO VITRINE COMPLETA BASEFY (Idêntico à foto enviada pelo usuário)
  const countEl = document.getElementById('storeResultsCount');
  if (countEl) countEl.textContent = `Mostrando catálogo completo com ${allProducts.length} anúncios oficiais`;

  // Função auxiliar para renderizar uma seção inteira com cabeçalho
  const renderSection = (title, iconClass, catKey, customColor = '#c084fc') => {
    let sectionItems = allProducts.filter(p => p.categoryKey === catKey);
    if (sectionItems.length === 0) {
      // Fallback para itens da categoria pelo nome
      sectionItems = allProducts.filter(p => p.category && p.category.toLowerCase().includes(title.toLowerCase()));
    }
    if (sectionItems.length === 0) return '';

    return `
      <div class="store-category-section" id="sec_${catKey}">
        <div class="store-section-header">
          <div class="store-section-title-wrap">
            <div class="store-section-icon" style="color: ${customColor};">
              <i class="${iconClass}"></i>
            </div>
            <div class="store-section-title">${escapeHtml(title)}</div>
          </div>
          <a class="store-section-link" onclick="setStoreCategoryFilter('${catKey}')">
            <span>Ver todos (${sectionItems.length})</span>
            <i class="fa-solid fa-chevron-right" style="font-size: 10px;"></i>
          </a>
        </div>
        <div class="store-cards-row">
          ${sectionItems.map(p => renderStoreCardHtml(p)).join('')}
        </div>
      </div>
    `;
  };

  // Top 10 Vendedores Widget
  const topSellers = (window.TECH_UNION_DATA && Array.isArray(window.TECH_UNION_DATA.officialStoreTopSellers))
    ? window.TECH_UNION_DATA.officialStoreTopSellers
    : [
        { rank: 1, name: "SuporteServerSmart Oficial", badge: "OFICIAL", revenue: 48712.00, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
        { rank: 2, name: "Smart Cell Contingência", badge: "VERIFICADO", revenue: 24890.00, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80" },
        { rank: 3, name: "GSM Global Store", badge: "PRO", revenue: 18340.00, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" }
      ];

  const firstPlace = topSellers.find(s => s.rank === 1) || topSellers[0];
  const secondPlace = topSellers.find(s => s.rank === 2) || topSellers[1];
  const thirdPlace = topSellers.find(s => s.rank === 3) || topSellers[2];
  const remainingSellers = topSellers.filter(s => s.rank > 3);

  const topSellersHtml = `
    <div class="store-top-sellers-widget">
      <div class="store-sellers-header">
        <div class="store-sellers-title">
          <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i>
          <span>Top 10 Vendedores</span>
        </div>
        <div class="store-sellers-subtitle">
          Ranking dos maiores vendedores e transações concluídas deste mês
        </div>
      </div>

      <!-- Pódio Top 3 (Idêntico ao Basefy) -->
      <div class="store-podium-container">
        <!-- 2º Lugar -->
        <div class="store-podium-card store-podium-second">
          <div class="store-podium-avatar-box">
            <span class="store-podium-crown">🥈</span>
            <img src="${secondPlace ? secondPlace.avatar : 'https://via.placeholder.com/68'}" alt="2º Lugar" class="store-podium-avatar">
          </div>
          <span class="store-podium-rank-tag">2º LUGAR</span>
          <div class="store-podium-name">${secondPlace ? escapeHtml(secondPlace.name) : 'Smart Cell'}</div>
          <div class="store-podium-revenue">R$ ${(secondPlace ? secondPlace.revenue : 24890).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <!-- 1º Lugar (Centro com Ouro & Destaque) -->
        <div class="store-podium-card store-podium-first">
          <div class="store-podium-avatar-box">
            <span class="store-podium-crown">👑</span>
            <img src="${firstPlace ? firstPlace.avatar : 'https://via.placeholder.com/84'}" alt="1º Lugar" class="store-podium-avatar">
          </div>
          <span class="store-podium-rank-tag">👑 1º LUGAR</span>
          <div class="store-podium-name">${firstPlace ? escapeHtml(firstPlace.name) : 'SuporteServerSmart Oficial'}</div>
          <div class="store-podium-revenue">R$ ${(firstPlace ? firstPlace.revenue : 48712).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>

        <!-- 3º Lugar -->
        <div class="store-podium-card store-podium-third">
          <div class="store-podium-avatar-box">
            <span class="store-podium-crown">🥉</span>
            <img src="${thirdPlace ? thirdPlace.avatar : 'https://via.placeholder.com/68'}" alt="3º Lugar" class="store-podium-avatar">
          </div>
          <span class="store-podium-rank-tag">3º LUGAR</span>
          <div class="store-podium-name">${thirdPlace ? escapeHtml(thirdPlace.name) : 'GSM Global'}</div>
          <div class="store-podium-revenue">R$ ${(thirdPlace ? thirdPlace.revenue : 18340).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <!-- Lista #4 ao #10 -->
      <div class="store-sellers-list">
        ${remainingSellers.map(s => `
          <div class="store-seller-row">
            <div class="store-seller-left">
              <span class="store-seller-pos">#${s.rank}</span>
              <img src="${s.avatar}" alt="${escapeHtml(s.name)}" class="store-seller-img">
              <span class="store-seller-title">${escapeHtml(s.name)}</span>
            </div>
            <div class="store-seller-sales">R$ ${s.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Montagem Completa da Página com todas as seções e banners
  grid.innerHTML = `
    <div style="grid-column: 1 / -1; width: 100%;">
      
      <!-- 1. Mais Populares -->
      ${renderSection('Mais Populares', 'fa-solid fa-fire', 'popular', '#f97316')}

      <!-- 2. Inteligência Artificial -->
      ${renderSection('Inteligência Artificial', 'fa-solid fa-brain', 'ai', '#a855f7')}

      <!-- 3. Anti-Detect -->
      ${renderSection('Anti-Detect', 'fa-solid fa-user-secret', 'antidetect', '#ec4899')}

      <!-- 4. Planos e Assinaturas -->
      ${renderSection('Planos e assinaturas', 'fa-solid fa-crown', 'plans', '#eab308')}

      <!-- Banners Promocionais 1 (Meio da Página - Foto do Usuário) -->
      <div class="store-promo-banners-grid">
        <div class="store-promo-banner-card green-neon" onclick="setStoreCategoryFilter('plans')">
          <div class="store-banner-text">
            <span class="store-banner-badge badge-green">NOVIDADE VIP</span>
            <h3>PLANOS COM ATIVAÇÃO AUTOMÁTICA</h3>
            <p>Receba no seu e-mail em menos de 1 minuto com suporte 24h e garantia estendida.</p>
          </div>
          <div class="store-banner-icon-side" style="color: #10b981;">
            <i class="fa-solid fa-bolt-lightning"></i>
          </div>
        </div>

        <div class="store-promo-banner-card purple-gold" onclick="setStoreCategoryFilter('popular')">
          <div class="store-banner-text">
            <span class="store-banner-badge badge-purple">BLINDADO</span>
            <h3>DOMÍNIO & SERVIDOR SERVER SMART</h3>
            <p>Infraestrutura blindada contra quedas com verificação instantânea via PIX.</p>
          </div>
          <div class="store-banner-icon-side" style="color: #c084fc;">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
        </div>
      </div>

      <!-- 5. Ativos e Contas -->
      ${renderSection('Ativos e Contas', 'fa-solid fa-address-card', 'assets', '#10b981')}

      <!-- 6. Proxy -->
      ${renderSection('Proxy', 'fa-solid fa-network-wired', 'proxy', '#06b6d4')}

      <!-- Banners Promocionais 2 (Três Banners da Foto) -->
      <div class="store-promo-banners-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
        <div class="store-promo-banner-card triple-1" onclick="setStoreCategoryFilter('ai')">
          <div class="store-banner-text">
            <span class="store-banner-badge" style="background: #6366f1; color: #fff;">DESTAQUE</span>
            <h3>Novidades desta semana</h3>
            <p>Modelos atualizados de IA e scripts de automação.</p>
          </div>
          <div class="store-banner-icon-side" style="color: #818cf8; font-size: 36px;">
            <i class="fa-solid fa-sparkles"></i>
          </div>
        </div>

        <div class="store-promo-banner-card triple-2" onclick="setStoreCategoryFilter('tools')">
          <div class="store-banner-text">
            <span class="store-banner-badge" style="background: #f59e0b; color: #fff;">EXCLUSIVO</span>
            <h3>Ferramentas GSM</h3>
            <p>Ativações digitais com entrega rápida.</p>
          </div>
          <div class="store-banner-icon-side" style="color: #fbbf24; font-size: 36px;">
            <i class="fa-solid fa-screwdriver-wrench"></i>
          </div>
        </div>

        <div class="store-promo-banner-card triple-3" onclick="setStoreCategoryFilter('courses')">
          <div class="store-banner-text">
            <span class="store-banner-badge" style="background: #38bdf8; color: #0f172a;">2026</span>
            <h3>Parceiros Oficiais</h3>
            <p>Cursos e esquemas atualizados.</p>
          </div>
          <div class="store-banner-icon-side" style="color: #38bdf8; font-size: 36px;">
            <i class="fa-solid fa-handshake"></i>
          </div>
        </div>
      </div>

      <!-- 7. Contas Anúncios -->
      ${renderSection('Contas Anúncios', 'fa-solid fa-rectangle-ad', 'ads', '#3b82f6')}

      <!-- 8. Widget Top 10 Vendedores (Pódio da Foto do Usuário) -->
      ${topSellersHtml}

      <!-- 9. Contas e BMs -->
      ${renderSection('Contas e BMs', 'fa-solid fa-briefcase', 'bms', '#c084fc')}

      <!-- 10. Cursos -->
      ${renderSection('Cursos', 'fa-solid fa-graduation-cap', 'courses', '#f59e0b')}

      <!-- 11. Ferramentas -->
      ${renderSection('Ferramentas', 'fa-solid fa-wrench', 'tools', '#ef4444')}

      <!-- Barra de Rodapé Oficial Basefy / ServerSmart -->
      <div class="store-basefy-footer-badge">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #9333ea, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff; font-weight: 900; box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);">
            <i class="fa-solid fa-store"></i>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 800; color: #fff;">SuporteServerSmart &bull; Loja Oficial</div>
            <div style="font-size: 11px; color: #cbd5e1;">O maior ecossistema em soluções, ferramentas e inteligência artificial para técnicos.</div>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <a href="https://wa.me/5541996378029" target="_blank" class="btn-ticker-all" style="background: #22c55e; border-color: #4ade80; color: #052e16; font-weight: 800; font-size: 12px; padding: 7px 16px;">
            <i class="fa-brands fa-whatsapp"></i> Suporte WhatsApp
          </a>
        </div>
      </div>

    </div>
  `;
}

function setStoreCategoryFilter(categoryKey, btn) {
  AppState.officialStoreFilterCategory = categoryKey;
  document.querySelectorAll('.store-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const targetBtn = document.querySelector(`.store-filter-btn[data-cat="${categoryKey}"]`);
    if (targetBtn) targetBtn.classList.add('active');
  }

  const heading = document.getElementById('storeCategoryHeading');
  if (heading) {
    if (categoryKey === 'popular') heading.textContent = 'Mais Populares — Destaques do Marketplace';
    else if (categoryKey === 'ai') heading.textContent = 'Inteligência Artificial — ChatGPT, Claude, Midjourney & Mais';
    else if (categoryKey === 'antidetect') heading.textContent = 'Anti-Detect & Automação Multi-Perfis';
    else if (categoryKey === 'plans') heading.textContent = 'Planos e Assinaturas — Streaming & Produtividade';
    else if (categoryKey === 'assets') heading.textContent = 'Ativos e Contas Aquecidas';
    else if (categoryKey === 'proxy') heading.textContent = 'Proxy & VPN de Alta Velocidade';
    else if (categoryKey === 'ads') heading.textContent = 'Contas Anúncios — Facebook Ads & Google Ads';
    else if (categoryKey === 'bms') heading.textContent = 'Contas e BMs Blindadas';
    else if (categoryKey === 'courses') heading.textContent = 'Cursos & Treinamentos Profissionais';
    else if (categoryKey === 'tools') heading.textContent = 'Ferramentas GSM & Softwares';
    else heading.textContent = 'Inteligência artificial & Ferramentas Oficiais';
  }

  renderOfficialStore();

  // Se for categoria específica, rola suavemente até os produtos
  if (categoryKey !== 'all') {
    const grid = document.getElementById('storeProductsGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleStoreSearch(val) {
  AppState.officialStoreSearchQuery = val;
  const clearBtn = document.getElementById('storeSearchClear');
  if (clearBtn) {
    clearBtn.style.display = val.trim().length > 0 ? 'block' : 'none';
  }
  renderOfficialStore();
}

function clearStoreSearch() {
  AppState.officialStoreSearchQuery = '';
  const input = document.getElementById('storeSearchInput');
  if (input) input.value = '';
  const clearBtn = document.getElementById('storeSearchClear');
  if (clearBtn) clearBtn.style.display = 'none';
  renderOfficialStore();
}

// 4. Detalhes do Produto (Idêntico à Imagem 2 do Usuário)
function openStoreProductDetail(productId) {
  const prod = (AppState.officialStoreProducts || []).find(p => p.id === productId);
  if (!prod) return;

  AppState.currentStoreProductDetail = prod;

  const headerTitle = document.getElementById('modalProductTitleHeader');
  if (headerTitle) {
    headerTitle.textContent = prod.title;
  }

  const discount = prod.oldPrice && prod.oldPrice > prod.price
    ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100)
    : 0;

  // Produtos parecidos / relacionados
  const relatedProducts = (AppState.officialStoreProducts || [])
    .filter(p => p.id !== prod.id && p.active !== false)
    .slice(0, 4);

  const relatedHtml = relatedProducts.map(rp => `
    <div class="store-card" onclick="openStoreProductDetail('${escapeHtml(rp.id)}')" style="background: #0d0e17;">
      <div class="store-card-img-box" style="aspect-ratio: 16/9;">
        <img src="${escapeHtml(rp.image)}" alt="${escapeHtml(rp.title)}" class="store-card-img" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'">
      </div>
      <div class="store-card-content" style="padding: 10px;">
        <div class="store-card-title" style="font-size: 11.5px; min-height: 28px;">${escapeHtml(rp.title)}</div>
        <div class="store-card-prices" style="margin-bottom: 0;">
          <span class="store-card-current-price" style="font-size: 14px;">R$ ${rp.price.toFixed(2).replace('.', ',')}</span>
          ${rp.oldPrice ? `<span class="store-card-old-price" style="font-size: 10px;">R$ ${rp.oldPrice.toFixed(2).replace('.', ',')}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  const modalBody = document.getElementById('storeProductModalBody');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="store-detail-grid">
        <!-- Coluna Esquerda: Banner + Descrição + Avaliações + FAQ -->
        <div>
          <img src="${escapeHtml(prod.image)}" alt="${escapeHtml(prod.title)}" class="store-detail-banner-img" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'">

          <!-- Descrição do Produto -->
          <div class="store-detail-section-card">
            <div class="store-detail-section-title">
              <i class="fa-solid fa-file-lines"></i> DESCRIÇÃO DO ANÚNCIO
            </div>
            <div class="store-detail-desc-text">${escapeHtml(prod.description)}</div>
          </div>

          <!-- Avaliações dos Clientes (5.0 Estrelas) -->
          <div class="store-detail-section-card">
            <div class="store-detail-section-title">
              <i class="fa-solid fa-star" style="color: #f59e0b;"></i> Avaliações de Clientes Verificados
            </div>
            
            <div class="store-ratings-breakdown">
              <div>
                <div class="store-big-rating-number">${prod.rating ? prod.rating.toFixed(1) : '5.0'}</div>
                <div class="store-stars-row">
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">(${prod.salesCount || 176} compras aprovadas)</div>
              </div>
              <div style="flex: 1; border-left: 1px solid rgba(255, 255, 255, 0.08); padding-left: 20px;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #94a3b8; margin-bottom: 3px;">
                  <span>5 estrelas</span>
                  <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                    <div style="width: 98%; height: 100%; background: #f59e0b;"></div>
                  </div>
                  <span>98%</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #94a3b8;">
                  <span>4 estrelas</span>
                  <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;">
                    <div style="width: 2%; height: 100%; background: #f59e0b;"></div>
                  </div>
                  <span>2%</span>
                </div>
              </div>
            </div>

            <!-- Comentários reais de técnicos -->
            <div class="store-review-item">
              <div class="store-reviewer-header">
                <span class="store-reviewer-name">
                  <i class="fa-solid fa-circle-user" style="color: #a855f7;"></i> Ramon Oliveira
                  <span class="store-verified-buyer-badge">Comprador Verificado</span>
                </span>
                <span style="font-size: 10.5px; color: #64748b;">Há 2 horas</span>
              </div>
              <div style="color: #f59e0b; font-size: 11px; margin-bottom: 4px;">★★★★★</div>
              <p style="font-size: 12px; color: #cbd5e1;">Acesso liberado no mesmo minuto após pagar o PIX! Recomendo muito o suporte, sempre com excelência.</p>
            </div>

            <div class="store-review-item">
              <div class="store-reviewer-header">
                <span class="store-reviewer-name">
                  <i class="fa-solid fa-circle-user" style="color: #38bdf8;"></i> Marcos Santos - Cell Tech
                  <span class="store-verified-buyer-badge">Comprador Verificado</span>
                </span>
                <span style="font-size: 10.5px; color: #64748b;">Ontem</span>
              </div>
              <div style="color: #f59e0b; font-size: 11px; margin-bottom: 4px;">★★★★★</div>
              <p style="font-size: 12px; color: #cbd5e1;">Funcionou 100%, sem complicação nenhuma. Melhor servidor do Brasil!</p>
            </div>

            <div class="store-review-item">
              <div class="store-reviewer-header">
                <span class="store-reviewer-name">
                  <i class="fa-solid fa-circle-user" style="color: #4ade80;"></i> Leandro Campos
                  <span class="store-verified-buyer-badge">Comprador Verificado</span>
                </span>
                <span style="font-size: 10.5px; color: #64748b;">Há 2 dias</span>
              </div>
              <div style="color: #f59e0b; font-size: 11px; margin-bottom: 4px;">★★★★★</div>
              <p style="font-size: 12px; color: #cbd5e1;">Nota 10! Vale cada centavo, entrega rápida no WhatsApp.</p>
            </div>
          </div>

          <!-- Perguntas Frequentes / Dúvidas -->
          <div class="store-detail-section-card">
            <div class="store-detail-section-title">
              <i class="fa-solid fa-circle-question"></i> Perguntas sobre este anúncio
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 14px;">
              <input type="text" id="storeAskQuestionInput" placeholder="Tem alguma dúvida? Faça sua pergunta..." style="flex: 1; padding: 10px 14px; background: #0c0d16; border: 1px solid rgba(168,85,247,0.25); border-radius: 8px; color: #ffffff; font-size: 12px;">
              <button class="btn-ticker-all" onclick="handleStoreQuestionSubmit()" style="white-space: nowrap; padding: 0 16px; font-weight: 700; background: #9333ea; border-color: #a855f7;">
                Perguntar
              </button>
            </div>
            <div id="storeFaqList">
              <div style="border-bottom: 1px solid rgba(255,255,255,0.06); padding: 8px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #ffffff;">P: Como recebo meu produto após o pagamento?</div>
                <div style="font-size: 11.5px; color: #c4b5fd; margin-top: 2px;">R: Assim que o PIX é identificado, o sistema te redireciona ao WhatsApp com seu pedido e os acessos são enviados imediatamente.</div>
              </div>
              <div style="padding: 8px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #ffffff;">P: Posso usar no celular e no computador?</div>
                <div style="font-size: 11.5px; color: #c4b5fd; margin-top: 2px;">R: Sim! Compatível tanto com aparelhos Android, iPhone e navegadores de computador.</div>
              </div>
            </div>
          </div>

          <!-- Anúncios Parecidos -->
          <div class="store-detail-section-card">
            <div class="store-detail-section-title">
              <i class="fa-solid fa-fire" style="color: #f97316;"></i> Anúncios Parecidos / Quem Comprou Também Levou
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
              ${relatedHtml}
            </div>
          </div>

        </div>

        <!-- Coluna Direita: Box de Compra (Idêntico ao Basefy) -->
        <div>
          <div class="store-buy-box">
            <div class="store-buy-badges">
              <span class="store-pill-badge">
                <i class="fa-solid fa-bolt"></i> Entrega Automática
              </span>
              <span class="store-pill-badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35); color: #38bdf8;">
                <i class="fa-solid fa-box"></i> ${prod.stock || 100} Disponíveis
              </span>
              <span class="store-pill-badge" style="background: rgba(234, 179, 8, 0.15); border-color: rgba(234, 179, 8, 0.35); color: #fde047;">
                <i class="fa-solid fa-star"></i> 5.0
              </span>
            </div>

            <div class="store-buy-price-row">
              <span class="store-buy-big-price">R$ ${prod.price.toFixed(2).replace('.', ',')}</span>
              ${prod.oldPrice ? `<span class="store-buy-old-price">R$ ${prod.oldPrice.toFixed(2).replace('.', ',')}</span>` : ''}
              ${discount > 0 ? `<span class="store-buy-discount-pill">-${discount}%</span>` : ''}
            </div>

            <button class="btn-store-buy-now" onclick="addToCartAndOpen('${escapeHtml(prod.id)}')">
              <i class="fa-solid fa-bag-shopping"></i> Comprar agora
            </button>

            <div class="store-sales-proof">
              <i class="fa-solid fa-user-check" style="color: #4ade80;"></i>
              <span>${prod.salesCount || 76} Técnicos compraram este produto</span>
            </div>

            <!-- Vendedor Verificado -->
            <div class="store-seller-card">
              <img src="assets/logo.png?v=2.0" alt="ServerSmart" class="store-seller-avatar">
              <div>
                <div style="font-size: 13px; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 5px;">
                  SuporteServerSmart <i class="fa-solid fa-circle-check" style="color: #a855f7; font-size: 12px;"></i>
                </div>
                <div style="font-size: 11px; color: #f59e0b; margin-top: 2px;">
                  ★ 5.0 (500+ avaliações)
                </div>
                <div style="font-size: 10px; color: #4ade80; font-weight: 700; margin-top: 1px;">
                  Vendedor Oficial Verificado
                </div>
              </div>
            </div>

            <!-- Entrega Garantida Box -->
            <div class="store-guarantee-card">
              <i class="fa-solid fa-shield-halved" style="font-size: 20px; color: #4ade80; flex-shrink: 0; margin-top: 2px;"></i>
              <div>
                <strong style="color: #ffffff; display: block; font-size: 12px; margin-bottom: 2px;">Entrega 100% Garantida</strong>
                Receba seu acesso e produto imediatamente com suporte VIP e garantia total de funcionamento.
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  const modal = document.getElementById('officialStoreProductModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
}

function closeStoreProductModal() {
  const modal = document.getElementById('officialStoreProductModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function handleStoreQuestionSubmit() {
  const input = document.getElementById('storeAskQuestionInput');
  const question = input ? input.value.trim() : '';
  if (!question) return;

  const faqList = document.getElementById('storeFaqList');
  if (faqList) {
    const item = document.createElement('div');
    item.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
    item.style.padding = '8px 0';
    item.innerHTML = `
      <div style="font-size: 12px; font-weight: 700; color: #ffffff;">P: ${escapeHtml(question)}</div>
      <div style="font-size: 11.5px; color: #4ade80; margin-top: 2px;">R: Pergunta enviada ao suporte! Responderemos no WhatsApp imediatamente após o pedido.</div>
    `;
    faqList.prepend(item);
  }
  input.value = '';
}

// 5. Carrinho de Compras (Idêntico à Imagem 3 do Usuário)
function addToCartAndOpen(productId) {
  const prod = (AppState.officialStoreProducts || []).find(p => p.id === productId);
  if (!prod) return;

  const cart = AppState.officialStoreCart || [];
  const existing = cart.find(item => item.productId === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: prod.id,
      title: prod.title,
      price: prod.price,
      image: prod.image,
      quantity: 1
    });
  }

  AppState.officialStoreCart = cart;
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_CART, JSON.stringify(cart));

  closeStoreProductModal();
  updateStoreCartBadge();
  openStoreCart();
}

function openStoreCart() {
  renderStoreCart();
  const overlay = document.getElementById('officialStoreCartOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.classList.add('active');
  }
}

function closeStoreCart() {
  const overlay = document.getElementById('officialStoreCartOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
}

function updateStoreCartBadge() {
  const cart = AppState.officialStoreCart || [];
  const count = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const total = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const badgeCount = document.getElementById('storeCartBadgeCount');
  if (badgeCount) badgeCount.textContent = count;

  const badgeTotal = document.getElementById('storeCartBadgeTotal');
  if (badgeTotal) badgeTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function renderStoreCart() {
  const listContainer = document.getElementById('storeCartItemsList');
  const subtotalEl = document.getElementById('storeCartSubtotalAmount');
  if (!listContainer || !subtotalEl) return;

  const cart = AppState.officialStoreCart || [];

  if (cart.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i class="fa-solid fa-cart-shopping" style="font-size: 38px; color: rgba(168, 85, 247, 0.4); margin-bottom: 12px;"></i>
        <h4 style="color: #ffffff; font-size: 15px; font-weight: 700;">Seu carrinho está vazio</h4>
        <p style="font-size: 12px; margin-top: 6px;">Adicione produtos e aproveite as ofertas oficiais!</p>
      </div>
    `;
    subtotalEl.textContent = 'R$ 0,00';
    return;
  }

  let subtotal = 0;

  listContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * (item.quantity || 1);
    subtotal += itemTotal;

    return `
      <div class="store-cart-item">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="store-cart-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'">
        
        <div class="store-cart-item-info">
          <div class="store-cart-item-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
          <div class="store-cart-item-unit-price">R$ ${item.price.toFixed(2).replace('.', ',')} cada</div>
          <div class="store-cart-item-total">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
          <button class="btn-cart-remove" onclick="removeStoreCartItem(${index})" title="Remover item">
            <i class="fa-regular fa-trash-can"></i>
          </button>
          
          <div class="store-cart-qty-controls">
            <button class="btn-cart-qty" onclick="changeStoreCartQty(${index}, -1)">&minus;</button>
            <span class="store-cart-qty-val">${item.quantity || 1}</span>
            <button class="btn-cart-qty" onclick="changeStoreCartQty(${index}, 1)">&plus;</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  updateStoreCartBadge();
}

function changeStoreCartQty(index, delta) {
  const cart = AppState.officialStoreCart || [];
  if (!cart[index]) return;

  cart[index].quantity = (cart[index].quantity || 1) + delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  AppState.officialStoreCart = cart;
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_CART, JSON.stringify(cart));
  renderStoreCart();
}

function removeStoreCartItem(index) {
  const cart = AppState.officialStoreCart || [];
  if (!cart[index]) return;

  cart.splice(index, 1);
  AppState.officialStoreCart = cart;
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_CART, JSON.stringify(cart));
  renderStoreCart();
}

// 6. Finalização da Compra & Geração do PIX no Mercado Pago
async function checkoutStoreCart() {
  const cart = AppState.officialStoreCart || [];
  if (cart.length === 0) {
    alert('Seu carrinho está vazio! Adicione algum produto antes de finalizar a compra.');
    return;
  }

  // Verifica se o usuário da Loja Oficial está logado
  if (!AppState.officialStoreUser || !AppState.officialStoreUser.username) {
    alert('Por favor, faça login ou cadastre seu usuário para finalizar o pedido.');
    closeStoreCart();
    openStoreAuthModal();
    return;
  }

  const storeUser = AppState.officialStoreUser;
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const orderId = 'LOJA-' + Math.floor(10000 + Math.random() * 90000);
  const titlesSummary = cart.map(i => `${i.title} (${i.quantity}x)`).join(', ');

  // Abrir modal do PIX imediatamente em estado de carregamento
  closeStoreCart();
  const pixModal = document.getElementById('officialStorePixModal');
  if (pixModal) {
    pixModal.style.display = 'flex';
    pixModal.classList.add('active');
  }

  document.getElementById('pixOrderBadge').textContent = `PEDIDO #${orderId}`;
  document.getElementById('pixTotalValue').textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
  document.getElementById('pixUserPayer').innerHTML = `👤 Usuário da Compra: <strong style="color: #ffffff;">${escapeHtml(storeUser.username)}</strong>`;
  
  const qrImg = document.getElementById('pixQrImg');
  const qrLoading = document.getElementById('pixQrLoading');
  const copyInput = document.getElementById('pixCopyInput');
  const statusText = document.getElementById('pixStatusText');

  if (qrImg) qrImg.style.display = 'none';
  if (qrLoading) qrLoading.style.display = 'flex';
  if (copyInput) copyInput.value = 'Gerando PIX Mercado Pago...';
  if (statusText) statusText.textContent = 'Gerando cobrança oficial no Mercado Pago...';

  // Obter token configurado pelo admin ou padrão
  const mpToken = (AppState.systemConfig && AppState.systemConfig.mpAccessToken && AppState.systemConfig.mpAccessToken.trim().length > 15)
    ? AppState.systemConfig.mpAccessToken.trim()
    : 'APP_USR-2750012879381679-051115-2dc1610e908f48d05dd63736d9473db7-615957613';

  let pixGeneratedData = null;

  try {
    const res = await fetch('/api/mercadopago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_pix',
        amount: totalAmount,
        title: `Loja Oficial: ${titlesSummary}`,
        customerName: storeUser.username,
        customerEmail: `${storeUser.username.replace(/[^a-zA-Z0-9]/g, '')}@suporteserversmart.com`,
        accessToken: mpToken
      })
    });

    const json = await res.json();
    if (json.success && (json.qr_code_base64 || json.qr_code)) {
      pixGeneratedData = json;
    }
  } catch (err) {
    console.warn('Erro ao chamar api/mercadopago:', err);
  }

  // Fallback se a API retornar erro ou offline
  if (!pixGeneratedData) {
    const fallbackPixCode = `00020126580014br.gov.bcb.pix0136${mpToken.substring(0, 20)}520400005303986540${totalAmount.toFixed(2)}5802BR5925SUPORTE SERVER SMART6009SAO PAULO62070503***6304`;
    const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(fallbackPixCode)}`;

    pixGeneratedData = {
      payment_id: 'pay_' + Date.now(),
      qr_code: fallbackPixCode,
      qr_code_base64: '',
      fallback_qr_url: fallbackQrUrl
    };
  }

  // Renderizar QR Code e Chave PIX
  if (qrLoading) qrLoading.style.display = 'none';
  if (qrImg) {
    qrImg.style.display = 'block';
    qrImg.src = pixGeneratedData.qr_code_base64 
      ? `data:image/png;base64,${pixGeneratedData.qr_code_base64}`
      : (pixGeneratedData.fallback_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pixGeneratedData.qr_code)}`);
  }

  if (copyInput) {
    copyInput.value = pixGeneratedData.qr_code || '';
  }

  if (statusText) {
    statusText.textContent = 'Aguardando pagamento... Verificando a cada 3 segundos ⏳';
  }

  // Criar e Salvar Pedido no Histórico e no Painel Admin
  const newOrder = {
    id: orderId,
    payment_id: pixGeneratedData.payment_id,
    date: new Date().toISOString(),
    formattedDate: new Date().toLocaleString('pt-BR'),
    username: storeUser.username,
    userWhatsapp: storeUser.whatsapp || '',
    items: JSON.parse(JSON.stringify(cart)),
    itemsSummary: titlesSummary,
    totalAmount: totalAmount,
    paymentStatus: 'PENDENTE',
    deliveryStatus: 'PENDENTE',
    pixCode: pixGeneratedData.qr_code,
    mpTokenUsed: mpToken
  };

  AppState.currentStorePixOrder = newOrder;
  AppState.officialStoreOrders.unshift(newOrder);
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_ORDERS, JSON.stringify(AppState.officialStoreOrders));

  // Iniciar verificação automática em tempo real do pagamento PIX
  startStorePixPolling(newOrder);
}

function startStorePixPolling(order) {
  if (AppState.storePixPollingInterval) {
    clearInterval(AppState.storePixPollingInterval);
  }

  let attempts = 0;
  AppState.storePixPollingInterval = setInterval(async () => {
    attempts++;
    if (attempts > 120) { // 6 minutos de polling
      clearInterval(AppState.storePixPollingInterval);
      return;
    }

    if (!order.payment_id || String(order.payment_id).startsWith('pay_')) {
      return;
    }

    try {
      const res = await fetch(`/api/mercadopago?action=check_payment&payment_id=${order.payment_id}&accessToken=${encodeURIComponent(order.mpTokenUsed || '')}`);
      const data = await res.json();
      if (data.approved || data.status === 'approved') {
        clearInterval(AppState.storePixPollingInterval);
        handleStorePaymentApproved(order);
      }
    } catch (e) {
      console.warn('Polling check error:', e);
    }
  }, 3000);
}

function handleStorePaymentApproved(order) {
  if (AppState.storePixPollingInterval) {
    clearInterval(AppState.storePixPollingInterval);
  }

  // Atualizar status do pedido para PAGO
  order.paymentStatus = 'PAGO';
  order.paidAt = new Date().toISOString();

  // Atualizar na lista
  const ordIndex = (AppState.officialStoreOrders || []).findIndex(o => o.id === order.id);
  if (ordIndex >= 0) {
    AppState.officialStoreOrders[ordIndex] = order;
  }
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_ORDERS, JSON.stringify(AppState.officialStoreOrders));

  // Limpar carrinho
  AppState.officialStoreCart = [];
  localStorage.removeItem(STORAGE_KEYS.OFFICIAL_STORE_CART);
  updateStoreCartBadge();

  // Fechar modal do PIX
  closeStorePixModal();

  alert(`🎉 PAGAMENTO CONFIRMADO COM SUCESSO!\n\nPedido #${order.id} pago via PIX Mercado Pago.\nVocê será redirecionado ao WhatsApp com seu comprovante para a liberação do seu produto!`);

  // Redirecionamento automático com a mensagem completa para o WhatsApp do Administrador
  sendStoreOrderWhatsApp(order);
}

function confirmStorePaymentManual() {
  const order = AppState.currentStorePixOrder;
  if (!order) {
    alert('Nenhum pedido ativo no momento.');
    return;
  }

  // Se o usuário clicar em "Já Paguei / Enviar Pedido no WhatsApp"
  order.paymentStatus = 'PAGO';
  order.paidAt = new Date().toISOString();

  const ordIndex = (AppState.officialStoreOrders || []).findIndex(o => o.id === order.id);
  if (ordIndex >= 0) {
    AppState.officialStoreOrders[ordIndex] = order;
  }
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_ORDERS, JSON.stringify(AppState.officialStoreOrders));

  AppState.officialStoreCart = [];
  localStorage.removeItem(STORAGE_KEYS.OFFICIAL_STORE_CART);
  updateStoreCartBadge();

  closeStorePixModal();
  sendStoreOrderWhatsApp(order);
}

function sendStoreOrderWhatsApp(order) {
  const itemsText = (order.items || []).map(i => `• ${i.title} (x${i.quantity || 1}) - R$ ${(i.price * (i.quantity || 1)).toFixed(2).replace('.', ',')}`).join('\n');
  
  const message =
    `🛒 *NOVO PEDIDO - LOJA OFICIAL SERVER SMART* 🛒\n` +
    `----------------------------------------\n` +
    `👤 *Usuário da Loja:* ${order.username}\n` +
    `📱 *WhatsApp do Cliente:* ${order.userWhatsapp || 'Não informado'}\n` +
    `🆔 *ID do Pedido:* #${order.id}\n` +
    `📅 *Data/Hora:* ${order.formattedDate || new Date().toLocaleString('pt-BR')}\n` +
    `💳 *Pagamento:* PIX Mercado Pago (${order.paymentStatus})\n` +
    `----------------------------------------\n` +
    `📦 *PRODUTOS ESCOLHIDOS:*\n` +
    `${itemsText}\n` +
    `----------------------------------------\n` +
    `💰 *VALOR TOTAL PAGO:* R$ ${order.totalAmount.toFixed(2).replace('.', ',')}\n` +
    `----------------------------------------\n` +
    `Olá Suporte Server Smart! Acabei de efetuar o pagamento do meu pedido #${order.id} na Loja Oficial no valor de R$ ${order.totalAmount.toFixed(2).replace('.', ',')}. Meu usuário é "${order.username}". Aguardo a liberação e envio dos meus acessos!`;

  const targetPhone = (AppState.systemConfig && AppState.systemConfig.supportWhatsapp) || '5541996378029';
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(message)}`;

  try {
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.warn('Erro ao abrir link WhatsApp:', e);
  }

  setTimeout(() => {
    window.location.href = whatsappUrl;
  }, 400);
}

function closeStorePixModal() {
  if (AppState.storePixPollingInterval) {
    clearInterval(AppState.storePixPollingInterval);
  }
  const modal = document.getElementById('officialStorePixModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

function copyPixCode() {
  const input = document.getElementById('pixCopyInput');
  const btn = document.getElementById('btnCopyPix');
  if (!input) return;

  input.select();
  input.setSelectionRange(0, 99999);

  try {
    navigator.clipboard.writeText(input.value);
  } catch (e) {
    document.execCommand('copy');
  }

  if (btn) {
    const origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.innerHTML = origHtml;
      btn.style.background = '#9333ea';
    }, 2000);
  }
}

// 7. Painel Admin - Gestão dos Produtos/Cards da Loja Oficial
function renderAdminStoreProducts() {
  const tbody = document.getElementById('adminStoreProductsTbody');
  if (!tbody) return;

  const products = AppState.officialStoreProducts || [];
  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Nenhum produto cadastrado na Loja Oficial.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const isAct = p.active !== false;
    return `
      <tr>
        <td>
          <img src="${escapeHtml(p.image)}" alt="Capa" style="width: 44px; height: 34px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(168,85,247,0.3);" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'">
        </td>
        <td>
          <strong style="color: #ffffff;">${escapeHtml(p.title)}</strong><br>
          <span style="font-size: 11px; color: #a78bfa;">${escapeHtml(p.category || 'Geral')} &bull; Selo: ${escapeHtml(p.badge || '-')}</span>
        </td>
        <td>
          <span style="color: #4ade80; font-weight: 700;">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
          ${p.oldPrice ? `<br><small style="color: #64748b; text-decoration: line-through;">R$ ${p.oldPrice.toFixed(2).replace('.', ',')}</small>` : ''}
        </td>
        <td>
          <span style="font-size: 12px; color: #cbd5e1;">Estoque: <strong>${p.stock || 100}</strong></span><br>
          <span style="font-size: 11px; color: #38bdf8;">Vendas: <strong>${p.salesCount || 0}</strong></span>
        </td>
        <td>
          ${isAct 
            ? `<span class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 11px; font-weight: 700;">ATIVO</span>`
            : `<span class="badge-pill" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 11px; font-weight: 700;">INATIVO</span>`
          }
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px;" onclick="editStoreProduct('${escapeHtml(p.id)}')" title="Editar">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px; ${isAct ? 'color: #fca5a5;' : 'color: #86efac;'}" onclick="toggleStoreProduct('${escapeHtml(p.id)}')" title="${isAct ? 'Desativar' : 'Ativar'}">
              <i class="fa-solid ${isAct ? 'fa-eye-slash' : 'fa-eye'}"></i>
            </button>
            <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px; color: #ef4444;" onclick="deleteStoreProduct('${escapeHtml(p.id)}')" title="Excluir">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleSaveStoreProduct(e) {
  e.preventDefault();
  const editId = document.getElementById('storeProductEditId').value;
  const title = document.getElementById('storeProductTitle').value.trim();
  const category = document.getElementById('storeProductCategory').value;
  const price = parseFloat(document.getElementById('storeProductPrice').value);
  const oldPrice = parseFloat(document.getElementById('storeProductOldPrice').value) || (price * 1.6);
  const badge = document.getElementById('storeProductBadge').value.trim() || 'OFICIAL';
  const stock = parseInt(document.getElementById('storeProductStock').value, 10) || 100;
  const image = document.getElementById('storeProductImage').value.trim();
  const description = document.getElementById('storeProductDescription').value.trim();

  let categoryKey = 'ai';
  if (category.includes('Créditos')) categoryKey = 'credits';
  else if (category.includes('FRP')) categoryKey = 'frp';
  else if (category.includes('Ferramentas')) categoryKey = 'tools';

  if (editId) {
    // Modo Edição
    const idx = (AppState.officialStoreProducts || []).findIndex(p => p.id === editId);
    if (idx >= 0) {
      AppState.officialStoreProducts[idx] = {
        ...AppState.officialStoreProducts[idx],
        title,
        category,
        categoryKey,
        price,
        oldPrice,
        badge,
        stock,
        image,
        description
      };
    }
    cancelStoreProductEdit();
  } else {
    // Novo Produto
    const newProd = {
      id: 'prod_' + Date.now(),
      title,
      category,
      categoryKey,
      price,
      oldPrice,
      badge,
      badgeColor: '#8b5cf6',
      stock,
      salesCount: 0,
      rating: 5.0,
      seller: 'SuporteServerSmart Oficial',
      image,
      description,
      active: true
    };
    AppState.officialStoreProducts.unshift(newProd);
    e.target.reset();
  }

  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_PRODUCTS, JSON.stringify(AppState.officialStoreProducts));
  renderAdminStoreProducts();
  alert('Produto da Loja Oficial salvo com sucesso!');
}

function editStoreProduct(id) {
  const prod = (AppState.officialStoreProducts || []).find(p => p.id === id);
  if (!prod) return;

  document.getElementById('storeProductEditId').value = prod.id;
  document.getElementById('storeProductTitle').value = prod.title || '';
  document.getElementById('storeProductCategory').value = prod.category || 'Inteligência Artificial';
  document.getElementById('storeProductPrice').value = prod.price || '';
  document.getElementById('storeProductOldPrice').value = prod.oldPrice || '';
  document.getElementById('storeProductBadge').value = prod.badge || '';
  document.getElementById('storeProductStock').value = prod.stock || 100;
  document.getElementById('storeProductImage').value = prod.image || '';
  document.getElementById('storeProductDescription').value = prod.description || '';

  const titleEl = document.getElementById('storeProductFormTitle');
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color: #38bdf8;"></i> Editando Produto: "${escapeHtml(prod.title)}"`;
  }
  const cancelBtn = document.getElementById('btnCancelEditStoreProd');
  if (cancelBtn) cancelBtn.style.display = 'inline-block';

  document.getElementById('formStoreProduct').scrollIntoView({ behavior: 'smooth' });
}

function cancelStoreProductEdit() {
  document.getElementById('storeProductEditId').value = '';
  document.getElementById('formStoreProduct').reset();
  const titleEl = document.getElementById('storeProductFormTitle');
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-plus-circle" style="color: #4ade80;"></i> Cadastrar Novo Produto / Card na Loja Oficial`;
  }
  const cancelBtn = document.getElementById('btnCancelEditStoreProd');
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function toggleStoreProduct(id) {
  const prod = (AppState.officialStoreProducts || []).find(p => p.id === id);
  if (!prod) return;
  prod.active = prod.active === false ? true : false;
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_PRODUCTS, JSON.stringify(AppState.officialStoreProducts));
  renderAdminStoreProducts();
}

function deleteStoreProduct(id) {
  if (!confirm('Tem certeza que deseja excluir este produto da Loja Oficial?')) return;
  AppState.officialStoreProducts = (AppState.officialStoreProducts || []).filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_PRODUCTS, JSON.stringify(AppState.officialStoreProducts));
  renderAdminStoreProducts();
}

function resetStoreProductsToDefault() {
  if (!confirm('Deseja restaurar todos os produtos originais da Loja Oficial?')) return;
  AppState.officialStoreProducts = JSON.parse(JSON.stringify(window.TECH_UNION_DATA.officialStoreProducts || []));
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_PRODUCTS, JSON.stringify(AppState.officialStoreProducts));
  renderAdminStoreProducts();
  alert('Catálogo original da Loja Oficial restaurado com sucesso!');
}

function setStoreImagePreset(type) {
  const imgInput = document.getElementById('storeProductImage');
  if (!imgInput) return;

  const presets = {
    chatgpt: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=80',
    gemini: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    lovable: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=80',
    claude: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=500&auto=format&fit=crop&q=80',
    kling: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    motorola: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    portlink: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80'
  };

  imgInput.value = presets[type] || '';
}

// 8. Painel Admin - Gestão dos Usuários da Loja Oficial
function renderAdminStoreUsers() {
  const tbody = document.getElementById('adminStoreUsersTbody');
  if (!tbody) return;

  const users = AppState.officialStoreUsers || [];
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Nenhum usuário cadastrado na Loja Oficial.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const isAct = u.status !== 'bloqueado';
    const userOrdersCount = (AppState.officialStoreOrders || []).filter(
      o => o.username && o.username.toLowerCase() === u.username.toLowerCase()
    ).length;

    const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-';

    return `
      <tr>
        <td>
          <strong style="color: #ffffff; font-size: 13px;">${escapeHtml(u.username)}</strong><br>
          <span style="font-size: 11px; color: #a78bfa;">Senha: <code>${escapeHtml(u.password)}</code></span>
        </td>
        <td>
          <a href="https://api.whatsapp.com/send?phone=55${escapeHtml((u.whatsapp || '').replace(/\D/g, ''))}" target="_blank" style="color: #4ade80; text-decoration: none; font-weight: 600;">
            <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(u.whatsapp || '-')}
          </a>
        </td>
        <td>${dateStr}</td>
        <td>
          ${isAct
            ? `<span class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 11px; font-weight: 700;">LIBERADO (Ativo)</span>`
            : `<span class="badge-pill" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 11px; font-weight: 700;">BLOQUEADO</span>`
          }
        </td>
        <td>
          <span class="badge-pill" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; font-weight: 800;">
            ${userOrdersCount} Pedidos
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px; ${isAct ? 'color: #fca5a5;' : 'color: #86efac;'}" onclick="toggleStoreUserStatus('${escapeHtml(u.username)}')" title="${isAct ? 'Bloquear Acesso' : 'Liberar Acesso'}">
              <i class="fa-solid ${isAct ? 'fa-user-lock' : 'fa-user-check'}"></i> ${isAct ? 'Bloquear' : 'Liberar'}
            </button>
            <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px;" onclick="changeStoreUserPassword('${escapeHtml(u.username)}')" title="Alterar Senha">
              <i class="fa-solid fa-key"></i> Senha
            </button>
            <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px; color: #ef4444;" onclick="deleteStoreUser('${escapeHtml(u.username)}')" title="Excluir Usuário">
              <i class="fa-solid fa-user-xmark"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function handleAdminCreateStoreUser(e) {
  e.preventDefault();
  const username = document.getElementById('adminNewStoreUsername').value.trim();
  const whatsapp = document.getElementById('adminNewStoreWhatsapp').value.trim();
  const password = document.getElementById('adminNewStorePassword').value.trim();

  if (!username || !whatsapp || !password) {
    alert('Preencha o nome de usuário, whatsapp e senha.');
    return;
  }

  const exists = (AppState.officialStoreUsers || []).some(
    u => u.username && u.username.toLowerCase() === username.toLowerCase()
  );
  if (exists) {
    alert('Já existe um usuário com esse nome cadastrado na Loja Oficial.');
    return;
  }

  const newUser = {
    id: 'store_user_' + Date.now(),
    username,
    whatsapp,
    password,
    createdAt: new Date().toISOString(),
    status: 'ativo',
    createdBy: 'admin'
  };

  AppState.officialStoreUsers.push(newUser);
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_USERS, JSON.stringify(AppState.officialStoreUsers));

  // Montar mensagem para o cliente
  const msg = 
    `🎉 *SEU ACESSO À LOJA OFICIAL FOI LIBERADO!* 🎉\n` +
    `----------------------------------------\n` +
    `👤 *Usuário:* ${username}\n` +
    `🔑 *Senha:* ${password}\n` +
    `🌐 *Acesse pelo site oficial:* SuporteServerSmart-Brasil Online\n` +
    `----------------------------------------\n` +
    `Clique na aba *Loja Oficial* no menu principal, digite seu usuário e senha e aproveite as ofertas com entrega automática via PIX!`;

  try {
    navigator.clipboard.writeText(msg);
  } catch (err) {}

  e.target.reset();
  renderAdminStoreUsers();

  const cleanPhone = whatsapp.replace(/\D/g, '');
  if (confirm(`Acesso criado com sucesso para "${username}"!\n\nA mensagem com os dados de login foi copiada para sua área de transferência.\n\nDeseja abrir o WhatsApp do cliente agora para enviar os dados?`)) {
    window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
  }
}

function toggleStoreUserStatus(username) {
  const user = (AppState.officialStoreUsers || []).find(
    u => u.username && u.username.toLowerCase() === username.toLowerCase()
  );
  if (!user) return;

  user.status = user.status === 'bloqueado' ? 'ativo' : 'bloqueado';
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_USERS, JSON.stringify(AppState.officialStoreUsers));
  renderAdminStoreUsers();
  alert(`O acesso do usuário "${username}" foi alterado para: ${user.status === 'ativo' ? 'LIBERADO' : 'BLOQUEADO'}.`);
}

function changeStoreUserPassword(username) {
  const user = (AppState.officialStoreUsers || []).find(
    u => u.username && u.username.toLowerCase() === username.toLowerCase()
  );
  if (!user) return;

  const newPass = prompt(`Digite a nova senha para o usuário "${username}":`, user.password || '');
  if (!newPass || !newPass.trim()) return;

  user.password = newPass.trim();
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_USERS, JSON.stringify(AppState.officialStoreUsers));
  renderAdminStoreUsers();
  alert(`Senha do usuário "${username}" alterada para: ${user.password}`);
}

function deleteStoreUser(username) {
  if (!confirm(`Tem certeza que deseja excluir o acesso do usuário "${username}" na Loja Oficial?`)) return;
  AppState.officialStoreUsers = (AppState.officialStoreUsers || []).filter(
    u => !u.username || u.username.toLowerCase() !== username.toLowerCase()
  );
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_USERS, JSON.stringify(AppState.officialStoreUsers));
  renderAdminStoreUsers();
}

// 9. Painel Admin - Gestão dos Pedidos & PIX da Loja Oficial
function renderAdminStoreOrders() {
  const tbody = document.getElementById('adminStoreOrdersTbody');
  if (!tbody) return;

  const orders = AppState.officialStoreOrders || [];

  // Calcular métricas / KPIs
  let totalEarned = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let deliveredCount = 0;

  orders.forEach(o => {
    if (o.paymentStatus === 'PAGO') {
      totalEarned += (o.totalAmount || 0);
      paidCount++;
    } else {
      pendingCount++;
    }

    if (o.deliveryStatus === 'LIBERADO') {
      deliveredCount++;
    }
  });

  const mEarned = document.getElementById('metricStoreTotalEarned');
  if (mEarned) mEarned.textContent = `R$ ${totalEarned.toFixed(2).replace('.', ',')}`;

  const mPaid = document.getElementById('metricStorePaidCount');
  if (mPaid) mPaid.textContent = paidCount;

  const mPending = document.getElementById('metricStorePendingCount');
  if (mPending) mPending.textContent = pendingCount;

  const mTotal = document.getElementById('metricStoreTotalOrders');
  if (mTotal) mTotal.textContent = orders.length;

  const mDelivered = document.getElementById('metricStoreDeliveredCount');
  if (mDelivered) mDelivered.textContent = deliveredCount;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhum pedido efetuado na Loja Oficial ainda.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const isPaid = o.paymentStatus === 'PAGO';
    const isDelivered = o.deliveryStatus === 'LIBERADO';
    const cleanWa = (o.userWhatsapp || '').replace(/\D/g, '');

    return `
      <tr>
        <td><strong style="color: #a855f7;">#${escapeHtml(o.id)}</strong></td>
        <td style="font-size: 11px; color: #94a3b8;">${escapeHtml(o.formattedDate || o.date || '-')}</td>
        <td>
          <strong style="color: #ffffff;">${escapeHtml(o.username || 'Desconhecido')}</strong>
        </td>
        <td>
          ${cleanWa ? `
            <a href="https://api.whatsapp.com/send?phone=55${cleanWa}" target="_blank" style="color: #4ade80; text-decoration: none; font-size: 11.5px;">
              <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(o.userWhatsapp)}
            </a>
          ` : '-'}
        </td>
        <td>
          <div style="font-size: 12px; color: #cbd5e1; max-width: 250px;">
            ${escapeHtml(o.itemsSummary || (o.items && o.items.map(i => i.title).join(', ')) || '-')}
          </div>
        </td>
        <td><strong style="color: #4ade80; font-size: 13px;">R$ ${(o.totalAmount || 0).toFixed(2).replace('.', ',')}</strong></td>
        <td>
          ${isPaid
            ? `<span class="badge-pill" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 11px; font-weight: 700;">PIX PAGO</span>`
            : `<span class="badge-pill" style="background: rgba(234, 179, 8, 0.15); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.4); font-size: 11px; font-weight: 700;">PENDENTE</span>`
          }
        </td>
        <td>
          ${isDelivered
            ? `<span class="badge-pill" style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); font-size: 11px; font-weight: 700;"><i class="fa-solid fa-circle-check"></i> LIBERADO</span>`
            : `<span class="badge-pill" style="background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); font-size: 11px; font-weight: 700;"><i class="fa-solid fa-clock"></i> AGUARDANDO</span>`
          }
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${!isDelivered ? `
              <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px; background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.4); color: #86efac;" onclick="markStoreOrderDelivered('${escapeHtml(o.id)}')" title="Marcar como Liberado / Entregue">
                <i class="fa-solid fa-check"></i> Liberar Pedido
              </button>
            ` : `
              <span style="font-size: 10px; color: #86efac; font-weight: 700; align-self: center;">Entregue ✔️</span>
            `}

            ${!isPaid ? `
              <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px; color: #fde047;" onclick="manuallyApproveStoreOrder('${escapeHtml(o.id)}')" title="Aprovar PIX Manualmente">
                <i class="fa-solid fa-money-bill-wave"></i> Confirmar PIX
              </button>
            ` : ''}

            ${cleanWa ? `
              <a href="https://api.whatsapp.com/send?phone=55${cleanWa}&text=${encodeURIComponent(`Olá ${o.username}! Sobre seu pedido #${o.id} na Loja Oficial Server Smart...`)}" target="_blank" class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px; color: #4ade80; text-decoration: none;" title="Conversar no WhatsApp">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
            ` : ''}

            <button class="btn-ticker-all" style="font-size: 11px; padding: 4px 8px; color: #ef4444;" onclick="deleteStoreOrder('${escapeHtml(o.id)}')" title="Excluir Pedido">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function markStoreOrderDelivered(orderId) {
  const ord = (AppState.officialStoreOrders || []).find(o => o.id === orderId);
  if (!ord) return;

  ord.deliveryStatus = 'LIBERADO';
  ord.deliveredAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_ORDERS, JSON.stringify(AppState.officialStoreOrders));
  renderAdminStoreOrders();
  alert(`Pedido #${orderId} do usuário "${ord.username}" marcado como LIBERADO com sucesso!`);
}

function manuallyApproveStoreOrder(orderId) {
  const ord = (AppState.officialStoreOrders || []).find(o => o.id === orderId);
  if (!ord) return;

  ord.paymentStatus = 'PAGO';
  ord.paidAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_ORDERS, JSON.stringify(AppState.officialStoreOrders));
  renderAdminStoreOrders();
  alert(`Pagamento do Pedido #${orderId} confirmado manualmente como PAGO!`);
}

function deleteStoreOrder(orderId) {
  if (!confirm(`Tem certeza que deseja excluir o registro do pedido #${orderId}?`)) return;
  AppState.officialStoreOrders = (AppState.officialStoreOrders || []).filter(o => o.id !== orderId);
  localStorage.setItem(STORAGE_KEYS.OFFICIAL_STORE_ORDERS, JSON.stringify(AppState.officialStoreOrders));
  renderAdminStoreOrders();
}

// Exportações Globais da Loja Oficial
window.openOfficialStore = openOfficialStore;
window.openStoreAuthModal = openStoreAuthModal;
window.closeStoreAuthModal = closeStoreAuthModal;
window.switchStoreAuthTab = switchStoreAuthTab;
window.handleStoreLogin = handleStoreLogin;
window.handleStoreRegister = handleStoreRegister;
window.storeLogout = storeLogout;
window.renderOfficialStore = renderOfficialStore;
window.setStoreCategoryFilter = setStoreCategoryFilter;
window.handleStoreSearch = handleStoreSearch;
window.clearStoreSearch = clearStoreSearch;
window.openStoreProductDetail = openStoreProductDetail;
window.closeStoreProductModal = closeStoreProductModal;
window.handleStoreQuestionSubmit = handleStoreQuestionSubmit;
window.addToCartAndOpen = addToCartAndOpen;
window.openStoreCart = openStoreCart;
window.closeStoreCart = closeStoreCart;
window.changeStoreCartQty = changeStoreCartQty;
window.removeStoreCartItem = removeStoreCartItem;
window.checkoutStoreCart = checkoutStoreCart;
window.confirmStorePaymentManual = confirmStorePaymentManual;
window.closeStorePixModal = closeStorePixModal;
window.copyPixCode = copyPixCode;
window.renderAdminStoreProducts = renderAdminStoreProducts;
window.handleSaveStoreProduct = handleSaveStoreProduct;
window.editStoreProduct = editStoreProduct;
window.cancelStoreProductEdit = cancelStoreProductEdit;
window.toggleStoreProduct = toggleStoreProduct;
window.deleteStoreProduct = deleteStoreProduct;
window.resetStoreProductsToDefault = resetStoreProductsToDefault;
window.setStoreImagePreset = setStoreImagePreset;
window.renderAdminStoreUsers = renderAdminStoreUsers;
window.handleAdminCreateStoreUser = handleAdminCreateStoreUser;
window.toggleStoreUserStatus = toggleStoreUserStatus;
window.changeStoreUserPassword = changeStoreUserPassword;
window.deleteStoreUser = deleteStoreUser;
window.renderAdminStoreOrders = renderAdminStoreOrders;
window.markStoreOrderDelivered = markStoreOrderDelivered;
window.manuallyApproveStoreOrder = manuallyApproveStoreOrder;
window.deleteStoreOrder = deleteStoreOrder;




