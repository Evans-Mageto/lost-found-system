import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const NAV = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/items', icon: '📦', label: 'Manage Items' },
  { to: '/claims', icon: '🏷️', label: 'Claim Requests' },
  { to: '/users', icon: '👥', label: 'Manage Users' },
  { to: '/logs', icon: '📋', label: 'Activity Logs' },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">🔍 Admin Panel</div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="icon">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginBottom: '0.75rem' }}>
            Signed in as<br />
            <strong style={{ color: 'var(--text)' }}>{admin?.full_name}</strong>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
