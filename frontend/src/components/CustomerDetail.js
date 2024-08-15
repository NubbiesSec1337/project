import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerDetails, fetchCustomers, setSelectedCustomerId } from '../redux/customerSlice'; // Pastikan fetchCustomers diimpor
import './CustomerDetail.css';

function CustomerDetail({ customerId }) {
    const dispatch = useDispatch();
    const customerDetails = useSelector((state) => state.customer.customerDetails);
    const [editingQuantity, setEditingQuantity] = useState({});

    useEffect(() => {
        if (customerId) {
            dispatch(fetchCustomerDetails(customerId));
        }
    }, [customerId, dispatch]);

    const handleQuantityChange = (transactionId, quantity) => {
        setEditingQuantity({
            ...editingQuantity,
            [transactionId]: quantity
        });
    };

    const handleUpdateClick = (transactionId) => {
        const newQuantity = editingQuantity[transactionId];
        if (newQuantity && !isNaN(newQuantity)) {
            fetch(`http://localhost:3001/transactions/${transactionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: parseInt(newQuantity, 10) }),
            })
            .then(response => response.json())
            .then(data => {
                console.log("Transaction updated:", data);
                dispatch(fetchCustomerDetails(customerId)); // Refresh customer details
                dispatch(fetchCustomers()); // Refresh customer list to update total transaction
            })
            .catch(error => console.error("Error updating transaction:", error));
        }
    };

    const handleCancelClick = () => {
        dispatch(setSelectedCustomerId(null));
    };

    return (
        <div className="customer-detail">
            {customerDetails ? (
                <div>
                    <h2 className="customer-name">Customer Detail: {customerDetails.name}</h2>
                    <div className="customer-info">
                        <p><strong>Level:</strong> <span className={`level-badge ${customerDetails.level.toLowerCase()}`}>{customerDetails.level}</span></p>
                        <p><strong>Favorite Menu:</strong> {customerDetails.favorite_menu}</p>
                        <p><strong>Total Transaction:</strong> Rp {Number(customerDetails.total_transaction || 0).toLocaleString('id-ID')}</p>
                    </div>

                    <h3>Orders</h3>
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerDetails.orders && customerDetails.orders.map((order) => (
                                <tr key={order.transaction_id}>
                                    <td>{order.product_name}</td>
                                    <td>
                                        <input
                                            type="number"
                                            className="quantity-input"
                                            value={editingQuantity[order.transaction_id] || order.quantity}
                                            onChange={(e) => handleQuantityChange(order.transaction_id, e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <button className="update-button" onClick={() => handleUpdateClick(order.transaction_id)}>
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button className="close-button" onClick={handleCancelClick}>Close</button>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
}

export default CustomerDetail;
