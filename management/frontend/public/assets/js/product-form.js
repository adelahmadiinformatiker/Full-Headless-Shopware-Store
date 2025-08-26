import { fillFormWithData } from "./form-fill-helpers.js";

const form = document.getElementById("productForm");
const urlParams = new URLSearchParams(window.location.search);
const isEditMode = urlParams.has("id");
const productId = urlParams.get("id");
const coverIndex = 0;
const PRESELECTED_MEDIA = [];
const MAX_SLOTS = 8;
const API_BASE = `http://localhost:${
  localStorage.getItem("serverPort") || "3001"
}`;

function initMediaSlots() {
  const mediaPreviewContainer = document.getElementById("mediaPreview");

  if (PRESELECTED_MEDIA.length > 0) {
    const cover = PRESELECTED_MEDIA[0];

    const colLeft = document.createElement("div");
    colLeft.className = "col-md-4";

    colLeft.innerHTML = `
      <div class="card border h-100 border-primary mb-3">
        <div class="card-body text-center">
          <img src="${cover.url}" class="img-fluid rounded mb-2" style="max-height: 250px;" />

        </div>
        <div class="card-header text-center bg-primary text-white">Cover</div>

      </div>
    `;
    mediaPreviewContainer.appendChild(colLeft);
  }

  const colRight = document.createElement("div");
  colRight.className = "col-md-8";

  const row = document.createElement("div");
  row.className =
    "row row-cols-2 row-cols-sm-3 h-100 row-cols-md-4 g-3 align-items-start";

  for (let i = 0; i < MAX_SLOTS; i++) {
    const imageObj = PRESELECTED_MEDIA[i] || null;
    const imageUrl = imageObj ? imageObj.url : null;

    const innerCol = document.createElement("div");
    innerCol.className = "col position-relative";

    if (imageUrl) {
      innerCol.innerHTML = `
      <div class="card h-100 text-center">
        <div class="card-body d-flex flex-column align-items-center p-2 position-relative">
          <img src="${imageUrl}" class="img-fluid rounded mb-2 image-thumb" style="max-height: 100px; cursor: pointer;" data-index="${i}" />

          ${
            i === 0
              ? `<span class="badge bg-primary position-absolute top-0 start-0 m-1">Cover</span>`
              : ""
          }

          <div class="image-actions position-absolute top-50 start-50 translate-middle d-none bg-white p-2 border rounded shadow-sm z-3" style="min-width: 120px;">
            <button class="btn btn-sm btn-outline-primary w-100 mb-1" onclick="setAsCover(${i})">Als Cover</button>
            <button class="btn btn-sm btn-outline-danger w-100" onclick="removeImage(${i})">Entfernen</button>
          </div>
        </div>
      </div>
    `;
    } else {
      innerCol.innerHTML = `
      <div class="card h-100 text-center border-secondary border-dashed">
        <div class="card-body d-flex flex-column align-items-center p-2">
          <div class="mb-2">${generatePlaceholderSVG()}</div>
        </div>
      </div>
    `;
    }

    row.appendChild(innerCol);
  }

  colRight.appendChild(row);
  mediaPreviewContainer.appendChild(colRight);

  mediaPreviewContainer.querySelectorAll(".image-thumb").forEach((img) => {
    img.addEventListener("click", (e) => {
      const actions = e.target
        .closest(".card-body")
        .querySelector(".image-actions");
      document
        .querySelectorAll(".image-actions")
        .forEach((p) => p.classList.add("d-none"));
      actions.classList.remove("d-none");
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".card-body")) {
      document
        .querySelectorAll(".image-actions")
        .forEach((p) => p.classList.add("d-none"));
    }
  });
}

function generatePlaceholderSVG() {
  return `
  <div style="height: 100px; display: flex; align-items: center; justify-content: center;">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M2 20.4948L9.25259 12.3356C9.63485 11.9056 10.3003 11.886 10.7071 12.2929L12.7071 14.2929C12.7219 14.3077 12.7361 14.3228 12.7498 14.3382L15.2318 11.3598C15.6082 10.9081 16.2913 10.8771 16.7071 11.2929L22 16.5858V3C22 2.44772 21.5523 2 21 2H3C2.44772 2 2 2.44772 2 3V20.4948ZM3.33795 22H21C21.5523 22 22 21.5523 22 21V19.4142L16.0672 13.4814L11.7682 18.6402C11.4147 19.0645 10.7841 19.1218 10.3598 18.7682C9.93554 18.4147 9.87821 17.7841 10.2318 17.3598L11.4842 15.857C11.416 15.8159 11.3517 15.7659 11.2929 15.7071L10.0428 14.457L3.33795 22ZM3 0H21C22.6569 0 24 1.34315 24 3V21C24 22.6569 22.6569 24 21 24H3C1.34315 24 0 22.6569 0 21V3C0 1.34315 1.34315 0 3 0ZM7.5 11C5.567 11 4 9.433 4 7.5C4 5.567 5.567 4 7.5 4C9.433 4 11 5.567 11 7.5C11 9.433 9.433 11 7.5 11ZM7.5 9C8.32843 9 9 8.32843 9 7.5C9 6.67157 8.32843 6 7.5 6C6.67157 6 6 6.67157 6 7.5C6 8.32843 6.67157 9 7.5 9Z"
        fill="#CED4DA" />
    </svg>
  </div>
  `;
}

function setAsCover(index) {
  const temp = PRESELECTED_MEDIA[index];
  PRESELECTED_MEDIA.splice(index, 1);
  PRESELECTED_MEDIA.unshift(temp);
  initMediaSlots(); // UI neu rendern
}

function removeImage(index) {
  PRESELECTED_MEDIA.splice(index, 1);
  initMediaSlots(); // UI neu rendern
}

if (isEditMode && productId) {
  const product = await fetchProduct(productId);
  fillFormWithData(product, form, PRESELECTED_MEDIA);
}

async function fetchProduct(id) {
  if (!id) throw new Error("Kein Produkt-ID übergeben (Edit-Modus erwartet).");
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) throw new Error("Produkt nicht gefunden.");
  return await res.json();
}

form.onsubmit = async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const gross = parseFloat(formData.get("priceGross")) || 19.99;
  const net =
    parseFloat(formData.get("priceNet")) ||
    Math.round((gross / 1.19) * 100) / 100;
  const taxId = formData.get("taxId") || null;

  const body = {
    name: formData.get("name"),
    productNumber: formData.get("productNumber"),
    stock: parseInt(formData.get("stock"), 10),
    taxId,
    price: [
      {
        currencyId: "b7d2554b0ce847cd82f3ac9bd1c0dfca",
        gross,
        net,
        linked: true,
      },
    ],
    manufacturerId: formData.get("manufacturerId") || null,
    description: formData.get("description") || null,
    highlight: formData.get("highlight") === "on",
    active: formData.get("active") === "on",
    media: PRESELECTED_MEDIA.map((item, index) => ({
      mediaId: item.mediaId,
      position: index + 1,
      isCover: index === coverIndex,
    })),
  };

  const coverImage = PRESELECTED_MEDIA[coverIndex]?.mediaId;
  if (coverImage) {
    body.coverImage = coverImage;
  }

  const url = isEditMode
    ? `${API_BASE}/api/products/${productId}`
    : `${API_BASE}/api/products/create-product`;
  const method = isEditMode ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    alert(isEditMode ? "Produkt aktualisiert!" : "Produkt erstellt!");
    localStorage.setItem(
      "productMessage",
      isEditMode
        ? "Produkt wurde erfolgreich aktualisiert."
        : "Produkt wurde erfolgreich erstellt."
    );
    window.location.href = "product-admin.html";
  } else {
    const errorText = await res.text();
    console.error("[ERROR] Fehler vom Server:", errorText);
    alert("Fehler beim Speichern:\n" + errorText);
  }
};

function fillDummyData() {
  const f = form.elements;

  if (f["name"])
    f["name"].value = "Testprodukt " + Math.floor(Math.random() * 1000);
  if (f["productNumber"]) f["productNumber"].value = "TP-" + Date.now();
  if (f["stock"]) f["stock"].value = "10";
  if (f["priceNet"]) f["priceNet"].value = "10.00";
  if (f["priceGross"]) f["priceGross"].value = "11.90";
  if (f["taxId"]) f["taxId"].value = "0197c5bdb03e712ea3556590f1f7c355"; // test ID
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[STEP 1] DOMContentLoaded gestartet");

  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.textContent = isEditMode
      ? "Produkt aktualisieren"
      : "Produkt anlegen";
  }

  if (isEditMode && productId) {
    console.log("[STEP 2] Edit-Modus erkannt – Produktdaten werden geladen");
    try {
      const produkt = await fetchProduct(productId);
      console.log("[STEP 3] Produktdaten erfolgreich geladen:", produkt);
      // امضای صحیح با فرم و آرایه مدیا
      fillFormWithData(produkt, form, PRESELECTED_MEDIA);
    } catch (err) {
      console.error("[ERROR] Produkt konnte nicht geladen werden:", err);
      // (اختیاری) نمایش پیام خطا در UI
      // showFormAlert("danger", "Produkt konnte nicht geladen werden.");
    }
    return; // در حالت ویرایش، از اینجا خارج شو
  }

  // Create-Mode
  console.log("[STEP 2] Create-Modus erkannt – Demodaten werden verwendet");

  PRESELECTED_MEDIA.push(
    {
      url: "http://shopware.local/media/c5/bc/f2/1754042050/product06.png?ts=1754042050",
      mediaId: "0198650da1ac7f688a7918cda7b621ea",
    },
    {
      url: "http://shopware.local/thumbnail/01/cb/24/1754042050/product02_280x280.png?ts=1754042064",
      mediaId: "0198650ddfa670dbac098a1992f3431a",
    }
  );

  console.log("[STEP 3] Demodaten gesetzt, initMediaSlots wird aufgerufen");
  initMediaSlots();
  fillDummyData(); // اگر پارامتر می‌گیرد، اینجا مطابق امضایش تغییر بده
});
