import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const CLASSES = ['II MCA', 'II MSc CS', 'II MSc DS', 'II MSc AI', 'IV MTech'];
const SUBJECTS = {
  'II MCA': ['Operating Systems', 'Software Engineering', 'Java Programming', 'Data Structures', 'Web Technology'],
  'II MSc CS': ['Advanced Java', 'Network Security', 'Machine Learning', 'Cloud Computing', 'IoT'],
  'II MSc DS': ['Data Science with R', 'Predictive Modeling', 'Big Data Analytics', 'Deep Learning', 'Statistics'],
  'II MSc AI': ['Artificial Intelligence', 'Natural Language Processing', 'Computer Vision', 'Robotics', 'Expert Systems'],
  'IV MTech': ['Research Methodology', 'High Performance Computing', 'Distributed Systems', 'Advanced Database', 'Software Architecture'],
  // Fallbacks for base program names
  'MCA': ['Operating Systems', 'Software Engineering', 'Java Programming'],
  'MSc CS': ['Advanced Java', 'Network Security', 'Machine Learning'],
  'MSc DS': ['Data Science', 'Big Data', 'Deep Learning'],
  'MSc AI': ['AI', 'Robotics', 'NLP'],
  'MTech': ['Research', 'HPC', 'Distributed Systems']
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Attendance({ user }) {
  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';

  // ── Admin/Staff view state ────────────────────────────────────────────────
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate]   = useState(today());
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents]           = useState([]);   // [{reg_no, name, status}]
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [statuses, setStatuses]           = useState({});   // {reg_no: 'present'|'absent'}
  const [loadingList, setLoadingList]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [msg, setMsg]                     = useState({ text: '', type: '' });

  // ── Summary / history state ───────────────────────────────────────────────
  const [summary, setSummary]             = useState(null);
  const [historyDates, setHistoryDates]   = useState([]);
  const [historyClass, setHistoryClass]   = useState('');
  const [viewHist, setViewHist]           = useState(false);
  const [histRecords, setHistRecords]     = useState([]);
  const [histDate, setHistDate]           = useState('');
  const [histSubj, setHistSubj]           = useState('');

  // ── Student (legacy analytics) ────────────────────────────────────────────
  const [analytics, setAnalytics]         = useState([]);

  useEffect(() => {
    if (isStaffOrAdmin) {
      setLoadingClasses(true);
      api.get('/students/classes')
        .then(res => setAvailableClasses(res))
        .catch(err => setMsg({ text: 'Failed to load classes: ' + err.message, type: 'error' }))
        .finally(() => setLoadingClasses(false));
    } else if (user?.user_id) {
       // Need to map user.user_id to students.id for the legacy analytics
       api.get('/students/by-class')
         .then(all => {
            const me = all.find(s => s.reg_no === user.user_id);
            if (me) {
               return api.get(`/attendance/analytics?student_id=${me.id}`);
            }
            throw new Error('Not found');
         })
         .then(setAnalytics)
         .catch(() => setAnalytics([]));
    }
  }, [isStaffOrAdmin, user]);

  // Load students + existing attendance for selected class + date
  const loadClassAttendance = useCallback(async (cls, date, subj) => {
    if (!cls || !date) return;
    const finalSubj = subj || selectedSubject || (SUBJECTS[cls] ? SUBJECTS[cls][0] : 'General');
    setLoadingList(true);
    setMsg({ text: '', type: '' });
    try {
      const rows = await api.get(
        `/attendance/by-class?class_name=${encodeURIComponent(cls)}&date=${date}&subject=${encodeURIComponent(finalSubj)}`
      );
      setStudents(rows);
      // Pre-fill statuses from existing records (default to 'present' if not marked)
      const map = {};
      rows.forEach(r => {
        map[r.reg_no] = (r.status === 'present' || r.status === 'absent') ? r.status : 'present';
      });
      setStatuses(map);
      // Load summary
      const sum = await api.get(
        `/attendance/summary?class_name=${encodeURIComponent(cls)}&date=${date}&subject=${encodeURIComponent(finalSubj)}`
      );
      setSummary(sum);
    } catch (err) { 
      setStudents([]); 
      setSummary(null);
      setMsg({ text: 'Failed to load attendance list: ' + err.message, type: 'error' });
    }
    finally { setLoadingList(false); }
  }, [selectedSubject]);

  function handleClassSelect(cls) {
    if (!cls) {
      setSelectedClass('');
      setStudents([]);
      setSummary(null);
      return;
    }
    setSelectedClass(cls);
    const firstSubj = SUBJECTS[cls] ? SUBJECTS[cls][0] : 'General';
    setSelectedSubject(firstSubj);
    setStudents([]);
    setSummary(null);
    setMsg({ text: '', type: '' });
    loadClassAttendance(cls, selectedDate, firstSubj);
  }

  function handleDateChange(date) {
    setSelectedDate(date);
    if (selectedClass) loadClassAttendance(selectedClass, date, selectedSubject);
  }

  function handleSubjectChange(subj) {
    setSelectedSubject(subj);
    if (selectedClass) loadClassAttendance(selectedClass, selectedDate, subj);
  }

  function markAll(status) {
    const updated = {};
    students.forEach(s => { updated[s.reg_no] = status; });
    setStatuses(updated);
  }

  function exportToCSV() {
    if (!selectedClass || students.length === 0) return;
    const header = "Roll No,Name,Status,Date,Subject\n";
    const body = students.map(s => `${s.reg_no},${s.name},${statuses[s.reg_no] || 'present'},${selectedDate},${selectedSubject}`).join("\n");
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedClass}_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function submitAttendance() {
    if (!selectedClass || !selectedDate || !selectedSubject || students.length === 0) {
      setMsg({ text: 'Selection is incomplete.', type: 'error' });
      return;
    }
    setSubmitting(true);
    setMsg({ text: '', type: '' });
    try {
      const records = students.map(s => ({ reg_no: s.reg_no, status: statuses[s.reg_no] || 'absent' }));
      const result = await api.post('/attendance/bulk', {
        class_name: selectedClass,
        date: selectedDate,
        subject: selectedSubject,
        records,
        marked_by: user.name || user.user_id,
      });

      // Maintain legacy synchronization
      await Promise.all(students.map(s => 
        api.post('/attendance', {
          student_id: s.reg_no,
          course_id: selectedSubject || 'General',
          date: selectedDate,
          status: statuses[s.reg_no] || 'absent',
          marked_by: user.name || user.user_id
        }).catch(e => console.error('Legacy sync error', e))
      ));

      setMsg({ text: result.message, type: 'success' });
      // Refresh summary
      const sum = await api.get(
        `/attendance/summary?class_name=${encodeURIComponent(selectedClass)}&date=${selectedDate}&subject=${encodeURIComponent(selectedSubject)}`
      );
      setSummary(sum);
    } catch (err) {
      setMsg({ text: err.message || 'Failed to submit attendance.', type: 'error' });
    } finally { setSubmitting(false); }
  }

  // Load history
  async function loadHistory(cls) {
    setHistoryClass(cls);
    setViewHist(true);
    setHistRecords([]);
    setHistDate('');
    try {
      const rows = await api.get(`/attendance/all-dates?class_name=${encodeURIComponent(cls)}`);
      setHistoryDates(rows);
    } catch { setHistoryDates([]); }
  }

  async function loadHistDetail(date, subj) {
    setHistDate(date);
    setHistSubj(subj || 'General');
    try {
      const rows = await api.get(
        `/attendance/by-class?class_name=${encodeURIComponent(historyClass)}&date=${date}&subject=${encodeURIComponent(subj || 'General')}`
      );
      setHistRecords(rows);
    } catch { setHistRecords([]); }
  }

  function getColor(pct) {
    if (pct >= 75) return 'attendance-fill';
    if (pct >= 60) return 'attendance-fill warning';
    return 'attendance-fill danger';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STUDENT VIEW
  // ══════════════════════════════════════════════════════════════════════════
  // ── Student calendar view state ─────────────────────────────────────────
  const [studentTab, setStudentTab] = useState('Weekly');
  const [detailedAtt, setDetailedAtt] = useState([]);
  const [filters, setFilters] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Fetch attendance whenever tab or filters change (student only)
  useEffect(() => {
    if (!isStaffOrAdmin && user?.user_id) {
      setLoadingStudent(true);
      const q = studentTab === 'Yearly'
        ? `year=${filters.year}`
        : `year=${filters.year}&month=${filters.month}`;
      api.get(`/attendance/student-detail?reg_no=${user.user_id}&${q}`)
        .then(setDetailedAtt)
        .catch(() => setDetailedAtt([]))
        .finally(() => setLoadingStudent(false));
    }
  }, [isStaffOrAdmin, user?.user_id, studentTab, filters.year, filters.month]);

  if (!isStaffOrAdmin) {
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const todayStr    = today();
    const nowDate     = new Date();

    // Build a lookup map: date string -> 'present' | 'absent'
    const attMap = {};
    detailedAtt.forEach(r => {
      if (!attMap[r.date]) attMap[r.date] = r.status;
      else if (r.status === 'present') attMap[r.date] = 'present'; // present wins
    });

    // Color for a date
    function cellColor(dateStr) {
      const s = attMap[dateStr];
      if (s === 'present') return { bg: '#dcfce7', border: '#86efac', text: '#166534' };
      if (s === 'absent')  return { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b' };
      return { bg: 'var(--surface2,#f3f4f6)', border: 'var(--border,#e5e7eb)', text: 'var(--text-muted,#9ca3af)' };
    }

    // Stats
    const present  = detailedAtt.filter(r => r.status === 'present').length;
    const absent   = detailedAtt.filter(r => r.status === 'absent').length;
    const total    = detailedAtt.length;
    const pct      = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

    // ── Week grid ───────────────────────────────────────────────────────────
    function WeeklyView() {
      // Show the current week (Mon-Sun) + 3 prior weeks = 4 weeks
      const weeks = [];
      const startRef = new Date(nowDate);
      startRef.setDate(startRef.getDate() - startRef.getDay()); // start of this week (Sun)
      startRef.setDate(startRef.getDate() - 21); // 3 weeks back
      for (let w = 0; w < 4; w++) {
        const days = [];
        for (let d = 0; d < 7; d++) {
          const dt = new Date(startRef);
          dt.setDate(startRef.getDate() + w * 7 + d);
          days.push(dt);
        }
        weeks.push(days);
      }
      return (
        <div style={{ transition: 'opacity 0.3s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 10 }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0', letterSpacing: 1 }}>{d}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6 }}>
              {week.map(dt => {
                const ds = dt.toISOString().slice(0, 10);
                const col = cellColor(ds);
                const isToday = ds === todayStr;
                const status = attMap[ds];
                return (
                  <div key={ds} title={ds} style={{
                    background: col.bg,
                    border: `2px solid ${isToday ? 'var(--primary,#6366f1)' : col.border}`,
                    borderRadius: 10,
                    padding: '6px 4px',
                    textAlign: 'center',
                    boxShadow: isToday ? '0 0 0 3px rgba(99,102,241,0.25)' : status ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    cursor: 'default',
                    minHeight: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: col.text }}>{dt.getDate()}</div>
                    {status === 'present' && (
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>✓</div>
                    )}
                    {status === 'absent' && (
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', lineHeight: 1 }}>✗</div>
                    )}
                    {!status && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.5 }}>·</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    // ── Monthly grid ─────────────────────────────────────────────────────────
    function MonthlyView() {
      const year  = filters.year;
      const month = filters.month; // 1–12
      const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
      const daysInMonth = new Date(year, month, 0).getDate();
      const cells = [];
      for (let i = 0; i < firstDay; i++) cells.push(null); // leading blanks
      for (let d = 1; d <= daysInMonth; d++) cells.push(d);
      while (cells.length % 7 !== 0) cells.push(null); // trailing blanks

      const rows = [];
      for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

      return (
        <div style={{ transition: 'opacity 0.3s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 10 }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0', letterSpacing: 1 }}>{d}</div>
            ))}
          </div>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 6 }}>
              {row.map((d, ci) => {
                if (!d) return <div key={ci} style={{ minHeight: 72 }} />;
                const ds = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const col = cellColor(ds);
                const isToday = ds === todayStr;
                const status = attMap[ds];
                return (
                  <div key={ds} title={ds} style={{
                    background: col.bg,
                    border: `2px solid ${isToday ? 'var(--primary,#6366f1)' : col.border}`,
                    borderRadius: 10,
                    padding: '8px 4px 6px',
                    textAlign: 'center',
                    minHeight: 72,
                    boxShadow: isToday ? '0 0 0 3px rgba(99,102,241,0.25)' : status ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'transform 0.15s',
                    cursor: 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 4,
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: col.text }}>{d}</div>
                    {status === 'present' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#16a34a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 900, color: '#fff',
                        boxShadow: '0 2px 4px rgba(22,163,74,0.4)'
                      }}>✓</div>
                    )}
                    {status === 'absent' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#dc2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 900, color: '#fff',
                        boxShadow: '0 2px 4px rgba(220,38,38,0.4)'
                      }}>✗</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    // ── Yearly mini-calendar grid ─────────────────────────────────────────────
    function YearlyView() {
      const year = filters.year;
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const daysPerMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, transition: 'opacity 0.3s' }}>
          {MONTH_NAMES.map((mName, mi) => {
            const month = mi + 1;
            const firstDay = new Date(year, mi, 1).getDay();
            const days = daysPerMonth[mi];
            const cells = [];
            for (let i = 0; i < firstDay; i++) cells.push(null);
            for (let d = 1; d <= days; d++) cells.push(d);
            while (cells.length % 7 !== 0) cells.push(null);
            const rows = [];
            for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

            return (
              <div key={mName} style={{ background: 'var(--surface,#fff)', borderRadius: 12, border: '1px solid var(--border)', padding: '10px 8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--primary,#6366f1)' }}>{mName}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, marginBottom: 4 }}>
                  {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', padding: '2px 0' }}>{d}</div>
                  ))}
                </div>
                {rows.map((row, ri) => (
                  <div key={ri} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, marginBottom: 1 }}>
                    {row.map((d, ci) => {
                      if (!d) return <div key={ci} style={{ minHeight: 20 }} />;
                      const ds = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                      const col = cellColor(ds);
                      const isToday = ds === todayStr;
                      return (
                        <div key={ds} title={ds} style={{
                          background: col.bg,
                          border: `1px solid ${isToday ? 'var(--primary,#6366f1)' : col.border}`,
                          borderRadius: 3,
                          textAlign: 'center',
                          minHeight: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: isToday ? 800 : 500,
                          color: col.text,
                          transition: 'transform 0.1s',
                          cursor: 'default',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >{d}</div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="animate-in">
        <h2 className="section-title">📋 Attendance Tracker</h2>
        <p className="section-subtitle">Monitor your academic presence with dynamic weekly, monthly, and yearly insights.</p>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px,1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total', value: total, col: 'var(--text)' },
            { label: 'Present', value: present, col: '#16a34a' },
            { label: 'Absent', value: absent, col: '#dc2626' },
            { label: 'Rate', value: `${pct}%`, col: Number(pct) >= 75 ? '#16a34a' : '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.col }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
          {/* Legend */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px', display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <div style={{ width: 14, height: 14, background: '#dcfce7', border: '1.5px solid #86efac', borderRadius: 3 }} />
              <span>Present</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <div style={{ width: 14, height: 14, background: '#fee2e2', border: '1.5px solid #fca5a5', borderRadius: 3 }} />
              <span>Absent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <div style={{ width: 14, height: 14, background: 'var(--surface2,#f3f4f6)', border: '1.5px solid var(--border)', borderRadius: 3 }} />
              <span>No data</span>
            </div>
          </div>
        </div>

        {/* View Toggles */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {['Weekly', 'Monthly', 'Yearly'].map(t => (
            <button key={t} className={`btn ${studentTab === t ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: studentTab !== t ? 'none' : '' }}
              onClick={() => setStudentTab(t)}>
              {t === 'Weekly' ? '📅' : t === 'Monthly' ? '🗓️' : '📆'} {t}
            </button>
          ))}
          {/* Year/Month Selectors */}
          <select className="form-control" style={{ width: 90, marginLeft: 'auto' }} value={filters.year}
            onChange={e => setFilters(f => ({ ...f, year: Number(e.target.value) }))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {studentTab === 'Monthly' && (
            <select className="form-control" style={{ width: 120 }} value={filters.month}
              onChange={e => setFilters(f => ({ ...f, month: Number(e.target.value) }))}>
              {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          )}
        </div>

        {/* Calendar Card */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <span className="card-title">
              {studentTab === 'Weekly'  && `Week of ${nowDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`}
              {studentTab === 'Monthly' && `${MONTH_NAMES[filters.month - 1]} ${filters.year}`}
              {studentTab === 'Yearly'  && `Year ${filters.year}`}
            </span>
          </div>
          {loadingStudent
            ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
            : (
              studentTab === 'Weekly'  ? <WeeklyView />  :
              studentTab === 'Monthly' ? <MonthlyView /> :
              <YearlyView />
            )
          }
        </div>
      </div>
    );
  }


  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN / STAFF VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="animate-in">
      <h2 className="section-title">📋 Attendance Management</h2>
      <p className="section-subtitle">Mark and monitor real-time attendance for all classes</p>

      {/* Tab: Mark | History */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          type="button"
          className={`btn ${!viewHist ? 'btn-primary' : 'btn-ghost'}`}
          onClick={(e) => { e.preventDefault(); setViewHist(false); }}
        >✏️ Mark Attendance</button>
        <button
          type="button"
          className={`btn ${viewHist ? 'btn-primary' : 'btn-ghost'}`}
          onClick={(e) => { e.preventDefault(); setViewHist(true); }}
        >📊 View History</button>
      </div>

      {/* ── MARK ATTENDANCE TAB ──────────────────────────────────────────── */}
      {!viewHist && (
        <>
          {/* Class Selector */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Step 1 — Select Class & Date</span></div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ margin: 0, minWidth: 200 }}>
                <label className="form-label">Class</label>
                <select
                  className="form-control"
                  value={selectedClass}
                  onChange={e => handleClassSelect(e.target.value)}
                >
                  <option value="">{loadingClasses ? 'Loading...' : '-- Select Class --'}</option>
                  {availableClasses.length > 0 ? (
                    availableClasses.map(c => <option key={c.class_name} value={c.class_name}>{c.class_name}</option>)
                  ) : (
                    ['II MCA', 'II MSc CS', 'II MSc DS', 'II MSc AI', 'IV MTech'].map(c => <option key={c} value={c}>{c}</option>)
                  )}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: 200 }}>
                <label className="form-label">Subject</label>
                <select
                  className="form-control"
                  value={selectedSubject}
                  onChange={e => handleSubjectChange(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">-- Select Subject --</option>
                  {(SUBJECTS[selectedClass] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={e => handleDateChange(e.target.value)}
                />
              </div>
              {students.length > 0 && (
                <button type="button" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); exportToCSV(); }}>📥 Export CSV</button>
              )}
            </div>
          </div>

          {/* Summary Strip */}
          {summary && (
            <div className="card-grid card-grid-4 mb-4">
              {[
                { label: 'Total Students', value: summary.total, color: 'var(--text)' },
                { label: 'Present',        value: summary.present, color: '#10b981' },
                { label: 'Absent',         value: summary.absent,  color: '#ef4444' },
                { label: 'Not Marked',     value: summary.not_marked, color: 'var(--accent2)' },
              ].map(item => (
                <div key={item.label} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div className="text-muted text-sm mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Attendance Sheet */}
          {selectedClass && (
            <div className="card">
              <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
                <span className="card-title">
                  Step 2 — Mark Each Student ({students.length})
                </span>
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                  <button type="button" className="btn btn-ghost" style={{ color: '#10b981', borderColor: '#10b981' }}
                    onClick={(e) => { e.preventDefault(); markAll('present'); }}>✅ All Present</button>
                  <button type="button" className="btn btn-ghost" style={{ color: '#ef4444', borderColor: '#ef4444' }}
                    onClick={(e) => { e.preventDefault(); markAll('absent'); }}>❌ All Absent</button>
                </div>
              </div>

              {msg.text && (
                <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'}`}
                  style={{ margin: '12px 0' }}>
                  {msg.text}
                </div>
              )}

              {loadingList ? (
                <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
              ) : students.length === 0 ? (
                <div className="empty-state"><p>No students found for this class.</p></div>
              ) : (
                <>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Reg No</th>
                          <th>Name</th>
                          <th style={{ width: 200 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, i) => {
                          const status = statuses[s.reg_no] || 'present';
                          return (
                            <tr key={s.reg_no}
                              style={{ background: status === 'absent' ? 'rgba(239,68,68,0.06)' : status === 'present' ? 'rgba(16,185,129,0.04)' : '' }}>
                              <td className="text-muted text-sm">{i + 1}</td>
                              <td><span className="badge badge-info">{s.reg_no}</span></td>
                              <td className="fw-700">{s.name}</td>
                              <td>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                                    color: status === 'present' ? '#10b981' : 'var(--text-muted)',
                                    fontWeight: status === 'present' ? 700 : 400 }}>
                                    <input
                                      type="radio"
                                      name={`att_${s.reg_no}`}
                                      value="present"
                                      checked={status === 'present'}
                                      onChange={() => setStatuses(p => ({ ...p, [s.reg_no]: 'present' }))}
                                    /> Present
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                                    color: status === 'absent' ? '#ef4444' : 'var(--text-muted)',
                                    fontWeight: status === 'absent' ? 700 : 400 }}>
                                    <input
                                      type="radio"
                                      name={`att_${s.reg_no}`}
                                      value="absent"
                                      checked={status === 'absent'}
                                      onChange={() => setStatuses(p => ({ ...p, [s.reg_no]: 'absent' }))}
                                    /> Absent
                                  </label>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 24, padding: 12, height: 'auto', fontSize: 16 }}
                      onClick={(e) => { e.preventDefault(); submitAttendance(); }}
                      disabled={submitting}
                    >
                      {submitting ? '⏳ Saving...' : `💾 Submit Attendance (${students.length} students)`}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ─────────────────────────────────────────────────── */}
      {viewHist && (
        <>
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">📁 Select Class to View History</span></div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {CLASSES.map(c => (
                <button
                  key={c}
                  className={`btn ${historyClass === c ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => loadHistory(c)}
                >{c}</button>
              ))}
            </div>
          </div>

          {historyClass && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
              {/* Date List */}
              <div className="card">
                <div className="card-header"><span className="card-title">📅 Marked Dates</span></div>
                {historyDates.length === 0 ? (
                  <div className="empty-state"><p>No records yet.</p></div>
                ) : (
                  <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                    {historyDates.map(d => (
                      <div
                        key={d.date + d.subject}
                        onClick={() => loadHistDetail(d.date, d.subject)}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border)',
                          background: (histDate === d.date && histSubj === d.subject) ? 'var(--surface2)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div className="fw-700" style={{ fontSize: 14 }}>{d.date}</div>
                        <div className="text-sm text-primary" style={{ fontWeight: 600 }}>{d.subject}</div>
                        <div className="text-sm text-muted">
                          ✅ {d.present} Present &nbsp; ❌ {d.absent} Absent
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance Detail */}
              <div className="card">
                {!histDate ? (
                  <div className="flex-center" style={{ padding: 60, flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 36 }}>📅</div>
                    <p className="text-muted">Select a date to view attendance details</p>
                  </div>
                ) : (
                  <>
                    <div className="card-header">
                      <span className="card-title">{historyClass} — {histDate} ({histSubj})</span>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                        <span style={{ color: '#10b981' }}>✅ {histRecords.filter(r => r.status === 'present').length} Present</span>
                        <span style={{ color: '#ef4444' }}>❌ {histRecords.filter(r => r.status === 'absent').length} Absent</span>
                      </div>
                    </div>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Reg No</th>
                            <th>Name</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {histRecords.map((r, i) => (
                            <tr key={r.reg_no}>
                              <td className="text-muted text-sm">{i + 1}</td>
                              <td><span className="badge badge-info">{r.reg_no}</span></td>
                              <td className="fw-700">{r.name}</td>
                              <td>
                                <span className={`badge badge-${r.status === 'present' ? 'present' : r.status === 'absent' ? 'absent' : 'info'}`}>
                                  {r.status === 'present' ? '✅ Present' : r.status === 'absent' ? '❌ Absent' : '— Not Marked'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
