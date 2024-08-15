import React, { useState, useEffect } from 'react';
import './TopMenuWidget.css';

function TopMenuWidget() {
    const [topMenus, setTopMenus] = useState([]);
    const [dateRange, setDateRange] = useState('');

    useEffect(() => {
        // Fetch top menus data
        fetch('http://localhost:3001/top-menus')
            .then(response => response.json())
            .then(data => setTopMenus(data))
            .catch(error => console.error('Error fetching top menus:', error));
        
        // Set the date range for this week
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - startDate.getDay() + 7); // Sunday
        setDateRange(`${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleString('default', { month: 'long' })} ${startDate.getFullYear()}`);
    }, []);

    return (
        <div className="top-menu-widget">
            <h3>Top Menu <span>This Week</span></h3>
            <p className="date-range">{dateRange}</p>
            <ul>
                {topMenus.map((menu, index) => (
                    <li key={index} className={index === 0 ? 'top-item' : ''}>
                        {index === 0 && <div className="top-rank">1</div>}
                        {index + 1}. {menu.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TopMenuWidget;
