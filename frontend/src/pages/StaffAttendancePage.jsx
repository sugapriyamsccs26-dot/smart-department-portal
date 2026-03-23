import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function StaffAttendancePage({ user }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [distance, setDistance] = useState(null);
  const [status, setStatus] = useState(null);
  
  // History for Admin
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (user.role === 'admin') {
      fetchHistory();
    }
  }, [selectedDate, user.role]);

  async function fetchHistory() {
    try {
      const data = await api.get(`/staff-attendance/history?date=${selectedDate}`);
      setHistory(data);
    } catch (err) { }
  }

  const handleCheckIn = () => {
    setLoading(true); setMsg(''); setDistance(null); setStatus(null);
    if (!navigator.geolocation) {
      setMsg('❌ Geolocation is not supported by your browser.');
      setLoading(false); return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await api.post('/staff-attendance/checkin', { latitude, longitude });
        setMsg(res.message);
        setDistance(res.distance);
        setStatus(res.status);
      } catch (err) {
        setMsg('❌ ' + (err.message || 'Check-in failed. Please try again.'));
      } finally { setLoading(false); }
    }, (err) => {
      setMsg('❌ Location access denied. Please enable GPS.');
      setLoading(false);
    }, { enableHighAccuracy: true });
  };

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 20 }}>
        <h2 className="section-title">📍 Staff Geofencing Attendance</h2>
        <p className="section-subtitle">Mark your attendance within <strong>300 meters</strong> of campus (Kajamalai, TVS Tollgate, Trichy).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: user.role === 'admin' ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Staff View: Mark Attendance */}
        {(user.role === 'staff' || user.role === 'admin') && (
          <div className="card">
            <div className="card-header"><span className="card-title">Check-in Terminal</span></div>
            <div className="card-content" style={{ padding: 24, textAlign: 'center' }}>
              <div className="mb-6" style={{ background: 'var(--surface2)', padding: 32, borderRadius: 16 }}>
                 <button 
                   className="btn btn-primary" 
                   style={{ width: 140, height: 140, borderRadius: '50%', fontSize: 16, border: '4px solid var(--accent)' }}
                   disabled={loading}
                   onClick={handleCheckIn}
                 >
                   {loading ? 'Locating...' : 'CHECK IN'}
                 </button>
              </div>
              
              {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
              
              {distance !== null && (
                <div style={{ marginTop: 16, background: 'rgba(51,65,85,0.05)', padding: 12, borderRadius: 8 }}>
                  <div className="text-sm fw-600 mb-1">Status: <span style={{ color: status === 'Present' ? '#10b981' : '#ef4444' }}>{status}</span></div>
                  <div className="text-xs text-muted">Distance from Campus: <strong>{distance} meters</strong> &nbsp;|&nbsp; Allowed: <strong>≤ 300 m</strong></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin/HOD View: Live Logs */}
        {user.role === 'admin' && (
          <div className="card">
             <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title">Staff Check-in Logs</span>
                <input type="date" className="form-control" style={{ width: 140 }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
             </div>
             <div className="table-wrapper">
                <table>
                   <thead>
                      <tr>
                        <th>STAFF NAME</th>
                        <th>TIME</th>
                        <th>STATUS</th>
                      </tr>
                   </thead>
                   <tbody>
                      {history.length > 0 ? history.map(row => (
                        <tr key={row.id}>
                           <td className="fw-600">{row.staff_name}</td>
                           <td className="text-sm">{row.check_in_time}</td>
                           <td>
                              <span className={`badge badge-${row.status === 'Present' ? 'success' : 'danger'}`}>
                                 {row.status}
                              </span>
                           </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }} className="text-muted">No entries for this date</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
