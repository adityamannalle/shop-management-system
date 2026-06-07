const { pool: db } = require('../config/db');
const { checkLowStock } = require('../utils/notificationHelper');

// Create a new bill and update inventory
exports.createOrder = async (req, res) => {
    let connection;
    try {
        const { items, customerName, paymentMode } = req.body;
        const userId = req.user.id; 

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items provided for bill.' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const processedItems = [];

        for (const item of items) {
            const [productRows] = await connection.execute(
                'SELECT id, name, price, stock FROM products WHERE id = ? FOR UPDATE',
                [item.productId]
            );

            if (!productRows[0]) throw new Error(`Product ID ${item.productId} not found.`);
            const product = productRows[0];
            const price = parseFloat(product.price);
            const quantity = parseInt(item.quantity);

            if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.name}.`);

            processedItems.push({ productId: product.id, name: product.name, price, quantity });

            await connection.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product.id]);
        }

        const subtotal = processedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const netPayable = subtotal;

        const [billResult] = await connection.execute(
            'INSERT INTO bills (user_id, total_amount, customer_name, payment_mode, gst_amount) VALUES (?, ?, ?, ?, ?)',
            [userId, netPayable, customerName || 'Walk-in Customer', paymentMode || 'Cash', 0]
        );
        const billId = billResult.insertId;

        for (const item of processedItems) {
            await connection.execute(
                'INSERT INTO bill_items (bill_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [billId, item.productId, item.quantity, item.price]
            );
        }

        await connection.commit();
        
        // Check for low stock alerts after successful commit
        for (const item of processedItems) {
            checkLowStock(item.productId).catch(err => console.error('Background stock check failed:', err));
        }

        res.status(201).json({ 
            message: 'Bill created successfully!', 
            orderId: billId,
            subtotal,
            netPayable,
            payment_mode: paymentMode || 'Cash'
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Create bill error:', err);
        res.status(500).json({ message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

// Get sales performance analytics
exports.getSalesPerformance = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const { startDate, endDate, staffId, paymentMode, search } = req.query;

        console.log(`Fetching sales performance for user ${userId} (${role})`);

        // CORE PRIVACY LOGIC: Staff can ONLY see their own data.
        let filterUserId = role === 'admin' ? (staffId || null) : userId;
        
        let whereClause = '1=1';
        let params = [];

        if (filterUserId) {
            whereClause += ' AND b.user_id = ?';
            params.push(filterUserId);
        }

        if (startDate && endDate) {
            whereClause += ' AND DATE(b.created_at) BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (paymentMode) {
            whereClause += ' AND b.payment_mode = ?';
            params.push(paymentMode);
        }

        if (search) {
            whereClause += ' AND b.id LIKE ?';
            params.push(`%${search}%`);
        }

        const summaryQuery = `
            SELECT 
                COALESCE(SUM(b.total_amount), 0) as totalRevenue,
                COUNT(*) as totalOrders,
                COALESCE(SUM(CASE WHEN b.payment_mode = 'Cash' THEN b.total_amount ELSE 0 END), 0) as cashSales,
                COALESCE(SUM(CASE WHEN b.payment_mode = 'UPI' THEN b.total_amount ELSE 0 END), 0) as upiSales,
                COALESCE(SUM(CASE WHEN b.payment_mode = 'Card' THEN b.total_amount ELSE 0 END), 0) as cardSales,
                COALESCE(SUM(CASE WHEN DATE(b.created_at) = CURDATE() THEN b.total_amount ELSE 0 END), 0) as todaySales,
                COALESCE(SUM(CASE WHEN MONTH(b.created_at) = MONTH(CURDATE()) AND YEAR(b.created_at) = YEAR(CURDATE()) THEN b.total_amount ELSE 0 END), 0) as monthlySales
            FROM bills b
            WHERE ${whereClause}
        `;
        const [summaryRows] = await db.execute(summaryQuery, params);
        const summaryResult = summaryRows[0];

        const billsQuery = `
            SELECT 
                b.id as invoiceNumber,
                b.created_at as date,
                u.name as soldBy,
                b.payment_mode as paymentMode,
                b.total_amount as totalAmount
            FROM bills b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE ${whereClause}
            ORDER BY b.created_at DESC
        `;
        const [bills] = await db.execute(billsQuery, params);

        const chartQuery = `
            SELECT DATE(created_at) as date, SUM(total_amount) as amount 
            FROM bills b
            WHERE ${whereClause} AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        `;
        const [last7Days] = await db.execute(chartQuery, params);

        const monthlyQuery = `
            SELECT MONTHNAME(created_at) as month, SUM(total_amount) as amount 
            FROM bills b
            WHERE ${whereClause} AND YEAR(created_at) = YEAR(CURDATE())
            GROUP BY MONTH(created_at), MONTHNAME(created_at)
            ORDER BY MONTH(created_at) ASC
        `;
        const [monthlyTrend] = await db.execute(monthlyQuery, params);

        const topProductsQuery = `
            SELECT p.name, SUM(bi.quantity) as totalSold, SUM(bi.quantity * bi.price) as revenue
            FROM bill_items bi
            JOIN products p ON bi.product_id = p.id
            JOIN bills b ON bi.bill_id = b.id
            WHERE ${whereClause}
            GROUP BY p.id, p.name
            ORDER BY totalSold DESC
            LIMIT 5
        `;
        const [topProducts] = await db.execute(topProductsQuery, params);

        res.json({
            summary: {
                totalRevenue: parseFloat(summaryResult.totalRevenue),
                totalOrders: parseInt(summaryResult.totalOrders),
                cashSales: parseFloat(summaryResult.cashSales),
                upiSales: parseFloat(summaryResult.upiSales),
                cardSales: parseFloat(summaryResult.cardSales),
                todaySales: parseFloat(summaryResult.todaySales),
                monthlySales: parseFloat(summaryResult.monthlySales)
            },
            bills,
            charts: {
                last7Days,
                monthlyTrend,
                topProducts
            }
        });

    } catch (err) {
        console.error('Sales performance error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get details of a specific bill
exports.getBillDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        const [billRows] = await db.execute(
            'SELECT b.*, u.name as staffName FROM bills b LEFT JOIN users u ON b.user_id = u.id WHERE b.id = ?', 
            [id]
        );

        if (billRows.length === 0) return res.status(404).json({ message: 'Bill not found.' });
        const bill = billRows[0];

        // Security check: Staff can only see their own bills
        if (role === 'staff' && bill.user_id !== userId) {
            return res.status(403).json({ message: 'Access denied. You can only view your own bills.' });
        }

        const [itemRows] = await db.execute(
            'SELECT bi.*, p.name as productName FROM bill_items bi JOIN products p ON bi.product_id = p.id WHERE bi.bill_id = ?',
            [id]
        );

        res.json({
            ...bill,
            subtotal: itemRows.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price)), 0),
            netPayable: parseFloat(bill.total_amount),
            payment_mode: bill.payment_mode,
            items: itemRows
        });
    } catch (err) {
        console.error('Bill details error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get filtered sales report
exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT 
                b.id as orderId, b.total_amount, b.created_at, b.payment_mode, b.customer_name,
                u.name as staffName
            FROM bills b
            LEFT JOIN users u ON b.user_id = u.id
        `;
        const params = [];
        if (startDate && endDate) {
            query += ` WHERE DATE(b.created_at) BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }
        query += ` ORDER BY b.created_at DESC`;
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch sales report.' });
    }
};
