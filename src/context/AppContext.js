'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OLX_Auth, getSavedSession } from '../services/auth.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Global State
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, defaultTab: 'login' });
  const [sellModal, setSellModal] = useState({ isOpen: false });
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('New York, NY');

  // Load session on startup
  useEffect(() => {
    const session = getSavedSession();
    if (session) {
      setUser(session);
    }
  }, []);

  // Alert/Toast Handler
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Auth Modal Controls
  const openAuthModal = (defaultTab = 'login') => {
    setSellModal({ isOpen: false });
    setAuthModal({ isOpen: true, defaultTab });
  };
  const closeAuthModal = () => setAuthModal({ isOpen: false, defaultTab: 'login' });

  // Sell Modal Controls
  const openSellModal = () => {
    if (!user) {
      showToast('Please log in to sell items', 'warning');
      openAuthModal('login');
      return;
    }
    setSellModal({ isOpen: true });
  };
  const closeSellModal = () => setSellModal({ isOpen: false });

  // Authentication wrapper methods
  const loginUser = async (username, password) => {
    const loggedInUser = await OLX_Auth.login(username, password);
    setUser(loggedInUser);
    showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
    closeAuthModal();
  };

  const registerUser = async (name, username, email, password) => {
    const registeredUser = await OLX_Auth.register(name, username, email, password);
    setUser(registeredUser);
    showToast(`Account registered. Welcome, ${registeredUser.name}!`, 'success');
    closeAuthModal();
  };

  const logoutUser = () => {
    OLX_Auth.logout();
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authModal,
        sellModal,
        toasts,
        searchQuery,
        location,
        setSearchQuery,
        setLocation,
        showToast,
        openAuthModal,
        closeAuthModal,
        openSellModal,
        closeSellModal,
        loginUser,
        registerUser,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
