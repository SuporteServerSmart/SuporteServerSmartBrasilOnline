// Suporte Server Smart Brasil Online - Supabase Cloud Database Adapter
// Arquitetura Híbrida: Conexão em tempo real com Supabase com Fallback transparente

const SUPABASE_STORAGE_CONFIG = 'sss_supabase_config_v1';

// SQL Schema de criação para o usuário colar no SQL Editor do Supabase com 1 clique
const SUPABASE_SQL_SCHEMA = `-- 1. TABELA DE SERVIÇOS GSM
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT,
  price_brl NUMERIC NOT NULL,
  price_usd NUMERIC,
  cost_brl NUMERIC,
  delivery_time TEXT,
  status TEXT DEFAULT 'active',
  type TEXT DEFAULT 'username',
  input_label TEXT,
  input_placeholder TEXT,
  description TEXT,
  server_api TEXT,
  badge TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA DE PEDIDOS & ORDENS IMEI
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  service_id TEXT,
  service_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_contact TEXT,
  data_input TEXT NOT NULL,
  price_brl NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'PIX',
  status TEXT DEFAULT 'pending',
  server_notes TEXT,
  result_code TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE CLIENTES & REVENDEDORES
CREATE TABLE IF NOT EXISTS resellers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Cliente Técnico',
  balance_brl NUMERIC DEFAULT 0,
  orders_count INT DEFAULT 0,
  discount_percent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS) aberta para leitura/inserção do portal
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso publico para leitura de servicos" ON services FOR SELECT USING (true);
CREATE POLICY "Acesso publico para leitura e criacao de ordens" ON orders FOR ALL USING (true);
CREATE POLICY "Acesso publico para revendedores" ON resellers FOR ALL USING (true);
`;

window.SSB_Supabase = {
  client: null,
  isConfigured: false,

  getConfig() {
    try {
      const stored = localStorage.getItem(SUPABASE_STORAGE_CONFIG);
      return stored ? JSON.parse(stored) : { url: '', key: '', enabled: false };
    } catch (e) {
      return { url: '', key: '', enabled: false };
    }
  },

  saveConfig(url, key, enabled = true) {
    localStorage.setItem(SUPABASE_STORAGE_CONFIG, JSON.stringify({ url, key, enabled }));
    this.init();
  },

  getSqlSchema() {
    return SUPABASE_SQL_SCHEMA;
  },

  init() {
    const config = this.getConfig();
    if (config.enabled && config.url && config.key && window.supabase) {
      try {
        this.client = window.supabase.createClient(config.url, config.key);
        this.isConfigured = true;
        console.log("⚡ Supabase Cloud Database conectado com sucesso!");
        return true;
      } catch (err) {
        console.warn("⚠️ Falha ao inicializar cliente Supabase, operando em modo local:", err);
        this.client = null;
        this.isConfigured = false;
        return false;
      }
    }
    this.client = null;
    this.isConfigured = false;
    return false;
  },

  // Sincronizar criação de pedido no Supabase
  async createOrder(orderData) {
    if (!this.client || !this.isConfigured) return null;

    try {
      const { data, error } = await this.client
        .from('orders')
        .insert([{
          order_id: orderData.orderId,
          service_id: orderData.serviceId,
          service_name: orderData.serviceName,
          customer_name: orderData.customerName,
          customer_contact: orderData.customerContact,
          data_input: orderData.dataInput,
          price_brl: orderData.priceBRL,
          payment_method: orderData.paymentMethod || 'PIX Instantâneo',
          status: orderData.status || 'pending',
          server_notes: orderData.serverNotes || 'Aguardando confirmação de pagamento...',
          result_code: orderData.resultCode || 'WAITING_PAYMENT',
          date: orderData.date || new Date().toLocaleString('pt-BR')
        }])
        .select()
        .single();

      if (error) {
        console.warn("Supabase insert order error:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("Erro ao enviar pedido para o Supabase:", e);
      return null;
    }
  },

  // Buscar pedidos na nuvem
  async fetchOrders() {
    if (!this.client || !this.isConfigured) return null;

    try {
      const { data, error } = await this.client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map(item => ({
        orderId: item.order_id,
        serviceId: item.service_id,
        serviceName: item.service_name,
        customerName: item.customer_name,
        customerContact: item.customer_contact,
        dataInput: item.data_input,
        priceBRL: parseFloat(item.price_brl),
        paymentMethod: item.payment_method,
        status: item.status,
        serverNotes: item.server_notes,
        resultCode: item.result_code,
        date: item.date || new Date(item.created_at).toLocaleString('pt-BR')
      }));
    } catch (e) {
      console.warn("Erro ao buscar ordens no Supabase:", e);
      return null;
    }
  },

  // Atualizar status no Supabase
  async updateOrderStatus(orderId, status, serverNotes, resultCode) {
    if (!this.client || !this.isConfigured) return null;

    try {
      const payload = { status };
      if (serverNotes) payload.server_notes = serverNotes;
      if (resultCode) payload.result_code = resultCode;

      const { data, error } = await this.client
        .from('orders')
        .update(payload)
        .eq('order_id', orderId)
        .select();

      if (error) {
        console.warn("Supabase update error:", error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn("Erro ao atualizar ordem no Supabase:", e);
      return null;
    }
  },

  // Testar Conexão
  async testConnection() {
    if (!this.client) return { success: false, message: "Cliente Supabase não configurado." };
    try {
      const { error } = await this.client.from('orders').select('order_id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: `Conexão falhou: ${error.message}` };
      }
      return { success: true, message: "Conectado ao Supabase com sucesso!" };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
};

// Inicialização segura automática
document.addEventListener('DOMContentLoaded', () => {
  window.SSB_Supabase.init();
});
