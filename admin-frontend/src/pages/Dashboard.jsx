import { useEffect, useState } from 'react';
import { adminApi } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminApi.getDashboard().then(setStats).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const cards = [
    { num: stats.total_items, label: 'Total Items', color: 'var(--accent)', icon: '📦' },
    { num: stats.lost_items, label: 'Lost Items', color: 'var(--danger)', icon: '😞' },
    { num: stats.found_items, label: 'Found Items', color: 'var(--success)', icon: '😊' },
    { num: stats.pending_items, label: 'Pending Items', color: 'var(--warning)', icon: '⏳' },
    { num: stats.claimed_items, label: 'Claimed Items', color: '#a855f7', icon: '✅' },
    { num: stats.returned_items, label: 'Returned Items', color: 'var(--success)', icon: '🎉' },
    { num: stats.total_users, label: 'Registered Users', color: 'var(--accent2)', icon: '👥' },
    { num: stats.total_claims, label: 'Total Claims', color: 'var(--accent)', icon: '🏷️' },
    { num: stats.pending_claims, label: 'Pending Claims', color: 'var(--warning)', icon: '⏳' },
    { num: stats.approved_claims, label: 'Approved Claims', color: 'var(--success)', icon: '✔️' },
  ];

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>System overview and quick statistics</p>
      </div>

      <div className="stats-grid">
        {cards.map(c => (
          <div key={c.label} className="stat-card">
            <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{c.icon}</div>
            <div className="stat-num" style={{ color: c.color }}>{c.num}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Items Overview</h3>
          {[
            { label: 'Pending', count: stats.pending_items, total: stats.total_items, color: 'var(--warning)' },
            { label: 'Matched', count: stats.total_items - stats.pending_items - stats.claimed_items - stats.returned_items, total: stats.total_items, color: 'var(--accent)' },
            { label: 'Claimed', count: stats.claimed_items, total: stats.total_items, color: '#a855f7' },
            { label: 'Returned', count: stats.returned_items, total: stats.total_items, color: 'var(--success)' },
          ].map(b => (
            <div key={b.label} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text2)' }}>{b.label}</span>
                <span>{b.count}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                <div style={{ height: '100%', width: `${stats.total_items ? (b.count / stats.total_items) * 100 : 0}%`, background: b.color, borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Claims Overview</h3>
          {[
            { label: 'Pending', count: stats.pending_claims, total: stats.total_claims, color: 'var(--warning)' },
            { label: 'Approved', count: stats.approved_claims, total: stats.total_claims, color: 'var(--success)' },
            { label: 'Rejected', count: stats.total_claims - stats.pending_claims - stats.approved_claims, total: stats.total_claims, color: 'var(--danger)' },
          ].map(b => (
            <div key={b.label} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text2)' }}>{b.label}</span>
                <span>{b.count}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                <div style={{ height: '100%', width: `${stats.total_claims ? (b.count / stats.total_claims) * 100 : 0}%`, background: b.color, borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
