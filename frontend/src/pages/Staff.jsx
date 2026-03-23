import { useState, useEffect } from 'react';
import { api } from '../api';

// The exact required order of Staff Employee Nos
const EXACT_STAFF_ORDER = [
  'BDU1670884',
  'BDU1660758',
  'BDU17010631',
  'BDU1760794',
  'BDU1711015',
  'BDU1721040',
  'BDU1751033',
  'BDU1711014'
];

export default function Staff({ user, onNavigate }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      // Fetch all users
      const allUsers = await api.get('/users');
      
      // 1. Filter for staff and admin
      const rawStaff = allUsers.filter(u => u.role === 'staff' || u.role === 'admin');
      
      // 2. Strict Deduplication based on user_id (Employee No)
      const uniqueStaffMap = new Map();
      rawStaff.forEach(s => {
        if (!uniqueStaffMap.has(s.user_id)) {
          uniqueStaffMap.set(s.user_id, s);
        }
      });
      
      // 3. Filter to ONLY include the 8 exact staff members requested, and push to array
      const exactStaffArray = [];
      EXACT_STAFF_ORDER.forEach(employeeNo => {
        if (uniqueStaffMap.has(employeeNo)) {
           exactStaffArray.push(uniqueStaffMap.get(employeeNo));
        }
      });

      setStaff(exactStaffArray);
    } catch { 
      setStaff([]); 
    } finally { 
      setLoading(false); 
    }
  }

  const filtered = staff.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.user_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.designation?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <h2 className="section-title">🧑‍🏫 Staff Directory</h2>
      <p className="section-subtitle">List of faculty members, administrators, and department staff</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input className="form-control" placeholder="🔍 Search by name, ID or designation..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
      </div>

      {loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Staff Members ({filtered.length})</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Name</th>
                <th>Employee Number</th>
                <th>Role</th>
                <th>Designation</th>
                <th>Email ID</th>
                <th>Joining Date</th>
              </tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={6}><div className="empty-state"><p>No staff found.</p></div></td></tr>
                  : filtered.map(s => (
                    <tr key={s.id}
                      onClick={() => onNavigate('profile', { targetUserId: s.id })}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2, rgba(99,102,241,0.05))'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td className="fw-700">{s.name}</td>
                      <td><span className="badge badge-info">{s.user_id}</span></td>
                      <td><span className="badge badge-primary">{s.role === 'admin' ? 'Admin / HOD' : 'Staff'}</span></td>
                      <td>{s.user_id === 'BDU1670884' ? 'Professor and Head' : (s.designation || '—')}</td>
                      <td className="text-muted">{s.email}</td>
                      <td>{s.joining_date || 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
