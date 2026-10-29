import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer>
    <div className="container footer-grid">
      <div>
        <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>ELARIX</h2>
        <p>Beauty begins with confidence.</p>
      </div>
      <div>
        <h3>Quick Links</h3>
        <ul style={{ listStyle: 'none', lineHeight: '2' }}>
          <li><Link to="/shop/makeup">Makeup</Link></li>
          <li><Link to="/shop/skincare">Skincare</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </div>
      <div>
        <h3>Legal</h3>
        <ul style={{ listStyle: 'none', lineHeight: '2' }}>
          <li><Link to="#">Privacy Policy</Link></li>
          <li><Link to="#">Terms & Conditions</Link></li>
        </ul>
      </div>
      <div>
        <h3>Newsletter</h3>
        <p style={{ marginBottom: '1rem' }}>Subscribe to get special offers and updates.</p>
        <div style={{ display: 'flex' }}>
          <input type="email" placeholder="Your email" className="form-control" style={{ borderRadius: '20px 0 0 20px', borderRight: 'none' }} />
          <button className="btn" style={{ borderRadius: '0 20px 20px 0' }}>Subscribe</button>
        </div>
      </div>
    </div>
    <div className="text-center" style={{ marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid #eee', fontSize: '0.9rem' }}>
      &copy; {new Date().getFullYear()} ELARIX. All rights reserved.
    </div>
  </footer>
);
export default Footer;
