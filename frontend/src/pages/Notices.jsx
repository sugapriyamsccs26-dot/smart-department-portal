import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Notices({ user }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });
  const [msg, setMsg] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => { loadNotices(); }, []);
  async function loadNotices() {
    setLoading(true);
    try { setNotices(await api.get('/notices')); } catch { setNotices([]); } finally { setLoading(false); }
  }

  async function postNotice(e) {
    e.preventDefault(); 
    if (pdfError) return;
    setMsg('');

    const submitData = async (finalContent) => {
      try {
        await api.post('/notices', { ...form, content: finalContent });
        setMsg('Notice posted!');
        setShowForm(false);
        setForm({ title: '', content: '', category: 'general' });
        setPdfFile(null);
        setPdfError('');
        loadNotices();
      } catch (err) { 
        setMsg(err.message); 
      }
    };

    if (pdfFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        submitData(form.content + `\n\n|||ATTACHMENT|||${pdfFile.name}|||${reader.result}`);
      };
      reader.onerror = () => setMsg('Error reading file');
      reader.readAsDataURL(pdfFile);
    } else {
      submitData(form.content);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setPdfError('');
    if (!file) {
      setPdfFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are allowed');
      setPdfFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError('File size must be less than 5MB');
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  }

  async function deleteNotice(id) {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try { 
      await api.delete(`/notices/${id}`); 
      setMsg('Notice deleted!');
      loadNotices(); 
    } catch (err) { 
      alert('Delete failed: ' + err.message);
    }
  }

  const CAT_COLORS = { general: 'badge-primary', academic: 'badge-info', exam: 'badge-absent', placement: 'badge-late', event: 'badge-present' };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="section-title">📢 Notice Board</h2>
        {(user.role === 'staff' || user.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Post Notice</button>
        )}
      </div>
      <p className="section-subtitle">Department announcements, circulars and academic updates</p>

      {showForm && (
        <div className="card mb-6">
          <div className="card-header">
            <span className="card-title">📝 New Notice</span>
            <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
          </div>
          {msg && <div className={`alert ${msg.includes('!') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={postNotice}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['general', 'academic', 'exam', 'placement', 'event'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="form-control" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Upload PDF (optional)</label>
              <input key={pdfFile ? pdfFile.name : 'empty'} type="file" className="form-control" accept="application/pdf" onChange={handleFileChange} />
              {pdfError && <div style={{ color: '#e74c3c', fontSize: 13, marginTop: 6 }}>{pdfError}</div>}
              {pdfFile && !pdfError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, padding: '10px 14px', background: 'var(--card-hover, rgba(0,0,0,0.02))', borderRadius: 6, border: '1px solid var(--card-border, #eee)' }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{pdfFile.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {pdfFile.size > 1024 * 1024 ? (pdfFile.size / 1024 / 1024).toFixed(2) + ' MB' : (pdfFile.size / 1024).toFixed(0) + ' KB'}
                    </div>
                  </div>
                  <button type="button" onClick={() => setPdfFile(null)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Remove</button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={!!pdfError}>Post Notice</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        notices.length === 0
          ? <div className="empty-state"><div className="icon">📭</div><p>No notices at this time.</p></div>
          : notices.map(n => {
            const parts = n.content.split('|||ATTACHMENT|||');
            const textContent = parts[0];
            const hasAttachment = parts.length > 1;
            let attachName = '', attachData = '';
            if (hasAttachment) {
              const attachParts = parts[1].split('|||');
              attachName = attachParts[0];
              attachData = attachParts[1];
            }

            return (
            <div key={n.id} className="notice-card">
              <div className={`notice-dot ${n.category === 'event' ? 'event' : n.category === 'exam' ? 'exam' : n.category === 'placement' ? 'placement' : ''}`} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="notice-title">{n.title}</div>
                  <span className={`badge ${CAT_COLORS[n.category] || 'badge-primary'}`}>{n.category}</span>
                </div>
                <div className="notice-meta" style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{textContent}</div>
                
                {hasAttachment && (
                  <div style={{ marginTop: 12 }}>
                    <a href={attachData} download={attachName} className="btn btn-sm btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      📄 View PDF / Download ({attachName})
                    </a>
                  </div>
                )}
                
                <div className="notice-meta" style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid var(--card-border, #eee)' }}>
                  Posted by {n.posted_by_name} · {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
              {(user.role === 'admin' || user.role === 'staff') && (
                <button className="btn btn-danger btn-sm" title="Delete Notice" onClick={() => deleteNotice(n.id)}>🗑️</button>
              )}
            </div>
          )})
      )}
    </div>
  );
}
