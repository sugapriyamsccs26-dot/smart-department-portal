import { useState, useEffect } from 'react';
import { api } from '../api';

const CLASS_MAP = {
  'II MCA':    { program: 'MCA' },
  'II MSc CS': { program: 'MSc CS' },
  'II MSc DS': { program: 'MSc DS' },
  'II MSc AI': { program: 'MSc AI' },
  'IV MTech':  { program: 'MTech' },
};

const CLASSES = Object.keys(CLASS_MAP);

export default function Students({ user }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState('');
  const [classStats, setClassStats]       = useState([]);

  // Load summary stats on mount
  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const rows = await api.get('/students/classes');
      setClassStats(rows);
    } catch { setClassStats([]); }
  }

  async function loadStudents(cls) {
    if (!cls) { setStudents([]); return; }
    setLoading(true);
    try {
      const rows = await api.get(`/students/by-class?class_name=${encodeURIComponent(cls)}`);
      setStudents(rows);
    } catch { setStudents([]); }
    finally { setLoading(false); }
  }

  function handleClassChange(cls) {
    setSelectedClass(cls);
    setSearch('');
    loadStudents(cls);
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.reg_no?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <h2 className="section-title">👥 Students</h2>
      <p className="section-subtitle">Real-time student directory — select a class to view the roster</p>

      {/* Class Summary Cards */}
      <div className="card-grid card-grid-5 mb-6" style={{ '--grid-cols': 5 }}>
        {CLASSES.map(cls => {
          const stat = classStats.find(s => s.class_name === cls);
          const isActive = selectedClass === cls;
          return (
            <div
              key={cls}
              className="card"
              style={{
                cursor: 'pointer',
                border: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s',
                textAlign: 'center',
              }}
              onClick={() => handleClassChange(cls)}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎓</div>
              <div className="fw-700" style={{ fontSize: 13, color: isActive ? 'var(--accent)' : 'inherit' }}>{cls}</div>
              <div className="text-muted text-sm mt-2">
                {stat ? `${stat.student_count} students` : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Student List */}
      {selectedClass && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <span className="card-title">📋 {selectedClass} — Student List ({filtered.length})</span>
            <input
              className="form-control"
              placeholder="🔍 Search name or Reg No..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 260, marginLeft: 'auto' }}
            />
          </div>

          {loading ? (
            <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><p>No students found.</p></div></td></tr>
                  ) : filtered.map((s, i) => (
                    <tr key={s.reg_no}>
                      <td className="text-muted text-sm">{i + 1}</td>
                      <td><span className="badge badge-info">{s.reg_no}</span></td>
                      <td className="fw-700">{s.name}</td>
                      <td><span className="badge badge-primary">{s.program}</span></td>
                      <td className="text-muted">{s.class_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
          <p className="fw-700" style={{ fontSize: 16 }}>Select a class above to view students</p>
          <p className="text-muted text-sm">All data is loaded live from the database</p>
        </div>
      )}
    </div>
  );
}
