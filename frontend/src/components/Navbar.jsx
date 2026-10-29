import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, LogOut, Menu, X, Package, LayoutDashboard } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { cartItems, wishlistItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = e.target.search.value;
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    const keyword = e.target.mobileSearch.value;
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-brand" onClick={closeMenu}>ELARIX</Link>
        
        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/shop/makeup">Makeup</Link>
          <Link to="/shop/skincare">Skincare</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Right Action Icons & Search */}
        <div className="flex items-center gap-1 nav-actions">
          <form onSubmit={handleSearch} className="nav-search-form flex">
            <input 
              type="text" 
              name="search" 
              placeholder="Search..." 
              className="nav-search-input"
            />
            <button type="submit" className="nav-search-btn" aria-label="Search">
              <Search size={18} color="#666" />
            </button>
          </form>

          {/* Wishlist Link with Badge */}
          <Link to="/wishlist" className="nav-icon-link" title="Wishlist" aria-label="Wishlist">
            <Heart size={22} />
            {wishlistItems.length > 0 && (
              <span className="nav-badge">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart Link with Badge */}
          <Link to="/cart" className="nav-icon-link" title="Shopping Cart" aria-label="Shopping Cart">
            <ShoppingBag size={22} />
            {cartItems.length > 0 && (
              <span className="nav-badge">
                {cartItems.length}
              </span>
            )}
          </Link>
          
          {/* Orders Link for Authenticated Customer */}
          {user && (
            <Link to="/orders" className="nav-icon-link" title="My Orders" aria-label="My Orders">
              <Package size={22} />
            </Link>
          )}

          {/* Admin Dashboard Link for Admin User */}
          {user?.isAdmin && (
            <Link 
              to="/admin" 
              className="nav-icon-link" 
              title="Admin Dashboard" 
              aria-label="Admin Dashboard"
              style={{ color: 'var(--primary)' }}
            >
              <LayoutDashboard size={21} />
            </Link>
          )}

          {/* User Account / Logout */}
          {user ? (
            <div className="nav-user-info">
              <Link to="/profile" className="nav-user-greeting" title="My Profile" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={18} /> Hi, {user.name.split(' ')[0]}
              </Link>
              <button onClick={logout} className="nav-logout-btn" title="Logout" aria-label="Logout">
                <LogOut size={19} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-icon-link nav-user-login" title="Login" aria-label="Login">
              <User size={22} />
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button 
            type="button"
            className="hamburger-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      <div 
        className={`mobile-backdrop ${mobileMenuOpen ? 'open' : ''}`} 
        onClick={closeMenu} 
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <aside 
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
      >
        <div className="mobile-drawer-header">
          <Link to="/" className="nav-brand" onClick={closeMenu}>ELARIX</Link>
          <button 
            type="button" 
            className="mobile-drawer-close" 
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Search Form */}
        <form onSubmit={handleMobileSearch} className="mobile-drawer-search">
          <input 
            type="text" 
            name="mobileSearch" 
            placeholder="Search makeup, skincare..." 
            className="form-control"
          />
          <button type="submit" className="mobile-drawer-search-btn" aria-label="Search">
            <Search size={18} color="#666" />
          </button>
        </form>

        {/* Mobile Navigation Links */}
        <div className="mobile-drawer-links">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/shop/makeup" onClick={closeMenu}>Makeup Collection</Link>
          <Link to="/shop/skincare" onClick={closeMenu}>Skincare Collection</Link>
          
          <Link to="/wishlist" onClick={closeMenu} className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Heart size={18} /> Wishlist
            </span>
            {wishlistItems.length > 0 && (
              <span className="mobile-badge">{wishlistItems.length}</span>
            )}
          </Link>
          
          <Link to="/cart" onClick={closeMenu} className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <ShoppingBag size={18} /> Shopping Cart
            </span>
            {cartItems.length > 0 && (
              <span className="mobile-badge">{cartItems.length}</span>
            )}
          </Link>

          {user && (
            <Link to="/orders" onClick={closeMenu} className="flex items-center gap-1">
              <Package size={18} /> My Orders
            </Link>
          )}

          {user?.isAdmin && (
            <Link to="/admin" onClick={closeMenu} className="flex items-center gap-1" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              <LayoutDashboard size={18} /> Admin Dashboard
            </Link>
          )}
          
          <Link to="/about" onClick={closeMenu}>About Us</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
        </div>

        {/* Mobile User Section */}
        <div className="mobile-drawer-footer">
          {user ? (
            <div className="mobile-user-card">
              <Link to="/profile" onClick={closeMenu}>
                <p style={{ fontWeight: 600, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={16} color="var(--primary)" /> {user.name}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{user.email}</p>
              </Link>
              <button onClick={() => { logout(); closeMenu(); }} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={closeMenu} className="btn" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
              Sign In / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
