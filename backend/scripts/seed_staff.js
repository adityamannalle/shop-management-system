const { pool: db } = require('./config/db');
const bcrypt = require('bcrypt');

const seedStaff = async () => {
    try {
        const staffMembers = [
            { name: 'staff1', email: 'staff1@gmail.com' },
            { name: 'staff2', email: 'staff2@gmail.com' },
            { name: 'staff3', email: 'staff3@gmail.com' },
            { name: 'staff4', email: 'staff4@gmail.com' },
            { name: 'staff5', email: 'staff5@gmail.com' }
        ];
        const password = 'staff@123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Adding 5 staff members...');
        
        for (const staff of staffMembers) {
            // Check if email already exists
            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [staff.email]);
            if (existing.length > 0) {
                console.log(`Staff with email ${staff.email} already exists. Skipping.`);
                continue;
            }

            await db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [staff.name, staff.email, hashedPassword, 'staff']
            );
            console.log(`Added: ${staff.name} (${staff.email})`);
        }

        console.log('Staff seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding staff:', err);
        process.exit(1);
    }
};

seedStaff();
