# Suporte Server Smart Brasil Online 🚀

> **Plataforma Web & Servidor GSM de Alta Performance** inspirada nos ecossistemas **GSMThemer** e **Dhru Fusion**, com loja pública para técnicos e lojistas, rastreamento de ordens por IMEI/ID e Painel Administrativo completo para gestão de pedidos, serviços, revendedores e chaves PIX.

---

## ⚡ Principais Funcionalidades

### 🌐 Loja Pública (Storefront)
- **Catálogo Dinâmico de Serviços GSM**:
  - **Ferramentas Digitais & Dongles**: UnlockTool (3, 6, 12 Meses), Chimera Tool (Samsung e All Modules), Pandora Box, Octoplus FRP Tool.
  - **Serviços de IMEI & FRP**: Reset FRP Samsung Instantâneo (2024/2026), Apple GSX Check iCloud & Operadora, Xiaomi Mi Cloud Clean.
  - **Créditos de Servidor**: Xiaomi Global Auth EDL 9008 Flash Credits.
  - **Atendimento Remoto**: Suporte técnico via AnyDesk / TeamViewer.
- **Rastreamento de Pedido em Tempo Real**:
  - Busca instantânea por protocolo de ordem (ex: `SSB-98421`) ou por IMEI / Usuário.
  - Linha do tempo visual: Pendente ➔ Em Processamento ➔ Concluído / Rejeitado.
  - Exibição de códigos de licença, tokens e notas do servidor.
- **Checkout Inteligente com PIX Dinâmico**:
  - Geração automática de QR Code PIX e chave Copia e Cola.
  - Notificação direta e envio de comprovante com mensagem pronta para o WhatsApp do suporte.
- **Monitoramento de Servidores & APIs**:
  - Status em tempo real dos clusters UnlockTool, Chimera, Xiaomi EDL, Samsung Knox e Apple GSX.

---

### 🛡️ Painel Administrativo (Admin Panel)
- **Acesso Seguro via PIN**: Protegido por chave configurável (Padrão: `admin123`).
- **Dashboard Financeiro & Métricas**:
  - Receita Total (R$), Total de Pedidos, Ordens Pendentes e Saldo de Revendedores.
  - Terminal de Logs em tempo real com eventos do servidor e conexões de API.
- **Gerenciamento de Pedidos (Orders)**:
  - Aprovação, inserção de tokens/códigos de resposta da API e rejeição com motivo.
- **Gestão de Serviços & Preços (CRUD)**:
  - Criação, edição de preços de venda, custos e margem de lucro estimada.
- **Revendedores & Clientes VIP**:
  - Controle de contas, limites de desconto e injeção de saldo/créditos em conta pré-paga.
- **Configurações Globais**:
  - Chave PIX, nome do titular, WhatsApp de atendimento, cotação do Dólar (USD) e carteira USDT.

---

## 🔐 Acesso Administrativo
- **URL**: [admin.html](admin.html)
- **Senha Inicial Padrão**: `admin123`

---

## 🚀 Deploy Automático na Vercel
Este repositório está pronto para a **Vercel**:
1. Cada `git push` na branch `main` dispara automaticamente um novo build e deploy instantâneo na Vercel.
2. Arquivo `vercel.json` configurado com URLs limpas e cabeçalhos de segurança.