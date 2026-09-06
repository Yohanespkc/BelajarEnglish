// Web Speech API wrapper for Text-to-Speech and Speech Recognition
// Supports distinct Persona Voice Profiles (Gen Z, Close Friend, Daily, Courteous, Business, Academic)

export const VOICE_PERSONAS = {
  genz_slang: {
    id: 'genz_slang',
    name: 'Zoe',
    title: 'Gen Z & Medsos',
    desc: 'Cepat, energik, nada santai anak muda kekinian (slang & hype)',
    rate: 1.18,
    pitch: 1.22,
    avatar: '⚡',
    color: '#ff2d55',
    matchVoice: (v) => {
      const n = v.name.toLowerCase();
      return v.lang.startsWith('en') && 
        (n.includes('samantha') || n.includes('victoria') || n.includes('karen') || n.includes('google') || n.includes('zira')) &&
        !n.includes('junior') && !n.includes('whisper') && !n.includes('zarvox');
    }
  },
  close_friend: {
    id: 'close_friend',
    name: 'Sam',
    title: 'Sahabat Akrab (Wanna / Gonna)',
    desc: 'Rileks, santai mengalir, bersahabat, nada tongkrongan akrab',
    rate: 1.05,
    pitch: 1.02,
    avatar: '🤙',
    color: '#ff9600',
    matchVoice: (v) => {
      const n = v.name.toLowerCase();
      return v.lang.startsWith('en') && 
        (n.includes('alex') || n.includes('tom') || n.includes('google us') || n.includes('david')) &&
        !n.includes('junior') && !n.includes('whisper') && !n.includes('zarvox');
    }
  },
  daily_conversational: {
    id: 'daily_conversational',
    name: 'Emma',
    title: 'Percakapan Harian Natural',
    desc: 'Hangat, wajar, tempo seimbang penutur asli sehari-hari',
    rate: 1.0,
    pitch: 1.0,
    avatar: '💬',
    color: '#1cb0f6',
    matchVoice: (v) => {
      const n = v.name.toLowerCase();
      return v.lang.startsWith('en') && 
        (n.includes('samantha') || n.includes('google us') || n.includes('karen') || n.includes('ava') || n.includes('allison')) &&
        !n.includes('junior') && !n.includes('whisper');
    }
  },
  courteous_polite: {
    id: 'courteous_polite',
    name: 'Claire',
    title: 'Sopan & Diplomatis',
    desc: 'Lembut, santun, penuh respek, nada ramah dan bijak',
    rate: 0.90,
    pitch: 1.06,
    avatar: '🙏',
    color: '#10b981',
    matchVoice: (v) => {
      const n = v.name.toLowerCase();
      return v.lang.startsWith('en') && 
        (n.includes('victoria') || n.includes('fiona') || n.includes('serena') || n.includes('samantha') || n.includes('moira')) &&
        !n.includes('junior') && !n.includes('whisper');
    }
  },
  business_formal: {
    id: 'business_formal',
    name: 'David',
    title: 'Eksekutif Bisnis',
    desc: 'Tegas, percaya diri, profesional, artikulatif & teratur',
    rate: 0.95,
    pitch: 0.94,
    avatar: '💼',
    color: '#00d26a',
    matchVoice: (v) => {
      const n = v.name.toLowerCase();
      return v.lang.startsWith('en') && 
        (n.includes('daniel') || n.includes('alex') || n.includes('oliver') || n.includes('tom') || n.includes('david')) &&
        !n.includes('junior') && !n.includes('whisper') && !n.includes('zarvox');
    }
  },
  academic_intellectual: {
    id: 'academic_intellectual',
    name: 'Prof. Arthur',
    title: 'Akademisi & Intelektual',
    desc: 'Suara dewasa matang, berwibawa, tempo terukur, artikulasi presisi ilmiah',
    rate: 0.82,
    pitch: 0.80,
    avatar: '🎓',
    color: '#ce82ff',
    // Strictly adult, mature baritone scholarly voices (e.g. Daniel, Oliver, George, Google UK English Male)
    // Explicitly filtering out any child, junior, or novelty synthesizer sounds
    matchVoice: (v) => {
      const n = v.name.toLowerCase();
      const isAdultScholarly = (
        n.includes('daniel') || 
        n.includes('oliver') || 
        n.includes('george') || 
        n.includes('uk english male') || 
        n.includes('alex') || 
        n.includes('arthur') ||
        n.includes('fred')
      );
      const isJuvenileOrNovelty = (
        n.includes('junior') || 
        n.includes('child') || 
        n.includes('kid') || 
        n.includes('young') || 
        n.includes('baby') || 
        n.includes('zarvox') || 
        n.includes('trinoids') || 
        n.includes('whisper') || 
        n.includes('bubbles') || 
        n.includes('albert') || 
        n.includes('bad news') || 
        n.includes('bahh') || 
        n.includes('bells') || 
        n.includes('boing') || 
        n.includes('cellos') || 
        n.includes('deranged') || 
        n.includes('good news') || 
        n.includes('hysterical') || 
        n.includes('pipe organ')
      );
      return v.lang.startsWith('en') && isAdultScholarly && !isJuvenileOrNovelty;
    }
  }
};

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.recognition = null;
    this.initVoices();
    this.initRecognition();
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;
      } catch (e) {
        console.warn("SpeechRecognition init error:", e);
      }
    }
  }

  // Unified Speak Method supporting persona-based intonations
  speak(text, options = 1.0) {
    if (!this.synth) return;
    this.stop(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    let rate = 1.0;
    let pitch = 1.0;
    let onEnd = null;
    let onError = null;
    let personaId = null;

    if (typeof options === 'number') {
      rate = options;
    } else if (typeof options === 'object' && options !== null) {
      rate = options.rate ?? 1.0;
      pitch = options.pitch ?? 1.0;
      onEnd = options.onEnd;
      onError = options.onError;
      personaId = options.personaId;
    }

    // Apply voice persona settings if provided
    if (personaId) {
      const persona = VOICE_PERSONAS[personaId] || 
        (personaId === 'humorous_slang' ? VOICE_PERSONAS.genz_slang : null) ||
        (personaId === 'academic_popular' ? VOICE_PERSONAS.academic_intellectual : null);

      if (persona) {
        rate = persona.rate;
        pitch = persona.pitch;

        if (this.voices.length === 0) {
          this.voices = this.synth.getVoices();
        }

        const matchedVoice = this.voices.find(persona.matchVoice);
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }
    }

    // Fallback best English voice if no specific voice set
    if (!utterance.voice && this.voices.length > 0) {
      const defaultEn = this.voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (defaultEn) utterance.voice = defaultEn;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    if (onEnd) {
      utterance.onend = onEnd;
    }
    if (onError) {
      utterance.onerror = onError;
    }

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  startListening({ onResult, onError, onEnd, onStart }) {
    this.lastTranscript = '';
    this.lastAlternatives = [];
    this.initRecognition();

    if (!this.recognition) {
      if (onError) onError("Fitur pengenalan suara tidak didukung browser ini. Gunakan Google Chrome atau Safari.");
      return;
    }

    this.recognition.onstart = () => {
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      let fullTranscript = '';
      let isFinal = false;
      const alts = [];

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item && item[0]) {
          fullTranscript += item[0].transcript + ' ';
          if (item.isFinal) {
            isFinal = true;
          }
          for (let a = 0; a < item.length; a++) {
            const t = item[a]?.transcript?.trim();
            if (t && !alts.includes(t)) alts.push(t);
          }
        }
      }

      fullTranscript = fullTranscript.trim();
      if (fullTranscript) {
        this.lastTranscript = fullTranscript;
      }
      if (alts.length > 0) {
        this.lastAlternatives = alts;
      }

      if (onResult) {
        onResult(fullTranscript || this.lastTranscript, isFinal, this.lastAlternatives);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition notice:", event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd(this.lastTranscript, this.lastAlternatives);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start failed, re-initializing:", e);
      try {
        this.initRecognition();
        this.recognition.start();
      } catch (e2) {
        if (onError) onError("Mikrofon sedang digunakan atau bermasalah.");
      }
    }
  }

  stopListening(maxWaitMs = 900) {
    return new Promise((resolve) => {
      if (!this.recognition) {
        resolve({
          transcript: this.lastTranscript || '',
          alternatives: this.lastAlternatives || []
        });
        return;
      }

      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          resolve({
            transcript: this.lastTranscript || '',
            alternatives: this.lastAlternatives || []
          });
        }
      };

      const timer = setTimeout(finish, maxWaitMs);

      const prevOnEnd = this.recognition.onend;
      this.recognition.onend = () => {
        clearTimeout(timer);
        if (prevOnEnd) {
          try { prevOnEnd(this.lastTranscript, this.lastAlternatives); } catch {}
        }
        finish();
      };

      try {
        this.recognition.stop();
      } catch {
        clearTimeout(timer);
        finish();
      }
    });
  }
}

export const speechService = new SpeechService();
