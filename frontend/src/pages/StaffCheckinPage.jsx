import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CAMPUS_LAT = 10.777859;
const CAMPUS_LNG = 78.696660;
const ALLOWED_RADIUS_METERS = 150;
const CAMPUS_POSITION = [CAMPUS_LAT, CAMPUS_LNG];

function SetViewOnLocation({ coords, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, zoom);
  }, [coords, map, zoom]);
  return null;
}

export default function StaffCheckinPage({ user }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [status, setStatus] = useState(null);
  const [distance, setDistance] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);

  // Admin/HOD State
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 });

  useEffect(() => {
    if (user.role === 'admin' || user.role === 'hod') {
      fetchHistory();
    }
  }, [selectedDate, user.role]);

  async function fetchHistory() {
    try {
      const data = await api.get(`/staff-attendance/history?date=${selectedDate}`);
      setHistory(data);
      const presentCount = data.filter(d => d.status && d.status.toLowerCase() === 'present').length;
      setStats({
        total: data.length,
        present: presentCount,
        absent: data.length - presentCount
      });
    } catch (err) { }
  }

  const handleCheckIn = () => {
    setLoading(true); setMsg(''); setStatus(null); setDistance(null); setUserLocation(null);
    if (!navigator.geolocation) {
      setMsg('❌ Geolocation is not supported by your browser.');
      setLoading(false); return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation([latitude, longitude]);
      try {
        const res = await api.post('/staff-attendance/checkin', { latitude, longitude });
        if (res.alreadyMarked) {
          setStatus('already');
          setCheckInTime(res.checkInTime || res.check_in_time);
        } else {
          setStatus(res.status); // 'Present' or 'Outside'
          setDistance(res.distance_meters);
          setMsg(res.message);
        }
      } catch (err) {
        setMsg('❌ ' + (err.message || 'Check-in failed. Please try again.'));
      } finally { setLoading(false); }
    }, (err) => {
      setMsg('❌ Location access denied. Please allow location access to check in.');
      setLoading(false);
    }, { enableHighAccuracy: true });
  };

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 20 }}>
        <h2 className="section-title">📍 Staff Attendance check-in</h2>
        <p className="section-subtitle">Geofenced location tracking relative to campus center.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: (user.role === 'admin' || user.role === 'hod') ? '1fr' : '1fr', gap: 24, paddingBottom: 60 }}>
        
        {/* Staff View: Mark Attendance */}
        {user.role === 'staff' && (
          <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="card-header"><span className="card-title">Check-in Terminal</span></div>
            <div className="card-content" style={{ padding: 24, textAlign: 'center' }}>
              
              {!userLocation && (
                <div className="mb-6" style={{ background: 'var(--surface2)', padding: 32, borderRadius: 16 }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: 140, height: 140, borderRadius: '50%', fontSize: 16, border: '4px solid var(--accent)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    disabled={loading}
                    onClick={handleCheckIn}
                  >
                    {loading ? <span className="spinner"></span> : 'MARK MY ATTENDANCE'}
                  </button>
                  {msg && <div style={{ color: 'var(--danger)', marginTop: 12, fontWeight: 500 }}>{msg}</div>}
                </div>
              )}

              {userLocation && (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                  <div style={{ height: 300, width: 300, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: '2px solid var(--border)', marginBottom: 20 }}>
                    <MapContainer center={userLocation} zoom={17} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Circle center={CAMPUS_POSITION} radius={ALLOWED_RADIUS_METERS} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }} />
                      <Marker position={userLocation} />
                      <SetViewOnLocation coords={userLocation} zoom={17} />
                    </MapContainer>
                  </div>

                  {status === 'Present' && (
                    <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
                      <div className="card-content" style={{ color: '#10b981', fontWeight: 600 }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                        Attendance Marked ✓<br/>
                        <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--text-muted)' }}>You are {distance}m from campus center</span>
                      </div>
                    </div>
                  )}

                  {status === 'Outside' && (
                    <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
                      <div className="card-content" style={{ color: '#ef4444', fontWeight: 600 }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>❌</div>
                        Outside campus boundary ({distance}m away).<br/>Move closer and try again.
                      </div>
                    </div>
                  )}

                  {status === 'already' && (
                    <div className="card" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b' }}>
                      <div className="card-content" style={{ color: '#d97706', fontWeight: 600 }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                        Already marked today at {checkInTime}
                      </div>
                    </div>
                  )}

                  <button className="btn btn-secondary mt-4" onClick={() => { setUserLocation(null); setStatus(null); setMsg(''); }}>Refresh Profile Tracking</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin/HOD View: Live Logs */}
        {(user.role === 'admin' || user.role === 'hod') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
            <div className="card">
               <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-title">Staff Daily Status Grid</span>
                  <input type="date" className="form-control" style={{ width: 140 }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
               </div>
               
               <div style={{ display: 'flex', gap: 16, padding: '12px 24px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                 <div className="badge badge-secondary">Total Staff: {stats.total}</div>
                 <div className="badge badge-success">Present: {stats.present}</div>
                 <div className="badge badge-error">Not Marked: {stats.absent}</div>
               </div>

               <div className="table-wrapper">
                  <table>
                     <thead>
                        <tr>
                          <th>NAME</th>
                          <th>DESIGNATION</th>
                          <th>TIME</th>
                          <th>DISTANCE</th>
                          <th>STATUS</th>
                        </tr>
                     </thead>
                     <tbody>
                        {history.length > 0 ? history.map((row, i) => (
                          <tr key={i}>
                             <td className="fw-600">{row.name}</td>
                             <td className="text-muted text-sm">{row.designation || '-'}</td>
                             <td className="text-sm">{row.check_in_time || '-'}</td>
                             <td className="text-sm">{row.distance_meters !== null ? `${row.distance_meters}m` : '-'}</td>
                             <td>
                                <span className={`badge badge-${row.status === 'Present' ? 'success' : row.status === 'Outside' ? 'error' : 'secondary'}`}>
                                   {row.status ? row.status.toUpperCase() : 'NOT MARKED'}
                                </span>
                             </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }} className="text-muted">No staff data available.</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Campus map preview */}
            <div className="card" style={{ height: 'fit-content' }}>
               <div className="card-header"><span className="card-title">Geofence Zone</span></div>
               <div className="card-content" style={{ padding: 16 }}>
                  <div style={{ height: 300, width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                     <MapContainer center={CAMPUS_POSITION} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Circle center={CAMPUS_POSITION} radius={ALLOWED_RADIUS_METERS} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }} />
                     </MapContainer>
                  </div>
                  <div className="text-sm text-center mt-3 text-muted">
                    Radius: 150 meters<br/>
                    Center: {CAMPUS_LAT}, {CAMPUS_LNG}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
