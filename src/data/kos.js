/*
  Contoh data katalog kos. Semua fiktif.
  Ganti dengan fetch ke API/database saat backend siap. Bentuk objeknya cukup dipertahankan.

  foto: isi URL gambar bila ada (bila null, tampil placeholder).
  dicekPada: tanggal survei terakhir (ISO), wajib ada bila verified = true.
*/
export const FASILITAS = ['AC', 'Wi-Fi', 'KM dalam', 'Parkir motor']

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
    foto: null,
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
    foto: null,
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
    foto: null,
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
    foto: null,
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
    foto: null,
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
    foto: null,
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
    foto: null,
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
    foto: null,
  },
]
