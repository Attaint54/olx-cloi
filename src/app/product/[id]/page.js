'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OLX_API } from '../../../services/api';
import ProductCard from '../../../components/ProductCard';
import { useAppContext } from '../../../context/AppContext';

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const { showToast } = useAppContext();

  // Detail State variables
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Sync wishlist like status
  useEffect(() => {
    if (!product) return;
    const list = JSON.parse(localStorage.getItem('olx_wishlist') || '[]');
    setIsLiked(list.includes(String(product.id)));
  }, [product]);

  // Load single product details
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const detail = await OLX_API.getProductById(id);
      if (detail) {
        setProduct(detail);
        
        // Fetch related products
        const relData = await OLX_API.getProducts({
          category: detail.category,
          limit: 5 // Fetch slightly more to filter out current
        });
        const filtered = relData.products.filter(p => String(p.id) !== String(detail.id)).slice(0, 4);
        setRelatedProducts(filtered);
      } else {
        setProduct(null);
      }
      setLoading(false);
      // Reset image selector
      setActiveImageIdx(0);
      setPhoneRevealed(false);
    }
    loadData();
  }, [id]);

  const handleLikeToggle = () => {
    if (!product) return;
    let list = JSON.parse(localStorage.getItem('olx_wishlist') || '[]');
    const productIdStr = String(product.id);
    const index = list.indexOf(productIdStr);
    
    let liked = false;
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(productIdStr);
      liked = true;
    }

    localStorage.setItem('olx_wishlist', JSON.stringify(list));
    setIsLiked(liked);
    
    if (liked) {
      showToast('Item added to wishlist', 'success');
    } else {
      showToast('Item removed from wishlist', 'info');
    }
  };

  const handleChatTrigger = () => {
    if (!product) return;
    alert(`Simulating chat launch with ${product.seller.name}. Opening secure OLX Messenger...`);
  };

  const handlePhoneReveal = () => {
    setPhoneRevealed(true);
    showToast('Seller phone number revealed', 'info');
  };

  if (loading) {
    return (
      <div className="product-details-container" style={{ opacity: 0.6 }}>
        <div className="product-main-column">
          <div className="product-gallery-card" style={{ height: '400px', backgroundColor: '#f7f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary-brand)' }}></i>
          </div>
        </div>
        <div className="product-sidebar-column">
          <div className="price-card" style={{ height: '180px', backgroundColor: 'white' }}></div>
          <div className="seller-card" style={{ height: '160px', backgroundColor: 'white' }}></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '48px', color: 'var(--error-color)', marginBottom: '16px' }}></i>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The product details you are trying to view are no longer available or the link is broken.</p>
        <button className="btn btn-primary" onClick={() => router.push('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="product-details-container">
        {/* Left Column: Images, Specs, Description */}
        <div className="product-main-column">
          {/* Gallery View */}
          <div className="product-gallery-card">
            <div className="gallery-stage">
              <img src={product.images[activeImageIdx]} alt={product.title} />
              
              {product.images.length > 1 && (
                <>
                  <button 
                    className="gallery-prev" 
                    onClick={() => setActiveImageIdx(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                    aria-label="Previous image"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button 
                    className="gallery-next" 
                    onClick={() => setActiveImageIdx(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                    aria-label="Next image"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.images.length > 1 && (
              <div className="gallery-thumbs">
                {product.images.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`${product.title} Thumbnail ${idx + 1}`} 
                    className={`gallery-thumb ${idx === activeImageIdx ? 'active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Specifications Card */}
          <div className="details-card">
            <h3>Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Brand</span>
                <span className="spec-value">{product.brand}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Category</span>
                <span className="spec-value" style={{ textTransform: 'capitalize' }}>
                  {product.category.replace('-', ' ')}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Rating</span>
                <span className="spec-value">
                  <i className="fa-solid fa-star" style={{ color: '#ffc107' }}></i> {product.rating}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Stock Status</span>
                <span className="spec-value">
                  {product.stock > 0 ? `${product.stock} items left` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <h3>Description</h3>
            <div className="product-description-text">
              {product.description}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Seller Info, Map */}
        <div className="product-sidebar-column">
          {/* Price Box */}
          <div className="price-card">
            <div className="price-row">
              <span className="price">${product.price.toLocaleString()}</span>
              <div className="actions-row-icons">
                <button 
                  className="btn-circle" 
                  onClick={handleLikeToggle}
                  aria-label="Save to wishlist"
                  style={{ backgroundColor: '#f2f4f6', color: isLiked ? '#ff4d4f' : 'var(--primary-brand)', cursor: 'pointer' }}
                >
                  <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                </button>
              </div>
            </div>
            
            <div className="title">{product.title}</div>
            
            <div className="location-date-footer">
              <span><i className="fa-solid fa-location-dot"></i> {product.location}</span>
              <span>{product.date}</span>
            </div>
          </div>

          {/* Seller Card */}
          <div className="seller-card">
            <div className="seller-profile-row">
              <div className="seller-avatar">
                {product.seller.name.charAt(0).toUpperCase()}
              </div>
              <div className="seller-info">
                <h4>{product.seller.name}</h4>
                <p>Member since {product.seller.joined}</p>
              </div>
            </div>
            
            <div className="seller-actions">
              <button className="btn btn-primary btn-block" onClick={handleChatTrigger}>
                <i className="fa-regular fa-comment-dots"></i> Chat with Seller
              </button>
              
              <div 
                className="phone-wrapper" 
                onClick={!phoneRevealed ? handlePhoneReveal : undefined}
                style={{ cursor: !phoneRevealed ? 'pointer' : 'default', backgroundColor: phoneRevealed ? '#ebeeef' : '' }}
              >
                <i className="fa-solid fa-phone"></i>
                <span>{phoneRevealed ? product.seller.phone : 'Show Phone Number'}</span>
              </div>
            </div>
          </div>

          {/* Static Map View */}
          <div className="seller-map-card">
            <h5 style={{ marginBottom: '12px', fontWeight: 700 }}>Posted in</h5>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <i className="fa-solid fa-location-dot"></i> {product.location}
            </p>
            <div className="map-placeholder">
              <i className="fa-solid fa-location-crosshairs"></i>
              <span>Map Listing View</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Items Section */}
      {relatedProducts.length > 0 && (
        <div className="related-items-section">
          <h3 className="section-title">Related Items</h3>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
