// CustomerTable.js
import React from 'react';
import './CustomerTable.css';

function CustomerTable({ customers }) {
    return (
        <div className="customer-table">
            <table>
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
                    {customers.map((customer) => (
                        <tr key={customer.id}>
                            <td>{customer.name}</td>
                            <td className={`level ${customer.level.toLowerCase()}`}>{customer.level}</td>
                            <td>{customer.favoriteMenu}</td>
                            <td>{customer.totalTransaction}</td>
                            <td>
                                <button className="detail-button">Detail</button>
                                <button className="delete-button">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CustomerTable;
