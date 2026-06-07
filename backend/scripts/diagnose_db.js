const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shop_db'
};

async function diagnose() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to DB:", dbConfig.database);

        const [tables] = await connection.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);
        console.log("Tables found:", tableNames);

        for (const table of tableNames) {
            const [columns] = await connection.query(`DESCRIBE ${table}`);
            console.log(`
Columns in ${table}:`);
            columns.forEach(c => console.log(`- ${c.Field} (${c.Type})`));
        }

    } catch (err) {
        console.error("DB Error:", err.message);
    } finally {
        if (connection) await connection.end();
    }
}

diagnose();
