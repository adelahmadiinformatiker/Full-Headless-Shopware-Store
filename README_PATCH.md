
# README — Targeted Updates (drop-in replacements)

> This file contains **only** the sections that need updating based on the latest project changes.  
> Copy each section into the appropriate place in your existing README.

---

## 📦 Project Structure  *(replace the empty/incorrect section)*

```
management/
  backend/
    index.js
    routes/
      product.routes.js
    services/
      product.service.js
    utils/
      validAccessToken.js
      taxResolver.js
      manufacturer.js
      normalizePrice.js
    .env
  frontend/
    public/
      index.html
      pages/
        product-admin.html
        product-form.html
      assets/
        js/
          product-admin.js
          product-form.js
          form-fill-helpers.js
      images/
```

- **Backend** (Express + Shopware Admin API integration): `management/backend`
- **Admin UI** (Bootstrap pages + modular JS): `management/frontend/public`

---

## ⚙️ Environment Variables Reference  *(update variable names to match code)*

| Variable            | Description                                                      | Example                              |
|---------------------|------------------------------------------------------------------|--------------------------------------|
| PORT                | Backend port                                                     | `3001`                               |
| SHOPWARE_API_BASE   | **Base Admin API URL** used by the backend code                  | `http://shopware.local/api`          |
| SHOPWARE_CLIENT_ID  | Shopware Integration “Access key ID”                             | `swiaaaaaaaaaaaaaa`                  |
| SHOPWARE_CLIENT_SECRET | Shopware Integration “Secret access key”                      | `swsaBBBBBBBBBBBBB`                  |
| ENABLE_SERVER_LOGS  | Backend verbose logging                                          | `true`                               |

> **Why change?** The backend uses `process.env.SHOPWARE_API_BASE` in `product.service.js`.  
> Keep the README aligned with the code to avoid misconfiguration.

---

## 🔗 API Endpoints Overview  *(reflect current routes used by the Admin UI)*

| Endpoint                     | Method | Purpose                                |
|-----------------------------|--------|----------------------------------------|
| `/api/products`             | GET    | List products                          |
| `/api/products/:id`         | GET    | Get a product                          |
| `/api/products/create-product` | POST | Create a product (cover optional)      |
| `/api/products/:id`         | PUT    | Update a product                       |
| `/api/products/:id`         | DELETE | Delete a product                       |

**Client configuration note:**  
The Admin UI reads `serverPort` from `localStorage` (fallback `3001`).  
Example base URL used in the UI: `http://localhost:${serverPort}`

---

## 🧩 How to Extend or Customize  *(fill “??????????” with actual paths)*

- **Add or modify product fields**
  - Edit the shared form in `management/frontend/public/pages/product-form.html`.
  - Update logic in `management/frontend/public/assets/js/product-form.js` and helpers in `.../form-fill-helpers.js`.
  - Adjust backend route handlers in `management/backend/routes/product.routes.js`.
  - Map new fields in `management/backend/services/product.service.js` (`createProduct`, `updateProduct`).

- **Extend backend functionality (new routes/services)**
  - Add Express routes in `management/backend/index.js` and `management/backend/routes/*.js`.
  - Implement Shopware calls and business logic in `management/backend/services/*.js`.

---

## 🛠️ Shopware Admin API Integration & Dynamic Token Handling  *(fill “??????????”)*

Tokens are fetched & refreshed automatically in:
```
management/backend/utils/validAccessToken.js
```
Service code consumes the token here:
```
management/backend/services/product.service.js
```

**.env essentials**
```env
SHOPWARE_API_BASE=http://shopware.local/api
SHOPWARE_CLIENT_ID=YOUR_ACCESS_KEY_ID
SHOPWARE_CLIENT_SECRET=YOUR_SECRET_ACCESS_KEY
ENABLE_SERVER_LOGS=true
```

---

## 🖥️ Run Management (Backend & Admin UI)  *(minor clarifications)*

### Backend
```bash
cd management/backend
npm i
# .env: PORT=3001, SHOPWARE_API_BASE=..., SHOPWARE_CLIENT_ID=..., SHOPWARE_CLIENT_SECRET=...
npm start         # or: node index.js
# dev: npm i -D nodemon && npm run dev
# Health: http://localhost:3001/
```

### Admin UI
```bash
cd management/frontend
npm i
npm run dev
# Open: http://localhost:3002/
```
> In the Admin UI, you can override API port via `localStorage.setItem("serverPort","3001")`.

---

## 📝 Known Issues & Troubleshooting  *(make current and concrete)*

- **Media cover duplicated in Edit UI:**  
  Ensure the frontend renders *only non-cover thumbnails* in the right grid (skip index `0` which is the cover).

- **Gallery media not linked on create:**  
  Product creation links the **cover** if provided (`coverImage`). Additional gallery items are linked during **update** and require valid `mediaId`s that already exist in Shopware `media`. If you see FK errors like `SQLSTATE[23000] ... fk.product_media.media_id`, first upload/check media in Shopware or validate IDs.

- **Products list returns 404:**  
  Confirm list route is mounted as `/api/products` in `management/backend/routes/product.routes.js`.

- **Token issues:**  
  Set `SHOPWARE_CLIENT_ID`, `SHOPWARE_CLIENT_SECRET`, and `SHOPWARE_API_BASE` correctly; enable `ENABLE_SERVER_LOGS=true` to inspect requests.

---

## 🔎 Logging & Debugging Flow  *(add precise checkpoints)*

Enable backend logs:
```env
ENABLE_SERVER_LOGS=true
```

Suggested client-side checkpoints (Admin UI):
```js
// 1) On DOM ready (edit mode detection)
console.log("[UI] Edit mode?", isEditMode, "id:", productId);

// 2) After fetchProduct
console.log("[UI] Loaded product:", produkt?.id);
console.log("[UI] Media urls:", (produkt?.media||[]).map(m => m.url));

// 3) After fillFormWithData (preselect)
console.log("[UI] PRESELECTED_MEDIA:", PRESELECTED_MEDIA);

// 4) Before rendering grid
console.log("[UI] Cover:", PRESELECTED_MEDIA[0]);
console.log("[UI] Grid:", PRESELECTED_MEDIA.slice(1));
```

Key backend checkpoints:
```js
// product.service.js
console.log("getProductById → media:", product.media);
console.log("getProductById → cover:", product.cover);
```

---
