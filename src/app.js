const GoogleTranslateBackend = require('./backends/google');
const MockTranslateBackend = require('./backends/mock');

class TranslateApp {
  constructor() {
    this.backend = new GoogleTranslateBackend();
    this.fallbackBackend = new MockTranslateBackend();
    this.debounceTimer = null;
    this.currentSourceLang = 'auto';
    this.currentTargetLang = 'en';
    this.supportedLanguages = this.backend.getSupportedLanguages();
    this.defaultLanguages = ['auto', 'en', 'ru', 'pt'];
    this.recentLanguages = this.loadRecentLanguages();
    this.sourceDropdownLang = '';
    this.targetDropdownLang = '';
    
    this.initializeUI();
    this.bindEvents();
    this.initializeTheme();
  }

  loadRecentLanguages() {
    const recent = localStorage.getItem('recentLanguages');
    return recent ? JSON.parse(recent) : [];
  }

  saveRecentLanguages() {
    localStorage.setItem('recentLanguages', JSON.stringify(this.recentLanguages));
  }

  addRecentLanguage(lang) {
    if (lang === 'auto' || this.defaultLanguages.includes(lang)) return;
    
    const index = this.recentLanguages.indexOf(lang);
    if (index > -1) {
      this.recentLanguages.splice(index, 1);
    }
    
    this.recentLanguages.unshift(lang);
    this.recentLanguages = this.recentLanguages.slice(0, 3);
    this.saveRecentLanguages();
  }

  initializeUI() {
    this.populateLanguageDropdowns();
    this.updateQuickLanguageButtons();
    this.focusInput();
  }

  populateLanguageDropdowns() {
    const sourceDropdown = document.getElementById('source-dropdown');
    const targetDropdown = document.getElementById('target-dropdown');
    
    sourceDropdown.innerHTML = '';
    targetDropdown.innerHTML = '';
    
    for (const [code, name] of Object.entries(this.supportedLanguages)) {
      const sourceOption = new Option(name, code);
      const targetOption = new Option(name, code);
      
      if (code === this.currentSourceLang) sourceOption.selected = true;
      if (code === this.currentTargetLang) targetOption.selected = true;
      
      sourceDropdown.add(sourceOption);
      if (code !== 'auto') {
        targetDropdown.add(targetOption);
      }
    }
  }

  updateQuickLanguageButtons() {
    this.buildQuickLanguageButtons('source-quick', this.currentSourceLang, true);
    this.buildQuickLanguageButtons('target-quick', this.currentTargetLang, false);
    this.updateDropdownButtons();
  }

  buildQuickLanguageButtons(containerId, currentLang, includeAuto) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const languages = [];
    const dropdownLang = includeAuto ? this.sourceDropdownLang : this.targetDropdownLang;
    
    // If current selection is non-default, add it first
    if (currentLang && !this.defaultLanguages.includes(currentLang) && this.supportedLanguages[currentLang]) {
      languages.push(currentLang);
    }
    
    // Add default languages
    languages.push(...this.defaultLanguages);
    
    // Add recent languages that aren't defaults and aren't already added
    languages.push(...this.recentLanguages.filter(lang => 
      this.supportedLanguages[lang] && 
      !this.defaultLanguages.includes(lang) && 
      lang !== currentLang
    ));
    
    const uniqueLanguages = [...new Set(languages)];
    
    uniqueLanguages.forEach(lang => {
      if (this.supportedLanguages[lang]) {
        const btn = document.createElement('button');
        btn.className = 'lang-btn';
        btn.dataset.lang = lang;
        btn.textContent = this.supportedLanguages[lang];
        
        if (lang === currentLang) {
          btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => {
          if (includeAuto) {
            this.selectSourceLanguage(lang);
          } else {
            this.selectTargetLanguage(lang);
          }
        });
        
        container.appendChild(btn);
      }
    });
  }

  updateDropdownButtons() {
    // The dropdown buttons are now integrated into the main button list
    // No separate dropdown button needed since selected non-default languages 
    // appear as the first button in the list
  }

  bindEvents() {
    const inputText = document.getElementById('input-text');
    const clearBtn = document.getElementById('clear-input');
    const copyBtn = document.getElementById('copy-output');
    const swapBtn = document.getElementById('swap-languages');
    const sourceDropdown = document.getElementById('source-dropdown');
    const targetDropdown = document.getElementById('target-dropdown');
    const dismissError = document.getElementById('dismiss-error');

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        sourceDropdown.focus();
        sourceDropdown.showPicker();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        targetDropdown.focus();
        targetDropdown.showPicker();
      }
    });

    inputText.addEventListener('input', (e) => {
      this.debouncedTranslate(e.target.value);
    });

    clearBtn.addEventListener('click', () => {
      inputText.value = '';
      document.getElementById('output-text').innerHTML = '<div class="placeholder">Translation will appear here</div>';
      document.getElementById('detected-lang').textContent = '';
    });

    copyBtn.addEventListener('click', () => {
      const outputText = document.getElementById('output-text').textContent;
      if (outputText && !outputText.includes('Translation will appear here')) {
        navigator.clipboard.writeText(outputText).then(() => {
          this.showTemporaryMessage(copyBtn, 'Copied!');
        });
      }
    });

    swapBtn.addEventListener('click', () => {
      if (this.currentSourceLang === 'auto') return;
      
      const temp = this.currentSourceLang;
      this.currentSourceLang = this.currentTargetLang;
      this.currentTargetLang = temp;
      
      sourceDropdown.value = this.currentSourceLang;
      targetDropdown.value = this.currentTargetLang;
      
      this.updateQuickLanguageButtons();
      
      const inputValue = inputText.value.trim();
      if (inputValue) {
        this.debouncedTranslate(inputValue);
      }
    });


    sourceDropdown.addEventListener('change', (e) => {
      if (e.target.value) {
        this.selectSourceLanguageFromDropdown(e.target.value);
        e.target.value = '';
        this.focusInput();
      }
    });

    targetDropdown.addEventListener('change', (e) => {
      if (e.target.value) {
        this.selectTargetLanguageFromDropdown(e.target.value);
        e.target.value = '';
        this.focusInput();
      }
    });



    dismissError.addEventListener('click', () => {
      document.getElementById('error').classList.add('hidden');
    });
  }

  selectSourceLanguage(lang) {
    this.currentSourceLang = lang;
    if (lang !== 'auto') {
      this.addRecentLanguage(lang);
    }
    
    this.updateQuickLanguageButtons();
    
    const inputValue = document.getElementById('input-text').value.trim();
    if (inputValue) {
      this.debouncedTranslate(inputValue);
    }
  }

  selectTargetLanguage(lang) {
    this.currentTargetLang = lang;
    this.addRecentLanguage(lang);
    
    this.updateQuickLanguageButtons();
    
    const inputValue = document.getElementById('input-text').value.trim();
    if (inputValue) {
      this.debouncedTranslate(inputValue);
    }
  }

  selectSourceLanguageFromDropdown(lang) {
    this.selectSourceLanguage(lang);
  }

  selectTargetLanguageFromDropdown(lang) {
    this.selectTargetLanguage(lang);
  }

  debouncedTranslate(text) {
    clearTimeout(this.debounceTimer);
    
    if (!text.trim()) {
      document.getElementById('output-text').innerHTML = '<div class="placeholder">Translation will appear here</div>';
      document.getElementById('detected-lang').textContent = '';
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.translateText(text);
    }, 500);
  }

  async translateText(text) {
    if (!text.trim()) return;

    const loading = document.getElementById('loading');
    const outputElement = document.getElementById('output-text');
    const detectedLangElement = document.getElementById('detected-lang');

    try {
      loading.classList.remove('hidden');
      
      let result;
      try {
        result = await this.backend.translate(text, this.currentSourceLang, this.currentTargetLang);
      } catch (error) {
        console.warn('Primary backend failed, using fallback:', error.message);
        result = await this.fallbackBackend.translate(text, this.currentSourceLang, this.currentTargetLang);
        this.showError('Using offline mode - limited translations available');
      }
      
      outputElement.textContent = result.text;
      
      if (result.from && result.from !== this.currentTargetLang) {
        const fromLangName = this.supportedLanguages[result.from] || result.from;
        detectedLangElement.textContent = `Detected: ${fromLangName}`;
      } else {
        detectedLangElement.textContent = '';
      }
      
    } catch (error) {
      console.error('All translation methods failed:', error);
      this.showError(`Translation failed: ${error.message}`);
      outputElement.innerHTML = '<div class="placeholder">Translation failed</div>';
      detectedLangElement.textContent = '';
    } finally {
      loading.classList.add('hidden');
    }
  }

  showError(message) {
    const errorElement = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorElement.classList.remove('hidden');
    
    setTimeout(() => {
      errorElement.classList.add('hidden');
    }, 5000);
  }

  hideError() {
    document.getElementById('error').classList.add('hidden');
  }

  showTemporaryMessage(element, message) {
    const originalText = element.textContent;
    element.textContent = message;
    setTimeout(() => {
      element.textContent = originalText;
    }, 1000);
  }

  focusInput() {
    const inputText = document.getElementById('input-text');
    if (inputText) {
      inputText.focus();
    }
  }

  initializeTheme() {
    const { ipcRenderer } = require('electron');
    
    ipcRenderer.on('theme-updated', (event, shouldUseDarkColors) => {
      const theme = shouldUseDarkColors ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TranslateApp();
});