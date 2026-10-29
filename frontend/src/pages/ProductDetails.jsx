import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { CartContext } from '../context/CartContext';
import { Heart } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistItems } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const isWishlisted = Boolean(wishlistItems && product && wishlistItems.some(x => x.id === product.id));

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/api/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || 'Product not found or failed to load.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container my-2" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Loading product details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container my-2" style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '12px', maxWidth: '600px', margin: '3rem auto' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-light)', margin: '1rem 0 2rem' }}>{error || "The product you're looking for doesn't exist or is currently unavailable."}</p>
        <button className="btn" onClick={() => navigate('/shop/makeup')}>Back to Shop</button>
      </div>
    );
  }

  return (
    <div className="container my-2 flex gap-1" style={{ flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 400px' }}>
        <img 
          src={product.image || '/placeholder-product.svg'} 
          alt={product.name} 
          style={{ width: '100%', borderRadius: '12px' }} 
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
        />
      </div>
      <div style={{ flex: '1 1 500px', padding: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{product.name}</h1>
        <p style={{ color: '#888', marginBottom: '1rem' }}>{product.rating} ★ ({product.numReviews} reviews)</p>
        <h2 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '1rem' }}>₹{Number(product.price).toFixed(2)}</h2>

        {/* Stock Status Badge */}
        <div style={{ marginBottom: '1.25rem' }}>
          {(product.countInStock !== undefined && product.countInStock <= 0) ? (
            <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              Currently Out of Stock
            </span>
          ) : (product.countInStock !== undefined && product.countInStock <= 5) ? (
            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              Only {product.countInStock} left in stock - order soon!
            </span>
          ) : (
            <span style={{ backgroundColor: '#e9f5ed', color: '#2e7d32', border: '1px solid #c8e6c9', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              In Stock & Ready to Ship
            </span>
          )}
        </div>

        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{product.description}</p>
        <div style={{ marginBottom: '1rem' }}><strong>Suitable for:</strong> {product.skinType || 'All skin types'}</div>

        {product.countInStock !== undefined && product.countInStock > 0 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
            <label>Quantity:</label>
            <select 
              value={qty} 
              onChange={e => setQty(Number(e.target.value))} 
              className="form-control" 
              style={{ width: '80px' }}
            >
              {[...Array(Math.min(5, product.countInStock || 5)).keys()].map(x => (
                <option key={x + 1} value={x + 1}>{x + 1}</option>
              ))}
            </select>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn btn-outline" 
            style={{ flex: 1 }} 
            onClick={() => addToCart(product, qty)}
            disabled={product.countInStock !== undefined && product.countInStock <= 0}
          >
            {product.countInStock !== undefined && product.countInStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button 
            className="btn" 
            style={{ flex: 1 }} 
            onClick={() => { addToCart(product, qty); navigate('/cart'); }}
            disabled={product.countInStock !== undefined && product.countInStock <= 0}
          >
            Buy Now
          </button>
          <button 
            type="button"
            className="btn btn-outline"
            onClick={() => toggleWishlist(product)}
            style={{ 
              padding: '0.8rem 1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderColor: isWishlisted ? 'var(--error)' : 'var(--primary)',
              color: isWishlisted ? 'var(--error)' : 'var(--primary)',
              transition: 'all 0.2s ease',
            }}
            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          >
            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Benefits</h3>
          <p style={{ padding: '1rem 0' }}>{product.benefits}</p>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Ingredients</h3>
          <p style={{ padding: '1rem 0' }}>{product.ingredients}</p>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>How to Use</h3>
          <p style={{ padding: '1rem 0' }}>{product.howToUse}</p>
        </div>
      </div>
    </div>
  );
};
export default ProductDetails;
