import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import Icon from '../components/Icon';

const ACTION_COLORS = {
  USER_REGISTERED: '#818cf8',
  ITEM_REPORTED: '#22c55e',
  CLAIM_SUBMITTED: '#f59e0b',
  CLAIM_APPROVED: '#22c55e',
  CLAIM_REJECTED: '#ef4444',
  ITEM_DELETED: '#ef4444',
  ITEM_STATUS_UPDATED: '#6366f1',
  USER_DELETED: '#ef4444',
  USER_DEACTIVATED: '#f59e0b',
  USER_ACTIVATED: '#22c55e',
};

const ACTION_ICONS = {
  USER_REGISTERED: 'user',
  ITEM_REPORTED: 'package',
  CLAIM_SUBMITTED: 'tag',
  CLAIM_APPROVED: 'check',
  CLAIM_REJECTED: 'x',
  ITEM_DELETED: 'trash',
  ITEM_STATUS_UPDATED: 'refresh',
  USER_DELETED: 'trash',
  USER_DEACTIVATED: 'alert',
  USER_ACTIVATED: 'check',
};

export default function ActivityLogs() {
  const [data, setData] = useState({ logs: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getLogs({ page: p, limit: 30 });
      setData(res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  return (
    <div>
      <div className="admin-header">
        <h1>Activity Logs</h1>
        <p>{data.total} recorded events</p>
      </div>

      {err && <div className="alert alert-error">{err}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : data.logs.length === 0 ? (
        <div className="empty"><div className="icon"><Icon name="activity" size={24} /></div><p>No activity logged yet.</p></div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {data.logs.map((log, i) => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.9rem 1.2rem',
                borderBottom: i < data.logs.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                  background: `${ACTION_COLORS[log.action] || '#6b7280'}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: ACTION_COLORS[log.action] || '#6b7280'
                }}>
                  <Icon name={ACTION_ICONS[log.action] || 'activity'} size={17} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: ACTION_COLORS[log.action] || 'var(--text2)',
                      fontFamily: 'Space Mono, monospace'
                    }}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {log.details && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{log.details}</div>
                  )}
                  {(log.full_name || log.email) && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '0.2rem' }}>
                      by {log.full_name || log.email}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', flexShrink: 0, textAlign: 'right' }}>
                  {new Date(log.created_at).toLocaleDateString()}<br />
                  <span style={{ fontFamily: 'Space Mono, monospace' }}>
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
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
