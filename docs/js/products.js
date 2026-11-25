/* Halora — data produk terpusat
   Semua harga dalam Rupiah. Visual cincin adalah foto produk mandiri
   bergaya katalog toko (cincin saja tanpa tangan, latar sage polos):
   assets/ring-rose-gold.webp, ring-perak.webp, ring-hitam.webp
   (dibuat 2026-11-25 atas permintaan user). Aksesori memakai
   ilustrasi SVG. */
var HERO_IMG = "assets/halora-hero.webp";
var PHOTO_W = 1920, PHOTO_H = 1084;

/* Kotak potong pada foto hero: [x, y, lebar, tinggi] dalam piksel foto.
   Cincin berada di sekitar (996, 460) pada foto asli. */
var CROP_RING = { x: 876, y: 340, w: 240, h: 240 };
var CROP_RING_HAND = { x: 796, y: 260, w: 400, h: 400 };
var CROP_HAND = { x: 660, y: 180, w: 620, h: 700 };

var RING_SIZES = [6, 7, 8, 9, 10, 11, 12, 13];

var PRODUCTS = [
  {
    id: 1, slug: "halora-rose-gold", name: "Halora Ring — Rose Gold",
    category: "cincin", finish: "Rose Gold",
    price: 4899000, promoPrice: 4399000, rating: 4.9, reviews: 132, badge: "Promo",
    visual: "product", img: "assets/ring-rose-gold.webp",
    tagline: "Finishing rose gold yang hangat, pita dalam hitam matte.",
    desc: "Cincin pintar Halora dengan sensor optik generasi terbaru untuk tidur, pemulihan, stres, detak jantung, dan aktivitas. Bodi titanium ringan dengan lapisan rose gold, tahan air 10 ATM, dan baterai hingga 7 hari."
  },
  {
    id: 2, slug: "halora-perak", name: "Halora Ring — Perak",
    category: "cincin", finish: "Perak",
    price: 4899000, promoPrice: null, rating: 4.8, reviews: 98, badge: "",
    visual: "product", img: "assets/ring-perak.webp",
    tagline: "Perak dipoles cermin, tenang dan serbaguna.",
    desc: "Sensor dan fitur yang sama dengan finishing perak klasik. Bodi titanium ringan, pita dalam hitam matte, tahan air 10 ATM, dan baterai hingga 7 hari untuk pemantauan 24/7 tanpa terasa memakai apa pun."
  },
  {
    id: 3, slug: "halora-hitam", name: "Halora Ring — Hitam",
    category: "cincin", finish: "Hitam",
    price: 4899000, promoPrice: null, rating: 4.9, reviews: 57, badge: "Baru",
    visual: "product", img: "assets/ring-hitam.webp",
    tagline: "Hitam matte yang tegas, tetap ringan di jari.",
    desc: "Edisi hitam matte dengan rangkaian sensor lengkap Halora: tahap tidur, HRV, suhu kulit, dan skor kesiapan harian. Bodi titanium, tahan air 10 ATM, baterai hingga 7 hari."
  },
  {
    id: 4, slug: "dock-pengisi-daya", name: "Dock Pengisi Daya Halora",
    category: "aksesori", finish: "",
    price: 349000, promoPrice: null, rating: 4.9, reviews: 210, badge: "",
    visual: "svg-dock",
    tagline: "Dock magnetik USB-C, isi penuh sekitar 60 menit.",
    desc: "Dock pengisi daya magnetik untuk Halora Ring. Konektor USB-C, indikator LED lembut, dan alas anti-selip. Satu dock cadangan untuk meja kerja atau tas perjalananmu."
  },
  {
    id: 5, slug: "kabel-usb-c", name: "Kabel USB-C Cadangan",
    category: "aksesori", finish: "",
    price: 149000, promoPrice: null, rating: 4.7, reviews: 164, badge: "",
    visual: "svg-cable",
    tagline: "Kabel nilon kepang 1 m untuk dock Halora.",
    desc: "Kabel USB-C ke USB-C sepanjang 1 meter dengan anyaman nilon yang awet, khusus untuk dock pengisi daya Halora. Ringan dibawa dan tidak mudah kusut."
  },
  {
    id: 6, slug: "pouch-kulit", name: "Pouch Kulit Halora",
    category: "aksesori", finish: "",
    price: 249000, promoPrice: null, rating: 4.8, reviews: 73, badge: "Habis",
    visual: "svg-pouch", stock: 0,
    tagline: "Kulit nabati lembut dengan penutup magnetik.",
    desc: "Pouch perjalanan dari kulit nabati untuk Halora Ring dan dock-nya. Lapisan mikrofiber di dalam menjaga finishing cincin tetap mulus. Stok sedang kosong — kembali lagi nanti."
  }
];

function formatRp(n) {
  return "Rp" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function getProduct(slug) {
  for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
  return null;
}
function basePrice(p) { return p.promoPrice ? p.promoPrice : p.price; }
function isRing(p) { return p.category === "cincin"; }
function sizeLabel(size) { return size === "std" ? "Standar" : "Ukuran " + size; }

/* Gaya crop foto: elemen memakai aspect-ratio dari kotak potong.
   PENTING: url('...') memakai kutip tunggal — atribut style pada HTML yang
   dibuat lewat JS dibatasi kutip ganda, jadi kutip ganda di dalam url()
   akan memutus atribut dan gambar hilang. */
function cropStyle(box, img) {
  var sx = (PHOTO_W / box.w * 100).toFixed(4);
  var sy = (PHOTO_H / box.h * 100).toFixed(4);
  var px = PHOTO_W === box.w ? 0 : (box.x / (PHOTO_W - box.w) * 100).toFixed(4);
  var py = PHOTO_H === box.h ? 0 : (box.y / (PHOTO_H - box.h) * 100).toFixed(4);
  return "background-image:url('" + (img || HERO_IMG) + "');background-size:" + sx + "% " + sy +
    "%;background-position:" + px + "% " + py + "%;aspect-ratio:" + box.w + "/" + box.h + ";";
}

/* Ilustrasi SVG sederhana untuk aksesori, di atas latar sage. */
function accessorySVG(kind) {
  var ring = '<circle cx="100" cy="86" r="34" fill="none" stroke="#C08552" stroke-width="11"/>' +
    '<circle cx="100" cy="86" r="28" fill="none" stroke="#23272B" stroke-width="4"/>';
  if (kind === "svg-dock") {
    return '<svg viewBox="0 0 200 160" role="img" aria-label="Dock pengisi daya">' +
      '<rect x="52" y="104" width="96" height="18" rx="9" fill="#1E3227"/>' +
      '<rect x="86" y="94" width="28" height="12" rx="4" fill="#3F5447"/>' + ring +
      '<circle cx="100" cy="113" r="2.6" fill="#9B8A3E"/></svg>';
  }
  if (kind === "svg-cable") {
    return '<svg viewBox="0 0 200 160" role="img" aria-label="Kabel USB-C">' +
      '<path d="M46 118 C46 66 84 44 104 62 C124 80 96 104 116 116 C132 126 154 112 154 92" fill="none" stroke="#3F5447" stroke-width="7" stroke-linecap="round"/>' +
      '<rect x="146" y="76" width="16" height="24" rx="5" transform="rotate(24 154 88)" fill="#1E3227"/>' +
      '<rect x="36" y="110" width="16" height="24" rx="5" transform="rotate(-18 44 122)" fill="#1E3227"/></svg>';
  }
  return '<svg viewBox="0 0 200 160" role="img" aria-label="Pouch kulit">' +
    '<rect x="52" y="42" width="96" height="84" rx="16" fill="#A9805A"/>' +
    '<path d="M52 58 a16 16 0 0 1 16 -16 h64 a16 16 0 0 1 16 16 l-48 30 z" fill="#96714D"/>' +
    '<circle cx="100" cy="86" r="6" fill="#1E3227"/><circle cx="100" cy="86" r="2.4" fill="#CBCFB8"/></svg>';
}

/* HTML visual produk: foto produk penuh untuk cincin, SVG untuk aksesori. */
function productVisual(p, cls) {
  if (p.visual === "product") {
    return '<span class="' + cls + ' photo-crop" style="background-image:url(\'' + p.img + '\');background-size:cover;background-position:center;aspect-ratio:1/1;" role="img" aria-label="' + p.name + '"></span>';
  }
  if (p.visual === "photo") {
    return '<span class="' + cls + ' photo-crop" style="' + cropStyle(p.crop, p.img) + '" role="img" aria-label="' + p.name + '"></span>';
  }
  return '<span class="' + cls + ' svg-visual">' + accessorySVG(p.visual) + "</span>";
}

function starRow(rating) {
  var full = Math.round(rating);
  var out = "";
  for (var i = 0; i < 5; i++) out += i < full ? "★" : "☆";
  return out;
}
