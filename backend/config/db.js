const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shop_db',
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

const initDatabase = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            multipleStatements: true
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database};`);
        await connection.query(`USE ${dbConfig.database};`);

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schema);
        
        // Seed Admin User
        const [users] = await connection.query('SELECT id FROM users WHERE email = "admin"');
        if (users.length === 0) {
            console.log('Seeding default admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            await connection.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Admin', 'admin', hashedPassword, 'admin']
            );
        }

        await connection.end();
        console.log('Database initialized');
    } catch (err) {
        console.error('Database initialization error:', err.message);
    }
};

module.exports = { pool, initDatabase };
