import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, ShoppingBag, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const ITEMS_PER_PAGE = 12;

const ShopPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sort, setSort] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/products');
      const list = Array.isArray(data) ? data : (data?.products || []);
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to connect to product catalog. Please make sure the server is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Derive available product types for current category
  const availableTypes = useMemo(() => {
    const categoryProducts = category && category.toLowerCase() !== 'all'
      ? products.filter(p => p.category && p.category.trim().toLowerCase() === category.trim().toLowerCase())
      : products;
    const types = [...new Set(categoryProducts.map(p => p.type).filter(Boolean))];
    return types.sort();
  }, [products, category]);

  // Reset type filter when category changes
  useEffect(() => {
    setSelectedType('');
    setCurrentPage(1);
  }, [category, keyword]);

  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (category && category.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => p.category && p.category.trim().toLowerCase() === category.trim().toLowerCase());
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(p => p.type && p.type.trim().toLowerCase() === selectedType.trim().toLowerCase());
    }

    // Keyword filter
    if (keyword) {
      const kw = keyword.trim().toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(kw)) ||
        (p.description && p.description.toLowerCase().includes(kw)) ||
        (p.type && p.type.toLowerCase().includes(kw))
      );
    }

    // Price range filter
    if (priceFilter === 'under-100') {
      filtered = filtered.filter(p => Number(p.price) <= 100);
    } else if (priceFilter === '100-150') {
      filtered = filtered.filter(p => Number(p.price) > 100 && Number(p.price) <= 150);
    } else if (priceFilter === 'above-150') {
      filtered = filtered.filter(p => Number(p.price) > 150);
    }

    // Sorting
    if (sort === 'lowToHigh') {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sort === 'highToLow') {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sort === 'highestRated') {
      filtered.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [category, keyword, products, sort, priceFilter, selectedType]);

  const getPageTitle = () => {
    if (keyword) return `Search Results for "${keyword}"`;
    if (!category || category.toLowerCase() === 'all') return 'All Products';
    if (category.toLowerCase() === 'makeup') return 'Makeup Collection';
    if (category.toLowerCase() === 'skincare') return 'Skincare Collection';
    return `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`;
  };

  // Pagination slicing
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const resetFilters = () => {
    setSort('');
    setPriceFilter('');
    setSelectedType('');
  };

  return (
    <div className="container my-2">
      {/* Header & Controls */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ textTransform: 'capitalize', marginBottom: '0.25rem' }}>{getPageTitle()}</h1>
          {!loading && !error && (
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Price Range Filter */}
          <select 
            className="form-control" 
            value={priceFilter} 
            onChange={(e) => setPriceFilter(e.target.value)} 
            style={{ width: '150px', padding: '0.6rem 0.8rem' }}
            aria-label="Filter by price"
          >
            <option value="">All Prices</option>
            <option value="under-100">Under ₹100</option>
            <option value="100-150">₹100 to ₹150</option>
            <option value="above-150">Above ₹150</option>
          </select>

          {/* Sort By Dropdown */}
          <select 
            className="form-control" 
            value={sort} 
            onChange={(e) => setSort(e.target.value)} 
            style={{ width: '180px', padding: '0.6rem 0.8rem' }}
            aria-label="Sort products"
          >
            <option value="">Sort By: Featured</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="highestRated">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Sub-type Filter Pills */}
      {availableTypes.length > 0 && !loading && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => setSelectedType('')}
            style={{ 
              padding: '0.35rem 0.9rem', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              border: selectedType === '' ? '1px solid var(--primary)' : '1px solid #e0d8cc',
              background: selectedType === '' ? 'var(--primary)' : '#fff',
              color: selectedType === '' ? '#fff' : 'var(--text-dark)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            All Types
          </button>
          {availableTypes.map(t => (
            <button 
              key={t}
              type="button"
              onClick={() => setSelectedType(selectedType === t ? '' : t)}
              style={{ 
                padding: '0.35rem 0.9rem', 
                borderRadius: '20px', 
                fontSize: '0.85rem', 
                border: selectedType === t ? '1px solid var(--primary)' : '1px solid #e0d8cc',
                background: selectedType === t ? 'var(--primary)' : '#fff',
                color: selectedType === t ? '#fff' : 'var(--text-dark)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
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
          <p style={{ marginTop: '1rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
            Curating your ELARIX collection...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ 
          background: '#fff0ee', 
          border: '1px solid #ffcdd2', 
          borderRadius: '12px', 
          padding: '2.5rem 1.5rem', 
          textAlign: 'center', 
          maxWidth: '560px', 
          margin: '3rem auto' 
        }}>
          <AlertCircle size={40} color="var(--error)" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ color: 'var(--error)', marginBottom: '0.5rem' }}>Unable to Load Products</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {error}
          </p>
          <button 
            type="button" 
            className="btn" 
            onClick={fetchProducts}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 1.5rem', 
          background: 'var(--white)', 
          borderRadius: '12px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <ShoppingBag size={42} color="var(--primary)" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.8 }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>No products found</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            {keyword 
              ? `We couldn't find any products matching "${keyword}". Try searching with different keywords.` 
              : `There are currently no products available matching your current filters.`}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(priceFilter || selectedType || sort) && (
              <button onClick={resetFilters} className="btn btn-outline">
                Clear Filters
              </button>
            )}
            <Link to="/shop/makeup" className="btn">Shop Makeup</Link>
            <Link to="/shop/skincare" className="btn btn-outline">Explore Skincare</Link>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && paginatedProducts.length > 0 && (
        <>
          <div className="product-grid">
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem', marginBottom: '2rem' }}>
              <button 
                type="button"
                className="btn btn-outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ padding: '0.5rem 0.8rem', opacity: currentPage === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
                aria-label="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>

              {[...Array(totalPages).keys()].map(index => {
                const pageNumber = index + 1;
                const isCurrent = pageNumber === currentPage;
                return (
                  <button 
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '50%', 
                      border: isCurrent ? '1px solid var(--primary)' : '1px solid #e0d8cc',
                      background: isCurrent ? 'var(--primary)' : '#fff',
                      color: isCurrent ? '#fff' : 'var(--text-dark)',
                      fontWeight: isCurrent ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button 
                type="button"
                className="btn btn-outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '0.5rem 0.8rem', opacity: currentPage === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
                aria-label="Next Page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShopPage;
