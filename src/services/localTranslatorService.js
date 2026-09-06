/**
 * Local Translator Service (Unified AI & Smart Offline Translation Engine)
 * Combines active AI Provider (Gemini / Groq / Ollama / OpenAI), offline pattern translation engine, Speech-to-Text (STT), and Text-to-Speech (TTS).
 */

import { aiProviderService } from './aiProviderService';

// Offline Translation Dictionary & Pattern Database for ID <-> EN
const DICTIONARY_ID_TO_EN = {
  // Common greetings & polite expressions
  "halo": "hello",
  "hai": "hi",
  "selamat pagi": "good morning",
  "selamat siang": "good afternoon",
  "selamat sore": "good afternoon",
  "selamat malam": "good evening",
  "selamat tidur": "good night",
  "terima kasih": "thank you",
  "terima kasih banyak": "thank you very much",
  "sama-sama": "you're welcome",
  "kembali": "you're welcome",
  "apa kabar": "how are you",
  "bagaimana kabarmu": "how are you doing",
  "saya baik": "I am fine",
  "saya baik-baik saja": "I am doing well",
  "sampai jumpa": "see you later",
  "dadah": "goodbye",
  "maaf": "sorry",
  "permisi": "excuse me",
  "tolong": "please",
  "silakan": "please go ahead",
  
  // Questions & Conversational Starters
  "siapa namamu": "what is your name",
  "nama saya": "my name is",
  "darimana asalmu": "where are you from",
  "saya berasal dari": "I come from",
  "saya dari": "I am from",
  "indonesia": "Indonesia",
  "inggris": "England",
  "amerika": "America",
  "kamu tinggal dimana": "where do you live",
  "saya tinggal di": "I live in",
  "berapa usiamu": "how old are you",
  "berapa umurmu": "how old are you",
  "umur saya": "my age is",
  "apa hobi kamu": "what is your hobby",
  "hobi saya": "my hobby is",
  "apa pekerjaanmu": "what is your job",
  "saya seorang": "I am a",
  "guru": "teacher",
  "siswa": "student",
  "pelajar": "student",
  "dokter": "doctor",
  "engineer": "engineer",
  "programer": "programmer",
  
  // Practical phrases & travel
  "dimana toilet": "where is the bathroom",
  "dimana kamar mandi": "where is the restroom",
  "berapa harganya": "how much is this",
  "berapa harganya ini": "how much does this cost",
  "terlalu mahal": "too expensive",
  "bisa kurang": "can you lower the price",
  "saya mau beli ini": "I want to buy this",
  "dimana stasiun kereta": "where is the train station",
  "dimana bandara": "where is the airport",
  "saya tersesat": "I am lost",
  "bisakah kamu membantu saya": "can you help me",
  "bisa bantu saya": "can you help me",
  "saya tidak paham": "I don't understand",
  "saya tidak mengerti": "I do not understand",
  "bisa bicara lebih pelan": "can you speak slower",
  "tolong ulangi": "please repeat",
  
  // Common verbs & pronouns
  "saya": "I",
  "aku": "I",
  "kamu": "you",
  "anda": "you",
  "dia": "he/she",
  "mereka": "they",
  "kita": "we",
  "kami": "we",
  "makan": "eat",
  "minum": "drink",
  "tidur": "sleep",
  "belajar": "study",
  "bekerja": "work",
  "pergi": "go",
  "datang": "come",
  "melihat": "see",
  "mendengar": "listen",
  "bicara": "speak",
  "berkata": "say",
  "suka": "like",
  "cinta": "love",
  "ingin": "want",
  "butuh": "need",
  "bisa": "can",
  "harus": "must",
  "sudah": "already",
  "belum": "not yet",
  "sedang": "currently",
  "sangat": "very",
  "bagus": "good",
  "hebat": "great",
  "cantik": "beautiful",
  "ganteng": "handsome",
  "senang": "happy",
  "sedih": "sad",
  "lelah": "tired",
  "lapar": "hungry",
  "haus": "thirsty"
};

// Inverse Map EN to ID
const DICTIONARY_EN_TO_ID = {};
Object.keys(DICTIONARY_ID_TO_EN).forEach((key) => {
  const val = DICTIONARY_ID_TO_EN[key];
  if (!DICTIONARY_EN_TO_ID[val]) {
    DICTIONARY_EN_TO_ID[val] = key;
  }
});

// Extra English to Indonesian entries
Object.assign(DICTIONARY_EN_TO_ID, {
  "hello": "halo",
  "hi": "hai",
  "how are you": "apa kabar",
  "good morning": "selamat pagi",
  "good afternoon": "selamat siang",
  "good evening": "selamat malam",
  "good night": "selamat tidur",
  "thank you": "terima kasih",
  "thanks": "terima kasih",
  "you are welcome": "sama-sama",
  "what is your name": "siapa namamu",
  "my name is": "nama saya",
  "nice to meet you": "senang bertemu denganmu",
  "where are you from": "darimana asalmu",
  "i am from": "saya berasal dari",
  "where do you live": "kamu tinggal dimana",
  "i live in": "saya tinggal di",
  "how much is it": "berapa harganya",
  "can you help me": "bisakah kamu membantu saya",
  "where is the bathroom": "dimana toilet",
  "i am lost": "saya tersesat",
  "i understand": "saya mengerti",
  "i don't understand": "saya tidak mengerti",
  "see you later": "sampai jumpa lagi",
  "bye": "dadah",
  "goodbye": "selamat tinggal",
  "yes": "ya",
  "no": "tidak",
  "maybe": "mungkin",
  "ok": "oke",
  "okay": "oke"
});

/**
 * Perform offline translation from Indonesian to English
 */
export function translateIndonesianToEnglish(text) {
  if (!text || typeof text !== 'string') return '';
  const cleanText = text.trim().toLowerCase();
  
  // Direct Phrase Match
  if (DICTIONARY_ID_TO_EN[cleanText]) {
    return capitalizeFirst(DICTIONARY_ID_TO_EN[cleanText]);
  }

  // Pattern Matching & Replacement for longest matching sub-phrases
  let translatedText = cleanText;
  const sortedKeys = Object.keys(DICTIONARY_ID_TO_EN).sort((a, b) => b.length - a.length);

  for (const phrase of sortedKeys) {
    const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
    if (regex.test(translatedText)) {
      translatedText = translatedText.replace(regex, DICTIONARY_ID_TO_EN[phrase]);
    }
  }

  // Word by word fallback if needed
  const words = translatedText.split(/\s+/);
  const finalWords = words.map(w => {
    const cleanW = w.replace(/[.,?!]/g, '');
    const punct = w.substring(cleanW.length);
    const trans = DICTIONARY_ID_TO_EN[cleanW] || cleanW;
    return trans + punct;
  });

  return capitalizeFirst(finalWords.join(' '));
}

/**
 * Perform offline translation from English to Indonesian
 */
export function translateEnglishToIndonesian(text) {
  if (!text || typeof text !== 'string') return '';
  const cleanText = text.trim().toLowerCase();

  // Direct Phrase Match
  if (DICTIONARY_EN_TO_ID[cleanText]) {
    return capitalizeFirst(DICTIONARY_EN_TO_ID[cleanText]);
  }

  // Pattern Matching & Replacement for longest matching sub-phrases
  let translatedText = cleanText;
  const sortedKeys = Object.keys(DICTIONARY_EN_TO_ID).sort((a, b) => b.length - a.length);

  for (const phrase of sortedKeys) {
    const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
    if (regex.test(translatedText)) {
      translatedText = translatedText.replace(regex, DICTIONARY_EN_TO_ID[phrase]);
    }
  }

  // Word by word fallback
  const words = translatedText.split(/\s+/);
  const finalWords = words.map(w => {
    const cleanW = w.replace(/[.,?!]/g, '');
    const punct = w.substring(cleanW.length);
    const trans = DICTIONARY_EN_TO_ID[cleanW] || cleanW;
    return trans + punct;
  });

  return capitalizeFirst(finalWords.join(' '));
}

/**
 * Universal Translate Function
 */
export function translateOffline(text, sourceLang = 'id') {
  if (sourceLang === 'id' || sourceLang === 'id-ID') {
    return translateIndonesianToEnglish(text);
  } else {
    return translateEnglishToIndonesian(text);
  }
}

// Helpers
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Speech Recognition Wrapper (STT)
 */
export class OfflineSpeechRecognition {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isSupported = !!SpeechRecognition;
    if (this.isSupported) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    } else {
      this.recognition = null;
    }
  }

  start({ lang = 'id-ID', onResult, onError, onEnd }) {
    if (!this.isSupported || !this.recognition) {
      if (onError) onError(new Error("Browser ini belum mendukung Web Speech Recognition."));
      return;
    }

    this.recognition.lang = lang;
    
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({
          final: finalTranscript,
          interim: interimTranscript
        });
      }
    };

    this.recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Speech recognition restart warning:", e);
    }
  }

  stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Stop speech recognition warning:", e);
      }
    }
  }
}

/**
 * Text-to-Speech (TTS) Synthesizer
 */
export function speakText(text, lang = 'en-US') {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported");
    return;
  }

  window.speechSynthesis.cancel(); // Stop current speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Local AI Assistant Bot Generator (Offline Knowledge & AI Conversational Partner)
 * Answers user questions in English and provides the Indonesian translation.
 */
export function generateLocalAiResponse(userQuery) {
  if (!userQuery) return { englishText: "I am ready to help you! Ask me anything.", indonesianText: "Saya siap membantu Anda! Tanyakan apa saja kepada saya." };

  const q = userQuery.toLowerCase().trim();

  // Greetings & Intros
  if (q.includes("halo") || q.includes("hai") || q.includes("hello") || q.includes("hi")) {
    return {
      englishText: "Hello there! It is wonderful to talk to you. How can I assist you with your English today?",
      indonesianText: "Halo di sana! Senang sekali bisa berbicara dengan Anda. Bagaimana saya bisa membantu Bahasa Inggris Anda hari ini?"
    };
  }

  if (q.includes("apa kabar") || q.includes("kabarmu") || q.includes("how are you")) {
    return {
      englishText: "I am doing fantastic, thank you for asking! How are you doing today?",
      indonesianText: "Saya merasa sangat luar biasa, terima kasih sudah bertanya! Bagaimana kabar Anda hari ini?"
    };
  }

  if (q.includes("siapa nama") || q.includes("namamu") || q.includes("who are you") || q.includes("your name")) {
    return {
      englishText: "I am your Local AI English Partner! I can answer your questions, practice conversations, and help you translate offline.",
      indonesianText: "Saya adalah Partner AI Bahasa Inggris Lokal Anda! Saya bisa menjawab pertanyaan Anda, berlatih percakapan, dan membantu Anda menerjemahkan secara offline."
    };
  }

  if (q.includes("hobi") || q.includes("hobby") || q.includes("suka apa")) {
    return {
      englishText: "I love learning languages, reading books, and helping people practice speaking English confidently!",
      indonesianText: "Saya suka belajar bahasa, membaca buku, dan membantu orang berlatih berbicara bahasa Inggris dengan percaya diri!"
    };
  }

  if (q.includes("makan") || q.includes("lapar") || q.includes("food") || q.includes("eat")) {
    return {
      englishText: "Indonesian food like Nasi Goreng and Rendang is world-famous and delicious! What is your favorite food?",
      indonesianText: "Makanan Indonesia seperti Nasi Goreng dan Rendang sangat terkenal di dunia dan lezat! Apa makanan favorit Anda?"
    };
  }

  if (q.includes("belajar") || q.includes("tips") || q.includes("cara") || q.includes("learn")) {
    return {
      englishText: "The secret to mastering English is daily consistency! Speak out loud every day and don't be afraid of making mistakes.",
      indonesianText: "Rahasia menguasai bahasa Inggris adalah konsistensi setiap hari! Berbicaralah dengan lantang setiap hari dan jangan takut membuat kesalahan."
    };
  }

  if (q.includes("terima kasih") || q.includes("makasih") || q.includes("thank")) {
    return {
      englishText: "You are very welcome! Keep up the amazing work in your learning journey.",
      indonesianText: "Sama-sama! Pertahankan kerja bagus Anda dalam perjalanan belajar ini."
    };
  }

  if (q.includes("dimana") || q.includes("where")) {
    return {
      englishText: "I am right here inside your browser, working completely offline to help you learn English anywhere!",
      indonesianText: "Saya ada di sini di dalam browser Anda, bekerja sepenuhnya offline untuk membantu Anda belajar bahasa Inggris di mana saja!"
    };
  }

  if (q.includes("cuaca") || q.includes("weather")) {
    return {
      englishText: "It looks like a great day to practice English together! Is it sunny or rainy where you are?",
      indonesianText: "Tampaknya hari yang menyenangkan untuk berlatih bahasa Inggris bersama! Apakah cerah atau hujan di tempat Anda?"
    };
  }

  // Dynamic fallback answer for general questions
  const translatedQuery = translateIndonesianToEnglish(userQuery);
  return {
    englishText: `That is an insightful question about "${translatedQuery}". I agree with your thought! Tell me more about what you think.`,
    indonesianText: `Itu adalah pertanyaan yang menarik tentang "${userQuery}". Saya setuju dengan pemikiran Anda! Ceritakan lebih banyak tentang apa yang Anda pikirkan.`
  };
}

/**
 * Unified AI Translator: Translates speech / text using active AI Provider (Gemini / Groq / Ollama / OpenAI)
 * Falls back gracefully to offline pattern dictionary if AI is offline or unavailable.
 */
export async function translateWithAI(text, sourceLangCode = 'id', targetLangCode = 'en') {
  if (!text || !text.trim()) return '';

  const cleanText = text.trim();
  const sourceIsIndonesian = sourceLangCode.startsWith('id');
  const fromLang = sourceIsIndonesian ? 'Bahasa Indonesia' : 'English';
  const toLang = sourceIsIndonesian ? 'English' : 'Bahasa Indonesia';

  try {
    const response = await aiProviderService.chatCompletion({
      systemPrompt: `You are an expert, fluent bilingual translator between ${fromLang} and ${toLang}. Output ONLY the direct translated sentence naturally and accurately. Do NOT include quotation marks, disclaimers, notes, or extra words.`,
      messages: [{ role: 'user', content: cleanText }],
      temperature: 0.1
    });

    if (response && response.content && response.content.trim()) {
      const translated = response.content.trim().replace(/^["'`]|["'`]$/g, '').trim();
      return {
        text: translated,
        source: `${response.providerName} (${response.modelUsed})`,
        isAiGenerated: true
      };
    }
  } catch (err) {
    console.warn('AI Translation unavailable, falling back to offline dictionary:', err);
  }

  // Graceful fallback to offline dictionary
  const fallback = translateOffline(cleanText, sourceIsIndonesian ? 'id' : 'en');
  return {
    text: fallback,
    source: 'Smart Offline Fallback',
    isAiGenerated: false
  };
}

/**
 * Unified AI Partner Bot: Generates conversational response using active AI Provider
 * Falls back gracefully to local heuristic answers if offline.
 */
export async function generateAiPartnerResponse(userQueryText) {
  if (!userQueryText || !userQueryText.trim()) {
    return generateLocalAiResponse('halo');
  }

  try {
    const response = await aiProviderService.chatCompletion({
      systemPrompt: `You are a supportive, friendly English conversation partner for an Indonesian student.
Respond naturally in English (1-2 sentences) to keep the conversation going, and provide the Indonesian translation.
STRICTLY return valid JSON with:
{
  "englishText": "Your natural spoken response in English",
  "indonesianText": "Arti kalimat tersebut dalam Bahasa Indonesia"
}`,
      messages: [{ role: 'user', content: userQueryText.trim() }],
      temperature: 0.5,
      jsonMode: true
    });

    if (response && response.content) {
      let clean = response.content.trim();
      if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(clean);
      if (parsed.englishText && parsed.indonesianText) {
        return {
          englishText: parsed.englishText.trim(),
          indonesianText: parsed.indonesianText.trim(),
          source: `${response.providerName} (${response.modelUsed})`
        };
      }
    }
  } catch (err) {
    console.warn('AI Partner chat failed, falling back to offline heuristics:', err);
  }

  return generateLocalAiResponse(userQueryText);
}


