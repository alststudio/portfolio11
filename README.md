# Halora — Cincin Pintar untuk Kesehatan

Situs demo etalase untuk **Halora**, cincin pintar (smart ring) kesehatan dari Sage Studio.
Dibangun dengan HTML, CSS, dan JavaScript murni — tanpa framework dan tanpa langkah build.
Seluruh teks situs berbahasa Indonesia.

## Struktur

```
docs/                        <- akar situs (dilayani GitHub Pages dari folder /docs)
  index.html                 <- beranda: hero satu layar + bagian pelengkap (CSS & JS hero inline)
  produk.html                <- katalog: 3 cincin + 3 aksesori, filter, cari, urut
  tentang.html               <- cerita brand
  kontak.html                <- formulir kontak (simulasi)
  keranjang.html             <- halaman keranjang
  checkout.html              <- checkout demo + voucher HALORA10 (-10%)
  order-success.html         <- ringkasan pesanan (nomor HLR-2026-XXXX)
  masuk.html / daftar.html   <- akun demo
  akun.html                  <- profil + riwayat pesanan
  css/style.css              <- gaya bersama situs
  css/responsive.css         <- penyesuaian layar kecil
  js/products.js             <- DATA PRODUK TERPUSAT (nama, harga, deskripsi, potongan foto)
  js/cart.js                 <- keranjang, pesanan, voucher, sesi (localStorage)
  js/components.js           <- header & footer bersama
  js/app.js                  <- katalog, modal produk, keranjang, formulir, akun
  js/checkout.js             <- logika checkout & halaman sukses
  assets/halora-hero.webp    <- foto hero (lihat "Pemulihan foto" di bawah)
  assets/fonts/              <- Inter (variabel) & Poppins 300/400/500, WOFF2 latin, self-hosted
```

Semua jalur internal bersifat relatif, jadi situs aman dilayani dari subpath mana pun
(mis. `https://alststudio.github.io/portfolio11/`).

## Menjalankan secara lokal

Cukup layani folder `docs/` dengan server statis apa pun, misalnya:

```
cd docs && python3 -m http.server 8000
```

Lalu buka `http://localhost:8000/`. Untuk meniru subpath GitHub Pages, layani folder induk
yang berisi subfolder `portfolio11` (salinan `docs`) dan buka `/portfolio11/`.

## Cara mengubah

- **Harga, nama, deskripsi produk:** edit `docs/js/products.js` — satu-satunya sumber data.
  Harga promo diisi lewat `promoPrice` (atau `null`). Stok habis: beri `stock: 0`.
- **Gambar produk cincin:** potongan (crop) dari `assets/halora-hero.webp`. Kotak potongnya
  ada di `products.js` (`CROP_RING`, `CROP_RING_HAND`, `CROP_HAND`) dalam piksel foto asli
  1920×1084; ubah angkanya untuk membingkai ulang. Visual aksesori adalah SVG di fungsi
  `accessorySVG` pada berkas yang sama.
- **Logo:** SVG enam kelopak (lingkaran putus-putus) — versi hero ada inline di `index.html`,
  versi header/footer ada di `LOGO_SVG` pada `docs/js/components.js`.
- **Warna:** token CSS di bagian atas `docs/css/style.css` (`--sage`, `--forest`, `--olive`, …).
  Warna hero diatur di `<style>` inline pada `index.html`.
- **Kontak & footer:** teks kontak ada di `siteFooterHTML()` (`docs/js/components.js`) dan di
  kartu kontak `kontak.html` — email `halo@halora.example`, WhatsApp `0812-3456-7890`,
  Jl. Cemara No. 8, Jakarta Selatan. Semuanya contoh/placeholder.
- **Tautan media sosial:** saat ini situs tidak memasang tautan sosial; tambahkan di
  `siteFooterHTML()` bila diperlukan.
- **Voucher:** kode `HALORA10` dan potongan 10% diatur lewat `VOUCHER_CODE` / `VOUCHER_RATE`
  di `docs/js/cart.js`.

## Yang masih simulasi (demo)

- Keranjang, checkout, dan pesanan tersimpan di `localStorage` peramban (`halora_cart`,
  `halora_orders`). Tidak ada pembayaran sungguhan; metode Transfer Bank / E-Wallet / COD
  hanya label.
- Akun demo (`halora_demo_user`) hanya menyimpan **nama dan email** — kata sandi tidak pernah
  disimpan di mana pun.
- Formulir kontak dan newsletter hanya memvalidasi dan menampilkan pesan sukses.
- Testimoni di beranda adalah contoh, dan sudah dilabeli sebagai contoh.

## Catatan integrasi backend / pembayaran (untuk pengembangan lanjut)

- Ganti `createOrder()` di `js/cart.js` dengan panggilan `fetch` ke API pemesanan, dan
  `storeGet/storeSet` dengan sesi server bila akun sungguhan diperlukan.
- Untuk pembayaran sungguhan, buat transaksi di server (mis. payment gateway), lalu arahkan
  pembeli dari tombol "Buat Pesanan" di `checkout.html`; halaman `order-success.html` dapat
  membaca status transaksi dari parameter URL.
- Data produk di `js/products.js` sengaja berbentuk array objek sederhana agar mudah dipindah
  ke API/katalog dinamis.

## Pemulihan foto hero (photo recovery)

Prompt asli mengasumsikan ada foto diam dari bidikan yang sama dengan video latar, tetapi
hanya menyediakan URL video (MP4 1920×1084, ±4 detik, dari CDN CloudFront). Tidak ada berkas
poster di URL saudara (.jpg/.png/.webp semuanya 403). Karena itu foto hero dipulihkan dari
video itu sendiri:

1. MP4 diunduh sementara (tidak ikut disimpan di repo; situs menayangkan video langsung dari
   URL CDN).
2. Satu frame representatif yang tajam diekstrak dengan ffmpeg pada detik **±2,0** — komposisi
   tangan + cincin rose gold bersih, tanpa blur gerak.
3. Frame disimpan sebagai `docs/assets/halora-hero.webp` (kualitas 82) dan dipakai sebagai
   lapisan foto hero dengan kotak, jangkar, dan mask yang sama persis dengan lapisan video,
   sekaligus sebagai sumber potongan visual produk/bagian situs.

## Catatan adaptasi hero

Sesuai pola yang dipakai pada proyek sebelumnya: panggung hero bersifat `absolute` di dalam
seksi hero setinggi `100svh` di bagian atas `index.html` (bukan `fixed` mengambang di
viewport), dan halaman dapat digulir ke bagian pelengkap di bawahnya. Seluruh perilaku di
dalam hero tidak berubah: skala `--s = min(100vw/2048, 100vh/1152)` dengan lantai 0,55px di
desktop, foto berjangkar bawah, video menyilang halus di detik terakhir putarannya, animasi
masuk satu linimasa WAAPI, dan mode gerak-terbatas (reduced motion) tanpa video maupun animasi.
