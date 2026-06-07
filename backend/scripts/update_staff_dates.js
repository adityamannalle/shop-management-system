const { pool: db } = require('./config/db');

const updateStaffDates = async () => {
    try {
        const staffEmails = [
            'staff1@gmail.com',
            'staff2@gmail.com',
            'staff3@gmail.com',
            'staff4@gmail.com',
            'staff5@gmail.com'
        ];

        console.log('Updating join dates for staff members...');

        for (let i = 0; i < staffEmails.length; i++) {
            const email = staffEmails[i];
            
            // Generate a date between 5 and 60 days ago
            // We'll space them out (e.g., 55 days ago, 42 days ago, 30 days ago, etc.)
            const daysAgo = 55 - (i * 12); 
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

            const [result] = await db.query(
                'UPDATE users SET created_at = ? WHERE email = ? AND role = "staff"',
                [formattedDate, email]
            );

            if (result.affectedRows > 0) {
                console.log(`Updated ${email} join date to: ${formattedDate} (${daysAgo} days ago)`);
            } else {
                console.log(`Staff with email ${email} not found.`);
            }
        }

        console.log('Staff join dates updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating staff dates:', err);
        process.exit(1);
    }
};

updateStaffDates();
