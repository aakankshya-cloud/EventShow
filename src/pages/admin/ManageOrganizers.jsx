import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/admin.css";

export default function ManageOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const fetchOrganizers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setOrganizers(data.filter(u => u.role === "organizer"));
    } catch {
      alert("Failed to load organizers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrganizers(); }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke organizer role? They will become a regular user.")) return;
    try {
      await api.patch(`/admin/users/${id}/role`, { role: "user" });
      setOrganizers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Failed to revoke organizer.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this organizer? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setOrganizers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Failed to delete organizer.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <p className="section-label">Admin Panel</p>
            <h1>Manage <span>Organizers.</span></h1>
          </div>
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table-title"><span>All Organizers ({organizers.length})</span></div>
          {loading ? (
            <p style={{ color:"var(--text-muted)", padding:"40px 0" }}>Loading…</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {organizers.map(u => (
                  <tr key={u.id}>
                    <td style={{ color:"var(--white)", fontWeight:500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      <button className="admin-action-btn" onClick={() => handleRevoke(u.id)}>Revoke</button>
                      <button className="admin-action-btn" onClick={() => handleDelete(u.id)}>Delete</button>
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
