/* Halora — keranjang, pesanan, voucher, dan sesi demo (localStorage).
   Ini simulasi: tidak ada data yang dikirim ke server mana pun. */
var CART_KEY = "halora_cart";
var ORDERS_KEY = "halora_orders";
var USER_KEY = "halora_demo_user";
var SESSION_KEY = "halora_session";
var VOUCHER_CODE = "HALORA10";
var VOUCHER_RATE = 0.10;

function storeGet(key, fallback) {
  try {
    var v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) { return fallback; }
}
function storeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
function storeDel(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

/* ---------- Keranjang ---------- */
function getCart() { return storeGet(CART_KEY, []); }
function saveCart(cart) { storeSet(CART_KEY, cart); syncBadges(); }
function cartCount() {
  return getCart().reduce(function (n, it) { return n + it.qty; }, 0);
}
function cartSubtotal() {
  return getCart().reduce(function (sum, it) {
    var p = getProduct(it.slug);
    return p ? sum + basePrice(p) * it.qty : sum;
  }, 0);
}
function addToCart(slug, size, qty) {
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].slug === slug && cart[i].size === size) {
      cart[i].qty += qty;
      saveCart(cart);
      return;
    }
  }
  cart.push({ slug: slug, size: size, qty: qty });
  saveCart(cart);
}
function setQty(slug, size, qty) {
  var cart = getCart().filter(function (it) {
    if (it.slug === slug && it.size === size) it.qty = qty;
    return it.qty > 0;
  });
  saveCart(cart);
}
function removeItem(slug, size) {
  saveCart(getCart().filter(function (it) {
    return !(it.slug === slug && it.size === size);
  }));
}
function clearCart() { saveCart([]); }

function syncBadges() {
  var n = cartCount();
  var els = document.querySelectorAll("[data-cart-count]");
  for (var i = 0; i < els.length; i++) {
    els[i].textContent = n;
    els[i].style.display = n > 0 ? "" : "none";
  }
  var labels = document.querySelectorAll("[data-cart-label]");
  for (var j = 0; j < labels.length; j++) labels[j].textContent = "Keranjang (" + n + ")";
}

/* ---------- Toast ---------- */
function showToast(msg) {
  var t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove("show"); }, 2600);
}

/* ---------- Laci keranjang ---------- */
function ensureDrawer() {
  if (document.querySelector(".cart-drawer")) return;
  var wrap = document.createElement("div");
  wrap.innerHTML =
    '<div class="drawer-overlay" data-close-drawer></div>' +
    '<aside class="cart-drawer" aria-label="Keranjang belanja">' +
      '<div class="drawer-head"><h3>Keranjang Kamu</h3>' +
      '<button class="icon-btn" data-close-drawer aria-label="Tutup keranjang">✕</button></div>' +
      '<div class="drawer-items"></div>' +
      '<div class="drawer-foot">' +
        '<div class="drawer-row"><span>Subtotal</span><strong class="drawer-subtotal"></strong></div>' +
        '<div class="drawer-row total"><span>Total</span><strong class="drawer-total"></strong></div>' +
        '<a class="btn btn-dark btn-block" href="checkout.html">Checkout</a>' +
        '<a class="btn btn-ghost btn-block" href="keranjang.html">Lihat Keranjang</a>' +
      "</div>" +
    "</aside>";
  document.body.appendChild(wrap);
  wrap.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close-drawer")) closeDrawer();
    var btn = e.target.closest("[data-drawer-qty]");
    if (btn) {
      setQty(btn.getAttribute("data-slug"), btn.getAttribute("data-size"),
        parseInt(btn.getAttribute("data-drawer-qty"), 10));
      renderDrawer();
    }
    var rm = e.target.closest("[data-drawer-remove]");
    if (rm) {
      removeItem(rm.getAttribute("data-slug"), rm.getAttribute("data-size"));
      renderDrawer();
    }
  });
}
function renderDrawer() {
  ensureDrawer();
  var box = document.querySelector(".drawer-items");
  var cart = getCart();
  if (!cart.length) {
    box.innerHTML = '<p class="drawer-empty">Keranjangmu masih kosong.<br>Jelajahi cincinnya dan temukan ukuranmu.</p>';
  } else {
    box.innerHTML = cart.map(function (it) {
      var p = getProduct(it.slug);
      if (!p) return "";
      return '<div class="drawer-item">' +
        productVisual(p, "drawer-thumb") +
        '<div class="drawer-info"><strong>' + p.name + "</strong>" +
        "<span>" + sizeLabel(it.size) + " · " + formatRp(basePrice(p)) + "</span>" +
        '<div class="qty-stepper">' +
          '<button data-drawer-qty="' + (it.qty - 1) + '" data-slug="' + it.slug + '" data-size="' + it.size + '" aria-label="Kurangi">−</button>' +
          "<span>" + it.qty + "</span>" +
          '<button data-drawer-qty="' + (it.qty + 1) + '" data-slug="' + it.slug + '" data-size="' + it.size + '" aria-label="Tambah">+</button>' +
          '<button class="drawer-remove" data-drawer-remove data-slug="' + it.slug + '" data-size="' + it.size + '">Hapus</button>' +
        "</div></div>" +
        '<strong class="drawer-line">' + formatRp(basePrice(p) * it.qty) + "</strong></div>";
    }).join("");
  }
  var sub = cartSubtotal();
  document.querySelector(".drawer-subtotal").textContent = formatRp(sub);
  document.querySelector(".drawer-total").textContent = formatRp(sub);
  syncBadges();
}
function openDrawer() {
  renderDrawer();
  document.querySelector(".cart-drawer").classList.add("open");
  document.querySelector(".drawer-overlay").classList.add("show");
  document.body.classList.add("no-scroll");
}
function closeDrawer() {
  var d = document.querySelector(".cart-drawer");
  var o = document.querySelector(".drawer-overlay");
  if (d) d.classList.remove("open");
  if (o) o.classList.remove("show");
  document.body.classList.remove("no-scroll");
}

/* ---------- Pesanan ---------- */
function getOrders() { return storeGet(ORDERS_KEY, []); }
function createOrder(data) {
  var orders = getOrders();
  var num = 1000 + orders.length + Math.floor(Math.random() * 90);
  var order = {
    id: "HLR-2026-" + num,
    date: new Date().toISOString(),
    items: getCart().map(function (it) {
      var p = getProduct(it.slug);
      return { name: p ? p.name : it.slug, size: it.size, qty: it.qty, total: p ? basePrice(p) * it.qty : 0 };
    }),
    subtotal: data.subtotal, discount: data.discount, total: data.total,
    name: data.name, email: data.email, phone: data.phone,
    address: data.address, payment: data.payment, voucher: data.voucher || ""
  };
  orders.push(order);
  storeSet(ORDERS_KEY, orders);
  return order;
}

/* ---------- Sesi demo ---------- */
function getUser() { return storeGet(USER_KEY, null); }
function getSession() { return storeGet(SESSION_KEY, null); }
function setSession(email) { storeSet(SESSION_KEY, { email: email, at: Date.now() }); }
function clearSession() { storeDel(SESSION_KEY); }
