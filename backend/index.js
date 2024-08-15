const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pos_system'
});

// Routes for Customers

// Add New Customer
app.post('/customers', (req, res) => {
    const { name, level, favorite_menu, total_transaction } = req.body;
    const query = 'INSERT INTO customers (name, level, favorite_menu, total_transaction) VALUES (?, ?, ?, ?)';
    db.execute(query, [name, level, favorite_menu, total_transaction], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Customer added successfully', customerId: result.insertId });
    });
});

// Get Customer Details
app.get('/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const query = 'SELECT * FROM customers WHERE id = ?';
    db.execute(query, [customerId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(result[0]);
    });
});

// Update Customer Details
app.put('/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const { name, level, favorite_menu, total_transaction } = req.body;
    const query = 'UPDATE customers SET name = ?, level = ?, favorite_menu = ?, total_transaction = ? WHERE id = ?';
    db.execute(query, [name, level, favorite_menu, total_transaction, customerId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer updated successfully' });
    });
});

// Soft Delete Customer
app.delete('/customers/:id', (req, res) => {
    const customerId = req.params.id;
    const query = 'UPDATE customers SET deleted_at = NOW() WHERE id = ?';
    db.execute(query, [customerId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    });
});

// Routes for Transactions

// Create a New Transaction
app.post('/transactions', (req, res) => {
    const { customer_id, product_id, quantity } = req.body;
    const priceQuery = 'SELECT price FROM products WHERE id = ?';
    db.execute(priceQuery, [product_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const total_price = result[0].price * quantity;
        const transactionQuery = 'INSERT INTO transactions (customer_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)';
        db.execute(transactionQuery, [customer_id, product_id, quantity, total_price], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Transaction created successfully', transactionId: result.insertId });
        });
    });
});

// Start the Server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
