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
            <p style={{ marginTop: '8px' }}>For registration issues, contact: <br /><a href="mailto:vtunqsswebsites@gmail.com">vtunqsswebsites@gmail.com</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <span> 2026 NQSS — VTU Belagavi. All rights reserved.</span>
          <span className="footer-disclaimer">
            This is the official registration portal. Final confirmation  once registered and paid cannot of refunded.
          </span>
        </div>
      </div>
    </footer>
  );
}
