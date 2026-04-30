import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyReports(), api.getMyClaims()])
      .then(([r, c]) => { setReports(r); setClaims(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const pending = reports.filter(r => r.status === 'pending').length;
  const matched = reports.filter(r => r.status === 'matched').length;
  const pendingClaims = claims.filter(c => c.status === 'pending').length;
  const approvedClaims = claims.filter(c => c.status === 'approved').length;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <h1>Welcome, {user.full_name.split(' ')[0]} 👋</h1>
        <p>Here's an overview of your activity</p>
      </div>

      <div className="stats-grid">
        {[
          { num: reports.length, label: 'Total Reports', color: 'var(--accent)' },
          { num: pending, label: 'Pending Reports', color: 'var(--warning)' },
          { num: matched, label: 'Matched Items', color: 'var(--success)' },
          { num: claims.length, label: 'Total Claims', color: 'var(--accent2)' },
          { num: pendingClaims, label: 'Pending Claims', color: 'var(--warning)' },
          { num: approvedClaims, label: 'Approved Claims', color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/report/lost" className="btn btn-danger" style={{ padding: '1rem', fontSize: '1rem', flexDirection: 'column', gap: '0.3rem' }}>
          <span>😞 Report Lost Item</span>
        </Link>
        <Link to="/report/found" className="btn btn-success" style={{ padding: '1rem', fontSize: '1rem', flexDirection: 'column' }}>
          <span>😊 Report Found Item</span>
        </Link>
        <Link to="/search" className="btn btn-secondary" style={{ padding: '1rem', fontSize: '1rem' }}>
          🔍 Browse All Items
        </Link>
      </div>

      {/* Recent reports preview */}
      {reports.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Recent Reports</h2>
            <Link to="/my/reports" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {reports.slice(0, 5).map((r, i) => (
              <div key={r.id} style={{
                padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: i < Math.min(reports.length, 5) - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{r.item_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{r.category} · {r.location}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge badge-${r.type}`}>{r.type}</span>
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
