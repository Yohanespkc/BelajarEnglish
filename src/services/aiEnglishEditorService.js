/**
 * AI English Editor Service
 * Handles contextual English rewriting, 6-register tone comparison (Gen Z, Close Friend, Daily, Courteous, Business, Academic),
 * and comprehensive Indonesian explanations with distinct audio voice personas.
 * Interfaces with local Ollama LLM (Gemma 3/4, GPT-OSS, Qwen) or provides smart local fallbacks.
 */

export const CONTEXT_MODES = [
  {
    id: 'auto',
    label: 'Auto Detect',
    icon: '⚡',
    description: 'AI mendeteksi konteks kalimat secara otomatis',
    promptGuidance: 'Automatically detect the user\'s intended tone and context and refine it accordingly.'
  },
  {
    id: 'humorous_casual',
    label: 'Becanda & Santai',
    icon: '🎭',
    description: 'Slang natural, santai, lucu, & ramah tongkrongan',
    promptGuidance: 'The tone MUST be playful, humorous, witty, and casually natural with friendly slang where appropriate.'
  },
  {
    id: 'daily_conversational',
    label: 'Percakapan Harian',
    icon: '💬',
    description: 'Natural sehari-hari untuk ngobrol & travelling',
    promptGuidance: 'The tone MUST be natural everyday conversational English as spoken by native speakers in daily life.'
  },
  {
    id: 'courteous_polite',
    label: 'Sopan & Santun',
    icon: '🙏',
    description: 'Diplomatis, ramah, penuh tata krama & respek',
    promptGuidance: 'The tone MUST be courteous, polite, considerate, and diplomatic (suitable for asking strangers, hotel staff, elders, or polite requests).'
  },
  {
    id: 'business_formal',
    label: 'Bisnis & Profesional',
    icon: '💼',
    description: 'Email kantor, meeting, & komunikasi profesional',
    promptGuidance: 'The tone MUST be professional, polished, concise, and courteous (suitable for workplace emails, reports, or business correspondence).'
  },
  {
    id: 'academic_popular',
    label: 'Akademik & Intelektual',
    icon: '🎓',
    description: 'Ilmiah, esai berbobot, & diksi presisi tinggi',
    promptGuidance: 'The tone MUST be articulate, sophisticated, and intellectually refined (like scholarly essays, TED talks, or formal lectures).'
  }
];

import { aiProviderService, PROVIDER_METADATA } from './aiProviderService';

export const aiEnglishEditorService = {
  // Fetch available models from active AI provider
  async getAvailableModels(providerOverride = null) {
    try {
      const models = await aiProviderService.getModels(providerOverride);
      if (models && models.length > 0) {
        return models.map(m => typeof m === 'string' ? m : m.id);
      }
    } catch (e) {
      console.warn('AI provider models lookup failed, using default list:', e);
    }
    return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma3:4b', 'gemini-1.5-flash'];
  },

  // Generate system prompt
  buildSystemPrompt(contextModeId) {
    const context = CONTEXT_MODES.find(c => c.id === contextModeId) || CONTEXT_MODES[0];

    return `You are an elite bilingual English Editor, Sociolinguist, and Language Coach.
Your mission is:
1. Examine the English text written by the user.
2. DETECT the register/tone of the user's ORIGINAL sentence (e.g. daily casual, slang, stiff formal, or mixed/broken English).
3. REWRITE the text into top-tier, natural, idiomatic English according to the chosen context: "${context.label}" (${context.promptGuidance}).
4. SHOW HOW THE SAME MEANING WOULD BE SPOKEN ACROSS 6 DISTINCT REGISTERS/STYLES (Spektrum 6 Gaya Bahasa) with their respective speaking personas so the user can clearly hear and feel the differences:
   - 1. Gen Z & Internet Slang (Persona: Zoe - energetic, modern internet slang like lowkey, fr, cooked, bet, no cap)
   - 2. Teman Akrab & Singkatan (Persona: Sam - relaxed buddy, uses natural spoken contractions like wanna, gonna, gotta, lemme, imma)
   - 3. Percakapan Harian Natural (Persona: Emma - natural everyday conversational English, smooth, warm, and approachable)
   - 4. Sopan & Santun (Persona: Claire - polite, courteous, diplomatic, respectful requests like 'could you please', 'would you mind')
   - 5. Formal & Bisnis (Persona: David - corporate professional, confident, clear, structured workplace email/meeting tone)
   - 6. Akademik & Intelektual (Persona: Prof. Arthur - mature scholarly, sophisticated vocabulary, high register, dignified and articulate)
5. Explain all grammar improvements and register distinctions strictly in clear, friendly Indonesian (Bahasa Indonesia).

Return your output STRICTLY as a valid JSON object matching this schema:
{
  "detectedInputTone": {
    "tone": "Nama nada/gaya kalimat asli (misal: Percakapan Kasual dengan Slang / Formal Baku / Campuran)",
    "explanation": "Penjelasan singkat (1-2 kalimat) dalam bahasa Indonesia mengenai karakteristik gaya bahasa asli yang dipakai pengguna."
  },
  "contextDetected": "Konteks Utama yang Diterapkan (${context.label})",
  "polishedText": "The perfected English text tailored to the selected context",
  "overallSummary": "Ringkasan penjelasan umum dalam bahasa Indonesia mengapa kalimat ini disempurnakan.",
  "changes": [
    {
      "original": "kata/frasa lama",
      "improved": "kata/frasa baru",
      "type": "Grammar / Tata Bahasa" | "Pilihan Kata (Vocabulary)" | "Nada & Konteks" | "Idiom Alami",
      "explanation": "Penjelasan mengapa diubah dalam bahasa Indonesia."
    }
  ],
  "toneComparison": [
    {
      "toneId": "genz_slang",
      "toneLabel": "Gen Z & Internet Slang",
      "persona": "Zoe (Gen Z)",
      "badge": "HYPE & TRENDING",
      "icon": "⚡",
      "text": "Energetic Gen Z version with modern internet slang",
      "nuance": "Kapan dipakai: Di medsos (TikTok, Reels, X), chat teman sebaya, atau gaming.",
      "keyDifference": "Slang kekinian seperti 'literally cooked', 'lowkey', 'fr', 'no cap', 'pull up'."
    },
    {
      "toneId": "close_friend",
      "toneLabel": "Teman Akrab & Singkatan",
      "persona": "Sam (Teman Nongkrong)",
      "badge": "WANNA / GONNA",
      "icon": "🤙",
      "text": "Relaxed buddy version with spoken contractions like wanna/gonna/gotta",
      "nuance": "Kapan dipakai: Chat WhatsApp sahabat akrab, ngobrol santai sesama teman.",
      "keyDifference": "Kontraksi lisan alami: 'wanna', 'gonna', 'gotta', 'lemme', panggilan akrab 'man/bro'."
    },
    {
      "toneId": "daily_conversational",
      "toneLabel": "Percakapan Harian",
      "persona": "Emma (Percakapan Harian)",
      "badge": "NATURAL & SANTAI",
      "icon": "💬",
      "text": "Natural conversational version spoken with family/friends/acquaintances",
      "nuance": "Kapan dipakai: Percakapan umum sehari-hari, travelling, atau ngobrol ramah.",
      "keyDifference": "Bahasa mengalir santai tanpa singkatan berlebihan dan tanpa istilah kaku."
    },
    {
      "toneId": "courteous_polite",
      "toneLabel": "Sopan & Santun (Courteous)",
      "persona": "Claire (Sopan & Diplomatis)",
      "badge": "LEMBUT & RESPEK",
      "icon": "🙏",
      "text": "Polite and courteous diplomatic version",
      "nuance": "Kapan dipakai: Berbicara dengan orang asing, pelayan restoran, orang tua, atau permohonan santun.",
      "keyDifference": "Frasa diplomatis dan santun: 'Excuse me', 'could you please', 'I would appreciate it'."
    },
    {
      "toneId": "business_formal",
      "toneLabel": "Formal & Bisnis",
      "persona": "David (Eksekutif Bisnis)",
      "badge": "PROFESIONAL & KANTOR",
      "icon": "💼",
      "text": "Formal business version for workplace/email/clients/boss",
      "nuance": "Kapan dipakai: Email kantor, rapat bisnis, urusan dinas resmi, atau komunikasi korporat.",
      "keyDifference": "Kosakata teratur dan lugas: 'Due to...', 'would like to arrange', 'scheduled return'."
    },
    {
      "toneId": "academic_intellectual",
      "toneLabel": "Akademik & Intelektual",
      "persona": "Prof. Arthur (Akademisi)",
      "badge": "MATANG & BERBOBOT",
      "icon": "🎓",
      "text": "Scholarly, articulate, and intellectually refined version",
      "nuance": "Kapan dipakai: Esai ilmiah, jurnal, pidato resmi, atau penulisan tingkat tinggi.",
      "keyDifference": "Diksi presisi tinggi dan struktur kompleks seperti 'Experiencing significant fatigue', 'repatriate'."
    }
  ],
  "alternativeVersions": [
    {
      "tone": "Alternatif Tambahan Lain",
      "text": "Extra variation"
    }
  ]
}

DO NOT include markdown wrappers around the JSON if possible, or use standard \`\`\`json. Ensure valid JSON only.`;
  },

  // Edit English text
  async editEnglishText({ text, contextMode = 'auto', model = null }) {
    if (!text || !text.trim()) {
      throw new Error('Teks bahasa Inggris tidak boleh kosong.');
    }

    const systemPrompt = this.buildSystemPrompt(contextMode);

    try {
      const result = await aiProviderService.chatCompletion({
        systemPrompt,
        messages: [
          { role: 'user', content: `Please edit and provide 6-register tone comparison for this English text:\n"${text}"` }
        ],
        model,
        temperature: 0.35,
        jsonMode: true
      });

      // Parse JSON from output
      const parsedResult = this.parseJsonFromContent(result.content, text, contextMode);
      return {
        success: true,
        data: parsedResult,
        modelUsed: `${result.providerName}: ${result.modelUsed}`,
        isAiGenerated: true
      };
    } catch (err) {
      console.warn('AI Provider request failed, activating intelligent heuristic fallback:', err);
      const fallbackResult = this.generateFallbackResult(text, contextMode);
      return {
        success: true,
        data: fallbackResult,
        modelUsed: 'Local Smart Heuristic',
        isAiGenerated: false,
        warning: `AI (${err.message || 'Tidak merespons'}). Menampilkan hasil koreksi & perbandingan 6 gaya bahasa offline cerdas.`
      };
    }
  },

  // Safely extract and parse JSON from model response
  parseJsonFromContent(content, originalText, contextMode) {
    let clean = content.trim();

    // Remove markdown code fences if present
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try finding JSON block
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.polishedText) {
          // If model did not generate complete 6-tone comparison, synthesize fallback tones
          const toneComparison = Array.isArray(parsed.toneComparison) && parsed.toneComparison.length >= 4
            ? parsed.toneComparison
            : this.synthesizeToneComparison(parsed.polishedText || originalText);

          return {
            originalText,
            detectedInputTone: parsed.detectedInputTone || this.detectInputToneHeuristic(originalText),
            contextDetected: parsed.contextDetected || 'Deteksi Otomatis',
            polishedText: parsed.polishedText,
            overallSummary: parsed.overallSummary || 'Berikut adalah penyempurnaan bahasa Inggris dengan penyesuaian konteks dan tata bahasa.',
            changes: Array.isArray(parsed.changes) ? parsed.changes : [],
            toneComparison,
            alternativeVersions: Array.isArray(parsed.alternativeVersions) ? parsed.alternativeVersions : []
          };
        }
      } catch (e) {
        console.warn('Failed parsing matched JSON:', e);
      }
    }

    // If model returned plain text instead of JSON
    return this.generateFallbackResult(originalText, contextMode);
  },

  // Detect tone heuristic from user input
  detectInputToneHeuristic(text) {
    const lower = text.toLowerCase();
    const slangWords = ['wanna', 'gonna', 'gotta', 'bro', 'noob', 'lol', 'cuz', 'dunno', 'kinda', 'y\'all', 'dude', 'cooked', 'fr', 'bet', 'no cap', 'lowkey'];
    const formalWords = ['hereby', 'furthermore', 'nevertheless', 'regarding', 'kindly', 'sincerely', 'inquire', 'assistance', 'pursuant'];
    const courteousWords = ['excuse me', 'could you please', 'would you mind', 'pardon me', 'grateful', 'appreciate'];
    const academicWords = ['hypothesis', 'methodology', 'significant', 'demonstrate', 'consequently', 'furthermore', 'analyze', 'empirical', 'necessitate', 'repatriate'];

    const hasSlang = slangWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));
    const hasCourteous = courteousWords.some(w => lower.includes(w));
    const hasFormal = formalWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));
    const hasAcademic = academicWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower));

    if (hasSlang) {
      return {
        tone: 'Bahasa Gaul & Singkatan Santai (Slang / Casual Contractions)',
        explanation: 'Kalimat Anda memakai gaya santai akrab dengan kontraksi lisan (seperti wanna/gonna) atau kosakata slang. Cocok untuk ngobrol santai sesama teman, namun perlu disesuaikan untuk situasi resmi.'
      };
    } else if (hasCourteous) {
      return {
        tone: 'Bahasa Sopan & Santun (Courteous / Polite)',
        explanation: 'Kalimat Anda menggunakan frasa kesantunan yang ramah dan penuh rasa hormat, sangat tepat untuk berkomunikasi dengan orang baru, pelanggan, atau situasi sosial umum.'
      };
    } else if (hasFormal) {
      return {
        tone: 'Bahasa Formal & Bisnis (Business / Professional)',
        explanation: 'Kalimat Anda sudah menggunakan kosakata formal dan nada sopan khas korespondensi profesional atau lingkungan kerja.'
      };
    } else if (hasAcademic) {
      return {
        tone: 'Bahasa Ilmiah & Akademis (Academic / Sophisticated)',
        explanation: 'Kalimat Anda bernada tulisan akademis dengan kosakata berbobot dan struktur teratur.'
      };
    } else {
      return {
        tone: 'Percakapan Harian (Daily Conversational)',
        explanation: 'Kalimat Anda bernada percakapan sehari-hari yang alami, cocok untuk komunikasi santai, travelling, atau ngobrol umum.'
      };
    }
  },

  // Synthesize 6 tone comparison if model omitted them
  synthesizeToneComparison(baseText) {
    const cleanText = baseText.trim();
    return [
      {
        toneId: 'genz_slang',
        toneLabel: 'Gen Z & Internet Slang',
        persona: 'Zoe (Gen Z)',
        badge: 'HYPE & TRENDING',
        icon: '⚡',
        text: `Bro, I’m literally cooked fr, lowkey just gotta pull up and ${cleanText.toLowerCase().replace(/^[i|i'm|i am]\s*/i, '')}`,
        nuance: 'Kapan dipakai: Chat sosmed (TikTok, Reels, X), gaming, atau sesama anak muda.',
        keyDifference: 'Slang viral: "literally cooked", "lowkey", "fr" (for real).'
      },
      {
        toneId: 'close_friend',
        toneLabel: 'Teman Akrab & Singkatan',
        persona: 'Sam (Teman Nongkrong)',
        badge: 'WANNA / GONNA',
        icon: '🤙',
        text: `${cleanText.replace(/\bwant to\b/gi, 'wanna').replace(/\bgoing to\b/gi, 'gonna').replace(/\bhave to\b/gi, 'gotta')}, man.`,
        nuance: 'Kapan dipakai: Chat WhatsApp sahabat akrab, nongkrong santai sesama teman.',
        keyDifference: 'Kontraksi lisan alami (wanna, gonna, gotta) dan nada rileks.'
      },
      {
        toneId: 'daily_conversational',
        toneLabel: 'Percakapan Harian',
        persona: 'Emma (Percakapan Harian)',
        badge: 'NATURAL & SANTAI',
        icon: '💬',
        text: cleanText,
        nuance: 'Kapan dipakai: Bicara sehari-hari dengan keluarga, kenalan baru, atau travelling.',
        keyDifference: 'Struktur luwes dan kosakata percakapan santai yang mudah dicerna.'
      },
      {
        toneId: 'courteous_polite',
        toneLabel: 'Sopan & Santun (Courteous)',
        persona: 'Claire (Sopan & Diplomatis)',
        badge: 'LEMBUT & RESPEK',
        icon: '🙏',
        text: `Excuse me, could you please help me, as ${cleanText.toLowerCase().replace(/^[i|i'm|i am]\s*/i, 'I am ')}`,
        nuance: 'Kapan dipakai: Berbicara dengan orang asing, pelayan kafe/hotel, atau orang lebih tua.',
        keyDifference: 'Frasa pembuka santun (Excuse me, could you please) dan intonasi halus.'
      },
      {
        toneId: 'business_formal',
        toneLabel: 'Formal & Bisnis',
        persona: 'David (Eksekutif Bisnis)',
        badge: 'PROFESIONAL & KANTOR',
        icon: '💼',
        text: `I would like to inform you that ${cleanText.toLowerCase().replace(/^[i|i'm|i am]\s*/i, 'I am ')}`,
        nuance: 'Kapan dipakai: Email kantor, rapat bisnis, urusan dinas resmi, atau komunikasi klien.',
        keyDifference: 'Penggunaan modal verb sopan (would like to) dan tata bahasa baku.'
      },
      {
        toneId: 'academic_intellectual',
        toneLabel: 'Akademik & Intelektual',
        persona: 'Prof. Arthur (Akademisi)',
        badge: 'MATANG & BERBOBOT',
        icon: '🎓',
        text: `It is evident that ${cleanText.toLowerCase()}`,
        nuance: 'Kapan dipakai: Esai ilmiah, jurnal, pidato resmi, atau penulisan berbobot.',
        keyDifference: 'Kosakata presisi tinggi dan susunan kalimat formal berwibawa.'
      }
    ];
  },

  // Intelligent fallback for when Ollama is offline or warming up
  generateFallbackResult(text, contextMode) {
    const trimmed = text.trim();
    let polished = trimmed;
    const changes = [];

    // Common corrections
    const replacements = [
      {
        pattern: /\bi very tired\b/gi,
        replace: "I'm very tired",
        type: 'Grammar / Tata Bahasa',
        explanation: "'Tired' adalah kata sifat (adjective), sehingga membutuhkan to be ('I am' atau 'I'm') sebelum 'tired'."
      },
      {
        pattern: /\bi very like\b/gi,
        replace: 'I really like',
        type: 'Grammar / Tata Bahasa',
        explanation: "'Very like' tidak lazim dalam bahasa Inggris alami. Penutur asli selalu menggunakan 'really like' atau 'love'."
      },
      {
        pattern: /\bcountry indonesia\b/gi,
        replace: 'Indonesia',
        type: 'Alami & Efisien',
        explanation: "Dalam bahasa Inggris cukup sebutkan nama negaranya langsung ('Indonesia' atau 'to Indonesia'), tidak perlu menambahkan kata 'country'."
      },
      {
        pattern: /\bback to country\b/gi,
        replace: 'back to',
        type: 'Alami & Efisien',
        explanation: "Cukup sebut 'back to Indonesia' atau 'return to my home country'."
      }
    ];

    for (const r of replacements) {
      if (r.pattern.test(polished)) {
        const match = polished.match(r.pattern)[0];
        polished = polished.replace(r.pattern, r.replace);
        changes.push({
          original: match,
          improved: r.replace,
          type: r.type,
          explanation: r.explanation
        });
      }
    }

    if (polished.length > 0) {
      polished = polished.charAt(0).toUpperCase() + polished.slice(1);
      if (!/[.!?]$/.test(polished)) {
        polished += '.';
      }
    }

    const detectedInputTone = this.detectInputToneHeuristic(text);

    let contextName = 'Percakapan Umum';
    if (contextMode === 'humorous_casual') contextName = 'Becanda & Santai';
    else if (contextMode === 'academic_popular') contextName = 'Akademik & Intelektual';
    else if (contextMode === 'business_formal') contextName = 'Bisnis & Profesional';
    else if (contextMode === 'courteous_polite') contextName = 'Sopan & Santun';
    else if (contextMode === 'daily_conversational') contextName = 'Percakapan Harian';

    // Comprehensive 6-tone comparison for common phrases
    let toneComparison = [];
    const lower = trimmed.toLowerCase();
    if (lower.includes('tired') && (lower.includes('airport') || lower.includes('go'))) {
      toneComparison = [
        {
          toneId: 'genz_slang',
          toneLabel: 'Gen Z & Internet Slang',
          persona: 'Zoe (Gen Z)',
          badge: 'HYPE & TRENDING',
          icon: '⚡',
          text: "Bro I’m literally cooked fr, lowkey just gotta pull up to the airport and fly back to Indo.",
          nuance: 'Kapan dipakai: Chat medsos (TikTok, Reels, X), gaming, atau sesama anak muda.',
          keyDifference: "Slang kekinian: 'literally cooked' (capek parah), 'lowkey', 'pull up to', dan 'Indo'."
        },
        {
          toneId: 'close_friend',
          toneLabel: 'Teman Akrab & Singkatan',
          persona: 'Sam (Teman Nongkrong)',
          badge: 'WANNA / GONNA',
          icon: '🤙',
          text: "I'm so tired, man. I wanna head to the airport and go back to Indonesia already.",
          nuance: 'Kapan dipakai: Chat WhatsApp sahabat akrab, ngobrol santai sesama teman.',
          keyDifference: "Kontraksi lisan alami: 'wanna', 'head to', panggilan akrab 'man/bro'."
        },
        {
          toneId: 'daily_conversational',
          toneLabel: 'Percakapan Harian',
          persona: 'Emma (Percakapan Harian)',
          badge: 'NATURAL & SANTAI',
          icon: '💬',
          text: "I'm really exhausted, so I want to get to the airport and fly home to Indonesia.",
          nuance: 'Kapan dipakai: Percakapan umum sehari-hari, travelling, atau ngobrol ramah.',
          keyDifference: "Bahasa mengalir santai tanpa singkatan berlebihan dan tanpa istilah kaku."
        },
        {
          toneId: 'courteous_polite',
          toneLabel: 'Sopan & Santun (Courteous)',
          persona: 'Claire (Sopan & Diplomatis)',
          badge: 'LEMBUT & RESPEK',
          icon: '🙏',
          text: "Excuse me, I'm feeling quite exhausted. Could you please help me get to the airport so I can return to Indonesia?",
          nuance: 'Kapan dipakai: Berbicara dengan orang asing, pelayan kafe/hotel, atau orang lebih tua.',
          keyDifference: "Frasa kesantunan diplomatis: 'Excuse me', 'could you please', 'I would appreciate it'."
        },
        {
          toneId: 'business_formal',
          toneLabel: 'Formal & Bisnis',
          persona: 'David (Eksekutif Bisnis)',
          badge: 'PROFESIONAL & KANTOR',
          icon: '💼',
          text: "Due to considerable fatigue, I would like to arrange travel to the airport for my scheduled return to Indonesia.",
          nuance: 'Kapan dipakai: Email kantor, rapat bisnis, urusan dinas resmi, atau komunikasi klien.',
          keyDifference: "Kosakata teratur dan lugas: 'Due to considerable fatigue', 'would like to arrange', 'scheduled return'."
        },
        {
          toneId: 'academic_intellectual',
          toneLabel: 'Akademik & Intelektual',
          persona: 'Prof. Arthur (Akademisi)',
          badge: 'MATANG & BERBOBOT',
          icon: '🎓',
          text: "Experiencing significant physical fatigue, I intend to proceed to the international airport to repatriate to Indonesia.",
          nuance: 'Kapan dipakai: Esai ilmiah, jurnal, pidato resmi, atau penulisan tingkat tinggi.',
          keyDifference: "Diksi presisi tinggi dan struktur kompleks seperti 'Experiencing significant fatigue', 'repatriate'."
        }
      ];
    } else {
      toneComparison = this.synthesizeToneComparison(polished);
    }

    return {
      originalText: text,
      detectedInputTone,
      contextDetected: contextName,
      polishedText: polished,
      overallSummary: `Kalimat berhasil disesuaikan dengan tata bahasa yang lebih tepat dan gaya bahasa yang natural.`,
      changes: changes.length > 0 ? changes : [
        {
          original: text,
          improved: polished,
          type: 'Penyempurnaan Struktur & Huruf Kapital',
          explanation: 'Memastikan kapitalisasi huruf di awal kalimat serta tanda baca akhir yang benar.'
        }
      ],
      toneComparison,
      alternativeVersions: [
        {
          tone: 'Alternatif Tambahan',
          text: polished.replace(/\bI really like\b/i, 'I totally love')
        }
      ]
    };
  }
};
