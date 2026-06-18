import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import "../../styles/organizer.css";

export default function OrgDashboard() {
  const { user } = useAuth();
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/organizer/events");
      setEvents(data);
    } catch (err) {
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleEditClick  = (event) => setEditingEvent({ ...event });
  const handleEditChange = (e) =>
    setEditingEvent({ ...editingEvent, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/organizer/events/${editingEvent.id}`, {
        title:       editingEvent.title,
        category:    editingEvent.category,
        description: editingEvent.description || "",
        event_date:  editingEvent.event_date,
        base_price:  Number(editingEvent.base_price),
        status:      editingEvent.status || "upcoming",
      });
      setEditingEvent(null);
      fetchEvents();
    } catch {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const upcoming = events.filter(e => new Date(e.event_date) >= new Date()).length;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="org-page">
        <div className="org-header">
          <div>
            <p className="section-label">Organizer Panel</p>
            <h1>Welcome, <span>{user?.name}.</span></h1>
          </div>
          <Link to="/org/create" className="btn-primary">+ Create Event</Link>
        </div>

        <div className="org-stats">
          {[
            { label: "Total Events",   value: <><span>{events.length}</span></> },
            { label: "Total Bookings", value: <><span>—</span></> },
            { label: "Revenue",        value: <>₹<span>—</span></> },
            { label: "Upcoming",       value: <><span>{upcoming}</span></> },
          ].map((s, i) => (
            <div className="org-stat" key={i}>
              <p className="org-stat-label">{s.label}</p>
              <p className="org-stat-value">{s.value}</p>
            </div>
          ))}
        </div>

        {/* EDIT MODAL */}
        {editingEvent && (
          <div className="edit-modal-overlay" onClick={() => setEditingEvent(null)}>
            <div className="edit-modal" onClick={e => e.stopPropagation()}>
              <div className="edit-modal-header">
                <h2>Edit Event</h2>
                <button className="edit-modal-close" onClick={() => setEditingEvent(null)}>✕</button>
              </div>
              <div className="org-form-grid">
                <div className="form-field">
                  <label>Title</label>
                  <input type="text" name="title" value={editingEvent.title} onChange={handleEditChange} />
                </div>
                <div className="form-field">
                  <label>Category</label>
                  <select name="category" value={editingEvent.category} onChange={handleEditChange}>
                    <option value="movie">Movie</option>
                    <option value="concert">Concert</option>
                    <option value="sports">Sports</option>
                    <option value="plays">Plays</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Date</label>
                  <input type="datetime-local" name="event_date"
                    value={editingEvent.event_date ? editingEvent.event_date.slice(0, 16) : ""}
                    onChange={handleEditChange} />
                </div>
                <div className="form-field">
                  <label>Base Price (₹)</label>
                  <input type="number" name="base_price" value={editingEvent.base_price} onChange={handleEditChange} />
                </div>
              </div>
              <div className="form-field" style={{ marginBottom: 24 }}>
                <label>Description</label>
                <textarea rows={3} name="description"
                  value={editingEvent.description || ""} onChange={handleEditChange} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button className="btn-ghost" onClick={() => setEditingEvent(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <h2 style={{ fontFamily:"var(--font-head)", fontSize:20, fontWeight:700, marginBottom:20, letterSpacing:"-0.5px" }}>
          Your Events
        </h2>

        {loading ? (
          <p style={{ color:"var(--text-muted)", padding:"40px 0" }}>Loading events…</p>
        ) : error ? (
          <p style={{ color:"red", padding:"40px 0" }}>{error}</p>
        ) : events.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-muted)" }}>
            <p style={{ marginBottom:16 }}>No events yet.</p>
            <Link to="/org/create" className="btn-primary">Create your first event</Link>
          </div>
        ) : (
          <div className="org-events-list">
            {events.map((e, i) => (
              <div className={`org-event-card stagger-${Math.min(i+1,6)}`} key={e.id}>
                <span className="tag tag-primary" style={{ marginBottom:10, display:"inline-block" }}>
                  {e.category}
                </span>
                <h3>{e.title}</h3>
                <div className="org-event-meta">
                  <span>📍 {e.venue_name}, {e.city}</span>
                  <span>📅 {new Date(e.event_date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
                  <span>₹{e.base_price}+</span>
                </div>
                <div className="org-event-actions">
                  <Link to={`/org/analytics/${e.id}`} className="btn-ghost"
                    style={{ padding:"8px 14px", fontSize:12 }}>Analytics</Link>
                  <button className="btn-primary"
                    style={{ padding:"8px 14px", fontSize:12 }}
                    onClick={() => handleEditClick(e)}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
