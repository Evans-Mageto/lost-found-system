import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api';
import Icon from '../components/Icon';

function ProgressRow({ label, count, total, color }) {
  const pct = total ? (count / total) * 100 : 0;
  return (
    <div style={{ marginBottom: '0.8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
        <span style={{ color: 'var(--text2)' }}>{label}</span>
        <span>{count}</span>
      </div>
      <div style={{ height: '7px', background: 'var(--bg3)', borderRadius: '999px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [latestItems, setLatestItems] = useState([]);
  const [latestLogs, setLatestLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard(),
      adminApi.getClaims({ status: 'pending', page: 1, limit: 5 }),
      adminApi.getItems({ page: 1, limit: 5 }),
      adminApi.getLogs({ page: 1, limit: 5 }),
    ])
      .then(([dashboard, claims, items, logs]) => {
        setStats(dashboard);
        setPendingClaims(claims.claims || []);
        setLatestItems(items.items || []);
        setLatestLogs(logs.logs || []);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!stats) return <div className="alert alert-error">{err || 'Unable to load dashboard.'}</div>;

  const cards = [
    { num: stats.total_items, label: 'Total Items', color: 'var(--accent)', icon: 'package' },
    { num: stats.lost_items, label: 'Lost Items', color: 'var(--danger)', icon: 'alert' },
    { num: stats.found_items, label: 'Found Items', color: 'var(--success)', icon: 'check' },
    { num: stats.pending_items, label: 'Pending Items', color: 'var(--warning)', icon: 'clock' },
    { num: stats.claimed_items, label: 'Claimed Items', color: '#5b3ea6', icon: 'tag' },
    { num: stats.returned_items, label: 'Returned Items', color: 'var(--success)', icon: 'shield' },
    { num: stats.total_users, label: 'Registered Users', color: 'var(--accent2)', icon: 'users' },
    { num: stats.total_claims, label: 'Total Claims', color: 'var(--accent)', icon: 'tag' },
    { num: stats.pending_claims, label: 'Pending Claims', color: 'var(--warning)', icon: 'clock' },
    { num: stats.approved_claims, label: 'Approved Claims', color: 'var(--success)', icon: 'check' },
  ];

  const matchedCount = Math.max(stats.total_items - stats.pending_items - stats.claimed_items - stats.returned_items, 0);
  const rejectedClaims = Math.max(stats.total_claims - stats.pending_claims - stats.approved_claims, 0);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <p>Live overview of reports, users, claims, and recent activity.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link to="/claims" className="btn btn-primary"><Icon name="tag" size={16} /> Review Claims</Link>
          <Link to="/items" className="btn btn-secondary"><Icon name="package" size={16} /> Manage Items</Link>
        </div>
      </div>

      {err && <div className="alert alert-error">{err}</div>}

      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-label">{c.label}</div>
              <span className="stat-icon" style={{ color: c.color }}><Icon name={c.icon} size={18} /></span>
            </div>
            <div className="stat-num" style={{ color: c.color }}>{c.num}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Items Overview</h3>
          <ProgressRow label="Pending" count={stats.pending_items} total={stats.total_items} color="var(--warning)" />
          <ProgressRow label="Matched" count={matchedCount} total={stats.total_items} color="var(--accent)" />
          <ProgressRow label="Claimed" count={stats.claimed_items} total={stats.total_items} color="#5b3ea6" />
          <ProgressRow label="Returned" count={stats.returned_items} total={stats.total_items} color="var(--success)" />
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Claims Overview</h3>
          <ProgressRow label="Pending" count={stats.pending_claims} total={stats.total_claims} color="var(--warning)" />
          <ProgressRow label="Approved" count={stats.approved_claims} total={stats.total_claims} color="var(--success)" />
          <ProgressRow label="Rejected" count={rejectedClaims} total={stats.total_claims} color="var(--danger)" />
        </div>
      </div>

      <div className="dashboard-grid-wide">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Pending Claim Queue</h3>
            <Link to="/claims" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {pendingClaims.length === 0 ? (
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>No pending claims right now.</p>
          ) : (
            <div className="list-stack">
              {pendingClaims.map((claim) => (
                <div key={claim.id} className="mini-row">
                  <div>
                    <div className="mini-row-title">{claim.item_name}</div>
                    <div className="mini-row-sub">{claim.claimant_name} · {new Date(claim.created_at).toLocaleDateString()}</div>
                  </div>
                  <Link to="/claims" className="btn btn-primary btn-sm">Review</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Latest Reports</h3>
            <Link to="/items" className="btn btn-secondary btn-sm">Manage</Link>
          </div>
          {latestItems.length === 0 ? (
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>No item reports have been submitted yet.</p>
          ) : (
            <div className="list-stack">
              {latestItems.map((item) => (
                <div key={item.id} className="mini-row">
                  <div>
                    <div className="mini-row-title">{item.item_name}</div>
                    <div className="mini-row-sub">{item.category} · {item.location}</div>
                  </div>
                  <span className={`badge badge-${item.status}`}>{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem' }}>Latest Activity</h3>
          <Link to="/logs" className="btn btn-secondary btn-sm">Open Logs</Link>
        </div>
        {latestLogs.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>No activity has been recorded yet.</p>
        ) : (
          <div className="list-stack">
            {latestLogs.map((log) => (
              <div key={log.id} className="mini-row">
                <div>
                  <div className="mini-row-title">{log.action.replace(/_/g, ' ')}</div>
                  <div className="mini-row-sub">{log.details || 'No additional details'} · {new Date(log.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
