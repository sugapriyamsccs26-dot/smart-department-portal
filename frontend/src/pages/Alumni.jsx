import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Alumni({ user }) {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: user.name || '', batch_year: '', program: 'MSc CS', current_company: '', current_role: '', linkedin: '', available_for_mentorship: false });
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setAlumni(await api.get('/alumni')); } catch { setAlumni([]); } finally { setLoading(false); }
  }

  async function submit(e) {
    e.preventDefault(); setMsg('');
    try { 
      await api.post('/alumni', { ...form, available_for_mentorship: form.available_for_mentorship ? 1 : 0 }); 
      import('../api').then(m => m.updateLocalUser({ name: form.name }));
      setMsg('Profile updated successfully!'); 
      setShowForm(false); 
      load(); 
    }
    catch (err) { setMsg(err.message); }
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="section-title">🤝 Alumni Network</h2>
        {user.role === 'alumni' && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>Update My Profile</button>}
      </div>
      <p className="section-subtitle">Connect with graduates, find mentors, and explore career paths</p>

      {showForm && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">🎓 Alumni Profile</span></div>
          {msg && <div className={`alert ${msg.includes('!') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            {[['Batch Year', 'batch_year'], ['Current Company', 'current_company'], ['Current Role', 'current_role'], ['LinkedIn URL', 'linkedin']].map(([label, key]) => (
              <div key={key} className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{label}</label>
                <input className="form-control" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Program</label>
              <select className="form-control" value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))}>
                {['MSc CS', 'MSc AI & DS', 'MCA', 'MTech CS'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="mentor" checked={form.available_for_mentorship} onChange={e => setForm(f => ({ ...f, available_for_mentorship: e.target.checked }))} style={{ width: 18, height: 18 }} />
              <label htmlFor="mentor" className="form-label" style={{ margin: 0 }}>Available for Mentorship</label>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Save Profile</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div className="card-grid card-grid-3">
          {alumni.length === 0
            ? <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon">🤝</div><p>No alumni profiles yet.</p></div>
            : alumni.filter(a => !a.name?.toLowerCase().includes('karthi keyan')).filter((a, i, self) => i === self.findIndex(t => t.name?.toLowerCase() === a.name?.toLowerCase())).map(a => {
              const initials = a.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div key={a.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div className="user-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>{initials}</div>
                    <div>
                      <div className="fw-700">{a.name}</div>
                      <div className="text-sm text-muted">{a.program} · {a.batch_year}</div>
                    </div>
                  </div>
                  {a.current_company && <div className="text-sm mb-4">🏢 {a.current_role} @ {a.current_company}</div>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {a.available_for_mentorship ? <span className="badge badge-present">🎯 Mentor Available</span> : <span className="badge badge-primary">Alumni</span>}
                  </div>
                  {a.linkedin && (
                    <a 
                      href={a.linkedin.startsWith('http') ? a.linkedin : `https://www.linkedin.com/in/${a.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary btn-sm" 
                      style={{ marginTop: 12, display: 'inline-flex', cursor: 'pointer', alignItems: 'center', gap: 6 }}
                      onClick={(e) => {
                        e.preventDefault();
                        const url = a.linkedin.startsWith('http') ? a.linkedin : `https://www.linkedin.com/in/${a.linkedin}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
