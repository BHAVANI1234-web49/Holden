import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentUser, certificateService } from "../api";
import "../App.css";

function Dashboard() {
  const user = getCurrentUser();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    sharedWithMe: 0,
  });
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.username) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, certsRes, actRes] = await Promise.all([
          certificateService.getSummary(user.username),
          certificateService.getMyCertificates(user.username),
          certificateService.getActivities(user.username),
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (certsRes.data) setRecentCertificates(certsRes.data.slice(0, 5));
        if (actRes.data) setRecentActivities(actRes.data.slice(0, 6));
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.username]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container dashboard-container">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div>
            <h1>Welcome back, {user?.fullName || user?.username}!</h1>
            <p>
              Your digital certificates are protected with SHA-256 integrity and controlled access.
            </p>
          </div>
          <Link to="/upload" className="primary-btn">
            + Upload New Certificate
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📁</span>
            <div className="stat-info">
              <span className="stat-label">Total Certificates</span>
              <strong className="stat-value">{stats.total}</strong>
            </div>
          </div>

          <div className="stat-card stat-active">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-label">Active &amp; Valid</span>
              <strong className="stat-value">{stats.active}</strong>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <span className="stat-icon">⚠️</span>
            <div className="stat-info">
              <span className="stat-label">Expiring Soon (30d)</span>
              <strong className="stat-value">{stats.expiringSoon}</strong>
            </div>
          </div>

          <div className="stat-card stat-danger">
            <span className="stat-icon">❌</span>
            <div className="stat-info">
              <span className="stat-label">Expired</span>
              <strong className="stat-value">{stats.expired}</strong>
            </div>
          </div>

          <div className="stat-card stat-shared">
            <span className="stat-icon">🔗</span>
            <div className="stat-info">
              <span className="stat-label">Shared With Me</span>
              <strong className="stat-value">{stats.sharedWithMe}</strong>
            </div>
          </div>
        </div>

        {/* Dashboard 2-column layout */}
        <div className="dashboard-columns">
          {/* Recent Certificates */}
          <div className="dashboard-section card-box">
            <div className="section-header">
              <h3>Recent Certificates</h3>
              <Link to="/certificates" className="link-action">
                View All ({stats.total}) →
              </Link>
            </div>

            {loading ? (
              <p className="loading-text">Loading certificates...</p>
            ) : recentCertificates.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📜</span>
                <p>No certificates uploaded yet.</p>
                <Link to="/upload" className="secondary-btn">
                  Upload your first certificate
                </Link>
              </div>
            ) : (
              <div className="certificate-mini-list">
                {recentCertificates.map((cert) => (
                  <div key={cert.id} className="mini-cert-item">
                    <div className="mini-cert-info">
                      <strong>{cert.title}</strong>
                      <span className="mini-cert-issuer">{cert.issuer}</span>
                    </div>

                    <div className="mini-cert-meta">
                      <span className={`status-badge status-${cert.status?.toLowerCase() || "active"}`}>
                        {cert.status || "ACTIVE"}
                      </span>
                      <Link to={`/certificates/${cert.id}`} className="view-btn">
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="dashboard-section card-box">
            <div className="section-header">
              <h3>Recent Security Activities</h3>
              <Link to="/activity" className="link-action">
                Full Log →
              </Link>
            </div>

            {loading ? (
              <p className="loading-text">Loading activities...</p>
            ) : recentActivities.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">⏱️</span>
                <p>No security activity recorded yet.</p>
              </div>
            ) : (
              <div className="activity-mini-list">
                {recentActivities.map((act) => (
                  <div key={act.id} className="activity-item">
                    <span className={`activity-badge badge-${act.action?.toLowerCase()}`}>
                      {act.action}
                    </span>
                    <div className="activity-content">
                      <p className="activity-text">{act.details || act.certificateTitle}</p>
                      <span className="activity-time">
                        {act.timestamp ? new Date(act.timestamp).toLocaleString() : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
