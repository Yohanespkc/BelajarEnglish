// Learning Path & Curriculum Data for LingoMaster

export const UNITS = [
  {
    id: "unit-1",
    title: "Unit 1: Perkenalan & Dasar",
    description: "Kuasai kata sapaan, perkenalan diri, dan frasa dasar sehari-hari.",
    color: "#58cc02", // Duolingo Green
    icon: "Sparkles",
    lessons: [
      {
        id: "unit-1-lesson-1",
        title: "Sapaan Utama",
        description: "Hello, Good Morning, How are you",
        type: "standard",
        xpReward: 15,
        questions: [
          {
            id: "q1_1",
            type: "multiple_choice",
            prompt: "Pilih kata untuk 'Halo'",
            options: ["Hello", "Goodbye", "Thank you", "Night"],
            correctAnswer: "Hello",
            audioText: "Hello",
            explanation: "'Hello' adalah sapaan paling umum untuk mengucapkan 'Halo' dalam bahasa Inggris."
          },
          {
            id: "q1_2",
            type: "word_bank",
            prompt: "Terjemahkan kalimat ini: 'Good morning, how are you?'",
            targetText: "Good morning, how are you?",
            wordOptions: ["Selamat", "pagi,", "apa", "kabar", "kamu?", "malam", "terima", "kasih"],
            correctOrder: ["Selamat", "pagi,", "apa", "kabar", "kamu?"],
            audioText: "Good morning, how are you?",
            explanation: "'Good morning' berarti 'Selamat pagi', dan 'How are you?' berarti 'Apa kabar kamu?'."
          },
          {
            id: "q1_3",
            type: "listening",
            prompt: "Dengarkan audio dan pilih frasa yang benar",
            audioText: "Nice to meet you",
            options: ["Nice to meet you", "Nice to see you", "Glad to know you", "See you later"],
            correctAnswer: "Nice to meet you",
            explanation: "'Nice to meet you' adalah ungkapan sopan yang artinya 'Senang berkenalan denganmu'."
          },
          {
            id: "q1_4",
            type: "speaking",
            prompt: "Ucapkan frasa ini dengan lantang ke mikrofon:",
            audioText: "Hello, nice to meet you",
            targetPhonetic: "heh-loh nays too meet yoo",
            targetText: "Hello, nice to meet you",
            explanation: "Pastikan pengucapan 'meet' terdengar jelas dan panjang (m-i-i-t)."
          },
          {
            id: "q1_5",
            type: "match_pairs",
            prompt: "Jodohkan pasangan kata berikut",
            pairs: [
              { english: "Goodbye", indonesian: "Selamat tinggal" },
              { english: "Thank you", indonesian: "Terima kasih" },
              { english: "Yes", indonesian: "Ya" },
              { english: "No", indonesian: "Tidak" }
            ],
            explanation: "Ini adalah fondasi kosakata dasar sehari-hari yang sangat sering digunakan."
          }
        ]
      },
      {
        id: "unit-1-lesson-2",
        title: "Perkenalan Diri",
        description: "My name is, I am from Indonesia",
        type: "standard",
        xpReward: 20,
        questions: [
          {
            id: "q2_1",
            type: "word_bank",
            prompt: "Terjemahkan: 'My name is Alex'",
            targetText: "My name is Alex",
            wordOptions: ["Nama", "saya", "adalah", "Alex", "dia", "mereka", "asal"],
            correctOrder: ["Nama", "saya", "adalah", "Alex"],
            audioText: "My name is Alex",
            explanation: "'My name is...' digunakan saat memperkenalkan nama sendiri."
          },
          {
            id: "q2_2",
            type: "speaking",
            prompt: "Ucapkan kalimat ini dengan percaya diri:",
            audioText: "I am from Indonesia",
            targetText: "I am from Indonesia",
            explanation: "'I am from...' berarti 'Saya berasal dari...'."
          },
          {
            id: "q2_3",
            type: "fill_blank",
            prompt: "Lengkapi kalimat: 'Where _____ you from?'",
            options: ["are", "is", "am", "be"],
            correctAnswer: "are",
            audioText: "Where are you from?",
            explanation: "Subjek 'you' selalu menggunakan to be 'are' (Where are you from?)."
          }
        ]
      },
      {
        id: "unit-1-lesson-3",
        title: "Keluarga & Teman",
        description: "Father, Mother, Brother, Sister",
        type: "trophy",
        xpReward: 25,
        questions: [
          {
            id: "q3_1",
            type: "match_pairs",
            prompt: "Cocokkan anggota keluarga",
            pairs: [
              { english: "Father", indonesian: "Ayah" },
              { english: "Mother", indonesian: "Ibu" },
              { english: "Brother", indonesian: "Saudara Laki-Laki" },
              { english: "Sister", indonesian: "Saudara Perempuan" }
            ],
            explanation: "Anggota keluarga inti dalam bahasa Inggris."
          },
          {
            id: "q3_2",
            type: "word_bank",
            prompt: "Terjemahkan: 'This is my mother'",
            targetText: "This is my mother",
            wordOptions: ["Ini", "adalah", "ibu", "saya", "ayah", "teman"],
            correctOrder: ["Ini", "adalah", "ibu", "saya"],
            audioText: "This is my mother",
            explanation: "'This is my...' artinya 'Ini adalah ... saya'."
          }
        ]
      }
    ]
  },
  {
    id: "unit-2",
    title: "Unit 2: Makanan & Restoran",
    description: "Cara memesan makanan, nama hidangan, dan percakapan di cafe.",
    color: "#ff9600", // Warm Orange
    icon: "Coffee",
    lessons: [
      {
        id: "unit-2-lesson-1",
        title: "Memesan Kopi & Minuman",
        description: "I would like a coffee, please",
        type: "standard",
        xpReward: 20,
        questions: [
          {
            id: "q2_1_1",
            type: "word_bank",
            prompt: "Terjemahkan: 'I would like a hot coffee, please'",
            targetText: "I would like a hot coffee, please",
            wordOptions: ["Saya", "ingin", "segelas", "kopi", "panas,", "tolong", "dingin", "teh"],
            correctOrder: ["Saya", "ingin", "segelas", "kopi", "panas,", "tolong"],
            audioText: "I would like a hot coffee, please",
            explanation: "'I would like...' adalah ungkapan yang jauh lebih sopan daripada 'I want' saat memesan makanan/minuman."
          },
          {
            id: "q2_1_2",
            type: "speaking",
            prompt: "Cobalah memesan dengan suara lantang:",
            audioText: "Can I get a glass of water?",
            targetText: "Can I get a glass of water?",
            explanation: "'Can I get...' merupakan frasa natural yang biasa dipakai di cafe untuk meminta sesuatu."
          },
          {
            id: "q2_1_3",
            type: "multiple_choice",
            prompt: "Apa arti dari 'The bill, please'?",
            options: ["Minta nota / tagihannya, tolong", "Minta minumannya, tolong", "Minta menu makanan", "Minta piring bersih"],
            correctAnswer: "Minta nota / tagihannya, tolong",
            audioText: "The bill, please",
            explanation: "'The bill' (atau 'check' di US) adalah tagihan pembayaran di restoran."
          }
        ]
      },
      {
        id: "unit-2-lesson-2",
        title: "Rasa & Makanan Favorit",
        description: "Delicious, Spicy, Sweet, Salty",
        type: "standard",
        xpReward: 20,
        questions: [
          {
            id: "q2_2_1",
            type: "match_pairs",
            prompt: "Cocokkan kata rasa berikut",
            pairs: [
              { english: "Delicious", indonesian: "Lemat / Lezat" },
              { english: "Spicy", indonesian: "Pedas" },
              { english: "Sweet", indonesian: "Manis" },
              { english: "Salty", indonesian: "Asin" }
            ],
            explanation: "Kata sifat untuk menggambarkan cita rasa makanan."
          }
        ]
      }
    ]
  },
  {
    id: "unit-3",
    title: "Unit 3: Travel & Petualangan",
    description: "Arah jalan, bandara, hotel, dan moda transportasi.",
    color: "#1cb0f6", // Sky Blue
    icon: "Compass",
    lessons: [
      {
        id: "unit-3-lesson-1",
        title: "Menanyakan Arah",
        description: "Where is the hotel? Turn left, Turn right",
        type: "standard",
        xpReward: 25,
        questions: [
          {
            id: "q3_1_1",
            type: "word_bank",
            prompt: "Terjemahkan: 'Excuse me, where is the nearest station?'",
            targetText: "Excuse me, where is the nearest station?",
            wordOptions: ["Permisi,", "di mana", "stasiun", "terdekat?", "jauh", "hotel", "kiri"],
            correctOrder: ["Permisi,", "di mana", "stasiun", "terdekat?"],
            audioText: "Excuse me, where is the nearest station?",
            explanation: "'Excuse me' dipakai untuk menyapa orang asing secara sopan, 'nearest' berarti 'terdekat'."
          },
          {
            id: "q3_1_2",
            type: "speaking",
            prompt: "Ucapkan petunjuk arah ini:",
            audioText: "Turn left and walk straight ahead",
            targetText: "Turn left and walk straight ahead",
            explanation: "'Turn left' = belok kiri, 'straight ahead' = lurus terus."
          }
        ]
      }
    ]
  },
  {
    id: "unit-4",
    title: "Unit 4: Bisnis & Dunia Kerja",
    description: "Wawancara kerja, email profesional, dan presentasi kantor.",
    color: "#ce82ff", // Purple
    icon: "Briefcase",
    lessons: [
      {
        id: "unit-4-lesson-1",
        title: "Wawancara Kerja",
        description: "Tell me about yourself & your work experience",
        type: "standard",
        xpReward: 30,
        questions: [
          {
            id: "q4_1_1",
            type: "word_bank",
            prompt: "Terjemahkan: 'I have three years of experience in software design'",
            targetText: "I have three years of experience in software design",
            wordOptions: ["Saya", "memiliki", "tiga", "tahun", "pengalaman", "dalam", "desain", "perangkat", "lunak"],
            correctOrder: ["Saya", "memiliki", "tiga", "tahun", "pengalaman", "dalam", "desain", "perangkat", "lunak"],
            audioText: "I have three years of experience in software design",
            explanation: "Frasa standar menjelaskan pengalaman kerja dalam wawancara."
          }
        ]
      }
    ]
  },
  {
    id: "unit-5",
    title: "Unit 5: Grammar Master & Idiom",
    description: "Kuasai Tenses (Past, Present, Future) dan Phrasal Verbs.",
    color: "#ff4b4b", // Vibrant Red
    icon: "Zap",
    lessons: [
      {
        id: "unit-5-lesson-1",
        title: "Past Tense & Masa Lalu",
        description: "I went, She saw, They bought",
        type: "standard",
        xpReward: 35,
        questions: [
          {
            id: "q5_1_1",
            type: "fill_blank",
            prompt: "Pilih bentuk kata kerja lampau yang benar: 'Yesterday, I _____ a new laptop.'",
            options: ["bought", "buy", "buying", "buys"],
            correctAnswer: "bought",
            audioText: "Yesterday, I bought a new laptop.",
            explanation: "'Yesterday' mengindikasikan masa lalu (Simple Past Tense), jadi kata kerja yang digunakan adalah V2 dari 'buy' yaitu 'bought'."
          }
        ]
      }
    ]
  }
];
