/*
  Contoh data katalog kos. Semua fiktif.
  Ganti dengan fetch ke API/database saat backend siap. Bentuk objeknya cukup dipertahankan.

  foto: URL foto ilustrasi bangunan kos/rumah untuk data contoh.
  dicekPada: tanggal survei terakhir (ISO), wajib ada bila verified = true.
*/
export const FASILITAS = ['AC', 'Wi-Fi', 'KM dalam', 'Parkir motor']
export const TIPE = ['Putra', 'Putri', 'Campur']

export const HARGA_MIN = 500000
export const HARGA_MAX = 1500000
export const HARGA_STEP = 50000

export const kos = [
  {
    id: 'mutiara',
    nama: 'Kos Mutiara',
    area: 'Bukit Besar',
    tipe: 'Putri',
    harga: 850000,
    fasilitas: ['AC', 'Wi-Fi', 'KM dalam'],
    verified: true,
    dicekPada: '2026-09-28',
    foto: 'https://static.mamikos.com/uploads/cache/data/style/2025-06-19/WXG0BLhP.-360x480.jpg',
  },
  {
    id: 'tanjung-asri',
    nama: 'Kos Tanjung Asri',
    area: 'Demang Lebar Daun',
    tipe: 'Campur',
    harga: 1100000,
    fasilitas: ['AC', 'Wi-Fi', 'KM dalam', 'Parkir motor'],
    verified: true,
    dicekPada: '2026-10-02',
    foto: 'https://sp-ao.shortpixel.ai/client/to_auto%2Cq_lossy%2Cret_img%2Cw_800%2Ch_600/https%3A/www.flokq.com/blog/wp-content/uploads/2020/09/unnamed-800x600.jpg',
  },
  {
    id: 'musi-residence',
    nama: 'Kos Musi Residence',
    area: 'Ilir Timur',
    tipe: 'Campur',
    harga: 1350000,
    fasilitas: ['AC', 'Wi-Fi', 'KM dalam', 'Parkir motor'],
    verified: true,
    dicekPada: '2026-08-19',
    foto: 'https://images.rukita.co/buildings/building/a32b693b-11c.jpg',
  },
  {
    id: 'bukit-indah',
    nama: 'Kos Bukit Indah',
    area: 'Bukit Besar',
    tipe: 'Putra',
    harga: 750000,
    fasilitas: ['Wi-Fi', 'KM dalam'],
    verified: true,
    dicekPada: '2026-09-14',
    foto: 'https://www.kostjakarta.com/images2/5076_1.jpg',
  },
  {
    id: 'sekar-wangi',
    nama: 'Kos Sekar Wangi',
    area: 'Kenten',
    tipe: 'Putri',
    harga: 650000,
    fasilitas: ['Wi-Fi', 'Parkir motor'],
    verified: false,
    dicekPada: null,
    foto: 'https://www.properthy.com/storage/properties/old_v1/Rumah%20Kost%20%20Dijual%20di%20Banyumanik%20Semarang%20Dekat%20Kampus%20UNDIP%2C%20Kampus%20POLINES%2C%20Poltekkes%20Kemenkes%2C%20Transmart%20Setiabudi%2C%20RS%20Banyumanik%200002-a9609.jpeg',
  },
  {
    id: 'kenanga',
    nama: 'Kos Kenanga',
    area: 'Kenten',
    tipe: 'Campur',
    harga: 700000,
    fasilitas: ['Wi-Fi', 'KM dalam'],
    verified: false,
    dicekPada: null,
    foto: 'https://images.rukita.co/ais/f50d73cf-f947-447e-b881-7be535f38e76.jpeg',
  },
  {
    id: 'harapan',
    nama: 'Kos Harapan',
    area: 'Jakabaring',
    tipe: 'Putri',
    harga: 900000,
    fasilitas: ['AC', 'KM dalam'],
    verified: false,
    dicekPada: null,
    foto: 'https://imgx.parapuan.co/crop/0x0%3A0x0/945x630/photo/2025/01/21/rukita-00jpg-20250121032657.jpg',
  },
  {
    id: 'pelangi',
    nama: 'Kos Pelangi',
    area: 'Plaju',
    tipe: 'Putra',
    harga: 500000,
    fasilitas: ['Parkir motor'],
    verified: false,
    dicekPada: null,
    foto: 'https://sgp1.digitaloceanspaces.com/www.sewakost.com-69925f5b4547e/listings/02-2020/ad29519/kost-dago-bangbayang-residence-dago-859242260_large.jpg',
  },
]
