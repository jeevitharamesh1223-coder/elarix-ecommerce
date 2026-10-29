import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (user) navigate(redirect);
  }, [user, navigate, redirect]);

  const toggleMode = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email.trim() || !password) {
        setError('Please enter both email and password.');
        return;
      }
      setSubmitting(true);
      try {
        const res = await login(email.trim(), password);
        if (!res.success) {
          setError(res.message || 'Login failed. Please check your credentials.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim()) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your password confirmation.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await register(name.trim(), email.trim(), password);
        if (!res.success) {
          setError(res.message || 'Registration failed. Email may already be registered.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="container my-2" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', padding: '3rem 2.5rem', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h2 className="text-center" style={{ marginBottom: '1.75rem', fontSize: '2rem', color: 'var(--text-dark)' }}>
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {error && (
          <div 
            style={{ 
              color: '#fff', 
              backgroundColor: 'var(--error)', 
              padding: '0.8rem 1rem', 
              borderRadius: '8px', 
              marginBottom: '1.25rem', 
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }} 
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} noValidate>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name-input" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 600 }}>
                Full Name
              </label>
              <input 
                id="name-input"
                type="text" 
                placeholder="e.g. Maya Sharma" 
                className="form-control" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email-input" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 600 }}>
              Email Address
            </label>
            <input 
              id="email-input"
              type="email" 
              placeholder="name@example.com" 
              className="form-control" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-input" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 600 }}>
              Password
            </label>
            <input 
              id="password-input"
              type="password" 
              placeholder="Minimum 6 characters" 
              className="form-control" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirm-password-input" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem', fontWeight: 600 }}>
                Confirm Password
              </label>
              <input 
                id="confirm-password-input"
                type="password" 
                placeholder="Re-enter your password" 
                className="form-control" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn" 
            style={{ width: '100%', marginTop: '1rem', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
            disabled={submitting}
          >
            {submitting 
              ? (isLogin ? 'Signing In...' : 'Creating Account...') 
              : (isLogin ? 'Sign In' : 'Register Now')}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.95rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              role="button"
              tabIndex={0}
              onClick={() => toggleMode(!isLogin)} 
              onKeyDown={(e) => { if (e.key === 'Enter') toggleMode(!isLogin); }}
              style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
