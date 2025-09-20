import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LocationDetails from './pages/LocationDetails';
import Alerts from './pages/Alerts';
import About from './pages/About';
import Forecasting from './pages/Forecasting';
import EmergencyResponse from './pages/EmergencyResponse'; // Import the new component
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/location/:id" element={<LocationDetails />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="/about" element={<About />} />
            <Route path="/emergency" element={<EmergencyResponse />} /> {/* Add new route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;