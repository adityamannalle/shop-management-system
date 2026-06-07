const { pool: db } = require('../config/db');

/**
 * UNIFIED DASHBOARD
 * Returns shop statistics based on user role.
 * Admin: Full shop data
 * Staff: Personal data only
 */
exports.getDashboard = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const today = new Date().toISOString().split('T')[0];
        
        // Use case-insensitive role check for robustness
        const isStaff = role && role.toLowerCase() === 'staff';

        console.log(`[DASHBOARD ACCESS] UserID: ${userId}, Role: ${role}, isStaff: ${isStaff}`);

        let results;
        if (isStaff) {
            // STRICT ISOLATED QUERIES FOR STAFF
            results = await Promise.all([
                // 0: Personal Total Revenue
                db.execute('SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM bills WHERE user_id = ?', [userId]),
                
                // 1: Global Total Products (Operational context)
                db.execute('SELECT COUNT(*) as totalProducts FROM products'),
                
                // 2: Hidden for staff
                Promise.resolve([[ { totalStock: 0 } ]]),
                
                // 3: Hidden for staff
                Promise.resolve([[ { totalStaff: 0 } ]]),
                
                // 4: Personal Revenue Today
                db.execute('SELECT COALESCE(SUM(total_amount), 0) as revenueToday FROM bills WHERE DATE(created_at) = ? AND user_id = ?', [today, userId]),
                
                // 5: Personal Sales Count Today
                db.execute('SELECT COUNT(*) as salesToday FROM bills WHERE DATE(created_at) = ? AND user_id = ?', [today, userId]),
                
                // 6: Global Low Stock Count (Operational context)
                db.execute('SELECT COUNT(*) as lowStock FROM products WHERE stock < low_stock_limit'),
                
                // 7: Hidden for staff
                Promise.resolve([[ { totalExpenses: 0 } ]]),
                
                // 8: Hidden for staff
                Promise.resolve([[ { totalExpensesToday: 0 } ]]) ,
                
                // 9: Personal Recent Bills
                db.execute(`
                    SELECT b.id as orderId, b.total_amount, b.customer_name, b.payment_mode as payment_method, b.created_at, u.name as staffName
                    FROM bills b 
                    LEFT JOIN users u ON b.user_id = u.id 
                    WHERE b.user_id = ?
                    ORDER BY b.created_at DESC 
                    LIMIT 10
                `, [userId]),
                
                // 10: Personal Chart Data
                db.execute(`
                    SELECT DATE(created_at) as date, SUM(total_amount) as sales 
                    FROM bills 
                    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND user_id = ?
                    GROUP BY DATE(created_at) 
                    ORDER BY DATE(created_at) ASC
                `, [userId]),
                
                // 11: Global Inventory List (Operational context)
                db.execute('SELECT id, name, price, stock, low_stock_limit FROM products ORDER BY stock ASC LIMIT 10')
            ]);
        } else {
            // FULL QUERIES FOR ADMIN
            results = await Promise.all([
                db.execute('SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM bills'),
                db.execute('SELECT COUNT(*) as totalProducts FROM products'),
                db.execute('SELECT COALESCE(SUM(stock), 0) as totalStock FROM products'),
                db.execute('SELECT COUNT(*) as totalStaff FROM users WHERE role = "staff"'),
                db.execute('SELECT COALESCE(SUM(total_amount), 0) as revenueToday FROM bills WHERE DATE(created_at) = ?', [today]),
                db.execute('SELECT COUNT(*) as salesToday FROM bills WHERE DATE(created_at) = ?', [today]),
                db.execute('SELECT COUNT(*) as lowStock FROM products WHERE stock < low_stock_limit'),
                db.execute('SELECT COALESCE(SUM(amount), 0) as totalExpenses FROM expenses'),
                db.execute('SELECT COALESCE(SUM(amount), 0) as totalExpensesToday FROM expenses WHERE date = ?', [today]),
                db.execute(`
                    SELECT b.id as orderId, b.total_amount, b.customer_name, b.payment_mode as payment_method, b.created_at, u.name as staffName
                    FROM bills b LEFT JOIN users u ON b.user_id = u.id 
                    ORDER BY b.created_at DESC LIMIT 10
                `),
                db.execute(`
                    SELECT DATE(created_at) as date, SUM(total_amount) as sales 
                    FROM bills WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                    GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC
                `),
                db.execute('SELECT id, name, price, stock, low_stock_limit FROM products ORDER BY stock ASC LIMIT 10')
            ]);
        }

        const totalRevenue = parseFloat(results[0][0][0]?.totalRevenue) || 0;
        const totalExpenses = parseFloat(results[7][0][0]?.totalExpenses) || 0;

        res.json({
            totalRevenue,
            revenueToday: parseFloat(results[4][0][0]?.revenueToday) || 0,
            salesToday: parseInt(results[5][0][0]?.salesToday) || 0,
            totalProducts: parseInt(results[1][0][0]?.totalProducts) || 0,
            totalStock: parseInt(results[2][0][0]?.totalStock) || 0,
            totalStaff: parseInt(results[3][0][0]?.totalStaff) || 0,
            lowStock: parseInt(results[6][0][0]?.lowStock) || 0,
            totalExpenses,
            totalExpensesToday: parseFloat(results[8][0][0]?.totalExpensesToday) || 0,
            netProfit: isStaff ? 0 : (totalRevenue - totalExpenses),
            recentBills: results[9][0] || [],
            chartData: results[10][0] || [],
            inventory: results[11][0] || [],
            role: role
        });

    } catch (err) {
        console.error('[DASHBOARD ERROR]', err);
        res.status(500).json({ message: 'Error fetching dashboard stats.' });
    }
};

/**
 * EXPENSES SUMMARY
 */
exports.getExpensesSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let revenueQuery = 'SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM bills';
        let expenseQuery = 'SELECT COALESCE(SUM(amount), 0) as totalExpenses FROM expenses';
        let params = [];

        if (startDate && endDate) {
            revenueQuery += ' WHERE DATE(created_at) BETWEEN ? AND ?';
            expenseQuery += ' WHERE date BETWEEN ? AND ?';
            params = [startDate, endDate, startDate, endDate];
        }

        const [revenueRows] = await db.execute(revenueQuery, params.slice(0, 2));
        const [expenseRows] = await db.execute(expenseQuery, params.slice(2, 4));

        const totalRevenue = parseFloat(revenueRows[0]?.totalRevenue) || 0;
        const totalExpenses = parseFloat(expenseRows[0]?.totalExpenses) || 0;
        const netProfit = totalRevenue - totalExpenses;

        res.json({
            totalRevenue,
            totalExpenses,
            netProfit
        });
    } catch (err) {
        console.error('Summary fetch error:', err);
        res.status(500).json({ message: 'Error fetching summary.' });
    }
};
