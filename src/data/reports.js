/*
  Contoh laporan survei yang tampil di hero.
  Data fiktif. Nanti bisa diganti dengan data dari API/CMS dengan bentuk yang sama.

  status tiap item: 'ok' (sesuai) | 'warn' (beda) | 'bad' (tidak sesuai)
  verdict laporan:  'verified' | 'rejected'
*/
export const reports = [
  {
    id: 'a',
    tab: 'Kos Contoh A',
    title: 'Kos Contoh A',
    area: 'Bukit Besar, Palembang',
    checkedAt: '2026-08-12',
    verdict: 'verified',
    items: [
      { label: 'Kamar mandi', claim: 'Dalam kamar', found: 'Dalam kamar, air lancar', status: 'ok' },
      { label: 'AC', claim: 'Ada', found: 'Ada, dingin', status: 'ok' },
      { label: 'Wi-Fi', claim: 'Ada', found: 'Ada, sinyal kuat di kamar', status: 'ok' },
      { label: 'Ukuran kamar', claim: '3 × 4 m', found: '3 × 3,5 m', status: 'warn' },
      { label: 'Kebersihan', claim: 'Tidak disebut', found: 'Bersih, lorong terang', status: 'ok' },
    ],
    note: 'Lolos standar penilaian. Selisih ukuran kamar sudah dicatat di listing.',
  },
  {
    id: 'b',
    tab: 'Kos Contoh B',
    title: 'Kos Contoh B',
    area: 'Kenten, Palembang',
    checkedAt: '2026-09-03',
    verdict: 'rejected',
    items: [
      { label: 'Foto iklan', claim: '5 foto kamar', found: '3 foto bukan kamar ini', status: 'bad' },
      { label: 'Kamar mandi', claim: 'Dalam kamar', found: 'Di luar, dipakai bersama', status: 'bad' },
      { label: 'AC', claim: 'Ada', found: 'Ada, tidak berfungsi', status: 'bad' },
      { label: 'Wi-Fi', claim: 'Ada', found: 'Hanya di ruang depan', status: 'warn' },
      { label: 'Parkir motor', claim: 'Ada', found: 'Ada, muat 10 motor', status: 'ok' },
    ],
    note: 'Belum mendapat label Kos Terverifikasi. Hasil survei tetap dicatat apa adanya.',
  },
]
