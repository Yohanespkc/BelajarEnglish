/**
 * Honor Scoring Service & Professional Game-Tier Evaluator
 * Features:
 * 1. 4-Pillar Metric Matrix: Grammar (30%), Contextual Relevance (35%), Vocabulary (20%), Fluency (15%)
 * 2. Competitive Game Ranks: S+, S, A, B, C, D
 * 3. Honor Token (Token Kehormatan) Economy
 * 4. 7-Tier Prestige Honorary Titles (Gelar-Gelar Kehormatan)
 * 5. Unified AI-powered in-character roleplay evaluation with offline fallback
 */

import { aiProviderService } from './aiProviderService';

export const HONORARY_TITLES = [
  {
    id: 'novice',
    tier: 1,
    name: 'Novice Speaker',
    nameId: 'Penutur Pemula',
    icon: '🥉',
    minTokens: 0,
    maxTokens: 99,
    badgeColor: '#cd7f32',
    accentGradient: 'linear-gradient(135deg, #cd7f32, #8c5220)',
    description: 'Mulai memahami sapaan dasar dan menyusun kalimat pendek dengan percaya diri.',
    perks: 'Akses ke skenario dasar (Kafe & Hotel)'
  },
  {
    id: 'apprentice',
    tier: 2,
    name: 'Apprentice Conversationalist',
    nameId: 'Petualang Percakapan',
    icon: '🥈',
    minTokens: 100,
    maxTokens: 299,
    badgeColor: '#a0aec0',
    accentGradient: 'linear-gradient(135deg, #a0aec0, #718096)',
    description: 'Mampu berdialog dalam situasi umum (pesan makan, petunjuk arah, imigrasi bandara).',
    perks: 'Bonus Pengali Streak Token x1.1'
  },
  {
    id: 'fluent_explorer',
    tier: 3,
    name: 'Fluent Explorer',
    nameId: 'Penjelajah Fasih',
    icon: '🥇',
    minTokens: 300,
    maxTokens: 599,
    badgeColor: '#f6ad55',
    accentGradient: 'linear-gradient(135deg, #f6ad55, #d69e2e)',
    description: 'Kosakata semakin variatif, struktur kalimat kompleks, dan minim kesalahan gramatikal.',
    perks: 'Akses Skenario Wawancara Kerja & Negosiasi'
  },
  {
    id: 'eloquent_diplomat',
    tier: 4,
    name: 'Eloquent Diplomat',
    nameId: 'Diplomat Luwes',
    icon: '🎖️',
    minTokens: 600,
    maxTokens: 999,
    badgeColor: '#38b2ac',
    accentGradient: 'linear-gradient(135deg, #38b2ac, #234e52)',
    description: 'Menguasai etika percakapan formal, intonasi diplomatis, dan idiom situasional.',
    perks: 'Gelar Kehormatan Terverifikasi di Profil & Komunitas'
  },
  {
    id: 'master_linguist',
    tier: 5,
    name: 'Master Linguist',
    nameId: 'Maestro Linguistik',
    icon: '💎',
    minTokens: 1000,
    maxTokens: 1799,
    badgeColor: '#4299e1',
    accentGradient: 'linear-gradient(135deg, #4299e1, #2b6cb0)',
    description: 'Memahami nuansa semantik halus, etimologi kata, dan slang modern tanpa ragu.',
    perks: 'Bonus Token x1.3 & Bingkai Profil Berlian'
  },
  {
    id: 'grand_rhetorician',
    tier: 6,
    name: 'Grand Rhetorician',
    nameId: 'Orator Agung',
    icon: '👑',
    minTokens: 1800,
    maxTokens: 2999,
    badgeColor: '#9f7aea',
    accentGradient: 'linear-gradient(135deg, #9f7aea, #6b46c1)',
    description: 'Kemampuan artikulasi dan persuasi kelas dunia dengan konsistensi skor Grade S.',
    perks: 'Aura Mahkota Emas & Pengali Token Maksimal x1.5'
  },
  {
    id: 'sovereign_polyglot',
    tier: 7,
    name: 'Sovereign Polyglot',
    nameId: 'Penguasa Multibahasa Legendaris',
    icon: '🌌',
    minTokens: 3000,
    maxTokens: Infinity,
    badgeColor: '#ed64a6',
    accentGradient: 'linear-gradient(135deg, #f6ad55 0%, #ed64a6 50%, #9f7aea 100%)',
    description: 'Gelar Kehormatan tertinggi para legenda; kemahiran bahasa tanpa cela di seluruh alam semesta!',
    perks: 'Status Immortal Polyglot & Akses Eksklusif Semua Fitur Masa Depan'
  }
];

export const honorScoringService = {
  // Get current title by total tokens
  getHonorTitle(tokens = 0) {
    const safeTokens = Math.max(0, Number(tokens) || 0);
    const title = HONORARY_TITLES.find(t => safeTokens >= t.minTokens && safeTokens <= t.maxTokens) 
      || HONORARY_TITLES[0];

    const currentTierIndex = HONORARY_TITLES.findIndex(t => t.id === title.id);
    const nextTitle = currentTierIndex < HONORARY_TITLES.length - 1 ? HONORARY_TITLES[currentTierIndex + 1] : null;

    let progressToNext = 100;
    let tokensNeeded = 0;
    if (nextTitle) {
      const range = nextTitle.minTokens - title.minTokens;
      const earnedInRange = safeTokens - title.minTokens;
      progressToNext = Math.min(100, Math.max(0, Math.round((earnedInRange / range) * 100)));
      tokensNeeded = Math.max(0, nextTitle.minTokens - safeTokens);
    }

    return {
      ...title,
      currentTokens: safeTokens,
      nextTitle,
      progressToNext,
      tokensNeeded
    };
  },

  // Calculate Grade from 0-100 total score
  getGrade(score) {
    if (score >= 95) {
      return { grade: 'S+', label: 'Grandmaster Perfection', color: '#ffc800', bg: 'rgba(255, 200, 0, 0.2)', tokens: 15, isPass: true };
    }
    if (score >= 90) {
      return { grade: 'S', label: 'Flawless Expression', color: '#58cc02', bg: 'rgba(88, 204, 2, 0.2)', tokens: 12, isPass: true };
    }
    if (score >= 80) {
      return { grade: 'A', label: 'Sharp & Natural', color: '#1cb0f6', bg: 'rgba(28, 176, 246, 0.2)', tokens: 8, isPass: true };
    }
    if (score >= 70) {
      return { grade: 'B', label: 'Competent & Clear', color: '#ce82ff', bg: 'rgba(206, 130, 255, 0.2)', tokens: 4, isPass: true };
    }
    if (score >= 50) {
      return { grade: 'C', label: 'Needs Polish', color: '#ff9600', bg: 'rgba(255, 150, 0, 0.2)', tokens: 1, isPass: true };
    }
    return { grade: 'D', label: 'Incorrect / Off-Topic', color: '#ff4b4b', bg: 'rgba(255, 75, 75, 0.2)', tokens: 0, isPass: false };
  },

  // Evaluate a roleplay message using Unified AI (Gemini / Groq / Ollama / OpenAI)
  async evaluateRoleplayTurn({ userText, scenario, conversationHistory = [] }) {
    const trimmed = (userText || '').trim();
    if (!trimmed) {
      return this.getFallbackEvaluation(trimmed, scenario, 'Pesan kosong.');
    }

    const systemPrompt = `You are a strict, professional English language examiner and conversational roleplay evaluator for an educational language learning game.
The scenario is: "${scenario.title}" (${scenario.category}, ${scenario.difficulty} level).
The character persona: "${scenario.systemPrompt}".

YOUR DUAL ROLE:
1. Roleplay Partner: Provide a short, highly realistic in-character spoken English response (1-2 sentences).
   - CRITICAL: If the user's reply is OFF-TOPIC, GRAMMATICALLY NONSENSICAL, FACTUALLY WRONG FOR THE SCENARIO (e.g. asking for cat food or car tires at Starbucks, or talking in Indonesian, or saying gibberish), DO NOT pretend they are right! Respond realistically in character (e.g., "Excuse me? We only serve coffee, tea, and bakery items here. Did you want to order a beverage?").
2. Professional Game Evaluator: Objectively score their input across 4 distinct pillars (0-100 each):
   - grammarScore (30% weight): syntax, verb tenses, subject-verb agreement, prepositions.
   - contextScore (35% weight): does it directly and appropriately respond to the persona and situation?
   - vocabScore (20% weight): vocabulary appropriateness, natural collocations, idioms.
   - fluencyScore (15% weight): sentence flow, natural spoken English phrasing.

IMPORTANT: If the user answered wrong, nonsensically, or completely off-topic:
- Set isAppropriate to false.
- contextScore MUST be below 50.
- Provide a clear, polite explanation in Indonesian explaining why it was inappropriate or wrong, and provide the exact sentence they SHOULD have said in English.

RETURN ONLY VALID JSON (no markdown formatting, no other text) with this EXACT structure:
{
  "inCharacterResponse": "realistic spoken reply in English",
  "isAppropriate": true or false,
  "grammarScore": number 0-100,
  "contextScore": number 0-100,
  "vocabScore": number 0-100,
  "fluencyScore": number 0-100,
  "correction": "corrected or better English sentence if there was an error, or null if already great",
  "explanation": "Penjelasan singkat dalam bahasa Indonesia mengenai kesalahan atau tips penyempurnaan.",
  "highlightMistake": "frasa spesifik yang salah, atau null"
}`;

    // Format chat history for context
    const messages = [
      ...conversationHistory.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      {
        role: 'user',
        content: `User said in the scenario: "${trimmed}"`
      }
    ];

    try {
      const response = await aiProviderService.chatCompletion({
        messages,
        systemPrompt,
        temperature: 0.25,
        jsonMode: true
      });

      let jsonStr = response.content.trim();
      // Remove any markdown fence if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(json)?\n/, '').replace(/\n```$/, '').trim();
      }

      const parsed = JSON.parse(jsonStr);

      const grammarScore = Math.min(100, Math.max(0, Number(parsed.grammarScore) || 50));
      const contextScore = Math.min(100, Math.max(0, Number(parsed.contextScore) || 50));
      const vocabScore = Math.min(100, Math.max(0, Number(parsed.vocabScore) || 50));
      const fluencyScore = Math.min(100, Math.max(0, Number(parsed.fluencyScore) || 50));

      // Weighted total score
      const totalScore = Math.round(
        (grammarScore * 0.30) +
        (contextScore * 0.35) +
        (vocabScore * 0.20) +
        (fluencyScore * 0.15)
      );

      const gradeInfo = this.getGrade(totalScore);

      return {
        success: true,
        inCharacterResponse: parsed.inCharacterResponse || "I'm sorry, could you please repeat that?",
        isAppropriate: parsed.isAppropriate ?? (totalScore >= 60),
        totalScore,
        grade: gradeInfo.grade,
        gradeLabel: gradeInfo.label,
        gradeColor: gradeInfo.color,
        tokensAwarded: gradeInfo.tokens,
        breakdown: {
          grammarScore,
          contextScore,
          vocabScore,
          fluencyScore
        },
        correction: parsed.correction || null,
        explanation: parsed.explanation || null,
        highlightMistake: parsed.highlightMistake || null,
        providerUsed: response.providerName || 'AI Engine'
      };
    } catch (e) {
      console.warn('AI Roleplay evaluation fallback triggered:', e.message);
      return this.getFallbackEvaluation(trimmed, scenario, e.message);
    }
  },

  // Intelligent heuristic fallback when offline or AI call fails
  getFallbackEvaluation(userText, scenario, _reason) {
    const text = (userText || '').trim().toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);

    let contextScore = 40;
    let grammarScore = 60;
    let vocabScore = 50;
    let fluencyScore = 50;
    let inCharacterResponse = "Pardon me? Could you please clarify what you mean?";
    let correction = null;
    let explanation = "Kalimat Anda kurang spesifik untuk konteks skenario ini. Coba gunakan ungkapan standar bahasa Inggris.";
    let isAppropriate = false;

    // Indonesian words detector (flagging non-English)
    const indonesianWords = ['saya', 'mau', 'beli', 'ini', 'apa', 'kopi', 'tidak', 'tolong', 'ada', 'bisa', 'kucing', 'makan'];
    const hasIndo = words.some(w => indonesianWords.includes(w));

    if (scenario.id === 'cafe-order') {
      const cafeKeywords = ['coffee', 'latte', 'espresso', 'tea', 'water', 'iced', 'cup', 'hot', 'size', 'tall', 'grande', 'venti', 'croissant', 'sandwich', 'order', 'please', 'like', 'want', 'have', 'get'];
      const matchCount = words.filter(w => cafeKeywords.includes(w)).length;

      if (hasIndo) {
        contextScore = 20;
        grammarScore = 25;
        inCharacterResponse = "Sorry, I only speak English! Did you want to order coffee, tea, or a snack?";
        correction = "Can I get an iced latte, please?";
        explanation = "Tampaknya Anda menggunakan kata dalam bahasa Indonesia. Dalam simulasi ini, barista hanya merespons bahasa Inggris.";
      } else if (matchCount >= 2) {
        contextScore = 88;
        grammarScore = 85;
        vocabScore = 82;
        fluencyScore = 80;
        isAppropriate = true;
        inCharacterResponse = "Sure thing! What size would you like for that: Tall, Grande, or Venti?";
        explanation = "Pilihan kata Anda tepat dan relevan untuk memesan di kafe.";
      } else if (text.includes('sleep') || text.includes('car') || text.includes('cat') || text.includes('hotel') || text.includes('flight')) {
        contextScore = 15;
        grammarScore = 50;
        inCharacterResponse = "Excuse me? This is a coffee shop, we only sell beverages and bakery items. What would you like to drink?";
        correction = "I would like a cup of coffee, please.";
        explanation = "Topik yang Anda sampaikan tidak sesuai konteks pemesanan kafe.";
      } else {
        contextScore = 45;
        inCharacterResponse = "I didn't quite get that. Could you tell me which beverage you'd like to order?";
        correction = "I would like to order a regular cappuccino, please.";
        explanation = "Jawaban belum menyebutkan pesanan minuman atau makanan dengan jelas.";
      }
    } else if (scenario.id === 'airport-customs') {
      const airportKeywords = ['vacation', 'holiday', 'visit', 'business', 'days', 'week', 'passport', 'hotel', 'conference', 'stay', 'here'];
      const matchCount = words.filter(w => airportKeywords.includes(w)).length;

      if (hasIndo) {
        contextScore = 20;
        grammarScore = 20;
        inCharacterResponse = "Sir/Madam, English please. State the purpose of your visit to the UK.";
        correction = "I am visiting London for a 7-day vacation.";
        explanation = "Petugas imigrasi bandara internasional mewajibkan komunikasi dalam bahasa Inggris.";
      } else if (matchCount >= 2) {
        contextScore = 90;
        grammarScore = 85;
        vocabScore = 85;
        fluencyScore = 85;
        isAppropriate = true;
        inCharacterResponse = "Thank you. And where will you be staying during your time in London?";
        explanation = "Jawaban Anda lugas dan tepat menjawab pertanyaan petugas imigrasi.";
      } else {
        contextScore = 30;
        inCharacterResponse = "That does not answer my question. Why have you come to the United Kingdom?";
        correction = "I am here on vacation to visit some friends for two weeks.";
        explanation = "Jawaban tidak menjelaskan tujuan kunjungan dengan jelas kepada petugas imigrasi.";
      }
    } else {
      // General fallback
      if (words.length >= 4 && !hasIndo) {
        contextScore = 75;
        grammarScore = 75;
        vocabScore = 70;
        fluencyScore = 70;
        isAppropriate = true;
        inCharacterResponse = "Understood! Could you elaborate a bit more on that?";
        explanation = "Struktur kalimat Anda cukup baik. Tingkatkan lagi kosakata spesifik agar mendapat skor S.";
      } else {
        contextScore = 35;
        grammarScore = 40;
        inCharacterResponse = "Sorry, could you explain that in more detail in English?";
        correction = "Could you please explain that again?";
        explanation = "Kalimat terlalu singkat atau kurang tepat sasaran.";
      }
    }

    const totalScore = Math.round(
      (grammarScore * 0.30) +
      (contextScore * 0.35) +
      (vocabScore * 0.20) +
      (fluencyScore * 0.15)
    );

    const gradeInfo = this.getGrade(totalScore);

    return {
      success: true,
      inCharacterResponse,
      isAppropriate,
      totalScore,
      grade: gradeInfo.grade,
      gradeLabel: gradeInfo.label,
      gradeColor: gradeInfo.color,
      tokensAwarded: gradeInfo.tokens,
      breakdown: {
        grammarScore,
        contextScore,
        vocabScore,
        fluencyScore
      },
      correction,
      explanation,
      highlightMistake: null,
      providerUsed: 'Offline Evaluator'
    };
  }
};
