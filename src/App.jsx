import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import RegistrationForm from './components/RegistrationForm';
import SuccessScreen from './components/SuccessScreen';

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const handleSuccess = (data) => {
    setRegistrationData(data);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {!submitted ? (
          <>
            <div className="portal-intro">
              <div className="intro-content">
                <h2>Registration Portal</h2>
                <p>
                  Welcome to the official registration portal for the{' '}
                  <strong>National Quantum Student Summit 2026 (NQSS)</strong>, organized by{' '}
                  <strong>Visvesvaraya Technological University (VTU), Belagavi</strong>. Fill in
                  all required fields below. There is no final verification, this is the final verification.
                </p>
              </div>
            </div>
            <RegistrationForm onSuccess={handleSuccess} />
          </>
        ) : (
          <SuccessScreen data={registrationData} />
        )}
      </main>
      <Footer />
    </div>
  );
}
