const PRODUCTS_URL = "data/products.json";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID";

const fallbackProducts = [
  {
    id: "golden-mango-box",
    name: "Golden Mango Box",
    price: 650,
    unit: "5斤裝",
    image: "images/mango-01.png",
    description: "屏東陽光熟成，香氣濃郁、果肉細緻，適合冰鎮後享用。",
    available: true
  },
  {
    id: "creamy-avocado-box",
    name: "Creamy Avocado Box",
    price: 550,
    unit: "6顆裝",
    image: "images/avocado-01.png",
    description: "自然熟成的酪梨，適合酪梨牛奶、沙拉與早午餐。",
    available: true
  },
  {
    id: "summer-farm-set",
    name: "Summer Farm Set",
    price: 980,
    unit: "芒果＋酪梨綜合箱",
    image: "images/farm-set.png",
    description: "把夏天裝進一箱，芒果與酪梨一次帶回家。",
    available: true
  }
];

let products = [];
const state = {
  cart: {}
};

const productGrid = document.querySelector("#productGrid");
const productTemplate = document.querySelector("#productTemplate");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const orderForm = document.querySelector("#orderForm");
const resetButton = document.querySelector("#resetButton");
const formMessage = document.querySelector("#formMessage");
const orderItemsInput = document.querySelector("#orderItemsInput");
const orderTotalInput = document.querySelector("#orderTotalInput");
const orderSummaryInput = document.querySelector("#orderSummaryInput");

const money = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0
});

async function loadProducts() {
  try {
    const response = await fetch(PRODUCTS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load products.json");
    const data = await response.json();
    products = data.filter((product) => product.available !== false);
  } catch {
    products = fallbackProducts;
  }

  state.cart = Object.fromEntries(products.map((product) => [product.id, 0]));
  renderProducts();
  renderCart();
}

function renderProducts() {
  productGrid.innerHTML = "";

  products.forEach((product) => {
    const item = productTemplate.content.firstElementChild.cloneNode(true);
    const image = item.querySelector(".product-image");
    const unit = item.querySelector(".product-unit");
    const title = item.querySelector("h3");
    const description = item.querySelector("p");
    const price = item.querySelector("strong");
    const quantity = item.querySelector(".quantity-control span");

    image.src = product.image;
    image.alt = product.name;
    unit.textContent = product.unit;
    title.textContent = product.name;
    description.textContent = product.description;
    price.textContent = money.format(product.price);
    quantity.textContent = state.cart[product.id];

    item.querySelector(".minus").addEventListener("click", () => {
      state.cart[product.id] = Math.max(0, state.cart[product.id] - 1);
      renderProducts();
      renderCart();
    });

    item.querySelector(".plus").addEventListener("click", () => {
      state.cart[product.id] += 1;
      renderProducts();
      renderCart();
    });

    productGrid.append(item);
  });
}

function getCartLines() {
  return products
    .filter((product) => state.cart[product.id] > 0)
    .map((product) => ({
      ...product,
      quantity: state.cart[product.id],
      subtotal: state.cart[product.id] * product.price
    }));
}

function getTotal(lines) {
  return lines.reduce((sum, line) => sum + line.subtotal, 0);
}

function buildOrderSummary(lines) {
  return lines
    .map((line) => `${line.name}（${line.unit}）x ${line.quantity} = ${money.format(line.subtotal)}`)
    .join("\n");
}

function syncHiddenInputs() {
  const lines = getCartLines();
  const total = getTotal(lines);
  orderItemsInput.value = JSON.stringify(
    lines.map(({ id, name, unit, price, quantity, subtotal }) => ({
      id,
      name,
      unit,
      price,
      quantity,
      subtotal
    }))
  );
  orderTotalInput.value = money.format(total);
  orderSummaryInput.value = `${buildOrderSummary(lines)}\nTotal: ${money.format(total)}`;
}

function renderCart() {
  const lines = getCartLines();
  cartItems.innerHTML = "";

  if (lines.length === 0) {
    cartItems.innerHTML = '<p class="empty">Choose your fruit box.</p>';
  } else {
    lines.forEach((line) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <b>${line.name}</b>
        <strong>${money.format(line.subtotal)}</strong>
        <span>${line.unit} · ${money.format(line.price)} x ${line.quantity}</span>
      `;
      cartItems.append(row);
    });
  }

  cartTotal.textContent = money.format(getTotal(lines));
  syncHiddenInputs();
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", isError);
  formMessage.classList.add("show");
}

function resetCart() {
  Object.keys(state.cart).forEach((key) => {
    state.cart[key] = 0;
  });
  renderProducts();
  renderCart();
}

resetButton.addEventListener("click", resetCart);

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const lines = getCartLines();

  if (lines.length === 0) {
    showMessage("請先選擇至少一箱水果。", true);
    return;
  }

  syncHiddenInputs();

  if (FORMSPREE_ENDPOINT.includes("REPLACE_WITH_YOUR_FORM_ID")) {
    showMessage("請先在 app.js 設定你的 Formspree endpoint，訂單才會寄到 Email。", true);
    return;
  }

  const submitButton = orderForm.querySelector(".submit");
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: new FormData(orderForm),
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) throw new Error("Formspree submit failed");

    orderForm.reset();
    resetCart();
    showMessage("訂單已送出，我們會盡快與你確認熟度、出貨日與付款方式。");
  } catch {
    showMessage("訂單送出失敗，請稍後再試，或直接聯絡 Ken’s Farm。", true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send My Order";
  }
});

loadProducts();
