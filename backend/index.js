const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pos_system'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the MySQL database');
});

// Get All Customers with Favorite Menu and Orders
app.get('/customers', (req, res) => {
    const query = `
        SELECT c.*, 
               (SELECT p.name 
                FROM transactions t 
                JOIN products p ON t.product_id = p.id 
                WHERE t.customer_id = c.id 
                GROUP BY p.name 
                ORDER BY SUM(t.quantity) DESC 
                LIMIT 1) AS favorite_menu,
               GROUP_CONCAT(
                   CONCAT(
                       '{"transaction_id": ', t.id, 
                       ', "product_name": "', p.name, 
                       '", "quantity": ', t.quantity, 
                       ', "total_price": ', t.total_price, '}'
                   ) SEPARATOR ','
               ) AS orders
        FROM customers c 
        LEFT JOIN transactions t ON c.id = t.customer_id
        LEFT JOIN products p ON t.product_id = p.id
        WHERE c.deleted_at IS NULL
        GROUP BY c.id;
    `;

    db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Parse the orders JSON string into an array
        const customersWithOrders = results.map(customer => {
            return {
                ...customer,
                orders: JSON.parse(`[${customer.orders}]` || '[]')  // Mengubah hasil GROUP_CONCAT menjadi array JSON
            };
        });

        res.json(customersWithOrders);
    });
});

// Get Customer Details with Ordered Products
app.get('/customers/:id/detail', (req, res) => {
    const customerId = req.params.id;

    const customerQuery = `
        SELECT id, name, level, favorite_menu, total_transaction, created_at, updated_at 
        FROM customers 
        WHERE id = ? AND deleted_at IS NULL;
    `;

    const ordersQuery = `
        SELECT t.id as transaction_id, p.name AS product_name, t.quantity 
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.customer_id = ?;
    `;

    db.execute(customerQuery, [customerId], (err, customerResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (customerResult.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        db.execute(ordersQuery, [customerId], (err, ordersResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const customerDetail = {
                ...customerResult[0],
                orders: ordersResult
            };

            res.json(customerDetail);
        });
    });
});

// Add New Customer
app.post('/customers', (req, res) => {
    const { name } = req.body;
    const initialFavoriteMenu = null; // Initialize favorite_menu as null
    const initialTotalTransaction = 0;

    const query = `
        INSERT INTO customers (name, level, favorite_menu, total_transaction) 
        VALUES (?, 'Warga', ?, ?)
    `;
    
    db.execute(query, [name, initialFavoriteMenu, initialTotalTransaction], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Customer added successfully', customerId: result.insertId });
    });
});

// Create a New Transaction and Update Total Transaction, Level, and Favorite Menu
app.post('/transactions', (req, res) => {
    const { customer_id, product_id, quantity } = req.body;

    const priceQuery = 'SELECT name, price FROM products WHERE id = ?';

    db.execute(priceQuery, [product_id], (err, result) => {
        if (err) {
            console.error("Error fetching product:", err);
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = result[0];
        const total_price = product.price * quantity;

        const transactionQuery = 'INSERT INTO transactions (customer_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)';

        db.execute(transactionQuery, [customer_id, product_id, quantity, total_price], (err, result) => {
            if (err) {
                console.error("Error inserting transaction:", err);
                return res.status(500).json({ error: err.message });
            }

            console.log(`Transaction added: Customer ID ${customer_id}, Product ID ${product_id}, Quantity ${quantity}, Total Price ${total_price}`);

            // Update total_transaction and level only
            const updateCustomerQuery = `
                UPDATE customers 
                SET 
                    total_transaction = total_transaction + ?,
                    level = CASE 
                        WHEN total_transaction + ? > 1000000 THEN 'Konglomerat'
                        WHEN total_transaction + ? > 700000 THEN 'Juragan'
                        WHEN total_transaction + ? > 500000 THEN 'Sultan'
                        ELSE 'Warga'
                    END
                WHERE id = ?;
            `;

            console.log(`Executing updateCustomerQuery for customer ${customer_id}`);

            db.execute(updateCustomerQuery, [total_price, total_price, total_price, total_price, customer_id], (err, result) => {
                if (err) {
                    console.error("Error updating customer:", err);
                    return res.status(500).json({ error: err.message });
                }

                console.log(`Total transaction and level updated successfully for customer ${customer_id}`);

                // Update favorite_menu
                const favoriteMenuQuery = `
                    UPDATE customers c
                    SET favorite_menu = (
                        SELECT p.name 
                        FROM transactions t 
                        JOIN products p ON t.product_id = p.id 
                        WHERE t.customer_id = c.id 
                        GROUP BY p.name 
                        ORDER BY SUM(t.quantity) DESC 
                        LIMIT 1
                    )
                    WHERE id = ?;
                `;

                console.log(`Executing favoriteMenuQuery for customer ${customer_id}`);

                db.execute(favoriteMenuQuery, [customer_id], (err, result) => {
                    if (err) {
                        console.error("Error updating favorite menu:", err);
                        return res.status(500).json({ error: err.message });
                    }

                    console.log(`Favorite menu updated successfully for customer ${customer_id}`);
                    res.status(201).json({ message: 'Transaction created and customer updated successfully' });
                });
            });
        });
    });
});

// Delete a Customer and All Related Transactions
app.delete('/customers/:id', (req, res) => {
    const customerId = req.params.id;

    // First, delete all transactions related to the customer
    const deleteTransactionsQuery = 'DELETE FROM transactions WHERE customer_id = ?';

    db.execute(deleteTransactionsQuery, [customerId], (err, result) => {
        if (err) {
            console.error("Error deleting transactions:", err);
            return res.status(500).json({ error: err.message });
        }

        // Now delete the customer
        const deleteCustomerQuery = 'DELETE FROM customers WHERE id = ?';

        db.execute(deleteCustomerQuery, [customerId], (err, result) => {
            if (err) {
                console.error("Error deleting customer:", err);
                return res.status(500).json({ error: err.message });
            }

            console.log(`Customer and related transactions deleted successfully for customer ${customerId}`);
            res.status(200).json({ message: 'Customer and related transactions deleted successfully' });
        });
    });
});

// Edit a Transaction
app.put('/transactions/:id', (req, res) => {
    const transactionId = req.params.id;
    const { quantity } = req.body;

    // First, find the original transaction details to adjust the customer's total_transaction and level
    const findTransactionQuery = `
        SELECT customer_id, total_price, quantity AS original_quantity, product_id 
        FROM transactions 
        WHERE id = ?;
    `;

    db.execute(findTransactionQuery, [transactionId], (err, transactionResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (transactionResult.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const transaction = transactionResult[0];
        const { customer_id, total_price, original_quantity, product_id } = transaction;

        // Get the price of the product
        const priceQuery = 'SELECT price FROM products WHERE id = ?';

        db.execute(priceQuery, [product_id], (err, productResult) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (productResult.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const productPrice = productResult[0].price;
            const newTotalPrice = productPrice * quantity;
            const priceDifference = newTotalPrice - total_price;

            // Update the transaction
            const updateTransactionQuery = `
                UPDATE transactions 
                SET quantity = ?, total_price = ? 
                WHERE id = ?;
            `;

            db.execute(updateTransactionQuery, [quantity, newTotalPrice, transactionId], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                console.log(`Transaction updated: Transaction ID ${transactionId}, New Quantity ${quantity}, New Total Price ${newTotalPrice}`);

                // Update customer's total_transaction and level
                const updateCustomerQuery = `
                    UPDATE customers 
                    SET 
                        total_transaction = total_transaction + ?,
                        level = CASE 
                            WHEN total_transaction + ? > 1000000 THEN 'Konglomerat'
                            WHEN total_transaction + ? > 700000 THEN 'Juragan'
                            WHEN total_transaction + ? > 500000 THEN 'Sultan'
                            ELSE 'Warga'
                        END
                    WHERE id = ?;
                `;

                db.execute(updateCustomerQuery, [priceDifference, priceDifference, priceDifference, priceDifference, customer_id], (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    console.log(`Customer's total transaction and level updated for customer ${customer_id}`);

                    // Update favorite_menu after editing the transaction
                    const favoriteMenuQuery = `
                        UPDATE customers c
                        SET favorite_menu = (
                            SELECT p.name 
                            FROM transactions t 
                            JOIN products p ON t.product_id = p.id 
                            WHERE t.customer_id = c.id 
                            GROUP BY p.name 
                            ORDER BY SUM(t.quantity) DESC 
                            LIMIT 1
                        )
                        WHERE id = ?;
                    `;

                    db.execute(favoriteMenuQuery, [customer_id], (err, result) => {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }

                        console.log(`Favorite menu updated successfully for customer ${customer_id}`);
                        res.status(200).json({ message: 'Transaction updated and customer updated successfully' });
                    });
                });
            });
        });
    });
});

// Get All Products (For Dropdown)
app.get('/products', (req, res) => {
    const query = 'SELECT id, name, price FROM products';
    db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get Top Menus This Week
app.get('/top-menus', (req, res) => {
    const query = `
        SELECT p.name, SUM(t.quantity) AS total_ordered 
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY total_ordered DESC
        LIMIT 5;
    `;

    db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Start the Server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
