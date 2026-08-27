# Electi Club — Landing Page

Site estático (HTML, CSS e JS puros, sem build/framework). Pronto pra subir no GitHub e fazer deploy no Vercel.

## Estrutura

```
.
├── index.html
├── quiz/
│   └── index.html          (página standalone do quiz, pré-checkout)
├── assets/
│   ├── css/styles.css
│   ├── css/quiz.css
│   ├── js/script.js
│   ├── js/quiz.js
│   └── img/
│       ├── logo-full.png
│       ├── logo-icon.png
│       └── proof/           (prints reais usados na LP)
└── README.md
```

## 1. Subir pro GitHub

Dentro desta pasta, no terminal:

```bash
git init
git add .
git commit -m "primeira versão da landing page"
```

Crie um repositório vazio no GitHub (sem README/gitignore) e conecte:

```bash
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/electi-club.git
git push -u origin main
```

## 2. Deploy no Vercel

1. Entre em [vercel.com](https://vercel.com) e faça login com sua conta GitHub.
2. Clique em **Add New → Project**.
3. Selecione o repositório `electi-club` que você acabou de criar.
4. Framework Preset: deixe em **Other** (é site estático, o Vercel serve os arquivos como estão, sem precisar de build command nem output directory).
5. Clique em **Deploy**. Em menos de um minuto o site estará no ar num link tipo `electi-club.vercel.app`.

Depois, em **Settings → Domains**, você pode apontar seu domínio próprio (ex: `electiclub.com.br`) se já tiver um registrado.

Qualquer novo `git push` na branch `main` já dispara um novo deploy automático.

## O que ajustar antes de publicar de verdade

- **Preço**: hoje está R$17,90/ano, no arquivo `index.html` e também em `quiz/index.html`, dentro da seção `<section class="pricing" id="preco">`. Ajuste os dois arquivos se mudar de novo.
- **Link de checkout**: já aponta pro checkout da Hubla (`id="checkoutLink"`), confirme se é o link certo antes de divulgar. Também presente nos dois arquivos.
- **Página do quiz (`/quiz`)**: página separada da LP, pensada como passo pré-checkout. Pede nome + 4 perguntas de perfil + campo aberto, gera um resultado personalizado e só então revela o preço. A LP principal (`index.html`) continua como está, com o quiz embutido nela também; as duas existem em paralelo por enquanto.

### Salvar as respostas do quiz numa planilha (Google Sheets)

As respostas (nome, nível, área, interesse, tempo disponível, comentário) já são coletadas em `assets/js/quiz.js`, mas só são enviadas se você configurar um webhook. Passo a passo:

1. Crie uma planilha nova no Google Sheets, com estas colunas na primeira linha: `data`, `nome`, `nivel`, `expertise`, `interesse`, `tempo`, `comentario`.
2. Na planilha, vá em **Extensões → Apps Script**.
3. Apague o código padrão e cole:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.data, data.nome, data.nivel, data.expertise, data.interesse, data.tempo, data.comentario]);
  return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
}
```

4. Clique em **Implantar → Nova implantação → Aplicativo da web**.
5. Em "Quem pode acessar", selecione **Qualquer pessoa**. Clique em **Implantar** e autorize o acesso.
6. Copie a URL do aplicativo da web gerada (termina em `/exec`).
7. Cole essa URL na variável `SHEET_WEBHOOK_URL` no topo de `assets/js/quiz.js` (e em `assets/js/script.js`, se quiser capturar as respostas do quiz embutido na LP também).
8. Suba a alteração pro GitHub, o Vercel republica sozinho.

Sem esse passo, o quiz funciona normalmente para quem responde, só que as respostas não ficam salvas em lugar nenhum.
