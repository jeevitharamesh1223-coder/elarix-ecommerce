import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const CartPage = () => {
  const { cartItems, removeFromCart, updateCartQty } = useContext(CartContext);
  const navigate = useNavigate();
  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    <div className="container my-2">
      <h1>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div style={{ padding: '3rem 0' }}><p>Your cart is empty.</p><Link to="/" className="btn" style={{ display: 'inline-block', marginTop: '1rem' }}>Continue Shopping</Link></div>
      ) : (
        <div className="flex gap-1" style={{ flexWrap: 'wrap', marginTop: '2rem' }}>
          <div style={{ flex: '1 1 600px' }}>
            {cartItems.map(item => {
              const maxStock = item.countInStock !== undefined ? item.countInStock : 50;
              const isOutOfStock = maxStock <= 0;
              const dropdownMax = Math.max(1, Math.min(10, maxStock));

              return (
                <div key={item.id} className="cart-item" style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
                  <div className="flex items-center gap-1">
                    <img 
                      src={item.image || '/placeholder-product.svg'} 
                      alt={item.name} 
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
                    />
                    <div>
                      <Link to={`/product/${item.id}`} style={{ fontWeight: 'bold' }}>{item.name}</Link>
                      <div style={{ color: 'var(--primary)', marginTop: '0.25rem' }}>₹{Number(item.price).toFixed(2)}</div>
                      {isOutOfStock ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 600 }}>Out of Stock</span>
                      ) : maxStock <= 5 ? (
                        <span style={{ fontSize: '0.8rem', color: '#b76e00', fontWeight: 500 }}>Only {maxStock} left in stock</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOutOfStock ? (
                      <span style={{ color: 'var(--error)', fontSize: '0.85rem' }}>Unavailable</span>
                    ) : (
                      <select 
                        value={item.qty} 
                        onChange={e => updateCartQty(item.id, e.target.value)} 
                        className="form-control" 
                        style={{ width: '64px', padding: '0.3rem' }}
                      >
                        {[...Array(dropdownMax).keys()].map(x => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </select>
                    )}
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.4rem' }}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', height: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f2ece4' }}>
            <h2>Order Summary</h2>
            <div className="flex justify-between" style={{ margin: '1rem 0', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
              <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: subtotal >= 500 ? '#2e7d32' : 'var(--text-light)', marginBottom: '1rem' }}>
              {subtotal >= 500 ? '✓ Eligible for FREE standard delivery' : `Add ₹${(500 - subtotal).toFixed(2)} more for FREE delivery`}
            </div>
            <div className="flex justify-between" style={{ marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Estimated Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <button 
              className="btn" 
              style={{ width: '100%' }} 
              onClick={() => navigate('/checkout')}
              disabled={cartItems.some(i => (i.countInStock !== undefined && i.countInStock <= 0))}
            >
              {cartItems.some(i => (i.countInStock !== undefined && i.countInStock <= 0)) ? 'Remove Out of Stock Items' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default CartPage;
