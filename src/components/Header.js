'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logoutUser, openAuthModal, openSellModal } = useAppContext();

  // Load initial search and location from URL parameters
  const [searchVal, setSearchVal] = useState('');
  const [locationVal, setLocationVal] = useState('New York, NY');

  useEffect(() => {
    setSearchVal(searchParams.get('query') || '');
    setLocationVal(searchParams.get('location') || 'New York, NY');
  }, [searchParams]);

  // Perform search redirect
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const queryStr = searchVal.trim();
    
    // Route to home with query parameters
    const params = new URLSearchParams();
    if (queryStr) params.set('query', queryStr);
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

  const logoSvg = (
    <svg viewBox="0 0 1024 1024" className="olx-logo" xmlns="http://www.w3.org/2000/svg">
      <path d="M85.333 512c0-117.76 96-213.333 213.334-213.333S512 394.24 512 512s-96 213.333-213.333 213.333S85.333 629.76 85.333 512zm128 0c0 47.147 38.187 85.333 85.333 85.333s85.333-38.186 85.333-85.333-38.186-85.333-85.333-85.333-85.333 38.187-85.333 85.333zM512 170.667h128v512H512zM725.333 384L810.667 512l-85.334 128h128l85.334-128-85.334-128z"></path>
    </svg>
  );

  return (
    <header id="main-header">
      {/* Mini top bar */}
      <div className="header-top">
        <div className="header-top-content">
          <div className="header-top-left">
            <Link href="/"><i className="fa-solid fa-building-columns"></i> Motors</Link>
            <Link href="/"><i className="fa-solid fa-house-chimney"></i> Property</Link>
          </div>
          <div className="header-top-right">
            <span>Free Classifieds in United States</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="header-main-nav">
        <div className="logo-container">
          <Link href="/" aria-label="OLX Home">{logoSvg}</Link>
        </div>

        <div className="search-controls">
          {/* Location picker */}
          <div className="location-picker-wrapper">
            <i className="fa-solid fa-location-dot"></i>
            <select 
              className="location-picker" 
              value={locationVal} 
              onChange={handleLocationChange}
            >
              <option value="New York, NY">New York, NY</option>
              <option value="Los Angeles, CA">Los Angeles, CA</option>
              <option value="Chicago, IL">Chicago, IL</option>
              <option value="Houston, TX">Houston, TX</option>
              <option value="Miami, FL">Miami, FL</option>
            </select>
          </div>

          {/* Search Input bar */}
          <form className="search-bar-wrapper" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Find Cars, Mobile Phones and more..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>

        {/* User Session & Sell Button */}
        <div className="user-controls">
          {user ? (
            <div className="user-profile-menu">
              <div className="user-avatar-trigger">
                <img src={user.avatar} alt={user.name} />
                <i className="fa-solid fa-chevron-down"></i>
              </div>
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="name">{user.name}</div>
                  <div className="email">{user.email}</div>
                </div>
                <div className="user-dropdown-list">
                  <Link href="/"><i className="fa-solid fa-house"></i> Home</Link>
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

          <button className="btn btn-sell" onClick={openSellModal}>
            <i className="fa-solid fa-plus"></i> Sell
          </button>
        </div>
      </div>

      {/* Sub Category Row */}
      <div className="categories-nav">
        <div className="categories-content">
          <div className="all-categories-menu">
            <span>ALL CATEGORIES</span>
            <i className="fa-solid fa-chevron-down"></i>
          </div>
          <div className="categories-list">
            <Link href="/?category=smartphones">Smartphones</Link>
            <Link href="/?category=laptops">Laptops</Link>
            <Link href="/?category=fragrances">Fragrances</Link>
            <Link href="/?category=skincare">Skincare</Link>
            <Link href="/?category=groceries">Groceries</Link>
            <Link href="/?category=home-decoration">Home Decoration</Link>
            <Link href="/?category=furniture">Furniture</Link>
            <Link href="/?category=automotive">Automotive</Link>
            <Link href="/?category=motorcycle">Motorcycles</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
