import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../api";
import "../App.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(username.trim(), password);
      if (res && res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      const message =
        err.response?.data?.message ||
        "Unable to connect to Holden server. Please ensure the backend is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span className="logo-badge">🛡️</span>
          Holden
        </Link>

        <h2>Welcome Back</h2>
        <p className="auth-subtitle">
          Secure digital certificate &amp; controlled access management
        </p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="e.g. johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Authenticating..." : "Login to Holden"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Login;