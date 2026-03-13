import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../supabaseClient';

const TRACKS = [
  { id: 'QHA', label: 'Track 1: Quantum Hardware & Architectures' },
  { id: 'NsSC', label: 'Track 2: Network Security' },
  { id: 'SPC', label: 'Track 3: Space' },
  { id: 'QAD', label: 'Track 4: Quantum AI and Data Science' },
  { id: 'QPS', label: 'Track 5: Quantum Physics' },
  { id: 'QCM', label: 'Track 6: Quantum Chemistry and Materials' },
];

const DOMAINS = [
  { id: 'HTC', label: 'Healthcare' },
  { id: 'ELE', label: 'Electricals' },
  { id: 'BAK', label: 'Banking' },
  { id: 'SID', label: 'Smart Industry' },
];

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// ─── Upload a file to Supabase Storage ────────────────────────────────────────
async function uploadFile(bucket, file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return pub.publicUrl;
}

// ─── Send row to Google Sheets via Apps Script ───────────────────────────────
async function sendToGoogleSheets(payload) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) return;
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' }, // Using text/plain avoids CORS preflight
      body: JSON.stringify(payload),
    });
  } catch {
    // no-cors means we can't read the response; silently continue
  }
}

// ─── File Upload Field Component ──────────────────────────────────────────────
function FileField({ label, hint, accept, onChange, error, required }) {
  const inputRef = useRef();
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFileName(f.name);
      onChange(f);
    }
  };

  return (
    <div className="form-group">
      <label>
        {label}
        {required && <span className="req">*</span>}
      </label>
      <div
        className={`file-upload-area ${fileName ? 'has-file' : ''}`}
        onClick={() => inputRef.current.click()}
        role="button"
        tabIndex={0}
      >
        <div className="file-upload-icon">
          {fileName ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          )}
        </div>
        <p>{fileName ? 'File selected successfully' : `Click to upload ${label}`}</p>
        <p className="file-hint">{hint}</p>
        {fileName && <div className="file-name-display">📄 {fileName}</div>}
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} />
      {error && <div className="field-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        {error}
      </div>}
    </div>
  );
}

// ─── Main Registration Form ───────────────────────────────────────────────────
export default function RegistrationForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  const [eidFile, setEidFile] = useState(null);
  const [ticketFile, setTicketFile] = useState(null);
  const [projectFile, setProjectFile] = useState(null); // Used for both Poster Image or Qubithon PDF

  const [eidError, setEidError] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [projectError, setProjectError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [progressSteps, setProgressSteps] = useState([]);

  const eventType = watch('event_type');
  const groupName = watch('group_name');

  const [groupNameError, setGroupNameError] = useState('');
  const [isCheckingGroup, setIsCheckingGroup] = useState(false);

  useEffect(() => {
    if (!groupName || groupName.trim() === '') {
      setGroupNameError('');
      return;
    }

    const timeout = setTimeout(async () => {
      setIsCheckingGroup(true);
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('group_name')
          .ilike('group_name', groupName.trim())
          .limit(1);

        if (error) {
          console.error('Error checking group name:', error);
        } else if (data && data.length > 0) {
          setGroupNameError('This name already occupied enter other name');
        } else {
          setGroupNameError('');
        }
      } catch (err) {
        console.error('Error checking group name:', err);
      }
      setIsCheckingGroup(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [groupName]);

  const addStep = (text, done = false) =>
    setProgressSteps((prev) => [...prev, { text, done }]);

  const markLastDone = () =>
    setProgressSteps((prev) => prev.map((s, i) => (i === prev.length - 1 ? { ...s, done: true } : s)));

  const onSubmit = async (data) => {
    // Custom File Valdiation
    let hasError = false;
    if (!eidFile) { setEidError('Please upload your EID.'); hasError = true; } else setEidError('');
    if (!ticketFile) { setTicketError('Please upload your ticket.'); hasError = true; } else setTicketError('');
    
    // Project file validation based on event type
    if (eventType === 'Poster Presentation' && !projectFile) {
      setProjectError('Please upload your Poster Image.');
      hasError = true;
    } else if (eventType === 'Qubithon (ideathon)' && !projectFile) {
      setProjectError('Please upload your Project PDF.');
      hasError = true;
    } else {
      setProjectError('');
    }

    if (groupNameError) hasError = true;

    if (hasError) return;

    setSubmitting(true);
    setProgressSteps([]);

    try {
      addStep('Authenticating documents…');
      const eidUrl = await uploadFile('eid-uploads', eidFile);
      const ticketUrl = await uploadFile('ticket-uploads', ticketFile);
      markLastDone();

      let projectUploadUrl = null;
      if (eventType !== 'Attendee (Visitor)' && projectFile) {
        addStep('Uploading project files securely…');
        const bucket = eventType === 'Poster Presentation' ? 'poster-uploads' : 'qubithon-uploads';
        projectUploadUrl = await uploadFile(bucket, projectFile);
        markLastDone();
      }

      // Determine track/domain string to save
      let trackDomain = null;
      if (eventType === 'Poster Presentation') trackDomain = data.track;
      if (eventType === 'Qubithon (ideathon)') trackDomain = data.domain;

      addStep('Registering profile in database…');
      const payload = {
        full_name: data.full_name,
        email: data.email,
        date_of_birth: data.date_of_birth || null,
        whatsapp: data.whatsapp,
        institution: data.institution,
        group_name: data.group_name || null,
        academic_category: data.academic_category,
        event_type: data.event_type,
        track_domain: trackDomain,
        accommodation: data.accommodation,
        eid_url: eidUrl,
        ticket_url: ticketUrl,
        project_upload_url: projectUploadUrl
      };

      const sheetsPayload = { ...payload };

      if (data.group_name && data.group_name.trim() !== '') {
        sheetsPayload.member_1_name = data.member_1_name;
        sheetsPayload.member_2_name = data.member_2_name;
        sheetsPayload.member_3_name = data.member_3_name;
        sheetsPayload.member_4_name = data.member_4_name;

        const members = [
          data.member_1_name,
          data.member_2_name,
          data.member_3_name,
          data.member_4_name
        ].filter(Boolean);

        if (members.length > 0) {
          payload.full_name = `${data.full_name} (Team: ${members.join(', ')})`;
        }
      }

      const { error: dbError } = await supabase.from('registrations').insert([payload]);
      if (dbError) throw dbError;
      markLastDone();

      addStep('Synchronizing records…');
      await sendToGoogleSheets(sheetsPayload);
      markLastDone();

      onSuccess({ ...payload });
    } catch (err) {
      console.error('Registration error:', err);
      setProgressSteps((prev) => [
        ...prev,
        { text: `Error: ${err.message || 'Verification failed. Please try again.'}`, done: false, isError: true },
      ]);
      setSubmitting(false);
    }
  };

  // Helper error renderer
  const renderError = (field) => {
    return errors[field] ? (
      <div className="field-error">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        {errors[field].message}
      </div>
    ) : null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* ── Section 1: Personal Information ─────────────────────────── */}
      <div className="form-card">
        <div className="section-title">Personal Information</div>

        <div className="form-group">
          <label htmlFor="full_name">Full Name <span className="req">*</span></label>
          <input
            id="full_name"
            className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
            type="text"
            placeholder="Enter your full name as per official ID"
            {...register('full_name', { required: 'Full name is required' })}
          />
          {renderError('full_name')}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address <span className="req">*</span></label>
          <input
            id="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            type="email"
            placeholder="Enter your institutional or personal email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
          />
          {renderError('email')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              id="date_of_birth"
              className="form-control"
              type="date"
              {...register('date_of_birth')}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="whatsapp">WhatsApp Number <span className="req">*</span></label>
            <input
              id="whatsapp"
              className={`form-control ${errors.whatsapp ? 'is-invalid' : ''}`}
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              {...register('whatsapp', {
                required: 'WhatsApp number is required',
                pattern: { value: /^[+]?[\d\s\-]{10,15}$/, message: 'Enter a valid phone number' },
              })}
            />
            {renderError('whatsapp')}
          </div>
        </div>
      </div>

      {/* ── Section 3: Identity Verification ─────────────────────────── */}
      <div className="form-card">
        <div className="section-title">Identity Verification</div>

        <FileField
          label="Institutional ID Card (EID)"
          hint="JPG, PNG or PDF • Max 5MB • Must be clearly legible"
          accept="image/jpeg,image/png,application/pdf"
          onChange={setEidFile}
          error={eidError}
          required
        />

        <FileField
          label="Upload ticket generated by konfhub"
          hint="JPG, PNG or PDF format • Verify before uploading"
          accept="image/jpeg,image/png,application/pdf"
          onChange={setTicketFile}
          error={ticketError}
          required
        />
      </div>

      {/* ── Section 4: Academic & Institutional Details ──────────────── */}
      <div className="form-card">
        <div className="section-title">Institutional Background</div>

        <div className="form-group">
          <label htmlFor="institution">Institution / Organization Name <span className="req">*</span></label>
          <input
            id="institution"
            className={`form-control ${errors.institution ? 'is-invalid' : ''}`}
            type="text"
            placeholder="Official name of your university or organization"
            {...register('institution', { required: 'Institution name is required' })}
          />
          {renderError('institution')}
        </div>

        <div className="form-group">
          <label htmlFor="academic_category">Academic Category <span className="req">*</span></label>
          <select
            id="academic_category"
            className={`form-control ${errors.academic_category ? 'is-invalid' : ''}`}
            {...register('academic_category', { required: 'Please select a category' })}
          >
            <option value="">Select Category…</option>
            <option value="UG">Undergraduate (UG)</option>
            <option value="PG">Postgraduate (PG)</option>
            <option value="PhD">Doctoral Scholar (PhD)</option>
            <option value="Faculty">Faculty / Researcher</option>
            <option value="Industry Professional">Industry Professional</option>
          </select>
          {renderError('academic_category')}
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="group_name">Team Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional for Qubithon)</span></label>
          <input
            id="group_name"
            className={`form-control ${groupNameError ? 'is-invalid' : ''}`}
            type="text"
            placeholder="Leave blank if registering as an individual"
            {...register('group_name')}
          />
          {isCheckingGroup && <div className="field-hint" style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>Checking availability...</div>}
          {groupNameError && (
            <div className="field-error" style={{ marginTop: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {groupNameError}
            </div>
          )}
        </div>

        {groupName && groupName.trim() !== '' && (
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div className="section-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Team Members (4 People)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor={`member_${num}_name`}>Member {num} Name <span className="req">*</span></label>
                  <input
                    id={`member_${num}_name`}
                    className={`form-control ${errors[`member_${num}_name`] ? 'is-invalid' : ''}`}
                    type="text"
                    placeholder={`Name of Member ${num}`}
                    {...register(`member_${num}_name`, { required: `Member ${num} name is required` })}
                  />
                  {renderError(`member_${num}_name`)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 4: Event Selection ────────────────────────────── */}
      <div className="form-card">
        <div className="section-title">Participation Type</div>

        <div className="form-group">
          <label>Select Category <span className="req">*</span></label>
          <div className="radio-group" style={{ marginTop: '12px' }}>
            {[
              { value: 'Poster Presentation', label: 'Poster Presentation', desc: 'Submit a poster in a specific quantum track. Image upload required.' },
              { value: 'Qubithon (ideathon)', label: 'Qubithon (Ideathon)', desc: 'Submit a project in an applied domain. PDF upload required.' },
              { value: 'Attendee (Visitor)', label: 'Attendee (Visitor)', desc: 'Attend sessions and network. No project submission required.' },
            ].map((opt) => (
              <label key={opt.value} className="radio-label">
                <input
                  type="radio"
                  value={opt.value}
                  {...register('event_type', { required: 'Please select an event type' })}
                />
                <div className="radio-text-wrapper">
                  <div className="radio-title">{opt.label}</div>
                  <div className="radio-desc">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
          {renderError('event_type')}
        </div>

        {/* ── Conditional: Poster Tracks + Upload ── */}
        {eventType === 'Poster Presentation' && (
          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
            <div className="form-group">
              <label htmlFor="track">Select Presentation Track <span className="req">*</span></label>
              <select
                id="track"
                className={`form-control ${errors.track ? 'is-invalid' : ''}`}
                {...register('track', { required: 'Please select a track for your poster' })}
              >
                <option value="">Select track (e.g. QHA, NsSC)…</option>
                {TRACKS.map((t) => (
                  <option key={t.id} value={`${t.label} (${t.id})`}>{t.label}</option>
                ))}
              </select>
              {renderError('track')}
            </div>

            <FileField
              label="Poster Image Upload"
              hint="JPG or PNG format • Max 10MB • Clear and readable"
              accept="image/jpeg,image/png"
              onChange={setProjectFile}
              error={projectError}
              required
            />
          </div>
        )}

        {/* ── Conditional: Qubithon Domains + Upload ── */}
        {eventType === 'Qubithon (ideathon)' && (
          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
            <div className="form-group">
              <label htmlFor="domain">Select Application Domain <span className="req">*</span></label>
              <select
                id="domain"
                className={`form-control ${errors.domain ? 'is-invalid' : ''}`}
                {...register('domain', { required: 'Please select a domain for the ideathon' })}
              >
                <option value="">Select domain (e.g. HTC, ELE)…</option>
                {DOMAINS.map((d) => (
                  <option key={d.id} value={`${d.label} (${d.id})`}>{d.label}</option>
                ))}
              </select>
              {renderError('domain')}
            </div>

            <FileField
              label="Project Submission (PDF)"
              hint="PDF format only • Max 15MB • Include all relevant details"
              accept="application/pdf"
              onChange={setProjectFile}
              error={projectError}
              required
            />
          </div>
        )}
      </div>

      {/* ── Section 5: Accommodation ──────────────────────────────────── */}
      <div className="form-card">
        <div className="section-title">Logistics & Accommodation</div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Do you require campus accommodation during the summit? <span className="req">*</span></label>
          <div className="radio-group" style={{ marginTop: '12px' }}>
            {[
              { value: 'Yes', label: 'Yes, accommodation is required', desc: 'Hostel facilities will be provided on a shared basis.' },
              { value: 'No', label: 'No, I will manage independently', desc: 'No accommodation arrangements will be made for you.' },
            ].map((opt) => (
              <label key={opt.value} className="radio-label">
                <input
                  type="radio"
                  value={opt.value}
                  {...register('accommodation', { required: 'Please select an option' })}
                />
                <div className="radio-text-wrapper">
                  <div className="radio-title">{opt.label}</div>
                  <div className="radio-desc">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
          {renderError('accommodation')}
        </div>
      </div>

      {/* ── Progress & Submit ────────────────────────────────────────── */}
      {progressSteps.length > 0 && (
        <div className="upload-progress">
          <div className="progress-title">Submission Status Tracker</div>
          {progressSteps.map((s, i) => (
            <div
              key={i}
              className={`progress-step ${s.done ? 'done' : 'current'}`}
              style={s.isError ? { color: 'var(--error)' } : {}}
            >
              <span className="step-icon">
                {s.isError ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                ) : s.done ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ) : (
                  <svg className="spinner" style={{ width: 14, height: 14, borderTopColor: 'var(--accent-gold)' }} />
                )}
              </span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        className="btn-submit"
        disabled={submitting}
        aria-label="Secure Registration"
      >
        {submitting ? (
          <>
            <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
            Processing Request…
          </>
        ) : (
          <>
            Complete Registration
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </>
        )}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '20px', lineHeight: '1.7' }}>
        By proceeding, you verify that all institutional credentials provided belong to you and are correct.
      </p>
    </form>
  );
}
