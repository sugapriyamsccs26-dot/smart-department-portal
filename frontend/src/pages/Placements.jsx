import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Placements({ user }) {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company_name: '', role: '', package: '', type: 'full_time', location: '', apply_link: '', deadline: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setPlacements(await api.get('/placements')); } catch { setPlacements([]); } finally { setLoading(false); }
  }

  async function create(e) {
    e.preventDefault(); setMsg('');
    try { await api.post('/placements', form); setMsg('Posted!'); setShowForm(false); load(); }
    catch (err) { setMsg(err.message); }
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="section-title">💼 Placements</h2>
        {user.role === 'admin' && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Opportunity</button>}
      </div>
      <p className="section-subtitle">Job opportunities, internships and placement drives</p>

      {showForm && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">➕ New Placement</span></div>
          {msg && <div className="alert alert-error">{msg}</div>}
          <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Company Name', 'company_name', 'text'], ['Role / Position', 'role', 'text'], ['Package (LPA)', 'package', 'text'], ['Location', 'location', 'text'], ['Apply Link', 'apply_link', 'url'], ['Deadline', 'deadline', 'date']].map(([label, key, type]) => (
              <div key={key} className="form-group" style={{ margin: 0 }}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-control" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="full_time">Full Time</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Post</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div className="card-grid card-grid-3">
          {placements.length === 0
            ? <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon">💼</div><p>No placement listings yet.</p></div>
            : placements.map(p => (
              <div key={p.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏢</div>
                  <div>
                    <div className="fw-700" style={{ fontSize: 15 }}>{p.company_name}</div>
                    <div className="text-sm text-muted">{p.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span className={`badge ${p.type === 'internship' ? 'badge-info' : 'badge-present'}`}>{p.type.replace('_', ' ')}</span>
                  {p.package && <span className="badge badge-primary">💰 {p.package}</span>}
                  {p.location && <span className="tag">📍 {p.location}</span>}
                </div>
                {p.deadline && <div className="text-sm text-muted" style={{ marginBottom: 12 }}>📅 Deadline: {p.deadline}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  {p.apply_link && <a className="btn btn-accent btn-sm" href={p.apply_link} target="_blank" rel="noreferrer">Apply Now →</a>}
                  {user.role === 'admin' && <button className="btn btn-danger btn-sm" onClick={() => api.delete(`/placements/${p.id}`).then(load)}>🗑️</button>}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
