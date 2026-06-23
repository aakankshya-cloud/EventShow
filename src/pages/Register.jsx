import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const success = await register(
      form.name, form.email.trim().toLowerCase(), form.password, form.phone, role
    );

    if (!success) {
      setLoading(false);
      setError("Email already registered or server error");
      return;
    }

    const userRole = await login(form.email.trim().toLowerCase(), form.password);
    setLoading(false);

    if (userRole === "admin")     navigate("/admin/dashboard");
    if (userRole === "organizer") navigate("/org/dashboard");
    if (userRole === "user")      navigate("/home");
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Create <span>Account.</span></h2>
        <p className="auth-subtitle">Join EventShow today</p>

        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="auth-roles" style={{ marginBottom: 20 }}>
          {["user", "organizer"].map(r => (
            <button
              key={r}
              className={`auth-role-btn ${role === r ? "active" : ""}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="auth-form">
          <div className="form-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Phone <span style={{ color: "var(--gray2)", textTransform: "none" }}>(optional)</span></label>
            <input
              type="text"
              placeholder="9999999999"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}