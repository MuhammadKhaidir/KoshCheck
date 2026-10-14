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
  whatsapp: '',
}

export const nav = [
  { label: 'Masalah', href: '#masalah' },
  { label: 'Cara kerja', href: '#cara-kerja' },
  { label: 'Harga', href: '#harga' },
  { label: 'Katalog', href: '#katalog' },
  { label: 'Pemilik kos', href: '#pemilik' },
  { label: 'FAQ', href: '#faq' },
]

/*
  Paket Check Kost.
  Rentang harga Rp39.000 sampai Rp99.000 berasal dari dokumen strategi KOSCHECK.
  Nama paket dan isinya adalah placeholder: sesuaikan dengan layanan yang sebenarnya.
*/
export const plans = {
  title: 'Survei dari rumah lebih murah daripada berangkat sendiri.',
  lede: 'Katalog gratis untuk semua orang. Layanan Check Kost berbayar untuk kos yang benar-benar kamu taksir.',
  items: [
    {
      id: 'dasar',
      name: 'Cek Dasar',
      price: 39000,
      summary: 'Untuk menyaring kos sebelum kamu memutuskan datang.',
      includes: [
        'Foto dan video terbaru dari lokasi',
        'Pencocokan isi iklan dengan kondisi aktual',
        'Daftar periksa fasilitas',
      ],
    },
    {
      id: 'lengkap',
      name: 'Cek Lengkap',
      price: 99000,
      featured: true,
      summary: 'Untuk kos yang sudah hampir kamu pilih.',
      includes: [
        'Semua isi Cek Dasar',
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
    note: 'Perhitungan simulasi. Harga paket adalah asumsi.',
  },
}

export const startingPrice = Math.min(...plans.items.map((p) => p.price))

export const hero = {
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
  body: 'Pasang kosmu di katalog tanpa biaya. Kalau ingin lebih banyak dilihat, ada promosi premium, tetapi penilaian survei dipisahkan dari pembayaran promosi. Kos yang memenuhi standar penilaian tertulis mendapat label Kos Terverifikasi.',
  offers: [
    { title: 'Listing gratis', body: 'Foto, harga, dan fasilitas kosmu tampil di katalog tanpa biaya.' },
    { title: 'Promosi premium', body: 'Tampil lebih menonjol di katalog. Tidak memengaruhi hasil survei.' },
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
      a: 'Tidak. Penilaian mengikuti standar tertulis dan dipisahkan dari pembayaran promosi. Pemilik yang memasang promosi premium tidak mendapat perlakuan khusus saat disurvei.',
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
