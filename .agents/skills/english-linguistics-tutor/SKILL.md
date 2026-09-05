---
name: english-linguistics-tutor
description: Panduan arsitektur, prompt engineering, dan konvensi pengembangan untuk chatbot linguistik bahasa Inggris komprehensif (grammar, semantik, etimologi, kata turunan, idiom, slang) dan integrasi Local LLM Ollama pada aplikasi BelajarEnglish.
---

# English Linguistics & Grammar Tutor Skill

Skill ini memuat instruksi dan standarisasi arsitektur untuk modul asisten linguistik bahasa Inggris dalam aplikasi **BelajarEnglish**.

## 1. Lingkup Analisis Kata & Linguistik

Setiap kali pengguna menanyakan tentang kata, frasa, atau konsep grammar (misalnya: *"apa itu bright"*, *"jelaskan past perfect"*, *"etimologi kata salary"*), AI harus memberikan analisis terstruktur dalam Bahasa Indonesia yang meliputi:

1. **Definisi & Kelas Kata (Part of Speech)**:
   - Fonetik/IPA (misal: `/braɪt/`).
   - Definisi inti dan nuansa makna (denotasi vs konotasi).
2. **Etimologi & Asal-usul Kata (Etymology & Word Origin)**:
   - Akar bahasa (Old English, Latin, Proto-Germanic, Greek, Anglo-Norman, dll.).
   - Evolusi makna dari masa ke masa.
   - **Bahasa yang Banyak Menggunakan Kata Ini Sekarang (Modern Languages & Cognates)**: Di bahasa apa saja kata ini atau kata sekerabatnya banyak dipakai hari ini (Inggris modern, Jerman, Belanda, Skandinavia, serapan Indonesia, dll.).
3. **Turunan Kata (Word Family / Morphology)**:
   - Bentuk Noun, Verb, Adjective, Adverb, Prefix, Suffix.
4. **Berbagai Contoh Kalimat (Example Sentences in Context)**:
   - Contoh kalimat formal / akademik.
   - Contoh kalimat percakapan kasual sehari-hari.
   - Contoh kalimat figuratif / sastra.
5. **Idiom & Phrasal Verbs Terkait**:
   - Daftar idiom populer yang mengandung kata tersebut, artinya, dan contoh penggunaannya.
6. **Slang, Kiasan & Bahasa Gaul Modern**:
   - Penggunaan dalam kultur pop, sosmed, slang, atau konteks sarkastik.
7. **Nuansa Sinonim (Synonyms & Collocations)**:
   - Perbandingan dengan kata mirip (misal: *bright* vs *intelligent* vs *shining* vs *brilliant*).

## 2. Standar Respon & Prompt Engineering
- Respon harus terstruktur rapi dengan tabulasi/kartu interaktif di UI (Audio TTS, badge part of speech, expandable sections).
- Menghubungkan ke Ollama lokal (`/api/ollama/api/chat`) dengan fallback offline kamus linguistik bila server sedang offline.
- Server berjalan di port 6000 (dengan mirror 6006 untuk Google Chrome).
