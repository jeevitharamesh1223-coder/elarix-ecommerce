import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api.get('/api/products')
      .then(({ data }) => setProducts(Array.isArray(data) ? data : (data?.products || [])))
      .catch(console.error);
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>Your Beauty. Your Glow. Your Style.</h1>
        <p>Discover makeup and skincare essentials designed to make every day your glow day.</p>
        <div className="hero-btns">
          <Link to="/shop/makeup" className="btn">Shop Makeup</Link>
          <Link to="/shop/skincare" className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'transparent' }}>Explore Skincare</Link>
        </div>
      </section>

      <section className="container my-2">
        <h2 className="text-center" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Featured Products</h2>
        <div className="product-grid">
          {products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
      
      <section style={{ backgroundColor: '#fff', padding: '4rem 0' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Why Choose ELARIX</h2>
          <div className="flex" style={{ justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <div style={{ maxWidth: '250px' }}>
              <h3 style={{ color: 'var(--primary)' }}>Cruelty Free</h3>
              <p>We love our furry friends. Our products are 100% cruelty-free.</p>
            </div>
            <div style={{ maxWidth: '250px' }}>
              <h3 style={{ color: 'var(--primary)' }}>Premium Quality</h3>
              <p>Crafted with the best ingredients for your beautiful skin.</p>
            </div>
            <div style={{ maxWidth: '250px' }}>
              <h3 style={{ color: 'var(--primary)' }}>Inclusive Beauty</h3>
              <p>Designed for all skin types and tones. Everyone deserves to glow.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
