// Web Speech API wrapper for Text-to-Speech and Speech Recognition

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  speak(text, rate = 1.0) {
    if (!this.synth) return;
    this.synth.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate; // 1.0 = normal, 0.7 = slow
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = this.synth.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (enVoice) {
      utterance.voice = enVoice;
    }

    this.synth.speak(utterance);
  }

  startListening({ onResult, onError, onEnd, onStart }) {
    if (!this.recognition) {
      if (onError) onError("Fitur pengenalan suara tidak didukung browser ini. Gunakan Google Chrome atau Safari.");
      return;
    }

    this.recognition.onstart = () => {
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (onResult) onResult(transcript, event.results[0].isFinal);
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start failed:", e);
      if (onError) onError("Mikrofon sedang digunakan atau bermasalah.");
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const speechService = new SpeechService();
