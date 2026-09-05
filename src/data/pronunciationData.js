// Dataset for Pronunciation Assessment & Dual Waveform Comparison

// 1. KATEGORI 1: PER KATA (Single Words & Difficult Phonemes)
export const PRONUNCIATION_WORDS = [
  {
    id: "word-1",
    text: "Comfortable",
    ipa: "/ˈkʌmftəbl/",
    syllables: "COM-fer-tuh-bl",
    stressedSyllable: "COM",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Banyak pembelajar mengucapkan 4 suku kata (com-for-ta-ble). Penutur asli menyingkatnya menjadi 3 suku kata alami: **COMF-ter-bl** dengan penekanan di awal.",
    category: "Silent Letters & Compression"
  },
  {
    id: "word-2",
    text: "Thorough",
    ipa: "/ˈθʌr.ə/",
    syllables: "THUR-oh",
    stressedSyllable: "THUR",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Gabungan konsonan 'TH' /θ/ dengan vokal 'ough' sering tertukar dengan 'through' atau 'thought'. Bunyikan seperti 'THER-o'.",
    category: "'TH' & 'OUGH' Patterns"
  },
  {
    id: "word-3",
    text: "Specifically",
    ipa: "/spəˈsɪf.ɪ.kli/",
    syllables: "spuh-SIF-ik-lee",
    stressedSyllable: "SIF",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Tekan suku kata kedua (**SIF**). Mulai dengan desisan 'sp' yang halus tanpa menambahkan vokal 'e' di depannya (bukan 'es-pesifik').",
    category: "Syllable Stress"
  },
  {
    id: "word-4",
    text: "Squirrel",
    ipa: "/ˈskwɜː.rəl/",
    syllables: "SKWIR-uhl",
    stressedSyllable: "SKWIR",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Salah satu kata tersulit karena transisi 'skw' ke bunyi 'r' di tenggorokan. Bulatkan bibir saat transisi 'w' ke 'ir'.",
    category: "Consonant Clusters"
  },
  {
    id: "word-5",
    text: "Phenomenon",
    ipa: "/fəˈnɒm.ɪ.nən/",
    syllables: "fuh-NOM-uh-non",
    stressedSyllable: "NOM",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Penekanan utama ada di suku kata kedua: fuh-**NOM**-uh-non. Huruf 'ph' dibaca seperti bunyi 'F'.",
    category: "Multi-syllable Rhythm"
  },
  {
    id: "word-6",
    text: "Schedule",
    ipa: "/ˈskedʒ.uːl/ (US) or /ˈʃedʒ.uːl/ (UK)",
    syllables: "SKED-jool",
    stressedSyllable: "SKED",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Dalam aksen Amerika berbunyi 'SKED-jool', sedangkan dalam British berbunyi 'SHED-yool'. Keduanya valid!",
    category: "Accent Variations"
  },
  {
    id: "word-7",
    text: "Pronunciation",
    ipa: "/prəˌnʌn.siˈeɪ.ʃən/",
    syllables: "pruh-nun-see-AY-shun",
    stressedSyllable: "AY",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Ingat kata dasarnya 'pronounce' (ada huruf 'o'), tetapi kata bendanya 'pronunciation' menggunakan 'NUN', bukan 'noun'. Penekanan di suku kata 'AY'.",
    category: "Word Family Phonetics"
  },
  {
    id: "word-8",
    text: "Entrepreneur",
    ipa: "/ˌɒn.trə.prəˈnɜːr/",
    syllables: "on-truh-pruh-NUR",
    stressedSyllable: "NUR",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Serapan bahasa Prancis. Penekanan terkuat ada di suku kata terakhir (**NUR**). Awali dengan bunyi vokal 'on'.",
    category: "Loanwords"
  }
];

// 2. KATEGORI 2: PER KALIMAT PENDEK (Short Sentences - 3 to 7 Words)
export const PRONUNCIATION_SHORT_SENTENCES = [
  {
    id: "short-1",
    text: "Could you please repeat that?",
    ipa: "/kʊd juː pliːz rɪˈpiːt ðæt/",
    category: "Daily Conversation & Politeness",
    difficulty: "Easy",
    gotchaTip: "💡 **Tips Indonesia**: Perhatikan connected speech antara 'Could' dan 'you' yang menyatu menjadi bunyi lembut /kʊdʒuː/. Intonasi naik di akhir kalimat.",
    keyStressedWords: ["please", "repeat"]
  },
  {
    id: "short-2",
    text: "I really appreciate your help.",
    ipa: "/aɪ ˈrɪə.li əˈpriː.ʃi.eɪt jɔːr help/",
    category: "Gratitude & Business",
    difficulty: "Easy",
    gotchaTip: "💡 **Tips Indonesia**: Kata 'appreciate' dibaca /əˈpriː.ʃi.eɪt/ dengan bunyi 'sh' lembut di tengah. Tekan kata 'really' dan 'help'.",
    keyStressedWords: ["really", "appreciate", "help"]
  },
  {
    id: "short-3",
    text: "Where is the nearest subway station?",
    ipa: "/weər ɪz ðə ˈnɪə.rɪst ˈsʌb.weɪ ˈsteɪ.ʃən/",
    category: "Travel & Directions",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Gabungkan 'Where' dan 'is' menjadi 'Where's'. Berikan jeda mikro sebelum 'subway station'.",
    keyStressedWords: ["Where", "nearest", "subway"]
  },
  {
    id: "short-4",
    text: "Let's grab a cup of coffee.",
    ipa: "/lets ɡræb ə kʌp əv ˈkɒf.i/",
    category: "Casual Social Banter",
    difficulty: "Easy",
    gotchaTip: "💡 **Tips Indonesia**: 'cup of' dalam percakapan cepat penutur asli melebur menjadi 'cuppa' /kʌpə/. Irama kalimat mengalir santai.",
    keyStressedWords: ["grab", "cup", "coffee"]
  },
  {
    id: "short-5",
    text: "What time does the meeting start?",
    ipa: "/wɒt taɪm dʌz ðə ˈmiː.tɪŋ stɑːt/",
    category: "Office & Workplace",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Pada 'What time', tahan bunyi 't' pertama dan langsung sambungkan ke 'time' tanpa melepaskan udara dua kali.",
    keyStressedWords: ["time", "meeting", "start"]
  },
  {
    id: "short-6",
    text: "Practice makes perfect every single day.",
    ipa: "/ˈpræk.tɪs meɪks ˈpɜː.fɪkt ˈev.ri ˈsɪŋ.ɡəl deɪ/",
    category: "Fluency & Motivation",
    difficulty: "Medium",
    gotchaTip: "💡 **Tips Indonesia**: Jaga ketukan ritme (*stress-timed rhythm*). Kata 'practice', 'perfect', 'every', dan 'day' mendapatkan ketukan irama utama.",
    keyStressedWords: ["Practice", "perfect", "single", "day"]
  }
];

// 3. KATEGORI 3: PER KALIMAT PANJANG (Long Sentences & Fluent Passages - 12 to 25 Words)
export const PRONUNCIATION_LONG_SENTENCES = [
  {
    id: "long-1",
    text: "Although the weather forecast predicted heavy rain, the conference organizers successfully held the opening ceremony outdoors without any major delays.",
    ipa: "/ɔːlˈðəʊ ðə ˈweð.ər ˈfɔː.kɑːst prɪˈdɪk.tɪd ˈhev.i reɪn...",
    category: "Complex Sentence & Academic",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Bagi kalimat menjadi 3 kelompok napas (*breath groups*): (1) 'Although the weather forecast predicted heavy rain,' [jeda], (2) 'the conference organizers successfully held the opening ceremony outdoors' [jeda], (3) 'without any major delays.'",
    pausePoints: ["rain,", "outdoors"],
    keyStressedWords: ["predicted", "heavy rain", "successfully", "opening ceremony", "outdoors", "delays"]
  },
  {
    id: "long-2",
    text: "In order to achieve natural fluency in a new language, consistent daily practice is much more effective than studying for several hours once a week.",
    ipa: "/ɪn ˈɔː.dər tuː əˈtʃiːv ˈnætʃ.ər.əl ˈfluː.ən.si...",
    category: "Fluency & Language Learning",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Turunkan nada di akhir klausa anak ('new language,'), lalu gunakan intonasi mantap pada 'much more effective' untuk menegaskan argumen.",
    pausePoints: ["new language,", "more effective"],
    keyStressedWords: ["natural fluency", "consistent", "daily practice", "more effective", "several hours"]
  },
  {
    id: "long-3",
    text: "Effective communication in a global business environment requires not only grammatical precision, but also an awareness of cultural etiquette and tone.",
    ipa: "/ɪˈfek.tɪv kəˌmjuː.nɪˈkeɪ.ʃən ɪn ə ˈɡləʊ.bəl ˈbɪz.nɪs...",
    category: "Professional Presentation & Leadership",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Struktur berpasangan 'not only [A], but also [B]'. Beri penekanan seimbang pada 'grammatical precision' dan 'cultural etiquette'.",
    pausePoints: ["business environment", "grammatical precision,"],
    keyStressedWords: ["Effective communication", "global business", "grammatical precision", "cultural etiquette", "tone"]
  },
  {
    id: "long-4",
    text: "Scientists have discovered remarkable evidence showing that regular physical exercise significantly improves cognitive function and memory retention throughout our lives.",
    ipa: "/ˈsaɪən.tɪsts hæv dɪˈskʌv.əd rɪˈmɑː.kə.bəl ˈev.ɪ.dəns...",
    category: "Popular Science & Research",
    difficulty: "Hard",
    gotchaTip: "💡 **Tips Indonesia**: Jaga intonasi tetap mengalir pada istilah sains: 'cognitive function' dan 'memory retention'. Hindari membaca kata per kata secara terputus.",
    pausePoints: ["remarkable evidence", "cognitive function"],
    keyStressedWords: ["discovered", "remarkable evidence", "physical exercise", "improves", "cognitive function", "memory retention"]
  }
];

// Backwards compatibility for existing imports
export const PRONUNCIATION_PRACTICES = [
  ...PRONUNCIATION_WORDS.map((w, idx) => ({
    id: `legacy-word-${idx}`,
    phrase: w.text,
    ipa: w.ipa,
    category: `Word: ${w.category}`,
    difficulty: w.difficulty,
    gotchaTip: w.gotchaTip
  })),
  ...PRONUNCIATION_SHORT_SENTENCES.map((s, idx) => ({
    id: `legacy-short-${idx}`,
    phrase: s.text,
    ipa: s.ipa,
    category: `Short: ${s.category}`,
    difficulty: s.difficulty,
    gotchaTip: s.gotchaTip
  }))
];
