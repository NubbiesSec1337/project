import React, { useState } from 'react';
import './Header.css';
import AddCustomerModal from './AddCustomerModal';

function Header({ onSearch }) {
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchClick = () => {
        onSearch(searchTerm);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    return (
        <div className="header">
            <h1>Customer</h1>
            <div className="header-actions">
                <button className="add-customer" onClick={openModal}>Add New Customer</button>
                <input
                    type="text"
                    placeholder="Search Customer"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}  // Panggil handleSearchClick saat Enter ditekan
                />
                <button className="search-button" onClick={handleSearchClick}>Search</button>
                <button className="filter-button">Filter</button>
                <button className="refresh-button">Refresh</button>
            </div>
            {showModal && (
                <AddCustomerModal showModal={showModal} closeModal={closeModal} />
            )}
        </div>
    );
}

export default Header;
