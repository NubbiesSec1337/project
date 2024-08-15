import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomers, setSelectedCustomerId } from '../redux/customerSlice';
import './CustomerTable.css';
import CustomerDetail from './CustomerDetail';
import deleteIcon from '../assets/icons/delete-icon.png'; // Impor ikon delete

function CustomerTable({ searchTerm }) {
    const dispatch = useDispatch();
    const customers = useSelector((state) => state.customer.customers);
    const loading = useSelector((state) => state.customer.loading);
    const selectedCustomerId = useSelector((state) => state.customer.selectedCustomerId);
    const [filteredCustomers, setFilteredCustomers] = useState(customers);

    useEffect(() => {
        dispatch(fetchCustomers());
    }, [dispatch]);

    useEffect(() => {
        setFilteredCustomers(customers);
    }, [customers]);

    const handleSearch = useCallback((searchTerm) => {
        if (searchTerm) {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers(customers);
        }
    }, [customers]);

    useEffect(() => {
        handleSearch(searchTerm);
    }, [searchTerm, handleSearch]);

    const handleDetailClick = (customerId) => {
        dispatch(setSelectedCustomerId(customerId));
    };

    const handleDeleteCustomerClick = (customerId) => {
        if (window.confirm("Are you sure you want to delete this customer and all related transactions?")) {
            fetch(`http://localhost:3001/customers/${customerId}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                console.log("Customer deleted:", data);
                dispatch(fetchCustomers());
            })
            .catch(error => console.error("Error deleting customer:", error));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    return (
        <div className="customer-table-container">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="customer-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Level</th>
                            <th>Favorite Menu</th>
                            <th>Total Transaction</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id}>
                                <td>{customer.name}</td>
                                <td>
                                    <span className={`level-badge ${customer.level.toLowerCase()}`}>
                                        {customer.level}
                                    </span>
                                </td>
                                <td>{customer.favorite_menu}</td>
                                <td>{formatCurrency(customer.total_transaction || 0)}</td>
                                <td>
                                    <button
                                        className="detail-button"
                                        onClick={() => handleDetailClick(customer.id)}
                                    >
                                        <i className="fas fa-eye"></i> Detail
                                    </button>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleDetailClick(customer.id)}
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteCustomerClick(customer.id)}
                                    >
                                        <img src={deleteIcon} alt="Delete" className="delete-icon" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {selectedCustomerId && <CustomerDetail customerId={selectedCustomerId} />}
        </div>
    );
}

export default CustomerTable;
