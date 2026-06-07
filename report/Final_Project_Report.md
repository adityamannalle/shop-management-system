# PROJECT REPORT: SHOP MANAGEMENT SYSTEM

**Project Title:** Aditya’s Retail Shop (SMS)
**Target:** BCA Final Year Project
**Structure:** Professional Academic Standard

---

## 1. Introduction

The **Shop Management System (SMS)** is a web-based application designed to manage the daily operations of a retail shop. In the modern era, traditional methods of maintaining shop records using registers and manual books are becoming obsolete due to high error rates and time consumption. This project aims to provide a digital solution that handles inventory, billing, staff management, and sales reporting in a single, unified platform.

The system is developed using modern web technologies, ensuring that it is fast, secure, and accessible from any device with a browser. The primary focus is to automate the billing process and keep an accurate track of stock levels, which helps the shop owner make informed decisions about procurement and sales strategies.

---

## 2. System Analysis

### 2.1 Existing System
The current system in many small and medium-sized shops involves manual record-keeping. The drawbacks of the existing system include:
*   **Time Consuming:** Writing invoices by hand is a slow process, especially during peak hours.
*   **Human Error:** Manual calculations often lead to mistakes in billing and stock counts.
*   **Lack of Security:** Physical registers can be lost, damaged, or tampered with easily.
*   **Difficulty in Reporting:** Generating monthly or yearly sales reports is a tedious task involving hours of manual auditing.

### 2.2 Proposed System
The proposed system addresses the limitations of the manual process by introducing:
*   **Automated Billing:** Instant invoice generation with automated GST and discount calculations.
*   **Real-time Inventory:** Stock levels are updated automatically after every sale, with alerts for low stock.
*   **Centralized Database:** All data is stored securely in a MySQL database, making it easy to search and retrieve.
*   **Reporting & Analytics:** Interactive charts and reports provide real-time insights into profit, loss, and sales trends.

### 2.3 Software Requirements
*   **Operating System:** Windows 10/11 or Linux.
*   **Backend Runtime:** Node.js (v18+).
*   **Frameworks:** Express.js (Backend), React.js (Frontend).
*   **Database:** MySQL (v8.0).
*   **Tools:** VS Code, Git, Chrome Browser.
*   **Libraries:** Axios, Chart.js, JWT, Bcrypt.

---

## 3. Feasibility Report

### 3.1 Feasibility Study
A feasibility study is conducted to determine if the project is worth the investment. It evaluates whether the system can be developed within the constraints of time, budget, and technology.

### 3.2 Technical Feasibility
The project uses the MERN/PERN stack principles (PostgreSQL/MySQL instead of MongoDB). Node.js and React are highly scalable and widely used, making the project technically sound. The use of MySQL ensures relational data integrity, which is crucial for a billing system.

### 3.3 Operational Feasibility
The system is designed with a user-friendly interface. Staff members with basic computer knowledge can easily operate the billing and inventory modules. The Admin dashboard is intuitive, allowing for easy management of the entire shop.

### 3.4 Economical Feasibility
The project is economically feasible as it uses open-source technologies. No expensive software licenses are required. In the long run, the system saves money by reducing errors and optimizing stock management, leading to higher profitability.

---

## 4. Object Oriented Methodology (OOM)

The Shop Management System is designed using Object-Oriented principles to ensure modularity and reusability.
*   **Encapsulation:** Data like user passwords and product prices are encapsulated within objects and protected via access control.
*   **Inheritance:** Common attributes for users (Admin/Staff) are managed through a base user structure.
*   **Polymorphism:** Different types of notifications or payment methods can be handled using a unified interface.
*   **Abstraction:** Complex database queries and business logic are hidden behind simple API endpoints.

---

## 5. Object Modeling Technique (OMT)

OMT is used to describe the system from three different perspectives:
1.  **Object Model:** Defines the structure of objects in the system (Products, Bills, Users, Expenses).
2.  **Dynamic Model:** Describes the control aspects, such as the flow of a billing transaction from cart addition to invoice printing.
3.  **Functional Model:** Focuses on the data transformations within the system, such as how sales data is converted into visual charts.

---

## 6. Language Overview

*   **JavaScript (ES6+):** The primary language for both frontend and backend development.
*   **SQL (MySQL):** Used for managing the relational database and performing complex queries for reports.
*   **CSS3 (Tailwind/Vanilla):** Used for styling the user interface to make it professional and responsive.
*   **HTML5:** Used for the structure of the web pages.

---

## 7. System Design

### 7.1 Database Table Descriptions

The system uses a relational database schema in MySQL. The key tables are:

*   **Users Table:** Stores credentials and roles (Admin/Staff) for authentication.
*   **Products Table:** Stores inventory details including price, current stock, and low-stock limits.
*   **Bills Table:** Stores the main transaction record, including customer name, total amount, and GST.
*   **Bill_Items Table:** A junction table that links products to bills, storing quantity and price at the time of sale.
*   **Expenses Table:** Tracks daily shop costs like rent, electricity, and salaries.
*   **Notifications Table:** Stores system alerts and messages for users.

### 7.2 Normalization
To ensure data integrity and reduce redundancy, the database follows normalization rules:
*   **1NF:** Each table column contains atomic values, and there are no repeating groups.
*   **2NF:** All non-key attributes are fully functional dependent on the primary key.
*   **3NF:** There are no transitive dependencies; non-key attributes do not depend on other non-key attributes.

### 7.3 ER Diagram (Entity-Relationship)
Entities involved:
*   **User:** Attributes (id, name, email, password, role).
*   **Product:** Attributes (id, name, price, stock, low_stock_limit).
*   **Bill:** Attributes (id, user_id, customer_name, total_amount, gst_amount).
*   **BillItem:** Attributes (id, bill_id, product_id, quantity, price).
*   **Expense:** Attributes (id, description, amount, date).

**Relationships:**
*   A User can generate multiple Bills (1:M).
*   A Bill contains multiple BillItems (1:M).
*   A Product can be part of many BillItems (1:M).

### 7.4 Data Flow Diagram (DFD)
*   **Level 0 (Context):** The user interacts with the system to provide login info and billing data. The system provides invoices and reports.
*   **Level 1:** Shows individual processes like "Manage Inventory", "Process Billing", "Generate Reports", and "Staff Management", and how they interact with the data stores.

---

## 8. Output

*(Note: In the final report, actual screenshots should be pasted here)*

1.  **Login Screen:** Secure entry point for Admin and Staff.
2.  **Admin Dashboard:** Overview of total sales, expenses, and low-stock alerts.
3.  **Billing (POS) Interface:** Interactive cart for adding products and generating bills.
4.  **Inventory Management:** Table for adding, editing, and deleting products.
5.  **Sales Reports:** Graphical representation of monthly sales and profit trends.
6.  **Staff Management:** Section for managing employees and their roles.

---

## 9. System Testing & Implementation

### 9.1 Testing Cases

| Test Case ID | Feature | Input | Expected Result | Result |
|--------------|---------|-------|-----------------|--------|
| TC01 | Login | Valid Email/Pass | Redirect to Dashboard | Pass |
| TC02 | Login | Invalid Pass | Show Error Message | Pass |
| TC03 | Billing | Add Product | Product appears in Cart | Pass |
| TC04 | Stock | Sale of 2 items | Stock count reduces by 2 | Pass |
| TC05 | Admin | Delete Staff | Staff removed from list | Pass |

### 9.2 Implementation
The system is implemented using a client-server architecture. The backend is hosted on a Node.js server, and the database is hosted on MySQL. The frontend is built with React, providing a Single Page Application (SPA) experience.

---

## 10. Code Efficiency

The system is optimized for performance:
*   **Indexing:** Database columns like `email` and `product_id` are indexed for faster lookups.
*   **Middleware:** Authentication is handled efficiently using JWT (JSON Web Tokens).
*   **Responsive Design:** The UI is built to adapt to mobile, tablet, and desktop screens.
*   **Caching:** Frontend API calls are minimized, and data is managed effectively using React state.

---

## 11. Conclusion

The Shop Management System successfully automates the core functions of a retail business. It provides a robust, secure, and user-friendly platform for managing sales, stock, and staff. By implementing this system, a shop owner can significantly reduce manual labor, eliminate calculation errors, and gain valuable insights into their business performance through automated reporting. This project serves as a comprehensive digital solution for modern retail challenges.

---

## 12. Bibliography

1.  **Node.js Documentation:** [https://nodejs.org/docs](https://nodejs.org/docs)
2.  **React.js Documentation:** [https://react.dev](https://react.dev)
3.  **MySQL Reference Manual:** [https://dev.mysql.com/doc](https://dev.mysql.com/doc)
4.  **MDN Web Docs (JavaScript):** [https://developer.mozilla.org](https://developer.mozilla.org)
5.  **"Software Engineering: A Practitioner's Approach"** by Roger S. Pressman.
6.  **"Database System Concepts"** by Abraham Silberschatz.
