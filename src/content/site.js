/*
  Semua teks halaman ada di sini.
  Mengubah copy, harga, paket, atau FAQ tidak perlu menyentuh komponen.
*/
import { rupiah } from '../lib/format.js'

export const brand = {
  name: 'KOSCHECK',
  tagline: 'Cek Dulu, Baru Yakin.',
  city: 'Palembang',
  region: 'Sumatera Selatan',
}

/**
 * Tujuan form pemesanan.
 * whatsapp: format internasional tanpa +, spasi, atau tanda hubung. Contoh: '6281234567890'.
 * Bila dikosongkan, tombol form menjadi "Salin pesan".
 */
export const contact = {
  whatsapp: '6285709935273',
}

export const nav = [
  { label: 'Masalah', href: '#masalah' },
  { label: 'Cara kerja', href: '#cara-kerja' },
  { label: 'Harga', href: '#harga' },
  { label: 'Katalog', href: '#katalog' },
  { label: 'Pemilik kos', href: '#pemilik' },
  { label: 'FAQ', href: '#faq' },
]

/* Menu di header: ada "Beranda" berikon, "Masalah" tidak ditampilkan supaya muat. Footer tetap memakai `nav`. */
export const headerNav = [
  { label: 'Beranda', href: '#top', icon: 'home' },
  ...nav.filter((item) => item.href !== '#masalah'),
]

const ownerBasics = [
  'Listing kos di katalog',
  'WhatsApp Agent KOSCHECK',
  'Pengelolaan informasi kos',
  'Statistik dasar',
  'Pencatatan keuangan dasar',
]

export const ownerPlans = {
  title: 'Paket Pemilik Kos',
  lede: 'Kelola listing dan informasi kos dengan Free, atau pilih paket berbayar untuk dukungan pemasaran.',
  items: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'Selamanya',
      summary: 'Untuk mulai menampilkan dan mengelola kos di KOSCHECK.',
      includes: ownerBasics,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 49000,
      duration: '90 hari',
      summary: 'Untuk memperluas jangkauan listing dan melihat hasil pemasaran.',
      includes: [...ownerBasics, 'Sponsor bergilir', 'Analitik pemasaran', '1 putaran follow-up'],
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: 199000,
      duration: '180 hari',
      featured: true,
      summary: 'Untuk promosi dengan penempatan prioritas dan pengelolaan keuangan lebih lengkap.',
      includes: [
        ...ownerBasics,
        'Sponsor prioritas',
        'Analitik pemasaran',
        'Banner fisik 1 × 2 meter (satu kali)',
        'Desain promosi',
        'Publikasi media sosial (satu kali)',
        '2 putaran follow-up',
        'Keuangan lanjutan',
      ],
    },
  ],
}

export const freeCatalogPlan = {
  id: 'free',
  name: 'Gratis',
  price: 0,
  summary: 'Untuk mengetahui kos yang tersedia di website kami serta didaerah Palembang.',
  includes: [
    'Foto Luar Kos',
    'Contact Person',
    'Daftar Fasilitas yang Tersedia (Belum Terverifikasi)',
  ],
}

export const plans = {
  title: 'Paket Pencari Kos',
  lede: 'Katalog gratis untuk semua orang. Kedua paket survei mencakup akses penuh ke laporan selama 180 hari.',
  items: [
    freeCatalogPlan,
    {
      id: 'dasar',
      name: 'Survei Standar',
      price: 89000,
      summary: 'Pemeriksaan dasar untuk satu kos dan satu kamar.',
      includes: [
        'Foto dan video terbaru dari lokasi',
        'Pencocokan isi iklan dengan kondisi aktual',
        'Daftar periksa fasilitas',
      ],
    },
    {
      id: 'lengkap',
      name: 'Survei Mendalam',
      price: 149000,
      featured: true,
      summary: 'Pemeriksaan lebih terperinci untuk kos yang sudah hampir kamu pilih.',
      includes: [
        'Semua pemeriksaan Survei Standar',
        'Pemeriksaan kebersihan dan lingkungan sekitar',
        'Laporan digital lengkap dengan catatan surveyor',
      ],
    },
  ],
  compare: {
    title: 'Contoh dari Lubuklinggau',
    selfTrip: {
      label: 'Berangkat sendiri',
      price: 164000,
      detail: `Tiket kereta pulang-pergi ${rupiah(64000)} ditambah semalam di kos harian ${rupiah(100000)}, belum termasuk makan dan transportasi lokal.`,
    },
    note: 'Simulasi biaya perjalanan. Biaya aktual bisa berbeda.',
  },
}

export const surveyPlans = plans.items.filter((plan) => plan.price > 0)
export const startingPrice = Math.min(...surveyPlans.map((plan) => plan.price))

export const hero = {
  badge: 'Survei Kos Modern & Terpercaya',
  features: [
    { icon: 'shield', text: 'Survei langsung ke lokasi' },
    { icon: 'camera', text: 'Foto & video berkualitas' },
    { icon: 'bolt', text: 'Laporan cepat dan akurat' },
  ],
  lede: 'KOSCHECK memeriksa kos langsung ke lokasi, lalu mengirim foto, video, dan laporan kondisinya, sebelum kamu membayar sewa.',
  primaryCta: 'Pesan survei kos',
  secondaryCta: 'Lihat katalog gratis',
  note: `Katalog gratis. Survei mulai ${rupiah(startingPrice)}. Khusus kos di Palembang.`,
}

export const problems = {
  title: 'Gampang ditemukan online, belum tentu bisa dipercaya.',
  lede: 'Foto iklan bisa sudah lama, atau diambil dari kos lain. Perantau jarang punya kesempatan melihat langsung sebelum membayar.',
  items: [
    {
      worry: '“Saya di luar kota. Tidak bisa datang melihat kos sebelum bayar.”',
      answer: 'Surveyor datang ke lokasi dan mengirim foto serta video terbaru.',
    },
    {
      worry: '“Foto di iklan kelihatan lama, atau mirip kos lain.”',
      answer: 'Isi iklan dicocokkan dengan kondisi aktual di lapangan.',
    },
    {
      worry: '“Fasilitasnya banyak, tapi sebanding dengan harganya?”',
      answer: 'Daftar periksa fasilitas dan perbandingan harga antarkos.',
    },
    {
      worry: '“Takut kena listing fiktif.”',
      answer: 'Label Kos Terverifikasi dan laporan survei yang bisa kamu buka sendiri.',
    },
  ],
}

export const steps = {
  title: 'Dari katalog sampai laporan, empat langkah.',
  items: [
    { title: 'Cari di katalog', body: 'Saring kos berdasarkan harga, fasilitas, dan lokasi. Gratis.' },
    { title: 'Pesan survei', body: 'Pilih paket Check Kost untuk kos yang kamu taksir.' },
    {
      title: 'Surveyor memeriksa',
      body: 'Kondisi fisik, fasilitas, kebersihan, dan lingkungan kos diperiksa langsung.',
    },
    { title: 'Terima laporan', body: 'Foto, video, dan laporan kondisi dikirim secara digital.' },
  ],
}

export const catalog = {
  title: 'Katalog gratis, dengan tanda mana yang sudah dicek.',
  lede: 'Setiap kos yang lolos survei diberi label Kos Terverifikasi lengkap dengan tanggal pemeriksaan.',
  sampleNote: 'Contoh data untuk tampilan. Nama, harga, dan tanggal pemeriksaan kos di sini fiktif.',
}

export const owners = {
  statement: 'Hasil survei tidak bisa dibeli.',
  body: 'Pasang kosmu di katalog tanpa biaya. Kalau ingin lebih banyak dilihat, ada sponsor di paket Premium dan Ultimate, tetapi penilaian survei dipisahkan dari pembayaran promosi. Kos yang memenuhi standar penilaian tertulis mendapat label Kos Terverifikasi.',
  offers: [
    { title: 'Listing gratis', body: 'Foto, harga, dan fasilitas kosmu tampil di katalog tanpa biaya.' },
    { title: 'Sponsor listing', body: 'Tampil lebih menonjol di katalog. Tidak memengaruhi hasil survei.' },
    {
      title: 'Komisi penghuni baru',
      body: 'Kerja sama opsional: KOSCHECK menerima komisi bila ada penghuni baru yang datang lewat katalog.',
    },
  ],
  cta: 'Daftarkan kosmu',
  reassurance: 'Verifikasi adalah etalase untuk kosmu, bukan pengawasan.',
}

export const faq = {
  title: 'Pertanyaan yang sering muncul',
  items: [
    {
      q: 'Apa bedanya KOSCHECK dengan platform pencarian kos lain?',
      a: 'Kami tidak mengejar jumlah listing. Katalog kami lebih kecil, tetapi tiap kos terverifikasi sudah dilihat langsung oleh surveyor, lengkap dengan foto, video, dan laporan.',
    },
    {
      q: 'Apakah pemilik kos bisa memengaruhi hasil survei?',
      a: 'Tidak. Penilaian mengikuti standar tertulis dan dipisahkan dari pembayaran promosi. Pemilik yang memilih sponsor listing tidak mendapat perlakuan khusus saat disurvei.',
    },
    {
      q: 'Bagaimana kalau kondisi kos berubah setelah disurvei?',
      a: 'Tanggal pemeriksaan selalu tercantum di listing terverifikasi, dan informasinya kami perbarui secara berkala. Cek tanggalnya sebelum memutuskan.',
    },
    {
      q: 'Wilayah mana yang dilayani?',
      a: 'Saat ini kos di Palembang. Kos di sekitar kampus Unsri Indralaya, Ogan Ilir, belum termasuk wilayah layanan.',
    },
    {
      q: 'Apa saja yang gratis dan yang berbayar?',
      a: `Katalog dan pencarian gratis. Layanan survei Check Kost berbayar, mulai ${rupiah(startingPrice)}.`,
    },
  ],
}

export const order = {
  title: 'Pesan survei, atau pasang kosmu.',
  lede: 'Isi data singkat, lalu kirim pesannya ke tim KOSCHECK.',
}

export const disclaimer =
  'KOSCHECK adalah studi kasus simulasi bisnis. Harga, paket, dan contoh data di halaman ini bersifat ilustrasi.'

/* Teks widget chat AI. Prompt dan data yang dibaca AI ada di api/chat.js. */
export const chat = {
  launcher: 'Tanya KOSCHECK',
  bubble: ['Ada pertanyaan?', 'Kami siap membantu!'],
  title: 'Tanya KOSCHECK',
  subtitle: 'Asisten AI untuk soal kos dan survei',
  greeting: 'Halo, aku asisten KOSCHECK. Mau tanya soal katalog, paket survei, atau cara pesan?',
  suggestions: [
    'Apa bedanya Survei Standar dan Survei Mendalam?',
    'Kos apa yang harganya di bawah Rp900.000?',
    'Bagaimana cara pesan survei?',
  ],
  placeholder: 'Tulis pertanyaanmu',
  note: 'Dijawab AI, bisa keliru. Cek detail penting di laporan survei.',
  error: 'Chat sedang tidak bisa dipakai. Coba lagi sebentar, atau pakai form pemesanan.',
  retry: 'Coba lagi',
}
