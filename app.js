const CONTENT_URL = "data/content.json";
const PRODUCTS_URL = "data/products.json";

const fallbackContent = {
  brand: {
    name: "Ken's Farm",
    logo: "assets/images/logo.png"
  },
  navigation: {
    productsLabel: "Fruit Box",
    reserveLabel: "Reserve"
  },
  hero: {
    kicker: "Pingtung Farm to Home",
    banner: "assets/images/hero.png",
    title: "Sun-ripened fruit, straight from our farm.",
    subtitle: "屏東陽光熟成的酪梨與芒果，產地直送到你家。",
    chips: ["Avocado", "Mango", "Farm to Home"],
    primaryButton: "Order the Box",
    secondaryButton: "查看本週水果"
  },
  about: {
    kicker: "屏東小農產地直送",
    title: "Tree-ripened produce with a cleaner, softer kind of luxury.",
    text: "每週依熟度少量開放預訂，確認訂單後再安排採收、包裝與配送。"
  },
  sections: {
    productsKicker: "Fresh this week",
    productsTitle: "This Week’s Fruit Box",
    checkoutKicker: "Checkout",
    checkoutTitle: "Reserve Your Box",
    receiptKicker: "Receipt",
    receiptTitle: "Your Box",
    emptyCart: "Choose your fruit box.",
    clearButton: "Clear selection"
  },
  order: {
    submitButton: "Send My Order",
    successMessage: "訂單已送出，我們會盡快與你確認熟度、出貨日與付款方式。",
    selectProductMessage: "請先選擇至少一箱水果。",
    formspreeEndpoint: "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID",
    fallbackEmail: "kenfarmpingtung@example.com"
  },
  contact: {
    email: "kenfarmpingtung@example.com",
    lineUrl: "",
    instagramUrl: "https://www.instagram.com/kenfarmpingtung?igsh=MXJubTk4NWR3MnA3Yg%3D%3D&utm_source=qr"
  },
  footer: "Ken’s Farm · 屏東小農產地直送 · Avocado / Mango"
};

const fallbackProducts = [
  {
    id: "golden-mango-box",
    name: "Golden Mango Box",
    price: 650,
    unit: "5斤裝",
    image: "assets/images/mango-01.png",
    description: "屏東陽光熟成，香氣濃郁、果肉細緻，適合冰鎮後享用。",
    available: true
  },
  {
    id: "creamy-avocado-box",
    name: "Creamy Avocado Box",
    price: 550,
    unit: "6顆裝",
    image: "assets/images/avocado-01.png",
    description: "自然熟成的酪梨，適合酪梨牛奶、沙拉與早午餐。",
    available: true
  }
];

let content = fallbackContent;
let products = [];

const state = {
  cart: {}
};

const money = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0
});

const els = {
  brandLogo: document.querySelector("#brandLogo"),
  footerLogo: document.querySelector("#footerLogo"),
  brandName: document.querySelector("#brandName"),
  navProducts: document.querySelector("#navProducts"),
  navReserve: document.querySelector("#navReserve"),
  instagramLink: document.querySelector("#instagramLink"),
  lineLink: document.querySelector("#lineLink"),
  heroMedia: document.querySelector("#heroMedia"),
  heroKicker: document.querySelector("#heroKicker"),
  heroTitle: document.querySelector("#heroTitle"),
  heroSubtitle: document.querySelector("#heroSubtitle"),
  heroChips: document.querySelector("#heroChips"),
  primaryCta: document.querySelector("#primaryCta"),
  secondaryCta: document.querySelector("#secondaryCta"),
  aboutKicker: document.querySelector("#aboutKicker"),
  aboutTitle: document.querySelector("#aboutTitle"),
  aboutText: document.querySelector("#aboutText"),
  productsKicker: document.querySelector("#productsKicker"),
  productsTitle: document.querySelector("#productsTitle"),
  checkoutKicker: document.querySelector("#checkoutKicker"),
  checkoutTitle: document.querySelector("#checkoutTitle"),
  receiptKicker: document.querySelector("#receiptKicker"),
  receiptTitle: document.querySelector("#receiptTitle"),
  footerText: document.querySelector("#footerText"),
  productGrid: document.querySelector("#productGrid"),
  productTemplate: document.querySelector("#productTemplate"),
  cartItems: document.querySelector("#cartItems"),
  cartTotal: document.querySelector("#cartTotal"),
  orderForm: document.querySelector("#orderForm"),
  resetButton: document.querySelector("#resetButton"),
  submitButton: document.querySelector("#submitButton"),
  formMessage: document.querySelector("#formMessage"),
  orderItemsInput: document.querySelector("#orderItemsInput"),
  orderTotalInput: document.querySelector("#orderTotalInput"),
  orderSummaryInput: document.querySelector("#orderSummaryInput"),
  recipientEmailInput: document.querySelector("#recipientEmailInput"),
  formspreeEndpointInput: document.querySelector("#formspreeEndpointInput")
};

async function fetchJson(url, fallback) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load ${url}`);
    return await response.json();
  } catch {
    return fallback;
  }
}

function setText(element, text) {
  if (element) element.textContent = text || "";
}

function renderContent() {
  document.title = `${content.brand.name} | 屏東小農產地直送`;
  if (els.brandLogo) els.brandLogo.src = content.brand.logo;
  if (els.footerLogo) els.footerLogo.src = content.brand.logo;
  if (els.brandName) els.brandName.textContent = content.brand.name;
  if (els.heroMedia) els.heroMedia.style.setProperty("--hero-image", `url("${content.hero.banner}")`);

  setText(els.navProducts, content.navigation.productsLabel);
  setText(els.navReserve, content.navigation.reserveLabel);
  setText(els.heroKicker, content.hero.kicker);
  setText(els.heroTitle, content.hero.title);
  setText(els.heroSubtitle, content.hero.subtitle);
  setText(els.primaryCta, content.hero.primaryButton);
  setText(els.secondaryCta, content.hero.secondaryButton);
  setText(els.aboutKicker, content.about.kicker);
  setText(els.aboutTitle, content.about.title);
  setText(els.aboutText, content.about.text);
  setText(els.productsKicker, content.sections.productsKicker);
  setText(els.productsTitle, content.sections.productsTitle);
  setText(els.checkoutKicker, content.sections.checkoutKicker);
  setText(els.checkoutTitle, content.sections.checkoutTitle);
  setText(els.receiptKicker, content.sections.receiptKicker);
  setText(els.receiptTitle, content.sections.receiptTitle);
  setText(els.resetButton, content.sections.clearButton);
  setText(els.submitButton, content.order.submitButton);
  setText(els.footerText, content.footer);

  if (els.heroChips) {
    els.heroChips.innerHTML = "";
    content.hero.chips.forEach((chip) => {
      const span = document.createElement("span");
      span.textContent = chip;
      els.heroChips.append(span);
    });
  }

  configureExternalLink(els.instagramLink, content.contact.instagramUrl);
  configureExternalLink(els.lineLink, content.contact.lineUrl);

  els.recipientEmailInput.value = content.contact.email || content.order.fallbackEmail || "";
  els.formspreeEndpointInput.value = content.order.formspreeEndpoint || "";
}

function configureExternalLink(link, url) {
  if (!link) return;
  if (url) {
    link.href = url;
    link.hidden = false;
  } else {
    link.hidden = true;
  }
}

function renderProducts() {
  els.productGrid.innerHTML = "";

  products.forEach((product) => {
    const item = els.productTemplate.content.firstElementChild.cloneNode(true);
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
    quantity.textContent = state.cart[product.id] || 0;

    item.querySelector(".minus").addEventListener("click", () => {
      state.cart[product.id] = Math.max(0, (state.cart[product.id] || 0) - 1);
      renderProducts();
      renderCart();
    });

    item.querySelector(".plus").addEventListener("click", () => {
      state.cart[product.id] = (state.cart[product.id] || 0) + 1;
      renderProducts();
      renderCart();
    });

    els.productGrid.append(item);
  });
}

function getCartLines() {
  return products
    .filter((product) => (state.cart[product.id] || 0) > 0)
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
  els.orderItemsInput.value = JSON.stringify(
    lines.map(({ id, name, unit, price, quantity, subtotal }) => ({
      id,
      name,
      unit,
      price,
      quantity,
      subtotal
    }))
  );
  els.orderTotalInput.value = money.format(total);
  els.orderSummaryInput.value = `${buildOrderSummary(lines)}\nTotal: ${money.format(total)}`;
}

function renderCart() {
  const lines = getCartLines();
  els.cartItems.innerHTML = "";

  if (lines.length === 0) {
    els.cartItems.innerHTML = `<p class="empty">${content.sections.emptyCart}</p>`;
  } else {
    lines.forEach((line) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <b>${line.name}</b>
        <strong>${money.format(line.subtotal)}</strong>
        <span>${line.unit} · ${money.format(line.price)} x ${line.quantity}</span>
      `;
      els.cartItems.append(row);
    });
  }

  els.cartTotal.textContent = money.format(getTotal(lines));
  syncHiddenInputs();
}

function showMessage(message, isError = false) {
  els.formMessage.textContent = message;
  els.formMessage.classList.toggle("error", isError);
  els.formMessage.classList.add("show");
}

function resetCart() {
  Object.keys(state.cart).forEach((key) => {
    state.cart[key] = 0;
  });
  renderProducts();
  renderCart();
}

function buildMailto(formData) {
  const lines = getCartLines();
  const subject = `New order from ${formData.get("name")}`;
  const body = [
    content.brand.name,
    "",
    `Name: ${formData.get("name")}`,
    `Phone: ${formData.get("phone")}`,
    `Email: ${formData.get("email")}`,
    `Delivery: ${formData.get("delivery")}`,
    "",
    "Order",
    buildOrderSummary(lines),
    `Total: ${money.format(getTotal(lines))}`,
    "",
    "Notes",
    formData.get("message") || "None"
  ].join("\n");
  const email = content.contact.email || content.order.fallbackEmail;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function submitToFormspree(formData) {
  const endpoint = content.order.formspreeEndpoint || "";
  if (!endpoint || endpoint.includes("REPLACE_WITH_YOUR_FORM_ID")) {
    window.location.href = buildMailto(formData);
    showMessage("已開啟 Email 視窗，請確認內容後寄出。");
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) throw new Error("Formspree submit failed");
}

els.resetButton.addEventListener("click", resetCart);

els.orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const lines = getCartLines();

  if (lines.length === 0) {
    showMessage(content.order.selectProductMessage, true);
    return;
  }

  syncHiddenInputs();

  const formData = new FormData(els.orderForm);
  els.submitButton.disabled = true;
  els.submitButton.textContent = "Sending...";

  try {
    await submitToFormspree(formData);
    els.orderForm.reset();
    resetCart();
    showMessage(content.order.successMessage);
  } catch {
    showMessage("訂單送出失敗，請稍後再試，或直接聯絡 Ken’s Farm。", true);
  } finally {
    els.submitButton.disabled = false;
    els.submitButton.textContent = content.order.submitButton;
  }
});

async function init() {
  const [loadedContent, loadedProducts] = await Promise.all([
    fetchJson(CONTENT_URL, fallbackContent),
    fetchJson(PRODUCTS_URL, fallbackProducts)
  ]);
  content = loadedContent;
  products = loadedProducts.filter((product) => product.available !== false);
  state.cart = Object.fromEntries(products.map((product) => [product.id, 0]));
  renderContent();
  renderProducts();
  renderCart();
}

init();
