import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Calendar, Clock, MapPin, CreditCard, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';

const statusBadgeStyles = {
  Pending: { bg: '#fff4e5', text: '#b76e00', border: '#ffe2b8' },
  Processing: { bg: '#e8f4fd', text: '#1976d2', border: '#bbdefb' },
  Shipped: { bg: '#f3e8fd', text: '#7b1fa2', border: '#e1bee7' },
  Delivered: { bg: '#e8f8f0', text: '#2e7d32', border: '#c8e6c9' },
  Cancelled: { bg: '#fdeeed', text: '#d32f2f', border: '#ffcdd2' },
};

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await api.get('/api/orders/myorders', config);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError(err.response?.data?.message || 'Unable to retrieve your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container my-2">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>My Orders</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
          Track and review your previous ELARIX beauty purchases
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--secondary)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Loading your orders...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: '#fff0ee', border: '1px solid #ffcdd2', borderRadius: '12px', padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <AlertCircle size={36} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Failed to Load Orders</h3>
          <p style={{ color: '#555', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} className="btn">
            Retry Loading
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--white)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Package size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>No Orders Yet</h2>
          <p style={{ color: 'var(--text-light)', maxWidth: '420px', margin: '0 auto 2rem' }}>
            You haven't placed any orders yet. Discover our latest makeup and skincare products to give your daily routine a radiant glow.
          </p>
          <div className="flex" style={{ justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/shop/makeup" className="btn">Shop Makeup</Link>
            <Link to="/shop/skincare" className="btn btn-outline">Explore Skincare</Link>
          </div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => {
            const badge = statusBadgeStyles[order.status] || statusBadgeStyles.Pending;
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div 
                key={order.id} 
                style={{ 
                  background: 'var(--white)', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 18px rgba(0,0,0,0.04)', 
                  border: '1px solid #f2ece4',
                  overflow: 'hidden' 
                }}
              >
                {/* Order Card Header */}
                <div 
                  style={{ 
                    padding: '1.25rem 1.75rem', 
                    background: '#fcfaf7', 
                    borderBottom: '1px solid #f0eae1', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '1rem' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>
                        Order Placed
                      </span>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                        {dateStr}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>
                        Order ID
                      </span>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        #ELX-{order.id.toString().padStart(4, '0')}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>
                        Total Amount
                      </span>
                      <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                        ₹{Number(order.totalPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span 
                      style={{ 
                        backgroundColor: badge.bg, 
                        color: badge.text, 
                        border: `1px solid ${badge.border}`, 
                        padding: '0.35rem 0.9rem', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem', 
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Clock size={14} /> {order.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Order Items List */}
                <div style={{ padding: '1.5rem 1.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {order.OrderItems && order.OrderItems.map((item) => {
                      const prodName = item.Product?.name || `Product #${item.ProductId || item.id}`;
                      const prodImage = item.Product?.image || '/placeholder-product.svg';

                      return (
                        <div 
                          key={item.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            paddingBottom: '1rem', 
                            borderBottom: '1px solid #f7f3ed',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <img 
                              src={prodImage} 
                              alt={prodName} 
                              style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #eee' }} 
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
                            />
                            <div>
                              <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                                {item.ProductId ? (
                                  <Link to={`/product/${item.ProductId}`} style={{ color: 'inherit' }}>
                                    {prodName}
                                  </Link>
                                ) : prodName}
                              </h4>
                              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                Qty: {item.quantity} &times; ₹{Number(item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer Details (Shipping & Payment) */}
                  <div 
                    style={{ 
                      marginTop: '1.5rem', 
                      paddingTop: '1rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      flexWrap: 'wrap', 
                      gap: '1.5rem',
                      fontSize: '0.9rem',
                      color: 'var(--text-light)'
                    }}
                  >
                    <div style={{ maxWidth: '380px' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                        <MapPin size={16} color="var(--primary)" /> Delivery Address:
                      </p>
                      <p style={{ margin: 0 }}>
                        {order.shippingAddress?.name && `${order.shippingAddress.name}, `}
                        {order.shippingAddress?.addressLine && `${order.shippingAddress.addressLine}, `}
                        {order.shippingAddress?.city && `${order.shippingAddress.city}, `}
                        {order.shippingAddress?.state && `${order.shippingAddress.state} - `}
                        {order.shippingAddress?.postalCode || order.shippingAddress?.pincode}
                      </p>
                      {order.shippingAddress?.phone && (
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>Phone: {order.shippingAddress.phone}</p>
                      )}
                    </div>

                    <div>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                        <CreditCard size={16} color="var(--primary)" /> Payment:
                      </p>
                      <p style={{ margin: 0 }}>
                        {order.paymentMethod || 'Cash on Delivery'}{' '}
                        &bull;{' '}
                        <span style={{ color: order.isPaid ? '#2e7d32' : '#b25e00', fontWeight: 600 }}>
                          {order.isPaid ? 'Paid' : 'Unpaid (COD)'}
                        </span>
                      </p>
                      <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.8rem', color: order.isPaid ? '#2e7d32' : '#b76e00' }}>
                        {order.isPaid ? 'Payment Confirmed' : 'Payment on Delivery'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
