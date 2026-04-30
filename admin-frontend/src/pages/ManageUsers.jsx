import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { useAdminAuth } from '../context/AdminAuthContext';
import Icon from '../components/Icon';

export default function ManageUsers() {
  const { admin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => adminApi.getUsers().then(setUsers).catch(e => setErr(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (user) => {
    if (user.id === admin.id) return setErr("You can't delete your own account.");
    if (user.role === 'admin') return setErr("Cannot delete another admin account.");
    if (!window.confirm(`Delete user "${user.full_name}"? All their data will be lost.`)) return;
    setActionId(user.id); setErr(''); setMsg('');
    try {
      await adminApi.deleteUser(user.id);
      setMsg(`User "${user.full_name}" deleted.`);
      setUsers(u => u.filter(x => x.id !== user.id));
    } catch (e) { setErr(e.message); }
    finally { setActionId(null); }
  };

  const handleToggle = async (user) => {
    if (user.id === admin.id) return setErr("You can't deactivate your own account.");
    setActionId(user.id); setErr(''); setMsg('');
    try {
      const updated = await adminApi.toggleUser(user.id);
      setMsg(`User "${user.full_name}" ${updated.is_active ? 'activated' : 'deactivated'}.`);
      setUsers(u => u.map(x => x.id === user.id ? { ...x, is_active: updated.is_active } : x));
    } catch (e) { setErr(e.message); }
    finally { setActionId(null); }
  };

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="admin-header">
        <h1>Manage Users</h1>
        <p>{users.length} registered users</p>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <div className="filter-bar">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          style={{ flex: 1, maxWidth: '380px' }}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} style={{ opacity: !user.is_active ? 0.55 : 1 }}>
                <td style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>#{user.id}</td>
                <td style={{ fontWeight: 500 }}>
                  {user.full_name}
                  {user.id === admin.id && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--accent)' }}>You</span>
                  )}
                </td>
                <td style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>{user.email}</td>
                <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                <td>
                  <span style={{
                    display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                    background: user.is_active ? 'var(--success)' : 'var(--danger)',
                    marginRight: '0.4rem'
                  }}></span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.role !== 'admin' && user.id !== admin.id ? (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                        disabled={actionId === user.id}
                        onClick={() => handleToggle(user)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={actionId === user.id}
                        onClick={() => handleDelete(user)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty"><div className="icon"><Icon name="users" size={24} /></div><p>No users found.</p></div>
      )}
    </div>
  );
}
