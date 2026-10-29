import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Clock, MapPin, CreditCard, ShoppingBag, AlertCircle } from 'lucide-react';
import api from '../api/client';
import { AuthContext } from '../context/AuthContext';

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/order-confirmation/${id}`);
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(err.response?.data?.message || 'Unable to retrieve order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="container my-2" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div 
          style={{ 
            display: 'inline-block', 
            width: '45px', 
            height: '45px', 
            border: '3px solid var(--secondary)', 
            borderTopColor: 'var(--primary)', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite' 
          }} 
        />
        <p style={{ marginTop: '1.25rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
          Finalizing your ELARIX order details...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container my-2" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', background: '#fff', padding: '3rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-dark)' }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>{error || "We couldn't locate this order in your account."}</p>
        <Link to="/orders" className="btn">View My Orders</Link>
      </div>
    );
  }

  const shipping = order.shippingAddress || {};
  const orderNumber = `#ELX-${order.id.toString().padStart(4, '0')}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container my-2" style={{ maxWidth: '900px' }}>
      {/* Success Hero Card */}
      <div 
        style={{ 
          background: 'var(--white)', 
          borderRadius: '20px', 
          padding: '3rem 2rem', 
          textAlign: 'center', 
          boxShadow: '0 4px 25px rgba(0,0,0,0.05)',
          border: '1px solid #f2ece4',
          marginBottom: '2rem'
        }}
      >
        <div 
          style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '50%', 
            background: 'var(--secondary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            color: 'var(--primary)'
          }}
        >
          <CheckCircle2 size={42} />
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
          Thank You for Your Order!
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          Your luxury beauty package is being prepared with utmost care. A confirmation has been registered for your account.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#fcfaf7', padding: '0.6rem 1.5rem', borderRadius: '30px', border: '1px solid #f0eae1' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Order ID:
          </span>
          <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.05rem' }}>
            {orderNumber}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Shipping Details Card */}
        <div 
          style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '1.75rem', 
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
            border: '1px solid #f2ece4'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <MapPin size={22} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Delivery Destination</h3>
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: '1.6' }}>
            <p style={{ fontWeight: 600 }}>{shipping.name}</p>
            <p>{shipping.addressLine}</p>
            <p>{shipping.city}, {shipping.state} - {shipping.postalCode}</p>
            <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>Phone: {shipping.phone}</p>
          </div>
        </div>

        {/* Payment & Status Card */}
        <div 
          style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '1.75rem', 
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
            border: '1px solid #f2ece4'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <CreditCard size={22} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-dark)' }}>Payment & Status</h3>
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: '1.8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Payment Method:</span>
              <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)' }}>Payment Status:</span>
              <span 
                style={{ 
                  fontWeight: 600, 
                  color: order.isPaid ? '#2e7d32' : '#b25e00',
                  background: order.isPaid ? '#e9f5ed' : '#fff4e5',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}
              >
                {order.isPaid ? 'Paid' : 'Pending on Delivery'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)' }}>Order Status:</span>
              <span 
                style={{ 
                  fontWeight: 600, 
                  color: 'var(--primary)',
                  background: 'var(--secondary)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Clock size={12} /> {order.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Placed on:</span>
              <span>{orderDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Breakdown */}
      <div 
        style={{ 
          background: 'var(--white)', 
          borderRadius: '16px', 
          padding: '2rem', 
          boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
          border: '1px solid #f2ece4',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f7f3ed', paddingBottom: '1rem' }}>
          <Package size={22} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Ordered Items ({order.OrderItems?.length || 0})</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {order.OrderItems && order.OrderItems.map((item) => {
            const itemName = item.name || item.Product?.name || `Product #${item.ProductId || item.id}`;
            const itemImage = item.image || item.Product?.image || '/placeholder-product.svg';

            return (
              <div 
                key={item.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  paddingBottom: '1rem', 
                  borderBottom: '1px solid #faf7f2',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <img 
                    src={itemImage} 
                    alt={itemName} 
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #f0eae1' }}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
                  />
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', color: 'var(--text-dark)' }}>{itemName}</h4>
                    <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                  ₹{(Number(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cost Summary Breakdown */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', maxWidth: '360px', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-light)' }}>
            <span>Items Subtotal:</span>
            <span style={{ color: 'var(--text-dark)' }}>
              ₹{Number(order.itemsPrice || (order.totalPrice - (order.shippingFee || 0))).toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-light)' }}>
            <span>Shipping:</span>
            <span style={{ color: order.shippingFee === 0 ? '#2e7d32' : 'var(--text-dark)', fontWeight: order.shippingFee === 0 ? 600 : 400 }}>
              {order.shippingFee === 0 ? 'FREE' : `₹${Number(order.shippingFee).toFixed(2)}`}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid #f0eae1', fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>
            <span>Total Amount:</span>
            <span>₹{Number(order.totalPrice).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/orders" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={18} /> View My Orders
        </Link>
        <Link to="/shop/makeup" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
