import React from 'react';
import Sidebar from './components/Sidebar';  // Correct
import Header from './components/Header';    // Correct
import CustomerTable from './components/CustomerTable';
import Analytics from './components/Analytics';
import TopMenuWidget from './components/TopMenuWidget';
import './App.css';

function App() {
    const customers = [
        // Populate this array with customer data fetched from your backend
    ];

    return (
        <div className="app">
            <Sidebar />
            <div className="main-content">
                <Header />
                <CustomerTable customers={customers} />
                <Analytics />
                <TopMenuWidget />
            </div>
        </div>
    );
}

export default App;
