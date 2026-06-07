const { pool: db } = require('../config/db');
const { checkLowStock } = require('../utils/notificationHelper');

// Get all products sorted by newest
exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products ORDER BY id DESC');
        console.log(`Fetched ${rows.length} products`);
        res.json(rows);
    } catch (err) {
        console.error('Fetch products error:', err);
        res.status(500).json({ message: 'Error fetching products.', error: err.message });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!rows[0]) return res.status(404).json({ message: 'Product not found.' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Fetch product by ID error:', err);
        res.status(500).json({ message: 'Error fetching product.', error: err.message });
    }
};

// Add a new product (Admin Only)
exports.createProduct = async (req, res) => {
    try {
        console.log("Product creation request:", req.body);

        const { name, description, price, stock, low_stock_limit } = req.body;
        
        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Product name is required." });
        }

        const numPrice = Number(price);
        const numStock = Number(stock);
        const numLowStock = Number(low_stock_limit || 10);

        if (isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({ message: "Valid numeric price is required." });
        }
        if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
            return res.status(400).json({ message: "Valid integer stock quantity is required." });
        }
        if (isNaN(numLowStock) || numLowStock < 0 || !Number.isInteger(numLowStock)) {
            return res.status(400).json({ message: "Valid integer low stock limit is required." });
        }

        const [result] = await db.execute(
            'INSERT INTO products (name, description, price, stock, low_stock_limit) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), description || "", numPrice, numStock, numLowStock]
        );
        
        console.log("Product added successfully. ID:", result.insertId);

        // Check for low stock alerts
        checkLowStock(result.insertId).catch(err => console.error('Background stock check failed:', err));

        res.status(201).json({ 
            message: "Product added successfully", 
            productId: result.insertId 
        });
    } catch (error) {
        console.error("Create product error:", error);
        res.status(500).json({ message: "Error adding product.", error: error.message });
    }
};

// Update an existing product (Admin Only)
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, low_stock_limit } = req.body;
        console.log(`Updating product ID: ${req.params.id}`);

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Product name is required." });
        }

        const numPrice = Number(price);
        const numStock = Number(stock);
        const numLowStock = Number(low_stock_limit || 10);

        if (isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({ message: "Valid numeric price is required." });
        }
        if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
            return res.status(400).json({ message: "Valid integer stock quantity is required." });
        }
        if (isNaN(numLowStock) || numLowStock < 0 || !Number.isInteger(numLowStock)) {
            return res.status(400).json({ message: "Valid integer low stock limit is required." });
        }

        // If stock is replenished (above limit), reset the notification timer
        let updateQuery = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, low_stock_limit = ?';
        const queryParams = [name.trim(), description || "", numPrice, numStock, numLowStock];
        
        if (numStock > numLowStock) {
            updateQuery += ', last_notified_at = NULL';
        }
        
        updateQuery += ' WHERE id = ?';
        queryParams.push(req.params.id);

        const [result] = await db.execute(updateQuery, queryParams);
        
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found.' });

        // Check for low stock alerts
        checkLowStock(req.params.id).catch(err => console.error('Background stock check failed:', err));

        res.json({ message: 'Product updated successfully!' });
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ message: 'Error updating product.', error: err.message });
    }
};

// Delete a product (Admin Only)
exports.deleteProduct = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found.' });
        res.json({ message: 'Product deleted successfully!' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ message: 'Error deleting product.', error: err.message });
    }
};
