// Dedicated Archive Service for BelajarEnglish
// Manages local persistence, retrieval, deletion, and event notifications for:
// 1. AI Editor Archive ('lingo_archive_editor')
// 2. Tanya Kata & Grammar Archive ('lingo_archive_linguistics')
// 3. Pronunciation Studio Archive ('lingo_archive_pronunciation')

const STORAGE_KEYS = {
  EDITOR: 'lingo_archive_editor',
  LINGUISTICS: 'lingo_archive_linguistics',
  PRONUNCIATION: 'lingo_archive_pronunciation'
};

const notifyUpdate = (type, data) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('belajarenglish_archive_updated', {
      detail: { type, data }
    }));
  }
};

const MAX_ARCHIVE_ITEMS = 50;

const getItems = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > MAX_ARCHIVE_ITEMS) {
      const pruned = parsed.slice(0, MAX_ARCHIVE_ITEMS);
      localStorage.setItem(key, JSON.stringify(pruned));
      return pruned;
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`Error reading archive for key ${key}:`, err);
    return [];
  }
};

const saveItems = (key, items, type) => {
  try {
    const capped = Array.isArray(items) ? items.slice(0, MAX_ARCHIVE_ITEMS) : [];
    localStorage.setItem(key, JSON.stringify(capped));
    notifyUpdate(type, capped);
  } catch (err) {
    console.warn(`Error saving archive for key ${key}:`, err);
    // If quota exceeded, clear older half and retry
    try {
      const emergencyPruned = items.slice(0, 20);
      localStorage.setItem(key, JSON.stringify(emergencyPruned));
      notifyUpdate(type, emergencyPruned);
    } catch {
      // Storage completely full
    }
  }
};

export const archiveService = {
  // -------------------------------------------------------------
  // 1. AI EDITOR ARCHIVE
  // -------------------------------------------------------------
  getEditorArchive: () => {
    return getItems(STORAGE_KEYS.EDITOR);
  },

  saveEditorItem: (item) => {
    const current = getItems(STORAGE_KEYS.EDITOR);
    // Prevent exact duplicate ID if re-saving
    const filtered = current.filter(i => i.id !== item.id);
    const updated = [
      {
        id: item.id || 'arch_ed_' + Date.now(),
        originalText: item.originalText || item.text || '',
        contextMode: item.contextMode || 'auto',
        contextLabel: item.contextLabel || 'Otomatis',
        polishedText: item.data?.polishedText || item.polishedText || '',
        data: item.data || {},
        modelUsed: item.modelUsed || 'local-ai',
        createdAt: item.createdAt || new Date().toISOString(),
        formattedTime: item.formattedTime || new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      ...filtered
    ];
    saveItems(STORAGE_KEYS.EDITOR, updated, 'editor');
    return updated;
  },

  deleteEditorItem: (id) => {
    const current = getItems(STORAGE_KEYS.EDITOR);
    const updated = current.filter(i => i.id !== id);
    saveItems(STORAGE_KEYS.EDITOR, updated, 'editor');
    return updated;
  },

  clearEditorArchive: () => {
    saveItems(STORAGE_KEYS.EDITOR, [], 'editor');
    return [];
  },

  // -------------------------------------------------------------
  // 2. TANYA KATA & GRAMMAR (LINGUISTICS) ARCHIVE
  // -------------------------------------------------------------
  getLinguisticsArchive: () => {
    return getItems(STORAGE_KEYS.LINGUISTICS);
  },

  saveLinguisticsItem: (item) => {
    const current = getItems(STORAGE_KEYS.LINGUISTICS);
    const filtered = current.filter(i => i.id !== item.id);
    const updated = [
      {
        id: item.id || 'arch_ling_' + Date.now(),
        query: item.query || '',
        title: item.data?.title || item.query || 'Analisis Linguistik',
        partOfSpeech: item.data?.partOfSpeech || 'General',
        ipa: item.data?.ipa || '',
        coreDefinition: item.data?.coreDefinition || '',
        data: item.data || {},
        modelUsed: item.modelUsed || 'local-ai',
        createdAt: item.createdAt || new Date().toISOString(),
        formattedTime: item.formattedTime || new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      ...filtered
    ];
    saveItems(STORAGE_KEYS.LINGUISTICS, updated, 'linguistics');
    return updated;
  },

  deleteLinguisticsItem: (id) => {
    const current = getItems(STORAGE_KEYS.LINGUISTICS);
    const updated = current.filter(i => i.id !== id);
    saveItems(STORAGE_KEYS.LINGUISTICS, updated, 'linguistics');
    return updated;
  },

  clearLinguisticsArchive: () => {
    saveItems(STORAGE_KEYS.LINGUISTICS, [], 'linguistics');
    return [];
  },

  // -------------------------------------------------------------
  // 3. PRONUNCIATION ARCHIVE
  // -------------------------------------------------------------
  getPronunciationArchive: () => {
    return getItems(STORAGE_KEYS.PRONUNCIATION);
  },

  savePronunciationItem: (item) => {
    const current = getItems(STORAGE_KEYS.PRONUNCIATION);
    const filtered = current.filter(i => i.id !== item.id);
    const updated = [
      {
        id: item.id || 'arch_pron_' + Date.now(),
        text: item.text || '',
        mode: item.mode || 'word', // 'word' | 'short' | 'long' | 'custom'
        accent: item.accent || 'US',
        overallScore: item.overallScore ?? 0,
        phoneticScore: item.phoneticScore ?? 0,
        wordScores: item.wordScores || [],
        acousticMetrics: item.acousticMetrics || null,
        status: (item.overallScore ?? 0) >= 85 ? 'excellent' : (item.overallScore ?? 0) >= 70 ? 'good' : 'needs_practice',
        createdAt: item.createdAt || new Date().toISOString(),
        formattedTime: item.formattedTime || new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      ...filtered
    ];
    saveItems(STORAGE_KEYS.PRONUNCIATION, updated, 'pronunciation');
    return updated;
  },

  deletePronunciationItem: (id) => {
    const current = getItems(STORAGE_KEYS.PRONUNCIATION);
    const updated = current.filter(i => i.id !== id);
    saveItems(STORAGE_KEYS.PRONUNCIATION, updated, 'pronunciation');
    return updated;
  },

  clearPronunciationArchive: () => {
    saveItems(STORAGE_KEYS.PRONUNCIATION, [], 'pronunciation');
    return [];
  }
};
