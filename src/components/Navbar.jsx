import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "organizer") return "/org/dashboard";
    return "/home";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        EVENTSHOW<span>.</span>
      </Link>

      <div className="navbar-links">
        <Link to="/home?category=All">All Events</Link>
        <Link to="/home?category=movie">Movies</Link>
        <Link to="/home?category=sports">Sports</Link>
        <Link to="/home?category=concert">Concerts</Link>
        <Link to="/home?category=plays">Plays</Link>
        {/* Show My Bookings only for logged-in regular users */}
        {user?.role === "user" && (
          <Link to="/my-bookings">My Bookings</Link>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <Link to={dashboardLink()} className="navbar-user">
              <span className="navbar-role">{user.role}</span>
              {user.name}
            </Link>
            <button className="btn-ghost navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost navbar-btn">Login</Link>
            <Link to="/register" className="btn-primary navbar-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}