# 🛒 Shop Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2019-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-orange?logo=mysql)](https://www.mysql.com/)

A comprehensive, full-stack retail management solution built for modern businesses. This system streamlines **Inventory Tracking**, **Point of Sale (POS) Billing**, and **Financial Analytics** into a single, intuitive interface.

---

## 🌟 Key Modules

### 📊 Dashboard & Analytics
- **Real-time Overview**: Instant visibility into total revenue, daily sales, and order counts.
- **Trend Visualization**: Interactive charts showing sales performance over time.
- **Critical Alerts**: Immediate notification for low-stock items and out-of-stock products.

### 🧾 Smart Billing (POS)
- **Fast Checkout**: Add products to cart with instant subtotal and tax calculations.
- **Invoice Generation**: Professional, print-ready invoices for every transaction.
- **Payment Flexibility**: Support for multiple payment modes (Cash, Card, UPI).

### 📦 Inventory Management
- **Centralized Catalog**: Detailed product tracking with pricing, descriptions, and stock levels.
- **Automated Guardrails**: Customizable low-stock limits to prevent sales interruptions.
- **Dynamic Updates**: Real-time stock deduction upon billing.

### 💰 Expense & Team Tracking
- **Outflow Monitoring**: Log business expenses by category (Rent, Salaries, Utilities).
- **Profitability Reports**: Automatically calculate net profit by comparing revenue vs expenses.
- **Secure Access**: Role-based access control (Admin vs Staff) to protect sensitive data.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL (relational structure)
- **Auth**: JWT (JSON Web Tokens) with Bcrypt encryption

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v18+)
- **MySQL Server**

### ⚙️ Installation

1. **Clone & Enter**
   ```bash
   git clone https://github.com/adityamannalle/shop-management-system.git
   cd shop-management-system
   ```

2. **Quick Install**
   ```bash
   npm run install:all
   ```

3. **Database Setup**
   - Create a database named `shop_db`.
   - Import the schema from `backend/database/schema.sql`.
   - Update `backend/config/db.js` with your MySQL credentials.

4. **Launch**
   ```bash
   npm run dev
   ```

---

## 🔐 Default Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin123` |

---

## 📸 Screenshots
*(Add your project screenshots here to make it look even better!)*

---

## 📄 License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

Developed with ❤️ by **[Aditya Mannalle](https://github.com/adityamannalle)**
