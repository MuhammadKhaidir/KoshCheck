/*
  Kecilkan foto di browser sebelum diunggah: sisi terpanjang maks 800px, diubah ke JPEG.
  Hasilnya data URL (teks) yang ukurannya biasanya 50-150 KB, jadi muat di body request Vercel
  dan bisa disimpan di kolom database biasa. Batas MAX_CHARS harus sama dengan FOTO_MAX_CHARS
  di api/admin-listings.js.
*/
const MAX_SIDE = 800
const MAX_CHARS = 400_000

export async function compressImage(file) {
  if (!file?.type?.startsWith('image/')) throw new Error('File harus berupa gambar.')

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Format gambar tidak didukung. Pakai JPG, PNG, atau WebP.')
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // PNG transparan jadi putih, bukan hitam
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  for (const quality of [0.72, 0.55, 0.4]) {
    const url = canvas.toDataURL('image/jpeg', quality)
    if (url.length <= MAX_CHARS) return url
  }
  throw new Error('Foto terlalu besar. Coba foto lain.')
}
