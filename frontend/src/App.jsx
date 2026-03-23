import { useState, useEffect } from 'react';
import { getUser } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Materials from './pages/Materials';
import Notices from './pages/Notices';
import Events from './pages/Events';
import Marks from './pages/Marks';
import Placements from './pages/Placements';
import Alumni from './pages/Alumni';
import Timetable from './pages/Timetable';
import Feedback from './pages/Feedback';
import Assignments from './pages/Assignments';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import StaffCheckinPage from './pages/StaffCheckinPage';

import Sidebar from './components/Sidebar';

const PAGE_MAP = {
  dashboard: Dashboard,
  attendance: Attendance,
  materials: Materials,
  notices: Notices,
  events: Events,
  marks: Marks,
  placements: Placements,
  alumni: Alumni,
  timetable: Timetable,
  feedback: Feedback,
  assignments: Assignments,
  students: Students,
  'staff-list': Staff,
  users: UserManagement,
  analytics: Analytics,
  profile: Profile,
  'staff-checkin': StaffCheckinPage,
};

export default function App() {
  const [user, setUser] = useState(getUser);
  const [page, setPage] = useState('dashboard');
  const [pageData, setPageData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    try {
      const { api } = await import('./api');
      const data = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch { }
  }

  async function markRead(id) {
    try {
      const { api } = await import('./api');
      await api.patch(`/notifications/${id}/read`);
      loadNotifications();
    } catch { }
  }

  const navigate = (pg, data = null) => {
    setPage(pg);
    setPageData(data);
    if (window.innerWidth <= 1024) setSidebarOpen(false);
  };

  useEffect(() => {
    // Keep page title updated
    document.title = `Smart Dept Portal — ${page.charAt(0).toUpperCase() + page.slice(1)}`;
  }, [page]);

  useEffect(() => {
    // Handle expired/invalid sessions detected by api.js
    const handleAuthExpired = () => setUser(null);
    const handleUserUpdate = (e) => setUser(e.detail);
    
    window.addEventListener('auth-expired', handleAuthExpired);
    window.addEventListener('user-updated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);

  if (!user) return <><div className="app-bg" /><Login onLogin={u => { setUser(u); setPage('dashboard'); }} /></>;

  const PageComponent = PAGE_MAP[page] || Dashboard;

  return (
    <>
      <div className="app-bg" />
      <div className={`layout ${user?.role} ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Mobile Overlay */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        
        <Sidebar 
          user={user} 
          page={page} 
          onNavigate={navigate} 
          onLogout={() => setUser(null)} 
          isOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="main-content">
          <header className="topbar">
            <div className="topbar-left">
              <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle Sidebar">
                {sidebarOpen ? '✕' : '☰'}
              </button>
              <h1>{page.charAt(0).toUpperCase() + page.replace(/-/g, ' ').slice(1)}</h1>
            </div>
            <div className="topbar-actions">
              <span className="tag show-desktop">🏛️ School of CS App & Engineering</span>
              
              <div className="user-badge" style={{ cursor: 'pointer' }} onClick={() => navigate('profile')}>
                <div className="user-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                  {user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="user-info show-desktop">
                  <div className="name" style={{ fontSize: 12 }}>{user.name}</div>
                </div>
              </div>
            </div>
          </header>
          <div className="page-content">
            <PageComponent user={user} pageData={pageData} onNavigate={navigate} />
          </div>
        </main>
      </div>
    </>
  );
}
