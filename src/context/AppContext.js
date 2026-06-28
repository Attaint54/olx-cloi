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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('New York, NY');
  const [theme, setTheme] = useState('light');

  // Init theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('olx_theme');
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('olx_theme', next);
  };

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

  // Refresh trigger for product list
  const [refreshProducts, setRefreshProducts] = useState(0);
  const incrementRefreshProducts = () => setRefreshProducts(prev => prev + 1);

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

  const registerUser = async (name, username, email, password, profilePicFile = null) => {
    const registeredUser = await OLX_Auth.register(name, username, email, password, profilePicFile);
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
        refreshProducts,
        theme, toggleTheme,
        isProcessingPayment, setIsProcessingPayment,
        openAuthModal,
        closeAuthModal,
        openSellModal,
        closeSellModal,
        incrementRefreshProducts,
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
