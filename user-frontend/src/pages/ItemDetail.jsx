import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [claim, setClaim] = useState({ claim_message: '', verification_answer: '' });
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getItem(id).then(setItem).catch(() => navigate('/search')).finally(() => setLoading(false));
  }, [id]);

  const submitClaim = async (e) => {
    e.preventDefault();
    setClaimError(''); setSubmitting(true);
    try {
      await api.submitClaim({ item_id: parseInt(id), ...claim });
      setClaimSuccess('Claim submitted! The admin will review it shortly.');
      setShowClaim(false);
    } catch (err) { setClaimError(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!item) return null;

  const canClaim = user && item.reporter_id !== user.id && item.status === 'pending';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '780px' }}>
      <Link to="/search" style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>← Back to Search</Link>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        {item.image_url && (
          <img src={item.image_url} alt={item.item_name} style={{
            width: '100%', maxHeight: '340px', objectFit: 'cover',
            borderRadius: '8px', marginBottom: '1.5rem'
          }} />
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className={`badge badge-${item.type}`}>{item.type}</span>
          <span className={`badge badge-${item.status}`}>{item.status}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text2)', marginLeft: 'auto' }}>
            Reported by {item.reporter_name}
          </span>
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.2rem' }}>{item.item_name}</h1>

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Category', value: item.category },
            { label: 'Location', value: item.location },
            { label: 'Date', value: new Date(item.date_lost_or_found).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text2)', fontSize: '0.875rem', width: '80px', flexShrink: 0 }}>{f.label}</span>
              <span style={{ fontWeight: 500 }}>{f.value}</span>
            </div>
          ))}
        </div>

        {item.description && (
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ color: 'var(--text2)', fontSize: '0.875rem', marginBottom: '0.4rem' }}>Description</div>
            <p style={{ color: 'var(--text)' }}>{item.description}</p>
          </div>
        )}

        {item.public_details && (
          <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ color: 'var(--text2)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Additional Details</div>
            <p>{item.public_details}</p>
          </div>
        )}

        {claimSuccess && <div className="alert alert-success">{claimSuccess}</div>}

        {canClaim && !claimSuccess && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            {!showClaim ? (
              <button className="btn btn-primary" onClick={() => setShowClaim(true)}>
                Submit a Claim
              </button>
            ) : (
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Claim This Item</h3>
                <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                  Answer the verification question to prove you are the rightful owner.
                </div>
                {claimError && <div className="alert alert-error">{claimError}</div>}
                <form onSubmit={submitClaim}>
                  <div className="form-group">
                    <label>Why is this item yours? Describe any unique identifying features.</label>
                    <textarea value={claim.claim_message} onChange={e => setClaim({ ...claim, claim_message: e.target.value })} placeholder="Describe why this belongs to you..." required />
                  </div>
                  <div className="form-group">
                    <label>Verification Answer (something only the owner would know)</label>
                    <input value={claim.verification_answer} onChange={e => setClaim({ ...claim, verification_answer: e.target.value })} placeholder="e.g. my name is written inside, serial number, etc." required />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Claim'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowClaim(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {!user && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'var(--text2)', marginBottom: '1rem' }}>You must be logged in to claim this item.</p>
            <Link to="/login" className="btn btn-primary">Login to Claim</Link>
          </div>
        )}
      </div>
    </div>
  );
}
