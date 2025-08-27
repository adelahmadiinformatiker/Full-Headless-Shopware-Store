> ⚠️ **This README is a work in progress.**  
> The content is incomplete and will be updated throughout the development process.  
> This notice will be removed once the project reaches a stable state.

# 📘 README: Local Domain & SSH Setup for Shopware (`shopware.local`)

## Run Management (Backend & Admin UI)

### 1) Backend

```bash
cd management/backend
npm i
# Ensure .env (e.g., PORT=3001) is set

# Start normally
npm start
# or
node index.js

# (Optional) Development mode with auto-restart
npm i -D nodemon
npm run dev

# Health check → http://localhost:3001/  (should show: "Backend is running")
```

### 2) Frontend (Admin UI)

```bash
cd management/frontend
npm i
npm run dev
# Open → http://localhost:3002/
```

---

## 🔎 Viewing All Backend API Endpoints

During development it is often useful to see which API endpoints are available in the Backend-for-Frontend (BFF).  
We added a special **debug route** for this purpose:

### 1. Start the BFF

```bash
cd backend
npm run dev
```

### 2. Open the routes overview

Visit the following URL in your browser or API client (e.g. Postman):

```bash
http://localhost:4000/api/_routes
```

### 3. Example Response

You will get a JSON list of all mounted routes, including their HTTP methods:

```bash
[
  { "path": "/api/auth/login", "methods": ["POST"] },
  { "path": "/api/products", "methods": ["GET"] },
  { "path": "/api/cart/items", "methods": ["POST", "DELETE"] },
  { "path": "/api/checkout/cart", "methods": ["GET", "POST"] }
]
```

This makes it easy to verify which endpoints are exposed by the backend and how the frontend (Storefront) should call them.

---

## 🛠 Additional Notes (Find Your VM IP First!)

Before any configuration, you need your Ubuntu VM's current IP address. This IP is required for SSH access and for mapping the local domain on your Windows client.

To find your VM’s current IP address, run:

```bash
hostname -I
```

If you're using Chrome or any browser with DNS-over-HTTPS (DoH), make sure to disable it:

In Chrome: chrome://settings/security → Disable “Use secure DNS”

After editing the hosts file:

- Restart your browser, or
- Flush DNS cache on Windows:

```cmd
ipconfig /flushdns
```

---

## 🔧 Prerequisite: Install and Enable OpenSSH Server on Ubuntu VM

Before connecting via SSH from Windows, you must ensure the **OpenSSH Server** is installed and running on your Ubuntu VM.

### Step 1: Update Package List

```bash
sudo apt update
```

_Enter your password if prompted._

### Step 2: Install OpenSSH Server

```bash
sudo apt install openssh-server
```

This installs the necessary SSH server package required for remote access.

### Step 3: Check SSH Service Status (Optional but Recommended)

```bash
sudo systemctl status ssh
```

If the service is not active yet, proceed with the next step.

### Step 4: Start and Enable SSH Service

Start the SSH service immediately:

```bash
sudo systemctl start ssh
```

Enable the service to start automatically on system boot:

```bash
sudo systemctl enable ssh
```

- `start` launches the SSH service immediately.
- `enable` ensures SSH will automatically start after reboot.

### Step 5: Confirm SSH is Running

Run this command again to verify that the SSH service is now active:

```bash
sudo systemctl status ssh
```

You should see output showing the service is **active (running)**.

---

## 🖥️ SSH Connection from Windows to Ubuntu VM

To connect from your Windows client to the Ubuntu VM via SSH, open Command Prompt (cmd) or PowerShell and run the following command (replace `<VM-IP>` with your VM's IP address):

```bash
ssh username@<VM-IP>
```

Example:

```bash
ssh ubuntu@192.168.0.9
```

---

## 🏗️ Shopware 6 Installation Guide (with Nginx & MariaDB)

This section provides a step-by-step guide for installing Shopware 6 on Ubuntu with Nginx and MariaDB. All commands are ready to copy & paste. **Adjust domain/IP and passwords as needed.**

> ⚠️ **Important Compatibility Notice:**
>
> This guide assumes you're using a supported **Ubuntu LTS release**, such as `22.04 (jammy)` or `20.04 (focal)`.
> If you're using a newer or non-standard version like `plucky` (commonly found in daily builds or developer previews),
> the `ppa:ondrej/php` repository will **fail to add**, and you may encounter a `404 Not Found` error.
>
> ✅ To avoid issues, we **strongly recommend installing Ubuntu 22.04 LTS** for this setup.
>
> If you've already added the PPA and encountered errors, please reinstall Ubuntu using a supported version.

### 1. Update System & Install Prerequisites

```bash
apt update && apt upgrade -y
apt install nginx mariadb-server -y
apt install software-properties-common -y
add-apt-repository ppa:ondrej/php
apt-get install php8.3 php8.3-cli php8.3-fpm php8.3-common php8.3-mysql php8.3-curl php8.3-zip php8.3-gd php8.3-xml php8.3-mbstring php8.3-intl php8.3-opcache git unzip socat curl bash-completion -y
```

### 2. Configure PHP for Shopware

```bash
sed -i "s/memory_limit = .*/memory_limit = 768M/" /etc/php/8.3/fpm/php.ini
sed -i "s/upload_max_filesize = .*/upload_max_filesize = 128M/" /etc/php/8.3/fpm/php.ini
sed -i "s/post_max_size = .*/post_max_size = 128M/" /etc/php/8.3/fpm/php.ini
sed -i "s/;opcache.memory_consumption=128/opcache.memory_consumption=256/" /etc/php/8.3/fpm/php.ini
systemctl restart php8.3-fpm
```

### 3. Nginx Virtual Host for Shopware

```bash
sudo nano /etc/nginx/sites-available/shopware
```

Create or edit `/etc/nginx/sites-available/shopware`:

```nginx
server {
    listen 80;
    server_name shopware.local;  # Use your domain or local mapping
    root /var/www/html/shopware/public; # Adjust if needed

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock; # Check PHP version
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    error_log /var/log/nginx/shopware_error.log;
    access_log /var/log/nginx/shopware_access.log;
}
```

Test and enable the config:

```bash
nginx -t
ln -s /etc/nginx/sites-available/shopware /etc/nginx/sites-enabled/
systemctl reload nginx
```

### 4. MariaDB Setup

```bash
mysql
CREATE DATABASE shopware;
CREATE USER 'shopware'@'localhost' IDENTIFIED BY 'mivo';
GRANT ALL PRIVILEGES ON shopware.* TO 'shopware'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. (Optional) MariaDB Clean/Reinstall

If you need to purge and reinstall MariaDB:

```bash
apt-get purge mariadb-server mariadb-client mariadb-common mariadb-server-core* mariadb-client-core-*
apt-get autoremove
apt-get autoclean
nano /etc/apt/sources.list.d/mariadb.list
# Add your MariaDB repo line here
# For Example: deb [arch=amd64,arm64,ppc64el] http://ftp.osuosl.org/pub/mariadb/rep... jammy main
apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xF1656F24C74CD1D8
apt-get update
apt-get install mariadb-server
mariadb --version
```

### 6. Download & Install Shopware

```bash
wget https://github.com/shopware/web-recovery/releases/latest/download/shopware-installer.phar.php
mkdir /var/www/html/shopware
chown -R www-data:www-data /var/www/html/shopware
chmod -R 755 /var/www/html/shopware
cd /var/www/html/shopware
apt install composer -y
composer create-project shopware/production .
mkdir -p /var/www/html/shopware/var/cache/prod
chown -R www-data:www-data /var/www/html/shopware
chmod -R 775 /var/www/html/shopware/var
```

---

> **Note:**
> The `server_name` directive in your Nginx config should always be:
>
> ```nginx
> server_name shopware.local;
> ```
>
> This allows you to use the persistent local domain mapping described below.

---

## ✅ Step-by-Step: Configure Persistent Local Domain (`shopware.local`)

### 🟢 Step 1: Nginx Configuration Recap

After installing Shopware and setting up your Nginx config (see the installation section above), you should always:

- Test your Nginx configuration:
  ```bash
  sudo nginx -t
  ```
- Restart Nginx to apply changes:
  ```bash
  sudo systemctl restart nginx
  ```

> **Note:** The `server_name` directive should be set to `shopware.local` as shown in the installation section.

---

### 🟡 Step 2: Edit the Hosts File on Windows Client

On the Windows machine, open this file with Notepad (Run as Administrator):

```
C:\Windows\System32\drivers\etc\hosts
```

At the bottom of the file, add this line (use your current VM IP — for example: 192.168.0.9):

```
<your-current-VM-IP> shopware.local
```

For example:

```
192.168.0.9 shopware.local
```

💡 Note: If the VM IP changes after reboot, simply update this line — no need to touch the Nginx config again.

---

### 🔵 Step 3: Test Access via Browser

Open your browser and go to:

```
http://shopware.local/admin
```

If everything is configured correctly, the Shopware Admin panel should load.

---

## 📦 Project Structure

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

## ⚙️ Environment Variables Reference _(update variable names to match code)_

| Variable               | Description                                     | Example                     |
| ---------------------- | ----------------------------------------------- | --------------------------- |
| PORT                   | Backend port                                    | `3001`                      |
| SHOPWARE_API_BASE      | **Base Admin API URL** used by the backend code | `http://shopware.local/api` |
| SHOPWARE_CLIENT_ID     | Shopware Integration “Access key ID”            | `swiaaaaaaaaaaaaaa`         |
| SHOPWARE_CLIENT_SECRET | Shopware Integration “Secret access key”        | `swsaBBBBBBBBBBBBB`         |
| ENABLE_SERVER_LOGS     | Backend verbose logging                         | `true`                      |

> **Why change?** The backend uses `process.env.SHOPWARE_API_BASE` in `product.service.js`.  
> Keep the README aligned with the code to avoid misconfiguration.

---

## 🛒 Frontend Store (Storefront) – React Implementation Guide

### Overview

The storefront frontend is built using **React** and leverages a modular component-based architecture. The initial UI was based on a static HTML template, which was then refactored and split into reusable React components for maintainability and scalability.

### Key Technologies

- **React** (with hooks and functional components)
- **Vite** (for fast development and hot module reload)
- **Slick Carousel** (for product sliders)
- **Bootstrap 5** (for grid and base styles)
- **Custom CSS** (for product card and slider tweaks)

### Template-to-Component Workflow

1. **Start with a Static HTML Template**

   - The original design was a static HTML/CSS template (e.g., from a marketplace or custom design).
   - All UI elements (header, product cards, sliders, etc.) were present in a single HTML file.

2. **Break Down the Template into Logical Sections**

   - Identify major UI blocks: header, navigation, hero section, product sliders, product cards, footer, etc.
   - Each block becomes a candidate for a React component.

3. **Create React Components**

   - For each UI block, create a corresponding `.jsx` file in the `src/components` directory (or subfolders for organization).
   - Example structure:
     ```
     src/components/
       MAIN_HEADER.jsx
       HeroSection.jsx
       heroSections/
         sectionProducts/
           SectionAllProducts.jsx
           SectionAllProductsDummyData.jsx
       Footer.jsx
     ```
   - Move the relevant HTML and CSS into the component, converting class attributes to `className` and static assets to imports if needed.

4. **Refactor for Props and Reusability**

   - Replace hardcoded data with props or state.
   - For product lists, map over an array of product objects and render a `ProductCard` component for each.
   - Example:
     ```jsx
     {
       products.map((product) => (
         <ProductCard key={product.id} product={product} />
       ));
     }
     ```

5. **Integrate Interactivity**

   - Use React hooks (`useState`, `useEffect`) for data fetching, UI state, and side effects (e.g., initializing slick-carousel after products render).
   - Use event handlers for user actions (e.g., add to cart, wishlist, etc.).

6. **Style Components**

   - Use Bootstrap classes for layout and grid.
   - Add custom CSS (e.g., `realProducts.css`) for product-specific tweaks and slider effects.
   - Ensure styles are scoped and do not leak between components.

7. **Test Responsiveness and Functionality**
   - Check that all components render correctly on different screen sizes.
   - Ensure sliders, buttons, and navigation work as expected.

### Example: Converting a Product Card

**Original HTML:**

```html
<div class="product">
  <div class="product-img"><img src="..." /></div>
  <div class="product-body">...</div>
  <div class="add-to-cart">...</div>
</div>
```

**React Component:**

```jsx
function ProductCard({ product }) {
  return (
    <div className="product">
      <div className="product-img">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="product-body">...</div>
      <div className="add-to-cart">...</div>
    </div>
  );
}
```

### Project Structure (Frontend Store)

```
frontend-headless/
  src/
    components/
      MAIN_HEADER.jsx
      HeroSection.jsx
      heroSections/
        sectionProducts/
          SectionAllProducts.jsx
          SectionAllProductsDummyData.jsx
      Footer.jsx
    js/
      fetchProducts.js
  public/
    css/
      realProducts.css
  index.html
  vite.config.js
```

### Extending the Storefront

- **To add a new UI section:**
  - Create a new component in `src/components/` or a relevant subfolder.
  - Import and use it in `HeroSection.jsx` or the main app layout.
- **To add new product features:**
  - Update the product card component and its props.
  - Adjust data fetching and state management as needed.
- **To change the slider behavior:**
  - Update the slick initialization options in the relevant section component.
- **To customize styles:**
  - Edit or extend `realProducts.css` or add new CSS files as needed.

### Best Practices

- Keep components small and focused.
- Use props and state for dynamic data.
- Avoid direct DOM manipulation except where necessary (e.g., for slick-carousel integration).
- Use React refs for third-party library hooks.
- Keep styles modular and scoped to components.

---

## 🖥️ Frontend Usage & Navigation

- The UI is built with Bootstrap 5 for a clean, professional look.
- Each CRUD operation (Create, Read, Update, Delete, List) has its own page under `/ui/pages/`.
- Navigation is via the main `index.html` (dashboard).
- Forms are visually divided, use Bootstrap components, and have client-side validation.
- Each page has a "Back to Overview" button.

---

## ⚙️ Environment Variables Reference

| Variable               | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| SHOPWARE_ADMIN_API_URL | Base URL for Shopware Admin API (must end with `/api`) |
| SHOPWARE_CLIENT_ID     | Access key ID from Shopware integration                |
| SHOPWARE_CLIENT_SECRET | Secret access key from Shopware integration            |
| ENABLE_SERVER_LOGS     | Set to `true` to enable detailed logging               |

---

## 🔗 API Endpoints Overview _(reflect current routes used by the Admin UI)_

| Endpoint                       | Method | Purpose                           |
| ------------------------------ | ------ | --------------------------------- |
| `/api/products`                | GET    | List products                     |
| `/api/products/:id`            | GET    | Get a product                     |
| `/api/products/create-product` | POST   | Create a product (cover optional) |
| `/api/products/:id`            | PUT    | Update a product                  |
| `/api/products/:id`            | DELETE | Delete a product                  |

**Client configuration note:**  
The Admin UI reads `serverPort` from `localStorage` (fallback `3001`).  
Example base URL used in the UI: `http://localhost:${serverPort}`

---

## 📝 Known Issues & Limitations

- **Image field:** Only accepts a direct image URL. If the image does not appear in Shopware, check the URL and Shopware's media settings.
- **Required fields:** Some fields (e.g., `taxId`, `manufacturerId`, `stock`) must be valid and exist in Shopware. The backend will attempt to create missing manufacturers automatically.
- **Token expiry:** Handled automatically; no manual refresh needed.
- **Error handling:** All errors are logged in detail if `ENABLE_SERVER_LOGS=true`.
- **?\_response=detail:** Always used for POST requests to ensure the API returns the created resource's ID.
- **No file upload:** Product images must be provided as URLs, not file uploads.

---

## 🔎 Logging & Debugging Flow _(add precise checkpoints)_

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
console.log(
  "[UI] Media urls:",
  (produkt?.media || []).map((m) => m.url)
);

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

## 🛠️ Shopware Admin API Integration & Dynamic Token Handling

To work with the Shopware Admin API, you must generate a valid access token (JWT) and store it in your `.env` file. **However, since tokens expire quickly, this project uses dynamic token generation and caching.**

### 1. How to Create an Integration and Get API Keys

1. Open your Shopware admin panel:
   `http://shopware.local/admin`
2. Go to **Settings → System → Integrations**
3. Click **Create integration**
4. Fill out the form (e.g., name: `club-manager-sync`), enable **Administrator** or select the required permissions.
5. After saving, Shopware will show:
   - `Access key ID`
   - `Secret access key`
     > ⚠️ **Copy the secret immediately!** It is only shown once.

### 2. Dynamic Token Generation (Automatic in Code)

**You do NOT need to manually refresh the token.**

The backend code (see `??????????`) automatically requests a new token if the current one is expired. This is handled by the function:

```js
export async function getValidAccessToken() {
  // ...existing code...
}
```

This function uses your credentials from `.env`:

- `SHOPWARE_CLIENT_ID`
- `SHOPWARE_CLIENT_SECRET`
- `SHOPWARE_ADMIN_API_URL`

and always ensures a valid token is used for all API requests.

### 3. Manufacturer Handling: Dynamic Creation

When creating a product, the backend checks if the given `manufacturerId` exists. If not, it automatically creates a new manufacturer and uses its ID. This logic is implemented in:

```js
async function createProduct({ ... }) {
  // ...existing code...
  let validManufacturerId = manufacturerId;
  if (!manufacturerId) {
    validManufacturerId = await createManufacturer("Default Manufacturer");
  } else {
    const found = await getManufacturerById(manufacturerId);
    if (!found) {
      validManufacturerId = await createManufacturer(name + " Manufacturer");
    }
  }
  // ...existing code...
}
```

### 4. Important Notes & Troubleshooting

- **Always use the endpoint with `?_response=detail`** for POST requests to `/product` and `/product-manufacturer` to ensure the API returns the created resource's ID in the response. Example:
  - `POST /api/product?_response=detail`
  - `POST /api/product-manufacturer?_response=detail`
- If you do not use this parameter, Shopware may return an empty response (HTTP 204), causing errors when accessing `response.data.data.id`.
- The backend code is robust and logs all API requests and responses for easier debugging.
- If you encounter errors like `Cannot read properties of undefined (reading 'id')`, check the API response and ensure the endpoint and parameters are correct.
- **Image field:** The product image field expects a valid URL. If the image is not shown in Shopware, check the URL and Shopware's media permissions.
- **Token Expiry:** You do not need to refresh the token manually; the backend handles it.

### 5. Example .env File

```env
SHOPWARE_ADMIN_API_URL=http://shopware.local/api
SHOPWARE_CLIENT_ID=YOUR_ACCESS_KEY_ID
SHOPWARE_CLIENT_SECRET=YOUR_SECRET_ACCESS_KEY
ENABLE_SERVER_LOGS=true
```

---

## 🧭 API URL Reference

| Admin URL                   | API URL                   |
| --------------------------- | ------------------------- |
| http://shopware.local/admin | http://shopware.local/api |
| http://localhost:8000/admin | http://localhost:8000/api |

---

## 🛠 Session: Fixing "Unable to create the cache directory" Error After Ubuntu Server Restart

### 🗓 Context

After a reboot of the Ubuntu VM running the Shopware backend, the local IP changed (e.g., to `192.168.0.9`). The new IP was updated as usual in the Windows hosts file:

```
C:\Windows\System32\drivers\etc\hosts

192.168.0.9 shopware.local
```

The SSH connection was successful using this IP.

However, when accessing `http://shopware.local/admin` in the browser, the following error appeared:

```json
{
  "errors": [
    {
      "code": "0",
      "status": "500",
      "title": "Internal Server Error",
      "detail": "Unable to create the cache directory (/var/www/html/shopware/var/cache/...)"
    }
  ]
}
```

---

### 🚨 Cause

Shopware was unable to write to its cache directory. This typically happens after a VM restart due to incorrect file permissions or ownership on the `var/` or `var/cache/` directories.

---

### ✅ Solution

1. **Connect to the VM via SSH**:

   ```bash
   ssh youruser@192.168.0.9
   ```

2. **Navigate to the Shopware project folder**:

   ```bash
   cd /var/www/html/shopware
   ```

3. **Optionally clear old cache**:

   ```bash
   rm -rf var/cache/*
   ```

4. **Fix permissions and ownership**:

   ```bash
   sudo chown -R www-data:www-data .
   sudo chmod -R 775 var
   ```

   Replace `www-data` with the user running PHP/Nginx if it differs.

---

### 🔁 Outcome

Reloading `http://shopware.local/admin` now correctly displays the Shopware Admin panel without any server error.

---

> ℹ️ This issue may reoccur after future VM reboots. Keep this note in the README as a quick recovery reference.

---

## 🚀 Recent Improvements (Storefront)

### Dynamic Cart Quantity Controls

- Added increment (+) and decrement (–) buttons for each product in the cart dropdown, styled to match the storefront theme.
- Quantity changes are handled according to Shopware best practices: incrementing uses `addProductToCart`, decrementing uses a combination of `removeItemFromCart` and re-adding with the new quantity.

### Real-Time Cart Updates

- The cart updates instantly and dynamically after any change (increment, decrement, or removal) without requiring a page refresh.
- All cart operations trigger a refresh to ensure the UI always reflects the latest server state.

### Shopware API Integration Improvements

- Fixed previous issues with quantity updates and synchronization with the Shopware Store API.
- All cart operations now use Shopware's recommended API patterns (`addProductToCart` and `removeItemFromCart`), ensuring robust and predictable cart behavior.

---
