import { useState, useEffect } from 'react';
import { api } from '../api';

const ROLES = ['student', 'staff', 'admin', 'alumni'];
const PROGRAMS = ['MSc CS', 'MSc AI & DS', 'MCA', 'MTech CS'];

export default function UserManagement({ user, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState('student');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ user_id: '', name: '', email: '', password: '', role: 'student', program: 'MSc CS', semester: 1, batch_year: '', designation: '' });
  const [msg, setMsg] = useState('');
  const [resetPwd, setResetPwd] = useState({ uid: null, name: '', pwd: '' });
  const [editUser, setEditUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Load ALL users once — filtering is done on the frontend
  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.get('/users?role=all');
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault(); setMsg('');
    try {
      if (editUser) {
        await api.patch(`/users/${editUser.id}`, { name: form.name, email: form.email });
        setMsg('✅ User updated!');
      } else {
        await api.post('/users', form);
        setMsg('✅ User created!');
      }
      setShowForm(false);
      setEditUser(null);
      setForm({ user_id: '', name: '', email: '', password: '', role: 'student', program: 'MSc CS', semester: 1, batch_year: '', designation: '' });
      load();
    } catch (err) { setMsg('❌ ' + err.message); }
  }

  function handleEdit(u) {
    setEditUser(u);
    setForm({
      user_id: u.user_id,
      name: u.name,
      email: u.email,
      role: u.role,
      program: u.program || 'MSc CS',
      semester: u.semester || 1,
      batch_year: u.batch_year || '',
      designation: u.designation || ''
    });
    setShowForm(true);
  }

  async function deleteUser(u) {
    if (!confirm(`Delete user ${u.name}? This is permanent.`)) return;
    try { await api.delete(`/users/${u.id}`); load(); } // reload full list after delete
    catch (err) { alert(err.message); }
  }

  async function resetPassword(e) {
    e.preventDefault();
    try {
      await api.patch(`/users/${resetPwd.uid}/password`, { password: resetPwd.pwd });
      alert('✅ Password reset!');
      setResetPwd({ uid: null, name: '', pwd: '' });
    } catch (err) { alert(err.message); }
  }

  // Counts always from FULL dataset — stable across filter switches
  const roleCounts = {
    student: users.filter(u => u.role === 'student').length,
    staff:   users.filter(u => u.role === 'staff').length,
    admin:   users.filter(u => u.role === 'admin').length,
    alumni:  users.filter(u => u.role === 'alumni').length,
  };

  // Frontend-only filtering: role then search
  const filtered = users
    .filter(u => u.role === filterRole)
    .filter(u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_id?.toLowerCase().includes(search.toLowerCase())
    );

  const roleColors = { admin: 'var(--accent2)', staff: 'var(--primary-light)', student: 'var(--accent)', alumni: 'var(--accent3)' };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="section-title">🔑 User Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Create User</button>
      </div>
      <p className="section-subtitle">Create, manage and reset credentials for all portal users</p>

      {/* Create User Form */}
      {showForm && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">➕ New User</span></div>
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">User ID (Employee/Reg No)</label>
              <input className="form-control" value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} required readOnly={!!editUser} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            {!editUser && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-control" 
                    value={form.password} 
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                    required 
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3a2d',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
              </select>
            </div>
            {form.role === 'student' && (
              <>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Program</label>
                  <select className="form-control" value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))}>
                    {PROGRAMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Semester</label>
                  <input type="number" className="form-control" min={1} max={4} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Batch Year (e.g. 2024-26)</label>
                  <input className="form-control" value={form.batch_year} onChange={e => setForm(f => ({ ...f, batch_year: e.target.value }))} />
                </div>
              </>
            )}
            {form.role === 'staff' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Designation</label>
                <input className="form-control" placeholder="e.g. Assistant Professor" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
              </div>
            )}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">{editUser ? 'Update User' : 'Create User'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditUser(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPwd.uid && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, maxWidth: '90vw' }}>
            <div className="card-header"><span className="card-title">🔐 Reset Password — {resetPwd.name}</span></div>
            <form onSubmit={resetPassword}>
              <div className="form-group">
                <label className="form-label">New Password (min 6 chars)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showResetPassword ? 'text' : 'password'} 
                    className="form-control" 
                    minLength={6} 
                    value={resetPwd.pwd} 
                    onChange={e => setResetPwd(r => ({ ...r, pwd: e.target.value }))} 
                    autoFocus 
                    required 
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3a2d',
                      cursor: 'pointer'
                    }}
                  >
                    {showResetPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-danger">Reset Password</button>
                <button type="button" className="btn btn-secondary" onClick={() => setResetPwd({ uid: null, name: '', pwd: '' })}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter bar + stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" placeholder="🔍 Search name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        {ROLES.map(r => (
          <button key={r} className={`btn btn-sm ${filterRole === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterRole(r)} style={{ textTransform: 'capitalize' }}>
            {r}
          </button>
        ))}
        <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>{filtered.length} {filterRole}s</span>
      </div>

      {/* Role summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {ROLES.map(r => (
          <div
            key={r}
            className="card"
            style={{ padding: '10px 20px', display: 'flex', gap: 10, alignItems: 'center', minWidth: 120, cursor: 'pointer', border: filterRole === r ? `2px solid ${roleColors[r]}` : '2px solid transparent' }}
            onClick={() => setFilterRole(r)}
          >
            <div style={{ fontSize: 22 }}>{r === 'admin' ? '🛡️' : r === 'staff' ? '🧑‍🏫' : r === 'student' ? '🎓' : '🤝'}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: roleColors[r] }}>{roleCounts[r]}</div>
              <div className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>{r}s</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Details</th><th>Joined</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7}><div className="empty-state"><p>No users found.</p></div></td></tr>
                  : filtered.map(u => (
                    <tr key={u.id}>
                      <td><span className="badge badge-info">{u.user_id}</span></td>
                      <td className="fw-700">{u.name}</td>
                      <td className="text-muted" style={{ fontSize: 12 }}>{u.email}</td>
                      <td><span className="badge" style={{ background: `${roleColors[u.role]}22`, color: roleColors[u.role], border: `1px solid ${roleColors[u.role]}44` }}>{u.role}</span></td>
                      <td className="text-sm text-muted">{
                        u.role === 'student' ? `${u.program} · Sem ${u.semester}` :
                        u.role === 'staff' ? u.designation :
                        u.role === 'alumni' ? `${u.alumni_program} · ${u.current_company || 'N/A'}` :
                        u.role === 'admin' ? 'System Admin' : '—'
                      }</td>
                      <td className="text-sm text-muted">{u.created_at?.slice(0, 10)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-info" title="View Profile" onClick={() => onNavigate('profile', { targetUserId: u.id })}>👤</button>
                          <button className="btn btn-sm btn-primary" title="Edit" onClick={() => handleEdit(u)}>✏️</button>
                          <button className="btn btn-sm btn-secondary" title="Reset Password" onClick={() => setResetPwd({ uid: u.id, name: u.name, pwd: '' })}>🔐</button>
                          {u.id !== user.id && <button className="btn btn-sm btn-danger" title="Delete" onClick={() => deleteUser(u)}>🗑️</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
