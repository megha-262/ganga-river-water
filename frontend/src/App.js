import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LocationDetails from './pages/LocationDetails';
import Locations from './pages/Locations';
import Alerts from './pages/Alerts';
import About from './pages/About';
import Contact from './pages/Contact';
import Forecasting from './pages/Forecasting';
import ChatbotPage from './pages/ChatbotPage';
import EmergencyResponse from './pages/EmergencyResponse';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import DataSources from './pages/DataSources';
import Credits from './pages/Credits';
import { Navbar, Footer } from './components/layout';
import { ErrorBoundary, Breadcrumb } from './components/common';
import Chatbot from './components/Chatbot';
import './styles/App.css';

const AppContent = () => {
  const location = useLocation();
  const isFullScreenPage = location.pathname === '/chatbot';
  const isDashboard = location.pathname === '/';

  return (
    <div className="App min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />
      <main className={isFullScreenPage ? "" : isDashboard ? "" : "container mx-auto px-4 py-4 sm:py-8"}>
              <Routes>
                <Route path="/" element={
                  <>
                    <Dashboard />
                  </>
                } />
                <Route path="/location/:id" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <LocationDetails />
                  </>
                } />
                <Route path="/locations" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <Locations />
                  </>
                } />
                <Route path="/alerts" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <Alerts />
                  </>
                } />
                <Route path="/forecasting" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <Forecasting />
                  </>
                } />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/about" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <About />
                  </>
                } />
                <Route path="/contact" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <Contact />
                  </>
                } />
                <Route path="/emergency" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <EmergencyResponse />
                  </>
                } />
                <Route path="/privacy" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <Privacy />
                  </>
                } />
                <Route path="/data-sources" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <DataSources />
                  </>
                } />
                <Route path="/credits" element={
                  <>
                    <div className="mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
                      <Breadcrumb />
                    </div>
                    <Credits />
                  </>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
           {!isFullScreenPage && <Footer />}
           <Chatbot />
         </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;