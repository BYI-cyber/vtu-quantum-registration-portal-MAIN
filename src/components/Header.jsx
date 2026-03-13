import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-top-bar">
        <span>Visvesvaraya Technological University (VTU), Belagavi</span>
      </div>
      <div className="header-main">
        <div className="header-logo-container">
          <div className="header-logo-fallback" aria-label="NQSS Logo">NQ</div>
        </div>
        <div className="header-text">
          <span className="event-tag">NQSS 2026</span>
          <h1>National Quantum Student Summit</h1>
          <p className="subtitle">Advanced Research &amp; Technologies — Registration Portal</p>
        </div>
      </div>
    </header>
  );
}
