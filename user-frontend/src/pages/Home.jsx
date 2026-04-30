import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0f14 0%, #1a1f35 50%, #0d0f14 100%)',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(79,142,247,0.12)',
            border: '1px solid rgba(79,142,247,0.3)', color: 'var(--accent)',
            padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.8rem',
            marginBottom: '1.5rem', fontFamily: 'Space Mono, monospace'
          }}>
            Campus Lost & Found System
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.2rem' }}>
            Lost something?<br />
            <span style={{ color: 'var(--accent)' }}>We'll help you find it.</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Report lost or found items on campus. Connect with others and get your belongings back quickly.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/search" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>Browse Items</Link>
            {user ? (
              <>
                <Link to="/report/lost" className="btn btn-secondary">Report Lost Item</Link>
                <Link to="/report/found" className="btn btn-secondary">Report Found Item</Link>
              </>
            ) : (
              <Link to="/register" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>Get Started</Link>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '📋', title: 'Report Items', desc: 'Quickly report lost or found items with descriptions, location, and photos.' },
            { icon: '🔎', title: 'Smart Search', desc: 'Filter by category, location, date, and type to find matching items fast.' },
            { icon: '✅', title: 'Verified Claims', desc: 'Claim items using secret verification details only the true owner would know.' },
            { icon: '🔔', title: 'Track Status', desc: 'Follow your reports and claims in real-time from your personal dashboard.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
