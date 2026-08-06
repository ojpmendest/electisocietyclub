# Electi Club — Landing Page

Site estático (HTML, CSS e JS puros, sem build/framework). Pronto pra subir no GitHub e fazer deploy no Vercel.

## Estrutura

```
.
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/script.js
│   └── img/
│       ├── logo-full.png
│       └── logo-icon.png
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

- **Preço**: hoje está R$17,90/mês, no arquivo `index.html`, dentro da seção `<section class="pricing" id="preco">`.
- **Link de checkout**: já aponta pro checkout da Hubla (`id="checkoutLink"`), confirme se é o link certo antes de divulgar.
- **Fonte de dados do quiz**: hoje as respostas do quiz não são salvas em lugar nenhum (só geram o texto de resultado na tela). Se quiser capturar essas respostas (nome, WhatsApp, respostas), me avise que a gente integra com alguma ferramenta (Google Sheets, planilha, CRM, etc.).
