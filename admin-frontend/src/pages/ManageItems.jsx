import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api';

const STATUSES = ['pending', 'matched', 'claimed', 'returned'];

export default function ManageItems() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [filters, setFilters] = useState({ search: '', type: '', status: '', category: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.getItems({ ...filters, page: p, limit: 15 });
      setData(res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); setPage(1); }, []);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(1); };

  const handleStatus = async (id, status) => {
    setUpdating(id); setErr(''); setMsg('');
    try {
      await adminApi.updateItemStatus(id, status);
      setMsg(`Item status updated to "${status}".`);
      load(page);
    } catch (e) { setErr(e.message); }
    finally { setUpdating(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id); setErr(''); setMsg('');
    try {
      await adminApi.deleteItem(id);
      setMsg('Item deleted.');
      load(page);
    } catch (e) { setErr(e.message); }
    finally { setDeleting(null); }
  };

  const setFilter = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      <div className="admin-header">
        <h1>Manage Items</h1>
        <p>View, update status, and delete reported items</p>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <form onSubmit={handleSearch} className="filter-bar" style={{ marginBottom: '1.2rem' }}>
        <input value={filters.search} onChange={e => setFilter('search', e.target.value)} placeholder="Search items..." style={{ flex: 1, minWidth: '180px' }} />
        <select value={filters.type} onChange={e => setFilter('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn btn-primary">Filter</button>
        <button type="button" className="btn btn-secondary" onClick={() => { setFilters({ search: '', type: '', status: '', category: '' }); setPage(1); load(1); }}>Clear</button>
      </form>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : data.items.length === 0 ? (
        <div className="empty"><div className="icon">📦</div><p>No items found.</p></div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Reporter</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>#{item.id}</td>
                    <td>
                      <Link to={`/items/${item.id}`} style={{ color: 'var(--text)', fontWeight: 500 }}>
                        {item.item_name}
                      </Link>
                    </td>
                    <td><span className={`badge badge-${item.type}`}>{item.type}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{item.category}</td>
                    <td style={{ color: 'var(--text2)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.location}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{item.reporter_name}</td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{new Date(item.date_lost_or_found).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={item.status}
                        disabled={updating === item.id}
                        onChange={e => handleStatus(item.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem', fontSize: '0.78rem',
                          background: 'var(--bg3)', border: '1px solid var(--border)',
                          borderRadius: '6px', color: 'var(--text)', cursor: 'pointer'
                        }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link to={`/items/${item.id}`} className="btn btn-secondary btn-sm">View</Link>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={deleting === item.id}
                          onClick={() => handleDelete(item.id, item.item_name)}
                        >
                          {deleting === item.id ? '...' : 'Del'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div className="pagination">
              <button onClick={() => { setPage(p => p - 1); load(page - 1); }} disabled={page === 1}>← Prev</button>
              {Array.from({ length: data.pages }, (_, i) => (
                <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => { setPage(i + 1); load(i + 1); }}>{i + 1}</button>
              ))}
              <button onClick={() => { setPage(p => p + 1); load(page + 1); }} disabled={page === data.pages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
