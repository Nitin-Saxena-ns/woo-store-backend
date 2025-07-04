# 🛍️ WooCommerce Product Sync Backend

This is a Node.js + Express backend that allows sellers to register, create products, and sync them in real-time with a live WooCommerce store via the WooCommerce REST API.

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- MySQL (`woo_task` database)
- WooCommerce REST API
- dotenv, axios, cors

---

## 🚀 Features

- 🔐 Seller registration and login
- 📦 Create product and sync with WooCommerce
- ✏️ Edit product (updates local DB + WooCommerce)
- ❌ Delete product (from local DB + WooCommerce)
- 🧩 RESTful API design

---

## 📁 Folder Structure

.
├── app.js
├── /routes
├── /controllers
├── /utils
├── /config
├── /models
├── .env



---

## 🔧 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Nitin-Saxena-ns/your-repo-name.git
cd your-repo-name
2. Install dependencies
bash
Copy
Edit
npm install
3. Setup environment variables
Create a .env file:

env
Copy
Edit
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=woo_task

WC_STORE_URL=https://yourstore.com
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxx
4. Start the server
bash
Copy
Edit
npm start
🔌 API Endpoints
Auth
Method	Endpoint	Description
POST	/api/register	Register new seller
POST	/api/login	Login and get token

Product
Method	Endpoint	Description
POST	/api/products	Create product & sync with WooCommerce
GET	/api/products	Get all products
PUT	/api/products/:id	Update product
DELETE	/api/products/:id	Delete product

🔄 WooCommerce Sync
Product actions (create, update, delete) are synced live with WooCommerce using REST API and your store's credentials.
