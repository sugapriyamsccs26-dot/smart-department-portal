import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { TIMETABLE_DB, getStaffNotification } from '../utils/timetable';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Timetable({ user }) {
  const [program, setProgram] = useState('MSC_CS');
  const [notifs, setNotifs] = useState({ nowMsg: '', nextMsg: '' });
  
  const [semester, setSemester] = useState(2);

  const prevProgram = useRef(program);
  useEffect(() => {
    if (prevProgram.current !== program) {
       setSemester(program === 'MTECH' ? 4 : 2);
       prevProgram.current = program;
    }
  }, [program]);

  // Substitution state
  const [showSubModal, setShowSubModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [subForm, setSubForm] = useState({ timetable_id: '', original_staff_name: '', substitute_staff_id: '', date: new Date().toISOString().split('T')[0] });
  const [subMsg, setSubMsg] = useState('');

  // Need a loading state for the new load function
  const [loading, setLoading] = useState(false);
  const [dbTimetable, setDbTimetable] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const progName = {
          'MSC_CS': 'MSc CS',
          'MSC_DS': 'MSc AI & DS',
          'MSC_AI': 'MSc AI & DS',
          'MCA': 'MCA',
          'MTECH': 'MTech CS'
        }[program] || program;
        
        const data = await api.get(`/timetable?program=${encodeURIComponent(progName)}&semester=${semester}`);
        setDbTimetable(data);
      } catch (err) {
        console.error('Failed to load timetable', err);
      } finally {
        setLoading(false);
      }
    }

    load();
    if (user.role === 'admin') {
      loadStaff();
    }
  }, [program, semester, user.role]);

  async function loadStaff() {
    try {
       const data = await api.get('/users?role=staff');
       if (data && Array.isArray(data)) {
         setStaffList(data);
       }
    } catch { }
  }

  async function handleSubstitution(e) {
    e.preventDefault(); setSubMsg('');
    try {
      // Find a matching timetable ID in the DB for this slot
      // Fallback: we created a generic substitution endpoint that can handle names if ID isn't linked
      await api.post('/timetable/substitute', {
        ...subForm,
        // Since TIMETABLE_DB is static, we'll use a placeholder or lookup
        timetable_id: subForm.timetable_id || 1, 
        original_staff_id: staffList.find(s => s.name === subForm.original_staff_name)?.id || 1
      });
      setSubMsg('✅ Substitution assigned successfully!');
      setTimeout(() => setShowSubModal(false), 2000);
    } catch (err) { setSubMsg('❌ ' + err.message); }
  }
  
  // 10. Auto refresh staff notification
  useEffect(() => {
    async function updateNotifs() {
      if (user.role === 'staff' || user.role === 'admin') {
        try {
          // Fetch ALL entries to find this staff's classes anywhere in the department
          const allData = await api.get('/timetable');
          setNotifs(getStaffNotification(allData, user.name));
        } catch {
          // Fallback to static DB if API fails
          setNotifs(getStaffNotification(TIMETABLE_DB, user.name));
        }
      }
    }
    updateNotifs();
  }, [user.name, user.role]);

  async function handleUpdateEntry(id, field, value) {
     try {
        const entry = dbTimetable.find(e => e.id === id);
        if (!entry) return;
        
        const updatedEntry = { ...entry, [field]: value };
        if (field === 'faculty') {
           const staff = staffList.find(s => s.name === value);
           updatedEntry.staff_id = staff ? staff.id : null;
           updatedEntry.staff_name = value;
        }

        setDbTimetable(prev => prev.map(e => e.id === id ? updatedEntry : e));
        
        // Auto-save to backend using the PUT endpoint
        await api.put(`/timetable/${id}`, updatedEntry); 
     } catch (err) {
        console.error('Update failed', err);
     }
  }


   // Active course timetable (Daily View state)
  const currentDayName = DAYS[new Date().getDay() - 1] || 'Monday';
  const [activeDay, setActiveDay] = useState(currentDayName === 'Sunday' ? 'Monday' : currentDayName);

  // Map the flat dbTimetable array to the dailySchedule format
  const dailySchedule = dbTimetable.filter(e => e.day === activeDay);

  const TIME_SLOTS_LABELS = [
    { time: '10:30–11:30', type: 'slot' },
    { time: '11:30–12:30', type: 'slot' },
    { time: '12:30–1:30',  type: 'slot' },
    { time: 'LUNCH BREAK', type: 'break' },
    { time: '2:30–3:30',   type: 'slot' },
    { time: '3:30–4:30',   type: 'slot' },
    { time: '4:30–5:30',   type: 'slot' }
  ];

  // Helper to get all classes for the current program and semester for substitution modal
  const getAllClassesForProgramAndSemester = () => {
    const classes = [];
    const programData = TIMETABLE_DB[program];
    if (programData) {
      for (const dayKey in programData) {
        if (programData.hasOwnProperty(dayKey)) {
          programData[dayKey].forEach(entry => {
            // Assuming semester is part of the entry or we filter by it if it's in TIMETABLE_DB
            // For now, we'll include all entries for the program, as TIMETABLE_DB doesn't have semester
            // If semester filtering is needed, TIMETABLE_DB structure would need to include it.
            classes.push({ ...entry, day: dayKey });
          });
        }
      }
    }
    return classes;
  };

  return (
    <div className="animate-in">
      {/* Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 className="section-title">🕒 Timetable</h2>
          <p className="section-subtitle">Academic Schedule • 10:30 AM – 5:30 PM</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user.role === 'admin' && (
            <button className={`btn ${isEditMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setIsEditMode(!isEditMode)}>
              {isEditMode ? '✅ View Mode' : '✏️ Edit Mode'}
            </button>
          )}
          {user.role === 'admin' && (
            <button className="btn btn-secondary" onClick={() => setShowSubModal(true)}>
              🔄 Manage Substitutions
            </button>
          )}
        </div>
      </div>

      {/* Top Status Banner (Dynamic) - Staff Only */}
      {(user.role === 'staff' || user.role === 'admin') && (
        <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: '#fff', padding: '28px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🎓</span>
            <div>
              <div className="fw-700" style={{ fontSize: 18 }}>{notifs.nowMsg || 'No class scheduled now'}</div>
              <div className="text-sm" style={{ opacity: 0.85 }}>{notifs.nextMsg || 'No further classes today'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Day Tabs Container */}
      <div className="card mb-6">
        <div style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 180 }} value={program} onChange={e => setProgram(e.target.value)}>
            <option value="MSC_CS">MSc CS</option>
            <option value="MSC_DS">MSc AI & DS</option>
            <option value="MSC_AI">MSc AI</option>
            <option value="MCA">MCA</option>
            <option value="MTECH">MTech</option>
          </select>
          <select className="form-control" style={{ width: 120 }} value={semester} onChange={e => setSemester(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>

        {/* Day Navigation Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: 8, background: 'var(--surface2)', overflowX: 'auto' }}>
          {DAYS.map(d => (
            <button
              key={d}
              className={`btn ${activeDay === d ? 'btn-primary' : 'btn-ghost'}`}
              style={{ minWidth: 100, borderRadius: 8 }}
              onClick={() => setActiveDay(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>


      {/* Daily Schedule List View */}
      <div className="card">
         <div className="card-header">
            <span className="card-title">{activeDay} Schedule</span>
         </div>
         <div className="table-wrapper">
            <table>
               <thead>
                  <tr>
                     <th style={{ width: 140 }}>TIME</th>
                     <th>SUBJECT</th>
                     <th>FACULTY</th>
                  </tr>
               </thead>
               <tbody>
                  {TIME_SLOTS_LABELS.map((slotObj, idx) => {
                     if (slotObj.type === 'break') {
                        return (
                           <tr key="lunch-break" style={{ background: 'rgba(59,130,246,0.03)' }}>
                              <td colSpan={3} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: 2, padding: 16 }}>
                                 🍱 LUNCH BREAK (1:30 - 2:30 PM)
                              </td>
                           </tr>
                        );
                     }
                     
                     // Find entry with matching time range (start_time matches)
                     const entry = dailySchedule.find(e => {
                        const slotStart = slotObj.time.split('–')[0].trim();
                        return e.start_time === slotStart;
                     });

                     return (
                        <tr key={slotObj.time} style={{ background: entry ? '' : 'rgba(0,0,0,0.01)' }}>
                           <td className="text-muted fw-500">{slotObj.time}</td>
                           <td className="fw-700">
                              {entry ? (
                                 isEditMode ? (
                                    <input 
                                       className="form-control form-control-sm" 
                                       value={entry.course_name} 
                                       onChange={e => handleUpdateEntry(entry.id, 'course_name', e.target.value)}
                                       style={{ maxWidth: 200 }}
                                    />
                                 ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                       {entry.course_name}
                                       {entry.type && <span className={`badge badge-${entry.type === 'lab' ? 'info' : 'secondary'}`} style={{ fontSize: 10, padding: '2px 6px' }}>{entry.type.toUpperCase()}</span>}
                                    </div>
                                 )
                              ) : '-'}
                           </td>
                           <td className="text-sm">
                              {entry ? (
                                 isEditMode ? (
                                    <select 
                                       className="form-control form-control-sm" 
                                       value={entry.staff_name || ''} 
                                       onChange={e => handleUpdateEntry(entry.id, 'faculty', e.target.value)}
                                       style={{ maxWidth: 200 }}
                                    >
                                       <option value="">-- Select Faculty --</option>
                                       {staffList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                 ) : entry.staff_name || '-'
                              ) : '-'}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* Substitution Modal */}
      {showSubModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card animate-in" style={{ maxWidth: 500, width: '100%', background: 'var(--bg1)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">🔄 Assign Faculty Substitution</span>
              <button className="btn btn-ghost" onClick={() => setShowSubModal(false)}>✖</button>
            </div>
            <div className="card-content" style={{ padding: 20 }}>
              {subMsg && <div className={`alert ${subMsg.includes('✅') ? 'alert-success' : 'alert-error'} mb-4`}>{subMsg}</div>}
              <form onSubmit={handleSubstitution}>
                <div className="form-group">
                  <label className="form-label">Select Class to Substitute</label>
                  <select className="form-control" onChange={e => {
                    const [subj, fac] = e.target.value.split('|');
                    setSubForm(f => ({ ...f, original_staff_name: fac }));
                  }} required>
                    <option value="">-- Choose Class --</option>
                    {dailySchedule.map((s, i) => (
                      <option key={i} value={`${s.course_name}|${s.staff_name}`}>{s.start_time} - {s.course_name} ({s.staff_name || 'Unassigned'})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Original Faculty</label>
                  <input className="form-control" value={subForm.original_staff_name} readOnly style={{ background: 'var(--bg2)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Substitute Faculty</label>
                  <select className="form-control" value={subForm.substitute_staff_id} onChange={e => setSubForm(f => ({ ...f, substitute_staff_id: e.target.value }))} required>
                    <option value="">-- Select Staff --</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.designation})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={subForm.date} onChange={e => setSubForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary w-full">Confirm Substitution</button>
                  <button type="button" className="btn btn-secondary w-full" onClick={() => setShowSubModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
