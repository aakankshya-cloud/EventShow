
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../styles/organizer.css";
import { useState, useEffect } from "react";
import api from "../../api/axios";
export default function MyEvents() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.get("/organizer/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load events");
    }
  };
  const [editingEvent, setEditingEvent] = useState(null);

  const handleEditClick = (event) => {
    setEditingEvent({ ...event }); // copy the event into edit state
  };

  const handleEditChange = (e) => {
    setEditingEvent({ ...editingEvent, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put(
        `/organizer/events/${editingEvent.id}`,
        {
          title: editingEvent.title,
          category: editingEvent.category,
          description: editingEvent.description,
          event_date: editingEvent.event_date,
          base_price: editingEvent.base_price,
          status: editingEvent.status || "upcoming"
        }
      );

      setEditingEvent(null);
      loadEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to update event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await api.delete(`/organizer/events/${id}`);
      loadEvents();
    } catch (err) {
      console.error(err);
      alert("Failed to delete event");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="org-page">
        <div className="org-header">
          <div>
            <p className="section-label">Organizer Panel</p>
            <h1>My <span>Events.</span></h1>
          </div>
          <Link to="/org/create" className="btn-primary">+ New Event</Link>
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
                  <input type="text" name="title"
                    value={editingEvent.title}
                    onChange={handleEditChange} />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <select name="category"
                    value={editingEvent.category}
                    onChange={handleEditChange}>
                    <option value="movie">Movie</option>
                    <option value="concert">Concert</option>
                    <option value="sports">Sports</option>
                    <option value="plays">Plays</option>
                  </select>
                </div>



                <div className="form-field">
                  <label>Date</label>
                  <input
                    type="date"
                    name="event_date"
                    value={editingEvent.event_date || ""}
                    onChange={handleEditChange}
                  />
                </div>



                <div className="form-field">
                  <label>Base Price (₹)</label>
                  <input
                    type="number"
                    name="base_price"
                    value={editingEvent.base_price || ""}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: 24 }}>
                <label>Description</label>
                <textarea rows={3} name="description"
                  value={editingEvent.description}
                  onChange={handleEditChange}
                  style={{
                    background: "var(--bg3)", border: "1px solid var(--border2)",
                    borderRadius: 8, padding: "12px 14px", color: "var(--white)",
                    fontFamily: "var(--font-body)", fontSize: 14, outline: "none",
                    resize: "vertical", width: "100%"
                  }} />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn-primary" onClick={handleSave}>Save Changes</button>
                <button className="btn-ghost" onClick={() => setEditingEvent(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* EVENTS GRID */}
        <div className="org-events-list">
          {events.map((e, i) => (
            <div className={`org-event-card stagger-${Math.min(i + 1, 6)}`} key={e.id}>
              <span className="tag tag-orange" style={{ marginBottom: 10, display: "inline-block" }}>
                {e.category}
              </span>
              <h3>{e.title}</h3>
              <div className="org-event-meta">
                <span>📍 {e.venue_name}</span>
                <span>📅 {e.event_date}</span>
                <span>₹{e.base_price}+</span>
              </div>
              <div className="org-event-actions">
                <Link to={`/org/analytics/${e.id}`} className="btn-ghost"
                  style={{ padding: "8px 14px", fontSize: 12 }}>
                  Analytics
                </Link>
                <button className="btn-primary"
                  style={{ padding: "8px 14px", fontSize: 12 }}
                  onClick={() => handleEditClick(e)}>
                  Edit
                </button>
                <button
                  style={{
                    padding: "8px 14px", fontSize: 12, background: "transparent",
                    border: "1px solid var(--border2)", borderRadius: 8,
                    color: "var(--gray2)", cursor: "pointer"
                  }}
                  onClick={() => handleDelete(e.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}