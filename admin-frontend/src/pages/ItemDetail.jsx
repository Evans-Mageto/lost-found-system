import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../api';

const STATUSES = ['pending', 'matched', 'claimed', 'returned'];

function Field({ label, value }) {
  return (
    <div style={{
      padding: '0.85rem 1rem',
      background: 'var(--bg3)',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      marginBottom: '0.75rem'
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.3rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: '0.925rem' }}>{value || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Not provided</span>}</div>
    </div>
  );
}

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminApi.getItem(id).then(setItem).catch(() => navigate('/items')).finally(() => setLoading(false));
  }, [id]);

  const handleStatus = async (status) => {
    setUpdating(true); setErr(''); setMsg('');
    try {
      const updated = await adminApi.updateItemStatus(id, status);
      setItem(updated);
      setMsg(`Status updated to "${status}".`);
    } catch (e) { setErr(e.message); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this item permanently?')) return;
    setDeleting(true);
    try { await adminApi.deleteItem(id); navigate('/items'); }
    catch (e) { setErr(e.message); setDeleting(false); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!item) return null;

  return (
    <div style={{ maxWidth: '780px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/items" style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>← Back to Items</Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : '🗑 Delete Item'}
          </button>
        </div>
      </div>

      {err && <div className="alert alert-error">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        {item.image_url && (
          <img src={item.image_url} alt={item.item_name}
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.2rem' }} />
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={`badge badge-${item.type}`}>{item.type}</span>
          <span className={`badge badge-${item.status}`}>{item.status}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text2)', marginLeft: 'auto' }}>
            Reported {new Date(item.created_at).toLocaleString()}
          </span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.2rem' }}>{item.item_name}</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <Field label="Category" value={item.category} />
          <Field label="Location" value={item.location} />
          <Field label="Date Lost/Found" value={new Date(item.date_lost_or_found).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <Field label="Status" value={item.status} />
        </div>

        <Field label="Description" value={item.description} />
        <Field label="Public Details" value={item.public_details} />

        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            🔒 Hidden Verification Details (Admin Only)
          </div>
          <div>{item.hidden_verification_details || <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Not provided</span>}</div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '0.5rem' }}>Reporter</div>
          <div style={{ fontWeight: 500 }}>{item.reporter_name}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text2)' }}>{item.reporter_email}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Update Status</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`btn btn-sm ${item.status === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleStatus(s)}
              disabled={updating || item.status === s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}