'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

export default function HeaderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logoutUser, openAuthModal, openSellModal, theme, toggleTheme } = useAppContext();

  const [searchVal, setSearchVal] = useState('');
  const [locationVal, setLocationVal] = useState('New York, NY');

  useEffect(() => {
    setSearchVal(searchParams.get('query') || '');
    setLocationVal(searchParams.get('location') || 'New York, NY');
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchVal) params.set('query', searchVal);
    if (locationVal) params.set('location', locationVal);

    router.push(`/?${params.toString()}`);
  };

  const handleLocationChange = (e) => {
    const loc = e.target.value;
    setLocationVal(loc);

    const params = new URLSearchParams(searchParams.toString());
    params.set('location', loc);
    router.push(`/?${params.toString()}`);
  };

  return (
    <header id="main-header">
      <div className="header-main-nav">
        <div className="logo-container">
          <Link href="/" className="olx-logo" style={{ fontWeight: 800, fontSize: '22px', fontFamily: 'var(--font-heading)', color: 'var(--primary-brand)' }}>
            OLX
          </Link>
        </div>

        <div className="search-controls">
          <div className="location-picker-wrapper">
            <i className="fa-solid fa-location-dot"></i>
            <select className="location-picker" value={locationVal} onChange={handleLocationChange}>
              <option>New York, NY</option>
              <option>Los Angeles, CA</option>
              <option>Chicago, IL</option>
            </select>
          </div>

          <div className="search-bar-wrapper">
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%' }}>
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search..."
              />
              <button type="submit" className="search-btn" aria-label="Search">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
          </div>
        </div>

        <div className="user-controls">
          {user ? (
            <div className="user-profile-menu">
              <div className="user-avatar-trigger">
                <img src={user.avatar} alt={user.name} />
              </div>
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="name">{user.name}</div>
                  <div className="email">{user.email}</div>
                </div>
                <div className="user-dropdown-list">
                  <button className="logout-btn" onClick={logoutUser}>
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button className="btn-login" onClick={() => openAuthModal('login')}>
              Login
            </button>
          )}

          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <button className="btn btn-sell" onClick={openSellModal}>
            <i className="fa-solid fa-plus"></i> SELL
          </button>
        </div>
      </div>
    </header>
  );
}
