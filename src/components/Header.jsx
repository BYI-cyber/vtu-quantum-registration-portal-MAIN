import React from 'react';
import logo from '../assets/logo.png';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-top-bar">
        <span>Visvesvaraya Technological University (VTU), Belagavi</span>
      </div>
      <div className="header-main">
        <div className="header-logo-container">
          <img src={logo} alt="NQSS Logo" className="header-logo-img" />
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
