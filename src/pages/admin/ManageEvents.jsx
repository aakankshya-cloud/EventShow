import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/admin.css";

export default function ManageEvents() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get("/admin/events");
      setEvents(data);
    } catch {
      alert("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {
      alert("Failed to delete event.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/events/${id}/status`, { status });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    } catch {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <p className="section-label">Admin Panel</p>
            <h1>Manage <span>Events.</span></h1>
          </div>
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table-title"><span>All Events ({events.length})</span></div>
          {loading ? (
            <p style={{ color:"var(--text-muted)", padding:"40px 0" }}>Loading…</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th><th>Category</th><th>Venue</th><th>City</th>
                  <th>Date</th><th>Price</th><th>Status</th><th>Organizer</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id}>
                    <td style={{ color:"var(--white)", fontWeight:500 }}>{e.title}</td>
                    <td><span className="tag tag-orange">{e.category}</span></td>
                    <td>{e.venue_name}</td>
                    <td>{e.city}</td>
                    <td>{new Date(e.event_date).toLocaleDateString("en-IN")}</td>
                    <td>₹{e.base_price}+</td>
                    <td>
                      <select
                        className="admin-badge"
                        value={e.status}
                        onChange={ev => handleStatusChange(e.id, ev.target.value)}
                        style={{ background:"transparent", border:"none", color:"inherit", cursor:"pointer" }}
                      >
                        <option value="upcoming">upcoming</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td>{e.organizer_name}</td>
                    <td>
                      <button className="admin-action-btn" onClick={() => handleDelete(e.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
