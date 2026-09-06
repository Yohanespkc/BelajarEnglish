/**
 * Nuance Dictionary Service (Kamus Padanan & Nuansa Kata ID ➔ EN)
 * Translates Indonesian words into English with deep linguistic nuances,
 * comparative choices (e.g. human vs man, diligent vs hardworking),
 * synonyms, antonyms, word families, and practical example sentences.
 */

import { aiProviderService } from './aiProviderService';
import { translateOffline } from './localTranslatorService';

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
  },

  'ratu': {
    query: 'ratu',
    summary: 'Kata "ratu" dalam bahasa Inggris paling umum dipadankan dengan "queen", namun terdapat perbedaan penting antara ratu yang berkuasa mutlak (queen regnant), permaisuri (queen consort), kaisar wanita (empress), hingga kiasan (diva/queen bee).',
    equivalents: [
      {
        word: 'queen',
        ipa: '/kwiːn/',
        partOfSpeech: 'Noun',
        formality: 'Netral / Formal',
        badge: 'RATU PENGUASA / PERMAISURI',
        nuanceExplanation: 'Padanan standar paling umum untuk penguasa wanita suatu kerajaan atau istri dari raja yang sedang berkuasa.',
        whenToUse: 'Dapat digunakan untuk monarki wanita berdaulat (Queen Elizabeth) maupun catur dan kartu remi.',
        exampleSentenceEn: 'Queen Elizabeth II was the longest-reigning monarch in British history.',
        exampleSentenceId: 'Ratu Elizabeth II adalah monarki dengan masa tahta terlama dalam sejarah Inggris.'
      },
      {
        word: 'queen regnant',
        ipa: '/kwiːn ˈreɪɡ.nənt/',
        partOfSpeech: 'Noun',
        formality: 'Sangat Formal / Sejarah',
        badge: 'RATU BERDAULAT SENDIRI',
        nuanceExplanation: 'Ratu yang memerintah dan memegang kekuasaan monarki atas haknya sendiri (bukan hanya berstatus sebagai istri raja).',
        whenToUse: 'Gunakan dalam konteks politik formal atau sejarah untuk membedakan dari permaisuri.',
        exampleSentenceEn: 'She ruled the country as a queen regnant with absolute authority.',
        exampleSentenceId: 'Dia memerintah negeri itu sebagai ratu berdaulat dengan wewenang mutlak.'
      },
      {
        word: 'queen consort',
        ipa: '/kwiːn ˈkɒn.sɔːt/',
        partOfSpeech: 'Noun',
        formality: 'Formal / Protokol Istana',
        badge: 'PERMAISURI (ISTRI RAJA)',
        nuanceExplanation: 'Istri sah dari raja yang sedang bertahta, yang menyandang gelar ratu tetapi wewenang konstitusional ada pada suaminya.',
        whenToUse: 'Konteks keluarga kerajaan formal untuk membedakan istri raja (misal: Queen Camilla).',
        exampleSentenceEn: 'Camilla officially received the title of Queen Consort.',
        exampleSentenceId: 'Camilla secara resmi menerima gelar Ratu Permaisuri (Queen Consort).'
      },
      {
        word: 'empress',
        ipa: '/ˈem.prəs/',
        partOfSpeech: 'Noun',
        formality: 'Formal / Sejarah',
        badge: 'KAISAR WANITA',
        nuanceExplanation: 'Pemimpin wanita sebuah kekaisaran (empire) yang posisinya secara hierarki lebih luas daripada ratu kerajaan biasa.',
        whenToUse: 'Konteks kekaisaran seperti Kekaisaran Romawi Suci, Tiongkok kuno, atau Jepang.',
        exampleSentenceEn: 'The Empress Wu Zetian was the sole female sovereign of imperial China.',
        exampleSentenceId: 'Kaisar Wanita Wu Zetian adalah satu-satunya penguasa wanita di era kekaisaran Tiongkok.'
      },
      {
        word: 'queen bee / diva',
        ipa: '/kwiːn biː/ - /ˈdiː.və/',
        partOfSpeech: 'Noun (Informal)',
        formality: 'Kiasan / Gaul',
        badge: 'RATU GAUL / PANGGUNG',
        nuanceExplanation: 'Dipakai secara figuratif untuk wanita yang menjadi pusat perhatian, pemimpin kelompok pergaulan, atau "ratu panggung".',
        whenToUse: 'Percakapan kasual sehari-hari atau dunia hiburan musik/fesyen.',
        exampleSentenceEn: 'She is widely acclaimed as the pop music diva of this generation.',
        exampleSentenceId: 'Dia diakui luas sebagai diva (ratu panggung) musik pop generasi ini.'
      }
    ],
    wordFamily: [
      { word: 'queenship', ipa: '/ˈkwiːn.ʃɪp/', partOfSpeech: 'Noun', meaning: 'Kedudukan atau martabat seorang ratu' },
      { word: 'queenly', ipa: '/ˈkwiːn.li/', partOfSpeech: 'Adjective', meaning: 'Anggun dan agung laksana seorang ratu' },
      { word: 'royalty', ipa: '/ˈrɔɪ.əl.ti/', partOfSpeech: 'Noun', meaning: 'Keluarga kerajaan / kaum bangsawan' },
      { word: 'reign', ipa: '/reɪn/', partOfSpeech: 'Verb / Noun', meaning: 'Bertahta / masa pemerintahan' }
    ],
    synonyms: [
      { word: 'monarch', nuance: 'Kepala monarki formal (bisa ratu atau raja)' },
      { word: 'sovereign', nuance: 'Penguasa berkedaulatan tinggi' },
      { word: 'ruler', nuance: 'Pemimpin atau penguasa' }
    ],
    antonyms: [
      { word: 'king', meaning: 'Raja (pasangan monarki pria)' },
      { word: 'commoner', meaning: 'Rakyat jelata / warga biasa non-bangsawan' },
      { word: 'subject', meaning: 'Rakyat yang diperintah' }
    ],
    commonMistakes: 'Jangan samakan "Queen Regnant" (ratu yang memerintah negerinya sendiri) dengan "Queen Consort" (istri dari raja yang berkuasa).'
  },

  'pintar': {
    query: 'pintar',
    summary: 'Bahasa Inggris memiliki banyak kata untuk "pintar" dengan nuansa berbeda: "smart" (cerdas praktis/solutif), "clever" (cerdik/cepat tanggap), "intelligent" (daya pikir ilmiah/intelektual), dan "bright" (berbakat/cerdas alami).',
    equivalents: [
      {
        word: 'smart',
        ipa: '/smɑːt/',
        partOfSpeech: 'Adjective',
        formality: 'Netral & Paling Umum',
        badge: 'CERDAS PRAKTIS & CEKATAN',
        nuanceExplanation: 'Padanan paling populer. Menekankan kepintaran praktis dalam menyelesaikan masalah sehari-hari atau bisnis dengan bijak.',
        whenToUse: 'Bisa dipakai untuk orang, keputusan bisnis ("smart move"), ataupun teknologi pintar ("smartphone").',
        exampleSentenceEn: 'She made a smart investment decision that grew her savings.',
        exampleSentenceId: 'Dia membuat keputusan investasi yang pintar dan menumbuhkan tabungannya.'
      },
      {
        word: 'intelligent',
        ipa: '/ɪnˈtel.ɪ.dʒənt/',
        partOfSpeech: 'Adjective',
        formality: 'Formal & Akademis',
        badge: 'INTEGRA & ILMIAH',
        nuanceExplanation: 'Menekankan kapasitas otak, logika mendalam, dan kemampuan analisis kognitif tingkat tinggi.',
        whenToUse: 'Situasi akademis, kemampuan analisis, atau penalaran ilmiah (Artificial Intelligence).',
        exampleSentenceEn: 'Dolphins are recognized as highly intelligent marine mammals.',
        exampleSentenceId: 'Lumba-lumba diakui sebagai mamalia laut yang sangat pintar (cerdas).'
      },
      {
        word: 'clever',
        ipa: '/ˈklev.ər/',
        partOfSpeech: 'Adjective',
        formality: 'Netral',
        badge: 'CERDIK & AKAL PANJANG',
        nuanceExplanation: 'Pintar menemukan trik atau cara cerdik di luar kebiasaan. Kadang bisa sedikit berkonotasi "licik" jika disalahgunakan.',
        whenToUse: 'Memecahkan teka-teki, ide yang cerdik, atau anak kecil yang pintar berargumen.',
        exampleSentenceEn: 'That was a very clever solution to a complicated problem.',
        exampleSentenceId: 'Itu adalah solusi yang sangat cerdik untuk masalah yang rumit.'
      },
      {
        word: 'bright',
        ipa: '/braɪt/',
        partOfSpeech: 'Adjective',
        formality: 'Hangat & Memuji',
        badge: 'BERBAKAT & CEPAT PAHAM',
        nuanceExplanation: 'Biasanya dipakai untuk memuji anak-anak atau pelajar muda yang cepat menyerap ilmu dan memiliki potensi masa depan cerah.',
        whenToUse: 'Memuji murid berprestasi di sekolah: "a bright student".',
        exampleSentenceEn: 'He is a bright young student with a promising future in science.',
        exampleSentenceId: 'Dia adalah siswa muda yang pintar dengan masa depan cerah di bidang sains.'
      }
    ],
    wordFamily: [
      { word: 'smartness', ipa: '/ˈsmɑːt.nəs/', partOfSpeech: 'Noun', meaning: 'Kecerdasan / ketangkasan berpikir' },
      { word: 'intelligence', ipa: '/ɪnˈtel.ɪ.dʒəns/', partOfSpeech: 'Noun', meaning: 'Intelegensi / daya pikir cerdas' },
      { word: 'intelligently', ipa: '/ɪnˈtel.ɪ.dʒənt.li/', partOfSpeech: 'Adverb', meaning: 'Dengan cerdas dan bijaksana' },
      { word: 'cleverness', ipa: '/ˈklev.ə.nəs/', partOfSpeech: 'Noun', meaning: 'Kecerdikan / akal panjang' }
    ],
    synonyms: [
      { word: 'brilliant', nuance: 'Sangat luar biasa pintar / jenius' },
      { word: 'sharp', nuance: 'Tajam pemikirannya / tanggap' },
      { word: 'gifted', nuance: 'Pintar karena bakat bawaan alami' }
    ],
    antonyms: [
      { word: 'stupid', meaning: 'Bodoh (kasar)' },
      { word: 'foolish', meaning: 'Konyol / tidak bijak' },
      { word: 'dumb', meaning: 'Bungkam / bodoh (informal)' },
      { word: 'slow', meaning: 'Lambat memahami sesuatu' }
    ],
    commonMistakes: '"Smart" lebih bernuansa tindakan praktis dan hasil nyata, sedangkan "Intelligent" menggambarkan kapasitas mental bawaan.'
  }
};

export const QUICK_SUGGESTION_WORDS = [
  { word: 'raja', hint: 'king vs monarch vs sovereign vs tycoon' },
  { word: 'ratu', hint: 'queen vs empress vs queen consort' },
  { word: 'pintar', hint: 'smart vs intelligent vs clever vs bright' },
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

    // Check if user has active AI configured
    const config = aiProviderService.getConfig();
    const hasAi = (config.provider === 'gemini' && config.geminiApiKey) ||
                  (config.provider === 'groq' && config.groqApiKey) ||
                  (config.provider === 'openai' && config.openaiApiKey) ||
                  (config.provider === 'ollama');

    // 1. If AI is configured, query the active AI Engine directly for real-time intelligence!
    if (hasAi) {
      try {
        const aiResult = await this.queryAiNuance(cleanWord);
        return aiResult;
      } catch (err) {
        console.warn('Live AI Nuance query failed, switching to verified lexical database:', err);
      }
    }

    // 2. Fallback to built-in verified database
    if (BUILTIN_WORD_DATABASE[cleanWord]) {
      return {
        success: true,
        data: BUILTIN_WORD_DATABASE[cleanWord],
        source: 'Database Leksikal Terverifikasi',
        isAiGenerated: false
      };
    }

    // 3. Fallback to smart offline dictionary
    return {
      success: true,
      data: this.generateDynamicFallback(cleanWord),
      source: 'Smart Offline Fallback',
      isAiGenerated: false
    };
  },

  // Dedicated AI Nuance query method
  async queryAiNuance(cleanWord) {
    const systemPrompt = `You are an expert Bilingual Lexicographer and English-Indonesian Translator.
The user will provide ONE Indonesian word (for example: "${cleanWord}").
Your goal is to give a comprehensive English thesaurus breakdown with clear nuanced differences in Indonesian.

STRICT INSTRUCTIONS:
1. Provide exactly 3 to 4 best English equivalents. Keep each nuanceExplanation and whenToUse concise (1-2 sentences maximum).
2. Keep exampleSentenceEn and exampleSentenceId practical, short, and natural.
3. Keep wordFamily (max 4 items), synonyms (max 4 items), antonyms (max 4 items).
4. Output STRICTLY valid, well-formed JSON matching this exact structure:
{
  "query": "${cleanWord}",
  "summary": "Ringkasan 1-2 kalimat dalam bahasa Indonesia mengenai padanan kata ini.",
  "equivalents": [
    {
      "word": "English word",
      "ipa": "/IPA/",
      "partOfSpeech": "Noun / Verb / Adjective",
      "formality": "Formal / Informal / Netral",
      "badge": "CIRI KHAS",
      "nuanceExplanation": "Penjelasan nuansa singkat dalam bahasa Indonesia.",
      "whenToUse": "Kapan tepatnya kata ini digunakan.",
      "exampleSentenceEn": "Short natural English sentence.",
      "exampleSentenceId": "Arti kalimat dalam bahasa Indonesia."
    }
  ],
  "wordFamily": [
    {
      "word": "kata turunan",
      "ipa": "/IPA/",
      "partOfSpeech": "Noun/Adj/Verb/Adv",
      "meaning": "Arti kata turunan"
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
  },

  // Parse JSON safely from AI output with smart normalization & auto-repair
  parseJsonSafely(rawContent, originalWord) {
    let clean = (rawContent || '').trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // 1. Direct JSON parse
    try {
      const parsed = JSON.parse(clean);
      return this.normalizeParsedResult(parsed, originalWord);
    } catch (e1) {
      // Continue to bracket repair
    }

    // 2. Extract substring between first { and last }
    const firstBrace = clean.indexOf('{');
    if (firstBrace !== -1) {
      const lastBrace = clean.lastIndexOf('}');
      if (lastBrace > firstBrace) {
        try {
          const candidate = clean.slice(firstBrace, lastBrace + 1);
          const parsed = JSON.parse(candidate);
          return this.normalizeParsedResult(parsed, originalWord);
        } catch (e2) {
          // Continue to truncate repair
        }
      }

      // 3. Auto-repair truncated JSON (e.g. cut off inside equivalents array)
      try {
        let repaired = clean.slice(firstBrace);
        const lastObjectEnd = repaired.lastIndexOf('}');
        if (lastObjectEnd !== -1) {
          repaired = repaired.slice(0, lastObjectEnd + 1);
          const openBrackets = (repaired.match(/\[/g) || []).length;
          const closeBrackets = (repaired.match(/\]/g) || []).length;
          for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
          const openBraces = (repaired.match(/\{/g) || []).length;
          const closeBraces = (repaired.match(/\}/g) || []).length;
          for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

          const parsed = JSON.parse(repaired);
          return this.normalizeParsedResult(parsed, originalWord);
        }
      } catch (e3) {
        console.warn('Truncation recovery failed:', e3);
      }
    }

    // 4. Regex extraction fallback for individual equivalent objects
    try {
      const regex = /"word"\s*:\s*"([^"]+)"[\s\S]*?"nuanceExplanation"\s*:\s*"([^"]+)"[\s\S]*?"exampleSentenceEn"\s*:\s*"([^"]+)"/g;
      let m;
      const extractedEquivalents = [];
      while ((m = regex.exec(clean)) !== null) {
        extractedEquivalents.push({
          word: m[1],
          ipa: '',
          partOfSpeech: 'Word',
          formality: 'Netral',
          badge: 'PADANAN KATA',
          nuanceExplanation: m[2],
          whenToUse: 'Dapat digunakan dalam percakapan.',
          exampleSentenceEn: m[3],
          exampleSentenceId: ''
        });
      }

      if (extractedEquivalents.length > 0) {
        return {
          query: originalWord,
          summary: `Padanan kata bahasa Inggris untuk "${originalWord}" mencakup beberapa istilah berikut.`,
          equivalents: extractedEquivalents,
          wordFamily: [],
          synonyms: [],
          antonyms: [],
          commonMistakes: ''
        };
      }
    } catch (e4) {
      console.warn('Regex extraction failed:', e4);
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
    const cleanWord = (word || '').trim().toLowerCase();
    const translatedWord = translateOffline(cleanWord, 'id') || cleanWord;
    const isRealTranslation = translatedWord && translatedWord.toLowerCase() !== cleanWord;
    const primaryEnglishWord = isRealTranslation ? translatedWord : cleanWord;

    return {
      query: word,
      summary: `Padanan kata bahasa Inggris untuk "${word}" utamanya adalah "${primaryEnglishWord}".`,
      equivalents: [
        {
          word: primaryEnglishWord,
          ipa: '',
          partOfSpeech: 'Padanan Kata',
          formality: 'Netral',
          badge: 'PADANAN DASAR',
          nuanceExplanation: `Kata "${primaryEnglishWord}" adalah padanan umum bahasa Inggris untuk "${word}".`,
          whenToUse: `Dapat digunakan dalam percakapan sehari-hari saat membicarakan ${word}.`,
          exampleSentenceEn: `The word "${primaryEnglishWord}" is commonly used in English conversations.`,
          exampleSentenceId: `Kata "${primaryEnglishWord}" umumnya digunakan dalam percakapan bahasa Inggris.`
        }
      ],
      wordFamily: isRealTranslation ? [
        { word: primaryEnglishWord, ipa: '', partOfSpeech: 'Word', meaning: `Padanan kata untuk ${word}` }
      ] : [],
      synonyms: isRealTranslation ? [
        { word: primaryEnglishWord, nuance: 'Padanan kata langsung' }
      ] : [],
      antonyms: [],
      commonMistakes: 'Pastikan memilih bentuk kata yang tepat (apakah kata benda, kata sifat, atau kata kerja) sesuai dengan kalimat Anda.'
    };
  }
};
