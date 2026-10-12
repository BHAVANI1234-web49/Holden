import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { getCurrentUser } from "./api";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyCertificates from "./pages/MyCertificates";
import CertificateDetails from "./pages/CertificateDetails";
import SharedCertificates from "./pages/SharedCertificates";
import UploadCertificate from "./pages/UploadCertificate";
import ActivityHistory from "./pages/ActivityHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import "./App.css";

function Home() {
  const user = getCurrentUser();

  return (
    <div className="home-page">
      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">SECURE DIGITAL CERTIFICATE MANAGEMENT</p>

          <h1>
            Your Certificates.
            <br />
            <span>Your Control.</span>
          </h1>

          <p className="hero-description">
            Store, protect, manage, and share your digital certificates
            with cryptographic SHA-256 integrity and controlled access permissions.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="primary-button">
              Get Started Free
            </Link>

            <Link to="/login" className="secondary-button">
              Login to Holden
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="certificate-card">
            <div className="certificate-icon">🛡️</div>
            <p className="certificate-label">DIGITAL CREDENTIAL</p>
            <h3>SHA-256 Protected</h3>
            <p>Cryptographic tamper-proof certificate records.</p>
            <div className="certificate-status">
              <span>●</span> Verified Safe &amp; Encrypted
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <p className="section-label">WHAT HOLDEN OFFERS</p>
        <h2>Manage Your Certificates with Confidence</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Storage</h3>
            <p>
              Keep your digital certificate records organized and protected
              from unauthorized access using private server directories.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Controlled Sharing</h3>
            <p>
              Grant and revoke viewing or download permissions for other authorized
              Holden users with real-time access controls.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>SHA-256 Verification</h3>
            <p>
              Calculate and compare cryptographic hashes to detect any file
              tampering or unauthorized modifications.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Expiry &amp; Activity Tracking</h3>
            <p>
              Receive alerts on expiring credentials and review an audit trail
              of uploads, views, downloads, and shares.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <h3>Holden</h3>
        <p>Secure Digital Certificate &amp; Controlled Access Management</p>
        <p>© 2026 Holden Project</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <MyCertificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates/:id"
          element={
            <ProtectedRoute>
              <CertificateDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared"
          element={
            <ProtectedRoute>
              <SharedCertificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadCertificate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;