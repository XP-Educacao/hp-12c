# HP-12C Web

Este projeto é um emulador da calculadora financeira HP-12C que roda direto no navegador.

## O que é

A ideia é reproduzir a aparência e o funcionamento básico da HP-12C usando apenas HTML, CSS e JavaScript. Ele permite usar a calculadora como se fosse a versão física, com botões clicáveis, suporte a toque e teclado.

## Como funciona

- A página principal é carregada pelo arquivo index.html.
- O estilo visual fica em css/hp1xc.css.
- As imagens da calculadora estão na pasta images/.
- A lógica da calculadora está em js/hp12c-min.js.
- O arquivo js/hp12c-web.js conecta a interface da página com a lógica interna.
- O arquivo js/display-scroll.js ajuda a animar o display e o comportamento visual.

## Como usar

1. Abra o arquivo index.html em um navegador.
2. Clique nos botões da calculadora.
3. Também é possível usar teclado para digitar números e operações.

## Estrutura do projeto

- index.html: estrutura da página
- css/: estilos da calculadora
- images/: imagens do visor, botões e fundo
- js/: scripts que fazem a emulação funcionar

## Observações

- O projeto é simples e funciona sem instalação de dependências.
- É ótimo para estudo, demonstração ou uso rápido no navegador.
- Não é a calculadora oficial da HP, mas uma emulação visual e funcional baseada no modelo HP-12C.


