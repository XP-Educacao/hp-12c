# HP-12C Financial Calculator

Emulador da calculadora financeira HP-12C rodando no navegador.

## Como hospedar no GitHub Pages

### 1. Crie um repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome sugerido: `hp12c` (o site ficará em `https://seu-usuario.github.io/hp12c`)
3. Deixe como **Public**
4. Clique em **Create repository**

### 2. Faça o upload dos arquivos

#### Opção A — Via interface web do GitHub (mais fácil)

1. Na página do repositório recém-criado, clique em **"uploading an existing file"**
2. Arraste **todos os arquivos e pastas** desta pasta para a área de upload
3. Clique em **Commit changes**

> **Estrutura esperada:**
> ```
> /
> ├── index.html
> ├── favicon.ico
> ├── css/
> │   └── hp1xc.css
> ├── images/
> │   └── hp12c.png
> └── js/
>     ├── jquery.js
>     ├── hp12c-min.js
>     └── hp12c-web.js
> ```

#### Opção B — Via Git (linha de comando)

```bash
cd hp12c
git init
git add .
git commit -m "HP-12C calculator"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/hp12c.git
git push -u origin main
```

### 3. Ative o GitHub Pages

1. No repositório, clique em **Settings**
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Em **Branch**, escolha `main` e pasta `/ (root)`
5. Clique em **Save**

Após alguns minutos, sua calculadora estará disponível em:
```
https://SEU-USUARIO.github.io/hp12c
```

## Uso

- Clique nos botões da calculadora com o mouse
- Funciona em telas touch (celular/tablet)
- Suporte a teclado físico (teclas numéricas e operadores)
