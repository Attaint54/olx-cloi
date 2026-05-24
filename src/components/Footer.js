import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="main-footer">
      <div className="footer-top">
        <div className="footer-column">
          <h5>Popular Categories</h5>
          <ul>
            <li><Link href="/?category=smartphones">Smartphones</Link></li>
            <li><Link href="/?category=laptops">Laptops</Link></li>
            <li><Link href="/?category=automotive">Cars & Automotive</Link></li>
            <li><Link href="/?category=furniture">Furniture</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h5>Trending Searches</h5>
          <ul>
            <li><Link href="/?query=iphone">iPhone</Link></li>
            <li><Link href="/?query=macbook">Macbook</Link></li>
            <li><Link href="/?query=perfume">Perfumes</Link></li>
            <li><Link href="/?query=table">Table</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h5>About Us</h5>
          <ul>
            <li><Link href="/">About Dubizzle Group</Link></li>
            <li><Link href="/">OLX Blog</Link></li>
            <li><Link href="/">Contact Us</Link></li>
            <li><Link href="/">OLX for Businesses</Link></li>
          </ul>
        </div>
        <div className="footer-column">
          <h5>OLX</h5>
          <ul>
            <li><Link href="/">Help & Support</Link></li>
            <li><Link href="/">Sitemap</Link></li>
            <li><Link href="/">Legal & Privacy info</Link></li>
            <li><Link href="/">Terms of use</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <span>Free Classifieds in Pakistan. © 2006-2026 OLX</span>
          <span>Designed with <i className="fa-solid fa-heart" style={{ color: '#ff4d4f' }}></i> using Premium Next.js & Axios Stack</span>
        </div>
      </div>
    </footer>
  );
}
