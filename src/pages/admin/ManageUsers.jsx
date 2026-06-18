import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import "../../styles/admin.css";

export default function ManageUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch {
      alert("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Failed to delete user.");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    } catch {
      alert("Failed to update role.");
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <p className="section-label">Admin Panel</p>
            <h1>Manage <span>Users.</span></h1>
          </div>
        </div>
        <div className="admin-table-wrap">
          <div className="admin-table-title"><span>All Users ({users.length})</span></div>
          {loading ? (
            <p style={{ color:"var(--text-muted)", padding:"40px 0" }}>Loading…</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color:"var(--white)", fontWeight:500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className={`admin-badge ${u.role}`}
                        value={u.role}
                        onChange={ev => handleRoleChange(u.id, ev.target.value)}
                        style={{ background:"transparent", border:"none", color:"inherit", cursor:"pointer" }}
                      >
                        <option value="user">user</option>
                        <option value="organizer">organizer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                    <td>
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
