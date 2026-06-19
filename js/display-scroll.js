/**
 * Display Scroll Handler - Esquerda com Limite e Margem Inicial
 */

(function() {
  'use strict';

  const MARGIN_LEFT = 0;        // ← AJUSTE AQUI: pixels de espaço à esquerda (0-150)
  const MAX_VISIBLE_DIGITS = 7;  // quantos dígitos cabem
  const DIGIT_WIDTH = 10;        // largura de cada dígito com margem
  
  let lastDisplayContent = '';
  let lcdOverlay = null;
  
  /**
   * Calcular o scroll com margem inicial
   */
  function updateDisplayScroll(displayContent) {
    if (!lcdOverlay) {
      lcdOverlay = document.getElementById('lcd-overlay');
      if (!lcdOverlay) return;
    }
    
    const trimmedContent = displayContent.trimRight();
    const digitCount = trimmedContent.length;
    
    let translateValue = MARGIN_LEFT;  // ← COMEÇA COM A MARGEM
    
    // Se dentro do limite: fica com a margem inicial
    if (digitCount <= MAX_VISIBLE_DIGITS) {
      translateValue = MARGIN_LEFT;
      console.log(`${digitCount} dígitos - margem: ${MARGIN_LEFT}px`);
    } 
    // Se ultrapassou o limite: faz scroll mantendo a margem
    else {
      const excessDigits = digitCount - MAX_VISIBLE_DIGITS;
      translateValue = MARGIN_LEFT - (excessDigits * DIGIT_WIDTH);
      console.log(`${digitCount} dígitos - scroll: ${translateValue}px`);
    }
    
    lcdOverlay.style.transform = `translateX(${translateValue}px)`;
    lcdOverlay.style.transition = 'transform 0.1s ease-out';
    lastDisplayContent = displayContent;
  }
  
  function interceptDisplayUpdate() {
    if (typeof Hp12c_display === 'undefined') {
      setTimeout(interceptDisplayUpdate, 100);
      return;
    }
    
    const originalPhysicalLcdDisplay = Hp12c_display.prototype.physical_lcd_display;
    
    Hp12c_display.prototype.physical_lcd_display = function(contents) {
      originalPhysicalLcdDisplay.call(this, contents);
      const displayContent = contents[0] || '';
      updateDisplayScroll(displayContent);
    };
  }
  
  function init() {
    lcdOverlay = document.getElementById('lcd-overlay');
    
    if (!lcdOverlay) {
      setTimeout(init, 100);
      return;
    }
    
    console.log(`Margem inicial: ${MARGIN_LEFT}px | Máximo: ${MAX_VISIBLE_DIGITS} dígitos`);
    interceptDisplayUpdate();
    
    window.addEventListener('resize', function() {
      updateDisplayScroll(lastDisplayContent);
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();