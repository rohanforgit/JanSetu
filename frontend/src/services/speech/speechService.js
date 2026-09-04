// Speech Recognition Abstraction Service for JanSetu Multilingual Voice-First Reporting

export const getSpeechLangCode = (shortLang = 'en') => {
  if (!shortLang) return 'en-IN';
  if (shortLang.includes('-')) return shortLang;
  const lang = shortLang.toLowerCase();
  switch (lang) {
    case 'ta': return 'ta-IN'; // Tamil
    case 'te': return 'te-IN'; // Telugu
    case 'kn': return 'kn-IN'; // Kannada
    case 'hi': return 'hi-IN'; // Hindi
    case 'mr': return 'mr-IN'; // Marathi
    case 'bn': return 'bn-IN'; // Bengali
    case 'gu': return 'gu-IN'; // Gujarati
    case 'ml': return 'ml-IN'; // Malayalam
    case 'pa': return 'pa-IN'; // Punjabi
    default: return 'en-IN';   // English (India)
  }
};

export class SpeechService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    this.recognition = this.isSupported ? new SpeechRecognition() : null;
    this.isListening = false;
    this.shouldBeListening = false;
    this.currentTranscript = '';
    this.finalTranscript = '';
    this.restartAttempts = 0;
    this.maxRestartAttempts = 3;

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN';
    }
  }

  startListening({ onResult, onError, onEnd, lang = 'en' }) {
    if (!this.isSupported) {
      const err = new Error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      if (onError) onError(err);
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      const speechLang = getSpeechLangCode(lang);
      this.recognition.lang = speechLang;
      console.log(`[SPEECH SERVICE] Starting speech recognition in language: ${speechLang}`);
      
      this.shouldBeListening = true;
      this.isListening = true;
      this.currentTranscript = '';
      this.finalTranscript = '';
      this.restartAttempts = 0;

      this.recognition.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = 0; i < event.results.length; ++i) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += chunk + ' ';
          } else {
            interimStr += chunk;
          }
        }

        this.finalTranscript = finalStr.trim();
        this.currentTranscript = (finalStr + ' ' + interimStr).trim();

        if (onResult) {
          onResult({
            finalTranscript: this.finalTranscript,
            interimTranscript: interimStr.trim(),
            fullText: this.currentTranscript
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[SPEECH SERVICE ERROR EVENT]', event.error);

        // Ignore 'no-speech' error if user just paused, do not crash UI
        if (event.error === 'no-speech') {
          return;
        }

        let userMsg = 'Speech recognition error occurred.';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          userMsg = 'Microphone permission denied. Please allow microphone access in your browser.';
          this.shouldBeListening = false;
        } else if (event.error === 'audio-capture') {
          userMsg = 'No microphone hardware detected. Please connect a microphone.';
          this.shouldBeListening = false;
        } else if (event.error === 'network') {
          userMsg = 'Voice API unavailable on Brave or strict privacy settings. Please click "Switch to Typing" below to type your report directly.';
          this.shouldBeListening = false;
        }

        this.isListening = false;
        if (onError) onError(new Error(userMsg));
      };

      this.recognition.onend = () => {
        console.log('[SPEECH SERVICE] Recognition ended.');
        this.isListening = false;

        // Auto-restart if user did not manually stop and restart attempts remaining
        if (this.shouldBeListening && this.restartAttempts < this.maxRestartAttempts) {
          this.restartAttempts++;
          console.log(`[SPEECH SERVICE] Auto-restarting recognition (attempt ${this.restartAttempts})...`);
          try {
            this.recognition.start();
            this.isListening = true;
            return;
          } catch (restartErr) {
            console.warn('[SPEECH SERVICE RESTART WARN]', restartErr);
          }
        }

        this.shouldBeListening = false;
        if (onEnd) onEnd(this.currentTranscript);
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('[SPEECH SERVICE START ERROR]', err);
      this.isListening = false;
      this.shouldBeListening = false;
      if (onError) onError(err);
      return false;
    }
  }

  stopListening() {
    this.shouldBeListening = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('[SPEECH SERVICE STOP WARN]', err);
      }
      this.isListening = false;
    }
    return this.currentTranscript;
  }
}

export const speechService = new SpeechService();

