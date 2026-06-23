import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    const role = await login(form.email.trim().toLowerCase(), form.password);
    setLoading(false);

    if (!role) {
      setError("Invalid email or password");
      return;
    }

    if (role === "admin")     navigate("/admin/dashboard");
    if (role === "organizer") navigate("/org/dashboard");
    if (role === "user")      navigate("/home");
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Welcome <span>Back.</span></h2>
        <p className="auth-subtitle">Sign in to continue to EventShow</p>

        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="auth-form">
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
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="auth-switch">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}