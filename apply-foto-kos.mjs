// Menerapkan perubahan "foto kos" tanpa git apply: tahan CRLF (Windows), tidak tergantung konteks diff,
// dan aman dijalankan berulang. Jalankan dari root repo:  node apply-foto-kos.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const FOTO = {
  mutiara: 'https://static.mamikos.com/uploads/cache/data/style/2025-06-19/WXG0BLhP.-360x480.jpg',
  'tanjung-asri':
    'https://sp-ao.shortpixel.ai/client/to_auto%2Cq_lossy%2Cret_img%2Cw_800%2Ch_600/https%3A/www.flokq.com/blog/wp-content/uploads/2020/09/unnamed-800x600.jpg',
  'musi-residence': 'https://images.rukita.co/buildings/building/a32b693b-11c.jpg',
  'bukit-indah': 'https://www.kostjakarta.com/images2/5076_1.jpg',
  'sekar-wangi':
    'https://www.properthy.com/storage/properties/old_v1/Rumah%20Kost%20%20Dijual%20di%20Banyumanik%20Semarang%20Dekat%20Kampus%20UNDIP%2C%20Kampus%20POLINES%2C%20Poltekkes%20Kemenkes%2C%20Transmart%20Setiabudi%2C%20RS%20Banyumanik%200002-a9609.jpeg',
  kenanga: 'https://images.rukita.co/ais/f50d73cf-f947-447e-b881-7be535f38e76.jpeg',
  harapan: 'https://imgx.parapuan.co/crop/0x0%3A0x0/945x630/photo/2025/01/21/rukita-00jpg-20250121032657.jpg',
  pelangi:
    'https://sgp1.digitaloceanspaces.com/www.sewakost.com-69925f5b4547e/listings/02-2020/ad29519/kost-dago-bangbayang-residence-dago-859242260_large.jpg',
}

const lines = (...l) => l.join('\n')

const JSX_FROM = '        {foto ? <img src={foto} alt="" loading="lazy" /> : <Icon name="home" size={30} />}\n'
const JSX_TO =
  lines(
    '        {foto ? (',
    '          <img',
    '            src={foto}',
    '            alt={`Foto ilustrasi ${nama}`}',
    '            loading="lazy"',
    '            decoding="async"',
    '          />',
    '        ) : (',
    '          <Icon name="home" size={30} />',
    '        )}',
    '        {foto && <span className={s.photoNote}>Foto ilustrasi</span>}',
  ) + '\n'

const IMG_FROM = '.photo img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n'
const NOTE = lines(
  '',
  '.photoNote {',
  '  position: absolute;',
  '  right: 0.35rem;',
  '  bottom: 0.35rem;',
  '  padding: 0.15rem 0.4rem;',
  '  border-radius: var(--radius-s);',
  '  background: rgb(0 0 0 / 62%);',
  '  color: #fff;',
  '  font-size: 0.65rem;',
  '  line-height: 1.3;',
  '}',
  '',
)

// Tiap langkah: [nama, apakah sudah diterapkan?, ubah]
const step = (name, from, to) => ({ name, from, to })

const FILES = {
  'src/components/sections/KosItem.jsx': [step('tampilan foto + label', JSX_FROM, JSX_TO)],
  'src/components/sections/KosItem.module.css': [
    step('lebar kolom foto (mobile)', '  grid-template-columns: 5rem minmax(0, 1fr);', '  grid-template-columns: 7rem minmax(0, 1fr);'),
    step(
      'kotak foto 4:3',
      '.photo {\n  display: grid;\n  place-items: center;\n  aspect-ratio: 1;\n',
      '.photo {\n  position: relative;\n  display: grid;\n  place-items: center;\n  width: 100%;\n  aspect-ratio: 4 / 3;\n',
    ),
    step('gaya label foto', IMG_FROM, IMG_FROM + NOTE),
    step('lebar kolom foto (desktop)', '    grid-template-columns: 6.5rem minmax(0, 1fr) 13rem;', '    grid-template-columns: 8rem minmax(0, 1fr) 13rem;'),
  ],
  'src/data/kos.js': [
    step(
      'komentar header',
      '  foto: isi URL gambar bila ada (bila null, tampil placeholder).',
      '  foto: URL foto ilustrasi bangunan kos/rumah untuk data contoh.',
    ),
  ],
}

let gagal = 0
const ringkas = []

for (const [file, steps] of Object.entries(FILES)) {
  if (!existsSync(file)) {
    console.error(`GAGAL  ${file}: file tidak ditemukan. Jalankan dari root repo.`)
    gagal++
    continue
  }
  const raw = readFileSync(file, 'utf8')
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  let text = raw.replace(/\r\n/g, '\n')
  let berubah = 0

  const all = [...steps]
  if (file.endsWith('kos.js')) {
    for (const [id, url] of Object.entries(FOTO)) {
      all.push({
        name: `foto ${id}`,
        done: text.includes(`'${url}'`),
        apply: (t) => {
          const re = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?foto:\\s*)null(\\s*,)`)
          return re.test(t) ? t.replace(re, (_, a, b) => `${a}'${url}'${b}`) : null
        },
      })
    }
  }

  for (const st of all) {
    if (st.apply) {
      if (st.done) continue
      const out = st.apply(text)
      if (out === null) {
        console.error(`GAGAL  ${file}: "${st.name}" tidak ketemu (foto sudah bukan null / id berubah?)`)
        gagal++
      } else {
        text = out
        berubah++
      }
      continue
    }
    if (text.includes(st.to)) continue // sudah diterapkan
    if (!text.includes(st.from)) {
      console.error(`GAGAL  ${file}: "${st.name}" tidak ketemu (file lokal beda dari yang diharapkan)`)
      gagal++
      continue
    }
    text = text.replace(st.from, () => st.to)
    berubah++
  }

  if (berubah) writeFileSync(file, text.replace(/\n/g, eol))
  ringkas.push(`${berubah ? 'OK    ' : 'SUDAH '} ${file}${berubah ? ` (${berubah} perubahan)` : ''}`)
}

console.log(ringkas.join('\n'))
if (gagal) {
  console.error(`\n${gagal} langkah gagal. Kirim pesan GAGAL di atas ke sini.`)
  process.exit(1)
}
console.log('\nSelesai.')
