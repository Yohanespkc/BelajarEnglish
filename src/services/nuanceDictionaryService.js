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
  },

  'raja': {
    query: 'raja',
    summary: 'Kata "raja" paling umum diterjemahkan sebagai "king", namun dalam konteks monarki formal, netral gender, atau kedaulatan negara, terdapat padanan yang jauh lebih presisi.',
    equivalents: [
      {
        word: 'king',
        ipa: '/kɪŋ/',
        partOfSpeech: 'Noun',
        formality: 'Umum & Tradisional',
        badge: 'MONARKI PRIA',
        nuanceExplanation: 'Padanan paling langsung dan umum untuk penguasa monarki pria turun-temurun yang memegang takhta dan mahkota.',
        whenToUse: 'Gunakan untuk raja pria dalam sejarah, dongeng, atau monarki saat ini (misal: King Charles). Untuk penguasa wanita gunakan "queen".',
        exampleSentenceEn: 'The king delivered a speech to his citizens from the palace.',
        exampleSentenceId: 'Raja menyampaikan pidato kepada rakyatnya dari istana.'
      },
      {
        word: 'monarch',
        ipa: '/ˈmɒn.ək/',
        partOfSpeech: 'Noun',
        formality: 'Formal & Ketatanegaraan',
        badge: 'KEPALA MONARKI (NETRAL GENDER)',
        nuanceExplanation: 'Istilah formal dan netral gender dalam ilmu politik/hukum untuk menyebut raja atau ratu yang memimpin suatu monarki.',
        whenToUse: 'Bagus untuk artikel berita resmi, dokumen hukum, esai sejarah, atau konstitusi (misal: constitutional monarch).',
        exampleSentenceEn: 'The United Kingdom is ruled by a constitutional monarch.',
        exampleSentenceId: 'Britania Raya dipimpin oleh seorang raja/monarki konstitusional.'
      },
      {
        word: 'sovereign',
        ipa: '/ˈsɒv.rɪn/',
        partOfSpeech: 'Noun / Adjective',
        formality: 'Tinggi & Diplomatik',
        badge: 'KEDAULATAN MUTLAK',
        nuanceExplanation: 'Menekankan kekuasaan dan otoritas tertinggi yang berdaulat, merdeka, dan tidak tunduk pada kekuasaan mana pun.',
        whenToUse: 'Dipakai saat membahas kedaulatan kekuasaan tertinggi atas suatu wilayah atau negara.',
        exampleSentenceEn: 'The sovereign held supreme authority over the entire realm.',
        exampleSentenceId: 'Penguasa berdaulat (raja) itu memegang otoritas tertinggi atas seluruh wilayah kekuasaan.'
      },
      {
        word: 'tycoon / mogul',
        ipa: '/taɪˈkuːn/ - /ˈməʊ.ɡəl/',
        partOfSpeech: 'Noun',
        formality: 'Bisnis & Jurnalistik',
        badge: 'FIGURATIF / RAJA BISNIS',
        nuanceExplanation: 'Makna kiasan/figuratif dalam bahasa Indonesia seperti "raja minyak", "raja properti", atau "raja media" yang menguasai pasar.',
        whenToUse: 'Jangan terjemahkan "raja minyak" sebagai "oil king". Gunakan "oil tycoon" atau "media mogul".',
        exampleSentenceEn: 'He made billions of dollars as a real estate tycoon.',
        exampleSentenceId: 'Dia menghasilkan miliaran dolar sebagai raja (konglomerat) properti.'
      }
    ],
    wordFamily: [
      { word: 'kingdom', ipa: '/ˈkɪŋ.dəm/', partOfSpeech: 'Noun', meaning: 'Kerajaan / wilayah kekuasaan raja' },
      { word: 'kingship', ipa: '/ˈkɪŋ.ʃɪp/', partOfSpeech: 'Noun', meaning: 'Kedudukan, martabat, atau masa jabatan seorang raja' },
      { word: 'royalty', ipa: '/ˈrɔɪ.əl.ti/', partOfSpeech: 'Noun', meaning: 'Keluarga kerajaan / kaum bangsawan / royalti' },
      { word: 'royal', ipa: '/ˈrɔɪ.əl/', partOfSpeech: 'Adjective', meaning: 'Berhubungan dengan raja atau kerajaan (Royal Family)' },
      { word: 'regal', ipa: '/ˈriː.ɡəl/', partOfSpeech: 'Adjective', meaning: 'Megah, agung, dan berwibawa laksana seorang raja' },
      { word: 'reign', ipa: '/reɪn/', partOfSpeech: 'Noun / Verb', meaning: 'Masa pemerintahan raja / memerintah sebagai raja' }
    ],
    synonyms: [
      { word: 'monarch', nuance: 'Penguasa monarki formal' },
      { word: 'sovereign', nuance: 'Penguasa berdaulat tertinggi' },
      { word: 'ruler', nuance: 'Pemimpin atau penguasa negeri' },
      { word: 'emperor', nuance: 'Kaisar (memimpin kekaisaran luas dengan banyak kerajaan)' }
    ],
    antonyms: [
      { word: 'subject', meaning: 'Rakyat jelata / warga yang diperintah oleh raja' },
      { word: 'commoner', meaning: 'Rakyat biasa (bukan keturunan bangsawan)' },
      { word: 'peasant', meaning: 'Petani kecil / rakyat jelata zaman feodal' },
      { word: 'servant', meaning: 'Pelayan / abdi' }
    ],
    commonMistakes: 'Sering salah: Mengartikan kiasan "raja minyak" sebagai "oil king" (salah). Yang benar dalam bahasa Inggris adalah "oil tycoon" atau "oil magnate".'
  },

  'pemimpin': {
    query: 'pemimpin',
    summary: 'Kata "pemimpin" memiliki spektrum kata dalam bahasa Inggris mulai dari inspirator (leader), atasan kerja (boss), penguasa wilayah (ruler), hingga kepala divisi (head/chief).',
    equivalents: [
      {
        word: 'leader',
        ipa: '/ˈliː.dər/',
        partOfSpeech: 'Noun',
        formality: 'Netral & Positif',
        badge: 'INSPIRATIF & VISIONER',
        nuanceExplanation: 'Sosok yang memimpin dengan teladan, integritas, dan visi. Berkonotasi positif dan dihormati sukarela oleh pengikutnya.',
        whenToUse: 'Bagus untuk pemimpin negara, teladan masyarakat, atau kapten tim olahraga.',
        exampleSentenceEn: 'A true leader inspires others to dream more, learn more, and do more.',
        exampleSentenceId: 'Seorang pemimpin sejati menginspirasi orang lain untuk bermimpi lebih banyak, belajar lebih banyak, dan berbuat lebih banyak.'
      },
      {
        word: 'boss',
        ipa: '/bɒs/',
        partOfSpeech: 'Noun',
        formality: 'Percakapan Harian',
        badge: 'ATASAN KERJA',
        nuanceExplanation: 'Merujuk pada atasan langsung di kantor yang memberi tugas atau menggaji karyawan. Kadang terkesan otoriter ("bossy").',
        whenToUse: 'Percakapan santai seputar pekerjaan kantor: "My boss approved my leave".',
        exampleSentenceEn: 'I need to discuss the new project timeline with my boss tomorrow.',
        exampleSentenceId: 'Saya perlu mendiskusikan jadwal proyek baru dengan bos/atasan saya besok.'
      },
      {
        word: 'chief / head',
        ipa: '/tʃiːf/ - /hed/',
        partOfSpeech: 'Noun',
        formality: 'Formal & Organisasi',
        badge: 'KEPALA BAGIAN / SUKU',
        nuanceExplanation: 'Pemimpin tertinggi dalam divisi, dewan eksekutif (CEO - Chief Executive Officer), atau kepala adat.',
        whenToUse: 'Gunakan dalam struktur organisasi jabatan resmi: "Head of Marketing", "Police Chief".',
        exampleSentenceEn: 'She was appointed as the new head of the research department.',
        exampleSentenceId: 'Dia diangkat sebagai kepala baru departemen penelitian.'
      }
    ],
    wordFamily: [
      { word: 'leadership', ipa: '/ˈliː.də.ʃɪp/', partOfSpeech: 'Noun', meaning: 'Kepemimpinan / jiwa kepemimpinan' },
      { word: 'lead', ipa: '/liːd/', partOfSpeech: 'Verb', meaning: 'Memimpin / mengarahkan jalan' },
      { word: 'leading', ipa: '/ˈliː.dɪŋ/', partOfSpeech: 'Adjective', meaning: 'Terkemuka / unggulan / terdepan' }
    ],
    synonyms: [
      { word: 'guide', nuance: 'Penuntun / pemandu arah' },
      { word: 'director', nuance: 'Pengarah / direktur pelaksana' },
      { word: 'commander', nuance: 'Komandan (militer/pasukan)' }
    ],
    antonyms: [
      { word: 'follower', meaning: 'Pengikut / bawahan yang mengikuti' },
      { word: 'subordinate', meaning: 'Bawahan langsung' }
    ],
    commonMistakes: 'Perbedaan konotasi: "Leader" memimpin dengan teladan dan empati, sedangkan "Boss" memimpin berdasarkan jabatan kekuasaan formal.'
  }
};

export const QUICK_SUGGESTION_WORDS = [
  { word: 'raja', hint: 'king vs monarch vs sovereign vs tycoon' },
  { word: 'manusia', hint: 'human vs man vs person vs mankind' },
  { word: 'rajin', hint: 'diligent vs hardworking vs studious' },
  { word: 'sukses', hint: 'successful vs succeed vs thrive' },
  { word: 'pemimpin', hint: 'leader vs boss vs chief' },
  { word: 'adil', hint: 'fair vs just vs impartial' },
  { word: 'marah', hint: 'angry vs furious vs annoyed' },
  { word: 'sulit', hint: 'difficult vs hard vs tough' }
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
      const systemPrompt = `You are an expert Bilingual Lexicographer and English-Indonesian Translator.
The user will provide ONE Indonesian word (for example: "${cleanWord}").
Your goal is to give a comprehensive English thesaurus breakdown with clear nuanced differences in Indonesian.

Return STRICTLY valid JSON with these EXACT keys:
{
  "query": "${cleanWord}",
  "summary": "Penjelasan ringkas 1-2 kalimat dalam bahasa Indonesia mengenai padanan kata ini.",
  "equivalents": [
    {
      "word": "English word (e.g. king, monarch, etc.)",
      "ipa": "/IPA phonetic/",
      "partOfSpeech": "Noun / Verb / Adjective",
      "formality": "Formal / Informal / Sastra",
      "badge": "CIRIKHAS UTAMA",
      "nuanceExplanation": "Penjelasan nuansa dan rasa bahasa dalam bahasa Indonesia.",
      "whenToUse": "Kapan tepatnya kata ini digunakan.",
      "exampleSentenceEn": "Contoh kalimat bahasa Inggris.",
      "exampleSentenceId": "Arti contoh kalimat dalam bahasa Indonesia."
    }
  ],
  "wordFamily": [
    {
      "word": "kata turunan",
      "ipa": "/IPA/",
      "partOfSpeech": "Noun/Adj/Verb/Adv",
      "meaning": "Arti kata turunan dalam bahasa Indonesia"
    }
  ],
  "synonyms": [
    {
      "word": "English synonym",
      "nuance": "Nuansa pemakaiannya"
    }
  ],
  "antonyms": [
    {
      "word": "English antonym",
      "meaning": "Arti lawan kata"
    }
  ],
  "commonMistakes": "Tips kesalahan umum orang Indonesia saat memakai kata ini."
}`;

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

  // Parse JSON safely from AI output with smart normalization
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
        return this.normalizeParsedResult(parsed, originalWord);
      } catch (e) {
        console.warn('Failed to parse AI JSON, attempting recovery:', e);
      }
    }

    return this.generateDynamicFallback(originalWord);
  },

  // Normalize parsed result to support both English and Indonesian schema keys
  normalizeParsedResult(parsed, originalWord) {
    let equivalents = [];

    // Check English schema 'equivalents'
    if (Array.isArray(parsed.equivalents) && parsed.equivalents.length > 0) {
      equivalents = parsed.equivalents.map(item => ({
        word: item.word || item.kata || '',
        ipa: item.ipa || item.fonetik || '',
        partOfSpeech: item.partOfSpeech || item.jenis_kata || 'Noun',
        formality: item.formality || item.formalitas || 'Netral',
        badge: item.badge || item.label || 'PADANAN KATA',
        nuanceExplanation: item.nuanceExplanation || item.nuansa || item.penjelasan || '',
        whenToUse: item.whenToUse || item.kapan_dipakai || item.penggunaan || '',
        exampleSentenceEn: item.exampleSentenceEn || item.contoh_penggunaan || item.contoh_kalimat || '',
        exampleSentenceId: item.exampleSentenceId || item.contoh_arti || item.terjemahan || ''
      }));
    } else if (Array.isArray(parsed.analisis_nuansa) && parsed.analisis_nuansa.length > 0) {
      // Check Indonesian schema 'analisis_nuansa'
      equivalents = parsed.analisis_nuansa.map(item => ({
        word: item.kata || item.word || '',
        ipa: item.ipa || item.fonetik || '',
        partOfSpeech: item.partOfSpeech || item.jenis_kata || 'Noun',
        formality: item.formality || item.formalitas || 'Formal',
        badge: item.badge || item.label || 'PADANAN KATA',
        nuanceExplanation: item.nuansa || item.nuanceExplanation || item.penjelasan || '',
        whenToUse: item.whenToUse || item.kapan_dipakai || item.penggunaan || '',
        exampleSentenceEn: item.contoh_penggunaan || item.exampleSentenceEn || item.contoh_kalimat || '',
        exampleSentenceId: item.contoh_arti || item.exampleSentenceId || item.terjemahan || ''
      }));
    } else if (parsed.padanan_utama && typeof parsed.padanan_utama === 'object') {
      // Check dictionary schema
      Object.entries(parsed.padanan_utama).forEach(([k, v]) => {
        const words = Array.isArray(v) ? v : [v];
        words.forEach(w => {
          equivalents.push({
            word: String(w),
            ipa: '',
            partOfSpeech: 'Noun',
            formality: k,
            badge: k.toUpperCase(),
            nuanceExplanation: `Padanan kata dalam nuansa ${k}.`,
            whenToUse: `Digunakan saat mengekspresikan makna ${originalWord} dalam konteks ${k}.`,
            exampleSentenceEn: `The ${w} is recognized for this quality.`,
            exampleSentenceId: `Hal tersebut diakui dalam konteks ini.`
          });
        });
      });
    }

    // Word family normalization
    let wordFamily = [];
    if (Array.isArray(parsed.wordFamily) && parsed.wordFamily.length > 0) {
      wordFamily = parsed.wordFamily.map(wf => ({
        word: wf.word || wf.istilah || wf.kata || '',
        ipa: wf.ipa || '',
        partOfSpeech: wf.partOfSpeech || wf.jenis_kata || 'Word',
        meaning: wf.meaning || wf.arti || wf.makna || ''
      }));
    } else if (parsed.turunan_kata_dan_frasa && typeof parsed.turunan_kata_dan_frasa === 'object') {
      Object.entries(parsed.turunan_kata_dan_frasa).forEach(([posKey, items]) => {
        if (Array.isArray(items)) {
          items.forEach(it => {
            if (typeof it === 'object') {
              wordFamily.push({
                word: it.istilah || it.kata || it.frasa || it.word || '',
                ipa: it.ipa || '',
                partOfSpeech: posKey.replace(/_/g, ' '),
                meaning: it.arti || it.makna || it.meaning || ''
              });
            } else {
              wordFamily.push({
                word: String(it),
                ipa: '',
                partOfSpeech: posKey.replace(/_/g, ' '),
                meaning: `Bentuk ${posKey}`
              });
            }
          });
        }
      });
    }

    // Synonyms normalization
    let synonyms = [];
    const rawSyn = parsed.synonyms || parsed.sinonim_bahasa_inggris || parsed.sinonim || [];
    if (Array.isArray(rawSyn)) {
      synonyms = rawSyn.map(s => {
        if (typeof s === 'object') {
          return { word: s.word || s.kata || '', nuance: s.nuance || s.nuansa || s.arti || '' };
        }
        return { word: String(s), nuance: 'Kata serupa' };
      });
    }

    // Antonyms normalization
    let antonyms = [];
    const rawAnt = parsed.antonyms || parsed.antonim_bahasa_inggris || parsed.antonim || [];
    if (Array.isArray(rawAnt)) {
      antonyms = rawAnt.map(a => {
        if (typeof a === 'object') {
          return { word: a.word || a.kata || '', meaning: a.meaning || a.arti || a.makna || '' };
        }
        return { word: String(a), meaning: 'Lawan kata' };
      });
    }

    if (equivalents.length === 0) {
      return this.generateDynamicFallback(originalWord);
    }

    return {
      query: originalWord,
      summary: parsed.summary || parsed.ringkasan || `Padanan bahasa Inggris untuk "${originalWord}" memiliki berbagai nuansa sesuai konteks kalimat.`,
      equivalents,
      wordFamily,
      synonyms,
      antonyms,
      commonMistakes: parsed.commonMistakes || parsed.kesalahan_umum || parsed.tips || ''
    };
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
