# ♻️ CircularMetric
**Transformasi Sampah Menjadi Dampak: Monitor, Analisis, dan Bagikan Kontribusi Lingkungan Anda.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blue?style=flat-square&logo=supabase)](https://supabase.com/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-orange?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Tentang Proyek
**CircularMetric** adalah platform ekonomi sirkular modern yang membantu individu melacak dampak lingkungan mereka secara presisi. Dengan menggunakan integrasi AI untuk pemindaian sampah dan sistem gamifikasi yang menarik, kami mendorong pengguna untuk berkontribusi lebih aktif dalam menjaga bumi.

## 🚀 Fitur Unggulan

### 📊 Bento Grid Profile Dashboard
Tampilan profil modern menggunakan tata letak *Bento Grid* yang padat informasi namun tetap estetis. Memantau saldo poin, total kg sampah, hingga total emisi CO2 yang berhasil diselamatkan.

### 🧠 AI Performance Analytics
Melacak rata-rata *Confidence Score* dari setiap pemindaian sampah yang dilakukan oleh AI. Memberikan transparansi dan akurasi data pada setiap riwayat aktivitas.

### 🏆 Gamifikasi & Lencana
Tingkatkan level Anda dari **Novice** hingga menjadi **Circular Master**. Dapatkan lencana eksklusif berdasarkan pencapaian kontribusi lingkungan Anda.

### 🖼️ Dynamic Social Sharing (OG Image)
Bagikan dampak Anda ke media sosial dengan infografis visual yang dihasilkan secara dinamis. Setiap kali Anda membagikan profil, sistem akan membuat gambar unik yang merangkum statistik Anda secara otomatis.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM
- **UI Components:** shadcn/ui & Tailwind CSS
- **Icons:** Lucide React
- **Dynamic Image:** next/og & Satori

## ⚙️ Persiapan Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi terbaru disarankan)
- Akun [Supabase](https://supabase.com/)

### Instalasi
1. Clone repositori:
   ```bash
   git clone https://github.com/nuby911/EcoOps.git
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi Environment Variables:
   Buat file `.env.local` dan isi dengan kredensial Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   DATABASE_URL=your_postgresql_connection_string
   ```
4. Sinkronisasi Database:
   ```bash
   npx drizzle-kit push
   ```
5. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

---

<div align="center">
Dibuat dengan ❤️ untuk Masa Depan yang Lebih Hijau.
</div>
