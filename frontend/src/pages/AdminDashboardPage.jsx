import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Eye, 
  X, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';

const statusBadgeStyles = {
  Pending: { bg: '#fff4e5', text: '#b76e00', border: '#ffe2b8' },
  Processing: { bg: '#e8f4fd', text: '#1976d2', border: '#bbdefb' },
  Shipped: { bg: '#f3e8fd', text: '#7b1fa2', border: '#e1bee7' },
  Delivered: { bg: '#e8f8f0', text: '#2e7d32', border: '#c8e6c9' },
  Cancelled: { bg: '#fdeeed', text: '#d32f2f', border: '#ffcdd2' },
};

const AdminDashboardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'products' | 'orders'
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    countInStock: 50,
    category: 'Makeup',
    type: 'Lipsticks',
    skinType: 'All',
    image: '',
    description: '',
    ingredients: '',
    benefits: '',
    howToUse: '',
  });

  // Delete product confirmation modal
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);

  // View order details modal
  const [viewingOrder, setViewingOrder] = useState(null);

  // Product search filter
  const [productSearch, setProductSearch] = useState('');
  // Order search/status filter
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  const authHeader = {
    headers: { Authorization: `Bearer ${user?.token}` },
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
      const { data } = await api.post('/api/upload', formData, {
        headers: {
          ...authHeader.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      setProductForm(prev => ({ ...prev, image: data.image }));
      showNotification('Image uploaded successfully!');
    } catch (err) {
      console.error('Image upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload image. Supported formats: .jpg, .png, .webp, .svg (max 5MB).');
    } finally {
      setUploadingImage(false);
    }
  };

  // Mark COD order as paid and delivered upon physical collection
  const handleMarkCodPaid = async (orderId) => {
    if (!window.confirm(`Confirm collection: Mark Order #ELX-${orderId.toString().padStart(4, '0')} as Paid & Delivered?`)) return;
    try {
      const { data } = await api.put(`/api/orders/${orderId}/pay`, {}, authHeader);
      setOrders(prev => prev.map(o => (o.id === orderId ? data : o)));
      showNotification(`Order #ELX-${orderId.toString().padStart(4, '0')} marked as Paid and Delivered.`);
      api.get('/api/admin/metrics', authHeader).then(res => setMetrics(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark order as paid.');
    }
  };

  // Fetch all admin data
  const fetchData = async () => {
    if (!user || !user.isAdmin) return;
    setLoading(true);
    setError('');
    try {
      const [metricsRes, productsRes, ordersRes] = await Promise.all([
        api.get('/api/admin/metrics', authHeader),
        api.get('/api/products'),
        api.get('/api/orders', authHeader),
      ]);
      setMetrics(metricsRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/admin');
    } else if (user.isAdmin) {
      fetchData();
    }
  }, [user, navigate]);

  // If user is logged in but NOT an administrator, render access denied
  if (user && !user.isAdmin) {
    return (
      <div className="container my-2" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '3rem 2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <ShieldAlert size={64} color="var(--error)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
            You do not have administrator permissions to view this dashboard. Every action on this portal requires verified administrative authorization.
          </p>
          <button onClick={() => navigate('/')} className="btn">
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      countInStock: 50,
      category: 'Makeup',
      type: 'Lipsticks',
      skinType: 'All',
      image: '',
      description: '',
      ingredients: '',
      benefits: '',
      howToUse: '',
    });
    setProductModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || '',
      price: prod.price || '',
      countInStock: prod.countInStock !== undefined ? prod.countInStock : 50,
      category: prod.category || 'Makeup',
      type: prod.type || 'Lipsticks',
      skinType: prod.skinType || 'All',
      image: prod.image || '',
      description: prod.description || '',
      ingredients: prod.ingredients || '',
      benefits: prod.benefits || '',
      howToUse: prod.howToUse || '',
    });
    setProductModalOpen(true);
  };

  // Save product (Create or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      countInStock: Math.max(0, parseInt(productForm.countInStock, 10) || 0),
    };

    try {
      if (editingProduct) {
        const { data } = await api.put(`/api/products/${editingProduct.id}`, payload, authHeader);
        setProducts(prev => prev.map(p => (p.id === editingProduct.id ? data : p)));
        showNotification(`Product "${data.name}" updated successfully!`);
      } else {
        const { data } = await api.post('/api/products', payload, authHeader);
        setProducts(prev => [...prev, data]);
        showNotification(`Product "${data.name}" created successfully!`);
      }
      setProductModalOpen(false);
      // Refresh metrics
      api.get('/api/admin/metrics', authHeader).then(res => setMetrics(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product.');
    }
  };

  // Delete product
  const handleConfirmDelete = async () => {
    if (!deleteModalProduct) return;
    try {
      await api.delete(`/api/products/${deleteModalProduct.id}`, authHeader);
      setProducts(prev => prev.filter(p => p.id !== deleteModalProduct.id));
      showNotification(`Product "${deleteModalProduct.name}" removed successfully.`);
      setDeleteModalProduct(null);
      // Refresh metrics
      api.get('/api/admin/metrics', authHeader).then(res => setMetrics(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product.');
    }
  };

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/api/orders/${orderId}/status`, { status: newStatus }, authHeader);
      setOrders(prev => prev.map(o => (o.id === orderId ? data : o)));
      showNotification(`Order #ELX-${orderId.toString().padStart(4, '0')} status updated to ${newStatus}.`);
      // Refresh metrics
      api.get('/api/admin/metrics', authHeader).then(res => setMetrics(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.type.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered orders list
  const filteredOrders = orders.filter(o => 
    orderStatusFilter === 'All' ? true : o.status === orderStatusFilter
  );

  return (
    <div className="container my-2">
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', fontSize: '2.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
            Manage the ELARIX storefront, product catalog, and customer orders
          </p>
        </div>

        <button 
          onClick={fetchData} 
          className="btn btn-outline" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin-anim' : ''} /> Refresh Data
        </button>
      </div>

      {notification && (
        <div style={{ backgroundColor: '#e9f5ed', color: '#2e7d32', padding: '0.75rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #c8e6c9' }}>
          <CheckCircle size={18} /> {notification}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fdeeed', color: 'var(--error)', padding: '0.75rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #eee', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '1rem',
            color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-0.6rem',
            cursor: 'pointer'
          }}
        >
          Overview &amp; Metrics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '1rem',
            color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'products' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-0.6rem',
            cursor: 'pointer'
          }}
        >
          Products Management ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 600,
            fontSize: '1rem',
            color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-0.6rem',
            cursor: 'pointer'
          }}
        >
          Order Management ({orders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 600 }}>Total Revenue</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fefae0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={20} color="var(--primary)" />
                </div>
              </div>
              <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-dark)' }}>
                ₹{metrics ? metrics.totalRevenue.toFixed(2) : '0.00'}
              </h2>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#2e7d32' }}>Based on all active orders</p>
            </div>

            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 600 }}>Total Orders</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fefae0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={20} color="var(--primary)" />
                </div>
              </div>
              <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-dark)' }}>
                {metrics ? metrics.totalOrders : '0'}
              </h2>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                {metrics ? `${metrics.pendingOrders} pending fulfillment` : ''}
              </p>
            </div>

            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 600 }}>Catalog Products</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fefae0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} color="var(--primary)" />
                </div>
              </div>
              <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-dark)' }}>
                {metrics ? metrics.totalProducts : '0'}
              </h2>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--text-light)' }}>Active in store</p>
            </div>

            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 600 }}>Customers</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fefae0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="var(--primary)" />
                </div>
              </div>
              <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-dark)' }}>
                {metrics ? metrics.totalUsers : '0'}
              </h2>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: 'var(--text-light)' }}>Registered accounts</p>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <h3>Recent Customer Orders</h3>
              <button onClick={() => setActiveTab('orders')} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                View All Orders
              </button>
            </div>

            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No orders have been recorded yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', color: 'var(--text-light)' }}>
                      <th style={{ padding: '0.75rem' }}>Order</th>
                      <th style={{ padding: '0.75rem' }}>Customer</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Total</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => {
                      const badge = statusBadgeStyles[o.status] || statusBadgeStyles.Pending;
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f4f0ea' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>#ELX-{o.id.toString().padStart(4, '0')}</td>
                          <td style={{ padding: '0.75rem' }}>{o.User?.name || 'Guest'}</td>
                          <td style={{ padding: '0.75rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>₹{Number(o.totalPrice).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px' }}>
              <input
                type="text"
                placeholder="Search products by name, category, or type..."
                className="form-control"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
            </div>

            <button 
              onClick={handleOpenCreateModal} 
              className="btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.95rem' }}
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', color: 'var(--text-light)' }}>
                  <th style={{ padding: '0.75rem' }}>Image</th>
                  <th style={{ padding: '0.75rem' }}>Product Name</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Type</th>
                  <th style={{ padding: '0.75rem' }}>Price</th>
                  <th style={{ padding: '0.75rem' }}>Stock</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(prod => (
                    <tr key={prod.id} style={{ borderBottom: '1px solid #f4f0ea' }}>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <img 
                          src={prod.image || '/placeholder-product.svg'} 
                          alt={prod.name} 
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} 
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{prod.name}</td>
                      <td style={{ padding: '0.75rem' }}>{prod.category}</td>
                      <td style={{ padding: '0.75rem' }}>{prod.type}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>₹{Number(prod.price).toFixed(2)}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {(prod.countInStock !== undefined && prod.countInStock <= 0) ? (
                          <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            0 (Out)
                          </span>
                        ) : (prod.countInStock !== undefined && prod.countInStock <= 5) ? (
                          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {prod.countInStock} (Low)
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#e8f8f0', color: '#2e7d32', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {prod.countInStock !== undefined ? prod.countInStock : 50} units
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            style={{ background: '#f4f0ea', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: 'var(--text-dark)' }}
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModalProduct(prod)}
                            style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer', color: '#b91c1c' }}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Customer Orders ({orders.length})</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter by Status:</label>
              <select
                className="form-control"
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                style={{ width: '160px', padding: '0.4rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', color: 'var(--text-light)' }}>
                  <th style={{ padding: '0.75rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Items</th>
                  <th style={{ padding: '0.75rem' }}>Total</th>
                  <th style={{ padding: '0.75rem' }}>Payment</th>
                  <th style={{ padding: '0.75rem' }}>Update Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const badge = statusBadgeStyles[order.status] || statusBadgeStyles.Pending;
                    const itemsCount = order.OrderItems ? order.OrderItems.reduce((acc, it) => acc + it.quantity, 0) : 0;

                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid #f4f0ea' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                          #ELX-{order.id.toString().padStart(4, '0')}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>{order.User?.name || 'Guest User'}</p>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{order.User?.email || ''}</span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                          ₹{Number(order.totalPrice).toFixed(2)}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {order.isPaid ? (
                            <span style={{ backgroundColor: '#e8f8f0', color: '#2e7d32', border: '1px solid #c8e6c9', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                              ✓ Paid
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                              <span style={{ backgroundColor: '#fff4e5', color: '#b76e00', border: '1px solid #ffe2b8', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                Unpaid ({order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Stripe'})
                              </span>
                              {order.paymentMethod === 'Cash on Delivery' && order.status !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkCodPaid(order.id)}
                                  style={{ background: '#fdfbf7', border: '1px solid #d4a373', color: 'var(--primary)', fontSize: '0.72rem', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'pointer', fontWeight: 600 }}
                                  title="Mark COD as collected in person"
                                >
                                  Mark Collected
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                              padding: '0.3rem 0.6rem',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setProductModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Product Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    className="form-control"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Stock Qty *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    className="form-control"
                    value={productForm.countInStock}
                    onChange={e => setProductForm({ ...productForm, countInStock: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Category *</label>
                  <select
                    className="form-control"
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Makeup">Makeup</option>
                    <option value="Skincare">Skincare</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lipsticks, Serum, Face Wash"
                    className="form-control"
                    value={productForm.type}
                    onChange={e => setProductForm({ ...productForm, type: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Skin Type</label>
                  <input
                    type="text"
                    placeholder="All, Dry, Oily, Combination"
                    className="form-control"
                    value={productForm.skinType}
                    onChange={e => setProductForm({ ...productForm, skinType: e.target.value })}
                  />
                </div>
              </div>

              {/* Product Image Section with Live Preview & File Upload */}
              <div className="form-group" style={{ background: '#fdfbf7', padding: '1rem', borderRadius: '10px', border: '1px solid #f0eae1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Product Image</label>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img
                      src={productForm.image || '/placeholder-product.svg'}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>Upload from device (Max 5MB):</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="form-control"
                      style={{ padding: '0.4rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                    />
                    {uploadingImage && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Uploading image...</div>}

                    <label style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>Or enter Image URL:</label>
                    <input
                      type="text"
                      placeholder="https://... or /placeholder-product.svg"
                      className="form-control"
                      value={productForm.image}
                      onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Ingredients</label>
                <input
                  type="text"
                  placeholder="Key ingredients..."
                  className="form-control"
                  value={productForm.ingredients}
                  onChange={e => setProductForm({ ...productForm, ingredients: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Benefits</label>
                <input
                  type="text"
                  placeholder="Product benefits..."
                  className="form-control"
                  value={productForm.benefits}
                  onChange={e => setProductForm({ ...productForm, benefits: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>How To Use</label>
                <input
                  type="text"
                  placeholder="Instructions for use..."
                  className="form-control"
                  value={productForm.howToUse}
                  onChange={e => setProductForm({ ...productForm, howToUse: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setProductModalOpen(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteModalProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={32} color="#dc2626" />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Confirm Delete</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
              Are you sure you want to permanently delete <strong>{deleteModalProduct.name}</strong> from the store catalog?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setDeleteModalProduct(null)} className="btn btn-outline" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="btn" style={{ background: '#dc2626', color: '#fff', flex: 1 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {viewingOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setViewingOrder(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ marginBottom: '0.25rem', fontSize: '1.6rem' }}>
              Order #ELX-{viewingOrder.id.toString().padStart(4, '0')}
            </h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Placed on {new Date(viewingOrder.createdAt).toLocaleString()}
            </p>

            <div style={{ marginBottom: '1.25rem', background: '#fdfbf7', padding: '1rem', borderRadius: '8px', border: '1px solid #f0eae1' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-dark)' }}>Customer Information</h4>
              <p style={{ margin: '0 0 0.2rem' }}><strong>Name:</strong> {viewingOrder.User?.name || 'N/A'}</p>
              <p style={{ margin: '0 0 0.2rem' }}><strong>Email:</strong> {viewingOrder.User?.email || 'N/A'}</p>
              <p style={{ margin: '0 0 0.2rem' }}><strong>Phone:</strong> {viewingOrder.shippingAddress?.phone || 'N/A'}</p>
              <p style={{ margin: '0 0 0.2rem' }}>
                <strong>Address:</strong> {viewingOrder.shippingAddress?.addressLine}, {viewingOrder.shippingAddress?.city}, {viewingOrder.shippingAddress?.state} - {viewingOrder.shippingAddress?.postalCode || viewingOrder.shippingAddress?.pincode}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', background: '#fdfbf7', padding: '1rem', borderRadius: '8px', border: '1px solid #f0eae1' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-dark)' }}>Payment Information</h4>
              <p style={{ margin: '0 0 0.2rem' }}>
                <strong>Method:</strong> {viewingOrder.paymentMethod || 'N/A'}
              </p>
              <p style={{ margin: '0 0 0.2rem' }}>
                <strong>Status:</strong>{' '}
                <span style={{ color: viewingOrder.isPaid ? '#2e7d32' : '#b76e00', fontWeight: 600 }}>
                  {viewingOrder.isPaid ? '✓ Paid' : '⏳ Unpaid'}
                </span>
                {viewingOrder.paidAt && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginLeft: '0.5rem' }}>
                    ({new Date(viewingOrder.paidAt).toLocaleString()})
                  </span>
                )}
              </p>
            </div>

            <h4 style={{ marginBottom: '0.75rem' }}>Ordered Products</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {viewingOrder.OrderItems && viewingOrder.OrderItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img 
                      src={item.image || item.Product?.image || '/placeholder-product.svg'} 
                      alt="" 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} 
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-product.svg'; }}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600 }}>{item.name || item.Product?.name || `Product #${item.ProductId}`}</p>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Qty: {item.quantity} &times; ₹{Number(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700 }}>₹{(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Items Subtotal:</span>
                <span style={{ color: 'var(--text-dark)', fontWeight: 500 }}>₹{Number(viewingOrder.itemsPrice || viewingOrder.totalPrice).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span>Shipping:</span>
                <span style={{ color: viewingOrder.shippingFee === 0 ? '#2e7d32' : 'var(--text-dark)', fontWeight: 500 }}>
                  {viewingOrder.shippingFee === 0 ? 'FREE' : `₹${Number(viewingOrder.shippingFee).toFixed(2)}`}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: 700, borderTop: '2px solid #eee', paddingTop: '1rem' }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--primary)' }}>₹{Number(viewingOrder.totalPrice).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
