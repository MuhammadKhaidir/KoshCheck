// Semua teks landing page ada di file ini. Ubah di sini, tampilan ikut berubah.
// Catatan: copy awal dibuat dari tagline + deskripsi KOSCHECK. Sesuaikan dengan dokumen analisis.

export const brand = { name: 'KOSCHECK', city: 'Palembang' };

export const nav = [
  { label: 'Masalah', href: '#masalah' },
  { label: 'Cara kerja', href: '#cara-kerja' },
];

export const hero = {
  title: 'Cek dulu, baru yakin.',
  text: 'KOSCHECK membantu kamu mencari dan memverifikasi kos di Palembang, sebelum kamu bayar DP.',
  primary: { label: 'Cari kos', href: '#mulai' },
  secondary: { label: 'Lihat cara kerja', href: '#cara-kerja' },
};

export const checklist = {
  title: 'Cek sebelum bayar DP',
  hint: 'Centang yang sudah kamu pastikan.',
  doneText: 'Semua sudah dicek. Kamu siap survei.',
  stamp: 'Sudah dicek',
  items: [
    'Alamat dan foto sesuai kondisi asli',
    'Harga dan biaya tambahan jelas (listrik, air, wifi)',
    'Fasilitas yang dijanjikan benar-benar ada',
    'Aturan kos tertulis (jam malam, tamu, kontrak)',
    'Pemilik atau pengelola bisa dihubungi langsung',
  ],
};

export const problems = {
  title: 'Mencari kos itu gampang. Merasa yakin itu yang susah.',
  items: [
    { title: 'Foto tidak sama dengan aslinya', text: 'Kamu baru tahu kondisi kamar setelah sampai di lokasi, bahkan setelah DP.' },
    { title: 'Biaya muncul belakangan', text: 'Listrik, air, dan biaya lain sering tidak disebut di awal.' },
    { title: 'Sulit tahu mana yang bisa dipercaya', text: 'Informasi tersebar di banyak tempat dan tidak ada yang memastikan kebenarannya.' },
  ],
};

export const steps = {
  title: 'Dari cari sampai yakin, tiga langkah.',
  items: [
    { title: 'Cari kos', text: 'Telusuri kos di Palembang berdasarkan area, harga, dan fasilitas.' },
    { title: 'Lihat status verifikasi', text: 'Setiap listing menunjukkan apa saja yang sudah dicek: alamat, foto, harga, fasilitas.' },
    { title: 'Survei dengan checklist', text: 'Bawa checklist ke lokasi. Bayar DP kalau semuanya cocok.' },
  ],
};

export const cta = {
  title: 'Mau kos yang sudah dicek?',
  text: 'Mulai cari kos di Palembang dengan lebih tenang.',
  button: { label: 'Cari kos sekarang', href: '#' },
};

export const footer = { note: 'KOSCHECK, studi kasus simulasi bisnis.' };
