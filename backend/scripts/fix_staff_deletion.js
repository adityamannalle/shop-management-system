const { pool: db } = require('./config/db');

const fixStaffDeletion = async () => {
    try {
        console.log('Modifying bills table to allow staff deletion...');
        
        // 1. Find the name of the foreign key constraint on user_id
        const [rows] = await db.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'bills' 
            AND COLUMN_NAME = 'user_id' 
            AND TABLE_SCHEMA = DATABASE()
        `);

        if (rows.length > 0) {
            const constraintName = rows[0].CONSTRAINT_NAME;
            console.log(`Found constraint: ${constraintName}. Dropping it...`);
            await db.query(`ALTER TABLE bills DROP FOREIGN KEY ${constraintName}`);
        }

        // 2. Modify user_id to be nullable so we can use ON DELETE SET NULL
        console.log('Making user_id nullable...');
        await db.query('ALTER TABLE bills MODIFY user_id INT NULL');

        // 3. Re-add the foreign key with ON DELETE SET NULL
        console.log('Re-adding foreign key with ON DELETE SET NULL...');
        await db.query(`
            ALTER TABLE bills 
            ADD CONSTRAINT fk_bills_user 
            FOREIGN KEY (user_id) 
            REFERENCES users(id) 
            ON DELETE SET NULL
        `);

        console.log('Database modification successful!');
        process.exit(0);
    } catch (err) {
        console.error('Error modifying database:', err);
        process.exit(1);
    }
};

fixStaffDeletion();
