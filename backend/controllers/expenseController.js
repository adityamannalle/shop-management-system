const { pool: db } = require('../config/db');

// Get all expenses sorted by date
exports.getAllExpenses = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = 'SELECT * FROM expenses';
        let params = [];

        if (startDate && endDate) {
            query += ' WHERE date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY date DESC, created_at DESC';
        
        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Fetch expenses error:', err);
        res.status(500).json({ message: 'Error fetching expenses.', error: err.message });
    }
};

// Add a new expense
exports.createExpense = async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;
        
        if (!description || !amount || !date) {
            return res.status(400).json({ message: 'Description, amount, and date are required.' });
        }

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            return res.status(400).json({ message: 'Invalid amount.' });
        }

        const [result] = await db.execute(
            'INSERT INTO expenses (description, amount, category, date) VALUES (?, ?, ?, ?)',
            [description, numAmount, category || 'General', date]
        );
        
        res.status(201).json({ 
            message: 'Expense added successfully!', 
            expenseId: result.insertId 
        });
    } catch (err) {
        console.error('Create expense error:', err);
        res.status(500).json({ message: 'Error adding expense.', error: err.message });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM expenses WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Expense not found.' });
        res.json({ message: 'Expense deleted successfully.' });
    } catch (err) {
        console.error('Delete expense error:', err);
        res.status(500).json({ message: 'Error deleting expense.', error: err.message });
    }
};
