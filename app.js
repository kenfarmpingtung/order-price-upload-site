const products = [
  {
    id: "basic",
    name: "基本方案",
    tag: "熱銷",
    description: "適合一般下單、少量客製與簡單圖片需求。",
    price: 980,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "standard",
    name: "標準方案",
    tag: "推薦",
    description: "包含更多修改、圖片附件與完整需求確認。",
    price: 1680,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "premium",
    name: "進階方案",
    tag: "客製",
    description: "適合較複雜的訂製、急件或需要專人確認的訂單。",
    price: 2680,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80"
  }
];

const state = {
  cart: Object.fromEntries(products.map((product) => [product.id, 0])),
  uploadedImages: []
};

const productGrid = document.querySelector("#productGrid");
const productTemplate = document.querySelector("#productTemplate");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const orderForm = document.querySelector("#orderForm");
const resetButton = document.querySelector("#resetButton");
const orderImages = document.querySelector("#orderImages");
const imagePreview = document.querySelector("#imagePreview");
const logoInput = document.querySelector("#logoInput");
const logoFrame = document.querySelector(".logo-frame");
const siteLogo = document.querySelector("#siteLogo");
const shopName = document.querySelector("#shopName");
const shopNameInput = document.querySelector("#shopNameInput");
const phoneInput = document.querySelector("#phoneInput");
const lineInput = document.querySelector("#lineInput");
const orderEmailInput = document.querySelector("#orderEmailInput");
const contactInfo = document.querySelector("#contactInfo");
const emailInfo = document.querySelector("#emailInfo");
const orderHistory = document.querySelector("#orderHistory");
const clearHistory = document.querySelector("#clearHistory");

const money = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0
});

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderProducts() {
  productGrid.innerHTML = "";
  products.forEach((product) => {
    const item = productTemplate.content.firstElementChild.cloneNode(true);
    const image = item.querySelector(".product-image");
    const tag = item.querySelector(".product-tag");
    const title = item.querySelector("h3");
    const description = item.querySelector("p");
    const price = item.querySelector("strong");
    const quantity = item.querySelector(".quantity-control span");

    image.src = product.image;
    image.alt = product.name;
    tag.textContent = product.tag;
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

function renderCart() {
  const lines = getCartLines();
  cartItems.innerHTML = "";

  if (lines.length === 0) {
    cartItems.innerHTML = '<p class="empty">尚未選擇商品</p>';
  } else {
    lines.forEach((line) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <b>${line.name}</b>
        <strong>${money.format(line.subtotal)}</strong>
        <span>${money.format(line.price)} x ${line.quantity}</span>
      `;
      cartItems.append(row);
    });
  }

  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  cartTotal.textContent = money.format(total);
}

function renderImages() {
  imagePreview.innerHTML = "";
  state.uploadedImages.forEach((src) => {
    const image = document.createElement("img");
    image.src = src;
    image.alt = "訂單圖片預覽";
    imagePreview.append(image);
  });
}

function renderContact() {
  const parts = [
    phoneInput.value && `電話：${phoneInput.value}`,
    lineInput.value && `LINE：${lineInput.value}`
  ].filter(Boolean);
  contactInfo.textContent = parts.length ? parts.join(" / ") : "尚未填寫";
  emailInfo.textContent = orderEmailInput.value.trim()
    ? `訂單會開啟 Email 寄到：${orderEmailInput.value.trim()}`
    : "請先填寫接收訂單 Email";
}

function loadSettings() {
  const settings = readStorage("shopSettings", {});
  if (settings.name) {
    shopName.textContent = settings.name;
    shopNameInput.value = settings.name;
  }
  if (settings.phone) phoneInput.value = settings.phone;
  if (settings.line) lineInput.value = settings.line;
  if (settings.orderEmail) orderEmailInput.value = settings.orderEmail;
  if (settings.logo) {
    siteLogo.src = settings.logo;
    logoFrame.classList.add("has-logo");
  }
  renderContact();
}

function saveSettings() {
  const current = readStorage("shopSettings", {});
  writeStorage("shopSettings", {
    ...current,
    name: shopNameInput.value.trim() || "我的商店",
    phone: phoneInput.value.trim(),
    line: lineInput.value.trim(),
    orderEmail: orderEmailInput.value.trim()
  });
}

function buildOrderEmail(order) {
  const itemLines = order.items
    .map((item) => `- ${item.name} x ${item.quantity}，小計 ${money.format(item.subtotal)}`)
    .join("\n");
  const subject = `新訂單：${order.customerName}｜${money.format(order.total)}`;
  const body = [
    `商店：${shopNameInput.value.trim() || "我的商店"}`,
    `下單時間：${order.createdAt}`,
    "",
    "客戶資料",
    `姓名：${order.customerName}`,
    `電話：${order.customerPhone}`,
    `Email：${order.customerEmail || "未填寫"}`,
    `取貨方式：${order.delivery}`,
    "",
    "訂購商品",
    itemLines,
    `合計：${money.format(order.total)}`,
    "",
    "備註",
    order.note || "未填寫",
    "",
    `圖片附件：${order.imageCount} 張`,
    "提醒：瀏覽器無法自動把網站上傳的圖片附到 Email，請客人送出郵件前手動附上圖片。"
  ].join("\n");

  return `mailto:${encodeURIComponent(orderEmailInput.value.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function renderHistory() {
  const orders = readStorage("orders", []);
  orderHistory.innerHTML = "";

  if (orders.length === 0) {
    orderHistory.innerHTML = '<p class="empty">還沒有送出的訂單。</p>';
    return;
  }

  orders.forEach((order) => {
    const card = document.createElement("article");
    card.className = "history-card";
    card.innerHTML = `
      <p>${order.createdAt}</p>
      <h3>${order.customerName}｜${order.customerPhone}</h3>
      <p>${order.items.map((item) => `${item.name} x ${item.quantity}`).join("、")}</p>
      <strong>${money.format(order.total)}</strong>
      <p>圖片附件：${order.imageCount} 張</p>
    `;
    orderHistory.append(card);
  });
}

shopNameInput.addEventListener("input", () => {
  shopName.textContent = shopNameInput.value.trim() || "我的商店";
  saveSettings();
});

[phoneInput, lineInput, orderEmailInput].forEach((input) => {
  input.addEventListener("input", () => {
    saveSettings();
    renderContact();
  });
});

logoInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const logo = await fileToDataUrl(file);
  siteLogo.src = logo;
  logoFrame.classList.add("has-logo");
  const settings = readStorage("shopSettings", {});
  writeStorage("shopSettings", { ...settings, logo });
});

orderImages.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []).slice(0, 8);
  state.uploadedImages = await Promise.all(files.map(fileToDataUrl));
  renderImages();
});

resetButton.addEventListener("click", () => {
  Object.keys(state.cart).forEach((key) => {
    state.cart[key] = 0;
  });
  state.uploadedImages = [];
  orderImages.value = "";
  renderProducts();
  renderCart();
  renderImages();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const lines = getCartLines();
  if (lines.length === 0) {
    alert("請先選擇至少一個商品。");
    return;
  }
  if (!orderEmailInput.value.trim()) {
    alert("請先填寫接收訂單 Email。");
    orderEmailInput.focus();
    return;
  }

  const formData = new FormData(orderForm);
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const order = {
    createdAt: new Date().toLocaleString("zh-TW"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    delivery: formData.get("delivery"),
    note: formData.get("note"),
    items: lines.map(({ id, name, price, quantity, subtotal }) => ({ id, name, price, quantity, subtotal })),
    total,
    imageCount: state.uploadedImages.length
  };

  const orders = readStorage("orders", []);
  writeStorage("orders", [order, ...orders].slice(0, 20));
  window.location.href = buildOrderEmail(order);
  alert("訂單已儲存在本機紀錄，並已開啟 Email 視窗。請確認內容後寄出。");
  orderForm.reset();
  resetButton.click();
  renderHistory();
});

clearHistory.addEventListener("click", () => {
  localStorage.removeItem("orders");
  renderHistory();
});

loadSettings();
renderProducts();
renderCart();
renderImages();
renderHistory();
