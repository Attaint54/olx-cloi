'use client';

import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { OLX_API } from '../services/api';

export default function SellModal({ onProductAdded }) {
  const { sellModal, closeSellModal, showToast, user, incrementRefreshProducts } = useAppContext();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!sellModal.isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('description', desc);
      formData.append('location', location.trim() || 'New York, NY');
      formData.append('sellerName', user?.name || 'You (Private Seller)');
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await OLX_API.createProduct(formData);
      showToast('Product Listing Created Successfully!', 'success');
      
      // Reset Form State
      setTitle('');
      setPrice('');
      setCategory('');
      setImageFile(null);
      setImagePreview('');
      setLocation('');
      setDesc('');
      
      closeSellModal();
      
      incrementRefreshProducts();
    } catch (error) {
      console.error(error);
      showToast('Failed to create listing. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.classList.contains('modal-overlay') && closeSellModal()}>
      <div className="modal-content modal-large">
        <button className="close-modal-btn" aria-label="Close modal" onClick={closeSellModal}>
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <h2>Post Your Ad</h2>
        <p className="modal-subtitle">Fill in the details below to list your item for sale</p>

        <form id="sell-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="sell-title">Ad Title</label>
              <input 
                type="text" 
                id="sell-title" 
                placeholder="e.g. iPhone 15 Pro Max 256GB" 
                required 
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="char-counter">{title.length}/100</span>
            </div>

            <div className="form-grid-col-2">
              <div className="form-group">
                <label htmlFor="sell-price">Price ($)</label>
                <input 
                  type="number" 
                  id="sell-price" 
                  placeholder="e.g. 999" 
                  required 
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="sell-category">Category</label>
                <select 
                  id="sell-category" 
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>Select category</option>
                  <option value="smartphones">Smartphones</option>
                  <option value="laptops">Laptops</option>
                  <option value="fragrances">Fragrances</option>
                  <option value="skincare">Skincare</option>
                  <option value="groceries">Groceries</option>
                  <option value="home-decoration">Home Decoration</option>
                  <option value="furniture">Furniture</option>
                  <option value="womens-dresses">Womens Dresses</option>
                  <option value="womens-shoes">Womens Shoes</option>
                  <option value="mens-shirts">Mens Shirts</option>
                  <option value="mens-shoes">Mens Shoes</option>
                  <option value="automotive">Automotive</option>
                  <option value="motorcycle">Motorcycles</option>
                  <option value="lighting">Lighting</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sell-image">Product Image</label>
              <input 
                type="file" 
                id="sell-image" 
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
              {imagePreview && (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button type="button" className="image-preview-remove" onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}>
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="sell-location">Location</label>
              <div className="input-icon-wrapper">
                <i className="fa-solid fa-location-dot"></i>
                <input 
                  type="text" 
                  id="sell-location" 
                  placeholder="e.g. New York, NY" 
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sell-desc">Description</label>
              <textarea 
                id="sell-desc" 
                placeholder="Describe the item you are selling (condition, features, etc.)" 
                required 
                rows={5} 
                maxLength={1000}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <span className="char-counter">{desc.length}/1000</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeSellModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
