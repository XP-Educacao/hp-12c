# Mapa de Código - Localizações Exatas no HP-12C

## Localização Rápida de Funções Críticas

```
┌─ hp12c-min.js ─────────────────────────────────────────────┐
│                                                              │
│ L0001-L0027   | Cabeçalho e comments                        │
│               |                                              │
│ L0030-L0300   | Definições gerais e constantes               │
│               |                                              │
│ L1300-L1310   | Classe Hp12c_display {                      │
│              |   constructor                                │
│              |                                              │
│ L1311         | self.lcd = []  ← Inicializa array LCD      │
│ L1313         | self.contents_logical = ["", ""]            │
│ L1314         | self.contents_physical = "replaceme"        │
│ L1318         | self.flicker_delay = 25                     │
│ L1320         | self.overflow_blink_freq = 250              │
│               |                                              │
│ L1334-L1341   | Definição de bits (LCD_A...LCD_T)          │
│               |   LCD_A = 1   (segmento a)                 │
│               |   LCD_B = 2   (segmento b)                 │
│               |   ...                                       │
│               |   LCD_T = 256 (thousands separator)         │
│               |                                              │
│ L1344         | self.lcdmap = {}  ← Mapa de caracteres    │
│ L1346         | self.lcdmap['0'] = LCD_A | LCD_B | ...    │
│ L1347         | self.lcdmap['1'] = LCD_C | LCD_F           │
│ L1348-L1384   | Mapeamento de 0-9, ., ,, letras, etc      │
│               |                                              │
│ L1387         | for (var e = 0; e <= 10; ++e) {             │
│ L1388         |   self.lcd[e] = []                          │
│ L1389-L1397   |   Carrega referências dos 9 segmentos      │
│               |   self.lcd[e][...] = H.getElem("lcd"...)   │
│               | }                                            │
│               |                                              │
│ L1420         | physical_lcd_display(contents) { ⭐ MAIN   │
│ L1423         |   var txt = contents[0]                     │
│ L1427         |   if (self.contents_physical === txt)       │
│ L1428         |     return;  ← Otimização: já renderizado?  │
│ L1431         |   self.contents_physical = txt              │
│ L1442         |   for (var e = 0; e < txt.length...) {     │
│ L1443         |     var val = txt.charAt(e)                 │
│ L1460         |     var map = self.lcdmap[val]              │
│ L1463         |     buffer[f] = map | (merge ? ...)         │
│               |   }                                          │
│ L1467         |   for (++f; f < self.lcd.length...)         │
│ L1468         |     buffer[f] = 0  ← Limpa restante         │
│               |                                              │
│ L1472-L1481   | Loop crítico: renderização                  │
│ L1476         |   for (f = 0; f < buffer.length; ++f) {    │
│ L1477         |     var map2 = buffer[f]                    │
│ L1478         |     for (segm = 1; segm < 10; ++segm) {    │
│ L1479         |       var bit = 1 << (segm - 1)             │
│ L1480         |       var visibility = (map2 & bit) ?       │
│ L1481         |         "visible" : "hidden"                │
│ L1481         |       self.lcd[f][segm].style              │
│ L1481         |         .visibility = visibility  ← AQUI!   │
│               |     }                                        │
│               |   }                                          │
│               | }                                            │
│               |                                              │
│ L1488         | set_blink(blinks) {                        │
│ L1492         |   self.overflow_blink = blinks              │
│ L1492         |   self.recycle()                            │
│               | }                                            │
│               |                                              │
│ L1499         | clear() {                                  │
│ L1499         |   self.new_content(["", ""], false)         │
│               | }                                            │
│               |                                              │
│ L1507         | show(string) {                             │
│ L1507         |   self.new_content([string, ""], false)     │
│               | }                                            │
│               |                                              │
│ L1604         | new_content(content, to_flicker) { ⭐ ENTRY│
│ L1608         |   self.contents_logical = content           │
│ L1610         |   will_flicker = to_flicker && H.machine    │
│               |                                              │
│ L1625-L1650   |   Manipulação de modal/overflow/blink       │
│               |                                              │
│ L1655         |   var f = function () {                     │
│ L1656-L1671   |     if (self.overflow_blink) {              │
│ L1670         |       self.physical_lcd_display(...)        │
│               |     }                                        │
│ L1676         |   }                                          │
│               |                                              │
│ L1678-L1688   |   Lógica de flicker                         │
│ L1679         |   if (will_flicker) {                       │
│ L1681         |     physical_lcd_display(["", ""])  ← Limpa│
│ L1684         |     self.flicker_timer = H.delay(           │
│ L1686         |       function() { ... f() ... },           │
│ L1687         |       self.flicker_delay  ← 25ms             │
│ L1688         |     )                                        │
│               |   } else {                                   │
│ L1689         |     f()                                      │
│               |   }                                          │
│               | }                                            │
│               |                                              │
│ L1701         | recycle() {                                │
│ L1703         |   self.new_content(null)                    │
│               | }                                            │
│               |                                              │
└────────────────────────────────────────────────────────────┘
```

---

## Localização de Entrada (Input Handling)

```
┌─ hp12c-min.js ─────────────────────────────────────────────┐
│                                                              │
│ L2100-L2138   | Hp12c_keyboard.prototype.__init__ {         │
│               |                                              │
│ L2123-L2128   |   if (H.touch_display) {                    │
│ L2123         |     self.pointer_div.ontouchstart = (x) =>  │
│ L2123         |       self.mouse_click(x)                   │
│               |   }                                          │
│               |                                              │
│ L2128-L2133   |   if (H.vertical_layout) {                  │
│ L2133         |     self.cross.onclick = (x) =>             │
│ L2133         |       self.mouse_click(x)  ← Click handler  │
│               |   }                                          │
│               |                                              │
│ L2136-L2137   | self.pointer_div.onkeypress = (x) => {     │
│ L2137         |   self.hard_keyboard(x)  ← Keyboard handler│
│               | }                                            │
│               |                                              │
│ L2138         | }                                           │
│               |                                              │
│ L2152         | enable() {                                 │
│ L2152         |   self.is_enabled = 1                       │
│ L2154-L2161   |   if (self.buffer) {                        │
│ L2160         |     H.defer(function() {                    │
│ L2161         |       self.do_dispatch_key(key)             │
│               |     })                                       │
│               |   }                                          │
│               | }                                            │
│               |                                              │
│ L2226-L2231   | do_dispatch_key(key) { ⭐ KEY DISPATCHER   │
│ L2227         |   self.buffer = 0                           │
│ L2228         |   H.dispatcher.dispatch(key)  ← Para maq.  │
│               | }                                            │
│               |                                              │
│ L2234-L2265   | hard_keyboard(e) { ⭐ KEYBOARD HANDLER     │
│ L2236         |   self.transform_coords()                   │
│ L2240         |   var keynum = window.event.keyCode         │
│ L2244         |   var keychar = String.fromCharCode(keynum) │
│ L2246         |   var kk = self.kbdtable[keychar]           │
│ L2247-L2251   |   if (kk !== undefined) {                   │
│ L2251         |     self.dispatch_key(kk, false)  ← Processa│
│               |   }                                          │
│               | }                                            │
│               |                                              │
│ L2307-L2380   | mouse_click(evt) { ⭐ MOUSE HANDLER         │
│ L2310         |   self.transform_coords()                   │
│ L2345-L2365   |   Calcula posição do clique (x, y)         │
│ L2365-L2380   |   Encontra qual botão foi clicado          │
│ L2379         |   self.dispatch_key(key_index, false)       │
│               | }                                            │
│               |                                              │
└────────────────────────────────────────────────────────────┘
```

---

## Fluxo Completo: Entrada → Display

```
ENTRADA DO USUÁRIO
        │
        ├─→ Teclado: onkeypress [L2136]
        │       ↓
        │   hard_keyboard(e) [L2234]
        │       ↓
        │   Converte keyCode em índice
        │       ↓
        │   dispatch_key(index) [L2223]
        │
        └─→ Mouse: onclick/ontouchstart [L2123, L2133]
                ↓
            mouse_click(evt) [L2307]
                ↓
            Calcula (x, y) relativo
                ↓
            Encontra botão acionado
                ↓
            dispatch_key(index) [L2379]

PROCESSAMENTO
        │
        ↓
    do_dispatch_key(key) [L2226]
        │
        ├→ H.dispatcher.dispatch(key) [L2228]
        │
        └→ [Máquina HP-12C processa operação]

ATUALIZAÇÃO DO DISPLAY
        │
        ↓
    new_content([resultado, alt], flicker) [L1604]
        │
        ├─→ self.contents_logical = resultado [L1608]
        │
        ├─→ Verifica modal/overflow/blink [L1625-1650]
        │
        └─→ if (will_flicker) [L1678]
                ├─→ physical_lcd_display(["", ""]) [L1681] (limpa)
                ├─→ H.delay(25ms) [L1684-1687]
                └─→ physical_lcd_display(resultado) [dentro do delay]
            else [L1689]
                └─→ physical_lcd_display(resultado)

RENDERIZAÇÃO NO LCD
        │
        ↓
    physical_lcd_display(contents) [L1420]
        │
        ├─→ Verifica cache [L1427-1428]
        │
        ├─→ Para cada caractere:
        │       ├─→ Busca em self.lcdmap[char] [L1460]
        │       └─→ Armazena em buffer[f] [L1463]
        │
        ├─→ Preenche resto com 0 [L1467-1468]
        │
        └─→ Para cada dígito (0-10):
                └─→ Para cada segmento (1-9):
                        └─→ self.lcd[f][segm]
                              .style.visibility = "visible/hidden" [L1481]

RENDERIZAÇÃO NO BROWSER
        │
        ↓
    CSS atualiza imagens PNG
        │
        └─→ Usuário vê resultado final
```

---

## Estrutura de Dados - Referências Exatas

```javascript
// ========================================
// ESTRUTURA DE LCD: self.lcd
// ========================================
L1387-L1397:

for (var e = 0; e <= 10; ++e) {
    self.lcd[e] = [];
    self.lcd[e][0] = 0;
    self.lcd[e][1] = H.getElem("lcd" + e + "a");  // segmento A
    self.lcd[e][2] = H.getElem("lcd" + e + "b");  // segmento B
    self.lcd[e][3] = H.getElem("lcd" + e + "c");  // segmento C
    self.lcd[e][4] = H.getElem("lcd" + e + "d");  // segmento D
    self.lcd[e][5] = H.getElem("lcd" + e + "e");  // segmento E
    self.lcd[e][6] = H.getElem("lcd" + e + "f");  // segmento F
    self.lcd[e][7] = H.getElem("lcd" + e + "g");  // segmento G
    self.lcd[e][8] = H.getElem("lcd" + e + "p");  // decimal point
    self.lcd[e][9] = H.getElem("lcd" + e + "t");  // thousands separator
}

// Resultado: 11 dígitos × 9 elementos = 99 referências do DOM


// ========================================
// MAPA DE SEGMENTOS: self.lcdmap
// ========================================
L1334-L1384:

var LCD_A = 1;      // 0b0000000001
var LCD_B = 2;      // 0b0000000010
var LCD_C = 4;      // 0b0000000100
var LCD_D = 8;      // 0b0000001000
var LCD_E = 16;     // 0b0000010000
var LCD_F = 32;     // 0b0000100000
var LCD_G = 64;     // 0b0001000000
var LCD_P = 128;    // 0b0010000000 (ponto)
var LCD_T = 256;    // 0b0100000000 (vírgula)

self.lcdmap = {};
self.lcdmap['0'] = LCD_A | LCD_B | LCD_C | LCD_E | LCD_F | LCD_G;  // 63
self.lcdmap['1'] = LCD_C | LCD_F;                                   // 6
self.lcdmap['2'] = LCD_A | LCD_C | LCD_D | LCD_E | LCD_G;           // 91
// ... etc para '3'-'9'
self.lcdmap['.'] = LCD_P;                                           // 128
self.lcdmap[','] = LCD_P | LCD_T;                                   // 384
self.lcdmap[' '] = 0;                                               // 0


// ========================================
// CONSTANTES DO DISPLAY
// ========================================
L1311-L1320:

self.lcd = [];
self.contents_logical = ["", ""];
self.contents_physical = "replaceme";
self.contents_alt_physical = "replaceme";
self.contents_modifier_logical = "";
self.contents_modifier_physical = "replaceme";
self.flicker_delay = 25;                    // milliseconds
self.flicker_timer = null;
self.overflow_blink = false;
self.overflow_blink_timer = null;
self.overflow_blink_freq = 250;             // milliseconds
```

---

## Otimização: Check de Cache

```javascript
// [L1427-L1428]
// Evita re-renderizar se conteúdo já está correto

if (self.contents_physical === txt) {
    return;  // ← Já renderizado, sai rápido!
}

// Só continua se realmente mudou
self.contents_physical = txt;
```

---

## Lógica de Renderização Passo-a-Passo

```javascript
// [L1442-L1481] - Core da renderização

for (var e = 0; e < txt.length && f < self.lcd.length; ++e) {
    var merge = false;
    var val = txt.charAt(e);
    ++f;
    
    // Caso especial: ponto/vírgula depois de número
    if ((val == '.' || val == ',') && f > 0) {
        --f;                    // volta ao dígito anterior
        merge = true;          // combina com anterior
    }
    
    // Encontra mapa do caractere
    if (! self.lcdmap[val]) {
        val = ' ';
    }
    var map = self.lcdmap[val];
    
    // Armazena (combinando se necessário)
    buffer[f] = map | (merge ? buffer[f] : 0);
}

// Limpa dígitos não usados
for (++f; f < self.lcd.length; ++f) {
    buffer[f] = 0;
}

// RENDERIZA CADA SEGMENTO
for (f = 0; f < buffer.length && f < self.lcd.length; ++f) {
    var map2 = buffer[f];
    
    for (var segm = 1; segm < 10; ++segm) {
        var bit = 1 << (segm - 1);          // máscara: 0b00000001, 0b00000010, etc
        var visibility = (map2 & bit) ?     // AND bitwise
            "visible" : "hidden";
        
        // Otimização: só atualiza se mudou
        if (self.lcd[f][segm].style.visibility !== visibility) {
            self.lcd[f][segm].style.visibility = visibility;
        }
    }
}
```

---

## Teste no Console

```javascript
// Colar no console do navegador (F12)

// Debug: Ver estrutura do LCD
console.log(H.display.lcd[0]);           // Array de 10 elementos
console.log(H.display.lcdmap['8']);      // 127 (binário: 1111111)

// Debug: Ver conteúdo atual
console.log(H.display.contents_logical);     // ["resultado", "alt"]
console.log(H.display.contents_physical);    // "resultado"
console.log(H.display.overflow_blink);       // true/false

// Teste: Renderizar manualmente
H.display.new_content(["12345", ""], false);

// Teste: Com flicker
H.display.new_content(["99999", ""], true);

// Teste: Ativar blink
H.display.set_blink(true);
H.display.new_content(["ERROR", ""], false);

// Teste: Parar blink
H.display.set_blink(false);
H.display.clear();

// Debug: Ver timing
var t0 = Date.now();
H.display.new_content(["123", ""], true);
console.log("Tempo desde new_content:", Date.now() - t0, "ms");
// Resposta: ~0ms (o flicker é async)
```

---

## Arquivo HTML - Estrutura

```html
<!-- index.html -->

<div id="lcd-overlay">
    <!-- Dígito 0 -->
    <div class="lcd-digit" id="lcd-digit-0">
        <img id="lcd0a" src="images/11_lcda.png" style="visibility:hidden;">
        <img id="lcd0b" src="images/11_lcdb.png" style="visibility:hidden;">
        ...
        <img id="lcd0t" src="images/11_lcdt.png" style="visibility:hidden;">
    </div>
    
    <!-- Dígito 1 -->
    <div class="lcd-digit" id="lcd-digit-1">
        <img id="lcd1a" src="images/11_lcda.png" style="visibility:hidden;">
        ...
    </div>
    
    <!-- ... Dígitos 2-10 ... -->
    
    <div class="lcd-digit" id="lcd-digit-10">
        <img id="lcd10a" src="images/11_lcda.png" style="visibility:hidden;">
        ...
    </div>
</div>
```

---

## Performance

```javascript
// Operações por atualização:
// - Cálculo de buffer:     ~0.5ms (string parsing)
// - Loop de renderização:  ~1-1.5ms (11 × 9 = 99 elementos)
// - Total DOM update:      ~0.1-0.2ms (visibility changes)
// - Browser render:        ~0.2-0.5ms (repaint)
//
// TOTAL: ~2-3ms por atualização

// Com flicker (25ms delay):
// - T0ms: Início
// - T6ms: Entrada processada
// - T31ms: Display reexibe
// - Tempo total perceptível: ~25ms (natural!)
```

---

## Sumário de Localizações

| Seção | Linhas | Descrição |
|-------|--------|-----------|
| Definição LCD_A...LCD_T | 1334-1341 | Constantes de bits |
| Inicialização lcdmap | 1344-1384 | Tabela de caracteres |
| Carregamento elementos | 1387-1397 | Loop dos 11 dígitos |
| Função principal | 1420-1481 | physical_lcd_display() |
| Função de entrada | 1604-1700 | new_content() |
| Teclado | 2234-2265 | hard_keyboard() |
| Mouse | 2307-2380 | mouse_click() |
| Despacho | 2226-2231 | do_dispatch_key() |

