// Dataset for Pronunciation Assessment & SpeechAce-style Phonetic Checker

export const PRONUNCIATION_PRACTICES = [
  {
    id: "pron-1",
    phrase: "Thank you very much for your help",
    ipa: "/θæŋk juː ˈveri mʌtʃ fɔːr jɔːr help/",
    category: "Mastering 'TH' & 'V'",
    difficulty: "Easy",
    gotchaTip: "💡 **Tips Indonesia**: Bunyikan 'TH' pada 'Thank' dengan menempatkan ujung lidah di antara gigi atas & bawah (bunyi /θ/), bukan bunyi 'T' biasa. Pada 'Very', pastikan bibir atas dan gigi menyentuh untuk membuat getaran /v/, bukan /f/.",
    words: [
      { text: "Thank", ipa: "/θæŋk/", score: 96, status: "excellent", tip: "Pengucapan 'th' sangat tepat!" },
      { text: "you", ipa: "/juː/", score: 98, status: "excellent", tip: "Pengucapan vokal panjang bagus." },
      { text: "very", ipa: "/ˈveri/", score: 88, status: "good", tip: "Tekan sedikit getaran pada bibir untuk bunyi 'V'." },
      { text: "much", ipa: "/mʌtʃ/", score: 95, status: "excellent", tip: "Bunyi akhir 'ch' terdengar jelas." },
      { text: "for", ipa: "/fɔːr/", score: 92, status: "excellent" },
      { text: "your", ipa: "/jɔːr/", score: 90, status: "excellent" },
      { text: "help", ipa: "/help/", score: 94, status: "excellent" }
    ]
  },
  {
    id: "pron-2",
    phrase: "The ship sails on the deep blue sea",
    ipa: "/ðə ʃɪp seɪlz ɒn ðə diːp bluː siː/",
    category: "Short vs Long Vowels (/ɪ/ vs /iː/)",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Bedakan kata **Ship** /ʃɪp/ (vokal pendek rileks) dengan **Sheep / Sea** /siː/ (vokal panjang tersenyum). Kebanyakan pembelajar Indonesia menyamakan kedua bunyi ini.",
    words: [
      { text: "The", ipa: "/ðə/", score: 92, status: "excellent" },
      { text: "ship", ipa: "/ʃɪp/", score: 82, status: "good", tip: "Vokal pendek 'i', jangan dipanjangkan seperti 'sheep'." },
      { text: "sails", ipa: "/seɪlz/", score: 90, status: "excellent" },
      { text: "on", ipa: "/ɒn/", score: 95, status: "excellent" },
      { text: "the", ipa: "/ðə/", score: 93, status: "excellent" },
      { text: "deep", ipa: "/diːp/", score: 96, status: "excellent", tip: "Tarik bibir tersenyum untuk vokal panjang /iː/." },
      { text: "blue", ipa: "/bluː/", score: 94, status: "excellent" },
      { text: "sea", ipa: "/siː/", score: 97, status: "excellent" }
    ]
  },
  {
    id: "pron-3",
    phrase: "Pronunciation practice improves fluency",
    ipa: "/prəˌnʌn.siˈeɪ.ʃən ˈpræk.tɪs ɪmˈpruːvz ˈfluː.ən.si/",
    category: "Syllable Stress & Advanced Vocabulary",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Perhatikan penekanan suku kata (*syllable stress*). Pada 'Pronun-ci-A-tion', penekanan utama ada pada suku kata **AY** (/eɪ/).",
    words: [
      { text: "Pronunciation", ipa: "/prəˌnʌn.siˈeɪ.ʃən/", score: 78, status: "good", tip: "Tekan suku kata 'A' (pro-nun-ci-A-tion)." },
      { text: "practice", ipa: "/ˈpræk.tɪs/", score: 94, status: "excellent" },
      { text: "improves", ipa: "/ɪmˈpruːvz/", score: 86, status: "good" },
      { text: "fluency", ipa: "/ˈfluː.ən.si/", score: 92, status: "excellent" }
    ]
  },
  {
    id: "pron-4",
    phrase: "What time does the flight arrive in New York?",
    ipa: "/wɒt taɪm dʌz ðə flaɪt əˈraɪv ɪn njuː jɔːk/",
    category: "Connected Speech & Question Intonation",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Pada pertanyaan Bahasa Inggris, gunakan intonasi naik di akhir kalimat untuk kesan lebih ramah dan natural.",
    words: [
      { text: "What", ipa: "/wɒt/", score: 95, status: "excellent" },
      { text: "time", ipa: "/taɪm/", score: 98, status: "excellent" },
      { text: "does", ipa: "/dʌz/", score: 91, status: "excellent" },
      { text: "the", ipa: "/ðə/", score: 93, status: "excellent" },
      { text: "flight", ipa: "/flaɪt/", score: 88, status: "good", tip: "Ucapkan konsonan 't' akhir dengan bersih." },
      { text: "arrive", ipa: "/əˈraɪv/", score: 92, status: "excellent" },
      { text: "in", ipa: "/ɪn/", score: 96, status: "excellent" },
      { text: "New", ipa: "/njuː/", score: 95, status: "excellent" },
      { text: "York", ipa: "/jɔːk/", score: 94, status: "excellent" }
    ]
  }
];
