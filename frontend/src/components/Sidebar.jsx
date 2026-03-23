import { clearAuth } from '../api';

const NAV = {
  student: [
    { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
    { icon: '📋', label: 'Attendance', id: 'attendance' },
    { icon: '📊', label: 'Marks & Results', id: 'marks' },
    { icon: '📚', label: 'Study Materials', id: 'materials' },
    { icon: '📝', label: 'Assignments', id: 'assignments' },
    { icon: '🗓️', label: 'Timetable', id: 'timetable' },
    { icon: '📢', label: 'Notice Board', id: 'notices' },
    { icon: '🎉', label: 'Events', id: 'events' },
    { icon: '💼', label: 'Placements', id: 'placements' },
    { icon: '🤝', label: 'Alumni', id: 'alumni' },
    { icon: '💬', label: 'Feedback', id: 'feedback' },
  ],
  staff: [
    { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
    { icon: '👥', label: 'Students', id: 'students' },
    { icon: '📋', label: 'Attendance', id: 'attendance' },
    { icon: '📊', label: 'Marks Entry', id: 'marks' },
    { icon: '📚', label: 'Study Materials', id: 'materials' },
    { icon: '📝', label: 'Assignments', id: 'assignments' },
    { icon: '🗓️', label: 'Timetable', id: 'timetable' },
    { icon: '📢', label: 'Notice Board', id: 'notices' },
    { icon: '🎉', label: 'Events', id: 'events' },
    { icon: '📍', label: 'Staff Attendance', id: 'staff-checkin' },
    { icon: '📈', label: 'Analytics', id: 'analytics' },
  ],
  admin: [
    { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
    { icon: '🛡️', label: 'Users', id: 'users' },
    { icon: '👥', label: 'Students', id: 'students' },
    { icon: '🧑‍🏫', label: 'Staff', id: 'staff-list' },
    { icon: '📋', label: 'Attendance', id: 'attendance' },
    { icon: '📊', label: 'Marks', id: 'marks' },
    { icon: '📚', label: 'Study Materials', id: 'materials' },
    { icon: '📝', label: 'Assignments', id: 'assignments' },
    { icon: '🗓️', label: 'Timetable', id: 'timetable' },
    { icon: '📢', label: 'Notices', id: 'notices' },
    { icon: '🎉', label: 'Events', id: 'events' },
    { icon: '💼', label: 'Placements', id: 'placements' },
    { icon: '🤝', label: 'Alumni', id: 'alumni' },
    { icon: '💬', label: 'Feedback', id: 'feedback' },
    { icon: '📍', label: 'Staff Attendance', id: 'staff-checkin' },
    { icon: '📈', label: 'Analytics', id: 'analytics' },
  ],
  alumni: [
    { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
    { icon: '🤝', label: 'Alumni Network', id: 'alumni' },
    { icon: '💼', label: 'Placements', id: 'placements' },
    { icon: '📢', label: 'Notice Board', id: 'notices' },
    { icon: '🎉', label: 'Events', id: 'events' },
    { icon: '💬', label: 'Feedback', id: 'feedback' },
  ],
};

export default function Sidebar({ user, page, onNavigate, onLogout, isOpen }) {
  const items = NAV[user.role] || NAV.student;
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  function handleLogout() {
    clearAuth();
    onLogout();
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">🏛️</div>
        <h2>Smart Dept Portal</h2>
        <p>SC App & Engineering</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {items.map(item => (
          <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="name">{user.name}</div>
            <div className="role-badge">{user.role}</div>
          </div>
        </div>
        <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
