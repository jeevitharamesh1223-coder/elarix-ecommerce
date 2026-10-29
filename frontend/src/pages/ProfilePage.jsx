import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, Package, Heart, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/client';

const ProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }
    setName(user.name || '');
    setEmail(user.email || '');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email address cannot be empty');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setErrorMsg('New password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('New passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = { name: name.trim(), email: email.trim().toLowerCase() };
      if (password) payload.password = password;

      const { data } = await api.put('/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Update auth context / localStorage reliably with new user data
      updateUser({
        name: data.name,
        email: data.email,
        token: data.token || user.token,
      });

      setSuccessMsg('Profile details updated successfully');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container my-2" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Account Profile</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
          Manage your personal details, credentials, and beauty preferences
        </p>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#e8f8f0', color: '#2e7d32', border: '1px solid #c8e6c9', padding: '0.9rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#fff0ee', color: 'var(--error)', border: '1px solid #ffcdd2', padding: '0.9rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Profile Update Form */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', borderBottom: '1px solid #f7f3ed', paddingBottom: '0.75rem' }}>
            Edit Personal Details
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="profile-name" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input 
                id="profile-name"
                type="text" 
                className="form-control" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Email Address
              </label>
              <input 
                id="profile-email"
                type="email" 
                className="form-control" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div style={{ borderTop: '1px solid #f0eae1', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>
                Change Password <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: '0.8rem' }}>(leave blank to keep current)</span>
              </p>

              <div className="form-group">
                <label htmlFor="profile-password" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  New Password
                </label>
                <input 
                  id="profile-password"
                  type="password" 
                  placeholder="Min 6 characters" 
                  className="form-control" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-confirm-password" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Confirm New Password
                </label>
                <input 
                  id="profile-confirm-password"
                  type="password" 
                  placeholder="Re-type new password" 
                  className="form-control" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn" 
              style={{ width: '100%', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: loading ? 0.75 : 1 }}
              disabled={loading}
            >
              <Save size={18} /> {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Right Column: Account Snapshot & Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account Card */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)', border: '1px solid #f2ece4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--secondary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{user.email}</span>
              </div>
            </div>

            <div style={{ background: '#fcfaf7', padding: '1rem', borderRadius: '12px', border: '1px solid #f0eae1', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Role:</span>
                <span style={{ fontWeight: 600, color: user.isAdmin ? 'var(--primary)' : 'var(--text-dark)' }}>
                  {user.isAdmin ? 'Administrator' : 'Customer'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Status:</span>
                <span style={{ color: '#2e7d32', fontWeight: 600 }}>Active</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)', border: '1px solid #f2ece4', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--text-dark)' }}>Quick Shortcuts</h4>
            <Link to="/orders" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.7rem 1rem' }}>
              <Package size={18} /> View My Orders
            </Link>
            <Link to="/wishlist" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.7rem 1rem' }}>
              <Heart size={18} /> View My Wishlist
            </Link>
            {user.isAdmin && (
              <Link to="/admin" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.7rem 1rem' }}>
                <Shield size={18} /> Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
