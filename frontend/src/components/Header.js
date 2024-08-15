// Header.js
import React from 'react';
import './Header.css';

function Header() {
    return (
        <div className="header">
            <h1>Customer</h1>
            <div className="header-actions">
                <button className="add-customer">Add New Customer</button>
                <input type="text" placeholder="Search Customer" />
                <button className="search-button">Search</button>
                <button className="filter-button">Filter</button>
                <button className="refresh-button">Refresh</button>
            </div>
        </div>
    );
}

export default Header;
