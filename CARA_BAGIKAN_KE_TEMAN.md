# Panduan Praktis: Cara Membagikan BelajarEnglish ke Teman (Zero-Install) 🚀

Agar teman Anda bisa langsung menggunakan seluruh fitur aplikasi ini secara **sempurna, responsif, dan tanpa perlu mengunduh file AI bergiga-giga (tanpa Ollama)**, ikuti panduan praktis berikut:

---

## 🌟 Mengapa Tidak Perlu Download Ollama?
Aplikasi ini sekarang sudah dilengkapi arsitektur **Multi-Provider AI (Cloud & Local Switcher)**:
* **Groq Cloud (Rekomendasi Utama)**: Menggunakan model *Llama 3.3 70B* / *Llama 3.1 8B* yang berjalan di server cloud Groq. Respon sangat kilat (**~0.3 detik**) dan memiliki kuota gratis hingga 14.400 permintaan per hari!
* **Google Gemini API**: Kuota gratis dari Google AI Studio.
* **Local Ollama**: Tetap tersedia untuk Anda yang ingin bereksperimen offline di laptop sendiri.

---

## 🥇 CARA TERBAIK: Deploy ke Vercel (Teman Tinggal Buka Link Web)
Dengan metode ini, teman Anda **tidak perlu menginstal Node.js, Git, ataupun Ollama**. Mereka cukup membuka link dari HP atau laptop seperti membuka website biasa.

### Langkah 1: Dapatkan API Key Groq Gratis (30 Detik)
1. Buka [https://console.groq.com/keys](https://console.groq.com/keys) dan login (bisa pakai akun Google).
2. Klik **Create API Key**, beri nama (misal: `belajar-english-app`), lalu salin key yang diawali dengan `gsk_...`.

### Langkah 2: Hubungkan Repositori ke GitHub
Jika belum di-push ke GitHub:
```bash
git add .
git commit -m "feat: multi-provider cloud AI and zero-install sharing"
git push origin main
```

### Langkah 3: Deploy Gratis di Vercel
1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** ➜ **"Project"**.
3. Pilih repositori **BelajarEnglish** Anda, lalu klik **Import**.
4. Di bagian **Environment Variables**, tambahkan:
   * **NAME**: `VITE_GROQ_API_KEY`
   * **VALUE**: *(Tempelkan API Key Groq `gsk_...` yang Anda dapatkan di Langkah 1)*
5. Klik **Deploy**!
6. Dalam waktu sekitar 1 menit, website Anda sudah aktif dengan URL publik (misal: `https://belajar-english.vercel.app`).

### Langkah 4: Bagikan URL ke Teman!
Kirimkan link website tersebut ke teman via WhatsApp / Telegram. 
Teman Anda langsung bisa menikmati:
1. **AI English Editor**: Rewriting otomatis dan perbandingan spektrum 6 register nada (*Zoe Gen Z, Sam Teman Akrab, Emma Harian, Claire Sopan, David Bisnis, Prof. Arthur Akademik*).
2. **Linguistics & Grammar Tutor**: Analisis etimologi, semantik, turunan kata, dan idiom.
3. **Pronunciation Studio**: Evaluasi pelafalan fonetik dan deteksi kata majemuk (*berjalan 100% di browser lokal via Web Speech API*).

---

## 🥈 CARA KEDUA: Jika Teman Menjalankan Proyek Sendiri (ZIP / Git Clone)
Jika teman Anda adalah sesama developer dan menjalankan proyek ini di laptopnya (`npm run dev`):

1. Teman tidak wajib mengunduh model Ollama yang besar.
2. Di pojok kanan atas layar atau di bilah **Engine**, klik tombol **"Atur AI (⚙️)"**.
3. Pilih tab **Groq Cloud (Gratis & Tercepat ⚡)**.
4. Masukkan API Key Groq gratis miliknya (atau Anda bagikan API Key Anda).
5. Klik **"Uji Koneksi"** (indikator hijau dengan latensi milidetik akan muncul).
6. Klik **"Simpan & Terapkan"**. Selesai!

---

## 🛡️ Fitur yang Tetap Aktif 100% Meski Tanpa Internet / AI
Sebagai sistem cadangan (*graceful fallback*):
* **Pronunciation Studio**: Evaluasi fonetik kata majemuk (*ice cream*, *swimming pool*, dll.) dan 6 persona suara Web Speech berjalan langsung di peramban teman tanpa kuota server.
* **Match Madness**: Mini-game kuis padanan kata bahasa Inggris.
* **Smart Heuristic Engine**: Jika kuota habis atau sedang offline total, aplikasi otomatis menggunakan kamus linguistik offline bawaan agar tidak pernah *crash*.
