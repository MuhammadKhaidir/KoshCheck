# KOSCHECK Landing Page

Landing page untuk **KOSCHECK**, platform pencarian dan verifikasi kos di Palembang ("Cek Dulu, Baru Yakin."). Dibuat dengan React + Vite, tanpa library UI tambahan.

## Menjalankan

Butuh Node.js 20.19+ (atau 22.12+).

```bash
npm install
npm run dev       # buka http://localhost:5173
npm run build     # hasil build ada di folder dist/
npm run preview   # coba hasil build secara lokal
```

## Struktur

```
src/
  content/site.js     Semua teks halaman: hero, harga, paket, FAQ, kontak
  data/kos.js         Contoh data katalog kos (fiktif)
  data/reports.js     Contoh laporan survei di hero (fiktif)
  styles/tokens.css   Design tokens: warna, ukuran huruf, jarak, radius
  styles/base.css     Reset dan gaya dasar
  components/
    ui/               Komponen kecil: Button, Section, Icon, Logo, Stamp, ...
    layout/           Header dan Footer
    sections/         Satu file per section halaman (+ file .module.css)
  context/            OrderIntent: menghubungkan tombol ke form pemesanan
  lib/format.js       Format rupiah dan tanggal
  App.jsx             Urutan section di halaman
```

## Yang perlu diisi lebih dulu

1. **Nomor WhatsApp**: isi `contact.whatsapp` di `src/content/site.js` (format `6281234567890`). Selama kosong, tombol form menjadi "Salin pesan".
2. **Paket dan harga**: rentang Rp39.000 sampai Rp99.000 berasal dari dokumen strategi. Nama paket dan isinya (`plans.items`) adalah placeholder.
3. **Data katalog**: `src/data/kos.js` berisi kos fiktif. Isi `foto` dengan URL gambar bila ada.
4. **Catatan simulasi**: teks di footer menyebut bahwa ini studi kasus simulasi. Hapus `disclaimer` di `site.js` bila sudah bukan simulasi.

## Mengembangkan

- **Ganti tema**: ubah nilai di `src/styles/tokens.css`. Semua komponen memakai variabel di sana.
- **Tambah section**: buat komponen di `src/components/sections/`, pakai `<Section>` dan `<SectionHead>`, lalu daftarkan di `App.jsx`.
- **Tambah halaman** (misalnya detail kos atau laporan survei lengkap): pasang `react-router-dom`, lalu pindahkan isi `App.jsx` menjadi satu route.
- **Katalog dari backend**: ganti import `kos` di `Catalog.jsx` dengan hasil fetch. Bentuk objeknya sudah dipisah di `data/kos.js`.
- **Gaya komponen** memakai CSS Modules (`*.module.css`), jadi nama kelas tidak bentrok antar komponen.

## Tipografi

Bricolage Grotesque (judul) dan Hanken Grotesk (isi), dipasang lewat paket `@fontsource-variable`, jadi tidak butuh koneksi ke Google Fonts.

## Chat AI

Widget chat di pojok kanan bawah. Pesan dikirim ke `api/chat.js` (Vercel Function), jadi API key tidak pernah ada di kode browser.

1. Salin `.env.example` menjadi `.env.local`, isi `ANTHROPIC_API_KEY`. `npm run dev` otomatis menjalankan `/api/chat`.
2. Di Vercel: Project Settings > Environment Variables, tambah `ANTHROPIC_API_KEY`, lalu redeploy.
3. Model bisa diganti lewat `AI_MODEL` (default `claude-haiku-5-5`). Pindah ke penyedia AI lain: ubah fungsi `askModel()` di `api/chat.js`.
4. Pengetahuan AI diambil dari `content/site.js` dan `data/kos.js`, jadi ikut berubah saat kontennya diubah. Aturan jawabannya ada di `SYSTEM` pada `api/chat.js`.
5. Teks widget (sapaan, pertanyaan contoh) ada di `content/site.js`, export `chat`.
