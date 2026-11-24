# QRIS merchant

Letakkan gambar QRIS statis resmi GoPay Merchant KOSCHECK dengan nama `gopay-merchant.png` di folder ini. Jangan memakai screenshot QR dinamis/kedaluwarsa atau QR simulasi. Pastikan gambar dapat dipindai, nama merchant benar, dan area putih di sekitar kode tidak terpotong. Gambar sengaja tidak disertakan dalam patch karena belum diberikan.

Checkout menyimpan pesanan pending menggunakan nominal backend. Admin harus mencocokkan transaksi pada GoPay Merchant; konfirmasi WhatsApp tidak mengubah status database. Fitur admin untuk menandai lunas belum termasuk hotfix ini.
