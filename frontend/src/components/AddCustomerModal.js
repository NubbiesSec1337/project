import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '../redux/customerSlice';
import './AddCustomerModal.css';

function AddCustomerModal({ showModal, closeModal }) {
    const [name, setName] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [transactions, setTransactions] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (showModal) {
            fetch('http://localhost:3001/products')
                .then((response) => response.json())
                .then((data) => {
                    setProducts(data);
                })
                .catch((error) => console.error('Error fetching products:', error));
        }
    }, [showModal]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const handleAddMenu = () => {
        if (!selectedProduct || quantity < 1) {
            alert('Please select a valid product and quantity');
            return;
        }

        const selectedMenu = products.find(product => product.id === parseInt(selectedProduct));
        setTransactions([
            ...transactions,
            { product_id: selectedProduct, product_name: selectedMenu.name, quantity }
        ]);

        setSelectedProduct('');
        setQuantity(1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (transactions.length === 0) {
            alert("Please add at least one menu item.");
            return;
        }

        const newCustomer = { name };

        fetch('http://localhost:3001/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newCustomer),
        })
            .then((response) => response.json())
            .then((data) => {
                const customerId = data.customerId;

                const transactionPromises = transactions.map(transaction => {
                    const newTransaction = {
                        customer_id: customerId,
                        product_id: transaction.product_id,
                        quantity: transaction.quantity,
                    };

                    return fetch('http://localhost:3001/transactions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newTransaction),
                    });
                });

                return Promise.all(transactionPromises);
            })
            .then(() => {
                dispatch(fetchCustomers());
                closeModal();
            })
            .catch((error) => console.error('Error adding transactions:', error));
    };

    if (!showModal) {
        return null;
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Add New Customer</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Menu</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            required
                        >
                            <option value="">Select Menu</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} - {formatCurrency(product.price)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            min="1"
                        />
                    </div>
                    <button type="button" className="btn-add" onClick={handleAddMenu}>
                        Add Menu
                    </button>
                    <div className="added-menus">
                        <h4>Added Menus</h4>
                        <ul>
                            {transactions.map((transaction, index) => (
                                <li key={index}>
                                    {transaction.product_name} - Quantity: {transaction.quantity}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button type="submit" className="btn-submit">Add Customer</button>
                    <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                </form>
            </div>
        </div>
    );
}

export default AddCustomerModal;
