import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard, AlertCircle, ShoppingBag, ArrowRight, Lock } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [paymentConfig, setPaymentConfig] = useState({ stripeConfigured: false, supportedMethods: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch payment configuration on mount
  useEffect(() => {
    api.get('/api/payment/config')
      .then(({ data }) => setPaymentConfig(data))
      .catch((err) => console.warn('Could not load payment configuration:', err));
  }, []);

  // Update default name if user loads late
  useEffect(() => {
    if (user?.name && !address.name) {
      setAddress(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Subtotal and shipping calculations
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 1) * (Number(item.price) || 0), 0);
  const shippingFee = itemsSubtotal >= 500 ? 0 : 50;
  const orderTotal = itemsSubtotal + shippingFee;

  const handleInputChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!address.name.trim()) return 'Please enter recipient name';
    const cleanPhone = address.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) return 'Please enter a valid 10-digit contact phone number';
    if (!address.addressLine.trim()) return 'Please enter complete delivery address';
    if (!address.city.trim()) return 'Please enter your city';
    if (!address.state.trim()) return 'Please enter your state';
    if (!address.postalCode.trim()) return 'Please enter your PIN / Postal code';
    return null;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        orderItems: cartItems.map(item => ({
          product: item.id,
          qty: Number(item.qty) || 1,
        })),
        shippingAddress: address,
        paymentMethod: paymentMethod,
      };

      const { data: createdOrder } = await api.post('/api/orders', payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Clear the cart atomically after order is created
      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${createdOrder.id}`);
    } catch (err) {
      console.error('Order creation failed:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If user is not authenticated, display login requirement screen
  if (!user) {
    return (
      <div className="container my-2" style={{ maxWidth: '560px', margin: '4rem auto', textAlign: 'center', background: '#fff', padding: '3.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem', color: 'var(--text-dark)' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Please sign in to your ELARIX account or register to complete your secure order and track your beauty deliveries.
        </p>
        <Link to="/login?redirect=/checkout" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2rem' }}>
          Sign In to Checkout <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="container my-2" style={{ maxWidth: '560px', margin: '4rem auto', textAlign: 'center', background: '#fff', padding: '3.5rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
          <ShoppingBag size={32} />
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Your Bag is Empty</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
          There are currently no items in your shopping bag. Discover our makeup and skincare collections to begin.
        </p>
        <Link to="/shop/makeup" className="btn">Discover Collection</Link>
      </div>
    );
  }

  return (
    <div className="container my-2">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Secure Checkout</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
          Complete your delivery information and select your payment method
        </p>
      </div>

      {error && (
        <div 
          style={{ 
            backgroundColor: '#fff0ee', 
            color: 'var(--error)', 
            border: '1px solid #ffcdd2', 
            borderRadius: '10px', 
            padding: '1rem 1.25rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }} 
          role="alert"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submitHandler} noValidate>
        <div className="flex gap-1" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Left Column: Delivery and Payment Info */}
          <div style={{ flex: '1 1 560px' }}>
            {/* Delivery Address Card */}
            <div 
              style={{ 
                background: 'var(--white)', 
                borderRadius: '16px', 
                padding: '2rem', 
                boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                border: '1px solid #f2ece4',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f7f3ed', paddingBottom: '0.75rem' }}>
                <Truck size={22} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Shipping Address</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="checkout-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Recipient Full Name *
                  </label>
                  <input 
                    id="checkout-name"
                    type="text" 
                    placeholder="e.g. Maya Sharma" 
                    className="form-control" 
                    value={address.name} 
                    onChange={e => handleInputChange('name', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="checkout-phone" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Contact Phone Number *
                  </label>
                  <input 
                    id="checkout-phone"
                    type="tel" 
                    placeholder="10-digit mobile number" 
                    className="form-control" 
                    value={address.phone} 
                    onChange={e => handleInputChange('phone', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
                <label htmlFor="checkout-address" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Street Address & Apartment *
                </label>
                <input 
                  id="checkout-address"
                  type="text" 
                  placeholder="House/Flat number, Building name, Street" 
                  className="form-control" 
                  value={address.addressLine} 
                  onChange={e => handleInputChange('addressLine', e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="checkout-city" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    City *
                  </label>
                  <input 
                    id="checkout-city"
                    type="text" 
                    placeholder="e.g. Mumbai" 
                    className="form-control" 
                    value={address.city} 
                    onChange={e => handleInputChange('city', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="checkout-state" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    State *
                  </label>
                  <input 
                    id="checkout-state"
                    type="text" 
                    placeholder="e.g. Maharashtra" 
                    className="form-control" 
                    value={address.state} 
                    onChange={e => handleInputChange('state', e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="checkout-postal" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    PIN / Postal Code *
                  </label>
                  <input 
                    id="checkout-postal"
                    type="text" 
                    placeholder="e.g. 400001" 
                    className="form-control" 
                    value={address.postalCode} 
                    onChange={e => handleInputChange('postalCode', e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div 
              style={{ 
                background: 'var(--white)', 
                borderRadius: '16px', 
                padding: '2rem', 
                boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                border: '1px solid #f2ece4'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid #f7f3ed', paddingBottom: '0.75rem' }}>
                <CreditCard size={22} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Payment Method</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Option 1: Cash on Delivery (Always Active & Safe) */}
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '1rem', 
                    padding: '1.25rem', 
                    borderRadius: '12px', 
                    border: paymentMethod === 'Cash on Delivery' ? '2px solid var(--primary)' : '1px solid #e5dfd7',
                    background: paymentMethod === 'Cash on Delivery' ? '#fcf9f5' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    style={{ marginTop: '0.25rem', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-dark)', display: 'block' }}>
                      Cash on Delivery (Pay upon delivery)
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>
                      Pay with cash or card upon delivery to your doorstep. No advance payment required.
                    </span>
                  </div>
                </label>

                {/* Option 2: Online Card Payment via Stripe */}
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '1rem', 
                    padding: '1.25rem', 
                    borderRadius: '12px', 
                    border: paymentMethod === 'Stripe' ? '2px solid var(--primary)' : '1px solid #e5dfd7',
                    background: paymentConfig.stripeConfigured ? (paymentMethod === 'Stripe' ? '#fcf9f5' : '#fff') : '#fafafa',
                    cursor: paymentConfig.stripeConfigured ? 'pointer' : 'not-allowed',
                    opacity: paymentConfig.stripeConfigured ? 1 : 0.8,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="Stripe"
                    checked={paymentMethod === 'Stripe'}
                    disabled={!paymentConfig.stripeConfigured}
                    onChange={() => setPaymentMethod('Stripe')}
                    style={{ marginTop: '0.25rem', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-dark)' }}>
                        Credit / Debit Card (Stripe Test Mode)
                      </span>
                      {!paymentConfig.stripeConfigured && (
                        <span style={{ fontSize: '0.75rem', background: '#f5f5f5', color: '#888', border: '1px solid #ddd', padding: '2px 8px', borderRadius: '10px' }}>
                          Setup Required
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>
                      {paymentConfig.stripeConfigured 
                        ? 'Instant, encrypted payment processing with Stripe.' 
                        : 'Configure STRIPE_SECRET_KEY in backend .env to enable card payments. Cash on Delivery is currently active.'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div style={{ flex: '1 1 360px', position: 'sticky', top: '100px' }}>
            <div 
              style={{ 
                backgroundColor: '#fff', 
                padding: '2rem', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #f2ece4'
              }}
            >
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', borderBottom: '1px solid #f7f3ed', paddingBottom: '0.75rem' }}>
                Order Summary
              </h2>

              {/* Items List */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={item.image || '/placeholder-product.svg'} 
                        alt={item.name} 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #f0eae1' }}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0, color: 'var(--text-dark)', maxWidth: '170px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0 }}>
                          Qty: {item.qty} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      ₹{(item.qty * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <div className="flex justify-between" style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-light)' }}>
                  <span>Items Subtotal</span>
                  <span style={{ color: 'var(--text-dark)' }}>₹{itemsSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between" style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-light)' }}>
                  <span>Standard Shipping</span>
                  <span style={{ color: shippingFee === 0 ? '#2e7d32' : 'var(--text-dark)', fontWeight: shippingFee === 0 ? 600 : 400 }}>
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontStyle: 'italic', margin: '0.25rem 0 0.5rem' }}>
                    Add ₹{(500 - itemsSubtotal).toFixed(2)} more to qualify for Free Shipping!
                  </p>
                )}

                <div className="flex justify-between" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', fontWeight: 'bold', fontSize: '1.25rem' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--primary)' }}>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: submitting ? 0.75 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                disabled={submitting}
              >
                <ShieldCheck size={20} />
                {submitting ? 'Placing Order...' : `Place Order • ₹${orderTotal.toFixed(2)}`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                <ShieldCheck size={14} color="var(--primary)" />
                <span>SSL Encrypted & Safe Order Placement</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
