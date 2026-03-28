import { useState, useEffect } from 'react';
import { api, API_ROOT } from '../api';

export default function Assignments({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', course_id: '', due_date: '' });
  const [msg, setMsg] = useState('');

  // Submissions view for staff/admin
  const [selectedAsgn, setSelectedAsgn] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // File upload state for students
  const [uploads, setUploads] = useState({}); // { asgnId: File }
  const [submitting, setSubmitting] = useState({});
  const [monthlyCount, setMonthlyCount] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
       const data = await api.get('/assignments');
       setAssignments(data);
       // Count how many this user created this month (for staff limits)
       if (user.role === 'staff' || user.role === 'admin') {
         const now = new Date();
         const thisMonthCount = data.filter(a => {
           // We'll rely on our own user_id if we have it, or created_by_name as fallback
           // Note: backend 'created_by' in SQL is internal ID, but we often display name
           const createdAt = new Date(a.created_at);
           const isSamMonth = createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
           const isMe = a.created_by_name === user.name;
           return isSamMonth && isMe;
         }).length;
         setMonthlyCount(thisMonthCount);
       }
    } catch { setAssignments([]); } finally { setLoading(false); }
  }

  async function create(e) {
    e.preventDefault(); setMsg('');
    try { 
      await api.post('/assignments', form); 
      setMsg('✅ Assignment created!'); 
      setShowForm(false); load(); 
    } catch (err) { 
      // Show the monthly limit message clearly
      setMsg('❌ ' + (err.message || 'Failed to create assignment.'));
    }
  }

  async function loadSubmissions(asgn) {
    setSelectedAsgn(asgn);
    setLoadingSubmissions(true);
    try {
      const data = await api.get(`/assignments/${asgn.id}/submissions`);
      setSubmissions(data);
    } catch (err) { alert(err.message); }
    finally { setLoadingSubmissions(false); }
  }

  async function handleFileUpload(asgnId) {
    const file = uploads[asgnId];
    if (!file) { alert('Please select a file first.'); return; }
    
    setSubmitting(s => ({ ...s, [asgnId]: true }));
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/assignments/${asgnId}/submit`, formData);
      alert('✅ Assignment submitted successfully!');
      setUploads(u => ({ ...u, [asgnId]: null }));
    } catch (err) { alert('❌ ' + err.message); }
    finally { setSubmitting(s => ({ ...s, [asgnId]: false })); }
  }

  async function deleteAsgn(id) {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const res = await api.delete(`/assignments/${id}`);
      alert(res.message || 'Assignment deleted.');
      load();
    } catch (err) { 
      console.error('Delete frontend error:', err);
      alert('Delete Error: ' + err.message); 
    }
  }

  async function clearAllAsgn() {
    if (!window.confirm('DANGER: This will delete ALL assignments permanently. Proceed?')) return;
    try {
      const res = await api.delete('/assignments');
      alert(res.message || 'All assignments cleared.');
      load();
    } catch (err) { 
      console.error('Clear All frontend error:', err);
      alert('Clear All Error: ' + err.message); 
    }
  }

  function daysLeft(due) {
    const diff = Math.ceil((new Date(due) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: 'Overdue', color: '#ef4444' };
    if (diff === 0) return { text: 'Due Today', color: '#f59e0b' };
    return { text: `${diff} days left`, color: diff <= 3 ? '#f59e0b' : '#3b82f6' };
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 className="section-title">📝 Learning Assessments</h2>
          <p className="section-subtitle">Manage coursework, submissions and academic tracking</p>
        </div>
        {(user.role === 'staff' || user.role === 'admin') && !selectedAsgn && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {user.role === 'staff' && (
              <span className={`badge ${monthlyCount >= 2 ? 'badge-error' : 'badge-info'}`} style={{ fontSize: 12 }}>
                📅 This Month: {monthlyCount}/2 assignments
              </span>
            )}
            {user.role === 'admin' && (
              <button className="btn btn-secondary" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444' }} onClick={clearAllAsgn}>
                🗑️ Clear All
              </button>
            )}
            {(user.role === 'admin' || monthlyCount < 2) && (
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '+ New Assignment'}
              </button>
            )}
            {user.role === 'staff' && monthlyCount >= 2 && (
              <button className="btn btn-secondary" disabled title="Monthly limit reached">
                🔒 Limit Reached
              </button>
            )}
          </div>
        )}
        {selectedAsgn && (
          <button className="btn btn-ghost" onClick={() => setSelectedAsgn(null)}>← Back to List</button>
        )}
      </div>

      {showForm && !selectedAsgn && (
        <div className="card mb-6 animate-in">
          <div className="card-header"><span className="card-title">➕ Create New Assignment</span></div>
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'} mb-4`}>{msg}</div>}
          <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
              <label className="form-label">Title</label>
              <input className="form-control" placeholder="Assignment name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subject Code</label>
              <input className="form-control" placeholder="e.g. MCA205" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Deadline</label>
              <input type="datetime-local" className="form-control" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
              <label className="form-label">Detailed Instructions</label>
              <textarea className="form-control" rows={3} placeholder="Provide assignment details and submission requirements..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" className="btn btn-primary w-full py-3">Publish Assignment</button>
            </div>
          </form>
        </div>
      )}

      {selectedAsgn ? (
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">Submission Tracking: {selectedAsgn.title}</span>
          </div>
          {loadingSubmissions ? <div className="flex-center" style={{ padding: 40 }}><div className="spinner" /></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Registration No</th>
                    <th>Student Name</th>
                    <th>Program</th>
                    <th>Submission Date</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? <tr><td colSpan={5} className="text-center py-8">No submissions received yet.</td></tr> : 
                    submissions.map(s => (
                      <tr key={s.id}>
                        <td className="fw-700">{s.registration_no}</td>
                        <td>{s.name}</td>
                        <td><span className="badge badge-info">{s.program} (S{s.semester})</span></td>
                        <td className="text-muted text-sm">{new Date(s.submitted_at).toLocaleString()}</td>
                        <td>
                          <a 
                            href={`${API_ROOT}${s.file_path}`} 
                            download 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-sm btn-ghost" 
                            style={{ color: '#3b82f6' }}
                          >
                            📂 Download
                          </a>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
          <div className="card-grid card-grid-3">
            {assignments.length === 0
              ? <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon">📝</div><p>No active assignments.</p></div>
              : assignments.map(a => {
                const { text: dl, color } = daysLeft(a.due_date);
                return (
                  <div key={a.id} className="card asgn-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                      <div className="icon-badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: 40, height: 40, fontSize: 20 }}>📝</div>
                      <div style={{ flex: 1 }}>
                        <div className="fw-700">{a.title}</div>
                        <span className="text-xs text-muted">ID: {a.course_id}</span>
                      </div>
                      {(user.role === 'staff' || user.role === 'admin') && (
                        <button className="btn btn-ghost p-2" style={{ color: '#ef4444', height: 'auto' }} onClick={() => deleteAsgn(a.id)} title="Delete Assignment">
                          🗑️
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-muted mb-6" style={{ flexGrow: 1 }}>{a.description}</p>
                    
                    <div className="divider mb-4" />
                    
                    <div className="flex-between mb-6">
                      <span className="fw-700 text-sm" style={{ color }}>⏰ {dl}</span>
                      <span className="text-xs text-muted">&nbsp; Due: {new Date(a.due_date).toLocaleDateString()}</span>
                    </div>

                    {user.role === 'student' ? (
                      <div className="mt-auto">
                        <div style={{ position: 'relative', marginBottom: 10 }}>
                          <input type="file" 
                                 id={`file-${a.id}`}
                                 style={{ position: 'absolute', opacity: 0, width: 0 }}
                                 onChange={(e) => setUploads(u => ({ ...u, [a.id]: e.target.files[0] }))} />
                          <label htmlFor={`file-${a.id}`} className="btn btn-ghost w-full btn-sm" style={{ border: '1px dashed var(--border)', fontSize: 13, height: 'auto', padding: '6px 12px' }}>
                            {uploads[a.id] ? `📎 ${uploads[a.id].name}` : '📁 Choose File'}
                          </label>
                        </div>
                        <button className="btn btn-primary w-full btn-sm" 
                                onClick={() => handleFileUpload(a.id)}
                                disabled={submitting[a.id] || !uploads[a.id]}>
                          {submitting[a.id] ? '⏳ Submitting...' : '📤 Submit'}
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary w-full" onClick={() => loadSubmissions(a)}>View Submissions</button>
                    )}
                    
                    <div className="text-xs text-muted text-center mt-4">Posted by {a.created_by_name}</div>
                  </div>
                );
              })}
          </div>
        )
      )}
    </div>
  );
}
