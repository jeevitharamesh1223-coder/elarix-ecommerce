import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { wishlistItems, addMultipleToCart } = useContext(CartContext);
  const [feedback, setFeedback] = useState('');

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) return;
    addMultipleToCart(wishlistItems);
    setFeedback('All saved items have been added to your cart!');
    setTimeout(() => setFeedback(''), 3500);
  };

  return (
    <div className="container my-2">
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>My Wishlist</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="flex gap-1" style={{ alignItems: 'center' }}>
            <button 
              className="btn" 
              onClick={handleAddAllToCart}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}
            >
              <ShoppingBag size={18} /> Add All to Cart
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <div 
          style={{ 
            backgroundColor: '#e9f5ed', 
            color: '#2e7d32', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            border: '1px solid #c8e6c9'
          }}
        >
          <Check size={18} /> {feedback}
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--white)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Heart size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-light)', maxWidth: '450px', margin: '0 auto 2rem' }}>
            Explore our curated makeup and skincare collections and click the heart icon to save your favorite products right here.
          </p>
          <div className="flex" style={{ justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/shop/makeup" className="btn">Shop Makeup</Link>
            <Link to="/shop/skincare" className="btn btn-outline">Explore Skincare</Link>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistItems.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
