# Shop Management System

A full-stack retail management application designed for smart inventory tracking, professional billing (POS), and detailed sales analytics.

## 🚀 Features

- **Intuitive Dashboard**: Real-time overview of revenue, orders, and inventory status.
- **Dynamic Billing (POS)**: Fast checkout with automated GST calculations and professional invoice printing.
- **Inventory Control**: Comprehensive product management with automated low-stock alerts.
- **Sales Analytics**: Visualization of sales trends and top-performing products.
- **Expense Tracking**: Monitor business outflows and net profitability.
- **Team Management**: Role-based access control (Admin/Staff) for workspace security.
- **Notifications**: Automated system alerts for stock and operational updates.

## 🛠️ Tech Stack

- **Frontend**: React (v19) + Vite
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Styling**: Tailwind CSS / Vanilla CSS

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL](https://www.mysql.com/)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/shop-management-system.git
   cd shop-management-system
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Database Configuration**
   - Create a MySQL database named `shop_db`.
   - Import the schema from `backend/database/schema.sql`.
   - Update the database credentials in `backend/config/db.js` or via a `.env` file.

4. **Run the Application**
   ```bash
   # Run both frontend and backend concurrently
   npm run dev
   ```

## 🔐 Default Credentials
- **Email**: `admin@gmail.com`
- **Password**: `admin123`

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Developed by **Aditya**
