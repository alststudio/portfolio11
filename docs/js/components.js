/* Halora — header & footer bersama untuk halaman-halaman situs.
   Di index.html, header ramping ini muncul setelah pengunjung melewati hero. */
var LOGO_SVG =
  '<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true">' +
  '<circle cx="20" cy="20" r="16.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3.5 3.1"/>' +
  '<g fill="currentColor"><ellipse cx="20" cy="11.5" rx="2.5" ry="4.4"/>' +
  '<ellipse cx="27.4" cy="16.3" rx="2.5" ry="4.4" transform="rotate(60 27.4 16.3)"/>' +
  '<ellipse cx="27.4" cy="23.7" rx="2.5" ry="4.4" transform="rotate(120 27.4 23.7)"/>' +
  '<ellipse cx="20" cy="28.5" rx="2.5" ry="4.4"/>' +
  '<ellipse cx="12.6" cy="23.7" rx="2.5" ry="4.4" transform="rotate(240 12.6 23.7)"/>' +
  '<ellipse cx="12.6" cy="16.3" rx="2.5" ry="4.4" transform="rotate(300 12.6 16.3)"/></g></svg>';

var NAV_LINKS = [
  { href: "index.html#teknologi", label: "Teknologi" },
  { href: "index.html#kesehatan", label: "Kesehatan" },
  { href: "produk.html", label: "Produk" },
  { href: "tentang.html", label: "Tentang" },
  { href: "kontak.html", label: "Kontak" }
];

function accountLinkHTML() {
  var s = getSession();
  var u = getUser();
  if (s && u && u.email === s.email) {
    return '<a class="site-account" href="akun.html">Halo, ' + u.name.split(" ")[0] + "</a>";
  }
  return '<a class="site-account" href="masuk.html">Masuk</a>';
}

function siteHeaderHTML(sticky) {
  var links = NAV_LINKS.map(function (l) {
    return '<a href="' + l.href + '">' + l.label + "</a>";
  }).join("");
  return '<div class="site-header-inner">' +
    '<a class="site-logo" href="index.html">' + LOGO_SVG + "<span>Halora</span></a>" +
    '<nav class="site-nav">' + links + "</nav>" +
    '<div class="site-actions">' + accountLinkHTML() +
      '<button class="site-cart" data-open-cart aria-label="Buka keranjang">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.2L20.6 8H7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10.4" cy="20.4" r="1.4" fill="currentColor"/><circle cx="17.6" cy="20.4" r="1.4" fill="currentColor"/></svg>' +
        '<span class="cart-badge" data-cart-count style="display:none">0</span>' +
      "</button>" +
      '<a class="site-cta" href="produk.html">Beli Cincin</a>' +
      '<button class="site-burger" data-burger aria-label="Buka menu"><span></span><span></span><span></span></button>' +
    "</div></div>" +
    '<div class="site-mobile-menu">' + links + accountLinkHTML() + "</div>";
}

function siteFooterHTML() {
  return '<div class="footer-grid">' +
    '<div class="footer-brand"><a class="site-logo" href="index.html">' + LOGO_SVG + "<span>Halora</span></a>" +
      "<p>Cincin pintar untuk tidur, pemulihan, stres, detak jantung, dan aktivitas — dipantau 24/7, diringkas jadi wawasan yang bisa kamu pakai.</p></div>" +
    '<div class="footer-col"><h4>Navigasi</h4>' +
      '<a href="index.html#teknologi">Teknologi</a><a href="index.html#kesehatan">Kesehatan</a>' +
      '<a href="produk.html">Produk</a><a href="tentang.html">Tentang</a><a href="kontak.html">Kontak</a></div>' +
    '<div class="footer-col"><h4>Kategori</h4>' +
      '<a href="produk.html">Cincin Pintar</a><a href="produk.html">Aksesori</a>' +
      '<a href="keranjang.html">Keranjang</a><a href="akun.html">Akun Saya</a></div>' +
    '<div class="footer-col"><h4>Hubungi Kami</h4>' +
      "<p>halo@halora.example<br>WhatsApp 0812-3456-7890<br>Jl. Cemara No. 8, Jakarta Selatan</p></div>" +
    "</div>" +
    '<div class="footer-bottom"><span>© 2026 Halora. Hak cipta dilindungi.</span>' +
    "<span>Demo etalase — tidak ada transaksi sungguhan.</span></div>";
}

function mountChrome() {
  var header = document.querySelector("[data-site-header]");
  if (header) {
    header.innerHTML = siteHeaderHTML();
    header.addEventListener("click", function (e) {
      if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openDrawer(); }
      if (e.target.closest("[data-burger]")) header.classList.toggle("menu-open");
    });
  }
  var footer = document.querySelector("[data-site-footer]");
  if (footer) footer.innerHTML = siteFooterHTML();

  /* Header beranda: muncul setelah melewati hero. */
  var heroHeader = document.querySelector("[data-hero-header]");
  if (heroHeader) {
    var onScroll = function () {
      var past = window.scrollY > window.innerHeight * 0.82;
      heroHeader.classList.toggle("visible", past);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  syncBadges();
}

document.addEventListener("DOMContentLoaded", mountChrome);
