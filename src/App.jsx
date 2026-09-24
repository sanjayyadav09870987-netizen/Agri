import React, { useState, useEffect } from 'react';
import Homepage from './components/Homepage';
import RegisterView from './components/RegisterView';
import LoginView from './components/LoginView';
import FarmerDashboard from './components/FarmerDashboard/FarmerDashboard';
import VendorDashboard from './components/VendorDashboard/VendorDashboard';
import { getCurrentUser, logoutUser } from './services/storage';

export default function App() {
  // Navigation views: 'home' | 'register' | 'login' | 'farmer_dashboard' | 'vendor_dashboard'
  const [currentView, setCurrentView] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [prefillMobile, setPrefillMobile] = useState('');

  // Check existing session on load
  useEffect(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      if (sessionUser.userType === 'farmer') {
        setCurrentView('farmer_dashboard');
      } else if (sessionUser.userType === 'vendor') {
        setCurrentView('vendor_dashboard');
      }
    }
  }, []);

  const handleOpenRegister = () => {
    setCurrentView('register');
  };

  const handleOpenLogin = (mobile = '') => {
    if (typeof mobile === 'string') {
      setPrefillMobile(mobile);
    }
    setCurrentView('login');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.userType === 'farmer') {
      setCurrentView('farmer_dashboard');
    } else {
      setCurrentView('vendor_dashboard');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setPrefillMobile('');
    setCurrentView('home');
  };

  return (
    <div className="app-container">
      {currentView === 'home' && (
        <Homepage
          onOpenRegister={handleOpenRegister}
          onOpenLogin={handleOpenLogin}
        />
      )}

      {currentView === 'register' && (
        <RegisterView
          onBackToHome={handleBackToHome}
          onGoToLogin={handleOpenLogin}
        />
      )}

      {currentView === 'login' && (
        <LoginView
          initialMobile={prefillMobile}
          onBackToHome={handleBackToHome}
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={handleOpenRegister}
        />
      )}

      {currentView === 'farmer_dashboard' && (
        <FarmerDashboard
          user={currentUser}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'vendor_dashboard' && (
        <VendorDashboard
          user={currentUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
