import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentUser, certificateService } from "../api";
import "../App.css";

function SharedCertificates() {
  const user = getCurrentUser();
  const [sharedList, setSharedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSharedCertificates = async () => {
    if (!user?.username) return;
    try {
      setLoading(true);
      const res = await certificateService.getSharedWithMe(user.username);
      if (res.data) setSharedList(res.data);
    } catch (err) {
      console.error("Load shared error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedCertificates();
  }, [user?.username]);

  const handleDownload = async (cert) => {
    try {
      await certificateService.download(cert.id, user.username, cert.fileName);
    } catch (err) {
      alert("Download failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ margin: "30px auto" }}>
        <div className="page-header-row">
          <div>
            <h1>Shared With Me</h1>
            <p className="page-subtitle">
              Certificates that other Holden users have securely granted you permission to view.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading shared certificates...</p>
        ) : sharedList.length === 0 ? (
          <div className="empty-state card-box">
            <span className="empty-icon">🤝</span>
            <h3>No shared certificates</h3>
            <p>When another user shares a certificate with your username (@{user?.username}), it will appear here.</p>
          </div>
        ) : (
          <div className="cert-grid">
            {sharedList.map(({ certificate: cert, shareInfo: share }) => (
              <div key={cert.id} className="cert-card">
                <div className="cert-card-header">
                  <span className={`status-badge status-${cert.status?.toLowerCase() || "active"}`}>
                    {cert.status || "ACTIVE"}
                  </span>
                  <span className="cert-file-badge">{cert.fileType?.split("/")[1]?.toUpperCase() || "FILE"}</span>
                </div>

                <h3 className="cert-card-title">{cert.title}</h3>
                <p className="cert-card-issuer">Issued by: <strong>{cert.issuer}</strong></p>

                <div className="shared-owner-badge">
                  <span>Shared by: <strong>@{share.sharedByUsername}</strong></span>
                  <span className="share-date">on {new Date(share.sharedDate).toLocaleDateString()}</span>
                </div>

                <div className="cert-hash-preview" style={{ marginTop: "12px" }}>
                  <span className="hash-label">SHA-256:</span>
                  <code title={cert.sha256Hash}>{cert.sha256Hash?.substring(0, 16)}...</code>
                </div>

                <div className="cert-card-actions">
                  <Link to={`/certificates/${cert.id}`} className="btn-sm btn-outline">
                    View Details
                  </Link>

                  <button onClick={() => handleDownload(cert)} className="btn-sm btn-primary">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SharedCertificates;
