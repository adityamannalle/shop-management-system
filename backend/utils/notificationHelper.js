const { pool: db } = require('../config/db');

/**
 * Checks if a product's stock is below its low stock limit or out of stock.
 * Triggers alerts for both cases, with special priority for 0 stock.
 */
exports.checkLowStock = async (productId) => {
    try {
        // 1. Get product details
        const [products] = await db.execute(
            'SELECT name, stock, low_stock_limit, last_notified_at FROM products WHERE id = ?',
            [productId]
        );

        if (products.length === 0) return;
        const product = products[0];

        // 2. Logic for OUT OF STOCK (0) - Critical priority
        if (product.stock <= 0) {
            // Check if we already sent an "Out of Stock" alert recently (last 6 hours for critical)
            const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

            const [existing] = await db.execute(
                'SELECT id FROM notifications WHERE product_id = ? AND type = "danger" AND created_at > DATE_SUB(NOW(), INTERVAL 6 HOUR)',
                [productId]
            );

            if (existing.length === 0) {
                await db.execute(
                    'INSERT INTO notifications (title, message, type, role, product_id) VALUES (?, ?, ?, ?, ?)',
                    ['Out of Stock!', `${product.name} is completely sold out. Please restock immediately!`, 'danger', 'all', productId]
                );
                await db.execute('UPDATE products SET last_notified_at = NOW() WHERE id = ?', [productId]);
                console.log(`[Critical Alert]: Out of stock sent for ${product.name}`);
            }
            return;
        }

        // 3. Logic for LOW STOCK - Standard priority
        if (product.stock <= product.low_stock_limit) {
            const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

            if (!product.last_notified_at || new Date(product.last_notified_at) < twelveHoursAgo) {
                await db.execute(
                    'INSERT INTO notifications (title, message, type, role, product_id) VALUES (?, ?, ?, ?, ?)',
                    ['Low Stock Alert', `${product.name} is running low (${product.stock} left).`, 'warning', 'all', productId]
                );
                await db.execute('UPDATE products SET last_notified_at = NOW() WHERE id = ?', [productId]);
                console.log(`[Alert]: Low stock notification sent for ${product.name}`);
            }
        } else {
            // 4. If stock is now healthy (above limit), reset the notification timer
            // This handles cases where stock might have been updated outside of productController
            if (product.last_notified_at) {
                await db.execute('UPDATE products SET last_notified_at = NULL WHERE id = ?', [productId]);
                console.log(`[Reset]: Notification timer cleared for ${product.name} (Stock: ${product.stock})`);
            }
        }
    } catch (err) {
        console.error('Error in checkLowStock:', err);
    }
};
