/* Halora — checkout demo dan halaman sukses.
   Semua pembayaran adalah simulasi; tidak ada data yang meninggalkan perangkat. */
var checkoutState = { voucher: "", discount: 0 };

function renderCheckoutSummary() {
  var box = document.querySelector("#summaryItems");
  if (!box) return;
  var cart = getCart();
  box.innerHTML = cart.map(function (it) {
    var p = getProduct(it.slug);
    if (!p) return "";
    return '<div class="summary-line"><span>' + p.name + " — " + sizeLabel(it.size) + " × " + it.qty +
      "</span><strong>" + formatRp(basePrice(p) * it.qty) + "</strong></div>";
  }).join("");
  var sub = cartSubtotal();
  var total = sub - checkoutState.discount;
  document.querySelector("#summarySubtotal").textContent = formatRp(sub);
  var discRow = document.querySelector("#summaryDiscountRow");
  if (discRow) {
    discRow.style.display = checkoutState.discount > 0 ? "" : "none";
    document.querySelector("#summaryDiscount").textContent = "−" + formatRp(checkoutState.discount);
  }
  document.querySelector("#summaryTotal").textContent = formatRp(total);
}

function initCheckout() {
  var form = document.querySelector("#checkoutForm");
  if (!form) return;
  if (!getCart().length) { location.href = "keranjang.html"; return; }
  renderCheckoutSummary();

  var applyBtn = document.querySelector("#applyVoucher");
  if (applyBtn) {
    applyBtn.addEventListener("click", function () {
      var input = document.querySelector("#voucherInput");
      var msg = document.querySelector("#voucherMsg");
      var code = input.value.trim().toUpperCase();
      if (code === VOUCHER_CODE) {
        checkoutState.voucher = code;
        checkoutState.discount = Math.round(cartSubtotal() * VOUCHER_RATE);
        msg.textContent = "Voucher " + VOUCHER_CODE + " aktif — diskon 10% diterapkan.";
        msg.className = "form-msg ok";
      } else {
        checkoutState.voucher = "";
        checkoutState.discount = 0;
        msg.textContent = "Kode voucher tidak dikenal. Coba HALORA10.";
        msg.className = "form-msg error";
      }
      renderCheckoutSummary();
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = form.querySelector(".form-msg");
    var name = form.querySelector("[name=nama]").value.trim();
    var email = form.querySelector("[name=email]").value.trim();
    var phone = form.querySelector("[name=telepon]").value.trim();
    var address = form.querySelector("[name=alamat]").value.trim();
    var city = form.querySelector("[name=kota]").value.trim();
    var zip = form.querySelector("[name=kodepos]").value.trim();
    var payment = form.querySelector("input[name=pembayaran]:checked");
    var problems = [];
    if (name.length < 2) problems.push("nama");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push("email");
    if (phone.replace(/\D/g, "").length < 9) problems.push("telepon");
    if (address.length < 8) problems.push("alamat");
    if (city.length < 2) problems.push("kota");
    if (!/^\d{5}$/.test(zip)) problems.push("kode pos (5 digit)");
    if (!payment) problems.push("metode pembayaran");
    if (problems.length) {
      msg.textContent = "Masih ada yang perlu diperiksa: " + problems.join(", ") + ".";
      msg.className = "form-msg error";
      return;
    }
    var sub = cartSubtotal();
    var order = createOrder({
      subtotal: sub,
      discount: checkoutState.discount,
      total: sub - checkoutState.discount,
      name: name, email: email, phone: phone,
      address: address + ", " + city + " " + zip,
      payment: payment.value,
      voucher: checkoutState.voucher
    });
    clearCart();
    location.href = "order-success.html?id=" + encodeURIComponent(order.id);
  });
}

function initSuccess() {
  var box = document.querySelector("#successBox");
  if (!box) return;
  var id = new URLSearchParams(location.search).get("id");
  var orders = getOrders();
  var order = null;
  for (var i = orders.length - 1; i >= 0; i--) {
    if (!id || orders[i].id === id) { order = orders[i]; break; }
  }
  if (!order) {
    box.innerHTML = '<p class="drawer-empty">Pesanan tidak ditemukan. <a href="produk.html">Kembali ke produk</a>.</p>';
    return;
  }
  document.querySelector("#successOrderId").textContent = order.id;
  document.querySelector("#successItems").innerHTML = order.items.map(function (it) {
    return "<li>" + it.name + " — " + sizeLabel(it.size) + " × " + it.qty + " <span>" + formatRp(it.total) + "</span></li>";
  }).join("");
  document.querySelector("#successTotal").textContent = formatRp(order.total);
  document.querySelector("#successMeta").innerHTML =
    "Nama: " + order.name + "<br>Email: " + order.email + "<br>Alamat: " + order.address +
    "<br>Pembayaran: " + order.payment + " (simulasi)";
}

document.addEventListener("DOMContentLoaded", function () {
  initCheckout();
  initSuccess();
});
