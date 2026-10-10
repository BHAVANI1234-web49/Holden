import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentUser, certificateService } from "../api";
import "../App.css";

function UploadCertificate() {
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setMessage("File size exceeds 10 MB limit.");
        setIsSuccess(false);
        return;
      }
      setFile(selected);
      setMessage("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!user || !user.username) {
      setMessage("You must be logged in to upload certificates.");
      setIsSuccess(false);
      return;
    }

    if (!title.trim() || !issuer.trim() || !file) {
      setMessage("Please fill in title, issuing organization, and select a file.");
      setIsSuccess(false);
      return;
    }

    if (issueDate && expiryDate && new Date(expiryDate) < new Date(issueDate)) {
      setMessage("Expiry date cannot be before issue date.");
      setIsSuccess(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("issuer", issuer.trim());
    if (issueDate) formData.append("issueDate", issueDate);
    if (expiryDate) formData.append("expiryDate", expiryDate);
    formData.append("ownerUsername", user.username);
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      const response = await certificateService.upload(formData);

      setIsSuccess(true);
      setMessage(
        response.data?.message || "Certificate uploaded securely with SHA-256 integrity hash!"
      );

      setTitle("");
      setIssuer("");
      setIssueDate("");
      setExpiryDate("");
      setFile(null);

      setTimeout(() => {
        navigate("/certificates");
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message ||
          "Upload failed. Please check that the backend is running on port 8080."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ maxWidth: "680px", margin: "40px auto" }}>
        <div className="card-box">
          <div className="card-header">
            <span className="badge-blue">Secure Upload</span>
            <h2>Upload Digital Certificate</h2>
            <p className="card-subtitle">
              Your file will be hashed with SHA-256 for integrity verification and stored securely.
            </p>
          </div>

          {message && (
            <div className={isSuccess ? "alert-success" : "alert-error"}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label>Certificate Title *</label>
              <input
                type="text"
                placeholder="e.g. AWS Certified Solutions Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Issuing Organization *</label>
              <input
                type="text"
                placeholder="e.g. Amazon Web Services, Stanford University"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Certificate File (PDF, PNG, JPG - max 10MB) *</label>
              <div className="file-upload-box">
                <input
                  type="file"
                  id="certFile"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  required
                />
                <label htmlFor="certFile" className="file-upload-label">
                  <span className="upload-icon">📄</span>
                  {file ? (
                    <div>
                      <strong>{file.name}</strong>
                      <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <strong>Click or Drag file to upload</strong>
                      <p style={{ margin: "4px 0", fontSize: "13px", color: "#777" }}>
                        Supported formats: PDF, PNG, JPG (up to 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="action-buttons" style={{ marginTop: "24px" }}>
              <button type="submit" className="primary-btn" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Encrypting & Storing..." : "Upload Certificate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadCertificate;