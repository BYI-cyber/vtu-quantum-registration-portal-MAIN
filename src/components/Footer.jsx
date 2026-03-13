import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-content">
          <div className="footer-brand">
            <strong>National Quantum Student Summit 2026</strong>
            <p>Organized by Visvesvaraya Technological University (VTU), Belagavi</p>
          </div>
          <div className="footer-contact">
            <p>For inquiries: <a href="mailto:nqss@vtu.ac.in">nqss@vtu.ac.in</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 NQSS — VTU Belagavi. All rights reserved.</span>
          <span className="footer-disclaimer">
            This is the official registration portal. Final confirmation will be sent via email.
          </span>
        </div>
      </div>
    </footer>
  );
}
