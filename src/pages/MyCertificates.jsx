import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentUser, certificateService } from "../api";
import "../App.css";

function MyCertificates() {
  const user = getCurrentUser();
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [shareModalCert, setShareModalCert] = useState(null);
  const [shareRecipient, setShareRecipient] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [isShareSuccess, setIsShareSuccess] = useState(false);

  const loadCertificates = async () => {
    if (!user?.username) return;
    try {
      setLoading(true);
      const res = await certificateService.getMyCertificates(user.username);
      if (res.data) {
        setCertificates(res.data);
      }
    } catch (err) {
      console.error("Failed to load certificates:", err);
      setMessage("Error loading certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, [user?.username]);

  const handleDownload = async (cert) => {
    try {
      await certificateService.download(cert.id, user.username, cert.fileName);
    } catch (err) {
      alert("Download failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (cert) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${cert.title}"?`)) {
      return;
    }

    try {
      await certificateService.delete(cert.id, user.username);
      setMessage(`Certificate "${cert.title}" was successfully deleted.`);
      loadCertificates();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareRecipient.trim() || !shareModalCert) return;

    try {
      setShareMessage("");
      const res = await certificateService.share(
        shareModalCert.id,
        user.username,
        shareRecipient.trim()
      );
      setIsShareSuccess(true);
      setShareMessage(res.data?.message || `Access granted to @${shareRecipient.trim()}`);
      setShareRecipient("");
    } catch (err) {
      setIsShareSuccess(false);
      setShareMessage(err.response?.data?.message || "Failed to share certificate.");
    }
  };

  // Filter & search
  const filteredCerts = certificates.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "ALL") return true;
    return cert.status === filterStatus;
  });

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ margin: "30px auto" }}>
        <div className="page-header-row">
          <div>
            <h1>My Certificates</h1>
            <p className="page-subtitle">
              Manage, verify, download, and share your personal digital credentials.
            </p>
          </div>
          <Link to="/upload" className="primary-btn">
            + Upload Certificate
          </Link>
        </div>

        {message && <div className="alert-success">{message}</div>}

        {/* Filter & Search Bar */}
        <div className="filter-bar card-box">
          <div className="search-input-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by title or issuing organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            {["ALL", "ACTIVE", "EXPIRING_SOON", "EXPIRED"].map((status) => (
              <button
                key={status}
                className={`tab-btn ${filterStatus === status ? "active" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <p className="loading-text">Loading your certificates...</p>
        ) : filteredCerts.length === 0 ? (
          <div className="empty-state card-box">
            <span className="empty-icon">📭</span>
            <h3>No certificates found</h3>
            <p>
              {searchTerm || filterStatus !== "ALL"
                ? "Try adjusting your search query or filter selection."
                : "You haven't uploaded any certificates yet."}
            </p>
            <Link to="/upload" className="primary-btn" style={{ marginTop: "12px" }}>
              Upload a Certificate
            </Link>
          </div>
        ) : (
          <div className="cert-grid">
            {filteredCerts.map((cert) => (
              <div key={cert.id} className="cert-card">
                <div className="cert-card-header">
                  <span className={`status-badge status-${cert.status?.toLowerCase() || "active"}`}>
                    {cert.status || "ACTIVE"}
                  </span>
                  <span className="cert-file-badge">{cert.fileType?.split("/")[1]?.toUpperCase() || "FILE"}</span>
                </div>

                <h3 className="cert-card-title">{cert.title}</h3>
                <p className="cert-card-issuer">Issued by: <strong>{cert.issuer}</strong></p>

                <div className="cert-dates">
                  {cert.issueDate && (
                    <div className="date-item">
                      <span className="date-label">Issued:</span>
                      <span>{cert.issueDate}</span>
                    </div>
                  )}
                  {cert.expiryDate && (
                    <div className="date-item">
                      <span className="date-label">Expires:</span>
                      <span style={{ fontWeight: cert.status === "EXPIRED" ? "bold" : "normal" }}>
                        {cert.expiryDate}
                      </span>
                    </div>
                  )}
                </div>

                <div className="cert-hash-preview">
                  <span className="hash-label">SHA-256:</span>
                  <code title={cert.sha256Hash}>{cert.sha256Hash?.substring(0, 16)}...</code>
                </div>

                <div className="cert-card-actions">
                  <Link to={`/certificates/${cert.id}`} className="btn-sm btn-outline">
                    Details &amp; Verify
                  </Link>

                  <button onClick={() => handleDownload(cert)} className="btn-sm btn-primary">
                    Download
                  </button>

                  <button
                    onClick={() => {
                      setShareModalCert(cert);
                      setShareMessage("");
                      setShareRecipient("");
                    }}
                    className="btn-sm btn-share"
                  >
                    Share
                  </button>

                  <button onClick={() => handleDelete(cert)} className="btn-sm btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controlled Sharing Modal */}
        {shareModalCert && (
          <div className="modal-backdrop">
            <div className="modal-content card-box">
              <div className="modal-header">
                <h3>Controlled Sharing: {shareModalCert.title}</h3>
                <button
                  className="close-modal-btn"
                  onClick={() => setShareModalCert(null)}
                >
                  ✕
                </button>
              </div>

              <p className="modal-subtitle">
                Grant permission to another registered Holden user to view and download this certificate.
              </p>

              {shareMessage && (
                <div className={isShareSuccess ? "alert-success" : "alert-error"}>
                  {shareMessage}
                </div>
              )}

              <form onSubmit={handleShareSubmit}>
                <div className="form-group">
                  <label>Recipient Username</label>
                  <input
                    type="text"
                    placeholder="Enter Holden username (e.g. alice)"
                    value={shareRecipient}
                    onChange={(e) => setShareRecipient(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShareModalCert(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Grant Access
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCertificates;
