'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export default function AuthModal() {
  const { authModal, closeAuthModal, loginUser, registerUser, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState('login');
  
  // Login states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regProfilePic, setRegProfilePic] = useState(null);
  const [regProfilePicPreview, setRegProfilePicPreview] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Update active tab when context opens it with a specific default
  useEffect(() => {
    if (authModal.defaultTab) {
      setActiveTab(authModal.defaultTab);
    }
  }, [authModal.defaultTab]);

  if (!authModal.isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await loginUser(loginUsername.trim(), loginPassword);
      // Reset form
      setLoginUsername('');
      setLoginPassword('');
    } catch (error) {
      showToast(`Login Failed: ${error.message}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) return;
    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }
    setIsRegistering(true);
    try {
      await registerUser(regName.trim(), regUsername.trim(), regEmail.trim(), regPassword, regProfilePic);
      // Reset form
      setRegName('');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegProfilePic(null);
      setRegProfilePicPreview('');
    } catch (error) {
      showToast(`Registration Failed: ${error.message}`, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && closeAuthModal()}>
      <div className="modal-content">
        <button className="close-modal-btn" aria-label="Close modal" onClick={closeAuthModal}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`} 
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`} 
            onClick={() => setActiveTab('signup')}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? (
          <form id="login-form" className="auth-form" onSubmit={handleLoginSubmit}>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Enter your credentials to access your OLX account</p>
            
            <div className="form-group">
              <label htmlFor="login-username">Username</label>
              <div className="input-icon-wrapper">
                <i className="fa-solid fa-user"></i>
                <input 
                  type="text" 
                  id="login-username" 
                  placeholder="e.g. emilys" 
                  required 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <span className="helper-text">Tip: Use DummyJSON username <strong>emilys</strong></span>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-icon-wrapper">
                <i className="fa-solid fa-lock"></i>
                <input 
                  type="password" 
                  id="login-password" 
                  placeholder="e.g. emilyspass" 
                  required 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <span className="helper-text">Tip: Use password <strong>emilyspass</strong></span>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form id="signup-form" className="auth-form" onSubmit={handleRegisterSubmit}>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join the largest buying and selling community</p>

            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <div className="input-icon-wrapper">
                <i className="fa-solid fa-user-tag"></i>
                <input 
                  type="text" 
                  id="signup-name" 
                  placeholder="John Doe" 
                  required 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-username">Username</label>
              <div className="input-icon-wrapper">
                <i className="fa-solid fa-user"></i>
                <input 
                  type="text" 
                  id="signup-username" 
                  placeholder="johndoe" 
                  required 
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <div className="input-icon-wrapper">
                <i className="fa-solid fa-envelope"></i>
                <input 
                  type="email" 
                  id="signup-email" 
                  placeholder="john@example.com" 
                  required 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-pic">Profile Picture</label>
              <div className="file-input-wrapper">
                <i className="fa-solid fa-image"></i>
                <span className="file-input-text">Choose an image</span>
                <input
                  type="file"
                  id="signup-pic"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setRegProfilePic(file);
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setRegProfilePicPreview(ev.target.result);
                      reader.readAsDataURL(file);
                      e.target.previousElementSibling.textContent = file.name;
                    } else {
                      setRegProfilePicPreview('');
                      e.target.previousElementSibling.textContent = 'Choose an image';
                    }
                  }}
                />
              </div>
              {regProfilePicPreview && (
                <img src={regProfilePicPreview} alt="Preview" className="profile-pic-preview" />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="input-icon-wrapper">
                <i className="fa-solid fa-lock"></i>
                <input 
                  type="password" 
                  id="signup-password" 
                  placeholder="Min. 6 characters" 
                  required 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isRegistering}>
              {isRegistering ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
