const CONTENT_URL = "data/content.json";
const PRODUCTS_URL = "data/products.json";
const DRAFT_CONTENT_KEY = "kensFarmDraftContent";
const DRAFT_PRODUCTS_KEY = "kensFarmDraftProducts";

let content = null;
let products = [];
let selectedProductId = null;
let pendingImageTarget = null;
const previewUrls = new Map();

const money = new Intl.NumberFormat("zh-TW", {
  style: "currency",
  currency: "TWD",
  maximumFractionDigits: 0
});

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

const els = {
  logoImage: qs("#adminLogoImage"),
  heroImage: qs("#adminHeroImage"),
  chips: qs("#adminChips"),
  productGrid: qs("#adminProductGrid"),
  productTemplate: qs("#adminProductTemplate"),
  productInspector: qs("#productInspector"),
  imagePicker: qs("#imagePicker"),
  emailInput: qs("#emailInput"),
  formspreeInput: qs("#formspreeInput"),
  lineInput: qs("#lineInput"),
  igInput: qs("#igInput"),
  footerInput: qs("#footerInput"),
  downloadContent: qs("#downloadContent"),
  downloadProducts: qs("#downloadProducts"),
  resetDraft: qs("#resetDraft"),
  addProduct: qs("#addProduct")
};

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  return response.json();
}

function readDraft(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function saveDraft() {
  localStorage.setItem(DRAFT_CONTENT_KEY, JSON.stringify(content));
  localStorage.setItem(DRAFT_PRODUCTS_KEY, JSON.stringify(products));
}

function getByPath(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

function setByPath(object, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((current, key) => current[key], object);
  target[last] = value;
}

function normalizeAssetPath(fileName) {
  return `assets/images/${fileName}`;
}

function imagePreviewFor(path) {
  return previewUrls.get(path) || path;
}

function renderContent() {
  qsa("[data-edit]").forEach((node) => {
    node.textContent = getByPath(content, node.dataset.edit) || "";
  });

  els.logoImage.src = imagePreviewFor(content.brand.logo);
  els.heroImage.src = imagePreviewFor(content.hero.banner);
  els.emailInput.value = content.contact.email || "";
  els.formspreeInput.value = content.order.formspreeEndpoint || "";
  els.lineInput.value = content.contact.lineUrl || "";
  els.igInput.value = content.contact.instagramUrl || "";
  els.footerInput.value = content.footer || "";

  els.chips.innerHTML = "";
  content.hero.chips.forEach((chip, index) => {
    const span = document.createElement("span");
    span.contentEditable = "true";
    span.textContent = chip;
    span.addEventListener("input", () => {
      content.hero.chips[index] = span.textContent.trim();
      saveDraft();
    });
    els.chips.append(span);
  });
}

function renderProducts() {
  els.productGrid.innerHTML = "";
  products.forEach((product) => {
    const card = els.productTemplate.content.firstElementChild.cloneNode(true);
    const imageButton = qs(".product-photo", card);
    const image = qs("img", card);

    card.dataset.productId = product.id;
    card.classList.toggle("is-selected", product.id === selectedProductId);
    image.src = imagePreviewFor(product.image);
    image.alt = product.name;
    const unit = qs(".unit", card);
    const title = qs("h3", card);
    const description = qs("p", card);
    const price = qs("strong", card);
    unit.textContent = product.unit;
    title.textContent = product.name;
    description.textContent = product.description;
    price.textContent = money.format(product.price);

    [
      [unit, "unit"],
      [title, "name"],
      [description, "description"],
      [price, "price"]
    ].forEach(([node, field]) => {
      node.contentEditable = "true";
      node.addEventListener("click", (event) => event.stopPropagation());
      node.addEventListener("input", () => {
        product[field] = field === "price"
          ? Number(node.textContent.replace(/[^\d]/g, "")) || 0
          : node.textContent.trim();
        saveDraft();
        renderInspector();
      });
      node.addEventListener("blur", () => {
        if (field === "price") renderProducts();
      });
    });

    card.addEventListener("click", () => {
      selectedProductId = product.id;
      renderProducts();
      renderInspector();
    });

    imageButton.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedProductId = product.id;
      pendingImageTarget = { type: "product", id: product.id };
      els.imagePicker.click();
    });

    els.productGrid.append(card);
  });
}

function selectedProduct() {
  return products.find((product) => product.id === selectedProductId) || products[0];
}

function renderInspector() {
  const product = selectedProduct();
  if (!product) {
    els.productInspector.className = "product-inspector-empty";
    els.productInspector.textContent = "點一張商品卡開始編輯。";
    return;
  }

  selectedProductId = product.id;
  els.productInspector.className = "";
  els.productInspector.innerHTML = `
    <label>
      商品名稱
      <input data-product-field="name" type="text">
    </label>
    <label>
      價格
      <input data-product-field="price" type="number" min="0" step="10">
    </label>
    <label>
      單位
      <input data-product-field="unit" type="text">
    </label>
    <label>
      商品描述
      <textarea data-product-field="description" rows="4"></textarea>
    </label>
    <label>
      圖片路徑
      <input data-product-field="image" type="text">
    </label>
    <label class="inline-check">
      <input data-product-field="available" type="checkbox">
      顯示商品
    </label>
    <button class="button secondary full" id="replaceProductImage" type="button">Upload Product Photo</button>
  `;

  qsa("[data-product-field]", els.productInspector).forEach((input) => {
    const field = input.dataset.productField;
    if (input.type === "checkbox") {
      input.checked = product[field] !== false;
    } else {
      input.value = product[field] ?? "";
    }
    input.addEventListener("input", () => {
      if (input.type === "checkbox") {
        product[field] = input.checked;
      } else if (field === "price") {
        product[field] = Number(input.value) || 0;
      } else {
        product[field] = input.value;
      }
      saveDraft();
      renderProducts();
    });
  });

  qs("#replaceProductImage").addEventListener("click", () => {
    pendingImageTarget = { type: "product", id: product.id };
    els.imagePicker.click();
  });
}

function bindEditableText() {
  qsa("[data-edit]").forEach((node) => {
    node.addEventListener("input", () => {
      setByPath(content, node.dataset.edit, node.textContent.trim());
      saveDraft();
    });
  });
}

function bindSettings() {
  els.emailInput.addEventListener("input", () => {
    content.contact.email = els.emailInput.value.trim();
    content.order.fallbackEmail = els.emailInput.value.trim();
    saveDraft();
  });
  els.formspreeInput.addEventListener("input", () => {
    content.order.formspreeEndpoint = els.formspreeInput.value.trim();
    saveDraft();
  });
  els.lineInput.addEventListener("input", () => {
    content.contact.lineUrl = els.lineInput.value.trim();
    saveDraft();
  });
  els.igInput.addEventListener("input", () => {
    content.contact.instagramUrl = els.igInput.value.trim();
    saveDraft();
  });
  els.footerInput.addEventListener("input", () => {
    content.footer = els.footerInput.value.trim();
    saveDraft();
  });
}

function bindImageEditing() {
  qsa("[data-image-target]").forEach((button) => {
    button.addEventListener("click", () => {
      pendingImageTarget = { type: "content", path: button.dataset.imageTarget };
      els.imagePicker.click();
    });
  });

  els.imagePicker.addEventListener("change", () => {
    const file = els.imagePicker.files?.[0];
    if (!file || !pendingImageTarget) return;
    const assetPath = normalizeAssetPath(file.name);
    const previewUrl = URL.createObjectURL(file);
    previewUrls.set(assetPath, previewUrl);

    if (pendingImageTarget.type === "content") {
      setByPath(content, pendingImageTarget.path, assetPath);
    } else {
      const product = products.find((item) => item.id === pendingImageTarget.id);
      if (product) product.image = assetPath;
    }

    els.imagePicker.value = "";
    pendingImageTarget = null;
    saveDraft();
    renderContent();
    renderProducts();
    renderInspector();
  });
}

function downloadJson(fileName, data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function bindDownloads() {
  els.downloadContent.addEventListener("click", () => downloadJson("content.json", content));
  els.downloadProducts.addEventListener("click", () => downloadJson("products.json", products));
  els.resetDraft.addEventListener("click", async () => {
    localStorage.removeItem(DRAFT_CONTENT_KEY);
    localStorage.removeItem(DRAFT_PRODUCTS_KEY);
    await loadInitialData(true);
  });
}

function bindProductActions() {
  els.addProduct.addEventListener("click", () => {
    const id = `new-fruit-box-${Date.now()}`;
    products.push({
      id,
      name: "New Fruit Box",
      price: 0,
      unit: "請填單位",
      image: "assets/images/hero.png",
      description: "請填寫商品描述。",
      available: true
    });
    selectedProductId = id;
    saveDraft();
    renderProducts();
    renderInspector();
  });
}

async function loadInitialData(ignoreDraft = false) {
  const [sourceContent, sourceProducts] = await Promise.all([
    fetchJson(CONTENT_URL),
    fetchJson(PRODUCTS_URL)
  ]);

  content = ignoreDraft ? sourceContent : readDraft(DRAFT_CONTENT_KEY) || sourceContent;
  products = ignoreDraft ? sourceProducts : readDraft(DRAFT_PRODUCTS_KEY) || sourceProducts;
  selectedProductId = products[0]?.id || null;

  renderContent();
  renderProducts();
  renderInspector();
}

async function init() {
  await loadInitialData();
  bindEditableText();
  bindSettings();
  bindImageEditing();
  bindDownloads();
  bindProductActions();
}

init();
