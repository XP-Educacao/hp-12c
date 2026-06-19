# Análise do Display LCD do HP-12C

## 1. Atualização do Display LCD

### Estrutura HTML (index.html)
Os 11 dígitos do display LCD são implementados como elementos DOM individuais (`lcd-digit-0` até `lcd-digit-10`), cada um contendo **9 elementos de imagem**:

```html
<div id="lcd-digit-0" class="lcd-digit">
  <img id="lcd0a" src="images/11_lcda.png" style="visibility:hidden; position:absolute;">
  <img id="lcd0b" src="images/11_lcdb.png" style="visibility:hidden; position:absolute;">
  <img id="lcd0c" src="images/11_lcdc.png" style="visibility:hidden; position:absolute;">
  <img id="lcd0d" src="images/11_lcdd.png" style="visibility:hidden; position:absolute;">
  <img id="lcd0e" src="images/11_lcde.png" style="visibility:hidden; position:absolute;">
  <img id="lcd0f" src="images/11_lcdf.png" style="visibility:hidden; position:absolute;">
  <img id="lcd0g" src="images/11_lcdg.png" style="visibility:hidden; position:absolute;">
  <img id="lcd0p" src="images/11_lcdp.png" style="visibility:hidden; position:absolute;">
  <img id="lcd0t" src="images/11_lcdt.png" style="visibility:hidden; position:absolute;">
</div>
```

Cada imagem representa um **segmento de 7 segmentos (7-segment display)**:
- **a-g**: Os 7 segmentos do visor (horizontal e diagonal)
- **p**: Decimal point (ponto decimal)
- **t**: Thousands separator (vírgula de milhar)

---

## 2. Como o Display é Atualizado com Novos Dígitos

### Função Principal: `physical_lcd_display()` 
**Localização**: [hp12c-min.js](hp12c-min.js#L1420-L1490)

```javascript
Hp12c_display.prototype.physical_lcd_display = function (contents)
{
    var self = this;
    var txt = contents[0];
    var alttxt = contents[1];
    
    // Verifica se precisa atualizar
    if (self.contents_physical === txt) {
        return;
    }
    
    self.contents_physical = txt;
    
    // Loop através de cada caractere da string
    var f = -1;
    var buffer = [];
    
    for (var e = 0; e < txt.length && f < self.lcd.length; ++e) {
        var val = txt.charAt(e);
        ++f;
        
        // Mescla ponto decimal/separador de milhar com dígito anterior
        if ((val == '.' || val == ',') && f > 0) {
            --f;
            merge = true;
        }
        
        // Busca o mapa de segmentos para este caractere
        if (! self.lcdmap[val]) {
            val = ' ';
        }
        var map = self.lcdmap[val];
        buffer[f] = map | (merge ? buffer[f] : 0);
    }
    
    // Atualiza a visibilidade de cada segmento
    for (f = 0; f < buffer.length && f < self.lcd.length; ++f) {
        var map2 = buffer[f];
        for (var segm = 1; segm < 10; ++segm) {
            var bit = 1 << (segm - 1);
            var visibility = (map2 & bit) ? "visible" : "hidden";
            if (self.lcd[f][segm].style.visibility !== visibility) {
                self.lcd[f][segm].style.visibility = visibility;
            }
        }
    }
};
```

**Processo em 3 etapas:**
1. **Converte string em mapa de segmentos**: Cada caractere é convertido em um número que representa quais segmentos devem estar visíveis
2. **Agrupa com pontos decimais**: Se o caractere é um ponto decimal, ele é mesclado com o dígito anterior
3. **Alterna visibilidade**: Cada segmento (a-g, p, t) de cada dígito tem sua propriedade `visibility` ajustada para "visible" ou "hidden"

---

## 3. Mapa de Segmentos (7-Segment Mapping)

**Localização**: [hp12c-min.js](hp12c-min.js#L1334-L1384)

Define quais segmentos acender para cada caractere usando operações bitwise:

```javascript
// Definição dos bits
var LCD_A = 1;      // 00000001 - segmento superior horizontal
var LCD_B = 2;      // 00000010 - superior esquerdo
var LCD_C = 4;      // 00000100 - superior direito
var LCD_D = 8;      // 00001000 - meio
var LCD_E = 16;     // 00010000 - inferior esquerdo
var LCD_F = 32;     // 00100000 - inferior direito
var LCD_G = 64;     // 01000000 - inferior horizontal
var LCD_P = 128;    // 10000000 - decimal point
var LCD_T = 256;    // 100000000 - thousands separator

// Exemplos de mapeamento
self.lcdmap['0'] = LCD_A | LCD_B | LCD_C | LCD_E | LCD_F | LCD_G;  // forma 0
self.lcdmap['1'] = LCD_C | LCD_F;                                   // forma 1
self.lcdmap['8'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_E | LCD_F | LCD_G;  // todos acesos
self.lcdmap['.'] = LCD_P;                                           // apenas ponto
self.lcdmap[','] = LCD_P | LCD_T;                                   // ponto + vírgula
self.lcdmap[' '] = 0;                                               // espaço vazio
```

---

## 4. Inicialização dos Elementos LCD (11 dígitos)

**Localização**: [hp12c-min.js](hp12c-min.js#L1387-L1397)

```javascript
// Carrega referências do DOM para os 11 dígitos
for (var e = 0; e <= 10; ++e) {
    self.lcd[e] = [];
    self.lcd[e][0] = 0;  // índice 0 reservado
    
    // Armazena referência para cada segmento (a-g, p, t)
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "a");
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "b");
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "c");
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "d");
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "e");
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "f");
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "g");
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "p");
    self.lcd[e][self.lcd[e].length] = H.getElem("lcd" + e + "t");
}
```

**Estrutura da matriz `self.lcd`:**
```
self.lcd[0] = [0, <img lcd0a>, <img lcd0b>, ..., <img lcd0t>]  // dígito 0
self.lcd[1] = [0, <img lcd1a>, <img lcd1b>, ..., <img lcd1t>]  // dígito 1
...
self.lcd[10] = [0, <img lcd10a>, <img lcd10b>, ..., <img lcd10t>]  // dígito 10
```

---

## 5. Função JavaScript que Atualiza o Display

### `new_content()` - Ponto de entrada para atualizar conteúdo
**Localização**: [hp12c-min.js](hp12c-min.js#L1604-L1700)

```javascript
Hp12c_display.prototype.new_content = function (content, to_flicker)
{
    var self = this;
    
    // Armazena conteúdo lógico
    self.contents_logical = content;
    
    // Define se deve piscar (flicker) o display
    will_flicker = to_flicker && (!!H.machine);
    
    // Se há flicker, limpa o display e reexibe após delay
    if (will_flicker) {
        self.physical_lcd_display(["", ""]);  // Limpa
        H.machine.cli("flicker");
        
        self.flicker_timer = H.delay(function () {
            H.machine.sti("flicker");
            self.physical_lcd_display(self.r_contents_logical());  // Reexibe
        }, self.flicker_delay);  // 25ms por padrão
    } else {
        self.physical_lcd_display(self.r_contents_logical());
    }
};
```

### Fluxo de atualização:
1. **Input do usuário** → `onkeypress` ou `mouse_click`
2. **Roteamento** → `do_dispatch_key(key)`
3. **Processamento** → Máquina de cálculo HP-12C
4. **Atualização** → `new_content([string, alt_string], flicker_flag)`
5. **Renderização** → `physical_lcd_display(contents)`

---

## 6. Como os 11 Dígitos São Controlados

### Estrutura de controle:

| Estrutura | Descrição |
|-----------|-----------|
| **self.lcd[f][segm]** | Referência do elemento DOM para segmento `segm` do dígito `f` |
| **self.lcdmap[char]** | Bitmask que define quais segmentos acender para caractere `char` |
| **buffer[f]** | Valor acumulado de bits para dígito `f` |

### Modificação de visibilidade:
```javascript
for (f = 0; f < buffer.length && f < self.lcd.length; ++f) {
    var map2 = buffer[f];  // bits para este dígito
    for (var segm = 1; segm < 10; ++segm) {
        var bit = 1 << (segm - 1);  // máscara de bit para este segmento
        var visibility = (map2 & bit) ? "visible" : "hidden";
        self.lcd[f][segm].style.visibility = visibility;  // ← Atualização de visibilidade
    }
}
```

**Lógica:**
- **AND bitwise** (`map2 & bit`): Verifica se o bit está ativo
- **Se bit ativo**: segmento fica visível
- **Se bit inativo**: segmento fica oculto

---

## 7. Mecanismo de Scroll/Movimento de Dígitos

**NÃO existe mecanismo de scroll ou movimento implementado atualmente!**

### Status:
- ❌ **Sem scroll horizontal**: Os dígitos não deslizam
- ❌ **Sem movimento**: Posição fixa para cada dígito (0-10)
- ✅ **11 dígitos fixos**: Sempre na mesma posição
- ✅ **Apenas visibilidade controlada**: Segmentos aparecem/desaparecem

### Como os números longos são exibidos:
Se o número é maior que 11 dígitos, o código trunca ou formata em notação científica. Não há implementação de scroll.

---

## 8. Fluxo Completo de Entrada de Números

### Quando o usuário digita um número:

**1. Captura de entrada** → [hp12c-min.js L2136-2137](hp12c-min.js#L2136)
```javascript
self.pointer_div.onkeypress = function (x) {
    self.hard_keyboard(x);
};
```

**2. Processamento de teclado** → [hp12c-min.js L2234-2265](hp12c-min.js#L2234)
```javascript
Hp12c_keyboard.prototype.hard_keyboard = function (e) {
    var keychar = String.fromCharCode(keynum);
    var kk = self.kbdtable[keychar];  // Encontra código da tecla
    self.dispatch_key(kk, false);      // Despacha
};
```

**3. Despacho de tecla** → [hp12c-min.js L2226-2231](hp12c-min.js#L2226)
```javascript
Hp12c_keyboard.prototype.do_dispatch_key = function (key) {
    H.dispatcher.dispatch(key);  // Envia para máquina calculadora
};
```

**4. Máquina calcula resultado** → Lógica interna
- Máquina HP-12C processa operação
- Gera string de resultado

**5. Display atualiza** 
```javascript
self.new_content([resultado_string, alt_string], true);  // com flicker
```

**6. Renderização final** → `physical_lcd_display()`
- Converte cada caractere em mapa de bits
- Atualiza `visibility` de cada segmento

---

## 9. Localizações-Chave no Código

| Função | Localização | Responsabilidade |
|--------|-------------|------------------|
| `physical_lcd_display()` | [L1420-L1490](hp12c-min.js#L1420) | Renderiza conteúdo no LCD |
| `new_content()` | [L1604-L1700](hp12c-min.js#L1604) | Gerencia novo conteúdo (flicker/blink) |
| Inicialização LCD | [L1387-L1397](hp12c-min.js#L1387) | Carrega referências dos 11 dígitos |
| Mapa de segmentos | [L1334-L1384](hp12c-min.js#L1334) | Define mapeamento char → segmentos |
| `hard_keyboard()` | [L2234-L2265](hp12c-min.js#L2234) | Processa entrada de teclado |
| `do_dispatch_key()` | [L2226-L2231](hp12c-min.js#L2226) | Despacha tecla para processamento |

---

## 10. Resumo Técnico

| Aspecto | Implementação |
|--------|--------------|
| **Número de dígitos** | 11 (0-10) |
| **Tipo de controle** | Visibilidade CSS de imagens PNG |
| **Segmentos por dígito** | 9 (a, b, c, d, e, f, g, p, t) |
| **Tecnologia de renderização** | Imagens PNG com `visibility:hidden/visible` |
| **Atualização de entrada** | Teclado físico ou mouse |
| **Efeito de flicker** | 25ms de delay entre limpar e reexibir |
| **Blink em overflow** | Toggle de 250ms entre exibir/limpar |
| **Scroll de dígitos** | ❌ Não implementado |
| **Máximo de caracteres** | 11 (ajuste via `for (var e = 0; e <= 10; ++e)`) |

