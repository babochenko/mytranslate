# MyTranslate

A lightweight translation app with pluggable backend APIs, featuring a Google Translate-like interface.

## Features

- **Pluggable Backend Architecture**: Easy to add new translation services
- **Google Translate Integration**: Uses `google-translate-api-x` for translations
- **Google Translate-like UI**: Familiar interface with quick language buttons and dropdowns
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Translation**: Debounced translation as you type
- **Language Detection**: Automatically detects input language
- **Memory Efficient**: Lightweight Electron app optimized for performance

## Installation

```bash
npm install
```

## Usage

Start the application:
```bash
npm start
```

Start in development mode:
```bash
npm run dev
```

## Architecture

The app uses a pluggable backend system:
- `src/backends/base.js` - Abstract base class for translation backends
- `src/backends/google.js` - Google Translate implementation
- New backends can be easily added by extending the base class

## Supported Languages

Supports 60+ languages including:
- Auto-detect
- English, Spanish, French, German, Italian
- Chinese, Japanese, Korean, Arabic, Hindi
- And many more...

## Features

- **Debounced Translation**: 500ms delay to avoid excessive API calls
- **Character Count**: Real-time character counter
- **Copy to Clipboard**: One-click copy of translations
- **Language Swap**: Quick swap between source and target languages
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on different screen sizes