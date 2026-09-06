/**
 * AI Provider Service
 * Multi-provider LLM orchestration supporting:
 * 1. Groq Cloud (Free tier, ultra-fast ~0.3s response, ideal for sharing with friends)
 * 2. Google Gemini API (Free tier)
 * 3. Local Ollama (Local offline development)
 * 4. OpenAI / OpenRouter / DeepSeek (Custom OpenAI-compatible endpoints)
 */

export const AI_PROVIDERS = {
  GROQ: 'groq',
  GEMINI: 'gemini',
  OLLAMA: 'ollama',
  OPENAI: 'openai'
};

export const PROVIDER_METADATA = {
  [AI_PROVIDERS.GROQ]: {
    id: AI_PROVIDERS.GROQ,
    name: 'Groq Cloud',
    badge: 'GRATIS & TERCEPAT ⚡',
    recommended: true,
    description: 'Sangat direkomendasikan untuk teman! Respon kilat 0.3 detik tanpa perlu install apapun di laptop/HP.',
    defaultModel: 'llama-3.3-70b-versatile',
    availableModels: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Paling Cerdas & Akurat)' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Super Kilat)' },
      { id: 'gemma2-9b-it', label: 'Google Gemma 2 9B' }
    ],
    getKeyUrl: 'https://console.groq.com/keys',
    keyHelpText: 'Dapatkan API Key gratis dalam 30 detik di console.groq.com'
  },
  [AI_PROVIDERS.GEMINI]: {
    id: AI_PROVIDERS.GEMINI,
    name: 'Google Gemini',
    badge: 'FREE TIER 🌟',
    recommended: false,
    description: 'Model multimodal Google dengan pemahaman bahasa Indonesia & Inggris yang sangat natural.',
    defaultModel: 'gemini-flash-latest',
    availableModels: [
      { id: 'gemini-flash-latest', label: 'Gemini Flash (Rekomendasi - Cepat & Stabil)' },
      { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash (Respon Kilat)' },
      { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Next-Gen)' },
      { id: 'gemini-pro-latest', label: 'Gemini Pro (Penalaran Mendalam)' }
    ],
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    keyHelpText: 'Dapatkan API Key gratis di Google AI Studio'
  },
  [AI_PROVIDERS.OLLAMA]: {
    id: AI_PROVIDERS.OLLAMA,
    name: 'Local Ollama',
    badge: 'OFFLINE / LOCAL 🖥️',
    recommended: false,
    description: 'Berjalan 100% offline di localhost:11434. Cocok jika Anda punya GPU/RAM besar dan ingin tanpa internet.',
    defaultModel: 'gemma3:4b',
    availableModels: [
      { id: 'gemma3:4b', label: 'Gemma 3 4B (Local)' },
      { id: 'gemma4:latest', label: 'Gemma 4 (Local)' },
      { id: 'gpt-oss:20b', label: 'GPT-OSS 20B (Local)' },
      { id: 'qwen2.5:0.5b', label: 'Qwen 2.5 0.5B (Local Ringan)' }
    ],
    getKeyUrl: 'https://ollama.com',
    keyHelpText: 'Pastikan aplikasi Ollama berjalan di background (localhost:11434)'
  },
  [AI_PROVIDERS.OPENAI]: {
    id: AI_PROVIDERS.OPENAI,
    name: 'OpenAI / Custom',
    badge: 'FLEKSIBEL 🌐',
    recommended: false,
    description: 'Gunakan OpenAI, OpenRouter, DeepSeek, atau proxy API kompatibel lainnya.',
    defaultModel: 'gpt-4o-mini',
    availableModels: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'deepseek-chat', label: 'DeepSeek Chat' }
    ],
    getKeyUrl: 'https://platform.openai.com/api-keys',
    keyHelpText: 'Masukkan API Key dan Base URL kustom jika menggunakan OpenRouter/DeepSeek'
  }
};

const STORAGE_KEY = 'belajarenglish_ai_config';

export const aiProviderService = {
  // Get active configuration from storage or fallback to env vars
  getConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          provider: parsed.provider || AI_PROVIDERS.GROQ,
          groqApiKey: parsed.groqApiKey || import.meta.env?.VITE_GROQ_API_KEY || '',
          geminiApiKey: parsed.geminiApiKey || import.meta.env?.VITE_GEMINI_API_KEY || '',
          openaiApiKey: parsed.openaiApiKey || import.meta.env?.VITE_OPENAI_API_KEY || '',
          openaiBaseUrl: parsed.openaiBaseUrl || 'https://api.openai.com/v1',
          ollamaBaseUrl: parsed.ollamaBaseUrl || '/api/ollama',
          selectedModel: parsed.selectedModel || PROVIDER_METADATA[parsed.provider || AI_PROVIDERS.GROQ]?.defaultModel || 'llama-3.3-70b-versatile',
          autoFallback: parsed.autoFallback !== false
        };
      }
    } catch (e) {
      console.warn('Failed to parse AI config from localStorage:', e);
    }

    // Default configuration (Prioritize Groq if env key exists, or default to Groq for ease of use)
    const envGroq = import.meta.env?.VITE_GROQ_API_KEY || '';
    const envGemini = import.meta.env?.VITE_GEMINI_API_KEY || '';
    const initialProvider = envGroq ? AI_PROVIDERS.GROQ : (envGemini ? AI_PROVIDERS.GEMINI : AI_PROVIDERS.GROQ);

    return {
      provider: initialProvider,
      groqApiKey: envGroq,
      geminiApiKey: envGemini,
      openaiApiKey: '',
      openaiBaseUrl: 'https://api.openai.com/v1',
      ollamaBaseUrl: '/api/ollama',
      selectedModel: PROVIDER_METADATA[initialProvider]?.defaultModel || 'llama-3.3-70b-versatile',
      autoFallback: true
    };
  },

  // Save updated configuration
  saveConfig(newConfig) {
    try {
      const current = this.getConfig();
      const updated = { ...current, ...newConfig };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('belajarenglish_ai_config_updated', { detail: updated }));
      return updated;
    } catch (e) {
      console.error('Failed to save AI config:', e);
      return newConfig;
    }
  },

  // Get list of models available for current or specified provider
  async getModels(providerOverride = null) {
    const config = this.getConfig();
    const provider = providerOverride || config.provider;

    if (provider === AI_PROVIDERS.OLLAMA) {
      try {
        const response = await fetch(`${config.ollamaBaseUrl}/api/tags`, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.models && data.models.length > 0) {
            return data.models.map(m => ({ id: m.name, label: `${m.name} (Local)` }));
          }
        }
      } catch (e) {
        console.warn('Ollama tags lookup failed, returning default list:', e);
      }
    }

    return PROVIDER_METADATA[provider]?.availableModels || [];
  },

  // Test provider connection
  async testConnection(provider = null, apiKeyOverride = null) {
    const config = this.getConfig();
    const targetProvider = provider || config.provider;
    const startTime = performance.now();

    try {
      if (targetProvider === AI_PROVIDERS.GROQ) {
        const key = apiKeyOverride !== null ? apiKeyOverride : config.groqApiKey;
        if (!key) {
          return { success: false, message: 'API Key Groq belum diisi. Dapatkan gratis di console.groq.com' };
        }
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key.trim()}`
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: 'Ping! Reply with "PONG"' }],
            max_tokens: 10
          }),
          signal: AbortSignal.timeout(8000)
        });
        const latency = Math.round(performance.now() - startTime);
        if (res.ok) {
          return { success: true, latency, message: `Koneksi Groq Sukses! Respons super kilat ${latency}ms 🚀` };
        }
        const errData = await res.json().catch(() => ({}));
        return { success: false, message: errData.error?.message || `Groq Error ${res.status}: ${res.statusText}` };
      }

      if (targetProvider === AI_PROVIDERS.GEMINI) {
        const key = apiKeyOverride !== null ? apiKeyOverride : config.geminiApiKey;
        if (!key) {
          return { success: false, message: 'API Key Gemini belum diisi. Dapatkan di Google AI Studio' };
        }
        const testModel = config.selectedModel && config.selectedModel.startsWith('gemini') && config.selectedModel !== 'gemini-1.5-flash'
          ? config.selectedModel
          : 'gemini-flash-latest';
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${key.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Ping! Reply with "PONG"' }] }]
          }),
          signal: AbortSignal.timeout(8000)
        });
        const latency = Math.round(performance.now() - startTime);
        if (res.ok) {
          return { success: true, latency, message: `Koneksi Gemini Sukses! Respons ${latency}ms 🌟` };
        }
        const errData = await res.json().catch(() => ({}));
        return { success: false, message: errData.error?.message || `Gemini Error ${res.status}: ${res.statusText}` };
      }

      if (targetProvider === AI_PROVIDERS.OLLAMA) {
        const res = await fetch(`${config.ollamaBaseUrl}/api/tags`, {
          signal: AbortSignal.timeout(3000)
        });
        const latency = Math.round(performance.now() - startTime);
        if (res.ok) {
          return { success: true, latency, message: `Koneksi Ollama Lokal Terhubung! Latensi ${latency}ms 🖥️` };
        }
        return { success: false, message: 'Ollama tidak merespons di localhost:11434. Pastikan Ollama sudah dinyalakan.' };
      }

      if (targetProvider === AI_PROVIDERS.OPENAI) {
        const key = apiKeyOverride !== null ? apiKeyOverride : config.openaiApiKey;
        const baseUrl = config.openaiBaseUrl || 'https://api.openai.com/v1';
        if (!key) {
          return { success: false, message: 'API Key belum diisi.' };
        }
        const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key.trim()}`
          },
          body: JSON.stringify({
            model: config.selectedModel || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Ping' }],
            max_tokens: 10
          }),
          signal: AbortSignal.timeout(8000)
        });
        const latency = Math.round(performance.now() - startTime);
        if (res.ok) {
          return { success: true, latency, message: `Koneksi API Sukses! Latensi ${latency}ms` };
        }
        const errData = await res.json().catch(() => ({}));
        return { success: false, message: errData.error?.message || `Error ${res.status}` };
      }

      return { success: false, message: 'Provider tidak dikenali' };
    } catch (e) {
      return { success: false, message: `Gagal terhubung: ${e.message || 'Network Timeout'}` };
    }
  },

  // Central Chat Completion dispatcher
  async chatCompletion({ messages, systemPrompt = '', model = null, temperature = 0.35, jsonMode = false }) {
    const config = this.getConfig();
    const provider = config.provider;
    const targetModel = model || config.selectedModel || PROVIDER_METADATA[provider]?.defaultModel;

    // Prepare unified messages array with system prompt if provided
    const unifiedMessages = [];
    if (systemPrompt) {
      unifiedMessages.push({ role: 'system', content: systemPrompt });
    }
    unifiedMessages.push(...messages);

    // 1. GROQ CLOUD
    if (provider === AI_PROVIDERS.GROQ) {
      const key = config.groqApiKey;
      if (!key) {
        throw new Error('Groq API Key belum diatur. Buka Pengaturan AI (⚙️) untuk memasukkan API Key gratis Anda.');
      }

      const bodyPayload = {
        model: targetModel,
        messages: unifiedMessages,
        temperature,
        max_tokens: 2048
      };

      if (jsonMode) {
        bodyPayload.response_format = { type: 'json_object' };
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`
        },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Groq Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return {
        content,
        providerName: 'Groq Cloud',
        modelUsed: data.model || targetModel,
        isAiGenerated: true
      };
    }

    // 2. GOOGLE GEMINI
    if (provider === AI_PROVIDERS.GEMINI) {
      const key = config.geminiApiKey;
      if (!key) {
        throw new Error('Google Gemini API Key belum diatur. Buka Pengaturan AI (⚙️) untuk memasukkan API Key gratis Anda.');
      }

      // Format for Gemini REST API
      const geminiContents = [];
      let systemInstructionText = systemPrompt;

      messages.forEach(msg => {
        if (msg.role === 'system') {
          systemInstructionText = (systemInstructionText ? systemInstructionText + '\n\n' : '') + msg.content;
        } else {
          geminiContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      });

      const requestBody = {
        contents: geminiContents,
        generationConfig: {
          temperature,
          maxOutputTokens: 2048,
          responseMimeType: jsonMode ? 'application/json' : 'text/plain'
        }
      };

      if (systemInstructionText) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstructionText }]
        };
      }

      const geminiModel = (targetModel && targetModel !== 'gemini-1.5-flash') 
        ? targetModel 
        : ((config.selectedModel && config.selectedModel !== 'gemini-1.5-flash') ? config.selectedModel : 'gemini-flash-latest');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${key.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(35000)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Gemini Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const content = candidate?.content?.parts?.map(p => p.text).join('') || '';

      return {
        content,
        providerName: 'Google Gemini',
        modelUsed: geminiModel,
        isAiGenerated: true
      };
    }

    // 3. OPENAI / CUSTOM OPENAI COMPATIBLE
    if (provider === AI_PROVIDERS.OPENAI) {
      const key = config.openaiApiKey;
      const baseUrl = (config.openaiBaseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
      if (!key) {
        throw new Error('OpenAI API Key belum diatur. Buka Pengaturan AI (⚙️) untuk memasukkannya.');
      }

      const bodyPayload = {
        model: targetModel || 'gpt-4o-mini',
        messages: unifiedMessages,
        temperature,
        max_tokens: 2048
      };
      if (jsonMode) {
        bodyPayload.response_format = { type: 'json_object' };
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`
        },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(35000)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `OpenAI Error ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return {
        content,
        providerName: 'OpenAI / Custom',
        modelUsed: data.model || targetModel,
        isAiGenerated: true
      };
    }

    // 4. LOCAL OLLAMA (Default fallback)
    const ollamaBaseUrl = config.ollamaBaseUrl || '/api/ollama';
    const ollamaModel = targetModel || 'gemma3:4b';

    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: unifiedMessages,
        stream: false,
        format: jsonMode ? 'json' : undefined,
        options: {
          temperature
        }
      }),
      signal: AbortSignal.timeout(45000)
    });

    if (!response.ok) {
      throw new Error(`Ollama response error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.message?.content || '';
    return {
      content,
      providerName: 'Local Ollama',
      modelUsed: data.model || ollamaModel,
      isAiGenerated: true
    };
  }
};
