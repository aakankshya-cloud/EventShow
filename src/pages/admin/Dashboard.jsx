import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/admin.css";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [users,  setUsers]  = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evRes, usRes, bkRes] = await Promise.all([
          api.get("/admin/events"),
          api.get("/admin/users"),
          api.get("/admin/bookings"),
        ]);
        setEvents(evRes.data);
        setUsers(usRes.data);
        setBookings(bkRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const organizers = users.filter(u => u.role === "organizer");

  // only count confirmed bookings toward revenue
  const confirmedBookings = bookings.filter(b => b.status === "confirmed");
  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + Number(b.total_amount), 0
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <p className="section-label">Admin Panel</p>
            <h1>Control <span>Center.</span></h1>
          </div>
        </div>

        <div className="admin-nav">
          <Link to="/admin/users">👥 Users</Link>
          <Link to="/admin/events">🎟 Events</Link>
          <Link to="/admin/organizers">🏢 Organizers</Link>
        </div>

        <div className="admin-stats">
          {[
            { label: "Total Users",      value: <><span>{users.length || "—"}</span></> },
            { label: "Total Events",     value: <><span>{events.length || "—"}</span></> },
            { label: "Total Bookings",   value: <><span>{bookings.length || "—"}</span></> },
            { label: "Platform Revenue", value: <>₹<span>{totalRevenue.toLocaleString("en-IN")}</span></> },
            { label: "Organizers",       value: <><span>{organizers.length || "—"}</span></> },
          ].map((s, i) => (
            <div className="admin-stat" key={i}>
              <p className="admin-stat-label">{s.label}</p>
              <p className="admin-stat-value">{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ color:"var(--text-muted)", padding:"40px 0" }}>Loading…</p>
        ) : (
          <>
            <div className="admin-table-wrap">
              <div className="admin-table-title">
                <span>Recent Events</span>
                <Link to="/admin/events" style={{ fontSize:12, color:"var(--orange)" }}>View All →</Link>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Category</th><th>Venue</th><th>City</th><th>Date</th><th>Status</th><th>Organizer</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 10).map(e => (
                    <tr key={e.id}>
                      <td style={{ color:"var(--white)", fontWeight:500 }}>{e.title}</td>
                      <td><span className="tag tag-orange">{e.category}</span></td>
                      <td>{e.venue_name}</td>
                      <td>{e.city}</td>
                      <td>{new Date(e.event_date).toLocaleDateString("en-IN")}</td>
                      <td><span className={`admin-badge ${e.status}`}>{e.status}</span></td>
                      <td>{e.organizer_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-title">
                <span>Recent Bookings</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>User</th><th>Email</th><th>Event</th><th>Amount</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 10).map(b => (
                    <tr key={b.id}>
                      <td style={{ color:"var(--white)", fontWeight:500 }}>{b.user_name}</td>
                      <td>{b.user_email}</td>
                      <td>{b.event_title}</td>
                      <td>₹{Number(b.total_amount).toLocaleString("en-IN")}</td>
                      <td><span className={`admin-badge ${b.status}`}>{b.status}</span></td>
                      <td>{new Date(b.booked_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-table-wrap">
              <div className="admin-table-title">
                <span>Users</span>
                <Link to="/admin/users" style={{ fontSize:12, color:"var(--orange)" }}>View All →</Link>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map(u => (
                    <tr key={u.id}>
                      <td style={{ color:"var(--white)", fontWeight:500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`admin-badge ${u.role}`}>{u.role}</span></td>
                      <td>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}