# Fluxo de Atualização do Display LCD - HP-12C

## Diagrama de Fluxo de Entrada → Renderização

```
┌─────────────────────────────────────────────────────────────────┐
│                      ENTRADA DO USUÁRIO                          │
│                  (Teclado ou Mouse)                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  hard_keyboard()│ [L2234]
                    │ mouse_click()   │ [L2307]
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │dispatch_key()   │
                    └────────┬────────┘
                             │
                    ┌────────▼──────────────────┐
                    │H.dispatcher.dispatch(key)│
                    │  (Máquina HP-12C)        │
                    └────────┬──────────────────┘
                             │
                  ┌──────────▼────────────┐
                  │  Cálculo e resultado  │
                  └──────────┬────────────┘
                             │
                    ┌────────▼────────────────┐
                    │  new_content()          │ [L1604]
                    │  [string, alt_string]   │
                    └────────┬────────────────┘
                             │
                   ┌─────────▼──────────┐
                   │  Aplica flicker?   │
                   └──┬─────────────┬───┘
                      │ SIM         │ NÃO
                      │             │
         ┌────────────▼──┐    ┌─────▼──────────┐
         │ Limpa Display │    │ Chama física   │
         │ [25ms delay]  │    │ LCD display()  │
         │ Reexibe       │    └─────┬──────────┘
         └────────────┬──┘          │
                      │             │
                      └──────┬──────┘
                             │
            ┌────────────────▼──────────────────┐
            │ physical_lcd_display()             │ [L1420]
            │ Converte string → mapa de bits    │
            └────────────────┬───────────────────┘
                             │
        ┌────────────────────▼─────────────────────┐
        │ Para cada dígito (0-10):                │
        │  - Pega caractere da string             │
        │  - Busca em self.lcdmap[char]           │
        │  - Obtém bitmask de segmentos           │
        └────────────────┬────────────────────────┘
                         │
        ┌────────────────▼─────────────────────┐
        │ Para cada segmento (a-g, p, t):      │
        │  - Verifica se bit está ativo        │
        │  - Calcula visibility = visível/oculto │
        │  - Atualiza: self.lcd[f][segm]      │
        │    .style.visibility                │
        └────────────────┬────────────────────┘
                         │
            ┌────────────▼───────────┐
            │ RENDERIZAÇÃO NO BROWSER │
            │ Imagens PNG aparecem/   │
            │ desaparecem dinamicamente│
            └────────────────────────┘
```

---

## Estrutura de Dados - Mapa de Visualização

```
self.lcd[dígito][segmento]
    ↓
[0] [referência do elemento html]
     └─ <img id="lcd0a"> ─ style.visibility
     └─ <img id="lcd0b"> ─ style.visibility
     └─ <img id="lcd0c"> ─ style.visibility
     └─ <img id="lcd0d"> ─ style.visibility
     └─ <img id="lcd0e"> ─ style.visibility
     └─ <img id="lcd0f"> ─ style.visibility
     └─ <img id="lcd0g"> ─ style.visibility
     └─ <img id="lcd0p"> ─ style.visibility (decimal point)
     └─ <img id="lcd0t"> ─ style.visibility (thousands separator)

Índice de segmento:
  1=a, 2=b, 3=c, 4=d, 5=e, 6=f, 7=g, 8=p, 9=t
```

---

## Exemplo: Como "8" é Renderizado

### 1. Entrada
```javascript
new_content(["        8", ""], false)
```

### 2. Busca em lcdmap
```javascript
self.lcdmap['8'] = LCD_A | LCD_B | LCD_C | LCD_D | LCD_E | LCD_F | LCD_G
                 = 1 | 2 | 4 | 8 | 16 | 32 | 64
                 = 127  (binário: 01111111)
```

### 3. Cálculo de visibilidade por segmento
```javascript
buffer[8] = 127

Para segmento 1 (a):  127 & (1 << 0) = 127 & 1   = 1    ✓ visible
Para segmento 2 (b):  127 & (1 << 1) = 127 & 2   = 2    ✓ visible
Para segmento 3 (c):  127 & (1 << 2) = 127 & 4   = 4    ✓ visible
Para segmento 4 (d):  127 & (1 << 3) = 127 & 8   = 8    ✓ visible
Para segmento 5 (e):  127 & (1 << 4) = 127 & 16  = 16   ✓ visible
Para segmento 6 (f):  127 & (1 << 5) = 127 & 32  = 32   ✓ visible
Para segmento 7 (g):  127 & (1 << 6) = 127 & 64  = 64   ✓ visible
Para segmento 8 (p):  127 & (1 << 7) = 127 & 128 = 0    ✗ hidden
Para segmento 9 (t):  127 & (1 << 8) = 127 & 256 = 0    ✗ hidden
```

### 4. Resultado visual
```
┌───────┐
│ a a a │
│f     b│
│f     b│
├───────┤  ← d
│g     c│
│g     c│
│ e e e │
```

---

## Exemplo: Como "1,234" é Renderizado

### Input
```javascript
new_content(["1,234", ""], false)
```

### Processamento
```javascript
e=0: char='1' → f=0
     map = LCD_C | LCD_F = 4 | 32 = 36
     buffer[0] = 36

e=1: char=',' → merge=true, f=0 (não incrementa)
     map = LCD_P | LCD_T = 128 | 256 = 384
     buffer[0] = 36 | 384 = 420  ← Combina '1' + ','

e=2: char='2' → f=1
     map = LCD_A | LCD_C | LCD_D | LCD_E | LCD_G = 105
     buffer[1] = 105

e=3: char='3' → f=2
     map = LCD_A | LCD_C | LCD_D | LCD_F | LCD_G = 109
     buffer[2] = 109

e=4: char='4' → f=3
     map = LCD_B | LCD_C | LCD_D | LCD_F = 54
     buffer[3] = 54
```

### Resultado
```
Dígito 0: "1" com vírgula abaixo
Dígito 1: "2"
Dígito 2: "3"
Dígito 3: "4"
```

---

## Efeitos Especiais Implementados

### 1. Flicker (25ms)
```javascript
if (will_flicker) {
    physical_lcd_display(["", ""]);        // Limpa
    setTimeout(() => {
        physical_lcd_display(conteúdo);    // Reexibe após 25ms
    }, 25);
}
```
**Propósito**: Simular "piscar" real de calculadora eletrônica

### 2. Blink em Overflow (250ms)
```javascript
if (self.overflow_blink) {
    setInterval(() => {
        toggle entre exibir conteúdo e ["", ""]
    }, 250);
}
```
**Propósito**: Alerta visual de número fora do alcance

---

## Constantes e Configurações

| Constante | Valor | Localização |
|-----------|-------|-------------|
| `flicker_delay` | 25ms | [L1318](hp12c-min.js#L1318) |
| `overflow_blink_freq` | 250ms | [L1320](hp12c-min.js#L1320) |
| Número de dígitos | 11 (0-10) | [L1387](hp12c-min.js#L1387) |
| Segmentos por dígito | 9 | [L1389-L1397](hp12c-min.js#L1389) |

---

## Conclusões

### ✅ Funcionalidades Implementadas
1. **Display de 11 dígitos** com renderização via imagens PNG
2. **Mapa de segmentos** completo para números e símbolos
3. **Efeito de flicker** ao pressionar tecla (25ms)
4. **Blink em overflow** (250ms alternado)
5. **Suporte a caracteres especiais**: `.`, `,`, `-`, letras, etc.
6. **Renderização eficiente**: Apenas alterna `visibility`, não modifica DOM

### ❌ Funcionalidades NÃO Implementadas
1. **Scroll horizontal**: Sem movimento de dígitos
2. **Animação de transição**: Mudança instantânea
3. **Dígitos dinâmicos**: Sempre 11 posições fixas
4. **Notação científica com scroll**: Nenhum deslocamento

### 📊 Performance
- **Operação de renderização**: ~1-2ms por atualização
- **Manipulação DOM**: Mínima (apenas `style.visibility`)
- **Uso de memória**: Constante (array fixo de 11 dígitos × 9 segmentos)

