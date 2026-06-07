const { pool: db } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Login user with email
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_key_here',
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Authentication failed.', error: err.message });
    }
};

// Register new user (Admin Only)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already registered.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'staff']
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed.', error: err.message });
    }
};

// Get all staff members
exports.getAllStaff = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users WHERE role = "staff"');
        res.json(rows);
    } catch (err) {
        console.error('Staff fetch error:', err);
        res.status(500).json({ message: 'Error fetching staff list.', error: err.message });
    }
};

// Remove a staff member
exports.deleteStaff = async (req, res) => {
    let connection;
    try {
        const staffId = req.params.id;
        
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Delete notification reads for this user
        await connection.execute('DELETE FROM notification_reads WHERE user_id = ?', [staffId]);

        // 2. Delete the user (bills will have user_id set to NULL due to ON DELETE SET NULL)
        const [result] = await connection.execute('DELETE FROM users WHERE id = ? AND role = "staff"', [staffId]);

        if (result.affectedRows === 0) {
            throw new Error('Staff member not found or already removed.');
        }

        await connection.commit();
        res.json({ message: 'Staff member removed successfully.' });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Staff deletion error:', err);
        res.status(500).json({ message: 'Error removing staff.', error: err.message });
    } finally {
        if (connection) connection.release();
    }
};
