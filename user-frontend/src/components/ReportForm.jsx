import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Icon from './Icon';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Documents', 'Jewelry', 'Bags', 'Keys', 'Sports', 'Other'];

export default function ReportForm({ type }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    item_name: '', category: '', description: '',
    location: '', date_lost_or_found: '', public_details: '',
    hidden_verification_details: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImg = (e) => {
    const f = e.target.files[0];
    if (f) { setImage(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);

      let data;
      if (type === 'lost') {
        data = await api.reportLost(fd);
        setSuccess('Lost item reported successfully!');
      } else {
        data = await api.reportFound(fd);
        setSuccess('Found item reported successfully!');
        const foundMatches = data.possible_matches || [];
        if (foundMatches.length > 0) setMatches(foundMatches);
        setTimeout(() => navigate('/my/reports'), foundMatches.length ? 5000 : 2000);
        return;
      }
      setTimeout(() => navigate('/my/reports'), 2000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const isLost = type === 'lost';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '700px' }}>
      <div className="page-header">
        <h1>{isLost ? 'Report Lost Item' : 'Report Found Item'}</h1>
        <p>{isLost ? 'Share enough detail for others to recognize your item.' : 'Help the owner identify and claim their belongings.'}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">
          {success}
          {matches.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <strong>Possible matches found:</strong>
              {matches.map(m => (
                <div key={m.id} style={{ marginTop: '0.4rem', fontSize: '0.85rem' }}>
                  • <a href={`/items/${m.id}`}>{m.item_name}</a> — {m.location}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Item Name *</label>
              <input value={form.item_name} onChange={e => set('item_name', e.target.value)} placeholder="e.g. Black iPhone 14" required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location *</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Library 2nd floor" required />
            </div>
            <div className="form-group">
              <label>Date {isLost ? 'Lost' : 'Found'} *</label>
              <input type="date" value={form.date_lost_or_found} onChange={e => set('date_lost_or_found', e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the item in detail..." />
          </div>

          <div className="form-group">
            <label>Public Details</label>
            <textarea value={form.public_details} onChange={e => set('public_details', e.target.value)} placeholder="Details visible to everyone, e.g. colour, brand, size..." style={{ minHeight: '80px' }} />
          </div>

          <div className="form-group">
            <label>
              <span style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                <Icon name="lock" size={14} />
                Hidden Verification Details
              </span>
              <span style={{ color: 'var(--text2)', fontWeight: 400, marginLeft: '0.5rem' }}>(only admin can see this)</span>
            </label>
            <textarea value={form.hidden_verification_details} onChange={e => set('hidden_verification_details', e.target.value)}
              placeholder={isLost ? "e.g. My name 'John D.' written on the back, serial number 12345" : "e.g. A scratch on the left side, stickers inside the bag"}
              style={{ minHeight: '80px' }} />
          </div>

          <div className="form-group">
            <label>Photo (optional)</label>
            <input className="file-input" type="file" accept="image/*" onChange={handleImg} style={{ padding: '0.6rem' }} />
            {preview && <img src={preview} alt="preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.75rem' }} />}
          </div>

          <button type="submit" className={`btn ${isLost ? 'btn-danger' : 'btn-success'}`} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Submitting...' : `Submit ${isLost ? 'Lost' : 'Found'} Report`}
          </button>
        </form>
      </div>
    </div>
  );
}
