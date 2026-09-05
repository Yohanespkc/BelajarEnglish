/**
 * AI English Editor Service
 * Handles contextual English rewriting & comprehensive Indonesian explanations.
 * Interfaces with local Ollama LLM (Gemma 3/4, GPT-OSS, Qwen) or provides smart local fallbacks.
 */

export const CONTEXT_MODES = [
  {
    id: 'auto',
    label: 'Auto Detect',
    icon: '⚡',
    description: 'AI mendeteksi konteks kalimat secara otomatis',
    promptGuidance: 'Automatically detect the user\'s intended tone and context (e.g., casual joke, academic statement, business inquiry, or daily chat) and refine it accordingly.'
  },
  {
    id: 'humorous_casual',
    label: 'Becanda & Santai',
    icon: '🎭',
    description: 'Slang natural, santai, lucu, & ramah tongkrongan',
    promptGuidance: 'The tone MUST be playful, humorous, witty, and casually natural (suitable for friends, social media banter, or gaming). Use natural slang, punchy phrasing, and colloquial idioms where appropriate while keeping the grammar sound.'
  },
  {
    id: 'academic_popular',
    label: 'Akademik Populer',
    icon: '🎓',
    description: 'Ilmiah populer, artikel sains, & esai berbobot',
    promptGuidance: 'The tone MUST be popular academic (like scientific journals, TED talks, or high-tier essays). Use precise vocabulary, clear subject-verb structures, articulate transitions, and avoid overly stiff jargon while maintaining intellectual elegance.'
  },
  {
    id: 'business_formal',
    label: 'Bisnis & Profesional',
    icon: '💼',
    description: 'Email kantor, meeting, & komunikasi profesional',
    promptGuidance: 'The tone MUST be professional, polished, concise, and courteous (suitable for workplace emails, reports, or business correspondence). Use polite modal verbs and clear corporate phrasing.'
  },
  {
    id: 'daily_conversational',
    label: 'Percakapan Harian',
    icon: '💬',
    description: 'Natural sehari-hari untuk ngobrol & travelling',
    promptGuidance: 'The tone MUST be natural everyday conversational English (as spoken by native speakers in daily life, travelling, or casual chats). Smooth, fluent, and approachable.'
  }
];

export const aiEnglishEditorService = {
  // Fetch available models from local Ollama
  async getAvailableModels() {
    try {
      const response = await fetch('/api/ollama/api/tags', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.models && data.models.length > 0) {
          return data.models.map(m => m.name);
        }
      }
    } catch (e) {
      console.warn('Ollama tags lookup via proxy failed, using default list:', e);
    }
    return ['gemma3:4b', 'gemma4:latest', 'gpt-oss:20b', 'qwen2.5:0.5b'];
  },

  // Generate system prompt
  buildSystemPrompt(contextModeId) {
    const context = CONTEXT_MODES.find(c => c.id === contextModeId) || CONTEXT_MODES[0];

    return `You are an elite bilingual English Editor and Linguistics Coach.
Your mission is to examine English sentences or paragraphs written by the user, rewrite them into top-tier, natural, idiomatic English tailored to their chosen context, and provide a clear, educational explanation in Indonesian.

Chosen Context / Tone Guideline:
"${context.label}": ${context.promptGuidance}

Instructions:
1. Revise the input into natural English that fits the context perfectly. If it's humorous/casual banter, make it witty and colloquial. If it's academic popular, make it articulate and scientifically clear.
2. Identify why each specific word or phrase was changed (grammar fix, natural collocation, lexical upgrade, or tone adjustment).
3. Provide all explanations strictly in friendly, pedagogical Indonesian (Bahasa Indonesia).
4. Return your output STRICTLY as a valid JSON object with the following schema:
{
  "contextDetected": "Konteks & nada yang diterapkan (misal: Becanda & Santai / Humor Santai)",
  "polishedText": "The perfected English text",
  "overallSummary": "Ringkasan penjelasan umum dalam bahasa Indonesia (1-2 kalimat) mengapa kalimat ini disesuaikan.",
  "changes": [
    {
      "original": "frasa/kata lama",
      "improved": "frasa/kata baru",
      "type": "Grammar / Tata Bahasa" | "Pilihan Kata (Vocabulary)" | "Nada & Konteks" | "Idiom Alami",
      "explanation": "Penjelasan mengapa diubah dalam bahasa Indonesia yang mudah dipahami."
    }
  ],
  "alternativeVersions": [
    {
      "tone": "Alternatif (misal: Versi Ekstra Santai atau Versi Lebih Formal)",
      "text": "Alternative polished English variation"
    }
  ]
}

DO NOT include markdown wrappers around the JSON if possible, or use standard \`\`\`json. Ensure valid JSON only.`;
  },

  // Edit English text
  async editEnglishText({ text, contextMode = 'auto', model = 'gemma3:4b' }) {
    if (!text || !text.trim()) {
      throw new Error('Teks bahasa Inggris tidak boleh kosong.');
    }

    const systemPrompt = this.buildSystemPrompt(contextMode);

    try {
      const response = await fetch('/api/ollama/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || 'gemma3:4b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Please edit this English text:\n"${text}"` }
          ],
          stream: false,
          options: {
            temperature: 0.4
          }
        }),
        signal: AbortSignal.timeout(45000)
      });

      if (!response.ok) {
        throw new Error(`Ollama response error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const rawContent = data.message?.content || '';

      // Parse JSON from output
      const parsedResult = this.parseJsonFromContent(rawContent, text, contextMode);
      return {
        success: true,
        data: parsedResult,
        modelUsed: data.model || model,
        isAiGenerated: true
      };
    } catch (err) {
      console.warn('Ollama API request failed, activating intelligent heuristic fallback:', err);
      const fallbackResult = this.generateFallbackResult(text, contextMode);
      return {
        success: true,
        data: fallbackResult,
        modelUsed: 'Local Smart Heuristic',
        isAiGenerated: false,
        warning: 'Local Ollama tidak merespons atau sedang sibuk. Menampilkan hasil koreksi offline cerdas.'
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
          return {
            originalText,
            contextDetected: parsed.contextDetected || 'Deteksi Otomatis',
            polishedText: parsed.polishedText,
            overallSummary: parsed.overallSummary || 'Berikut adalah penyempurnaan bahasa Inggris dengan penyesuaian konteks dan tata bahasa.',
            changes: Array.isArray(parsed.changes) ? parsed.changes : [],
            alternativeVersions: Array.isArray(parsed.alternativeVersions) ? parsed.alternativeVersions : []
          };
        }
      } catch (e) {
        console.warn('Failed parsing matched JSON:', e);
      }
    }

    // If model returned plain text instead of JSON
    return {
      originalText,
      contextDetected: contextMode === 'auto' ? 'Konteks Terdeteksi' : contextMode,
      polishedText: clean.split('\n\n')[0] || clean,
      overallSummary: 'Teks bahasa Inggris telah disesuaikan agar lebih natural sesuai konteks.',
      changes: [
        {
          original: originalText,
          improved: clean.split('\n\n')[0] || clean,
          type: 'Penyempurnaan Total',
          explanation: clean
        }
      ],
      alternativeVersions: []
    };
  },

  // Intelligent fallback for when Ollama is offline or warming up
  generateFallbackResult(text, contextMode) {
    const trimmed = text.trim();
    let polished = trimmed;
    const changes = [];

    // Common corrections
    const replacements = [
      {
        pattern: /\bi very like\b/gi,
        replace: 'I really like',
        type: 'Grammar / Tata Bahasa',
        explanation: "'Very like' tidak lazim dalam bahasa Inggris alami. Penutur asli selalu menggunakan 'really like' atau 'love'."
      },
      {
        pattern: /\bi like very much\b/gi,
        replace: 'I like it very much',
        type: 'Grammar / Tata Bahasa',
        explanation: "Kata kerja transitif 'like' memerlukan objek ('it') sebelum frasa 'very much'."
      },
      {
        pattern: /\bhe is very noob\b/gi,
        replace: "he's a total noob",
        type: 'Pilihan Kata & Slang',
        explanation: "'Noob' umumnya dipakai sebagai kata benda informal ('a total noob') dalam bahasa santai/game daripada 'very noob'."
      },
      {
        pattern: /\bwe do research\b/gi,
        replace: 'we conduct research',
        type: 'Pilihan Kata Akademis',
        explanation: "Dalam konteks formal/akademis, kolokasi yang tepat dan berbobot adalah 'conduct research' atau 'carry out research', bukan sekadar 'do research'."
      },
      {
        pattern: /\bmore good\b/gi,
        replace: 'better',
        type: 'Grammar / Tata Bahasa',
        explanation: "Bentuk komparatif dari 'good' adalah kata tak beraturan 'better', bukan 'more good'."
      },
      {
        pattern: /\bmany peoples\b/gi,
        replace: 'many people',
        type: 'Grammar / Tata Bahasa',
        explanation: "'People' sudah merupakan bentuk jamak (plural) dari 'person'. 'Peoples' hanya digunakan untuk merujuk pada banyak suku/bangsa."
      },
      {
        pattern: /\bthanks you\b/gi,
        replace: 'thank you',
        type: 'Grammar / Tata Bahasa',
        explanation: "Gunakan 'thank you' atau 'thanks', jangan gabungkan keduanya menjadi 'thanks you'."
      },
      {
        pattern: /\bhow to say\b/gi,
        replace: 'how do you say',
        type: 'Tata Bahasa & Percakapan',
        explanation: "Dalam kalimat tanya, gunakan auxiliary verb 'do': 'How do you say...?' agar grammatically correct."
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

    // Capitalize first letter and add punctuation if missing
    if (polished.length > 0) {
      polished = polished.charAt(0).toUpperCase() + polished.slice(1);
      if (!/[.!?]$/.test(polished)) {
        polished += '.';
      }
    }

    let contextName = 'Percakapan Umum';
    if (contextMode === 'humorous_casual') contextName = 'Becanda & Santai (Casual/Humorous)';
    else if (contextMode === 'academic_popular') contextName = 'Akademik Populer';
    else if (contextMode === 'business_formal') contextName = 'Bisnis & Profesional';

    return {
      originalText: text,
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
      alternativeVersions: [
        {
          tone: 'Alternatif Lebih Kasual',
          text: polished.replace(/\bI really like\b/i, 'I totally love')
        }
      ]
    };
  }
};
