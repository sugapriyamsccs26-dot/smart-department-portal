import { useState, useEffect, useRef } from 'react';
import { api, API_ROOT } from '../api';

const TYPES = ['notes', 'ppt', 'lab_manual', 'question_paper', 'syllabus'];
const TYPE_ICONS = { notes: '📄', ppt: '📊', lab_manual: '🧪', question_paper: '📝', syllabus: '📋' };
const PROGRAMS = ['MSc CS', 'MSc AI & DS', 'MCA', 'MTech CS'];

export default function Materials({ user }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', type: 'notes', program: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);

  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';

  useEffect(() => { load(); }, [filterType, filterProgram]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterProgram !== 'all') params.append('program', filterProgram);
      setMaterials(await api.get(`/materials?${params}`));
    } catch { setMaterials([]); } finally { setLoading(false); }
  }

  async function deleteAllMaterials() {
    if (window.confirm("Are you sure you want to delete ALL study materials? This action cannot be undone.")) {
      try {
        await api.delete('/materials/all');
        setMaterials([]);
        setMsg('✅ All materials deleted successfully.');
      } catch (err) {
        setMsg('❌ Failed to delete all materials.');
      }
    }
  }


  async function upload(e) {
    e.preventDefault(); setMsg(''); setUploading(true);
    try {
      if (file) {
        // Real file upload via FormData
        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('type', form.type);
        if (form.program) fd.append('program', form.program);

        await api.post('/materials', fd);
        setMsg('✅ File uploaded successfully!');
      } else {
        await api.post('/materials', { ...form, file_path: '/uploads/placeholder.pdf' });
        setMsg('✅ Material added!');
      }
      setShowForm(false);
      setFile(null);
      setForm({ title: '', description: '', type: 'notes', program: '' });
      load();
    } catch (err) { setMsg('❌ ' + err.message); }
    finally { setUploading(false); }
  }

  const filtered = materials.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.uploaded_by_name?.toLowerCase().includes(search.toLowerCase())
  );

  function getFileExt(fp) {
    return fp?.split('.').pop()?.toUpperCase() || 'FILE';
  }

  function getExtColor(ext) {
    const colors = { PDF: '#ff6b6b', PPTX: '#ff9f43', PPT: '#ff9f43', DOCX: '#4dd9f4', DOC: '#4dd9f4', ZIP: '#ffd93d' };
    return colors[ext] || '#8890b5';
  }

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="section-title">📚 Study Materials</h2>
        <div style={{ display: 'flex', gap: 10 }}>
           {isStaffOrAdmin && <button className="btn btn-danger" onClick={deleteAllMaterials}>🗑️ Delete All</button>}
           {isStaffOrAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Upload Material</button>}
        </div>
      </div>
      <p className="section-subtitle">Course notes, slides, lab manuals, question papers and syllabi</p>

      {/* Upload Form */}
      {showForm && isStaffOrAdmin && (
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">📤 Upload Material</span></div>
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
          <form onSubmit={upload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
              <label className="form-label">Title</label>
              <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Data Structures Unit 1 Notes" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Program (optional)</label>
              <select className="form-control" value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))}>
                <option value="">All Programs</option>
                {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            {/* File drop zone */}
            <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
              <label className="form-label">File (PDF, PPTX, DOCX, ZIP — max 50MB)</label>
              <div
                style={{
                  border: `2px dashed ${file ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer',
                  background: file ? 'rgba(0,212,170,0.06)' : 'transparent', transition: 'all 0.2s'
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
              >
                <input ref={fileRef} type="file" accept=".pdf,.pptx,.ppt,.docx,.doc,.zip,.txt" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                {file
                  ? <div><div style={{ fontSize: 32, marginBottom: 8 }}>📎</div><div className="fw-700">{file.name}</div><div className="text-sm text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</div></div>
                  : <div><div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div><div style={{ fontWeight: 600 }}>Drop file here or click to browse</div><div className="text-sm text-muted">PDF, PPTX, DOCX, ZIP up to 50 MB</div></div>
                }
              </div>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? '⏳ Uploading…' : '📤 Upload'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setFile(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" placeholder="🔍 Search materials…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        {['all', ...TYPES].map(t => (
          <button key={t} className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterType(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'all' ? 'All' : `${TYPE_ICONS[t]} ${t.replace('_', ' ')}`}
          </button>
        ))}
        <select className="form-control btn-sm" style={{ width: 140 }} value={filterProgram} onChange={e => setFilterProgram(e.target.value)}>
          <option value="all">All Programs</option>
          {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div className="card-grid card-grid-3">
          {filtered.length === 0
            ? <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon">📚</div><p>No materials found.</p></div>
            : filtered.map(m => {
              const ext = getFileExt(m.file_path);
              const extColor = getExtColor(ext);
              return (
                <div key={m.id} className="card">
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, background: `${extColor}22`, border: `1.5px solid ${extColor}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: extColor }}>{ext}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card-title" style={{ fontSize: 13, lineHeight: 1.4 }}>{m.title}</div>
                      <div className="text-sm text-muted" style={{ marginTop: 3 }}>By {m.uploaded_by_name}</div>
                    </div>
                  </div>
                  {m.description && <p className="text-sm text-muted mb-4" style={{ lineHeight: 1.5 }}>{m.description}</p>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <span className="badge badge-info">{TYPE_ICONS[m.type]} {m.type?.replace('_', ' ')}</span>
                    {m.program && <span className="badge badge-primary">{m.program}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <a href={`${API_ROOT}${m.file_path}`} target="_blank" rel="noreferrer"
                      className="btn btn-accent btn-sm">⬇️ Download</a>
                    {isStaffOrAdmin && <button className="btn btn-danger btn-sm" onClick={() => api.delete(`/materials/${m.id}`).then(load)}>🗑️</button>}
                    <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>{m.uploaded_at?.slice(0, 10)}</span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
