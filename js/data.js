// Tech Union Solutions - Base de Dados Inicial e Estrutura de Soluções
// Plataforma Nº1 em soluções para técnicos de smartphones

const TECH_UNION_DATA = {
  system: {
    name: "SuporteServerSmartBrasil-online",
    subtitle: "Feita de técnico para técnicos!",
    tagline: "A plataforma Nº1 em soluções para técnicos de smartphones.",
    version: "1.3.4",
    status: "Online",
    supportWhatsapp: "5511999999999",
    trialDaysDefault: 7
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
  ]
};

// Exportar globalmente
window.TECH_UNION_DATA = TECH_UNION_DATA;
