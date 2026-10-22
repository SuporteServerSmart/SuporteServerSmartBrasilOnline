// Tech Union Solutions - Base de Dados Inicial e Estrutura de Soluções
// Plataforma Nº1 em soluções para técnicos de smartphones

const TECH_UNION_DATA = {
  system: {
    name: "SuporteServerSmart-Brasil Online",
    subtitle: "Feita de técnico para técnicos!",
    tagline: "A plataforma Nº1 em soluções para técnicos de smartphones.",
    version: "1.3.5",
    status: "Online",
    supportWhatsapp: "5511999999999",
    trialDaysDefault: 7,
    mpAccessToken: "APP_USR-2750012879381679-051115-2dc1610e908f48d05dd63736d9473db7-615957613"
  },

  // Notícias e atualizações do Ticker superior
  tickerNews: [
    { id: 1, text: "A14 FALHA DE CARGA (15/07/2026)", brand: "SAMSUNG", date: "15/07/2026" },
    { id: 2, text: "ESQUEMAS ELÉTRICOS - TECNO CAMON 19 PRO ESQUEMA ELÉTRICO (14/07/2026)", brand: "TECNO", date: "14/07/2026" },
    { id: 3, text: "ESQUEMAS ELÉTRICOS - OPPO A17 ESQUEMA ELÉTRICO (14/07/2026)", brand: "OPPO", date: "14/07/2026" },
    { id: 4, text: "REDMI NOTE 12 - FALHA DE TOUCH APÓS ATUALIZAÇÃO HYPEROS", brand: "XIAOMI", date: "13/07/2026" },
    { id: 5, text: "MOTOROLA MOTO G53 - SEM SINAL DE REDE / SOLUÇÃO TRANSCEIVER", brand: "MOTOROLA", date: "12/07/2026" },
    { id: 6, text: "IPHONE 13 PRO MAX - TELA BRANCA / VERDE JUMPER FLEX CLK", brand: "APPLE", date: "10/07/2026" }
  ],

  // Menu Lateral Completo (Sidebar) com controle de exibição / desativação
  sidebarMenu: [
    // Seção Principal
    { id: "nav_dashboard", section: "Principal", label: "Dashboard", icon: "fa-solid fa-gauge-high", actionType: "dashboard", active: true },
    { id: "nav_official_store", section: "Principal", label: "Loja Oficial", icon: "fa-solid fa-store", actionType: "official_store", badge: "OFICIAL", active: true },
    { id: "nav_solutions", section: "Principal", label: "Soluções", icon: "fa-solid fa-layer-group", actionType: "brand", brandId: "samsung", brandName: "Samsung", active: true },
    { id: "nav_samsung", section: "Principal", label: "Samsung", icon: "fa-brands fa-android", actionType: "brand", brandId: "samsung", brandName: "Samsung", active: true },
    { id: "nav_apple", section: "Principal", label: "Apple", icon: "fa-brands fa-apple", actionType: "brand", brandId: "apple", brandName: "Apple", active: true },
    { id: "nav_motorola", section: "Principal", label: "Motorola", icon: "fa-solid fa-mobile-screen", actionType: "brand", brandId: "motorola", brandName: "Motorola", active: true },
    { id: "nav_xiaomi", section: "Principal", label: "Xiaomi", icon: "fa-solid fa-bolt", actionType: "brand", brandId: "xiaomi", brandName: "Xiaomi", active: true },
    { id: "nav_schematics", section: "Principal", label: "Esquemas Elétricos", icon: "fa-solid fa-diagram-project", actionType: "all_news", active: true },
    { id: "nav_other_brands", section: "Principal", label: "Outras Marcas", icon: "fa-solid fa-mobile-retro", actionType: "brand", brandId: "realme", brandName: "Outras Marcas", hasArrow: true, active: true },
    { id: "nav_categories", section: "Principal", label: "Categorias", icon: "fa-solid fa-tags", actionType: "dashboard", active: true },

    // Seção Ferramentas
    { id: "nav_mtk_tools", section: "Ferramentas", label: "MTK Tools", icon: "fa-solid fa-microchip", actionType: "tool_modal", toolCategory: "MTK Tools", badge: "NOVO", active: true },
    { id: "nav_qcom_edl", section: "Ferramentas", label: "Qcom EDL", icon: "fa-solid fa-bolt-lightning", actionType: "tool_modal", toolCategory: "Qcom EDL", badge: "NOVO", active: true },
    { id: "nav_frp_tools", section: "Ferramentas", label: "FRP Tools", icon: "fa-solid fa-unlock-keyhole", actionType: "tool_modal", toolCategory: "FRP Tools", active: true },
    { id: "nav_virus_cleaner", section: "Ferramentas", label: "Tira Vírus", icon: "fa-solid fa-shield-virus", actionType: "tool_modal", toolCategory: "Tira Vírus", active: true },
    { id: "nav_uart_monitor", section: "Ferramentas", label: "Monitor UART", icon: "fa-solid fa-terminal", actionType: "tool_modal", toolCategory: "Monitor UART", active: true },
    { id: "nav_screen_protector", section: "Ferramentas", label: "Películas", icon: "fa-solid fa-file-shield", actionType: "tool_modal", toolCategory: "Películas", badge: "NOVO", active: true },
    { id: "nav_tools", section: "Ferramentas", label: "Tools", icon: "fa-solid fa-screwdriver-wrench", actionType: "tool_modal", toolCategory: "Tools", active: true },
    { id: "nav_tools_generic", section: "Ferramentas", label: "Ferramentas", icon: "fa-solid fa-toolbox", actionType: "tool_modal", toolCategory: "Ferramentas", hasArrow: true, active: true },

    // Seção Sistema
    { id: "nav_port_link", section: "Sistema", label: "Port Link", icon: "fa-solid fa-network-wired", actionType: "port_link", badge: "NOVO", active: true },
    { id: "nav_frp_mtk_moto", section: "Sistema", label: "FRP MTK Motorola", icon: "fa-solid fa-mobile-screen-button", actionType: "frp_mtk_moto", badge: "NOVO", active: true },
    { id: "nav_os_manager", section: "Sistema", label: "OS Manager", icon: "fa-solid fa-desktop", actionType: "tool_modal", toolCategory: "OS Manager", badge: "NOVO", active: true },
    { id: "nav_server_gsm", section: "Sistema", label: "Server GSM", icon: "fa-solid fa-server", actionType: "tool_modal", toolCategory: "Server GSM", active: true },
    { id: "nav_sistema_os", section: "Sistema", label: "Sistema O.S.", icon: "fa-solid fa-clipboard-list", actionType: "tool_modal", toolCategory: "Sistema O.S.", active: true },
    { id: "nav_downloads", section: "Sistema", label: "Downloads", icon: "fa-solid fa-download", actionType: "tool_modal", toolCategory: "Downloads", active: true },
    { id: "nav_my_solutions", section: "Sistema", label: "Minhas Soluções", icon: "fa-solid fa-bookmark", actionType: "dashboard", active: true },
    { id: "nav_orders", section: "Sistema", label: "Meus Pedidos", icon: "fa-solid fa-box-open", actionType: "orders", isOrders: true, active: true }
  ],

  // 16 Categorias e Marcas Principais do Grid (como na foto)
  cards: [
    {
      id: "samsung",
      name: "SAMSUNG",
      description: "Soluções e estudos para dispositivos Samsung",
      badgeColor: "#0066ff",
      badgeBg: "#e0edff",
      icon: "fa-brands fa-android",
      count: 42,
      btnColor: "btn-blue"
    },
    {
      id: "apple",
      name: "APPLE",
      description: "Soluções e estudos para dispositivos Apple",
      badgeColor: "#111827",
      badgeBg: "#f3f4f6",
      icon: "fa-brands fa-apple",
      count: 38,
      btnColor: "btn-gray"
    },
    {
      id: "motorola",
      name: "MOTOROLA",
      description: "Soluções e estudos para dispositivos Motorola",
      badgeColor: "#e11d48",
      badgeBg: "#ffe4e6",
      icon: "fa-solid fa-mobile-screen-button",
      count: 29,
      btnColor: "btn-red"
    },
    {
      id: "xiaomi",
      name: "XIAOMI",
      description: "Soluções e estudos para dispositivos Xiaomi",
      badgeColor: "#ea580c",
      badgeBg: "#ffedd5",
      icon: "fa-solid fa-bolt",
      count: 35,
      btnColor: "btn-orange"
    },
    {
      id: "realme",
      name: "REALME",
      description: "Soluções e estudos para dispositivos Realme",
      badgeColor: "#ca8a04",
      badgeBg: "#fef9c3",
      icon: "fa-solid fa-bolt-lightning",
      count: 18,
      btnColor: "btn-yellow"
    },
    {
      id: "oppo",
      name: "OPPO",
      description: "Soluções e estudos para dispositivos Oppo",
      badgeColor: "#16a34a",
      badgeBg: "#dcfce7",
      icon: "fa-solid fa-circle-nodes",
      count: 22,
      btnColor: "btn-green"
    },
    {
      id: "vivo",
      name: "VIVO",
      description: "Soluções e estudos para dispositivos Vivo",
      badgeColor: "#2563eb",
      badgeBg: "#dbeafe",
      icon: "fa-solid fa-microchip",
      count: 16,
      btnColor: "btn-blue"
    },
    {
      id: "huawei",
      name: "HUAWEI",
      description: "Soluções e estudos para dispositivos Huawei",
      badgeColor: "#dc2626",
      badgeBg: "#fee2e2",
      icon: "fa-solid fa-fan",
      count: 14,
      btnColor: "btn-red"
    },
    {
      id: "infinix",
      name: "INFINIX",
      description: "Soluções e estudos para dispositivos Infinix",
      badgeColor: "#059669",
      badgeBg: "#d1fae5",
      icon: "fa-solid fa-square-plus",
      count: 15,
      btnColor: "btn-emerald"
    },
    {
      id: "tecno",
      name: "TECNO",
      description: "Soluções e estudos para dispositivos Tecno",
      badgeColor: "#0284c7",
      badgeBg: "#e0f2fe",
      icon: "fa-solid fa-satellite-dish",
      count: 19,
      btnColor: "btn-sky"
    },
    {
      id: "android-comandos",
      name: "ANDROID COMANDOS",
      description: "Comandos e atalhos para Android",
      badgeColor: "#10b981",
      badgeBg: "#ecfdf5",
      icon: "fa-solid fa-terminal",
      count: 25,
      btnColor: "btn-emerald"
    },
    {
      id: "software",
      name: "SOFTWARE",
      description: "Softwares, firmwares e ferramentas",
      badgeColor: "#10b981",
      badgeBg: "#d1fae5",
      icon: "fa-solid fa-laptop-code",
      count: 31,
      btnColor: "btn-green"
    },
    {
      id: "cpu",
      name: "CPU",
      description: "Informações e suporte de CPUs",
      badgeColor: "#475569",
      badgeBg: "#f1f5f9",
      icon: "fa-solid fa-microchip",
      count: 12,
      btnColor: "btn-gray"
    },
    {
      id: "estudo",
      name: "ESTUDO",
      description: "Estudos e materiais técnicos",
      badgeColor: "#3b82f6",
      badgeBg: "#eff6ff",
      icon: "fa-solid fa-graduation-cap",
      count: 20,
      btnColor: "btn-blue"
    },
    {
      id: "jumper-telas",
      name: "JUMPER DE TELAS",
      description: "Jumpers e correções de display",
      badgeColor: "#16a34a",
      badgeBg: "#dcfce7",
      icon: "fa-solid fa-bezier-curve",
      count: 27,
      btnColor: "btn-green"
    },
    {
      id: "emmc-ufs",
      name: "EMMC UFS",
      description: "Memórias eMMC e UFS",
      badgeColor: "#1e3a8a",
      badgeBg: "#dbeafe",
      icon: "fa-solid fa-memory",
      count: 17,
      btnColor: "btn-blue"
    }
  ],

  // Base detalhada de soluções por marca e categoria
  solutions: [
    {
      id: "sol-sam-01",
      brandId: "samsung",
      model: "Galaxy A14 (SM-A145F / SM-A146M)",
      title: "Falha de Carga - VBUS 5V em Curto / Não Carrega",
      category: "Carga & Alimentação",
      date: "15/07/2026",
      author: "Tech Union Team",
      difficulty: "Intermediário",
      symptoms: "Aparelho não reconhece cabo USB, esquenta próximo ao conector FPC da subplaca ou marca carregando falso em 0.00A.",
      guide: [
        "1. Inspecione a linha VBUS na subplaca com multímetro na escala de condução reversa (esperado 450mV - 550mV).",
        "2. Se marcar 000mV (curto ao terra), remova o diodo de proteção ESD TVS DZ501.",
        "3. Verifique o CI OVP (Over Voltage Protection) U5002 na placa principal. Se necessário, efetue o jumper de bypass entre entrada e saída do OVP.",
        "4. Realize a troca do conector Tipo-C e teste com carregador original Power Delivery."
      ],
      jumperTip: "Jumper direto entre o pino 1 do FPC de carga e o capacitor de entrada do CI IF-PMIC.",
      tags: ["Carga", "Jumper", "VBUS", "A14"]
    },
    {
      id: "sol-sam-02",
      brandId: "samsung",
      model: "Galaxy A23 / A23 5G",
      title: "Sem Imagem / Falha de Backlight após troca de tela",
      category: "Display & Imagem",
      date: "12/07/2026",
      author: "RamonCell",
      difficulty: "Avançado",
      symptoms: "Aparelho vibra, recebe chamadas, mas a tela permanece completamente preta ou sem iluminação de fundo.",
      guide: [
        "1. Desconecte a bateria imediatamente.",
        "2. Teste o diodo schottky D6001 da linha do conversor Boost de backlight.",
        "3. Teste a bobina indutora L6001 (10uH) - comum abrir por curto ao conectar tela com bateria plugada.",
        "4. Se persistir, substitua o CI Driver de Led U6001."
      ],
      jumperTip: "Reconstrução da trilha LED Anode (+) com fio esmaltado 0.02mm do diodo até o pino 3 do conector FPC.",
      tags: ["Backlight", "Display", "A23", "Sem Imagem"]
    },
    {
      id: "sol-app-01",
      brandId: "apple",
      model: "iPhone 13 Pro / 13 Pro Max",
      title: "Tela Branca ou Verde (White Screen of Death) - Solução por Jumper",
      category: "Display & Telas",
      date: "10/07/2026",
      author: "Master Tech Apple",
      difficulty: "Avançado",
      symptoms: "Após atualização ou choque mecânico, a tela fica totalmente branca ou verde sem imagem, com som ativo.",
      guide: [
        "1. A falha ocorre por rompimento interno da linha de clock ou dados de sincronismo no flex original da tela.",
        "2. Raspe cuidadosamente a linha de teste no flex da tela (ponto CLK ou VGH dependendo do lado).",
        "3. Faça um micro-jumper ligando o ponto da linha CLK ao ponto de alimentação 3.3V / 1.8V correspondente.",
        "4. Aplique máscara UV verde/azul e cure com luz ultravioleta por 60 segundos.",
        "5. Ligue o dispositivo e verifique se a taxa de 120Hz ProMotion volta a funcionar normalmente sem aquecimento."
      ],
      jumperTip: "Usar fio de cobre isolado 0.01mm e solda em pasta 183°C com ponta faca fina T12.",
      tags: ["iPhone", "Tela Verde", "Tela Branca", "Jumper", "13 Pro Max"]
    },
    {
      id: "sol-app-02",
      brandId: "apple",
      model: "iPhone 11 / 11 Pro",
      title: "Reiniciando de 3 em 3 Minutos (Panic Full / Sensor Térmico)",
      category: "Placa & PMIC",
      date: "08/07/2026",
      author: "RestoreCell",
      difficulty: "Intermediário",
      symptoms: "Aparelho desliga a cada 180 segundos com reinício automático (Kernel Panic em log i2c1).",
      guide: [
        "1. Conecte ao PC e extraia o arquivo Panic-Full através do 3uTools ou iTools.",
        "2. Busque no texto do relatório por: 'Missing sensor: Prs0' ou 'Mic1'.",
        "3. Prs0 indica sensor barométrico no flex do conector de carga dock.",
        "4. Mic1 indica microfone traseiro no flex power / flash.",
        "5. Substitua o flex correspondente de boa qualidade para eliminar o reset de 3 minutos."
      ],
      jumperTip: "Verifique o conector FPC J_DOCK por pinos amassados na linha I2C0_SDA e SCL.",
      tags: ["Panic Full", "iPhone 11", "Reiniciando", "Carga"]
    },
    {
      id: "sol-mot-01",
      brandId: "motorola",
      model: "Moto G53 5G / G73",
      title: "Sem Sinal de Operadora / Somente Chamadas de Emergência",
      category: "Rede & RF",
      date: "12/07/2026",
      author: "Bancada Central",
      difficulty: "Intermediário",
      symptoms: "Reconhece o chip SIM, exibe nome da operadora mas não sobe sinal de rede ou fica em busca constante.",
      guide: [
        "1. Digite *#*#4636#*#* e verifique se o 'Radio Móvel' está ativo.",
        "2. Verifique os cabos coaxiais de antena RF e os conectores U.FL.",
        "3. Meça a tensão de 1.8V e 1.2V no Transceiver WTR / SDR.",
        "4. Faça uma ressolda controlada a 340°C no CI Transceiver com fluxo Amtech NC-559."
      ],
      jumperTip: "Jumper no conector de teste de antena externa caso a mola interna esteja com mau contato.",
      tags: ["Motorola", "Rede", "Sem Sinal", "Moto G53"]
    },
    {
      id: "sol-xia-01",
      brandId: "xiaomi",
      model: "Redmi Note 12 / 12 Pro",
      title: "Falha de Touch Screen após atualizar para HyperOS",
      category: "Software & Display",
      date: "13/07/2026",
      author: "Xiaomi Expert",
      difficulty: "Fácil",
      symptoms: "Tela funciona imagem perfeitamente, mas o touch não responde ao toque em telas trocadas paralelas.",
      guide: [
        "1. O driver do HyperOS bloqueia controladores de touch IC genéricos (FT3518 / GT9886).",
        "2. Solução 1: Efetue o downgrade de firmware para MIUI 14 via Mi Flash em modo Fastboot com bootloader desbloqueado.",
        "3. Solução 2: Instale a tela com CI Touch original (Incell Premium com chip Novatek ou Synaptics).",
        "4. Solução 3: Aplicação de patch de calibração via OTG com mouse USB."
      ],
      jumperTip: "Utilizar mouse via adaptador OTG Type-C para backup antes do reparo.",
      tags: ["Xiaomi", "Touch", "HyperOS", "Redmi Note 12"]
    },
    {
      id: "sol-cmd-01",
      brandId: "android-comandos",
      model: "Universal Android",
      title: "Comandos Secretos de Teste de Hardware & Atalhos de Bancada",
      category: "Comandos & Atalhos",
      date: "14/07/2026",
      author: "Tech Union Labs",
      difficulty: "Fácil",
      symptoms: "Necessidade de testar telas, sensores, câmeras e áudio de forma ágil na bancada de atendimento.",
      guide: [
        "• Samsung Test Mode: *#0*# (Display, Touch, Sensores, Cores, Vibra)",
        "• Samsung Informações de Bateria e Rede: *#0228# e *#0011#",
        "• Xiaomi Menu CIT (Hardware Test): *#*#6484#*#* ou 5 cliques em Versão do Kernel",
        "• Motorola Menu CQA CQATest: *#*#2486#*#*",
        "• Informações de Teste de Antena Universal: *#*#4636#*#*",
        "• Visualizar IMEI Instantâneo: *#06#"
      ],
      jumperTip: "Atalho rápido para entrar em modo Fastboot: segurar Volume Menos + Power por 8 segundos.",
      tags: ["Comandos", "Atalhos", "CIT", "Samsung Teste"]
    },
    {
      id: "sol-soft-01",
      brandId: "software",
      model: "Drivers & Ferramentas Essenciais",
      title: "Pacote de Drivers de Bancada GSM 2026 (MTK, QCOM, SPD, Samsung)",
      category: "Downloads & Softwares",
      date: "15/07/2026",
      author: "Tech Union Software",
      difficulty: "Fácil",
      symptoms: "PC não reconhece aparelhos em modo BROM, EDL 9008, Download ou Fastboot no Gerenciador de Dispositivos.",
      guide: [
        "1. Baixe o pacote unificado de drivers com assinatura digital desativada.",
        "2. Instale o MediaTek MTK USB VCOM Driver com suporte a LibUSB filter.",
        "3. Instale o Qualcomm HS-USB QDLoader 9008 v2.1.2.2.",
        "4. Instale o Samsung USB Mobile Driver oficial v1.7.59.",
        "5. Instale o SPD Spreadtrum UniSoc Driver v1.4."
      ],
      jumperTip: "Reinicie o Windows segurando Shift e selecione 'Desativar imposição de assinatura de drivers'.",
      tags: ["Drivers", "MTK", "EDL 9008", "Samsung Driver"]
    }
  ],

  // Ferramentas da seção FERRAMENTAS do menu
  tools: [
    {
      id: "tool-mtk",
      name: "MTK Client GUI Pro",
      badge: "NOVO",
      category: "MTK Tools",
      version: "v5.4.1",
      description: "Bypass SLA/DAA, leitura e gravação de partições NVRAM, FRP bypass em modo BROM com 1 clique.",
      downloadUrl: "https://github.com/bkerler/mtkclient",
      icon: "fa-solid fa-microchip"
    },
    {
      id: "tool-qcom",
      name: "QCOM EDL Tool 9008 Master",
      badge: "NOVO",
      category: "Qcom EDL",
      version: "v2.8",
      description: "Flasheador Firehose universal para processadores Snapdragon, remoção de FRP e desbrick.",
      downloadUrl: "#",
      icon: "fa-solid fa-bolt"
    },
    {
      id: "tool-frp",
      name: "FRP Direct Unlocker 2026",
      badge: "POPULAR",
      category: "FRP Tools",
      version: "v3.1",
      description: "Ativação ADB via modo MTP e teste para Samsung, Motorola e Unisoc.",
      downloadUrl: "#",
      icon: "fa-solid fa-unlock-keyhole"
    },
    {
      id: "tool-uart",
      name: "Monitor Serial UART & Logs",
      badge: "",
      category: "Monitor UART",
      version: "v1.2",
      description: "Captura de logs de bootloader em tempo real via cabo UART RJ45 / TTL 1.8V.",
      downloadUrl: "#",
      icon: "fa-solid fa-terminal"
    }
  ],

  // Planos Oficiais do Port Link (Serviço de Acesso USB Remoto)
  portLinkPlans: [
    { id: "portlink_1h", name: "Aluguel de 1 Hora", duration: "1 Hora", price: 35.00, badge: "EXPRESS", popular: false, desc: "Acesso rápido e direto sem VPN para um reparo imediato." },
    { id: "portlink_24h", name: "Aluguel de 24 Horas", duration: "24 Horas", price: 45.00, badge: "DIÁRIO", popular: false, desc: "Acesso de 24h para múltiplos procedimentos no dia." },
    { id: "portlink_1m", name: "Plano de 1 Mês", duration: "30 Dias", price: 100.00, badge: "POPULAR", popular: true, desc: "Perfeito para assistência técnica com fluxo frequente." },
    { id: "portlink_3m", name: "Plano de 3 Meses", duration: "90 Dias", price: 200.00, badge: "TRIMESTRAL", popular: false, desc: "Economia e estabilidade por 3 meses contínuos." },
    { id: "portlink_6m", name: "Plano de 6 Meses", duration: "180 Dias", price: 150.00, badge: "SEMESTRAL", popular: false, desc: "Super promoção especial de 6 meses." },
    { id: "portlink_1y", name: "Plano de 1 Ano", duration: "365 Dias", price: 200.00, badge: "ANUAL VIP", popular: false, desc: "Acesso ilimitado de 1 ano completo com suporte prioritário." }
  ],

  // Lista Oficial de Dispositivos FRP MTK Motorola via Fastboot
  motorolaMtkModels: [
    // Dispositivos Moto Edge
    { id: "edge_xt2205_3", category: "edge", categoryLabel: "Moto Edge", code: "XT2205-3", name: "Moto Edge (2022)", chip: "MTK", mode: "FASTBOOT" },
    { id: "edge_xt2303_2", category: "edge", categoryLabel: "Moto Edge", code: "XT2303-2", name: "Moto Edge 40 (2023)", chip: "MTK", mode: "FASTBOOT" },
    { id: "edge_xt2307_1", category: "edge", categoryLabel: "Moto Edge", code: "XT2307-1", name: "Moto Edge 40 Neo 5G (2023)", chip: "MTK", mode: "FASTBOOT" },
    { id: "edge_xt2409_2", category: "edge", categoryLabel: "Moto Edge", code: "XT2409-2", name: "Moto Edge 50 Neo 5G (2024)", chip: "MTK", mode: "FASTBOOT" },
    { id: "edge_xt2519_1", category: "edge", categoryLabel: "Moto Edge", code: "XT2519-1", name: "Moto Edge (2025)", chip: "MTK", mode: "FASTBOOT" },
    { id: "edge_xt2505_3", category: "edge", categoryLabel: "Moto Edge", code: "XT2505-3", name: "Moto Edge 60", chip: "MTK", mode: "FASTBOOT" },
    { id: "edge_xt2503_1", category: "edge", categoryLabel: "Moto Edge", code: "XT2503-1", name: "Moto Edge 60 Fusion", chip: "MTK", mode: "FASTBOOT" },
    { id: "edge_xt2507_1", category: "edge", categoryLabel: "Moto Edge", code: "XT2507-1", name: "Moto Edge 60 Pro", chip: "MTK", mode: "FASTBOOT" },

    // Dispositivos Moto G
    { id: "g_xt2163_1", category: "g", categoryLabel: "Moto G", code: "XT2163-1", name: "Moto G Pure", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2613_1", category: "g", categoryLabel: "Moto G", code: "XT2613-1", name: "Moto G (2026)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2513_1", category: "g", categoryLabel: "Moto G", code: "XT2513-1", name: "Moto G 5G (2025)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2167_1", category: "g", categoryLabel: "Moto G", code: "XT2167-1", name: "Moto G41", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2625_5", category: "g", categoryLabel: "Moto G", code: "XT2625-5", name: "Moto G47 5G", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2149_1", category: "g", categoryLabel: "Moto G", code: "XT2149-1", name: "Moto G50 5G (2021)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2343_1", category: "g", categoryLabel: "Moto G", code: "XT2343-1", name: "Moto G54 5G", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2435_1", category: "g", categoryLabel: "Moto G", code: "XT2435-1", name: "Moto G55 5G (2024)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2529_1", category: "g", categoryLabel: "Moto G", code: "XT2529-1", name: "Moto G56 5G (2025)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2621_3_67", category: "g", categoryLabel: "Moto G", code: "XT2621-3", name: "Moto G67 (2026)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2621_3_77", category: "g", categoryLabel: "Moto G", code: "XT2621-3", name: "Moto G77 5G", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2527_2", category: "g", categoryLabel: "Moto G", code: "XT2527-2", name: "Moto G86 5G", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2527_1", category: "g", categoryLabel: "Moto G", code: "XT2527-1", name: "Moto G86 5G", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2527_6", category: "g", categoryLabel: "Moto G", code: "XT2527-6", name: "Moto G86 Power 5G", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2271_5", category: "g", categoryLabel: "Moto G", code: "XT2271-5", name: "Moto G Play (2023)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2615_1", category: "g", categoryLabel: "Moto G", code: "XT2615-1", name: "Moto G Play (2026)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2415_5", category: "g", categoryLabel: "Moto G", code: "XT2415-5", name: "Moto G Power 5G (2024)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2515_2", category: "g", categoryLabel: "Moto G", code: "XT2515-2", name: "Moto G Power (2025)", chip: "MTK", mode: "FASTBOOT" },
    { id: "g_xt2317dl", category: "g", categoryLabel: "Moto G", code: "XT2317DL", name: "Moto G Stylus (2023)", chip: "MTK", mode: "FASTBOOT" },

    // Dispositivos Moto Razr
    { id: "razr_xt2453_1_50", category: "razr", categoryLabel: "Moto Razr", code: "XT2453-1", name: "Moto Razr 50", chip: "MTK", mode: "FASTBOOT" },
    { id: "razr_xt2453_1_24", category: "razr", categoryLabel: "Moto Razr", code: "XT2453-1", name: "Moto Razr (2024)", chip: "MTK", mode: "FASTBOOT" },
    { id: "razr_xt2553_1_60", category: "razr", categoryLabel: "Moto Razr", code: "XT2553-1", name: "Moto Razr 60", chip: "MTK", mode: "FASTBOOT" },
    { id: "razr_xt2553_1_25", category: "razr", categoryLabel: "Moto Razr", code: "XT2553-1", name: "Moto Razr (2025)", chip: "MTK", mode: "FASTBOOT" }
  ],

  // ========================================================================
  // LOJA OFICIAL - CATÁLOGO DE PRODUTOS & SERVIÇOS EXCLUSIVOS (BASEFY)
  // ========================================================================
  officialStoreProducts: [
    // 1. Mais Populares
    {
      id: "prod_chatgpt_go",
      title: "🔥 CHAT GPT GO | 30 dias",
      category: "Mais Populares",
      categoryKey: "popular",
      price: 6.20,
      oldPrice: 17.00,
      badge: "MAIS VENDIDO",
      badgeColor: "#8b5cf6",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=80",
      description: "Acesso de 30 dias ao ChatGPT GO com resposta ultra rápida, navegação web integrada e análise de dados. Entrega automática e suporte prioritário.\n\n⚡ Entrega automática e imediata após o PIX\n🔒 Acesso 100% garantido por 30 dias\n📱 Compatível com Celular e PC\n💬 Suporte via WhatsApp direto com nosso time",
      stock: 112,
      salesCount: 176,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_claude_pro_sonnet",
      title: "Claude Pro 3.5 Sonnet Ilimitado",
      category: "Mais Populares",
      categoryKey: "popular",
      price: 14.90,
      oldPrice: 45.00,
      badge: "DESTAQUE",
      badgeColor: "#f97316",
      image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=500&auto=format&fit=crop&q=80",
      description: "Melhor inteligência artificial para programação, escrita e raciocínio lógico. Acesso completo por 30 dias com o modelo Claude 3.5 Sonnet de alta performance.\n\n⚡ Liberação imediata\n💻 Ideal para programadores e técnicos\n🔒 Suporte garantido",
      stock: 75,
      salesCount: 310,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_kling_ai_pro",
      title: "Kling AI Pro — Criação de Vídeos Hiper-realistas",
      category: "Mais Populares",
      categoryKey: "popular",
      price: 18.50,
      oldPrice: 55.00,
      badge: "TENDÊNCIA",
      badgeColor: "#eab308",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
      description: "Crie vídeos e animações com inteligência artificial de última geração. 1.000+ créditos inclusos para geração em alta definição.\n\n🎬 Qualidade 1080p sem marcas\n⚡ Envio rápido de credenciais\n🔒 Garantia total",
      stock: 50,
      salesCount: 180,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_canva_pro_vitalicio",
      title: "Canva Pro Vitalício Convite Equipe",
      category: "Mais Populares",
      categoryKey: "popular",
      price: 8.90,
      oldPrice: 35.00,
      badge: "VITALÍCIO",
      badgeColor: "#06b6d4",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
      description: "Acesso permanente ao Canva Pro com todas as ferramentas de design desbloqueadas, removedor de fundo e milhões de fotos e elementos.\n\n⚡ Ativação no seu próprio e-mail\n🔒 Sem mensalidades\n🎨 Modelos e fontes liberados",
      stock: 99,
      salesCount: 520,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_dolphin_anty_100",
      title: "Dolphin Anty 100 Perfis Multi-Login",
      category: "Mais Populares",
      categoryKey: "popular",
      price: 29.90,
      oldPrice: 79.00,
      badge: "ESSENCIAL",
      badgeColor: "#ec4899",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=80",
      description: "Navegador anti-detect líder para contingência, automação e gestão de contas múltiplas sem risco de cruzamento de dados ou banimentos.\n\n🔒 Fingerprint 100% camuflado\n⚡ Configuração simples em minutos\n🚀 Compatível com Proxies residenciais",
      stock: 40,
      salesCount: 220,
      rating: 4.9,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_bm_250_meta",
      title: "BM 250 Meta Verificada Pronta para Rodar",
      category: "Mais Populares",
      categoryKey: "popular",
      price: 49.90,
      oldPrice: 120.00,
      badge: "VERIFICADA",
      badgeColor: "#10b981",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80",
      description: "Business Manager Meta com limite de gasto diário elevado e documentação verificada. Ideal para campanhas que não podem parar.\n\n🛡️ Aquecida e pronta para anúncios\n⚡ Compartilhamento com 1 clique\n🔒 Suporte pós-venda",
      stock: 25,
      salesCount: 195,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },

    // 2. Inteligência Artificial (IA)
    {
      id: "prod_chatgpt_plus_30d",
      title: "ChatGPT Plus Oficial — Modelo GPT-4o 30 Dias",
      category: "Inteligência Artificial",
      categoryKey: "ai",
      price: 19.90,
      oldPrice: 59.00,
      badge: "OFICIAL",
      badgeColor: "#8b5cf6",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&auto=format&fit=crop&q=80",
      description: "Assinatura do ChatGPT Plus oficial com recursos avançados de voz, criação de GPTs personalizados, DALL-E 3 e análise avançada de arquivos.",
      stock: 65,
      salesCount: 410,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_midjourney_pro",
      title: "Midjourney v6.1 Pro — Modo Fast Ilimitado",
      category: "Inteligência Artificial",
      categoryKey: "ai",
      price: 24.90,
      oldPrice: 69.00,
      badge: "ARTE AI",
      badgeColor: "#ec4899",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
      description: "A melhor ferramenta para geração de artes, mockups, logos e fotos hiper-realistas pelo Discord com modo Stealth e geração rápida.",
      stock: 30,
      salesCount: 160,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_gemini_pro_18m",
      title: "Gemini AI Pro 18 Meses — 5TB Workspace",
      category: "Inteligência Artificial",
      categoryKey: "ai",
      price: 6.70,
      oldPrice: 18.00,
      badge: "PROMOÇÃO",
      badgeColor: "#3b82f6",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
      description: "Google Gemini Advanced com modelo 1.5 Pro de contexto gigante (1 Milhão de tokens). Acompanha 5TB de armazenamento no Google Drive.",
      stock: 84,
      salesCount: 292,
      rating: 4.9,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_elevenlabs_pro",
      title: "ElevenLabs Vozes Ultra Realistas (30 Dias)",
      category: "Inteligência Artificial",
      categoryKey: "ai",
      price: 16.90,
      oldPrice: 49.00,
      badge: "VOZ IA",
      badgeColor: "#10b981",
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=80",
      description: "Geração de voz neural clonada e dublagens perfeitas em português e 30+ idiomas para vídeos e anúncios.",
      stock: 40,
      salesCount: 135,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },

    // 3. Anti-Detect & Automação
    {
      id: "prod_adspower_vip",
      title: "AdsPower Anti-Detect Pro 100 Perfis",
      category: "Anti-Detect",
      categoryKey: "antidetect",
      price: 34.90,
      oldPrice: 99.00,
      badge: "ANTI-BAN",
      badgeColor: "#f59e0b",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80",
      description: "Automação RPA integrada, sincronizador de janelas e proteção completa de Canvas, WebGL, Áudio e Fonts.",
      stock: 35,
      salesCount: 190,
      rating: 4.9,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_gologin_multi",
      title: "GoLogin Cloud Multi-Profiles 30 Dias",
      category: "Anti-Detect",
      categoryKey: "antidetect",
      price: 39.90,
      oldPrice: 110.00,
      badge: "NUVEM",
      badgeColor: "#3b82f6",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80",
      description: "Perfis na nuvem que você pode compartilhar com sua equipe sem sincronizar cookies manualmente.",
      stock: 28,
      salesCount: 115,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_incogniton_stealth",
      title: "Incogniton Stealth Multi-Account Browser",
      category: "Anti-Detect",
      categoryKey: "antidetect",
      price: 27.90,
      oldPrice: 75.00,
      badge: "STEALTH",
      badgeColor: "#8b5cf6",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80",
      description: "Simulador de ambientes e emulação de navegadores reais para gerenciar contas de anúncios sem bloqueios.",
      stock: 45,
      salesCount: 88,
      rating: 4.8,
      seller: "SuporteServerSmart Oficial",
      active: true
    },

    // 4. Planos e Assinaturas
    {
      id: "prod_youtube_premium_6m",
      title: "YouTube Premium Família — 6 Meses Sem Anúncios",
      category: "Planos e Assinaturas",
      categoryKey: "plans",
      price: 14.90,
      oldPrice: 49.00,
      badge: "SEM ANÚNCIOS",
      badgeColor: "#ef4444",
      image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500&auto=format&fit=crop&q=80",
      description: "YouTube e YouTube Music sem propagandas, com download offline e reprodução em segundo plano no celular.",
      stock: 55,
      salesCount: 380,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_spotify_12m",
      title: "Spotify Premium 12 Meses na Sua Conta",
      category: "Planos e Assinaturas",
      categoryKey: "plans",
      price: 19.90,
      oldPrice: 59.00,
      badge: "1 ANO",
      badgeColor: "#10b981",
      image: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=500&auto=format&fit=crop&q=80",
      description: "Músicas em altíssima qualidade sem interrupções por 1 ano completo com garantia contra quedas.",
      stock: 70,
      salesCount: 440,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_netflix_4k",
      title: "Netflix 4K Ultra HD — Perfil Privado com PIN",
      category: "Planos e Assinaturas",
      categoryKey: "plans",
      price: 16.90,
      oldPrice: 45.00,
      badge: "4K UHD",
      badgeColor: "#dc2626",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80",
      description: "Tela privativa com senha PIN exclusiva. Assista a filmes e séries em qualidade 4K em qualquer aparelho.",
      stock: 45,
      salesCount: 290,
      rating: 4.9,
      seller: "SuporteServerSmart Oficial",
      active: true
    },

    // 5. Ativos e Contas
    {
      id: "prod_wa_aquecido_6m",
      title: "WhatsApp Aquecido 6+ Meses com Foto e Conversas",
      category: "Ativos e Contas",
      categoryKey: "assets",
      price: 19.90,
      oldPrice: 50.00,
      badge: "AQUECIDO",
      badgeColor: "#22c55e",
      image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=500&auto=format&fit=crop&q=80",
      description: "Número WhatsApp pronto para vendas e disparo inteligente sem tomar banimento imediato. Histórico real.",
      stock: 60,
      salesCount: 350,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_meta_bm_antiga",
      title: "Meta BM Antiga 2021-2023 Pronta para Conectar",
      category: "Ativos e Contas",
      categoryKey: "assets",
      price: 39.90,
      oldPrice: 90.00,
      badge: "HISTÓRICO",
      badgeColor: "#3b82f6",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80",
      description: "Conta Business Manager com idade e histórico, alta tolerância contra bloqueios e suporte especializado.",
      stock: 20,
      salesCount: 165,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_google_antiga_2018",
      title: "Conta Google Gmail Antiga (2018-2020)",
      category: "Ativos e Contas",
      categoryKey: "assets",
      price: 12.90,
      oldPrice: 35.00,
      badge: "GMAIL",
      badgeColor: "#f59e0b",
      image: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=500&auto=format&fit=crop&q=80",
      description: "E-mail Gmail com anos de criação, cookies prontos e ideal para criar contas em plataformas exigentes.",
      stock: 80,
      salesCount: 290,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },

    // 6. Proxy & Redes
    {
      id: "prod_proxy_4g_brasil",
      title: "Proxy Móvel 4G/5G Brasil IP Rotativo Ilimitado",
      category: "Proxy",
      categoryKey: "proxy",
      price: 29.90,
      oldPrice: 70.00,
      badge: "4G BRASIL",
      badgeColor: "#6366f1",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80",
      description: "IP real de operadoras brasileiras (Vivo/Claro/TIM). Rotatividade instantânea via link API.",
      stock: 45,
      salesCount: 210,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_proxy_residencial_30d",
      title: "Proxy Residencial Privado 30 Dias Sem Limite",
      category: "Proxy",
      categoryKey: "proxy",
      price: 39.90,
      oldPrice: 95.00,
      badge: "RESIDENCIAL",
      badgeColor: "#10b981",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80",
      description: "Endereço de IP residencial indetectável, excelente para contingência de anúncios e automações.",
      stock: 30,
      salesCount: 140,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },

    // 7. Contas Anúncios & BMs
    {
      id: "prod_fb_ads_restabelecido",
      title: "Perfil Facebook Restabelecido 3 Linhas",
      category: "Contas Anúncios",
      categoryKey: "ads",
      price: 34.90,
      oldPrice: 85.00,
      badge: "RESTABELECIDO",
      badgeColor: "#3b82f6",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=80",
      description: "Identidade confirmada com documento real, anúncio restabelecido e resistência máxima a bloqueios.",
      stock: 22,
      salesCount: 180,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_bm_ilimitada",
      title: "BM Ilimitada Verificada Empresa Meta",
      category: "Contas e BMs",
      categoryKey: "bms",
      price: 89.90,
      oldPrice: 210.00,
      badge: "SEM LIMITE",
      badgeColor: "#a855f7",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop&q=80",
      description: "Gaste o quanto quiser por dia sem travas de orçamento no Facebook e Instagram Ads.",
      stock: 12,
      salesCount: 95,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },

    // 8. Cursos & Treinamentos
    {
      id: "prod_curso_placas_2026",
      title: "Curso Completo Reparo de Placas Smartphones 2026",
      category: "Cursos",
      categoryKey: "courses",
      price: 47.00,
      oldPrice: 197.00,
      badge: "TREINAMENTO",
      badgeColor: "#eab308",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80",
      description: "Vídeo-aulas do básico ao avançado em análise de esquemas elétricos, solda SMD, reballing e osciloscópio.",
      stock: 999,
      salesCount: 650,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_curso_gsm_desbloqueio",
      title: "Curso Desbloqueio e Manutenção de Software GSM",
      category: "Cursos",
      categoryKey: "courses",
      price: 39.90,
      oldPrice: 150.00,
      badge: "GSM PRO",
      badgeColor: "#06b6d4",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=80",
      description: "Aprenda a operar ferramentas profissionais: UnlockTool, Chimera, Pandora, comandos Fastboot e EDL.",
      stock: 999,
      salesCount: 410,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },

    // 9. Ferramentas GSM & Softwares
    {
      id: "prod_frp_fastboot_moto",
      title: "FRP MTK Motorola Fastboot — Desbloqueio 1 Clique",
      category: "Ferramentas",
      categoryKey: "tools",
      price: 35.00,
      oldPrice: 70.00,
      badge: "SERVIÇO GSM",
      badgeColor: "#ef4444",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80",
      description: "Serviço de remoção de conta Google (FRP) para Motorola linha MediaTek em modo Fastboot via AnyDesk.",
      stock: 999,
      salesCount: 420,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    },
    {
      id: "prod_portlink_license",
      title: "Port Link USB Remoto — Licença Mensal Ilimitada",
      category: "Ferramentas",
      categoryKey: "tools",
      price: 49.90,
      oldPrice: 99.00,
      badge: "FERRAMENTA VIP",
      badgeColor: "#6366f1",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80",
      description: "Compartilhamento de portas USB e conexões remotas para técnicos e bancadas com baixíssima latência.",
      stock: 999,
      salesCount: 310,
      rating: 5.0,
      seller: "SuporteServerSmart Oficial",
      active: true
    }
  ],

  // Ranking Top 10 Vendedores Basefy
  officialStoreTopSellers: [
    { rank: 1, name: "SuporteServerSmart Oficial", badge: "OFICIAL", revenue: 48712.00, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
    { rank: 2, name: "Smart Cell Contingência", badge: "VERIFICADO", revenue: 24890.00, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80" },
    { rank: 3, name: "GSM Global Store", badge: "PRO", revenue: 18340.00, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
    { rank: 4, name: "Tech Solutions BR", badge: "PREMIUM", revenue: 14210.00, avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80" },
    { rank: 5, name: "Fast Unlock Pro", badge: "VERIFICADO", revenue: 11450.00, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
    { rank: 6, name: "BMs & Contas Brasil", badge: "PRO", revenue: 9870.00, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
    { rank: 7, name: "Proxy & IA Express", badge: "VERIFICADO", revenue: 8430.00, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" }
  ],

  // Usuários com Acesso à Loja Oficial (gerenciados pelo Admin)
  officialStoreUsers: [
    {
      id: "store_user_demo",
      username: "tecnico_vip",
      password: "123",
      whatsapp: "(41) 99637-8029",
      createdAt: "2026-10-20T10:00:00.000Z",
      status: "ativo", // "ativo" | "bloqueado"
      createdBy: "admin"
    }
  ],

  // Pedidos Efetuados na Loja Oficial
  officialStoreOrders: []
};

// Exportar globalmente
window.TECH_UNION_DATA = TECH_UNION_DATA;

