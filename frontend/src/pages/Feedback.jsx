import { useState, useEffect } from 'react';
import { api } from '../api';

const QUESTIONS = [
  { id: 'q1', label: 'Overall course quality' },
  { id: 'q2', label: 'Teaching effectiveness' },
  { id: 'q3', label: 'Content relevance & depth' },
  { id: 'q4', label: 'Faculty responsiveness' },
  { id: 'q5', label: 'Overall department experience' },
];

export default function Feedback({ user }) {
  const [form, setForm] = useState({ type: 'course', subject_id: '', rating: 5, comments: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [allFeedback, setAllFeedback] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (user.role === 'admin') loadAllFeedback();
  }, [user.role]);

  async function loadAllFeedback() {
    setLoadingList(true);
    try {
      const data = await api.get('/feedback');
      setAllFeedback(data);
    } catch (err) { console.error(err); }
    finally { setLoadingList(false); }
  }

  async function deleteFeedback(id) {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      setAllFeedback(allFeedback.filter(f => f.id !== id));
    } catch (err) { alert(err.message); }
  }

  async function submit(e) {
    e.preventDefault(); setMsg(''); setLoading(true);
    try {
      await api.post('/feedback', form);
      setMsg('✅ Thank you for your feedback! It has been submitted.');
      setForm({ type: 'course', subject_id: '', rating: 5, comments: '' });
    } catch (err) { setMsg('❌ ' + err.message); }
    finally { setLoading(false); }
  }

  const StarRating = ({ value, onChange, readonly = false }) => (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} 
              onClick={() => !readonly && onChange(s)}
              style={{ fontSize: readonly ? 18 : 28, cursor: readonly ? 'default' : 'pointer', color: s <= value ? '#f59e0b' : '#d1d5db' }}>
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="animate-in">
      <h2 className="section-title">💬 Feedback Management</h2>
      <p className="section-subtitle">Gathering insights to build a better department experience</p>

      {user.role === 'admin' ? (
        <div className="card mt-6">
          <div className="card-header"><span className="card-title">All Submitted Feedback</span></div>
          {loadingList ? <div className="flex-center" style={{ padding: 40 }}><div className="spinner" /></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Rating</th>
                    <th>Comments</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allFeedback.length === 0 ? <tr><td colSpan={7} className="text-center py-8">No feedback records found.</td></tr> : 
                    allFeedback.map(f => (
                      <tr key={f.id}>
                        <td className="text-muted text-sm">{new Date(f.submitted_at).toLocaleDateString()}</td>
                        <td className="fw-700">{f.from_user}</td>
                        <td><span className="badge badge-primary">{f.type}</span></td>
                        <td className="text-muted">{f.subject_id || 'N/A'}</td>
                        <td><StarRating value={f.rating} readonly /></td>
                        <td style={{ maxWidth: 300, fontSize: 13 }}>{f.comments}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteFeedback(f.id)}>Delete</button>
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
        <>
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'} mb-6`}>{msg}</div>}
          <div className="card-grid card-grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">📝 Submit Your Feedback</span></div>
              <form onSubmit={submit}>
                <div className="form-group">
                  <label className="form-label">Feedback Target</label>
                  <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {['course', 'faculty', 'department'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject / Course ID (optional)</label>
                  <input className="form-control" placeholder="e.g. MCA201" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Rating</label>
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Comments</label>
                  <textarea className="form-control" rows={5} placeholder="Tell us more about your experience..." value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
                  {loading ? '⏳ Submitting...' : '📤 Send Feedback'}
                </button>
              </form>
            </div>

            <div className="card" style={{ background: 'var(--surface2)', borderColor: 'var(--border-hover)' }}>
              <div style={{ padding: 20 }}>
                <h3 className="card-title mb-4">Why your feedback matters?</h3>
                <p className="text-muted mb-6" style={{ lineHeight: 1.6 }}>
                  Your insights are the most valuable tool we have for improving our curriculum, faculty interactions, 
                  and department culture. We review every submission carefully to implement meaningful changes.
                </p>
                <div className="divider mb-6" />
                <div className="text-sm">
                  <div className="fw-700 mb-2">🔒 Secure & Authentic</div>
                  <p className="text-muted">
                    While we store your name for record-keeping, only authorized administrators can view aggregated results
                    and comments to ensure a constructive feedback loop.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
