import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyClaims().then(setClaims).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="page-header">
        <h1>My Claims</h1>
        <p>{claims.length} claim{claims.length !== 1 ? 's' : ''} submitted</p>
      </div>

      {claims.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🏷️</div>
          <h3>No claims yet</h3>
          <p>Browse items and submit a claim if you find yours.</p>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Items</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {claims.map(c => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <Link to={`/items/${c.item_id}`} style={{ fontWeight: 600, fontSize: '1.05rem' }}>{c.item_name}</Link>
                    <span className={`badge badge-${c.type}`}>{c.type}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                    {c.category} · {c.location}
                  </div>
                </div>
                <span className={`badge badge-${c.status}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                  {c.status}
                </span>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg3)', borderRadius: '8px', fontSize: '0.875rem' }}>
                <div style={{ color: 'var(--text2)', marginBottom: '0.3rem' }}>Your claim message:</div>
                <div>{c.claim_message}</div>
              </div>

              {c.admin_response && (
                <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: c.status === 'approved' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '8px', fontSize: '0.875rem', border: `1px solid ${c.status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <div style={{ color: 'var(--text2)', marginBottom: '0.3rem' }}>Admin response:</div>
                  <div>{c.admin_response}</div>
                </div>
              )}

              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
                Submitted {new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
