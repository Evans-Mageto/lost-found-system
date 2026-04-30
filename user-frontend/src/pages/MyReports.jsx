import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Icon from '../components/Icon';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = () => api.getMyReports().then(setReports).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    setDeleting(id);
    try { await api.deleteItem(id); setReports(r => r.filter(x => x.id !== id)); }
    catch (err) { alert(err.message); }
    finally { setDeleting(null); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My Reports</h1>
          <p>{reports.length} total reports</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/report/lost" className="btn btn-danger btn-sm"><Icon name="plus" size={14} /> Lost</Link>
          <Link to="/report/found" className="btn btn-success btn-sm"><Icon name="plus" size={14} /> Found</Link>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Icon name="report" size={24} /></div>
          <h3>No reports yet</h3>
          <p>Start by reporting a lost or found item.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link to="/report/lost" className="btn btn-danger">Report Lost Item</Link>
            <Link to="/report/found" className="btn btn-success">Report Found Item</Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                {['Item', 'Type', 'Category', 'Location', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < reports.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>
                    <Link to={`/items/${r.id}`} style={{ color: 'var(--text)' }}>{r.item_name}</Link>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}><span className={`badge badge-${r.type}`}>{r.type}</span></td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text2)', fontSize: '0.875rem' }}>{r.category}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text2)', fontSize: '0.875rem' }}>{r.location}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text2)', fontSize: '0.875rem' }}>{new Date(r.date_lost_or_found).toLocaleDateString()}</td>
                  <td style={{ padding: '0.85rem 1rem' }}><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button className="btn btn-danger btn-sm" disabled={deleting === r.id} onClick={() => handleDelete(r.id)}>
                      {deleting === r.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
