# Exemplos Práticos - Como Modificar o Display

## 1. Exemplo: Exibir Um Número Simples

```javascript
// Objetivo: Exibir "123" no display

// Abordagem 1: Chamar new_content() diretamente
H.display.new_content(["123", ""], false);

// Internamente faz:
// 1. contents_logical = ["123", ""]
// 2. physical_lcd_display(["123", ""])
// 3. Para cada caractere em "123":
//    - '1' → buffer[0] = 36 (LCD_C | LCD_F)
//    - '2' → buffer[1] = 105 (LCD_A | LCD_C | LCD_D | LCD_E | LCD_G)
//    - '3' → buffer[2] = 109 (LCD_A | LCD_C | LCD_D | LCD_F | LCD_G)
// 4. Atualiza visibility de cada segmento
```

---

## 2. Exemplo: Adicionar Ponto Decimal

```javascript
// Objetivo: Exibir "12.34"

H.display.new_content(["12.34", ""], false);

// Processamento interno (physical_lcd_display):
for (var e = 0; e < "12.34".length && f < 11; ++e) {
    var merge = false;
    var val = "12.34".charAt(e);
    ++f;
    
    if ((val == '.' || val == ',') && f > 0) {
        --f;  // Volta ao dígito anterior
        merge = true;
    }
    
    var map = self.lcdmap[val];  // Busca bitmask
    buffer[f] = map | (merge ? buffer[f] : 0);  // Combina com dígito anterior
}

// Resultado:
// buffer[0] = lcdmap['1'] | lcdmap['.'] = 36 | 128 = 164
// buffer[1] = lcdmap['2'] = 105
// buffer[2] = lcdmap['3'] = 109
// buffer[3] = lcdmap['4'] = 54
```

---

## 3. Exemplo: Adicionar Separador de Milhar

```javascript
// Objetivo: Exibir "1,234.56" (com vírgula de milhar)

H.display.new_content(["1,234.56", ""], false);

// Processamento:
// '1' + ',' → buffer[0] = lcdmap['1'] | lcdmap[','] = 36 | 384 = 420
// '2' → buffer[1] = 105
// '3' → buffer[2] = 109
// '4' + '.' → buffer[3] = lcdmap['4'] | lcdmap['.'] = 54 | 128 = 182
// '5' → buffer[4] = 109
// '6' → buffer[5] = 195

// Visualização:
// [1,] [2] [3] [4.] [5] [6]
```

---

## 4. Exemplo: Com Efeito de Flicker

```javascript
// Objetivo: Exibir com piscar (como quando tecla é pressionada)

H.display.new_content(["999", ""], true);  // ← true ativa flicker

// Timeline:
// T=0ms:   physical_lcd_display(["", ""])         // Limpa
//          H.machine.cli("flicker")                 // Bloqueia teclado
//
// T=25ms:  H.machine.sti("flicker")                // Desbloqueia teclado
//          physical_lcd_display(["999", ""])       // Reexibe

// Resultado visual: Display pisca por ~25ms
```

---

## 5. Exemplo: Com Blink em Overflow

```javascript
// Objetivo: Número está em overflow, piscar continuamente

H.display.set_blink(true);      // Ativa blink
H.display.new_content(["1E+100", ""], false);

// O display agora alterna a cada 250ms:
// T=0ms:   exibe "1E+100"
// T=250ms: limpa display ["", ""]
// T=500ms: exibe "1E+100"
// T=750ms: limpa display
// ... continua alternando

// Para parar:
H.display.set_blink(false);
```

---

## 6. Exemplo: Manipular Diretamente um Dígito

```javascript
// Objetivo: Mudar apenas um dígito sem alterar o resto

// Cenário: Display mostra "123", queremos mudar para "129"

// Forma ERRADA (ineficiente, mas funciona):
H.display.new_content(["129", ""], false);

// Forma CORRETA (manipula diretamente):
var new_digit = "9";
var position = 2;  // Terceiro dígito

// Obter mapa de segmentos
var map = H.display.lcdmap[new_digit];

// Atualizar cada segmento
for (var segm = 1; segm < 10; ++segm) {
    var bit = 1 << (segm - 1);
    var visibility = (map & bit) ? "visible" : "hidden";
    H.display.lcd[position][segm].style.visibility = visibility;
}
```

---

## 7. Exemplo: Adicionar Novo Caractere ao Mapa

```javascript
// Objetivo: Adicionar suporte para caractere "#"
// (simulando um bloco preenchido)

// Localizar: physical_lcd_display(), seção de inicialização de lcdmap

// ANTES:
self.lcdmap['8'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_E | LCD_F | LCD_G;
self.lcdmap[':'] = LCD_P;

// DEPOIS:
self.lcdmap['8'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_E | LCD_F | LCD_G;
self.lcdmap['#'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_E | LCD_F | LCD_G | LCD_P | LCD_T;  // Todos os segmentos
self.lcdmap[':'] = LCD_P;

// Agora pode usar:
H.display.new_content(["1#234", ""], false);
// Resultado: "1" + BLOCO CHEIO + "234"
```

---

## 8. Estrutura Interna: Array self.lcd

```javascript
// Após inicialização, self.lcd é estruturado assim:

self.lcd[0] = [
    0,                                    // [0] - não usado
    <img#lcd0a>,                         // [1] - segmento A
    <img#lcd0b>,                         // [2] - segmento B
    <img#lcd0c>,                         // [3] - segmento C
    <img#lcd0d>,                         // [4] - segmento D
    <img#lcd0e>,                         // [5] - segmento E
    <img#lcd0f>,                         // [6] - segmento F
    <img#lcd0g>,                         // [7] - segmento G
    <img#lcd0p>,                         // [8] - point (.)
    <img#lcd0t>                          // [9] - thousands (,)
];

self.lcd[1] = [0, <img#lcd1a>, <img#lcd1b>, ...];
...
self.lcd[10] = [0, <img#lcd10a>, <img#lcd10b>, ...];

// Acessar: self.lcd[digit_index][segment_index]
// Exemplo: self.lcd[3][5] = <img#lcd3e> (segmento E do dígito 3)
```

---

## 9. Exemplo: Debug - Ver Conteúdo Atual

```javascript
// Objetivo: Verificar qual é o conteúdo mostrado no display

// Conteúdo lógico desejado:
console.log("Lógico:", H.display.contents_logical);
// Output: Lógico: ["123", ""]

// Conteúdo físico renderizado:
console.log("Físico:", H.display.contents_physical);
// Output: Físico: "123"

// Verificar se está em blink:
console.log("Overflow blink:", H.display.overflow_blink);
// Output: Overflow blink: false

// Verificar conteúdo do modificador:
console.log("Modificador:", H.display.contents_modifier_logical);
// Output: Modificador: ""
```

---

## 10. Exemplo: Renderização Manual de Buffer

```javascript
// Objetivo: Entender exatamente como o buffer é construído

var string = "42";
var buffer = [];
var f = -1;

// Loop de processamento
for (var e = 0; e < string.length && f < 11; ++e) {
    var merge = false;
    var val = string.charAt(e);
    ++f;
    
    if ((val == '.' || val == ',') && f > 0) {
        --f;
        merge = true;
    }
    
    if (!H.display.lcdmap[val]) {
        val = ' ';
    }
    
    var map = H.display.lcdmap[val];
    buffer[f] = map | (merge ? buffer[f] : 0);
    
    console.log(`e=${e}, f=${f}, char='${val}', map=${map}, buffer[${f}]=${buffer[f]}`);
}

// Output para "42":
// e=0, f=0, char='4', map=54, buffer[0]=54
// e=1, f=1, char='2', map=105, buffer[1]=105

// Depois completar com zeros os dígitos não usados:
for (++f; f < 11; ++f) {
    buffer[f] = 0;
}

// buffer = [54, 105, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

---

## 11. Exemplo: Tabela de Bitmaps de Todos os Dígitos

```javascript
console.table({
    '0': H.display.lcdmap['0'],  // 63  (0111111)
    '1': H.display.lcdmap['1'],  // 6   (0000110)
    '2': H.display.lcdmap['2'],  // 91  (1011011)
    '3': H.display.lcdmap['3'],  // 79  (1001111)
    '4': H.display.lcdmap['4'],  // 102 (1100110)
    '5': H.display.lcdmap['5'],  // 109 (1101101)
    '6': H.display.lcdmap['6'],  // 125 (1111101)
    '7': H.display.lcdmap['7'],  // 7   (0000111)
    '8': H.display.lcdmap['8'],  // 127 (1111111)
    '9': H.display.lcdmap['9'],  // 103 (1100111)
    ' ': H.display.lcdmap[' '],  // 0   (0000000)
    '.': H.display.lcdmap['.'],  // 128 (10000000)
    ',': H.display.lcdmap[',']   // 384 (110000000)
});
```

---

## 12. Exemplo: Timeline de Execução Completa

```javascript
// Usuário pressiona "5" na calculadora

// T=0ms:
// Event: onkeypress
// ↓
// hard_keyboard("5")
// ↓
// dispatch_key(14)  // Código da tecla 5
// ↓
// H.dispatcher.dispatch(14)
// ↓
// [Máquina calcula resultado]
// ↓

// T=5ms:
// H.machine retorna string "5"
// ↓
// new_content(["5", ""], true)  // true = com flicker

// T=6ms:
// physical_lcd_display(["", ""])  // Limpa
// H.machine.cli("flicker")         // Bloqueia teclado

// T=31ms (6 + 25ms):
// H.machine.sti("flicker")         // Desbloqueia
// physical_lcd_display(["5", ""])

// T=32ms:
// Loop de renderização:
//   buffer[0] = lcdmap['5'] = 109
//   buffer[1-10] = 0
//   Para dígito 0:
//     Para segmento 1-9:
//       Atualizar self.lcd[0][segm].style.visibility

// T=33ms:
// Browser renderiza:
// - lcd0a: hidden
// - lcd0b: visible  (segmento superior esquerdo)
// - lcd0c: visible  (segmento superior direito)
// - lcd0d: visible  (segmento meio)
// - lcd0e: hidden
// - lcd0f: visible  (segmento inferior direito)
// - lcd0g: visible  (segmento inferior)
// - lcd0p: hidden
// - lcd0t: hidden

// Resultado visual: "5" aparece no display
```

---

## 13. Teste Prático no Console

```javascript
// Teste 1: Exibir "Hello"
H.display.new_content(["HEllo", ""], false);

// Teste 2: Exibir com flicker
H.display.new_content(["ERROR", ""], true);

// Teste 3: Ativar blink (overflow)
H.display.set_blink(true);
H.display.new_content(["9.99E99", ""], false);

// Teste 4: Parar blink
H.display.set_blink(false);
H.display.recycle();

// Teste 5: Limpar display
H.display.new_content(["", ""], false);

// Teste 6: Verificar mapa de um caractere
console.log("Mapa de '8':", H.display.lcdmap['8']);  // 127 (todos segmentos)
console.log("Mapa de ' ':", H.display.lcdmap[' ']);  // 0 (nenhum segmento)
```

---

## Resumo das Localizações no Código

| O que fazer | Função | Localização |
|-------------|--------|-------------|
| Exibir conteúdo | `new_content()` | [L1604](hp12c-min.js#L1604) |
| Renderizar no LCD | `physical_lcd_display()` | [L1420](hp12c-min.js#L1420) |
| Modificar mapa | `self.lcdmap` | [L1334](hp12c-min.js#L1334) |
| Acessar elemento LCD | `self.lcd[f][segm]` | [L1387](hp12c-min.js#L1387) |
| Ativar blink | `set_blink()` | [L1488](hp12c-min.js#L1488) |
| Processar tecla | `do_dispatch_key()` | [L2226](hp12c-min.js#L2226) |

