'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OLX_API } from '../services/api';
import ProductCard from '../components/ProductCard';
import HeroBackground from '../components/HeroBackground';
import TiltCard from '../components/TiltCard';
import { useAppContext } from '../context/AppContext';

// FontAwesome icon maps for categories
const CATEGORY_ICONS = {
  smartphones: 'fa-solid fa-mobile-screen-button',
  laptops: 'fa-solid fa-laptop',
  fragrances: 'fa-solid fa-spray-can-sparkles',
  skincare: 'fa-solid fa-hand-holding-droplet',
  groceries: 'fa-solid fa-basket-shopping',
  'home-decoration': 'fa-solid fa-couch',
  furniture: 'fa-solid fa-chair',
  'womens-dresses': 'fa-solid fa-person-dress',
  'womens-shoes': 'fa-solid fa-shoe-prints',
  "mens-shirts": 'fa-solid fa-shirt',
  "mens-shoes": 'fa-solid fa-shoe-prints',
  automotive: 'fa-solid fa-car',
  motorcycle: 'fa-solid fa-motorcycle',
  lighting: 'fa-solid fa-lightbulb'
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, openSellModal, refreshProducts } = useAppContext();

  const activeCategory = searchParams.get('category') || '';
  const activeQuery = searchParams.get('query') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [limit] = useState(16);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [tempMinPrice, setTempMinPrice] = useState('');
  const [tempMaxPrice, setTempMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('default');

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const catList = await OLX_API.getCategories();
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (currentSkip, append = false) => {
    setIsLoading(true);
    try {
      const data = await OLX_API.getProducts({
        query: activeQuery,
        category: activeCategory,
        limit,
        skip: currentSkip
      });

      if (append) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }

      setTotal(data.total);
      setHasMore(currentSkip + limit < data.total);

    } catch (err) {
      console.error(err);
      showToast('Error loading products', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [activeQuery, activeCategory, limit, showToast, refreshProducts]);

  useEffect(() => {
    setSkip(0);
    fetchProducts(0, false);
  }, [fetchProducts, refreshProducts]);

  const handleLoadMore = () => {
    const next = skip + limit;
    setSkip(next);
    fetchProducts(next, true);
  };

  const handleCategoryClick = (slug) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('category', slug);
    else params.delete('category');
    router.push(`/?${params.toString()}`);
  };

  const handlePriceApply = () => {
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    showToast('Price filters applied', 'info');
  };

  let displayedProducts = [...products];

  if (minPrice) {
    displayedProducts = displayedProducts.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    displayedProducts = displayedProducts.filter(p => p.price <= Number(maxPrice));
  }

  if (sortOrder === 'price-asc') {
    displayedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'price-desc') {
    displayedProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <HeroBackground />
        <div className="hero-overlay" />
        <div className="hero-text">
          <h1>Find everything you need</h1>
          <p>Buy and sell cars, electronics, furniture, and more in your area.</p>
          <button className="btn btn-primary" onClick={openSellModal}>
            <i className="fa-solid fa-plus"></i> Start Selling
          </button>
        </div>
      </div>

      {/* Quick Categories */}
      {categories.length > 0 && (
        <div className="quick-categories">
          <div className="section-title">
            <span>Browse by Category</span>
          </div>
          <div className="category-bubbles">
            {categories.slice(0, 12).map(cat => (
              <button
                key={cat.slug}
                className={`category-bubble ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                <div className="bubble-icon">
                  <i className={CATEGORY_ICONS[cat.slug] || 'fa-solid fa-tag'}></i>
                </div>
                <span className="bubble-label">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="products-wrapper">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
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
            <button className="btn btn-primary btn-block" style={{ marginTop: '8px' }} onClick={handlePriceApply}>
              Apply
            </button>
          </div>

          {activeCategory && (
            <div className="filter-section">
              <div className="filter-title">Category</div>
              <div className="filter-list">
                <label className="filter-item">
                  <input
                    type="checkbox"
                    checked={!activeCategory}
                    onChange={() => handleCategoryClick('')}
                  />
                  All Categories
                </label>
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <div className="products-container">
          <div className="results-info">
            <span className="results-count">{total} results</span>
            <div className="sort-select">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading && products.length === 0 ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-text short" />
                    <div className="skeleton-text" />
                    <div className="skeleton-text long" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {displayedProducts.map(p => (
                <TiltCard key={p.id}>
                  <ProductCard product={p} />
                </TiltCard>
              ))}
            </div>
          )}

          {hasMore && !isLoading && (
            <div className="load-more-container">
              <button className="btn btn-secondary" onClick={handleLoadMore}>
                <i className="fa-solid fa-rotate"></i> Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}