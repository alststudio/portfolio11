/* Halora — katalog, modal produk, halaman keranjang, formulir, dan akun demo. */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

/* ---------- Kartu produk ---------- */
function badgeHTML(p) {
  if (p.stock === 0) return '<span class="badge badge-out">Habis</span>';
  if (!p.badge) return "";
  return '<span class="badge' + (p.badge === "Promo" ? " badge-promo" : "") + '">' + p.badge + "</span>";
}
function priceHTML(p) {
  if (p.promoPrice) {
    return '<span class="price-old">' + formatRp(p.price) + '</span> <span class="price">' + formatRp(p.promoPrice) + "</span>";
  }
  return '<span class="price">' + formatRp(p.price) + "</span>";
}
function productCard(p) {
  var out = p.stock === 0;
  return '<article class="product-card">' +
    '<button class="card-media" data-quick="' + p.slug + '" aria-label="Lihat cepat ' + esc(p.name) + '">' +
      productVisual(p, "card-visual") + badgeHTML(p) + "</button>" +
    '<div class="card-body">' +
      '<div class="card-stars">' + starRow(p.rating) + " <span>" + String(p.rating).replace(".", ",") + " (" + p.reviews + ")</span></div>" +
      "<h3>" + p.name + "</h3>" +
      '<p class="card-tag">' + p.tagline + "</p>" +
      '<div class="card-foot">' + priceHTML(p) +
        '<button class="btn btn-small btn-dark" data-add="' + p.slug + '"' + (out ? " disabled" : "") + ">" +
        (out ? "Stok Habis" : "Tambah") + "</button>" +
      "</div></div></article>";
}

/* ---------- Katalog (produk.html) ---------- */
var shopState = { filter: "semua", query: "", sort: "unggulan" };
function shopFilterMatch(p) {
  if (shopState.filter === "semua") return true;
  if (shopState.filter === "aksesori") return p.category === "aksesori";
  if (shopState.filter === "cincin") return p.category === "cincin";
  return p.finish === shopState.filter;
}
function renderShop() {
  var grid = document.querySelector("#shopGrid");
  if (!grid) return;
  var list = PRODUCTS.filter(function (p) {
    return shopFilterMatch(p) &&
      p.name.toLowerCase().indexOf(shopState.query.toLowerCase()) !== -1;
  });
  if (shopState.sort === "harga-rendah") list.sort(function (a, b) { return basePrice(a) - basePrice(b); });
  if (shopState.sort === "harga-tinggi") list.sort(function (a, b) { return basePrice(b) - basePrice(a); });
  if (shopState.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
  grid.innerHTML = list.length
    ? list.map(productCard).join("")
    : '<p class="shop-empty">Tidak ada produk yang cocok. Coba kata kunci atau filter lain.</p>';
  var note = document.querySelector("#shopCount");
  if (note) note.textContent = "Menampilkan " + list.length + " dari " + PRODUCTS.length + " produk";
}
function initShop() {
  if (!document.querySelector("#shopGrid")) return;
  renderShop();
  document.querySelectorAll("[data-shop-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll("[data-shop-filter]").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      shopState.filter = chip.getAttribute("data-shop-filter");
      renderShop();
    });
  });
  var search = document.querySelector("#shopSearch");
  if (search) search.addEventListener("input", function () { shopState.query = search.value; renderShop(); });
  var sort = document.querySelector("#shopSort");
  if (sort) sort.addEventListener("change", function () { shopState.sort = sort.value; renderShop(); });
  var params = new URLSearchParams(location.search);
  var want = params.get("product");
  if (want && getProduct(want)) openModal(want);
}

/* ---------- Modal detail produk ---------- */
var modalState = { slug: null, size: null, qty: 1 };
function ensureModal() {
  if (document.querySelector(".product-modal")) return;
  var m = document.createElement("div");
  m.className = "product-modal";
  m.setAttribute("role", "dialog");
  m.setAttribute("aria-modal", "true");
  m.innerHTML =
    '<div class="modal-overlay" data-close-modal></div>' +
    '<div class="modal-box">' +
      '<button class="icon-btn modal-close" data-close-modal aria-label="Tutup detail">✕</button>' +
      '<div class="modal-media"></div>' +
      '<div class="modal-info">' +
        '<div class="card-stars modal-stars"></div>' +
        '<h3 class="modal-name"></h3>' +
        '<p class="modal-tag"></p>' +
        '<p class="modal-desc"></p>' +
        '<div class="modal-price"></div>' +
        '<div class="modal-sizes"></div>' +
        '<div class="modal-actions">' +
          '<div class="qty-stepper big">' +
            '<button data-modal-qty="-1" aria-label="Kurangi">−</button><span class="modal-qty">1</span>' +
            '<button data-modal-qty="1" aria-label="Tambah">+</button></div>' +
          '<button class="btn btn-dark modal-add">Tambah ke Keranjang</button>' +
        "</div>" +
        '<div class="modal-recs"><h4>Mungkin kamu juga suka</h4><div class="rec-row"></div></div>' +
      "</div></div>";
  document.body.appendChild(m);
  m.addEventListener("click", function (e) {
    if (e.target.closest("[data-close-modal]")) closeModal();
    var sizeBtn = e.target.closest("[data-modal-size]");
    if (sizeBtn) {
      modalState.size = sizeBtn.getAttribute("data-modal-size");
      m.querySelectorAll("[data-modal-size]").forEach(function (b) {
        b.classList.toggle("active", b === sizeBtn);
      });
    }
    var q = e.target.closest("[data-modal-qty]");
    if (q) {
      modalState.qty = Math.max(1, Math.min(9, modalState.qty + parseInt(q.getAttribute("data-modal-qty"), 10)));
      m.querySelector(".modal-qty").textContent = modalState.qty;
    }
    if (e.target.closest(".modal-add")) {
      var p = getProduct(modalState.slug);
      addToCart(p.slug, modalState.size, modalState.qty);
      closeModal();
      showToast(p.name + " (" + sizeLabel(modalState.size) + ") × " + modalState.qty + " masuk keranjang.");
      openDrawer();
    }
    var rec = e.target.closest("[data-rec]");
    if (rec) openModal(rec.getAttribute("data-rec"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
}
function openModal(slug) {
  var p = getProduct(slug);
  if (!p) return;
  ensureModal();
  modalState = { slug: slug, size: isRing(p) ? "9" : "std", qty: 1 };
  var m = document.querySelector(".product-modal");
  m.querySelector(".modal-media").innerHTML = productVisual(p, "modal-visual") + badgeHTML(p);
  m.querySelector(".modal-stars").innerHTML = starRow(p.rating) + " <span>" + String(p.rating).replace(".", ",") + " (" + p.reviews + " ulasan)</span>";
  m.querySelector(".modal-name").textContent = p.name;
  m.querySelector(".modal-tag").textContent = p.tagline;
  m.querySelector(".modal-desc").textContent = p.desc;
  m.querySelector(".modal-price").innerHTML = priceHTML(p);
  m.querySelector(".modal-qty").textContent = "1";
  var sizes = m.querySelector(".modal-sizes");
  if (isRing(p)) {
    sizes.innerHTML = "<span class='sizes-label'>Ukuran cincin</span><div class='size-chips'>" +
      RING_SIZES.map(function (s) {
        return '<button data-modal-size="' + s + '"' + (String(s) === modalState.size ? ' class="active"' : "") + ">" + s + "</button>";
      }).join("") + "</div>" +
      '<p class="sizes-note">Belum tahu ukuranmu? Kit pengukur ukuran dikirim gratis bersama setiap cincin.</p>';
  } else {
    sizes.innerHTML = "";
  }
  var addBtn = m.querySelector(".modal-add");
  if (p.stock === 0) { addBtn.disabled = true; addBtn.textContent = "Stok Habis"; }
  else { addBtn.disabled = false; addBtn.textContent = "Tambah ke Keranjang"; }
  m.querySelector(".rec-row").innerHTML = PRODUCTS.filter(function (r) { return r.slug !== slug; })
    .slice(0, 3).map(function (r) {
      return '<button class="rec-card" data-rec="' + r.slug + '">' + productVisual(r, "rec-visual") +
        "<span>" + r.name + "</span><strong>" + formatRp(basePrice(r)) + "</strong></button>";
    }).join("");
  m.classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeModal() {
  var m = document.querySelector(".product-modal");
  if (m) m.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

/* ---------- Aksi global: tambah cepat & lihat cepat ---------- */
document.addEventListener("click", function (e) {
  var add = e.target.closest("[data-add]");
  if (add && !add.disabled) {
    var p = getProduct(add.getAttribute("data-add"));
    if (isRing(p)) { openModal(p.slug); return; }
    addToCart(p.slug, "std", 1);
    showToast(p.name + " masuk keranjang.");
    openDrawer();
  }
  var quick = e.target.closest("[data-quick]");
  if (quick) openModal(quick.getAttribute("data-quick"));
  if (e.target.closest("[data-open-cart]") && !e.target.closest("[data-site-header]")) openDrawer();
});

/* ---------- Beranda: produk unggulan, FAQ, newsletter ---------- */
function initHome() {
  var grid = document.querySelector("#featuredGrid");
  if (grid) {
    grid.innerHTML = PRODUCTS.filter(function (p) { return p.category === "cincin"; })
      .map(productCard).join("");
  }
  document.querySelectorAll(".faq-item > button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.parentElement.classList.toggle("open");
    });
  });
  var news = document.querySelector("#newsletterForm");
  if (news) {
    news.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = news.querySelector("input[type=email]");
      var msg = news.querySelector(".form-msg");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        msg.textContent = "Masukkan alamat email yang valid.";
        msg.className = "form-msg error";
        return;
      }
      msg.textContent = "Terima kasih sudah berlangganan! (Simulasi — email tidak benar-benar dikirim atau disimpan di server.)";
      msg.className = "form-msg ok";
      news.reset();
    });
  }
}

/* ---------- Halaman keranjang ---------- */
function renderCartPage() {
  var box = document.querySelector("#cartPageItems");
  if (!box) return;
  var cart = getCart();
  if (!cart.length) {
    box.innerHTML = '<p class="drawer-empty">Keranjangmu masih kosong. <a href="produk.html">Lihat produk</a> untuk mulai.</p>';
  } else {
    box.innerHTML = cart.map(function (it) {
      var p = getProduct(it.slug);
      if (!p) return "";
      return '<div class="cart-line">' + productVisual(p, "drawer-thumb") +
        '<div class="drawer-info"><strong>' + p.name + "</strong><span>" + sizeLabel(it.size) + " · " + formatRp(basePrice(p)) + "</span>" +
        '<div class="qty-stepper">' +
          '<button data-page-qty="' + (it.qty - 1) + '" data-slug="' + it.slug + '" data-size="' + it.size + '">−</button><span>' + it.qty + "</span>" +
          '<button data-page-qty="' + (it.qty + 1) + '" data-slug="' + it.slug + '" data-size="' + it.size + '">+</button>' +
          '<button class="drawer-remove" data-page-remove data-slug="' + it.slug + '" data-size="' + it.size + '">Hapus</button>' +
        "</div></div>" +
        '<strong class="drawer-line">' + formatRp(basePrice(p) * it.qty) + "</strong></div>";
    }).join("");
  }
  var sub = cartSubtotal();
  var subEl = document.querySelector("#cartPageSubtotal");
  var totEl = document.querySelector("#cartPageTotal");
  if (subEl) subEl.textContent = formatRp(sub);
  if (totEl) totEl.textContent = formatRp(sub);
}
function initCartPage() {
  if (!document.querySelector("#cartPageItems")) return;
  renderCartPage();
  document.querySelector("#cartPageItems").addEventListener("click", function (e) {
    var q = e.target.closest("[data-page-qty]");
    if (q) {
      setQty(q.getAttribute("data-slug"), q.getAttribute("data-size"), parseInt(q.getAttribute("data-page-qty"), 10));
      renderCartPage();
    }
    var rm = e.target.closest("[data-page-remove]");
    if (rm) {
      removeItem(rm.getAttribute("data-slug"), rm.getAttribute("data-size"));
      renderCartPage();
    }
  });
}

/* ---------- Formulir kontak ---------- */
function initContact() {
  var form = document.querySelector("#contactForm");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = form.querySelector(".form-msg");
    var name = form.querySelector("[name=nama]").value.trim();
    var email = form.querySelector("[name=email]").value.trim();
    var text = form.querySelector("[name=pesan]").value.trim();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || text.length < 5) {
      msg.textContent = "Periksa lagi nama, email, dan pesanmu — masih ada yang belum lengkap.";
      msg.className = "form-msg error";
      return;
    }
    msg.textContent = "Pesan terkirim! (Simulasi — pesan tidak benar-benar dikirim.) Terima kasih, " + name.split(" ")[0] + ".";
    msg.className = "form-msg ok";
    form.reset();
  });
}

/* ---------- Akun demo (masuk / daftar / akun) ---------- */
function initAuth() {
  var reg = document.querySelector("#registerForm");
  if (reg) {
    reg.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = reg.querySelector("[name=nama]").value.trim();
      var email = reg.querySelector("[name=email]").value.trim();
      var pass = reg.querySelector("[name=password]").value;
      var msg = reg.querySelector(".form-msg");
      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || pass.length < 6) {
        msg.textContent = "Nama minimal 2 huruf, email harus valid, dan kata sandi minimal 6 karakter.";
        msg.className = "form-msg error";
        return;
      }
      /* DEMO: hanya nama + email yang disimpan. Kata sandi TIDAK pernah disimpan. */
      storeSet(USER_KEY, { name: name, email: email });
      setSession(email);
      location.href = "akun.html";
    });
  }
  var login = document.querySelector("#loginForm");
  if (login) {
    login.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = login.querySelector("[name=email]").value.trim();
      var msg = login.querySelector(".form-msg");
      var u = getUser();
      if (u && u.email === email) {
        setSession(email);
        location.href = "akun.html";
      } else {
        msg.textContent = "Akun demo dengan email itu tidak ditemukan di perangkat ini. Silakan daftar dulu.";
        msg.className = "form-msg error";
      }
    });
    var forgot = login.querySelector("[data-forgot]");
    if (forgot) {
      forgot.addEventListener("click", function (e) {
        e.preventDefault();
        var panel = document.querySelector("#forgotPanel");
        if (panel) panel.style.display = panel.style.display === "block" ? "none" : "block";
      });
    }
  }
  var account = document.querySelector("#accountBox");
  if (account) {
    var s = getSession();
    var u2 = getUser();
    if (!s || !u2 || u2.email !== s.email) { location.href = "masuk.html"; return; }
    document.querySelector("#accName").textContent = u2.name;
    document.querySelector("#accEmail").textContent = u2.email;
    var orders = getOrders().filter(function (o) { return o.email === u2.email; });
    var list = document.querySelector("#accOrders");
    list.innerHTML = orders.length ? orders.slice().reverse().map(function (o) {
      return '<div class="order-card"><div class="order-head"><strong>' + o.id + "</strong>" +
        "<span>" + new Date(o.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) + "</span></div>" +
        "<ul>" + o.items.map(function (it) {
          return "<li>" + it.name + " — " + sizeLabel(it.size) + " × " + it.qty + " <span>" + formatRp(it.total) + "</span></li>";
        }).join("") + "</ul>" +
        '<div class="order-total">Total: <strong>' + formatRp(o.total) + "</strong> · " + o.payment + "</div></div>";
    }).join("") : '<p class="drawer-empty">Belum ada pesanan. Pesanan demo pertamamu akan muncul di sini.</p>';
    var out = document.querySelector("#logoutBtn");
    if (out) out.addEventListener("click", function () { clearSession(); location.href = "index.html"; });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initShop();
  initHome();
  initCartPage();
  initContact();
  initAuth();
});
