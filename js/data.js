// Suporte Server Smart Brasil Online - Data Store & Local Management (GSM Server Engine)
const STORAGE_KEYS = {
  SERVICES: 'sss_services_v1',
  ORDERS: 'sss_orders_v1',
  SETTINGS: 'sss_settings_v1',
  USERS: 'sss_users_v1',
  LOGS: 'sss_logs_v1',
  DHRU_API: 'sss_dhru_api_config_v1',
  DHRU_CACHE: 'sss_dhru_cache_v1'
};

const DEFAULT_SETTINGS = {
  siteName: "Suporte Server Smart Brasil Online",
  siteTagline: "O Maior Servidor GSM, Ativações Digitais, Créditos & Desbloqueio Remoto do Brasil",
  whatsapp: "5511999999999",
  whatsappFormatted: "+55 (11) 99999-9999",
  telegram: "SuporteServerSmartOficial",
  pixKey: "financeiro@serversmartbrasil.com",
  pixName: "Suporte Server Smart Brasil LTDA",
  pixCity: "SAO PAULO",
  usdtWallet: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  usdRate: 5.65,
  adminPin: "admin123",
  serverStatus: "online",
  serverLoad: "18%",
  apiStatus: "conectado",
  dhruApiUrl: "",
  dhruApiUsername: "",
  dhruApiKey: "",
  dhruApiProvider: "dhru_fusion",
  dhruProfitMargin: 30
};

const DEFAULT_SERVICES = [
  {
    id: "srv-001",
    name: "UnlockTool - Licença Digital 3 Meses",
    category: "tools",
    categoryLabel: "Ferramentas & Dongles",
    priceBRL: 145.00,
    priceUSD: 26.00,
    costBRL: 110.00,
    deliveryTime: "Instantâneo (1-10 min)",
    status: "active",
    type: "username",
    inputLabel: "Usuário Cadastrado no UnlockTool",
    inputPlaceholder: "Ex: tec_smart_brasil",
    description: "Ativação instantânea oficial na sua conta de usuário UnlockTool. Suporte total a Samsung, Xiaomi, iPhone, Oppo, Vivo.",
    serverApi: "UnlockTool Direct API",
    featured: true,
    badge: "MAIS VENDIDO"
  },
  {
    id: "srv-002",
    name: "UnlockTool - Licença Digital 6 Meses",
    category: "tools",
    categoryLabel: "Ferramentas & Dongles",
    priceBRL: 235.00,
    priceUSD: 42.00,
    costBRL: 185.00,
    deliveryTime: "Instantâneo (1-10 min)",
    status: "active",
    type: "username",
    inputLabel: "Usuário Cadastrado no UnlockTool",
    inputPlaceholder: "Ex: seu_usuario",
    description: "Renovação ou nova ativação de 6 meses oficial. Acesso a todas as atualizações e novos modelos.",
    serverApi: "UnlockTool Direct API",
    featured: true,
    badge: "POPULAR"
  },
  {
    id: "srv-003",
    name: "UnlockTool - Licença Digital 12 Meses",
    category: "tools",
    categoryLabel: "Ferramentas & Dongles",
    priceBRL: 389.00,
    priceUSD: 69.00,
    costBRL: 310.00,
    deliveryTime: "Instantâneo (1-10 min)",
    status: "active",
    type: "username",
    inputLabel: "Usuário Cadastrado no UnlockTool",
    inputPlaceholder: "Ex: seu_usuario",
    description: "A melhor opção custo-benefício para técnicos e bancadas de assistência técnica. 1 ano completo de suporte.",
    serverApi: "UnlockTool Direct API",
    featured: true,
    badge: "MELHOR VALOR"
  },
  {
    id: "srv-004",
    name: "Chimera Tool - Ativação Samsung 12 Meses",
    category: "tools",
    categoryLabel: "Ferramentas & Dongles",
    priceBRL: 490.00,
    priceUSD: 88.00,
    costBRL: 410.00,
    deliveryTime: "10 a 30 minutos",
    status: "active",
    type: "username",
    inputLabel: "Nome de Usuário Chimera",
    inputPlaceholder: "Ex: smartuser_br",
    description: "Ativação anual do módulo Samsung da Chimera Tool para reparo avançado, FRP, Patch Cert e Knox.",
    serverApi: "Chimera Server API",
    featured: false,
    badge: "OFICIAL"
  },
  {
    id: "srv-005",
    name: "Chimera Tool - Licença All Modules PRO (12 Meses)",
    category: "tools",
    categoryLabel: "Ferramentas & Dongles",
    priceBRL: 890.00,
    priceUSD: 159.00,
    costBRL: 760.00,
    deliveryTime: "15 a 45 minutos",
    status: "active",
    type: "username",
    inputLabel: "Nome de Usuário Chimera",
    inputPlaceholder: "Ex: chimeramaster_br",
    description: "Todos os módulos ativos: Samsung, Huawei, Xiaomi, LG, MTK, Qualcomm, BlackBerry.",
    serverApi: "Chimera Server API",
    featured: true,
    badge: "PRO"
  },
  {
    id: "srv-006",
    name: "Xiaomi Auth Server - Crédito EDL Flash / Unbrick",
    category: "credits",
    categoryLabel: "Créditos de Servidor",
    priceBRL: 95.00,
    priceUSD: 17.00,
    costBRL: 70.00,
    deliveryTime: "Instantâneo (Servidor 24/7)",
    status: "active",
    type: "imei",
    inputLabel: "Código de Autorização / Modelo",
    inputPlaceholder: "Ex: Redmi Note 12 4G - EDL Token",
    description: "Autenticação oficial para flash em modo EDL 9008 para modelos recentes Xiaomi/Redmi/Poco.",
    serverApi: "Xiaomi Global Auth Cluster",
    featured: true,
    badge: "ONLINE 24/7"
  },
  {
    id: "srv-007",
    name: "Samsung FRP 2024/2026 - Desbloqueio Instantâneo Via Servidor",
    category: "imei",
    categoryLabel: "Serviços IMEI & FRP",
    priceBRL: 65.00,
    priceUSD: 12.00,
    costBRL: 45.00,
    deliveryTime: "1 a 5 minutos",
    status: "active",
    type: "imei",
    inputLabel: "IMEI do Aparelho (15 dígitos)",
    inputPlaceholder: "Ex: 356894091234567",
    description: "Remoção de conta Google em todos os modelos e versões de segurança Android 11, 12, 13, 14, 15. Qualquer binário.",
    serverApi: "Samsung Knx Server Node 1",
    featured: true,
    badge: "NOVO MÉTODO"
  },
  {
    id: "srv-008",
    name: "Apple iPhone - Consulta GSX / Status iCloud & Operadora",
    category: "imei",
    categoryLabel: "Serviços IMEI & FRP",
    priceBRL: 15.00,
    priceUSD: 2.80,
    costBRL: 8.00,
    deliveryTime: "Instantâneo (10 segundos)",
    status: "active",
    type: "imei",
    inputLabel: "IMEI ou Número de Série Apple",
    inputPlaceholder: "Ex: 359123456789012 ou F17...",
    description: "Relatório completo GSX: FMI Status (Clean/Lost), Operadora Original, Garantia, Blacklist e Modelo Exato.",
    serverApi: "Apple GSX Gateway",
    featured: false,
    badge: "INSTANTÂNEO"
  },
  {
    id: "srv-009",
    name: "Motorola MDM & FRP - Remoção Via Servidor Remoto",
    category: "remote",
    categoryLabel: "Atendimento Remoto",
    priceBRL: 85.00,
    priceUSD: 15.00,
    costBRL: 55.00,
    deliveryTime: "15 a 30 minutos (Agendado)",
    status: "active",
    type: "remote",
    inputLabel: "ID AnyDesk + Modelo do Aparelho",
    inputPlaceholder: "Ex: 123 456 789 - Moto G54",
    description: "Técnico especialista realiza o procedimento direto no seu computador via conexão segura AnyDesk.",
    serverApi: "Manual Tech Dispatch",
    featured: false,
    badge: "ESPECIALISTA"
  },
  {
    id: "srv-010",
    name: "Pandora Box / Dongle - Licença Digital 12 Meses",
    category: "tools",
    categoryLabel: "Ferramentas & Dongles",
    priceBRL: 320.00,
    priceUSD: 57.00,
    costBRL: 250.00,
    deliveryTime: "30 minutos",
    status: "active",
    type: "username",
    inputLabel: "E-mail ou Usuário Pandora",
    inputPlaceholder: "Ex: seuemail@gmail.com",
    description: "Licença digital sem necessidade de box física. Poderoso software para aparelhos MTK, Unisoc/SPD.",
    serverApi: "Pandora Server Gateway",
    featured: false,
    badge: "SEM BOX"
  },
  {
    id: "srv-011",
    name: "Octoplus FRP Tool - Licença Digital 12 Meses",
    category: "tools",
    categoryLabel: "Ferramentas & Dongles",
    priceBRL: 360.00,
    priceUSD: 64.00,
    costBRL: 290.00,
    deliveryTime: "10 a 40 minutos",
    status: "active",
    type: "username",
    inputLabel: "E-mail para Licença Digital Octoplus",
    inputPlaceholder: "Ex: bancada@assistencia.com",
    description: "Versão digital oficial Octoplus para desbloqueio de FRP sem dongle de hardware.",
    serverApi: "Octoplus Server API",
    featured: false,
    badge: "OFICIAL"
  },
  {
    id: "srv-012",
    name: "Xiaomi Mi Cloud Clean - Desbloqueio Definitivo por Código de Bloqueio",
    category: "remote",
    categoryLabel: "Atendimento Remoto",
    priceBRL: 160.00,
    priceUSD: 29.00,
    costBRL: 120.00,
    deliveryTime: "1 a 24 horas",
    status: "active",
    type: "imei",
    inputLabel: "Código de Bloqueio da Tela (Lock Code)",
    inputPlaceholder: "Ex: 2798-1290-7612 (toque 10x no cadeado)",
    description: "Remoção definitiva e oficial de conta Mi de aparelhos com status Clean (Brasil e América Latina).",
    serverApi: "Xiaomi Global Server",
    featured: true,
    badge: "DEFINITIVO"
  }
];

const DEFAULT_ORDERS = [
  {
    orderId: "SSB-98421",
    serviceId: "srv-001",
    serviceName: "UnlockTool - Licença Digital 3 Meses",
    customerName: "Carlos Eduardo (CellTech)",
    customerContact: "(11) 98765-4321",
    dataInput: "carlos_celltech",
    priceBRL: 145.00,
    paymentMethod: "PIX",
    status: "completed",
    date: "2026-10-15 19:42",
    serverNotes: "Ativação concluída com sucesso via API direta. Licença válida até 15/01/2027.",
    resultCode: "SUCCESS_ACT_98242"
  },
  {
    orderId: "SSB-98420",
    serviceId: "srv-007",
    serviceName: "Samsung FRP 2024/2026 - Desbloqueio Instantâneo",
    customerName: "Marcos Vinicius",
    customerContact: "(21) 97654-3210",
    dataInput: "356894091238472",
    priceBRL: 65.00,
    paymentMethod: "PIX",
    status: "completed",
    date: "2026-10-15 20:15",
    serverNotes: "Token FRP injetado via Knox Server. Conta Google removida com sucesso.",
    resultCode: "FRP_RESET_OK"
  },
  {
    orderId: "SSB-98422",
    serviceId: "srv-006",
    serviceName: "Xiaomi Auth Server - Crédito EDL Flash",
    customerName: "Ricardo Silva - Assistência Express",
    customerContact: "(31) 98111-2233",
    dataInput: "EDL-TOKEN-POCO-X5-PRO",
    priceBRL: 95.00,
    paymentMethod: "PIX",
    status: "processing",
    date: "2026-10-15 21:30",
    serverNotes: "Aguardando envio do pacote Auth pelo técnico.",
    resultCode: "IN_PROGRESS"
  },
  {
    orderId: "SSB-98423",
    serviceId: "srv-003",
    serviceName: "UnlockTool - Licença Digital 12 Meses",
    customerName: "Felipe Andrade",
    customerContact: "(47) 99222-3344",
    dataInput: "felipe_unlocker",
    priceBRL: 389.00,
    paymentMethod: "PIX",
    status: "pending",
    date: "2026-10-15 21:55",
    serverNotes: "Aguardando confirmação do pagamento PIX.",
    resultCode: "WAITING_PAYMENT"
  }
];

const DEFAULT_USERS = [
  {
    id: "usr-01",
    name: "Assistência CellTech SP",
    email: "contato@celltechsp.com.br",
    role: "Revendedor Master",
    balanceBRL: 540.00,
    ordersCount: 42,
    discountPercent: 12
  },
  {
    id: "usr-02",
    name: "GSM Master Rio",
    email: "suporte@gsmmasterrio.com",
    role: "Revendedor VIP",
    balanceBRL: 180.00,
    ordersCount: 19,
    discountPercent: 8
  },
  {
    id: "usr-03",
    name: "Bancada Rápida BH",
    email: "bancadabh@gmail.com",
    role: "Cliente Técnico",
    balanceBRL: 45.00,
    ordersCount: 5,
    discountPercent: 0
  }
];

const DEFAULT_LOGS = [
  { time: "21:55:10", type: "order", message: "Novo pedido recebido: SSB-98423 (UnlockTool 12 Meses)" },
  { time: "21:30:45", type: "server", message: "Job enviado para o cluster Xiaomi Auth: SSB-98422" },
  { time: "20:16:02", type: "success", message: "Pedido SSB-98420 finalizado com êxito (Samsung FRP)" },
  { time: "19:43:18", type: "api", message: "API UnlockTool respondeu em 240ms: Licença ativada" },
  { time: "19:00:00", type: "system", message: "Sincronização de taxas de câmbio USD/BRL atualizada (R$ 5,65)" }
];

// Data Access Object
window.SSB = {
  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.addLog("system", "Configurações do servidor atualizadas.");
  },

  getServices() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return stored ? JSON.parse(stored) : DEFAULT_SERVICES;
    } catch (e) {
      return DEFAULT_SERVICES;
    }
  },

  saveServices(services) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  },

  getOrders() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return stored ? JSON.parse(stored) : DEFAULT_ORDERS;
    } catch (e) {
      return DEFAULT_ORDERS;
    }
  },

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getUsers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      let list = stored ? JSON.parse(stored) : [...DEFAULT_USERS];

      // Sincronizar contas cadastradas pelos clientes/técnicos e primeiro admin
      const customerAccounts = JSON.parse(localStorage.getItem('sss_customer_accounts_v1') || '[]');
      const designatedAdmin = localStorage.getItem('sss_admin_email_v1');

      customerAccounts.forEach(c => {
        const isAdm = c.role === 'admin' || c.isAdmin === true || (designatedAdmin && c.email.toLowerCase() === designatedAdmin.toLowerCase());
        const existing = list.find(u => u.email.toLowerCase() === c.email.toLowerCase());
        if (!existing) {
          list.push({
            id: `usr-${c.email.split('@')[0]}`,
            name: c.name,
            email: c.email,
            role: isAdm ? '👑 Administrador Geral' : 'Cliente Técnico',
            balanceBRL: c.balance || 0,
            ordersCount: 0,
            discountPercent: isAdm ? 25 : 0
          });
        } else if (isAdm) {
          existing.role = '👑 Administrador Geral';
        }
      });

      return list;
    } catch (e) {
      return DEFAULT_USERS;
    }
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      return stored ? JSON.parse(stored) : DEFAULT_LOGS;
    } catch (e) {
      return DEFAULT_LOGS;
    }
  },

  addLog(type, message) {
    const logs = this.getLogs();
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR');
    logs.unshift({ time, type, message });
    if (logs.length > 50) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },

  addOrder(orderData) {
    const orders = this.getOrders();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder = {
      orderId: `SSB-${randomNum}`,
      date: new Date().toLocaleString('pt-BR'),
      status: "pending",
      serverNotes: "Aguardando confirmação de pagamento para processar no servidor.",
      resultCode: "WAITING_PAYMENT",
      ...orderData
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    this.addLog("order", `Novo pedido criado: ${newOrder.orderId} (${newOrder.serviceName})`);

    // Sincronizar com o Supabase Cloud se configurado
    if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
      window.SSB_Supabase.createOrder(newOrder).then(res => {
        if (res) console.log("☁️ Pedido enviado com sucesso ao Supabase:", newOrder.orderId);
      }).catch(e => console.warn(e));
    }

    return newOrder;
  },

  updateOrderStatus(orderId, newStatus, serverNotes, resultCode) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.orderId === orderId);
    if (idx !== -1) {
      orders[idx].status = newStatus;
      if (serverNotes) orders[idx].serverNotes = serverNotes;
      if (resultCode) orders[idx].resultCode = resultCode;
      this.saveOrders(orders);
      this.addLog("order", `Pedido ${orderId} atualizado para [${newStatus.toUpperCase()}]`);

      // Sincronizar status no Supabase Cloud
      if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
        window.SSB_Supabase.updateOrderStatus(orderId, newStatus, serverNotes, resultCode).catch(e => console.warn(e));
      }

      return orders[idx];
    }
    return null;
  },

  deleteOrder(orderId) {
    let orders = this.getOrders();
    const initialLen = orders.length;
    orders = orders.filter(o => o.orderId !== orderId);
    this.saveOrders(orders);
    this.addLog("order", `Pedido ${orderId} excluído permanentemente.`);

    // Deletar também no Supabase se ativo
    if (window.SSB_Supabase && window.SSB_Supabase.isConfigured && window.SSB_Supabase.client) {
      window.SSB_Supabase.client.from('orders').delete().eq('order_id', orderId).then(() => {
        console.log("☁️ Pedido excluído do Supabase:", orderId);
      }).catch(e => console.warn(e));
    }
    return initialLen !== orders.length;
  },

  deleteOrders(orderIds) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) return 0;
    const toDeleteSet = new Set(orderIds);
    let orders = this.getOrders();
    const initialLen = orders.length;
    orders = orders.filter(o => !toDeleteSet.has(o.orderId));
    this.saveOrders(orders);
    const removedCount = initialLen - orders.length;
    this.addLog("order", `${removedCount} pedidos excluídos permanentemente.`);

    // Deletar também no Supabase se ativo
    if (window.SSB_Supabase && window.SSB_Supabase.isConfigured && window.SSB_Supabase.client) {
      window.SSB_Supabase.client.from('orders').delete().in('order_id', Array.from(toDeleteSet)).then(() => {
        console.log("☁️ Pedidos excluídos do Supabase em lote");
      }).catch(e => console.warn(e));
    }
    return removedCount;
  },

  async syncFromCloud() {
    if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
      const cloudOrders = await window.SSB_Supabase.fetchOrders();
      if (cloudOrders && cloudOrders.length > 0) {
        const localOrders = this.getOrders();
        const merged = [...cloudOrders];
        localOrders.forEach(loc => {
          if (!merged.some(m => m.orderId === loc.orderId)) {
            merged.push(loc);
          }
        });
        this.saveOrders(merged);
        return merged;
      }
    }
    return this.getOrders();
  },

  async syncServicesFromCloud() {
    if (window.SSB_Supabase && window.SSB_Supabase.isConfigured) {
      const cloudServices = await window.SSB_Supabase.fetchServices();
      if (cloudServices && cloudServices.length > 0) {
        this.saveServices(cloudServices);
        return cloudServices;
      }
    }
    return this.getServices();
  },

  findOrder(query) {
    const orders = this.getOrders();
    const cleanQuery = query.trim().toUpperCase();
    return orders.find(o => 
      o.orderId.toUpperCase() === cleanQuery || 
      (o.dataInput && o.dataInput.toUpperCase().includes(cleanQuery))
    );
  },

  // Catálogo Oficial de Atacado DHRU / Servidores GSM
  getDhruWholesaleCatalog() {
    return [
      { id: "dhru-001", name: "UnlockTool - Licença Digital 3 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 20.00, suggestedPriceUSD: 26.00, deliveryTime: "Instantâneo (1-10 min)", type: "username", inputLabel: "Usuário Cadastrado UnlockTool", inputPlaceholder: "Ex: seu_usuario", description: "Ativação oficial de 3 meses. Suporte a Samsung, Xiaomi, iPhone, Oppo, Vivo.", serverApi: "DHRU Fusion API" },
      { id: "dhru-002", name: "UnlockTool - Licença Digital 6 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 33.00, suggestedPriceUSD: 42.00, deliveryTime: "Instantâneo (1-10 min)", type: "username", inputLabel: "Usuário Cadastrado UnlockTool", inputPlaceholder: "Ex: seu_usuario", description: "Ativação oficial de 6 meses com suporte a todos os modelos recentes.", serverApi: "DHRU Fusion API" },
      { id: "dhru-003", name: "UnlockTool - Licença Digital 12 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 50.00, suggestedPriceUSD: 62.00, deliveryTime: "Instantâneo (1-10 min)", type: "username", inputLabel: "Usuário Cadastrado UnlockTool", inputPlaceholder: "Ex: seu_usuario", description: "Plano anual completo UnlockTool com atualizações prioritárias.", serverApi: "DHRU Fusion API" },
      { id: "dhru-004", name: "Chimera Tool - Ativação Samsung 12 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 75.00, suggestedPriceUSD: 95.00, deliveryTime: "Instantâneo (5-15 min)", type: "username", inputLabel: "Nome de Usuário Chimera", inputPlaceholder: "Ex: chimera_user", description: "Licença anual Chimera com suporte a todos os modelos Samsung Exynos e Snapdragon.", serverApi: "Chimera Direct API" },
      { id: "dhru-005", name: "Chimera Tool - PRO All Modules 12 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 135.00, suggestedPriceUSD: 165.00, deliveryTime: "Instantâneo (5-15 min)", type: "username", inputLabel: "Nome de Usuário Chimera", inputPlaceholder: "Ex: chimera_pro", description: "Licença profissional completa para todas as marcas: Samsung, Huawei, Xiaomi, LG, MTK, Qualcomm.", serverApi: "Chimera Direct API" },
      { id: "dhru-006", name: "Pandora Box / Tool - Licença Digital 1 Ano", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 38.00, suggestedPriceUSD: 52.00, deliveryTime: "Instantâneo (1-10 min)", type: "email", inputLabel: "E-mail de Cadastro Pandora", inputPlaceholder: "Ex: tec@gmail.com", description: "Ativação standalone Pandora Tool sem necessidade de box física para MTK e Unisoc.", serverApi: "DHRU Server Cluster" },
      { id: "dhru-007", name: "Octoplus FRP Tool - Licença Digital 1 Ano", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 65.00, suggestedPriceUSD: 85.00, deliveryTime: "Instantâneo (1-15 min)", type: "username", inputLabel: "Usuário Octoplus Digital", inputPlaceholder: "Ex: octo_user", description: "Remoção de FRP rápida para Samsung, Motorola, LG, Huawei com 1 ano de suporte.", serverApi: "DHRU Fusion API" },
      { id: "dhru-008", name: "Hydra Tool - Licença Digital 6 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 29.00, suggestedPriceUSD: 39.00, deliveryTime: "Instantâneo (5-20 min)", type: "email", inputLabel: "E-mail Hydra Tool", inputPlaceholder: "Ex: seu@email.com", description: "Suporte especializado em chipsets MTK, Qualcomm, Spreadtrum e Kirin.", serverApi: "Hydra Cluster" },
      { id: "dhru-009", name: "Hydra Tool - Licença Digital 12 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 45.00, suggestedPriceUSD: 59.00, deliveryTime: "Instantâneo (5-20 min)", type: "email", inputLabel: "E-mail Hydra Tool", inputPlaceholder: "Ex: seu@email.com", description: "Licença anual Hydra Tool com atualizações automáticas.", serverApi: "Hydra Cluster" },
      { id: "dhru-010", name: "Griffin Unlocker Tool - Ativação 3 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 18.00, suggestedPriceUSD: 25.00, deliveryTime: "Instantâneo (1-10 min)", type: "username", inputLabel: "Usuário Griffin Unlocker", inputPlaceholder: "Ex: griffin_user", description: "Solução econômica e rápida para remoção de FRP, reparo de IMEI e Mi Account.", serverApi: "DHRU Fusion API" },
      { id: "dhru-011", name: "Griffin Unlocker Tool - Ativação 12 Meses", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 36.00, suggestedPriceUSD: 48.00, deliveryTime: "Instantâneo (1-10 min)", type: "username", inputLabel: "Usuário Griffin Unlocker", inputPlaceholder: "Ex: griffin_user", description: "Plano anual Griffin Unlocker sem necessidade de dongle físico.", serverApi: "DHRU Fusion API" },
      { id: "dhru-012", name: "TFM Tool Pro - Licença Oficial 1 Ano", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 30.00, suggestedPriceUSD: 42.00, deliveryTime: "Instantâneo (5-15 min)", type: "username", inputLabel: "Usuário TFM Tool Pro", inputPlaceholder: "Ex: tfm_user", description: "Ferramenta multi-marca profissional para bancada técnica com servidores dedicados.", serverApi: "TFM Server API" },
      { id: "dhru-013", name: "Cheetah Tool Pro - Ativação 1 Ano", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 28.00, suggestedPriceUSD: 38.00, deliveryTime: "Instantâneo (5-20 min)", type: "username", inputLabel: "Usuário Cheetah Pro", inputPlaceholder: "Ex: cheetah_user", description: "Ativação anual oficial Cheetah Tool para operações de flash e unlock.", serverApi: "Cheetah API" },
      { id: "dhru-014", name: "EFT Pro Dongle - Ativação Digital 1 Ano", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 42.00, suggestedPriceUSD: 56.00, deliveryTime: "Instantâneo (5-15 min)", type: "serial", inputLabel: "Número de Série do Dongle EFT", inputPlaceholder: "Ex: EFT12345678", description: "Renovação oficial de 1 ano do software Easy Firmware Team (EFT Pro).", serverApi: "DHRU Fusion API" },
      { id: "dhru-015", name: "SamFW FRP Tool - Pacote 50 Créditos Server", category: "credits", categoryLabel: "Créditos & Servidores", costUSD: 15.00, suggestedPriceUSD: 22.00, deliveryTime: "Instantâneo (1-5 min)", type: "username", inputLabel: "Usuário Cadastrado SamFW", inputPlaceholder: "Ex: samfw_user", description: "Créditos para bypass de FRP Samsung Knox, Xiaomi e LG via servidor SamFW.", serverApi: "SamFW Server API" },
      { id: "dhru-016", name: "SamFW FRP Tool - Pacote 100 Créditos Server", category: "credits", categoryLabel: "Créditos & Servidores", costUSD: 28.00, suggestedPriceUSD: 39.00, deliveryTime: "Instantâneo (1-5 min)", type: "username", inputLabel: "Usuário Cadastrado SamFW", inputPlaceholder: "Ex: samfw_user", description: "Pacote econômico de 100 créditos para revendedores com custo reduzido.", serverApi: "SamFW Server API" },
      { id: "dhru-017", name: "Xiaomi Auth EDL 9008 Flash - 10 Créditos Servidor", category: "credits", categoryLabel: "Créditos & Servidores", costUSD: 25.00, suggestedPriceUSD: 35.00, deliveryTime: "Instantâneo (1-5 min)", type: "username", inputLabel: "Usuário Mi Flash / Auth Tool", inputPlaceholder: "Ex: mi_auth_user", description: "Créditos oficiais para autorização de flash EDL 9008 em Xiaomi, Redmi e POCO.", serverApi: "Xiaomi Cloud Cluster" },
      { id: "dhru-018", name: "Xiaomi Auth EDL 9008 Flash - 25 Créditos Servidor", category: "credits", categoryLabel: "Créditos & Servidores", costUSD: 60.00, suggestedPriceUSD: 79.00, deliveryTime: "Instantâneo (1-5 min)", type: "username", inputLabel: "Usuário Mi Flash / Auth Tool", inputPlaceholder: "Ex: mi_auth_user", description: "Pacote para assistências técnicas com alta demanda de recuperação de bootloop.", serverApi: "Xiaomi Cloud Cluster" },
      { id: "dhru-019", name: "Xiaomi Mi Account Clean Instantâneo (World/BR)", category: "imei", categoryLabel: "Serviços IMEI & Desbloqueio", costUSD: 22.00, suggestedPriceUSD: 32.00, deliveryTime: "10 a 60 minutos", type: "imei", inputLabel: "Código de Bloqueio (Unlock Code) da Tela", inputPlaceholder: "Ex: 7G82X19K ou IMEI", description: "Remoção permanente de conta Mi do servidor oficial Xiaomi para aparelhos Clean.", serverApi: "DHRU Fusion API" },
      { id: "dhru-020", name: "Samsung FRP Reset Instantâneo All Android 2024/2026 (Server)", category: "imei", categoryLabel: "Serviços IMEI & Desbloqueio", costUSD: 12.00, suggestedPriceUSD: 18.00, deliveryTime: "Instantâneo (1-10 min)", type: "imei", inputLabel: "IMEI do Aparelho (15 dígitos)", inputPlaceholder: "Ex: 356789123456789", description: "Desbloqueio de Conta Google Samsung direto no servidor oficial sem abrir o aparelho.", serverApi: "Samsung Server Hub" },
      { id: "dhru-021", name: "Samsung Knox / KG Locked Bypass (Exynos/MTK)", category: "imei", categoryLabel: "Serviços IMEI & Desbloqueio", costUSD: 18.00, suggestedPriceUSD: 27.00, deliveryTime: "15 a 45 minutos", type: "imei", inputLabel: "IMEI do Aparelho", inputPlaceholder: "Ex: 351234567890123", description: "Bypass definitivo para aparelhos Samsung com bloqueio de operadora ou empresa.", serverApi: "DHRU Fusion API" },
      { id: "dhru-022", name: "Apple iPhone GSX Check Completo (iCloud + SimLock + Sold To)", category: "imei", categoryLabel: "Serviços IMEI & Desbloqueio", costUSD: 1.20, suggestedPriceUSD: 3.00, deliveryTime: "Instantâneo (1-3 min)", type: "imei", inputLabel: "IMEI ou Serial Number Apple", inputPlaceholder: "Ex: 353456789012345", description: "Relatório oficial completo dos servidores Apple: status FMI, operadora, garantia e país.", serverApi: "Apple GSX API" },
      { id: "dhru-023", name: "Apple iPhone Clean / Lost Mode IMEI Check Instantâneo", category: "imei", categoryLabel: "Serviços IMEI & Desbloqueio", costUSD: 0.60, suggestedPriceUSD: 1.80, deliveryTime: "Instantâneo (1-2 min)", type: "imei", inputLabel: "IMEI do iPhone/iPad", inputPlaceholder: "Ex: 352123456789012", description: "Verificação rápida para saber se o aparelho está Clean ou Lost no servidor do iCloud.", serverApi: "Apple GSX API" },
      { id: "dhru-024", name: "Apple MDM Remote Management Bypass iOS (Token Instantâneo)", category: "imei", categoryLabel: "Serviços IMEI & Desbloqueio", costUSD: 14.00, suggestedPriceUSD: 22.00, deliveryTime: "Instantâneo (1-5 min)", type: "serial", inputLabel: "Número de Série Apple (Serial Number)", inputPlaceholder: "Ex: C39Z10ABC123", description: "Remoção de tela de Gerenciamento Remoto Corporativo (MDM) em iPhone e iPad.", serverApi: "DHRU Fusion API" },
      { id: "dhru-025", name: "iRemoval PRO Premium A12+ (iPhone XR até 14 Pro Max)", category: "imei", categoryLabel: "Serviços IMEI & Desbloqueio", costUSD: 48.00, suggestedPriceUSD: 65.00, deliveryTime: "Instantâneo (1-10 min)", type: "serial", inputLabel: "Serial do Aparelho (SN)", inputPlaceholder: "Ex: F17X12345678", description: "Bypass completo com sinal de chip e operadora para iPhone XR até 14 Pro Max.", serverApi: "iRemoval Server API" },
      { id: "dhru-026", name: "Motorola FRP Key Instant Server (Todos os Modelos)", category: "imei", categoryLabel: "Serviços IMEI & Desbloqueio", costUSD: 8.00, suggestedPriceUSD: 14.00, deliveryTime: "Instantâneo (1-5 min)", type: "imei", inputLabel: "IMEI Motorola", inputPlaceholder: "Ex: 358901234567890", description: "Geração de chave de desbloqueio oficial para Motorola Moto G, Edge e E Series.", serverApi: "Moto Server API" },
      { id: "dhru-027", name: "VIVO / OPPO / Realme EDL Server Authorization Token", category: "credits", categoryLabel: "Créditos & Servidores", costUSD: 9.00, suggestedPriceUSD: 16.00, deliveryTime: "Instantâneo (5-15 min)", type: "imei", inputLabel: "IMEI ou ID de Desbloqueio", inputPlaceholder: "Ex: 864512048596321", description: "Autorização remota para flash e unbrick via porta EDL Qualcomm.", serverApi: "BBK Group API" },
      { id: "dhru-028", name: "Android Multi Tools - Licença 1 Ano", category: "tools", categoryLabel: "Ferramentas & Dongles", costUSD: 25.00, suggestedPriceUSD: 36.00, deliveryTime: "Instantâneo (5-15 min)", type: "username", inputLabel: "Usuário Android Multi Tools", inputPlaceholder: "Ex: amt_user", description: "Ferramenta multiuso de reparo, remoção de senha e leitura de dados.", serverApi: "DHRU Fusion API" }
    ];
  },

  // Importar / Migrar Serviços em Massa para o Catálogo do Site
  importServicesToCatalog(servicesToImport, profitMargin = 30) {
    const existingServices = this.getServices();
    const settings = this.getSettings();
    const usdRate = settings.usdRate || 5.65;
    let importedCount = 0;
    let updatedCount = 0;

    servicesToImport.forEach(item => {
      const costBRL = item.costBRL || (item.costUSD * usdRate);
      const calculatedPriceBRL = item.priceBRL || (costBRL * (1 + (profitMargin / 100)));
      const calculatedPriceUSD = item.priceUSD || (item.costUSD ? item.costUSD * (1 + (profitMargin / 100)) : (calculatedPriceBRL / usdRate));

      const serviceObj = {
        id: item.id || `srv-${Date.now().toString().slice(-4)}-${Math.floor(Math.random()*100)}`,
        name: item.name,
        category: item.category || 'tools',
        categoryLabel: item.categoryLabel || 'Ferramentas & Dongles',
        priceBRL: Math.round(calculatedPriceBRL * 100) / 100,
        priceUSD: Math.round(calculatedPriceUSD * 100) / 100,
        costBRL: Math.round(costBRL * 100) / 100,
        deliveryTime: item.deliveryTime || 'Instantâneo (1-15 min)',
        status: 'active',
        type: item.type || 'username',
        inputLabel: item.inputLabel || 'Dado para Ativação',
        inputPlaceholder: item.inputPlaceholder || 'Ex: Usuário ou IMEI',
        description: item.description || `Serviço oficial integrado via ${item.serverApi || 'DHRU GSM Server'}.`,
        serverApi: item.serverApi || 'DHRU Fusion API',
        featured: item.featured || false,
        badge: item.badge || ''
      };

      const existingIndex = existingServices.findIndex(s => s.id === serviceObj.id || s.name.toLowerCase() === serviceObj.name.toLowerCase());
      if (existingIndex >= 0) {
        existingServices[existingIndex] = { ...existingServices[existingIndex], ...serviceObj };
        updatedCount++;
      } else {
        existingServices.push(serviceObj);
        importedCount++;
      }
    });

    this.saveServices(existingServices);
    this.addLog('api', `${importedCount} novos serviços migrados e ${updatedCount} atualizados da API GSM/DHRU.`);

    // Sincronizar com Supabase se disponível
    if (window.SSB_Supabase && window.SSB_Supabase.isConfigured && window.SSB_Supabase.client) {
      window.SSB_Supabase.client.from('services').upsert(
        existingServices.map(s => ({
          service_id: s.id,
          name: s.name,
          category: s.category,
          category_label: s.categoryLabel,
          price_brl: s.priceBRL,
          price_usd: s.priceUSD,
          cost_brl: s.costBRL,
          delivery_time: s.deliveryTime,
          status: s.status,
          type: s.type,
          input_label: s.inputLabel,
          input_placeholder: s.inputPlaceholder,
          description: s.description,
          server_api: s.serverApi,
          featured: s.featured || false,
          badge: s.badge || null
        }))
      ).then(() => {
        console.log("☁️ Serviços migrados sincronizados com o Supabase com sucesso!");
      }).catch(err => {
        console.warn("Aviso ao sincronizar serviços com Supabase:", err);
      });
    }

    return { importedCount, updatedCount, total: existingServices.length };
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.DHRU_API);
    localStorage.removeItem(STORAGE_KEYS.DHRU_CACHE);
  }
};
