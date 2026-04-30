import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import Icon from './Icon';

const NAV = [
  { to: '/', icon: 'chart', label: 'Dashboard', end: true },
  { to: '/items', icon: 'package', label: 'Manage Items' },
  { to: '/claims', icon: 'tag', label: 'Claim Requests' },
  { to: '/users', icon: 'users', label: 'Manage Users' },
  { to: '/logs', icon: 'activity', label: 'Activity Logs' },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark"><Icon name="shield" size={18} /></span>
          Admin Panel
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="nav-icon"><Icon name={n.icon} size={18} /></span>
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
