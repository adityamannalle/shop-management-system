const { pool: db } = require('../config/db');

// Get notifications based on user role and individual read status
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        console.log(`[Notifications]: Fetching for User ${userId} (${userRole})`);

        // Fetch Notifications the user hasn't read yet
        const query = `
            SELECT n.id, n.title, n.message, n.type, n.created_at
            FROM notifications n
            LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
            LEFT JOIN products p ON n.product_id = p.id
            WHERE (n.role = ? OR n.role = 'all') 
            AND nr.notification_id IS NULL
            AND (n.product_id IS NULL OR p.stock <= p.low_stock_limit)
            ORDER BY n.created_at DESC 
            LIMIT 20
        `;
        const [rows] = await db.execute(query, [userId, userRole]);
        console.log(`[Notifications]: Found ${rows.length} unread notifications`);

        res.json(rows);

    } catch (err) {
        console.error('Fetch notifications error:', err);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
};

// Mark all notifications as read for the current user
exports.markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        console.log(`[Notifications]: Marking all read for User ${userId}`);

        // Find all currently visible unread notifications
        const findQuery = `
            SELECT n.id 
            FROM notifications n
            LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
            LEFT JOIN products p ON n.product_id = p.id
            WHERE (n.role = ? OR n.role = 'all') 
            AND nr.notification_id IS NULL
            AND (n.product_id IS NULL OR p.stock <= p.low_stock_limit)
        `;
        const [unread] = await db.execute(findQuery, [userId, userRole]);
        console.log(`[Notifications]: Found ${unread.length} to mark as read`);

        if (unread.length > 0) {
            const values = unread.map(n => `(${userId}, ${n.id})`).join(', ');
            const [result] = await db.execute(`INSERT IGNORE INTO notification_reads (user_id, notification_id) VALUES ${values}`);
            console.log(`[Notifications]: Inserted ${result.affectedRows} read records`);
        }

        res.json({ message: 'Notifications marked as read.' });
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ message: 'Failed to update notifications.' });
    }
};

// Create a new notification
exports.createNotification = async (req, res) => {
    try {
        const { title, message, type, role } = req.body;
        await db.execute(
            'INSERT INTO notifications (title, message, type, role) VALUES (?, ?, ?, ?)',
            [title, message, type || 'info', role || 'all']
        );
        res.status(201).json({ message: 'Notification created.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create notification.' });
    }
};
