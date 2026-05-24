'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OLX_API } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';

// FontAwesome icon maps for categories
const CATEGORY_ICONS = {
  'smartphones': 'fa-solid fa-mobile-screen-button',
  'laptops': 'fa-solid fa-laptop',
  'fragrances': 'fa-solid fa-spray-can-sparkles',
  'skincare': 'fa-solid fa-hand-holding-droplet',
  'groceries': 'fa-solid fa-basket-shopping',
  'home-decoration': 'fa-solid fa-couch',
  'furniture': 'fa-solid fa-chair',
  'womens-dresses': 'fa-solid fa-person-dress',
  'womens-shoes': 'fa-solid fa-shoe-prints',
  'mens-shirts': 'fa-solid fa-shirt',
  'mens-shoes': 'fa-solid fa-shoe-prints',
  'automotive': 'fa-solid fa-car',
  'motorcycle': 'fa-solid fa-motorcycle',
  'lighting': 'fa-solid fa-lightbulb'
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAppContext();

  // Params from routing
  const activeCategory = searchParams.get('category') || '';
  const activeQuery = searchParams.get('query') || '';
  const activeLocation = searchParams.get('location') || 'New York, NY';

  // API Lists State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Loading & Pagination States
  const [isLoading, setIsLoading] = useState(true);
  const [limit] = useState(16);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters State
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  // Load Categories list once
  useEffect(() => {
    async function fetchCategories() {
      const catList = await OLX_API.getCategories();
      setCategories(catList);
    }
    fetchCategories();
  }, []);

  // Fetch Products Handler
  const fetchProducts = useCallback(async (currentSkip, append = false) => {
    setIsLoading(true);
    try {
      const data = await OLX_API.getProducts({
        query: activeQuery,
        category: activeCategory,
        limit,
        skip: currentSkip
      });

      let results = data.products;

      // Merge local ads if on home page with no active filters
      if (currentSkip === 0 && !activeQuery && !activeCategory) {
        const localProducts = JSON.parse(localStorage.getItem('olx_local_products') || '[]');
        // Filter by location if specified
        const filteredLocals = localProducts.filter(p => p.location.toLowerCase() === activeLocation.toLowerCase() || activeLocation === '');
        results = [...filteredLocals, ...results];
      }

      if (append) {
        setProducts(prev => [...prev, ...results]);
      } else {
        setProducts(results);
      }

      setTotal(data.total + (currentSkip === 0 ? results.length - data.products.length : 0));
      setHasMore(data.skip + data.limit < data.total);
    } catch (e) {
      console.error(e);
      showToast('Error loading products list', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeQuery, activeCategory, activeLocation, limit, showToast]);

  // Refetch when search/category params update
  useEffect(() => {
    setSkip(0);
    fetchProducts(0, false);
  }, [fetchProducts]);

  // Load More Handler
  const handleLoadMore = () => {
    const nextSkip = skip + limit;
    setSkip(nextSkip);
    fetchProducts(nextSkip, true);
  };

  // Switch active categories
  const handleCategoryClick = (slug) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/?${params.toString()}`);
  };

  // Category Checkbox selector
  const handleSidebarCheckbox = (slug, checked) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/?${params.toString()}`);
  };

  const handlePriceApply = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    showToast('Price filters applied', 'info');
  };

  // Sort and Filter dynamic mapping
  let displayedProducts = [...products];

  // Price range filters
  if (minPrice !== '') {
    displayedProducts = displayedProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice !== '') {
    displayedProducts = displayedProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  // Sorting
  if (sortOrder === 'price-asc') {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'price-desc') {
    displayedProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="fade-in">
      {/* Hero Banner Grid */}
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Find Awesome Deals.<br />Sell What You Don't Need.</h1>
          <p>OLX makes buying and selling simple, secure, and instant.</p>
          <button 
            className="btn btn-secondary" 
            style={{ backgroundColor: 'white', borderColor: 'white' }}
            onClick={() => router.push('/')}
          >
            Explore Catalog
          </button>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600" 
          alt="Banner visual decor" 
          className="hero-decor" 
        />
      </div>

      {/* Category Icons Navigation Bubbles */}
      <div className="quick-categories">
        <h2 className="section-title">Browse Categories</h2>
        <div className="category-bubbles" id="category-bubbles-container">
          <button 
            className={`category-bubble ${activeCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            <div className="bubble-icon"><i className="fa-solid fa-border-all"></i></div>
            <div className="bubble-label">All Ads</div>
          </button>
          
          {categories.slice(0, 10).map((cat) => {
            const icon = CATEGORY_ICONS[cat.slug] || 'fa-solid fa-tags';
            return (
              <button
                key={cat.slug}
                className={`category-bubble ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                <div className="bubble-icon"><i className={icon}></i></div>
                <div className="bubble-label">{cat.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Catalog Container */}
      <div className="products-wrapper">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <div className="filter-title">Filters</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {activeQuery && <div>Search: <strong>"{activeQuery}"</strong></div>}
              {activeCategory && <div style={{ textTransform: 'capitalize' }}>Category: <strong>"{activeCategory.replace('-', ' ')}"</strong></div>}
              {activeLocation && <div>Location: <strong>{activeLocation}</strong></div>}
            </div>
          </div>

          {/* Price Range Filter Inputs */}
          <div className="filter-section">
            <div className="filter-title">Price Range</div>
            <div className="price-range-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                value={tempMinPrice}
                onChange={(e) => setTempMinPrice(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-primary btn-block" 
              onClick={handlePriceApply}
              style={{ marginTop: '12px', padding: '6px 12px', fontSize: '13px' }}
            >
              Apply Price
            </button>
          </div>

          {/* Browse Categories Sidebar list */}
          <div className="filter-section">
            <div className="filter-title">Browse Similar Categories</div>
            <div className="filter-list">
              {categories.map((cat) => (
                <label key={cat.slug} className="filter-item">
                  <input 
                    type="checkbox" 
                    checked={activeCategory === cat.slug}
                    onChange={(e) => handleSidebarCheckbox(cat.slug, e.target.checked)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid section */}
        <div className="products-container">
          <div className="results-info">
            <div className="results-count">
              {isLoading && displayedProducts.length === 0 
                ? 'Loading products...' 
                : `Showing ${displayedProducts.length} of ${total} ads`}
            </div>
            
            <div className="sort-select">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="default">Sort by: Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading && displayedProducts.length === 0 ? (
            <div className="products-grid">
              {Array(8).fill(null).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-body">
                    <div className="skeleton-text short"></div>
                    <div className="skeleton-text long"></div>
                    <div className="skeleton-text long"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <i className="fa-solid fa-folder-open" style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '12px' }}></i>
              <h4>No Products Found</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Try modifying search terms, adjusting prices, or clearing filters.</p>
            </div>
          ) : (
            <div className="products-grid">
              {displayedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Load More pagination button */}
          {hasMore && !isLoading && (
            <div className="load-more-container">
              <button className="btn btn-outline" onClick={handleLoadMore}>
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
