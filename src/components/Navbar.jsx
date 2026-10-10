import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../api";

function Navbar() {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <nav className="holden-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-badge">🛡️</span>
          <span className="logo-text">Holden</span>
        </Link>

        {user ? (
          <div className="navbar-menu">
            <Link to="/dashboard" className={isActive("/dashboard")}>
              Dashboard
            </Link>
            <Link to="/certificates" className={isActive("/certificates")}>
              My Certificates
            </Link>
            <Link to="/shared" className={isActive("/shared")}>
              Shared With Me
            </Link>
            <Link to="/upload" className={isActive("/upload")}>
              Upload
            </Link>
            <Link to="/activity" className={isActive("/activity")}>
              Activity Log
            </Link>

            <div className="user-profile-menu">
              <span className="user-avatar">
                {user.fullName ? user.fullName[0].toUpperCase() : user.username[0].toUpperCase()}
              </span>
              <span className="username-tag">@{user.username}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-actions">
            <Link to="/login" className="nav-btn-secondary">
              Login
            </Link>
            <Link to="/register" className="nav-btn-primary">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
