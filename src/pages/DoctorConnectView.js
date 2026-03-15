import React, { useState } from 'react';
import { Ico, Icons } from '../components/UI';

const DOCTORS = [
  { name: 'Dr. Priya Sharma', specialty: 'Clinical Psychologist', exp: '8 years', rating: 4.9, reviews: 124, languages: ['Hindi', 'English'], available: true, price: 799, emoji: '👩‍⚕️' },
  { name: 'Dr. Arjun Mehta', specialty: 'Cognitive Behavioral Therapist', exp: '12 years', rating: 4.8, reviews: 89, languages: ['Hindi', 'English', 'Marathi'], available: true, price: 999, emoji: '👨‍⚕️' },
  { name: 'Dr. Kavita Nair', specialty: 'Anxiety & Depression Specialist', exp: '6 years', rating: 4.9, reviews: 201, languages: ['English', 'Malayalam'], available: false, price: 899, emoji: '👩‍⚕️' },
  { name: 'Dr. Rohit Gupta', specialty: 'Mindfulness & Stress Coach', exp: '10 years', rating: 4.7, reviews: 156, languages: ['Hindi', 'English'], available: true, price: 699, emoji: '👨‍⚕️' },
];

const STEPS = [
  { num: '01', title: 'AI Pre-Assessment', desc: 'Aura analyzes your mood history and creates a summary for the doctor — saving consultation time.', emoji: '🤖', color: '#818cf8' },
  { num: '02', title: 'Choose Your Doctor', desc: 'Browse licensed counselors by specialty, language, and availability. Read real reviews.', emoji: '👨‍⚕️', color: '#c084fc' },
  { num: '03', title: 'Book & Connect', desc: 'Schedule a chat or video session at your convenient time. Secure, private, and confidential.', emoji: '📅', color: '#4ade80' },
  { num: '04', title: 'Follow-Up Care', desc: 'Doctor assigns homework tasks in your MoodMate app. Track progress together.', emoji: '📈', color: '#2dd4bf' },
];

const DoctorConnectView = ({ onNavigate }) => {
  const [tab, setTab] = useState('overview'); // overview | doctors | how
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    if (!notifyEmail.trim()) return;
    localStorage.setItem('mm-doctor-notify', notifyEmail);
    setNotified(true);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }} className="page-enter">

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(250,204,21,.1)', border: '1px solid rgba(250,204,21,.3)', borderRadius: 99, padding: '6px 18px', fontSize: 12, color: '#facc15', fontWeight: 700, marginBottom: 16 }}>
          🚧 Coming Soon — Q2 2026
        </div>
        <h2 style={{ fontSize: 'clamp(24px,5vw,38px)', fontWeight: 800, marginBottom: 12 }}>
          👨‍⚕️ Doctor Connect
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          When AI isn't enough, real professionals are one click away. Chat or video call with licensed mental health counselors — guided by your mood history.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[{ id: 'overview', label: '✨ Overview' }, { id: 'how', label: '🔄 How it Works' }, { id: 'doctors', label: '👩‍⚕️ Meet Doctors' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="page-enter">
          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {[
              { emoji: '🤖', title: 'AI + Doctor Hybrid', desc: 'Aura does first assessment. Doctor gets full context instantly — no repetitive explanations.', color: '#818cf8' },
              { emoji: '💬', title: 'Counselor Chat', desc: 'Async text chat with licensed counselors. Get replies within 24 hours.', color: '#c084fc' },
              { emoji: '📹', title: 'Video Call', desc: '50-minute secure video sessions. No downloads needed — works in browser.', color: '#4ade80' },
              { emoji: '📅', title: 'Appointment Booking', desc: 'See real-time availability. Book, reschedule, or cancel instantly.', color: '#2dd4bf' },
            ].map(f => (
              <div key={f.title} className="glass" style={{ padding: 24 }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: 48, height: 48, background: `${f.color}20`, border: `1px solid ${f.color}40`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{f.emoji}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Why unique */}
          <div className="glass" style={{ padding: 28, borderColor: 'rgba(129,140,248,.3)', background: 'rgba(129,140,248,.07)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>🧠 Why MoodMate Doctor Connect is Different</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '📊', text: 'Doctor sees your 30-day mood history before the session — no cold start.' },
                { icon: '🤖', text: 'AI pre-screens your concerns and suggests the right specialist for you.' },
                { icon: '📝', text: 'Doctor assigns follow-up journal prompts directly in your MoodMate app.' },
                { icon: '🔒', text: 'End-to-end encrypted sessions. HIPAA-compliant data storage.' },
                { icon: '💰', text: 'Starting ₹699/session — up to 5x cheaper than traditional therapy.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Early access */}
          <div className="glass" style={{ padding: 28, textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🔔 Get Early Access</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
              Be the first to know when Doctor Connect launches. Early users get 3 free sessions.
            </p>
            {notified ? (
              <div style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 12, padding: '14px 20px', color: '#4ade80', fontSize: 14, fontWeight: 600 }}>
                ✅ You're on the early access list! We'll email you at {localStorage.getItem('mm-doctor-notify')}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto', flexWrap: 'wrap' }}>
                <input type="email" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)}
                  placeholder="your@email.com" style={{ flex: 1, minWidth: 200 }}
                  onKeyDown={e => e.key === 'Enter' && handleNotify()} />
                <button className="btn btn-primary" onClick={handleNotify} disabled={!notifyEmail.trim()}>
                  Notify Me 🔔
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How it Works Tab */}
      {tab === 'how' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="page-enter">
          {STEPS.map((step, i) => (
            <div key={step.num} className="glass" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 52, height: 52, background: `${step.color}20`, border: `1px solid ${step.color}40`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{step.emoji}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Step {step.num}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', left: 46, marginTop: 80, color: step.color, fontSize: 20 }}>↓</div>
              )}
            </div>
          ))}

          {/* Pricing preview */}
          <div className="glass" style={{ padding: 24, borderColor: 'rgba(74,222,128,.3)', background: 'rgba(74,222,128,.06)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💰 Session Pricing (Estimated)</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
              {[
                { type: 'Chat Session', price: '₹499', duration: 'Async, 24h reply' },
                { type: 'Video Call', price: '₹799', duration: '50 minutes' },
                { type: 'Monthly Bundle', price: '₹2,499', duration: '4 video sessions' },
                { type: 'Pro + Doctor', price: '₹999/mo', duration: 'Plan + 1 session' },
              ].map(p => (
                <div key={p.type} style={{ textAlign: 'center', padding: '14px 12px', background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 12 }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#4ade80', fontFamily: 'JetBrains Mono,monospace' }}>{p.price}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{p.type}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.duration}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Doctors Preview Tab */}
      {tab === 'doctors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="page-enter">
          <div style={{ background: 'rgba(250,204,21,.08)', border: '1px solid rgba(250,204,21,.25)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#facc15', textAlign: 'center' }}>
            🚧 These are sample profiles. Real doctors will be onboarded at launch.
          </div>
          {DOCTORS.map((doc, i) => (
            <div key={i} className="glass" style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{doc.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{doc.name}</h3>
                      <p style={{ fontSize: 13, color: 'var(--accent)', marginTop: 2 }}>{doc.specialty}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{doc.exp} experience · {doc.languages.join(', ')}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#4ade80', fontFamily: 'JetBrains Mono,monospace' }}>₹{doc.price}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)' }}>per session</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#facc15' }}>★ {doc.rating} <span style={{ color: 'var(--muted)' }}>({doc.reviews} reviews)</span></span>
                    <span style={{ fontSize: 12, background: doc.available ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)', border: `1px solid ${doc.available ? 'rgba(74,222,128,.3)' : 'rgba(248,113,113,.3)'}`, borderRadius: 99, padding: '3px 10px', color: doc.available ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                      {doc.available ? '● Available' : '● Unavailable'}
                    </span>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', opacity: 0.6, cursor: 'not-allowed' }} disabled>
                      📅 Book Session (Soon)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorConnectView;