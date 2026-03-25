import { useState } from 'react';
import { api, saveAuth } from '../api';

const ROLES = [
  { key: 'student', label: '🎓 Student' },
  { key: 'staff',   label: '🧑‍🏫 Staff' },
  { key: 'admin',   label: '🛡️ Admin' },
  { key: 'alumni',  label: '🏅 Alumni' },
];

const HINTS = {
  student: { id: '24MCA01',    pwd: 'Student@1234', label: 'Student' },
  staff:   { id: 'BDU1660758', pwd: 'Staff@1234',   label: 'Staff' },
  admin:   { id: 'BDU1670884', pwd: 'Admin@1234',   label: 'Admin' },
  alumni:  { id: 'ALM2022001', pwd: 'Alumni@1234',  label: 'Alumni' },
};

export default function Login({ onLogin }) {
  const [role, setRole] = useState('student');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api.post('/auth/login', { user_id: userId, password });
      saveAuth(data.token, data.user);
      onLogin(data.user);
    } catch (err) {
      if (err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'))) {
        setError('Login failed. Please try again.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally { setLoading(false); }
  }

  function handleRoleChange(r) {
    setRole(r);
    setError('');
    setUserId('');
    setPassword('');
  }

  const hint = HINTS[role];

  return (
    <div className="login-page">
      <div className="login-card animate-in">
        <div className="login-logo">
          <div className="icon">🏛️</div>
          <h1>Smart Department Portal</h1>
          <p>School of Computer Application &amp; Engineering</p>
        </div>

        <div className="role-selector">
          {ROLES.map(r => (
            <button key={r.key} className={`role-btn ${role === r.key ? 'active' : ''}`} onClick={() => handleRoleChange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {role === 'student' ? 'Registration Number' : role === 'staff' ? 'Staff ID' : role === 'admin' ? 'Admin ID' : 'Alumni ID'}
            </label>
            <input className="form-control" type="text"
              placeholder={`Enter your ${role === 'student' ? 'Reg. No.' : role + ' ID'}`}
              value={userId} onChange={e => setUserId(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="form-control" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter your password"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ paddingRight: '45px' }}
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
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3a2d',
                  cursor: 'pointer',
                  zIndex: 2
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} type="submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : '🔐 Sign In'}
          </button>
        </form>

        {hint.id && (
          <div className="text-center" style={{ marginTop: 20, padding: '10px 14px', background: 'var(--card)', borderRadius: 8, border: '1px solid var(--card-border)' }}>
            <p className="text-sm text-muted" style={{ marginBottom: 4 }}>Default {hint.label} credentials:</p>
            <p className="text-sm">
              ID: <code style={{ color: 'var(--primary-light)' }}>{hint.id}</code>
              &nbsp;/&nbsp;
              Password: <code style={{ color: 'var(--primary-light)' }}>{hint.pwd}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
