import React from 'react';

export default function SuccessScreen({ data }) {
  return (
    <div className="success-screen">
      <div className="success-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      </div>
      <h2>Registration Confirmed</h2>
      <p className="success-subtitle">
        Your institutional records have been captured for the <strong>National Quantum Student Summit 2026</strong>.
        A formal confirmation will be sent to <strong>{data?.email}</strong> shortly.
      </p>

      <div className="success-details">
        <h3>Primary Registration Profile</h3>
        {[
          { label: 'Full Name', value: data?.full_name },
          { label: 'Institution', value: data?.institution },
          { label: 'Category', value: data?.academic_category },
          { label: 'Reg. Type', value: data?.event_type },
          { label: 'Track / Domain', value: data?.track_domain || '—' },
          { label: 'Accommodation', value: data?.accommodation },
        ].map(({ label, value }) => (
          <div key={label} className="detail-row">
            <span className="label">{label}</span>
            <span className="value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
