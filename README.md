# KOSCHECK landing page

React + Vite.

## Menjalankan
```bash
npm install
npm run dev      # buka http://localhost:5173
npm run build    # hasil di folder dist/
```

## Struktur (untuk dikembangkan)
- `src/data/content.js`  semua teks halaman (ganti copy di sini)
- `src/styles/global.css`  design tokens di `:root` + style tiap section
- `src/components/`  satu file per section; `Checklist.jsx` adalah elemen khas brand
- `src/App.jsx`  urutan section; tambah section baru dengan menambah komponen di sini

## Ide pengembangan
Section harga/biaya, daftar kos contoh, FAQ, form waitlist, React Router untuk halaman hasil pencarian.
