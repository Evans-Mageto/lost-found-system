import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

const features = [
  {
    icon: 'report',
    title: 'Structured item reports',
    desc: 'Capture the item name, category, location, date, public details, private verification notes, and an optional photo.',
  },
  {
    icon: 'search',
    title: 'Focused discovery',
    desc: 'Search and filter reports by item type, category, location, date range, and current status.',
  },
  {
    icon: 'shield',
    title: 'Claim verification',
    desc: 'Claimants must provide identifying details so administrators can compare answers before approving a handover.',
  },
  {
    icon: 'activity',
    title: 'Personal tracking',
    desc: 'Signed-in users can follow their reports, submitted claims, and admin responses from one dashboard.',
  },
];

const steps = [
  ['Report', 'Submit a lost or found item with clear location and identification details.'],
  ['Review', 'Browse matching reports and submit a claim when an item looks like yours.'],
  ['Verify', 'Administrators review claim details before approving the next handover step.'],
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <section className="hero-section">
        <div className="hero-inner">
          <div>
            <div className="eyebrow">
              <Icon name="shield" size={15} />
              Campus lost and found
            </div>
            <h1 className="hero-title">
              Recover lost items with a clearer, safer process.
            </h1>
            <p className="hero-copy">
              CampusFind helps students and staff report missing property, publish found items, and route ownership claims through a simple verification workflow.
            </p>
            <div className="hero-actions">
              <Link to="/search" className="btn btn-primary">
                <Icon name="search" size={18} />
                Browse Items
              </Link>
              {user ? (
                <>
                  <Link to="/report/lost" className="btn btn-secondary">
                    <Icon name="report" size={18} />
                    Report Lost Item
                  </Link>
                  <Link to="/report/found" className="btn btn-secondary">
                    <Icon name="package" size={18} />
                    Report Found Item
                  </Link>
                </>
              ) : (
                <Link to="/register" className="btn btn-secondary">Create Account</Link>
              )}
            </div>
          </div>

          <div className="hero-panel" aria-label="How CampusFind works">
            <div className="hero-panel-header">
              <div>
                <div className="panel-kicker">Workflow</div>
                <h2 style={{ fontSize: '1.2rem' }}>From report to return</h2>
              </div>
              <span className="icon-tile"><Icon name="activity" size={20} /></span>
            </div>
            <div className="process-list">
              {steps.map(([title, desc], index) => (
                <div className="process-row" key={title}>
                  <span className="icon-tile" style={{ width: 42, height: 42 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Built for day-to-day campus use</h2>
            <p>Every screen is designed around the real tasks people need after something goes missing: reporting, searching, claiming, and checking status.</p>
          </div>
          <div className="feature-grid">
            {features.map((f) => (
              <div key={f.title} className="card feature-card">
                <span className="icon-tile"><Icon name={f.icon} size={20} /></span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <div className="section-header">
            <h2>Clear records, better decisions</h2>
            <p>CampusFind keeps public item details separate from private verification details so the return process can stay organized and responsible.</p>
          </div>
          <div className="info-grid">
            <div className="card info-card">
              <h3>For people who lost something</h3>
              <p>Submit a report with enough public detail for others to recognize the item while keeping owner-only clues private for verification.</p>
            </div>
            <div className="card info-card">
              <h3>For people who found something</h3>
              <p>Publish the found item quickly, include where it was found, and help the owner prove the item is theirs before it is released.</p>
            </div>
            <div className="card info-card">
              <h3>For administrators</h3>
              <p>Review reports, manage item status, evaluate claims, and keep an activity trail of important decisions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2 style={{ fontSize: '1.35rem' }}>Ready to check the latest reports?</h2>
              <p>Browse live reports from registered users or sign in to manage your own activity.</p>
            </div>
            <Link to={user ? '/dashboard' : '/search'} className="btn btn-primary">
              {user ? 'Open Dashboard' : 'Browse Items'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
