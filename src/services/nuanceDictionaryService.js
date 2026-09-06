/**
 * Nuance Dictionary Service (Kamus Padanan & Nuansa Kata ID ➔ EN)
 * Translates Indonesian words into English with deep linguistic nuances,
 * comparative choices (e.g. human vs man, diligent vs hardworking),
 * synonyms, antonyms, word families, and practical example sentences.
 */

import { aiProviderService } from './aiProviderService';

// Built-in lexical database for instant offline access and fast fallbacks
export const BUILTIN_WORD_DATABASE = {
  'manusia': {
    query: 'manusia',
    summary: 'Dalam bahasa Inggris, kata "manusia" memiliki beberapa padanan tergantung konteks biologis, sosial, gender, maupun filosofis.',
    equivalents: [
      {
        word: 'human',
        ipa: '/ˈhjuː.mən/',
        partOfSpeech: 'Noun / Adjective',
        formality: 'Netral & Ilmiah',
        badge: 'SPESIES & KEMANUSIAAN',
        nuanceExplanation: 'Merujuk pada manusia sebagai spesies biologis (Homo sapiens) atau sifat dasar manusiawi, bukan hewan atau mesin.',
        whenToUse: 'Dipakai dalam konteks sains, hak asasi (human rights), sifat manusiawi ("to err is human"), atau saat membedakan dengan binatang/AI.',
        exampleSentenceEn: 'Every human has the right to live freely and safely.',
        exampleSentenceId: 'Setiap manusia berhak hidup bebas dan aman.'
      },
      {
        word: 'man',
        ipa: '/mæn/',
        partOfSpeech: 'Noun',
        formality: 'Umum / Tradisional',
        badge: 'PRIA DEWASA / LITERATUR',
        nuanceExplanation: 'Secara harfiah berarti "pria/laki-laki dewasa". Namun dalam teks klasik, sastra, atau pepatah kuno, sering dipakai bermakna "umat manusia" secara umum.',
        whenToUse: 'Gunakan untuk laki-laki dewasa. Hindari memakai "man" untuk "manusia secara umum" dalam konteks modern resmi agar inklusif gender.',
        exampleSentenceEn: 'He is a kind and honest man.',
        exampleSentenceId: 'Dia adalah pria yang baik hati dan jujur.'
      },
      {
        word: 'person / people',
        ipa: '/ˈpɜː.sən/ - /ˈpiː.pəl/',
        partOfSpeech: 'Noun',
        formality: 'Percakapan Harian',
        badge: 'INDIVIDU & ORANG',
        nuanceExplanation: 'Paling natural digunakan saat merujuk pada manusia sebagai individu atau anggota masyarakat dalam kehidupan sehari-hari.',
        whenToUse: 'Gunakan "person" untuk satu orang dan "people" untuk banyak orang (manusia sebagai makhluk sosial sehari-hari).',
        exampleSentenceEn: 'She is the most inspiring person I have ever met.',
        exampleSentenceId: 'Dia adalah manusia/orang paling menginspirasi yang pernah saya temui.'
      },
      {
        word: 'mankind',
        ipa: '/mænˈkaɪnd/',
        partOfSpeech: 'Noun',
        formality: 'Sastra & Sejarah',
        badge: 'UMAT MANUSIA',
        nuanceExplanation: 'Merujuk pada seluruh umat manusia secara kolektif dari awal sejarah hingga masa depan peradaban.',
        whenToUse: 'Biasa ditemukan dalam pidato bersejarah, pencapaian luar angkasa, atau filsafat peradaban.',
        exampleSentenceEn: 'That is one small step for man, one giant leap for mankind.',
        exampleSentenceId: 'Itu adalah satu langkah kecil bagi manusia, satu lompatan raksasa bagi umat manusia.'
      }
    ],
    wordFamily: [
      { word: 'humanity', ipa: '/hjuːˈmæn.ə.ti/', partOfSpeech: 'Noun', meaning: 'Kemanusiaan / umat manusia secara keseluruhan' },
      { word: 'humanitarian', ipa: '/hjuːˌmæn.ɪˈteə.ri.ən/', partOfSpeech: 'Adjective / Noun', meaning: 'Kemanusiaan / aktivis pembela kemanusiaan' },
      { word: 'humane', ipa: '/hjuːˈmeɪn/', partOfSpeech: 'Adjective', meaning: 'Berperikemanusiaan, penuh kasih sayang & adil' },
      { word: 'humanize', ipa: '/ˈhjuː.mə.naɪz/', partOfSpeech: 'Verb', meaning: 'Memanusiakan / membuat sesuatu lebih manusiawi' },
      { word: 'inhumane', ipa: '/ˌɪn.hjuːˈmeɪn/', partOfSpeech: 'Adjective', meaning: 'Tidak berperikemanusiaan / kejam luar biasa' }
    ],
    synonyms: [
      { word: 'individual', nuance: 'Individu tunggal' },
      { word: 'mortal', nuance: 'Makhluk fana yang bisa meninggal' },
      { word: 'fellow', nuance: 'Sesama manusia' }
    ],
    antonyms: [
      { word: 'animal / beast', meaning: 'Hewan / binatang buas' },
      { word: 'machine / robot', meaning: 'Mesin / kecerdasan buatan' },
      { word: 'deity / god', meaning: 'Tuhan / makhluk abadi' }
    ],
    commonMistakes: 'Sering salah: Menggunakan "man" untuk merujuk pada "manusia" di esai modern. Disarankan menggunakan "human" atau "people" agar lebih netral dan akurat.'
  },

  'rajin': {
    query: 'rajin',
    summary: 'Kata "rajin" dalam bahasa Inggris memiliki banyak variasi tergantung apakah rajin belajar, pekerja keras, teliti, atau produktif.',
    equivalents: [
      {
        word: 'diligent',
        ipa: '/ˈdɪl.ɪ.dʒənt/',
        partOfSpeech: 'Adjective',
        formality: 'Formal & Akademik',
        badge: 'TEKUN & TELITI',
        nuanceExplanation: 'Menunjukkan kerajinan yang diiringi ketelitian, kehati-hatian, dan konsistensi terus-menerus tanpa mudah menyerah.',
        whenToUse: 'Bagus untuk pekerjaan detail, riset, tugas sekolah, atau karyawan yang telaten.',
        exampleSentenceEn: 'Thanks to his diligent practice, he passed the English exam with flying colors.',
        exampleSentenceId: 'Berkat latihannya yang rajin dan tekun, dia lulus ujian bahasa Inggris dengan nilai sempurna.'
      },
      {
        word: 'hardworking',
        ipa: '/ˌhɑːdˈwɜː.kɪŋ/',
        partOfSpeech: 'Adjective',
        formality: 'Umum & Profesional',
        badge: 'PEKERJA KERAS',
        nuanceExplanation: 'Menekankan usaha keras, stamina tinggi, dan dedikasi waktu untuk menyelesaikan tugas berat.',
        whenToUse: 'Paling sering digunakan dalam CV/resume kerja atau memuji orang yang tidak kenal lelah bekerja.',
        exampleSentenceEn: 'She is a hardworking mother who always supports her children.',
        exampleSentenceId: 'Dia adalah seorang ibu yang sangat rajin dan pekerja keras yang selalu mendukung anak-anaknya.'
      },
      {
        word: 'studious',
        ipa: '/ˈstjuː.di.əs/',
        partOfSpeech: 'Adjective',
        formality: 'Akademik',
        badge: 'RAJIN BELAJAR / BUKU',
        nuanceExplanation: 'Khusus ditujukan untuk orang yang rajin membaca, gemar belajar, dan banyak menghabiskan waktu dengan buku.',
        whenToUse: 'Gunakan ketika menggambarkan siswa/mahasiswa yang rajin dan kutu buku.',
        exampleSentenceEn: 'The studious boy spent his entire weekend at the library.',
        exampleSentenceId: 'Anak laki-laki yang rajin belajar itu menghabiskan seluruh akhir pekannya di perpustakaan.'
      },
      {
        word: 'industrious',
        ipa: '/ɪnˈdʌs.tri.əs/',
        partOfSpeech: 'Adjective',
        formality: 'Formal & Sastra',
        badge: 'PRODUKTIF & CEKATAN',
        nuanceExplanation: 'Rajin yang produktif dan selalu aktif menghasilkan karya atau memecahkan masalah tanpa buang waktu.',
        whenToUse: 'Dipakai untuk memuji komunitas, tim, atau individu yang sangat giat berkarya.',
        exampleSentenceEn: 'The villagers are known to be industrious and resourceful.',
        exampleSentenceId: 'Penduduk desa itu dikenal rajin, giat berkarya, dan banyak akal.'
      }
    ],
    wordFamily: [
      { word: 'diligence', ipa: '/ˈdɪl.ɪ.dʒəns/', partOfSpeech: 'Noun', meaning: 'Ketekunan / kerajinan' },
      { word: 'diligently', ipa: '/ˈdɪl.ɪ.dʒənt.li/', partOfSpeech: 'Adverb', meaning: 'Dengan rajin dan tekun' },
      { word: 'industry', ipa: '/ˈɪn.dəs.tri/', partOfSpeech: 'Noun', meaning: 'Kerajinan / kegigihan (arti sekunder di samping perindustrian)' },
      { word: 'industriously', ipa: '/ɪnˈdʌs.tri.əs.li/', partOfSpeech: 'Adverb', meaning: 'Secara giat dan produktif' }
    ],
    synonyms: [
      { word: 'assiduous', nuance: 'Sangat tekun dan penuh perhatian (sangat formal)' },
      { word: 'persistent', nuance: 'Gigih dan tidak gampang menyerah' },
      { word: 'conscientious', nuance: 'Bertanggung jawab dan berhati-hati' }
    ],
    antonyms: [
      { word: 'lazy / slothful', meaning: 'Malas / pemalas' },
      { word: 'idle', meaning: 'Menganggur / tidak melakukan apa-apa' },
      { word: 'negligent', meaning: 'Lalai / ceroboh' }
    ],
    commonMistakes: 'Sering salah: Mengatakan "He is hardwork" (salah karena hard work adalah kata benda). Yang benar: "He is hardworking" (kata sifat).'
  },

  'sukses': {
    query: 'sukses',
    summary: 'Kata "sukses" bisa berupa kata kerja (succeed), kata sifat (successful), atau kata benda (success).',
    equivalents: [
      {
        word: 'successful',
        ipa: '/səkˈses.fəl/',
        partOfSpeech: 'Adjective',
        formality: 'Umum & Bisnis',
        badge: 'BERHASIL / SUKSES',
        nuanceExplanation: 'Menjelaskan keadaan seseorang atau proyek yang telah mencapai tujuan gemilang.',
        whenToUse: 'Biasa digunakan dengan to be: "He is successful".',
        exampleSentenceEn: 'She runs a very successful tech startup.',
        exampleSentenceId: 'Dia menjalankan perusahaan rintisan teknologi yang sangat sukses.'
      },
      {
        word: 'succeed',
        ipa: '/səkˈsiːd/',
        partOfSpeech: 'Verb',
        formality: 'Umum & Formal',
        badge: 'BERHASIL (KATA KERJA)',
        nuanceExplanation: 'Merupakan aksi tindakan berhasil melakukan sesuatu (diikuti kata depan "in").',
        whenToUse: 'Gunakan ketika ingin menyatakan perbuatan: "succeed in doing something".',
        exampleSentenceEn: 'If you work consistently, you will succeed.',
        exampleSentenceId: 'Jika kamu bekerja secara konsisten, kamu akan berhasil/sukses.'
      },
      {
        word: 'thriving / prosperous',
        ipa: '/ˈθraɪ.vɪŋ/ - /ˈprɒs.pər.əs/',
        partOfSpeech: 'Adjective',
        formality: 'Tinggi & Ekonomi',
        badge: 'MAKMUR & BERKEMBANG PESAT',
        nuanceExplanation: 'Sukses yang terus bertumbuh subur, makmur, dan menghasilkan banyak keuntungan.',
        whenToUse: 'Sangat cocok untuk bisnis, ekonomi negara, atau karier yang sedang di puncak kejayaan.',
        exampleSentenceEn: 'The company built a thriving business model.',
        exampleSentenceId: 'Perusahaan tersebut membangun model bisnis yang berkembang sukses dan makmur.'
      }
    ],
    wordFamily: [
      { word: 'success', ipa: '/səkˈses/', partOfSpeech: 'Noun', meaning: 'Kesuksesan / keberhasilan' },
      { word: 'successfully', ipa: '/səkˈses.fəl.i/', partOfSpeech: 'Adverb', meaning: 'Dengan sukses / secara berhasil' },
      { word: 'succession', ipa: '/səkˈseʃ.ən/', partOfSpeech: 'Noun', meaning: 'Suksesi / pergantian kepemimpinan' }
    ],
    synonyms: [
      { word: 'triumphant', nuance: 'Menang gemilang' },
      { word: 'victorious', nuance: 'Berjaya menaklukkan rintangan' },
      { word: 'fruitful', nuance: 'Membuahkan hasil memuaskan' }
    ],
    antonyms: [
      { word: 'fail / failure', meaning: 'Gagal / kegagalan' },
      { word: 'unsuccessful', meaning: 'Tidak berhasil' },
      { word: 'fiasco', meaning: 'Kegagalan total yang memalukan' }
    ],
    commonMistakes: 'Sering salah: "I want to success" (salah, success adalah kata benda). Yang benar: "I want to succeed" (kata kerja).'
  }
};

export const QUICK_SUGGESTION_WORDS = [
  { word: 'manusia', hint: 'human vs man vs person' },
  { word: 'rajin', hint: 'diligent vs hardworking vs studious' },
  { word: 'sukses', hint: 'successful vs succeed vs thrive' },
  { word: 'adil', hint: 'fair vs just vs impartial' },
  { word: 'marah', hint: 'angry vs furious vs annoyed' },
  { word: 'pemimpin', hint: 'leader vs boss vs ruler' },
  { word: 'sulit', hint: 'difficult vs hard vs tough' },
  { word: 'senang', hint: 'happy vs glad vs delighted' }
];

export const nuanceDictionaryService = {
  // Search word nuance & equivalents
  async searchWordNuances(indonesianWord) {
    const cleanWord = (indonesianWord || '').trim().toLowerCase();
    if (!cleanWord) {
      throw new Error('Masukkan satu kata bahasa Indonesia.');
    }

    // 1. Check if exact match exists in built-in offline database
    if (BUILTIN_WORD_DATABASE[cleanWord]) {
      return {
        success: true,
        data: BUILTIN_WORD_DATABASE[cleanWord],
        source: 'Database Leksikal Terverifikasi',
        isAiGenerated: false
      };
    }

    // 2. Query AI (Google Gemini, Groq, or active provider)
    try {
      const systemPrompt = `You are a world-class Bilingual Lexicographer, Etymologist, and English-Indonesian Translator.
The user will provide ONE Indonesian word (for example: "${cleanWord}").
Your goal is to give a comprehensive, nuanced English thesaurus breakdown in clear Indonesian so the user knows EXACTLY which English word to choose in any situation.

Return STRICTLY valid JSON matching this schema:
{
  "query": "${cleanWord}",
  "summary": "Penjelasan ringkas 1-2 kalimat dalam bahasa Indonesia mengenai berbagai spektrum padanan kata ini dalam bahasa Inggris.",
  "equivalents": [
    {
      "word": "kata bahasa Inggris",
      "ipa": "/fonetik IPA/",
      "partOfSpeech": "Noun / Verb / Adjective / Adverb",
      "formality": "Netral / Formal / Percakapan Sehari-hari / Sastra / Slang",
      "badge": "LABEL SINGKAT CIRI UTAMA (misal: SPESIES BIOLOGIS, KETELITIAN, PEKERJA KERAS)",
      "nuanceExplanation": "Penjelasan mendalam dalam bahasa Indonesia kapan kata ini dipakai dan apa rasa bahasanya dibandingkan kata lainnya.",
      "whenToUse": "Situasi atau konteks paling tepat menggunakan kata ini.",
      "exampleSentenceEn": "Contoh kalimat alami dalam bahasa Inggris menggunakan kata ini.",
      "exampleSentenceId": "Terjemahan contoh kalimat dalam bahasa Indonesia."
    }
  ],
  "wordFamily": [
    {
      "word": "kata turunan",
      "ipa": "/fonetik/",
      "partOfSpeech": "Noun/Adj/Verb/Adv",
      "meaning": "Arti kata turunan dalam bahasa Indonesia"
    }
  ],
  "synonyms": [
    {
      "word": "sinonim EN",
      "nuance": "Nuansa atau konteks pemakaiannya dalam bahasa Indonesia"
    }
  ],
  "antonyms": [
    {
      "word": "lawan kata EN",
      "meaning": "Arti lawan kata dalam bahasa Indonesia"
    }
  ],
  "commonMistakes": "Tips kesalahan umum orang Indonesia saat menggunakan kata-kata tersebut dalam bahasa Inggris (misal perbedaan part of speech atau false friends)."
}

Provide at least 3-4 distinct English equivalents with clear nuanced differences, at least 4 word family derivatives, at least 3 synonyms, and at least 3 antonyms. No markdown outside JSON.`;

      const response = await aiProviderService.chatCompletion({
        systemPrompt,
        messages: [
          { role: 'user', content: `Analisis padanan kata, nuansa, sinonim, antonim, dan turunan kata bahasa Inggris untuk kata Indonesia ini: "${cleanWord}"` }
        ],
        temperature: 0.25,
        jsonMode: true
      });

      const parsed = this.parseJsonSafely(response.content, cleanWord);
      return {
        success: true,
        data: parsed,
        source: `${response.providerName} (${response.modelUsed})`,
        isAiGenerated: true
      };
    } catch (err) {
      console.warn('AI Nuance dictionary query failed, generating dynamic fallback:', err);
      return {
        success: true,
        data: this.generateDynamicFallback(cleanWord),
        source: 'Smart Offline Fallback',
        isAiGenerated: false,
        warning: `AI (${err.message || 'Offline'}). Menampilkan hasil leksikal dasar.`
      };
    }
  },

  // Parse JSON safely from AI output
  parseJsonSafely(rawContent, originalWord) {
    let clean = (rawContent || '').trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed.equivalents) && parsed.equivalents.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse AI JSON:', e);
      }
    }

    return this.generateDynamicFallback(originalWord);
  },

  // Dynamic fallback when AI is unreachable
  generateDynamicFallback(word) {
    const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
    return {
      query: word,
      summary: `Padanan kata bahasa Inggris untuk "${word}" memiliki nuansa yang bervariasi sesuai konteks kalimat.`,
      equivalents: [
        {
          word: `${word} (general)`,
          ipa: '/.../',
          partOfSpeech: 'Noun / Adjective',
          formality: 'Netral',
          badge: 'UMUM',
          nuanceExplanation: `Kata ini adalah padanan umum dalam bahasa Inggris untuk menyatakan makna ${word}.`,
          whenToUse: 'Bisa dipakai dalam situasi percakapan umum.',
          exampleSentenceEn: `This is an example sentence for ${word}.`,
          exampleSentenceId: `Ini adalah contoh kalimat untuk ${word}.`
        }
      ],
      wordFamily: [
        { word: `${word}ness`, ipa: '', partOfSpeech: 'Noun', meaning: `Karakteristik atau keadaan ${word}` }
      ],
      synonyms: [
        { word: 'similar term', nuance: 'Konteks mirip' }
      ],
      antonyms: [
        { word: 'opposite term', meaning: 'Kebalikan' }
      ],
      commonMistakes: 'Perhatikan apakah kata yang digunakan berfungsi sebagai kata sifat (adjective), kata benda (noun), atau kata kerja (verb).'
    };
  }
};
