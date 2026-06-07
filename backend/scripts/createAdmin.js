const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

/**
 * SENIOR-LEVEL ADMIN SEEDING SCRIPT
 * Specifically targets: [id, name, email, password, role, created_at]
 */
async function seedAdmin() {
    let connection;
    try {
        // 1. Establish database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'shop_db'
        });

        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'admin123';
        const adminName = 'Aditya Admin';

        console.log(`🔍 [Database]: Checking if admin "${adminEmail}" exists...`);

        // 2. Check if admin already exists in the 'email' column
        const [rows] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [adminEmail]
        );

        if (rows.length > 0) {
            console.log('⚠️ [Abort]: Admin user already exists. Skipping insertion.');
            return;
        }

        // 3. Hash the password securely
        console.log('🔐 [Security]: Hashing password with bcrypt (10 rounds)...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // 4. Insert the default admin
        await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [adminName, adminEmail, hashedPassword, 'admin']
        );

        console.log('✅ [Success]: Default Admin inserted successfully.');
        console.log('-------------------------------------------');
        console.log(`Email/User: ${adminEmail}`);
        console.log(`Password:   ${adminPassword}`);
        console.log('-------------------------------------------');

    } catch (err) {
        console.error('❌ [Database Error]:', err.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 [Database]: Connection closed.');
        }
        process.exit();
    }
}

seedAdmin();
