// management/frontend/public/assets/js/form-fill-helpers.js

// generic helpers
export const setVal = (f, name, val) => {
  if (f[name]) f[name].value = val ?? "";
};
export const setChecked = (f, name, val, fallback = false) => {
  if (f[name]) f[name].checked = (val ?? fallback) === true;
};
export const setMultiSelect = (f, name, values) => {
  if (!f[name] || !Array.isArray(values)) return;
  Array.from(f[name].options).forEach((opt) => {
    opt.selected = values.includes(opt.value);
  });
};
export const toCSV = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");
export const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : "");

// media preselect
export function preselectMedia(product, PRESELECTED_MEDIA) {
  PRESELECTED_MEDIA.length = 0;
  if (!Array.isArray(product?.media)) return;

  for (const m of product.media) {
    PRESELECTED_MEDIA.push({
      url: m.url || m.thumbnailUrl || "",
      mediaId: m.mediaId || m.id,
    });
  }
  const cover = product.media.find((m) => m.isCover);
  if (!cover) return;

  const wanted = cover.mediaId || cover.id;
  const idx = PRESELECTED_MEDIA.findIndex((m) => m.mediaId === wanted);
  if (idx > 0) {
    const [c] = PRESELECTED_MEDIA.splice(idx, 1);
    PRESELECTED_MEDIA.unshift(c);
  }
}

// main exported function
export function fillFormWithData(product, form, PRESELECTED_MEDIA) {
  const f = form.elements;

  const values = {
    name: product.name,
    productNumber: product.productNumber,
    stock: product.stock,
    taxId: product.taxId,
    manufacturerId: product.manufacturerId,
    description: product.description,
    priceNet: product.price?.[0]?.net,
    priceGross: product.price?.[0]?.gross,
    ean: product.ean,
    length: product.length,
    width: product.width,
    height: product.height,
    weight: product.weight,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    category: product.category,
    tags: toCSV(product.tags),
    searchKeywords: toCSV(product.searchKeywords),
    releaseDate: toDateInput(product.releaseDate),
    gtin: product.gtin,
    manufacturerProductNumber: product.manufacturerProductNumber,
    minPurchase: product.minPurchase,
    maxPurchase: product.maxPurchase,
    purchaseSteps: product.purchaseSteps,
    restockTime: product.restockTime,
    deliveryTimeId: product.deliveryTimeId,
  };

  for (const [name, val] of Object.entries(values)) setVal(f, name, val);

  setChecked(f, "highlight", product.highlight, false);
  setChecked(f, "active", product.active !== false, true);
  setChecked(f, "isCloseout", product.isCloseout, false);
  setChecked(f, "freeShipping", product.freeShipping, false);
  setChecked(
    f,
    "activeAllSalesChannels",
    product.activeAllSalesChannels ?? true,
    true
  );

  setMultiSelect(f, "salesChannels", product.salesChannels);

  preselectMedia(product, PRESELECTED_MEDIA);

  requestAnimationFrame(() => {
    initMediaSlots();
  });
}
