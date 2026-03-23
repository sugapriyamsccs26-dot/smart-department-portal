import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', venue: '', type: 'workshop' });
  const [msg, setMsg] = useState('');
  
  // Registration list for admin
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const data = await api.get('/events');
      setEvents(data);
      if (user.role === 'student' || user.role === 'alumni') {
        const myRegs = await api.get('/events/my-registrations');
        setRegistrations(myRegs);
      }
    } catch { setEvents([]); } finally { setLoading(false); }
  }

  async function loadParticipants(eventId) {
    setSelectedEventId(eventId);
    setLoadingParticipants(true);
    try {
      const data = await api.get(`/events/${eventId}/registrations`);
      setParticipants(data);
    } catch (err) { alert(err.message); }
    finally { setLoadingParticipants(false); }
  }

  async function registerForEvent(eventId) {
    try {
      await api.post(`/events/${eventId}/register`);
      setRegistrations(prev => [...prev, eventId]);
    } catch (err) { alert(err.message); }
  }

  async function createEvent(e) {
    e.preventDefault(); setMsg('');
    try {
      await api.post('/events', form);
      setMsg('✅ Event created successfully!');
      setShowForm(false);
      loadEvents();
    } catch (err) { setMsg('❌ ' + err.message); }
  }

  const TYPE_EMOJIS = { workshop: '🔧', seminar: '🎤', technical: '💻', cultural: '🎭', other: '✨' };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 className="section-title">🎉 Events Hub</h2>
          <p className="section-subtitle">Stay updated with the latest workshops and technical events</p>
        </div>
        {(user.role === 'staff' || user.role === 'admin') && !selectedEventId && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create New Event'}
          </button>
        )}
        {selectedEventId && (
          <button className="btn btn-ghost" onClick={() => setSelectedEventId(null)}>← Back to Events</button>
        )}
      </div>

      {showForm && !selectedEventId && (
        <div className="card mb-6 animate-in">
          <div className="card-header"><span className="card-title">📅 Create New Event</span></div>
          {msg && <div className={`alert ${msg.includes('✅') ? 'alert-success' : 'alert-error'} mb-4`}>{msg}</div>}
          <form onSubmit={createEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group" style={{ gridColumn: '1/-1', margin: 0 }}>
              <label className="form-label">Event Title</label>
              <input className="form-control" placeholder="Enter event name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {Object.keys(TYPE_EMOJIS).map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Date & Time</label>
              <input type="datetime-local" className="form-control" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Venue</label>
              <input className="form-control" placeholder="e.g. Auditiorium" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Overview</label>
              <textarea className="form-control" rows={1} placeholder="Short description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button type="submit" className="btn btn-primary w-full">Publish Event</button>
            </div>
          </form>
        </div>
      )}

      {selectedEventId ? (
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">Registered Participants for {events.find(e => e.id === selectedEventId)?.title}</span>
          </div>
          {loadingParticipants ? <div className="flex-center" style={{ padding: 40 }}><div className="spinner" /></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.length === 0 ? <tr><td colSpan={5} className="text-center py-8">No participants registered yet.</td></tr> : 
                    participants.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="text-muted">{idx + 1}</td>
                        <td className="fw-700">{p.name}</td>
                        <td className="text-sm">{p.email}</td>
                        <td><span className="badge badge-info">{p.program || 'Alumni'}</span></td>
                        <td className="text-muted text-sm">{new Date(p.registered_at).toLocaleString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        loading ? <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div> : (
          <div className="card-grid card-grid-3">
            {events.length === 0
              ? <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="icon">📅</div><p>No upcoming events.</p></div>
              : events.map(ev => (
                <div key={ev.id} className="card event-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{TYPE_EMOJIS[ev.type] || '✨'}</div>
                  <h3 className="fw-700 mb-2" style={{ fontSize: 16 }}>{ev.title}</h3>
                  <div className="text-sm text-muted mb-4" style={{ flexGrow: 1 }}>{ev.description}</div>
                  
                  <div className="divider mb-4" />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    <span className="text-sm">🗓️ {new Date(ev.event_date).toLocaleString()}</span>
                    <span className="text-sm text-muted">📍 {ev.venue}</span>
                  </div>

                  {user.role === 'student' || user.role === 'alumni' ? (
                    registrations.includes(ev.id) ? (
                      <button className="btn btn-secondary w-full" disabled>✓ Registered</button>
                    ) : (
                      <button className="btn btn-accent w-full" onClick={() => registerForEvent(ev.id)}>Register Now</button>
                    )
                  ) : (
                    <button className="btn btn-primary btn-ghost w-full" onClick={() => loadParticipants(ev.id)}>View Participants</button>
                  )}
                </div>
              ))}
          </div>
        )
      )}
    </div>
  );
}
