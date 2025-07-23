const TranslationBackend = require('./base');

class MockTranslateBackend extends TranslationBackend {
  constructor() {
    super();
    this.name = 'Mock Translate (Offline)';
  }

  async translate(text, from, to) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (from === to) {
      return {
        text: text,
        from: from,
        to: to,
        confidence: 1
      };
    }

    const mockTranslations = {
      'hello': { es: 'hola', fr: 'bonjour', de: 'hallo', it: 'ciao', ru: 'привет', pt: 'olá' },
      'world': { es: 'mundo', fr: 'monde', de: 'welt', it: 'mondo', ru: 'мир', pt: 'mundo' },
      'thank you': { es: 'gracias', fr: 'merci', de: 'danke', it: 'grazie', ru: 'спасибо', pt: 'obrigado' },
      'goodbye': { es: 'adiós', fr: 'au revoir', de: 'auf wiedersehen', it: 'ciao', ru: 'до свидания', pt: 'tchau' },
      'good morning': { es: 'buenos días', fr: 'bonjour', de: 'guten morgen', it: 'buongiorno', ru: 'доброе утро', pt: 'bom dia' },
      'good night': { es: 'buenas noches', fr: 'bonne nuit', de: 'gute nacht', it: 'buonanotte', ru: 'спокойной ночи', pt: 'boa noite' },
      'please': { es: 'por favor', fr: 's\'il vous plaît', de: 'bitte', it: 'per favore', ru: 'пожалуйста', pt: 'por favor' },
      'yes': { es: 'sí', fr: 'oui', de: 'ja', it: 'sì', ru: 'да', pt: 'sim' },
      'no': { es: 'no', fr: 'non', de: 'nein', it: 'no', ru: 'нет', pt: 'não' }
    };

    const lowerText = text.toLowerCase().trim();
    if (mockTranslations[lowerText] && mockTranslations[lowerText][to]) {
      return {
        text: mockTranslations[lowerText][to],
        from: from === 'auto' ? 'en' : from,
        to: to,
        confidence: 1
      };
    }

    return {
      text: `[${to.toUpperCase()}] ${text}`,
      from: from === 'auto' ? 'en' : from,
      to: to,
      confidence: 0.5
    };
  }

  getSupportedLanguages() {
    return {
      'auto': 'Auto-detect',
      'en': 'English',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian'
    };
  }

  getName() {
    return this.name;
  }
}

module.exports = MockTranslateBackend;