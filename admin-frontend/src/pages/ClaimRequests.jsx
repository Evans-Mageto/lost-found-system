import { useEffect, useState } from 'react';
import { adminApi } from '../api';

function Modal({ claim, onClose, onApprove, onReject }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handle = async (action) => {
    setLoading(true); setErr('');
    try {
      if (action === 'approve') await onApprove(claim.id, response || 'Your claim has been approved.');
      else await onReject(claim.id, response || 'Your claim has been rejected.');
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Review Claim #{claim.id}</h2>

        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.3rem', textTransform: 'uppercase', fontWeight: 600 }}>Item</div>
          <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{claim.item_name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{claim.type} · {claim.category} · {claim.location}</div>
        </div>

        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.3rem', textTransform: 'uppercase', fontWeight: 600 }}>Claimant</div>
          <div style={{ fontWeight: 500 }}>{claim.claimant_name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{claim.claimant_email}</div>
        </div>

        <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.3rem', textTransform: 'uppercase', fontWeight: 600 }}>Claim Message</div>
          <div style={{ fontSize: '0.9rem' }}>{claim.claim_message}</div>
        </div>

        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#fcd34d', marginBottom: '0.3rem', textTransform: 'uppercase', fontWeight: 600 }}>Verification Answer</div>
          <div style={{ fontSize: '0.9rem' }}>{claim.verification_answer}</div>
        </div>

        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginBottom: '0.3rem', textTransform: 'uppercase', fontWeight: 600 }}>🔒 Hidden Verification Details</div>
          <div style={{ fontSize: '0.9rem' }}>{claim.hidden_verification_details || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Not provided</span>}</div>
        </div>

        {err && <div className="alert alert-error">{err}</div>}

        <div className="form-group">
          <label>Admin Response (optional message to claimant)</label>
          <textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Add a note for the claimant..." style={{ minHeight: '70px' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn btn-success" onClick={() => handle('approve')} disabled={loading} style={{ flex: 1 }}>
            ✅ Approve
          </button>
          <button className="btn btn-danger" onClick={() => handle('reject')} disabled={loading} style={{ flex: 1 }}>
            ❌ Reject
          </button>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function ClaimRequests() {
  const [data, setData] = useState({ claims: [], total: 0, pages: 1 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getClaims({ status, page: p, limit: 15 });
      setData(res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const handleApprove = async (id, msg) => {
    await adminApi.approveClaim(id, msg);
    setMsg('Claim approved successfully.');
    load(page);
  };

  const handleReject = async (id, msg) => {
    await adminApi.rejectClaim(id, msg);
    setMsg('Claim rejected.');
    load(page);
  };

  const statusColor = (s) => ({ pending: 'var(--warning)', approved: 'var(--success)', rejected: 'var(--danger)' }[s] || 'var(--text2)');

  return (
    <div>
      <div className="admin-header">
        <h1>Claim Requests</h1>
        <p>Review and respond to item claims submitted by users</p>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <div className="filter-bar">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="btn btn-primary" onClick={() => load(1)}>Filter</button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text2)', marginLeft: 'auto' }}>{data.total} total claims</span>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : data.claims.length === 0 ? (
        <div className="empty"><div className="icon">🏷️</div><p>No claims found.</p></div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Claimant</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.claims.map(claim => (
                  <tr key={claim.id}>
                    <td style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>#{claim.id}</td>
                    <td style={{ fontWeight: 500 }}>{claim.item_name}</td>
                    <td><span className={`badge badge-${claim.type}`}>{claim.type}</span></td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{claim.claimant_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{claim.claimant_email}</div>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{new Date(claim.created_at).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${claim.status}`}>{claim.status}</span></td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setSelected(claim); setMsg(''); setErr(''); }}
                      >
                        {claim.status === 'pending' ? 'Review' : 'View'}
                      </button>
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

      {selected && (
        <Modal
          claim={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
