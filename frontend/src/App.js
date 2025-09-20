import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LocationDetails from './pages/LocationDetails';
import Locations from './pages/Locations';
import Alerts from './pages/Alerts';
import About from './pages/About';
import Contact from './pages/Contact';
import Forecasting from './pages/Forecasting';
import EmergencyResponse from './pages/EmergencyResponse';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import DataSources from './pages/DataSources';
import Credits from './pages/Credits';
import { Navbar, Footer } from './components/layout';
import { ErrorBoundary, Breadcrumb } from './components/common';
import './styles/App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App min-h-screen bg-gray-50">
           <Navbar />
           <main className="container mx-auto px-4 py-4 sm:py-8">
              <Routes>
                <Route path="/" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <Dashboard />
                  </>
                } />
                <Route path="/location/:id" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <LocationDetails />
                  </>
                } />
                <Route path="/locations" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <Locations />
                  </>
                } />
                <Route path="/alerts" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <Alerts />
                  </>
                } />
                <Route path="/forecasting" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <Forecasting />
                  </>
                } />
                <Route path="/about" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <About />
                  </>
                } />
                <Route path="/contact" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <Contact />
                  </>
                } />
                <Route path="/emergency" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <EmergencyResponse />
                  </>
                } />
                <Route path="/privacy" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <Privacy />
                  </>
                } />
                <Route path="/data-sources" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <DataSources />
                  </>
                } />
                <Route path="/credits" element={
                  <>
                    <div className="mb-4 sm:mb-6">
                      <Breadcrumb />
                    </div>
                    <Credits />
                  </>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
           <Footer />
         </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;