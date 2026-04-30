import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import Icon from '../components/Icon';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Documents', 'Jewelry', 'Bags', 'Keys', 'Sports', 'Other'];

function ItemCard({ item }) {
  return (
    <Link to={`/items/${item.id}`} className="item-card">
      {item.image_url
        ? <img src={item.image_url} alt={item.item_name} className="item-card-img" />
        : <div className="item-card-img-placeholder"><Icon name="package" size={36} /></div>
      }
      <div className="item-card-body">
        <div className="item-card-title">{item.item_name}</div>
        <div className="item-card-meta">
          <span><Icon name="map" size={14} /> {item.location}</span>
          <span><Icon name="calendar" size={14} /> {new Date(item.date_lost_or_found).toLocaleDateString()}</span>
          <span><Icon name="user" size={14} /> {item.reporter_name}</span>
        </div>
      </div>
      <div className="item-card-footer">
        <span className={`badge badge-${item.type}`}>{item.type}</span>
        <span className={`badge badge-${item.status}`}>{item.status}</span>
      </div>
    </Link>
  );
}

export default function SearchItems() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    status: searchParams.get('status') || '',
    date_from: '',
    date_to: '',
  });

  const fetchItems = useCallback(async (p = 1, activeFilters = filters) => {
    setLoading(true);
    try {
      const data = await api.getItems({ ...activeFilters, page: p, limit: 12 });
      setResults(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchItems(page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
    fetchItems(1, filters);
  };

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <h1>Browse Items</h1>
        <p>{total} items found</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Search</label>
              <input value={filters.search} onChange={e => setFilter('search', e.target.value)} placeholder="Item name..." />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Location</label>
              <input value={filters.location} onChange={e => setFilter('location', e.target.value)} placeholder="Building, area..." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Type</label>
              <select value={filters.type} onChange={e => setFilter('type', e.target.value)}>
                <option value="">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select value={filters.category} onChange={e => setFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="matched">Matched</option>
                <option value="claimed">Claimed</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>From Date</label>
              <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>To Date</label>
              <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary">Search</button>
            <button type="button" className="btn btn-secondary" onClick={() => {
              const nextFilters = { search: '', type: '', category: '', location: '', status: '', date_from: '', date_to: '' };
              setFilters(nextFilters);
              setSearchParams({});
              setPage(1);
              fetchItems(1, nextFilters);
            }}>Clear</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : results.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Icon name="search" size={24} /></div>
          <h3>No items found</h3>
          <p>Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="items-grid">
            {results.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
          {pages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              {Array.from({ length: pages }, (_, i) => (
                <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
