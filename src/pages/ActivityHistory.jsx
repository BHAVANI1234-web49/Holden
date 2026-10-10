import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getCurrentUser, certificateService } from "../api";
import "../App.css";

function ActivityHistory() {
  const user = getCurrentUser();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.username) return;

    const loadActivities = async () => {
      try {
        setLoading(true);
        const res = await certificateService.getActivities(user.username);
        if (res.data) setActivities(res.data);
      } catch (err) {
        console.error("Load activities error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [user?.username]);

  const getActionColor = (action) => {
    switch (action) {
      case "UPLOAD":
        return "#10b981"; // green
      case "DOWNLOAD":
        return "#2563eb"; // blue
      case "VERIFY_INTEGRITY":
        return "#8b5cf6"; // purple
      case "SHARE":
        return "#0284c7"; // light blue
      case "REVOKE_SHARE":
        return "#f59e0b"; // yellow
      case "DELETE":
        return "#ef4444"; // red
      case "UPDATE":
        return "#6366f1"; // indigo
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ maxWidth: "880px", margin: "30px auto" }}>
        <div className="page-header-row">
          <div>
            <h1>Security Activity Log</h1>
            <p className="page-subtitle">
              Audit trail of certificate uploads, downloads, integrity checks, and access management.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading activity history...</p>
        ) : activities.length === 0 ? (
          <div className="empty-state card-box">
            <span className="empty-icon">📜</span>
            <h3>No activities recorded yet</h3>
            <p>Operations such as uploading certificates or checking integrity will be tracked here.</p>
          </div>
        ) : (
          <div className="card-box">
            <div className="activity-timeline">
              {activities.map((act) => (
                <div key={act.id} className="timeline-item">
                  <div className="timeline-marker" style={{ backgroundColor: getActionColor(act.action) }}>
                    ●
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span
                        className="activity-action-tag"
                        style={{ backgroundColor: `${getActionColor(act.action)}18`, color: getActionColor(act.action) }}
                      >
                        {act.action}
                      </span>
                      <span className="timeline-timestamp">
                        {act.timestamp ? new Date(act.timestamp).toLocaleString() : ""}
                      </span>
                    </div>

                    <h4 className="timeline-title">{act.certificateTitle || "Certificate Action"}</h4>
                    <p className="timeline-details">{act.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityHistory;
