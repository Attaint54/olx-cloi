'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { showToast } = useAppContext();
  const [isLiked, setIsLiked] = useState(false);

  // Sync wishlist status with localStorage
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('olx_wishlist') || '[]');
    setIsLiked(list.includes(String(product.id)));
  }, [product.id]);

  const handleLikeToggle = (e) => {
    e.stopPropagation();
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

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  // Add dummy features (e.g. Featured tag on id multiples of 3)
  const isFeatured = (typeof product.id === 'number' && product.id % 3 === 0);

  return (
    <div className="product-card" onClick={handleCardClick}>
      {isFeatured && <div className="product-card-featured-badge">Featured</div>}
      
      <button 
        className={`like-btn ${isLiked ? 'liked' : ''}`} 
        onClick={handleLikeToggle}
        aria-label="Add to wishlist"
      >
        <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
      </button>

      <div className="product-card-img">
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
      </div>

      <div className="product-card-body">
        <div className="product-card-price">${product.price.toLocaleString()}</div>
        <div className="product-card-title">{product.title}</div>
        <div className="product-card-footer">
          <span className="product-card-location">
            <i className="fa-solid fa-location-dot"></i> {product.location}
          </span>
          <span className="product-card-date">{product.date}</span>
        </div>
      </div>
    </div>
  );
}
