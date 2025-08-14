const TranslationBackend = require('./base');
const { translate: translate1 } = require('@vitalets/google-translate-api');
const translate2 = require('translate-google');

class GoogleTranslateBackend extends TranslationBackend {
  constructor() {
    super();
    this.name = 'Google Translate';
  }

  async translate(text, from, to) {
    if (from === to) {
      return {
        text: text,
        from: from,
        to: to,
        confidence: 1
      };
    }

    try {
      const result = await translate1(text, { from, to });
      return {
        text: result.text,
        from: result.from.language.iso,
        to: to,
        confidence: result.from.language.confidence || 1
      };
    } catch (error1) {
      console.warn('Primary translation failed, trying fallback:', error1.message);
      
      try {
        const result = await translate2(text, { from, to });
        return {
          text: result,
          from: from === 'auto' ? 'auto' : from,
          to: to,
          confidence: 1
        };
      } catch (error2) {
        console.error('Both translation methods failed:', { error1: error1.message, error2: error2.message });
        throw new Error(`Translation failed: ${error1.message}`);
      }
    }
  }

  getSupportedLanguages() {
    return {
      'auto': 'Auto-detect',
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh-cn': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'nl': 'Dutch',
      'pl': 'Polish',
      'tr': 'Turkish',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'cs': 'Czech',
      'sk': 'Slovak',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'hr': 'Croatian',
      'sr': 'Serbian',
      'sl': 'Slovenian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'uk': 'Ukrainian',
      'be': 'Belarusian',
      'ca': 'Catalan',
      'eu': 'Basque',
      'gl': 'Galician',
      'mt': 'Maltese',
      'cy': 'Welsh',
      'ga': 'Irish',
      'is': 'Icelandic',
      'mk': 'Macedonian',
      'sq': 'Albanian',
      'az': 'Azerbaijani',
      'ka': 'Georgian',
      'am': 'Amharic',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'mr': 'Marathi',
      'ne': 'Nepali',
      'or': 'Oriya',
      'pa': 'Punjabi',
      'si': 'Sinhala',
      'ta': 'Tamil',
      'te': 'Telugu',
      'ur': 'Urdu',
      'fa': 'Persian',
      'he': 'Hebrew',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tl': 'Filipino',
      'sw': 'Swahili',
      'zu': 'Zulu',
      'af': 'Afrikaans',
      'yo': 'Yoruba',
      'ig': 'Igbo',
      'ha': 'Hausa',
      'so': 'Somali',
      'rw': 'Kinyarwanda',
      'ny': 'Chichewa',
      'mg': 'Malagasy',
      'eo': 'Esperanto',
      'la': 'Latin'
    };
  }

  getName() {
    return this.name;
  }
}

module.exports = GoogleTranslateBackend;