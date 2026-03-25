import { useState, useEffect } from 'react';
import { api, API_ROOT } from '../api';

function GradeTag({ total }) {
  if (total >= 90) return <span style={{ fontWeight: 800, color: '#00d4aa' }}>O</span>;
  if (total >= 80) return <span style={{ fontWeight: 800, color: '#00d4aa' }}>A+</span>;
  if (total >= 70) return <span style={{ fontWeight: 800, color: '#6c63ff' }}>A</span>;
  if (total >= 60) return <span style={{ fontWeight: 800, color: '#4dd9f4' }}>B+</span>;
  if (total >= 50) return <span style={{ fontWeight: 800, color: '#ffd93d' }}>B</span>;
  return <span style={{ fontWeight: 800, color: '#ff6b6b' }}>F</span>;
}

function GradePoint({ total }) {
  if (total >= 90) return 10;
  if (total >= 80) return 9;
  if (total >= 70) return 8;
  if (total >= 60) return 7;
  if (total >= 50) return 6;
  return 0;
}

export default function Profile({ user, pageData }) {
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentDbId, setStudentDbId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', qualification: '', experience_years: 0, specialization: '' });
  const [updateMsg, setUpdateMsg] = useState('');
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const targetId = pageData?.targetUserId || user.id;
  const isSelf = targetId === user.id;
  const canEdit = isSelf || user.role === 'admin';

  useEffect(() => { loadProfile(); }, [targetId]);

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await api.get(`/users/${targetId}/profile`);
      setProfile(data.profile);
      setDocuments(data.documents || []);
      setFormData({
        name: data.profile.name || '',
        phone: data.profile.phone || '',
        address: data.profile.address || '',
        qualification: data.profile.qualification || '',
        experience_years: data.profile.experience_years || 0,
        specialization: data.profile.specialization || ''
      });

      if (data.profile.role === 'student' && data.profile.student_db_id) {
         setStudentDbId(data.profile.student_db_id);
         const attAnalytics = await api.get(`/analytics/student/${data.profile.student_db_id}`);
         setAnalytics(attAnalytics);
      }
    } catch (e) {
      console.error("Profile load error:", e);
    } finally { setLoading(false); }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!formData.name.trim()) return setUpdateMsg('Name is required');
    try {
      if (isSelf) {
        await api.put('/auth/profile', formData);
        const { updateLocalUser } = await import('../api');
        updateLocalUser({ name: formData.name.trim() });
      } else if (user.role === 'admin') {
        await api.patch(`/users/${targetId}`, { name: formData.name.trim(), email: profile.email });
      }
      setUpdateMsg('Profile updated successfully!');
      setTimeout(() => setUpdateMsg(''), 3000);
      setEditing(false);
      loadProfile();
    } catch (err) {
      setUpdateMsg(err.message);
    }
  }

  async function handleUploadDoc(e) {
    e.preventDefault();
    if (!docFile || !docName) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('document', docFile);
    fd.append('doc_name', docName);
    try {
      await api.post(`/users/${targetId}/documents`, fd);
      setDocName('');
      setDocFile(null);
      loadProfile();
    } catch (err) { alert(err.message); }
    finally { setUploading(false); }
  }

  if (loading) return <div className="flex-center" style={{ height: 400 }}><div className="spinner" /></div>;
  if (!profile) return <div className="alert alert-error">User profile not found.</div>;

  const initials = profile.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const cgpa = analytics?.cgpa || 'N/A';
  const overallAtt = analytics?.overallAttendance || 0;
  const marks = analytics?.marksStats || [];
  const attStats = analytics?.attStats || [];

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h2 className="section-title">👤 {isSelf ? 'My Profile' : `${profile.name}'s Profile`}</h2>
          <p className="section-subtitle">{profile.role === 'student' ? 'Academic overview performance' : 'Professional profile and staff details'}</p>
        </div>
        {canEdit && (
          <button className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setEditing(!editing)}>
            {editing ? '✖ Cancel' : '✏️ Edit Profile'}
          </button>
        )}
      </div>

      {updateMsg && <div className={`alert ${updateMsg.includes('successfully') ? 'alert-success' : 'alert-error'} mb-4`}>{updateMsg}</div>}

      {editing && (
        <div className="card mb-6 animate-in">
          <div className="card-header"><span className="card-title">📝 Update Profile Information</span></div>
          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input className="form-control" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
              </div>
              {(profile.role === 'staff' || profile.role === 'admin') && (
                <>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                    <label className="form-label">Home Address</label>
                    <input className="form-control" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Qualification</label>
                    <input className="form-control" value={formData.qualification} onChange={e => setFormData(f => ({ ...f, qualification: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Years of Experience</label>
                    <input type="number" className="form-control" value={formData.experience_years} onChange={e => setFormData(f => ({ ...f, experience_years: Number(e.target.value) }))} />
                  </div>
                  <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                    <label className="form-label">Specialization</label>
                    <input className="form-control" value={formData.specialization} onChange={e => setFormData(f => ({ ...f, specialization: e.target.value }))} />
                  </div>
                </>
              )}
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,170,0.06))' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 40px rgba(108,99,255,0.4)'
          }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit', margin: 0 }}>{profile.name}</h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>{profile.email}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="badge badge-primary">🆔 {profile.user_id}</span>
              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{profile.role}</span>
              {profile.role === 'student' && (
                <>
                  <span className="badge badge-present">{profile.program}</span>
                  <span className="tag">Sem {profile.semester} · {profile.batch_year}</span>
                </>
              )}
              {(profile.role === 'staff' || profile.role === 'admin') && (
                <>
                  <span className="badge badge-present">{profile.designation || 'Faculty Member'}</span>
                  <span className="tag">📅 Joined {profile.joining_date}</span>
                </>
              )}
            </div>
          </div>
          {/* CGPA display - only for students */}
          {profile.role === 'student' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'conic-gradient(var(--primary) 0% 84%, rgba(255,255,255,0.06) 84%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', boxShadow: '0 0 30px rgba(108,99,255,0.3)'
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--bg2)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--primary-light)' }}>{cgpa}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>CGPA</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card-grid card-grid-4 mb-6">
        {(profile.role === 'student' ? [
          { icon: '📋', label: 'Attendance', value: `${overallAtt}%`, color: overallAtt >= 75 ? 'green' : 'red' },
          { icon: '📊', label: 'CGPA', value: cgpa, color: 'blue' },
          { icon: '📚', label: 'Courses', value: marks.length, color: 'yellow' },
          { icon: '🏅', label: 'Grade', value: cgpa >= 9 ? 'O' : cgpa >= 8 ? 'A+' : cgpa >= 7 ? 'A' : cgpa >= 6 ? 'B+' : 'B', color: 'green' },
        ] : [
          { icon: '🏢', label: 'Department', value: profile.department?.split(' ')[0] || 'CS', color: 'blue' },
          { icon: '🎓', label: 'Qualification', value: profile.qualification || 'PhD/ME', color: 'green' },
          { icon: '⏳', label: 'Experience', value: `${profile.experience_years || 5}+ Yrs`, color: 'yellow' },
          { icon: '📜', label: 'Specialization', value: profile.specialization?.split(' ')[0] || 'AI', color: 'red' },
        ]).map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="value">{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-grid card-grid-2">
        {profile.role === 'student' ? (
          <>
            {/* Marks Table */}
            <div className="card">
              <div className="card-header"><span className="card-title">📊 Marks Record</span></div>
              {marks.length === 0 ? <div className="empty-state"><p>No marks yet.</p></div> : (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Course</th><th>Int.</th><th>Ext.</th><th>Total</th><th>Grade</th><th>GP</th></tr></thead>
                    <tbody>
                      {marks.map(m => (
                        <tr key={m.course_id + m.semester}>
                          <td><span className="badge badge-info">{m.course_id}</span></td>
                          <td>{m.internal_marks}</td>
                          <td>{m.external_marks}</td>
                          <td className="fw-700">{m.total}</td>
                          <td><GradeTag total={m.total} /></td>
                          <td style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{GradePoint({ total: m.total })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Attendance by course */}
            <div className="card">
              <div className="card-header"><span className="card-title">📋 Attendance by Course</span></div>
              {attStats.length === 0 ? <div className="empty-state"><p>No attendance records yet.</p></div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {attStats.map(a => (
                    <div key={a.course_id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{a.course_id}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: a.pct >= 75 ? 'var(--accent)' : 'var(--accent2)' }}>{a.pct}% <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({a.present}/{a.total})</span></span>
                      </div>
                      <div className="attendance-bar">
                        <div className={`attendance-fill ${a.pct < 75 ? (a.pct < 60 ? 'danger' : 'warning') : ''}`} style={{ width: `${a.pct}%` }} />
                      </div>
                      {a.pct < 75 && (
                        <div style={{ fontSize: 11, color: 'var(--accent2)', marginTop: 4 }}>
                          ⚠️ Below 75% — need {Math.ceil((0.75 * a.total - a.present) / 0.25)} more classes
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
             <div className="card">
                <div className="card-header"><span className="card-title">📄 Permanent Documents</span></div>
                {isSelf && (
                  <form onSubmit={handleUploadDoc} style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(0,0,0,0.02)' }}>
                     <input className="form-control" style={{ flex: 1 }} placeholder="Document Label (e.g. Degree Certificate)" value={docName} onChange={e => setDocName(e.target.value)} required />
                     <input type="file" style={{ fontSize: 11 }} onChange={e => setDocFile(e.target.files[0])} required />
                     <button className="btn btn-sm btn-primary" type="submit" disabled={uploading}>{uploading ? '...' : '➕ Upload'}</button>
                  </form>
                )}
                {documents.length === 0 ? <div className="empty-state" style={{ padding: 24 }}><p>No documents uploaded.</p></div> : (
                  <div className="table-wrapper">
                    <table>
                      <thead><tr><th>Document Name</th><th>Uploaded At</th><th>Action</th></tr></thead>
                      <tbody>
                        {documents.map(doc => (
                          <tr key={doc.id}>
                            <td className="fw-700">{doc.doc_name}</td>
                            <td className="text-muted text-sm">{doc.uploaded_at.slice(0, 10)}</td>
                            <td><a href={`${API_ROOT}${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">👁️ View</a></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
             <div className="card">
                <div className="card-header"><span className="card-title">📍 Contact & Address</span></div>
                <div style={{ padding: 16 }}>
                   <div style={{ marginBottom: 16 }}>
                      <label className="text-muted text-sm" style={{ display: 'block', marginBottom: 4 }}>Phone Number</label>
                      <div className="fw-700">{profile.phone || '8903333123'}</div>
                   </div>
                   <div style={{ marginBottom: 16 }}>
                      <label className="text-muted text-sm" style={{ display: 'block', marginBottom: 4 }}>Home Address</label>
                      <div className="fw-700" style={{ lineHeight: 1.5 }}>{profile.address || 'H-21, University Staff Quarters, Khajamalai Campus, BDU'}</div>
                   </div>
                   <div>
                      <label className="text-muted text-sm" style={{ display: 'block', marginBottom: 4 }}>Research Specialization</label>
                      <div className="badge badge-info">{profile.specialization || 'Cloud Computing & Distributed Systems'}</div>
                   </div>
                </div>
             </div>
          </>
        )}
      </div>
    </div>
  );
}
