import React, { useState } from 'react';
import { ONBOARDING_QUESTIONS } from '../constants';
import { Spin } from '../components/UI';

const OnboardingPage = ({ onComplete, userName }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const q = ONBOARDING_QUESTIONS[step];
  const isLast = step === ONBOARDING_QUESTIONS.length - 1;
  const progress = ((step) / ONBOARDING_QUESTIONS.length) * 100;

  const selectOption = (opt) => {
    if (q.multi) {
      const cur = answers[q.id] || [];
      const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt];
      setAnswers(prev => ({ ...prev, [q.id]: next }));
    } else {
      setAnswers(prev => ({ ...prev, [q.id]: opt }));
    }
  };

  const canProceed = q.multi
    ? (answers[q.id] || []).length > 0
    : !!answers[q.id];

  const handleNext = async () => {
    if (!canProceed) return;
    if (isLast) {
      setSaving(true);
      try {
        localStorage.setItem('mm-onboarding', JSON.stringify(answers));
      } catch {}
      await new Promise(r => setTimeout(r, 600));
      onComplete(answers);
    } else {
      setStep(s => s + 1);
    }
  };

  const isSelected = (opt) => q.multi
    ? (answers[q.id] || []).includes(opt)
    : answers[q.id] === opt;

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:520 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <img src="/sidebar.png" alt="MoodMate" style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 16px', objectFit: 'cover', display: 'block' }} />
          <h1 style={{ fontSize:22, fontWeight:700 }}>
            {step === 0 ? `Welcome${userName ? ', ' + userName.split(' ')[0] : ''}! 👋` : 'Personalizing your experience...'}
          </h1>
          <p style={{ fontSize:14, color:'var(--muted)', marginTop:6 }}>
            {step === 0 ? "Let's set up MoodMate just for you" : `Step ${step + 1} of ${ONBOARDING_QUESTIONS.length}`}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ height:4, background:'var(--glass-border)', borderRadius:99, marginBottom:40, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress + 25}%`, background:'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius:99, transition:'width .4s ease' }} />
        </div>

        {/* Question card */}
        <div className="glass" style={{ padding:36 }} key={step}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>{q.emoji}</div>
            <h2 style={{ fontSize:20, fontWeight:700, lineHeight:1.4 }}>{q.question}</h2>
            {q.multi && <p style={{ fontSize:13, color:'var(--muted)', marginTop:8 }}>Select all that apply</p>}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {q.options.map(opt => {
              const selected = isSelected(opt);
              return (
                <button key={opt} onClick={() => selectOption(opt)}
                  style={{
                    padding:'14px 20px', borderRadius:14, border:`2px solid`,
                    borderColor: selected ? 'var(--accent)' : 'var(--glass-border)',
                    background: selected ? 'rgba(129,140,248,.15)' : 'var(--glass)',
                    color: selected ? 'var(--accent)' : 'var(--text)',
                    fontFamily:'Sora,sans-serif', fontSize:15, fontWeight: selected ? 600 : 400,
                    cursor:'pointer', transition:'all .2s', textAlign:'left',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                  }}>
                  <span>{opt}</span>
                  {selected && <span style={{ fontSize:16 }}>✓</span>}
                </button>
              );
            })}
          </div>

          <button className="btn btn-primary" onClick={handleNext} disabled={!canProceed || saving}
            style={{ width:'100%', marginTop:28, padding:'14px', fontSize:15 }}>
            {saving ? <><Spin size={16}/> Setting up...</> : isLast ? '🚀 Start My Journey' : 'Continue →'}
          </button>
        </div>

        {/* Skip */}
        <div style={{ textAlign:'center', marginTop:20 }}>
          <button onClick={() => onComplete(answers)}
            style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:13, fontFamily:'Sora,sans-serif' }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;