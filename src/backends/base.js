class TranslationBackend {
  constructor() {
    if (this.constructor === TranslationBackend) {
      throw new Error('Cannot instantiate abstract class');
    }
  }

  async translate(text, from, to) {
    throw new Error('translate method must be implemented');
  }

  getSupportedLanguages() {
    throw new Error('getSupportedLanguages method must be implemented');
  }

  getName() {
    throw new Error('getName method must be implemented');
  }
}

module.exports = TranslationBackend;