# ResenhaBurger - Sistema Completo para Hamburgueria

## Passo a passo para implantação

### 1. Criar a Planilha Google
- Acesse [sheets.new](https://sheets.new) e crie uma planilha chamada **ResenhaBurger**.
- Crie as abas: `Config`, `Produtos`, `Pedidos`, `Clientes`.
- Na aba `Config`, preencha:
  - A1: senha_admin, B1: horario_inicio, C1: horario_fim, D1: dias_funcionamento
  - A2: 123456, B2: 18:30, C2: 23:00, D2: 0,4,5,6 (domingo, quinta, sexta, sábado)
- Na aba `Produtos`, crie os cabeçalhos: id, nome, preco, categoria, destaque, tag, economia, ingredientes
  - Preencha com seus produtos (use IDs numéricos)
- Na aba `Clientes`: telefone, nome, endereco, pontos, total_gasto, pedidos
- Na aba `Pedidos`: data, cliente_nome, cliente_telefone, cliente_endereco, itens, subtotal, desconto, total, status, preference_id, observacoes, entregador, hr_saida, hr_entrega

### 2. Configurar o Google Apps Script
- Abra a planilha, vá em **Extensões → Apps Script**
- Apague o código padrão e cole o conteúdo do arquivo `apps-script.js`
- Substitua `SEU_ACCESS_TOKEN` pelo token do Mercado Pago (modo teste ou produção)
- Substitua `SEU_ID` nas URLs de retorno e webhook pelo ID da sua implantação (ou use o domínio do seu site)
- Salve e clique em **Implantar → Nova implantação → Tipo: Aplicação Web**
  - Executar como: "Eu"
  - Quem tem acesso: "Qualquer pessoa"
  - Clique em **Implantar** e copie a URL gerada (ex: `https://script.google.com/macros/s/.../exec`)

### 3. Atualizar os arquivos do site
- Em todos os arquivos `.js` e `.html`, substitua `https://script.google.com/macros/s/SEU_ID/exec` pela URL copiada.
- Em `script.js`, substitua `MERCADO_PAGO_PUBLIC_KEY` pela sua chave pública do Mercado Pago.

### 4. Hospedar os arquivos
- Coloque todos os arquivos (html, css, js, png) em uma pasta.
- Você pode hospedar gratuitamente em:
  - **GitHub Pages**: crie um repositório, envie os arquivos, ative o Pages.
  - **Netlify**: arraste a pasta para o Netlify Drop.
  - **Vercel**: importe o projeto.
- Anote o endereço do seu site (ex: `https://meusite.netlify.app`).

### 5. Configurar retorno do Mercado Pago
- No código do Apps Script, em `criarPreferencia`, altere as URLs de retorno para:
  - `success: 'https://SEU-SITE/pagamento.html'`
  - `failure: 'https://SEU-SITE/pagamento.html'`
  - `pending: 'https://SEU-SITE/pagamento.html'`
- No webhook, use a URL do Apps Script.

### 6. Testar
- Acesse `https://SEU-SITE/index.html` e verifique se os produtos aparecem.
- Adicione itens ao carrinho, preencha os dados e finalize. Você será redirecionado ao Mercado Pago.
- Após o pagamento (use cartão de teste), o pedido deve aparecer na planilha e no painel da cozinha.

### 7. Acessar painéis
- **Admin**: `https://SEU-SITE/admin.html` (senha: 123456)
- **Cozinha**: `https://SEU-SITE/cozinha.html`
- **Entregadores**: `https://SEU-SITE/entregadores.html`

### 8. Personalizar
- Para alterar produtos, basta editar a planilha (aba Produtos).
- Para alterar preços, horários, etc., edite a aba Config.
- As imagens dos produtos podem ser adicionadas na planilha (coluna "imagem") e exibidas nos cards (ajuste o código se necessário).

## Observações importantes
- O sistema é 100% gratuito (depende apenas dos limites gratuitos do Google Sheets e Mercado Pago).
- Para produção, use tokens de produção do Mercado Pago e configure um domínio próprio.
- Mantenha a planilha organizada para evitar lentidão.
- Em caso de dúvidas, consulte a documentação do Google Apps Script e Mercado Pago.