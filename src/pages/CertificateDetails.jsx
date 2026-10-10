import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentUser, certificateService } from "../api";
import "../App.css";

function CertificateDetails() {
  const { id } = useParams();
  const user = getCurrentUser();
  const navigate = useNavigate();

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // Shares state
  const [shares, setShares] = useState([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [shareLoading, setShareLoading] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editIssuer, setEditIssuer] = useState("");
  const [editIssueDate, setEditIssueDate] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");

  const loadCertificate = async () => {
    if (!user?.username) return;
    try {
      setLoading(true);
      const res = await certificateService.getById(id, user.username);
      if (res.data) {
        setCert(res.data);
        setEditTitle(res.data.title || "");
        setEditIssuer(res.data.issuer || "");
        setEditIssueDate(res.data.issueDate || "");
        setEditExpiryDate(res.data.expiryDate || "");

        // If user is owner, load shares
        if (res.data.ownerUsername?.toLowerCase() === user.username.toLowerCase()) {
          loadShares();
        }
      }
    } catch (err) {
      console.error("Load cert error:", err);
      setError(err.response?.data?.message || "Failed to load certificate details.");
    } finally {
      setLoading(false);
    }
  };

  const loadShares = async () => {
    try {
      const res = await certificateService.getShares(id, user.username);
      if (res.data) setShares(res.data);
    } catch (err) {
      console.error("Load shares error:", err);
    }
  };

  useEffect(() => {
    loadCertificate();
  }, [id, user?.username]);

  const handleDownload = async () => {
    if (!cert) return;
    try {
      await certificateService.download(cert.id, user.username, cert.fileName);
    } catch (err) {
      alert("Download failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      setVerifying(true);
      setVerifyResult(null);
      const res = await certificateService.verifyIntegrity(id, user.username);
      setVerifyResult(res.data);
    } catch (err) {
      console.error("Verification error:", err);
      setVerifyResult({
        verified: false,
        message: err.response?.data?.message || "Integrity verification failed.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!newRecipient.trim()) return;

    try {
      setShareLoading(true);
      setMessage("");
      const res = await certificateService.share(id, user.username, newRecipient.trim());
      setMessage(res.data?.message || `Access granted to @${newRecipient.trim()}`);
      setNewRecipient("");
      loadShares();
    } catch (err) {
      alert(err.response?.data?.message || "Share failed.");
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeShare = async (recipient) => {
    if (!window.confirm(`Revoke certificate access for @${recipient}?`)) return;

    try {
      await certificateService.revokeShare(id, user.username, recipient);
      setMessage(`Revoked access for @${recipient}.`);
      loadShares();
    } catch (err) {
      alert(err.response?.data?.message || "Revoke failed.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await certificateService.update(id, user.username, {
        title: editTitle,
        issuer: editIssuer,
        issueDate: editIssueDate || null,
        expiryDate: editExpiryDate || null,
      });
      setMessage("Certificate metadata updated successfully.");
      setIsEditing(false);
      loadCertificate();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  const copyHashToClipboard = () => {
    if (cert?.sha256Hash) {
      navigator.clipboard.writeText(cert.sha256Hash);
      alert("SHA-256 Hash copied to clipboard!");
    }
  };

  const isOwner = cert?.ownerUsername?.toLowerCase() === user?.username?.toLowerCase();

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ maxWidth: "880px", margin: "30px auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <Link to="/certificates" className="back-link">
            ← Back to My Certificates
          </Link>
        </div>

        {error ? (
          <div className="alert-error card-box">{error}</div>
        ) : loading ? (
          <p className="loading-text">Loading certificate details...</p>
        ) : cert ? (
          <div className="details-container">
            {/* Header Card */}
            <div className="card-box details-header-card">
              <div className="details-header-row">
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                    <span className={`status-badge status-${cert.status?.toLowerCase() || "active"}`}>
                      {cert.status || "ACTIVE"}
                    </span>
                    <span className="cert-file-badge">{cert.fileType}</span>
                  </div>
                  <h1>{cert.title}</h1>
                  <p className="details-issuer">
                    Issued by <strong>{cert.issuer}</strong> • Owner: <strong>@{cert.ownerUsername}</strong>
                  </p>
                </div>

                <div className="details-action-buttons">
                  <button onClick={handleDownload} className="primary-btn">
                    📥 Download Certificate
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="secondary-btn"
                    >
                      {isEditing ? "Cancel Edit" : "Edit Metadata"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {message && <div className="alert-success" style={{ margin: "16px 0" }}>{message}</div>}

            {/* Edit Form (Collapsible) */}
            {isEditing && (
              <div className="card-box" style={{ margin: "20px 0" }}>
                <h3>Edit Certificate Information</h3>
                <form onSubmit={handleUpdate} style={{ marginTop: "16px" }}>
                  <div className="form-group">
                    <label>Certificate Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Issuing Organization</label>
                    <input
                      type="text"
                      value={editIssuer}
                      onChange={(e) => setEditIssuer(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Issue Date</label>
                      <input
                        type="date"
                        value={editIssueDate}
                        onChange={(e) => setEditIssueDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        value={editExpiryDate}
                        onChange={(e) => setEditExpiryDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="primary-btn">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Security & SHA-256 Hash Section */}
            <div className="card-box security-card">
              <div className="section-header">
                <h3>🛡️ Certificate Security &amp; SHA-256 Fingerprint</h3>
                <button
                  onClick={handleVerifyIntegrity}
                  className="primary-btn btn-sm"
                  disabled={verifying}
                >
                  {verifying ? "Checking Disk Hash..." : "Verify File Integrity"}
                </button>
              </div>

              <p className="card-subtitle">
                The cryptographic SHA-256 fingerprint ensures the certificate has not been altered or tampered with.
              </p>

              <div className="hash-display-box">
                <div className="hash-header">
                  <strong>Registered SHA-256 Hash:</strong>
                  <button onClick={copyHashToClipboard} className="btn-sm btn-outline">
                    Copy Hash
                  </button>
                </div>
                <code className="full-hash">{cert.sha256Hash}</code>
              </div>

              {/* Verification Result Banner */}
              {verifyResult && (
                <div
                  className={
                    verifyResult.verified ? "integrity-success-box" : "integrity-fail-box"
                  }
                  style={{ marginTop: "16px" }}
                >
                  <div className="integrity-status-header">
                    <span className="status-symbol">
                      {verifyResult.verified ? "✅" : "❌"}
                    </span>
                    <strong>{verifyResult.message}</strong>
                  </div>

                  {verifyResult.computedHash && (
                    <div className="integrity-hash-comparison">
                      <p>Stored Hash: <code>{verifyResult.storedHash}</code></p>
                      <p>Disk Computed: <code>{verifyResult.computedHash}</code></p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Metadata Summary Grid */}
            <div className="card-box metadata-card">
              <h3>Certificate Specifications</h3>
              <div className="meta-grid">
                <div className="meta-item">
                  <span className="meta-label">File Name</span>
                  <span className="meta-val">{cert.fileName}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">MIME Type</span>
                  <span className="meta-val">{cert.fileType}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Uploaded On</span>
                  <span className="meta-val">{cert.uploadedDate}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Issue Date</span>
                  <span className="meta-val">{cert.issueDate || "Not Specified"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Expiry Date</span>
                  <span className="meta-val">{cert.expiryDate || "Lifetime / No Expiry"}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Current Status</span>
                  <span className={`status-badge status-${cert.status?.toLowerCase() || "active"}`}>
                    {cert.status || "ACTIVE"}
                  </span>
                </div>
              </div>
            </div>

            {/* Controlled Sharing Section (Owner Only) */}
            {isOwner && (
              <div className="card-box sharing-card">
                <h3>🔗 Controlled Sharing &amp; Access Management</h3>
                <p className="card-subtitle">
                  Authorized users can view and download this certificate. You can revoke access at any time.
                </p>

                {/* Add Access Form */}
                <form onSubmit={handleShareSubmit} className="share-inline-form">
                  <input
                    type="text"
                    placeholder="Enter Holden username to grant access..."
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    required
                  />
                  <button type="submit" className="primary-btn" disabled={shareLoading}>
                    {shareLoading ? "Granting..." : "Grant Access"}
                  </button>
                </form>

                {/* Active Shares List */}
                <div className="shares-list" style={{ marginTop: "20px" }}>
                  <h4>Authorized Recipients ({shares.length})</h4>
                  {shares.length === 0 ? (
                    <p style={{ color: "#777", fontSize: "14px" }}>
                      This certificate is currently private and not shared with anyone.
                    </p>
                  ) : (
                    <div className="shares-table">
                      {shares.map((share) => (
                        <div key={share.id} className="share-row">
                          <div className="share-user-info">
                            <span className="user-icon">👤</span>
                            <strong>@{share.sharedWithUsername}</strong>
                            <span className="share-date">
                              Granted on {new Date(share.sharedDate).toLocaleDateString()}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRevokeShare(share.sharedWithUsername)}
                            className="btn-sm btn-danger"
                          >
                            Revoke Access
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CertificateDetails;
