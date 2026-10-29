import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, wishlistItems } = useContext(CartContext);
  const isWishlisted = Boolean(wishlistItems && wishlistItems.find(x => x.id === product.id));
  const isOutOfStock = product.countInStock !== undefined && product.countInStock <= 0;
  const isLowStock = product.countInStock !== undefined && product.countInStock > 0 && product.countInStock <= 5;

  return (
    <div className="product-card">
      <button 
        type="button"
        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} 
        onClick={() => toggleWishlist(product)}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-label="Wishlist"
      >
        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>

      <Link to={`/product/${product.id}`} style={{ position: 'relative', display: 'block' }}>
        <img 
          src={product.image || '/placeholder-product.svg'} 
          alt={product.name} 
          className="product-image" 
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
        />
        {isOutOfStock && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#333', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="product-info">
        <h3 className="product-title" title={product.name}>{product.name}</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="product-price" style={{ margin: 0 }}>₹{product.price}</span>
          {isLowStock && (
            <span style={{ fontSize: '0.75rem', color: '#d32f2f', fontWeight: 600 }}>
              Only {product.countInStock} left!
            </span>
          )}
        </div>

        <button 
          type="button"
          className="btn btn-outline" 
          style={{ 
            padding: '0.5rem', 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '0.5rem',
            opacity: isOutOfStock ? 0.5 : 1,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer'
          }} 
          onClick={() => !isOutOfStock && addToCart(product, 1)}
          disabled={isOutOfStock}
        >
          <ShoppingBag size={18} /> {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
