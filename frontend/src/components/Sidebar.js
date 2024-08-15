// Sidebar.js
import React from 'react';
import './Sidebar.css';

function Sidebar() {
    return (
        <div className="sidebar">
            <h2 className="sidebar-title">square</h2>
            <ul className="sidebar-menu">
                <li>Dashboard</li>
                <li>Stock</li>
                <li className="active">Customer</li>
                <li>Restaurant</li>
                <li>Design</li>
                <li>Report</li>
            </ul>
            <div className="sidebar-user">
                <img src="user-profile.png" alt="User" />
                <p>Seyram</p>
                <button className="logout-button">Logout</button>
            </div>
        </div>
    );
}

export default Sidebar;
