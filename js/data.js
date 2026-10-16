// Suporte Server Smart Brasil Online - Data Store & Local Management (GSM Server Engine)
const STORAGE_KEYS = {
  SERVICES: 'sss_services_v1',
  ORDERS: 'sss_orders_v1',
  SETTINGS: 'sss_settings_v1',
  USERS: 'sss_users_v1',
  LOGS: 'sss_logs_v1'
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
  apiStatus: "conectado"
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
      return stored ? JSON.parse(stored) : DEFAULT_USERS;
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

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  }
};
