import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CustomerTable from './components/CustomerTable';
import Analytics from './components/Analytics';
import TopMenuWidget from './components/TopMenuWidget';
import './App.css';

function App() {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/customers')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                setCustomers(data);
                setFilteredCustomers(data); // Initialize filtered customers
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleSearch = (searchTerm) => {
        if (searchTerm) {
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers(customers); // Reset to full list if search is cleared
        }
    };

    return (
        <div className="app">
            <Sidebar />
            <div className="main-content">
                <Header onSearch={handleSearch} />
                {loading && <p>Loading customers...</p>}
                {error && <p>Error: {error}</p>}
                {!loading && !error && <CustomerTable customers={filteredCustomers} />}
                <Analytics />
                <TopMenuWidget />
            </div>
        </div>
    );
}

export default App;
