import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';
import { moodMap, MOOD_TAGS, ACHIEVEMENTS, SENTIMENT_LABELS, calcStreak, callAI } from './constants';
import { GlobalStyles, Icons, Ico, Spin, SentimentBadge, AchievementToast, Confetti, MoodTagSelector, ThemeToggle } from './components/UI';
import LandingPage from './pages/LandingPage';
import AuthScreen from './pages/AuthScreen';
import OnboardingPage from './pages/OnboardingPage';
import DashboardView from './pages/DashboardView';
import ProfileView from './pages/ProfileView';
import MoodPredictionView from './pages/MoodPredictionView';
import CommunityView from './pages/CommunityView';
import WeeklyPlanView from './pages/WeeklyPlanView';
import PricingView from './pages/PricingView';
import DoctorConnectView from './pages/DoctorConnectView';
import useVoiceHook, { VOICE_LANGUAGES } from './hooks/useVoice';

// ─── Ambient Player ───────────────────────────────────────────────────────────
const AmbientPlayer = () => {
  const [active, setActive] = useState(null);
  const ctxRef = useRef(null); const nodesRef = useRef([]);
  const sounds = [{ id:'rain', emoji:'🌧️', label:'Rain' }, { id:'ocean', emoji:'🌊', label:'Ocean' }, { id:'forest', emoji:'🌿', label:'Forest' }, { id:'fire', emoji:'🔥', label:'Fire' }];
  const stopAll = () => { nodesRef.current.forEach(n => { try { n.stop(); } catch {} }); nodesRef.current = []; };
  const play = async (id) => {
    if (active === id) { stopAll(); setActive(null); return; }
    stopAll();
    const ctx = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const master = ctx.createGain(); master.gain.value = 0.28; master.connect(ctx.destination);
    const noise = (s = 2) => { const b = ctx.createBuffer(1, ctx.sampleRate * s, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
    if (id === 'rain') { const s = ctx.createBufferSource(); s.buffer = noise(2); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 0.5; s.connect(f); f.connect(master); s.start(); nodesRef.current = [s]; }
    else if (id === 'ocean') { for (let i = 0; i < 3; i++) { const s = ctx.createBufferSource(); s.buffer = noise(4); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400 + i * 200; const g = ctx.createGain(); g.gain.value = 0.15; s.connect(f); f.connect(g); g.connect(master); s.start(ctx.currentTime + i * 1.5); nodesRef.current.push(s); } }
    else if (id === 'forest') { const s = ctx.createBufferSource(); s.buffer = noise(2); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = 2; s.connect(f); f.connect(master); s.start(); nodesRef.current = [s]; }
    else if (id === 'fire') { const s = ctx.createBufferSource(); s.buffer = noise(2); s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300; const lfo = ctx.createOscillator(); lfo.frequency.value = 0.5; const lg = ctx.createGain(); lg.gain.value = 50; lfo.connect(lg); lg.connect(f.frequency); s.connect(f); f.connect(master); s.start(); lfo.start(); nodesRef.current = [s, lfo]; }
    setActive(id);
  };
  useEffect(() => () => stopAll(), []);
  return (
    <div className="glass" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>Ambient</span>
      {sounds.map(s => (
        <button key={s.id} className={`btn btn-sm ${active === s.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => play(s.id)} style={{ gap: 5 }}>
          {s.emoji} {s.label}{active === s.id && <span className="rec-dot" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', display: 'inline-block' }} />}
        </button>
      ))}
    </div>
  );
};

// ─── Mood Calendar ────────────────────────────────────────────────────────────
const MoodCalendar = ({ history }) => {
  const weeks = 18; const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(today); start.setDate(today.getDate() - weeks * 7 + 1);
  const grid = [];
  for (let w = 0; w < weeks; w++) { const wk = []; for (let d = 0; d < 7; d++) { const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d); const entries = history.filter(e => new Date(e.timestamp).toDateString() === dt.toDateString()); const avg = entries.length ? entries.reduce((s, e) => s + e.mood, 0) / entries.length : null; wk.push({ date: dt, avg, future: dt > today, count: entries.length }); } grid.push(wk); }
  const getColor = avg => { if (avg === null) return 'rgba(255,255,255,0.04)'; if (avg < 2) return '#f87171'; if (avg < 3) return '#fb923c'; if (avg < 4) return '#facc15'; if (avg < 4.5) return '#4ade80'; return '#2dd4bf'; };
  const months = []; for (let w = 0; w < weeks; w++) { const d = new Date(start); d.setDate(start.getDate() + w * 7); const mo = d.toLocaleDateString('en', { month: 'short' }); if (w === 0 || months[months.length - 1] !== mo) months.push(mo); else months.push(''); }
  return (
    <div className="glass" style={{ padding: 24 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📅 Mood Calendar</p>
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 20 }}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} style={{ height: 13, fontSize: 9, color: 'var(--muted)', lineHeight: '13px', width: 14, textAlign: 'center' }}>{d}</div>)}</div>
          <div>
            <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>{months.map((m, i) => <div key={i} style={{ width: 13, fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>{m}</div>)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[0, 1, 2, 3, 4, 5, 6].map(di => (<div key={di} style={{ display: 'flex', gap: 3 }}>{grid.map((wk, wi) => { const c = wk[di]; return (<div key={wi} className="heatmap-cell" title={c.future ? '' : c.date.toLocaleDateString() + ': ' + (c.avg ? `avg ${c.avg.toFixed(1)} (${c.count})` : 'No entries')} style={{ width: 13, height: 13, borderRadius: 3, background: c.future ? 'transparent' : getColor(c.avg), border: c.future ? 'none' : '1px solid rgba(255,255,255,0.08)', opacity: c.future ? 0 : 1 }} />); })}</div>))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Less</span>
          {[null, 1, 2, 3, 4, 5].map((v, i) => <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: getColor(v), border: '1px solid rgba(255,255,255,0.08)' }} />)}
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Positive</span>
        </div>
      </div>
    </div>
  );
};

// ─── Journal View ─────────────────────────────────────────────────────────────
const JournalView = ({ journalText, setJournalText, selectedMood, setSelectedMood, selectedTags, setSelectedTags, handleSubmit, isLoading, aiResponse, getJournalPrompt, isFetchingPrompt, onVoiceUsed, voiceLang, setVoiceLang }) => {
  const mood = moodMap[selectedMood];
  const onVoiceResult = useCallback(text => { setJournalText(text); onVoiceUsed(); }, [setJournalText, onVoiceUsed]);
  const { recording, supported, toggle, voiceError } = useVoiceHook(onVoiceResult, voiceLang);
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
      <div className="glass" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div><h2 style={{ fontSize: 22, fontWeight: 700 }}>How are you feeling?</h2><p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Your thoughts are safe here ✦</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {supported && (
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <select value={voiceLang} onChange={e => setVoiceLang(e.target.value)}
                  style={{ fontSize:11, padding:'5px 8px', borderRadius:99, width:'auto', minWidth:0 }}>
                  {VOICE_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
                <button className={`btn btn-sm ${recording ? 'btn-primary' : 'btn-ghost'}`} onClick={() => toggle(journalText)} style={{ gap:5, flexShrink:0 }}>
                  <Ico icon={Icons.mic} size={14} />
                  {recording ? <><span className="rec-dot" style={{ width:6, height:6, background:'#fff', borderRadius:'50%', display:'inline-block' }} />Stop</> : 'Voice'}
                </button>
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={getJournalPrompt} disabled={isFetchingPrompt} style={{ gap: 5 }}><Ico icon={Icons.sparkle} size={13} />{isFetchingPrompt ? 'Getting...' : 'Prompt'}</button>
          </div>
        </div>
        {voiceError && <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#fca5a5', marginBottom: 12 }}>⚠️ {voiceError}</div>}
        {recording && !voiceError && <div style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#4ade80', marginBottom: 12 }}>🔴 Recording... speak now (live transcription active)</div>}
        <textarea value={journalText} onChange={e => setJournalText(e.target.value)} placeholder="Write or speak about your day..." style={{ minHeight: 140, marginBottom: 18, lineHeight: 1.7 }} />

        {/* Mood Tags */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🏷️ Add Tags</p>
          <MoodTagSelector selected={selectedTags} onChange={setSelectedTags} allTags={MOOD_TAGS} />
        </div>

        {/* Mood slider */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Mood</span>
            <span style={{ fontSize: 22 }}>{mood.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: mood.color }}>{mood.label}</span>
          </div>
          <input type="range" min="1" max="5" step="1" value={selectedMood} onChange={e => setSelectedMood(Number(e.target.value))} className="mood-slider" style={{ '--thumb': mood.color }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {Object.entries(moodMap).map(([k, m]) => <span key={k} style={{ fontSize: 20, cursor: 'pointer', opacity: Number(k) === selectedMood ? 1 : 0.3, transition: 'opacity .2s' }} onClick={() => setSelectedMood(Number(k))}>{m.emoji}</span>)}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading || !journalText.trim()} style={{ width: '100%', padding: '13px 22px', fontSize: 15 }}>
          {isLoading ? <><Spin size={16} /> Analyzing...</> : <><Ico icon={Icons.sparkle} size={15} /> Save & Get Guidance</>}
        </button>
      </div>

      {aiResponse.reflection && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="page-enter">
          <div className="glass" style={{ padding: 22, borderColor: 'rgba(129,140,248,.3)', background: 'rgba(129,140,248,.08)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>🌙</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aura's Reflection</p>
                  {aiResponse.sentiment && <SentimentBadge sentiment={aiResponse.sentiment} />}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7 }}>{aiResponse.reflection}</p>
              </div>
            </div>
          </div>
          {aiResponse.actionableSteps?.length > 0 && (
            <div className="glass" style={{ padding: 22, borderColor: 'rgba(74,222,128,.3)', background: 'rgba(74,222,128,.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>✨ Gentle Next Steps</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiResponse.actionableSteps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, background: 'rgba(74,222,128,.2)', border: '1px solid rgba(74,222,128,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#4ade80', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ fontSize: 14, lineHeight: 1.6 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {aiResponse.moodBoard && (
            <div className="glass" style={{ padding: 22, borderColor: 'rgba(192,132,252,.3)', background: 'rgba(192,132,252,.07)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#c084fc', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🎨 Your Mood Board</p>
              <div style={{ borderRadius: 14, overflow: 'hidden', background: aiResponse.moodBoard.gradient, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 48 }}>{aiResponse.moodBoard.emoji}</div>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.5)' }}>{aiResponse.moodBoard.title}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', maxWidth: 300, lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>{aiResponse.moodBoard.affirmation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Chat View ────────────────────────────────────────────────────────────────
const ChatView = () => {
  const [messages, setMessages] = useState([{ role: 'aura', text: "Hi, I'm Aura 🌙 I'm here to listen and support you. How are you feeling right now?" }]);
  const [input, setInput] = useState(''); const [isTyping, setIsTyping] = useState(false); const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  const onVoiceResult = useCallback(text => setInput(text), []);
  const { recording, supported, toggle, voiceError } = useVoiceHook(onVoiceResult);
  const send = async () => {
    if (!input.trim() || isTyping) return;
    const msg = input.trim(); setInput('');
    setMessages(p => [...p, { role: 'user', text: msg }]); setIsTyping(true);
    try {
      const hist = messages.map(m => `${m.role === 'user' ? 'User' : 'Aura'}: ${m.text}`).join('\n');
      const r = await callAI(msg, `You are Aura, a compassionate mental wellness companion. Warm, concise (2-4 sentences). Listen, validate, gently suggest coping. Never diagnose. History:\n${hist}`);
      setMessages(p => [...p, { role: 'aura', text: r }]);
    } catch { setMessages(p => [...p, { role: 'aura', text: "I'm sorry, I couldn't respond. Please try again." }]); }
    setIsTyping(false);
  };
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }} className="page-enter">
      <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌙</div>
          <div><p style={{ fontWeight: 700, fontSize: 15 }}>Aura</p><p style={{ fontSize: 12, color: '#4ade80' }}>● Online</p></div>
        </div>
        <div className="chat-scroll" style={{ flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}><div className={m.role === 'user' ? 'bubble-user' : 'bubble-aura'}><p style={{ fontSize: 14, lineHeight: 1.65 }}>{m.text}</p></div></div>)}
          {isTyping && <div style={{ display: 'flex' }}><div className="bubble-aura" style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 16px' }}>{[1, 2, 3].map(i => <div key={i} className={`td${i}`} style={{ width: 7, height: 7, background: 'var(--muted)', borderRadius: '50%' }} />)}</div></div>}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: '16px 22px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          {supported && <button className={`btn btn-sm ${recording ? 'btn-primary' : 'btn-ghost'}`} onClick={toggle} style={{ padding: '11px 12px', flexShrink: 0 }}><Ico icon={Icons.mic} size={16} /></button>}
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Talk to Aura... (Enter to send)" style={{ flex: 1, minHeight: 44, maxHeight: 120 }} />
          <button className="btn btn-primary" onClick={send} disabled={!input.trim() || isTyping} style={{ padding: '11px 16px', flexShrink: 0 }}><Ico icon={Icons.send} size={16} /></button>
        </div>
      </div>
    </div>
  );
};

// ─── Analytics View ───────────────────────────────────────────────────────────
const AnalyticsView = ({ history }) => {
  const avg = history.length ? (history.reduce((s, e) => s + e.mood, 0) / history.length).toFixed(1) : 0;
  const dist = [5, 4, 3, 2, 1].map(m => ({ mood: m, count: history.filter(e => e.mood === m).length, ...moodMap[m] }));
  const maxD = Math.max(...dist.map(d => d.count), 1);
  const days7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const entries = history.filter(e => new Date(e.timestamp).toDateString() === d.toDateString()); const a = entries.length ? entries.reduce((s, e) => s + e.mood, 0) / entries.length : null; return { day: d.toLocaleDateString('en', { weekday: 'short' }), avg: a }; });
  const streak = calcStreak(history);
  const sentDist = Object.keys(SENTIMENT_LABELS).map(s => ({ key: s, count: history.filter(e => e.sentiment === s).length, ...SENTIMENT_LABELS[s] })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
  if (!history.length) return (<div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 60 }} className="page-enter"><div style={{ fontSize: 48, marginBottom: 16 }}>📊</div><p style={{ color: 'var(--muted)' }}>Write your first entry to see analytics!</p></div>);
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }} className="page-enter">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[{ label: 'Entries', value: history.length, emoji: '📝' }, { label: 'Avg Mood', value: `${avg}/5`, emoji: moodMap[Math.round(avg) || 3].emoji }, { label: 'Day Streak', value: streak, emoji: '🔥' }].map(s => (
          <div key={s.label} className="glass" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="glass" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last 7 Days</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, justifyContent: 'space-around' }}>
          {days7.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              {d.avg !== null ? <div style={{ width: '100%', maxWidth: 40, height: `${(d.avg / 5) * 110}px`, background: `linear-gradient(to top,${moodMap[Math.round(d.avg)].color}cc,${moodMap[Math.round(d.avg)].color}44)`, borderRadius: '8px 8px 4px 4px', border: `1px solid ${moodMap[Math.round(d.avg)].border}`, position: 'relative', transition: 'height .6s ease' }}><span style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: moodMap[Math.round(d.avg)].color, fontWeight: 600, whiteSpace: 'nowrap' }}>{d.avg.toFixed(1)}</span></div> : <div style={{ width: '100%', maxWidth: 40, height: 4, background: 'var(--glass-border)', borderRadius: 2 }} />}
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass" style={{ padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mood Distribution</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dist.map(d => (<div key={d.mood} style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 18, width: 24, flexShrink: 0 }}>{d.emoji}</span><span style={{ fontSize: 13, color: 'var(--muted)', width: 44, flexShrink: 0 }}>{d.label}</span><div style={{ flex: 1, height: 10, background: 'var(--glass-border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${(d.count / maxD) * 100}%`, background: `linear-gradient(to right,${d.color}aa,${d.color})`, borderRadius: 99, transition: 'width .8s ease' }} /></div><span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'JetBrains Mono,monospace', color: d.color, width: 20, flexShrink: 0 }}>{d.count}</span></div>))}
        </div>
      </div>
      {sentDist.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔍 Emotional Tones</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {sentDist.map(s => (<div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${s.color}15`, border: `1px solid ${s.color}40`, borderRadius: 12, padding: '10px 16px' }}><span style={{ fontSize: 20 }}>{s.emoji}</span><div><p style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.label}</p><p style={{ fontSize: 11, color: 'var(--muted)' }}>{s.count} {s.count === 1 ? 'entry' : 'entries'}</p></div></div>))}
          </div>
        </div>
      )}
      <MoodCalendar history={history} />
    </div>
  );
};

// ─── History View (with search + filter) ─────────────────────────────────────
const HistoryView = ({ history, handleGenerateSummary, isGeneratingSummary, weeklySummary, onEmailReport, onExported }) => {
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState(0);
  const [filterTag, setFilterTag] = useState('');

  const filtered = history.filter(e => {
    const matchSearch = !search || e.text.toLowerCase().includes(search.toLowerCase()) || (e.aiReflection || '').toLowerCase().includes(search.toLowerCase());
    const matchMood = !filterMood || e.mood === filterMood;
    const matchTag = !filterTag || (e.tags || []).includes(filterTag);
    return matchSearch && matchMood && matchTag;
  });

  const exportCSV = () => { const h = 'Date,Mood,Label,Sentiment,Tags,Entry,AI Reflection\n'; const rows = history.map(e => `"${new Date(e.timestamp).toLocaleString()}",${e.mood},"${moodMap[e.mood]?.label || ''}","${e.sentiment || ''}","${(e.tags || []).join('; ')}","${(e.text || '').replace(/"/g, '""')}","${(e.aiReflection || '').replace(/"/g, '""')}"`).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([h + rows], { type: 'text/csv' })); a.download = 'moodmate.csv'; a.click(); onExported(); };
  const exportJSON = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })); a.download = 'moodmate.json'; a.click(); onExported(); };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }} className="page-enter">
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-primary btn-sm" onClick={handleGenerateSummary} disabled={isGeneratingSummary || history.length < 2}>{isGeneratingSummary ? <><Spin size={14} /> Analyzing...</> : <><Ico icon={Icons.sparkle} size={13} /> Summarize Week</>}</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV} disabled={!history.length}><Ico icon={Icons.download} size={14} /> CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={exportJSON} disabled={!history.length}><Ico icon={Icons.download} size={14} /> JSON</button>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, display: 'flex', color: 'var(--muted)' }}>{Icons.search}</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." style={{ paddingLeft: 38 }} />
        </div>
        <select value={filterMood} onChange={e => setFilterMood(Number(e.target.value))} style={{ width: 130 }}>
          <option value={0}>All Moods</option>
          {Object.entries(moodMap).map(([k, m]) => <option key={k} value={k}>{m.emoji} {m.label}</option>)}
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
        Showing {filtered.length} of {history.length} entries
        {(search || filterMood) && <button onClick={() => { setSearch(''); setFilterMood(0); setFilterTag(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, marginLeft: 8 }}>Clear filters ×</button>}
      </p>

      {weeklySummary && !isGeneratingSummary && <div className="glass" style={{ padding: 22, borderColor: 'rgba(192,132,252,.3)', background: 'rgba(192,132,252,.07)' }}><p style={{ fontSize: 12, fontWeight: 600, color: '#c084fc', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📋 Weekly Summary</p><p style={{ fontSize: 14, lineHeight: 1.7 }}>{weeklySummary}</p></div>}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{search || filterMood ? '🔍' : '📓'}</div>
          <p>{search || filterMood ? 'No entries match your search.' : 'No entries yet. Start journaling!'}</p>
        </div>
      ) : filtered.map(entry => {
        const m = moodMap[entry.mood] || moodMap[3];
        return (
          <div key={entry.id} className="glass" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(entry.timestamp).toLocaleString()}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {entry.sentiment && <SentimentBadge sentiment={entry.sentiment} />}
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: m.bg, border: `1px solid ${m.border}`, borderRadius: 99, padding: '4px 12px', fontSize: 13, color: m.color, fontWeight: 600 }}>{m.emoji} {m.label}</span>
              </div>
            </div>
            {entry.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {entry.tags.map(t => <span key={t} style={{ fontSize: 11, background: 'rgba(129,140,248,.1)', border: '1px solid rgba(129,140,248,.25)', borderRadius: 99, padding: '2px 8px', color: 'var(--accent)' }}>{t}</span>)}
              </div>
            )}
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: entry.aiReflection ? 14 : 0 }}>{entry.text}</p>
            {entry.aiReflection && <div style={{ background: 'rgba(129,140,248,.07)', border: '1px solid rgba(129,140,248,.2)', borderRadius: 12, padding: '12px 16px' }}><p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>🌙 Aura's Reflection</p><p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{entry.aiReflection}</p></div>}
          </div>
        );
      })}
    </div>
  );
};

// ─── Relief View ──────────────────────────────────────────────────────────────
const BoxPlayer = ({ onBack }) => {
  const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
  const [phase, setPhase] = useState(0); const [time, setTime] = useState(4); const [active, setActive] = useState(false); const ref = useRef();
  useEffect(() => { if (active) { ref.current = setInterval(() => setTime(t => { if (t <= 1) { setPhase(p => (p + 1) % 4); return 4; } return t - 1; }), 1000); } else clearInterval(ref.current); return () => clearInterval(ref.current); }, [active]);
  const cols = ['#818cf8', '#c084fc', '#2dd4bf', '#c084fc'];
  return (<div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }} className="page-enter"><button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 20, fontSize: 13 }}><Ico icon={Icons.back} size={14} /> Back</button><div className="glass" style={{ padding: 40 }}><h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}>Box Breathing</h2><div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className={`anim-b${phase}`} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle,${cols[phase]}33,${cols[phase]}11)`, border: `2px solid ${cols[phase]}66` }} /><div style={{ position: 'relative', zIndex: 1 }}><p style={{ fontSize: 16, fontWeight: 600, color: cols[phase] }}>{phases[phase]}</p><p style={{ fontSize: 52, fontWeight: 700, fontFamily: 'JetBrains Mono,monospace' }}>{time}</p></div></div><div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}><button className="btn btn-primary" onClick={() => setActive(a => !a)} style={{ minWidth: 110 }}>{active ? 'Pause' : 'Start'}</button><button className="btn btn-ghost" onClick={() => { setActive(false); setPhase(0); setTime(4); }}>Reset</button></div></div></div>);
};

const StepsView = ({ title, steps, onBack }) => (<div style={{ maxWidth: 560, margin: '0 auto' }} className="page-enter"><button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 20, fontSize: 13 }}><Ico icon={Icons.back} size={14} /> Back</button><div className="glass" style={{ padding: 32 }}><h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>{title}</h2><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{steps.map((s, i) => (<div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '14px 16px' }}><span style={{ width: 24, height: 24, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span><p style={{ fontSize: 14, lineHeight: 1.65 }}>{typeof s === 'object' ? <><strong style={{ color: 'var(--accent)' }}>{s.t}:</strong> {s.d}</> : s}</p></div>))}</div></div></div>);

const AnxietyReliefView = () => {
  const [active, setActive] = useState(null);
  const exs = [{ id: 'box', title: 'Box Breathing', emoji: '🫁', desc: 'Calm your nervous system.' }, { id: 'g', title: '5-4-3-2-1 Grounding', emoji: '🌿', desc: 'Anchor to the present.' }, { id: 'pmr', title: 'Progressive Muscle Relaxation', emoji: '💪', desc: 'Release physical tension.' }, { id: 'm', title: 'Mindful Observation', emoji: '👁️', desc: 'Focus on a single object.' }];
  const gS = [{ t: '5 Things You See', d: 'Name five visible things.' }, { t: '4 Things You Touch', d: 'Feel four surfaces.' }, { t: '3 Things You Hear', d: 'Listen for three sounds.' }, { t: '2 Things You Smell', d: 'Notice two smells.' }, { t: '1 Thing You Taste', d: 'Focus on one taste.' }];
  const pmrS = ['Find a comfortable position and close your eyes.', 'Deep breaths — in through nose, out through mouth.', 'Hands: clench (5s), release (10s).', 'Arms: tense biceps (5s), relax (10s).', 'Continue: forehead, jaw, shoulders, stomach, legs, feet.', 'Breathe between each group.', 'End with 3 deep breaths.'];
  const mS = ['Choose any small object — pen, coin, or leaf.', 'Hold it — notice weight, texture, temperature.', 'Observe visually — colors, edges, shadows.', 'Tap it. Any sound? Any scent?', 'Spend 2–3 minutes fully present with it.'];
  if (active === 'box') return <BoxPlayer onBack={() => setActive(null)} />;
  if (active === 'g') return <StepsView title="5-4-3-2-1 Grounding" steps={gS} onBack={() => setActive(null)} />;
  if (active === 'pmr') return <StepsView title="Progressive Muscle Relaxation" steps={pmrS} onBack={() => setActive(null)} />;
  if (active === 'm') return <StepsView title="Mindful Observation" steps={mS} onBack={() => setActive(null)} />;
  return (<div style={{ maxWidth: 640, margin: '0 auto' }} className="page-enter"><div style={{ textAlign: 'center', marginBottom: 20 }}><h2 style={{ fontSize: 24, fontWeight: 700 }}>Relief Exercises</h2><p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Guided techniques to find calm</p></div><AmbientPlayer /><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{exs.map(ex => <div key={ex.id} className="glass" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer' }} onClick={() => setActive(ex.id)}><span style={{ fontSize: 32, flexShrink: 0 }}>{ex.emoji}</span><div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 16 }}>{ex.title}</p><p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{ex.desc}</p></div><span style={{ color: 'var(--accent)', fontSize: 22 }}>›</span></div>)}</div></div>);
};

// ─── Achievements View ────────────────────────────────────────────────────────
const AchievementsView = ({ history, flags }) => {
  const streak = calcStreak(history);
  return (<div style={{ maxWidth: 680, margin: '0 auto' }} className="page-enter"><div style={{ textAlign: 'center', marginBottom: 28 }}><h2 style={{ fontSize: 24, fontWeight: 700 }}>🏆 Achievements</h2><p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Keep journaling to unlock more!</p></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>{ACHIEVEMENTS.map((a, i) => { const unlocked = a.check(history, streak, flags); return (<div key={a.id} className="glass badge-pop" style={{ padding: 22, textAlign: 'center', opacity: unlocked ? 1 : 0.4, border: unlocked ? '1px solid rgba(129,140,248,.4)' : '1px solid var(--glass-border)', animationDelay: `${i * .07}s` }}><div style={{ fontSize: 36, marginBottom: 10, filter: unlocked ? 'none' : 'grayscale(1)' }}>{a.emoji}</div><p style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</p><p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{a.desc}</p>{unlocked && <div style={{ marginTop: 10, fontSize: 11, color: '#4ade80', fontWeight: 600 }}>✓ Unlocked</div>}</div>); })}</div></div>);
};

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [appScreen, setAppScreen] = useState('loading'); // loading | landing | auth | onboarding | app
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('mm-theme') || 'dark');
  const [pwaReady, setPwaReady] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // PWA install prompt
  useEffect(() => {
    const onReady = () => setPwaReady(true);
    const onInstalled = () => { setPwaInstalled(true); setPwaReady(false); };
    window.addEventListener('pwaInstallReady', onReady);
    window.addEventListener('pwaInstalled', onInstalled);
    if (window.__pwaInstallPrompt) setPwaReady(true);
    return () => {
      window.removeEventListener('pwaInstallReady', onReady);
      window.removeEventListener('pwaInstalled', onInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!window.__pwaInstallPrompt) return;
    window.__pwaInstallPrompt.prompt();
    const { outcome } = await window.__pwaInstallPrompt.userChoice;
    if (outcome === 'accepted') { setPwaInstalled(true); setPwaReady(false); }
    window.__pwaInstallPrompt = null;
  };
  const [view, setView] = useState('dashboard');
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState(3);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState({ reflection: '', actionableSteps: [], sentiment: null, moodBoard: null });
  const [isGenSummary, setIsGenSummary] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState('');
  const [isFetchingPrompt, setIsFetchingPrompt] = useState(false);
  const [voiceLang, setVoiceLang] = useState('hi-IN');
  const [menuOpen, setMenuOpen] = useState(false);
  const [flags, setFlags] = useState({ voiceUsed: false, exported: false });
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const prevAch = useRef(new Set());

  useEffect(() => { localStorage.setItem('mm-theme', theme); }, [theme]);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setAppScreen('landing');
      else checkOnboarding(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (!session) setAppScreen('landing');
      else checkOnboarding(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkOnboarding = (session) => {
    const done = localStorage.getItem(`mm-onboarded-${session.user.id}`);
    setAppScreen(done ? 'app' : 'onboarding');
  };

  // Load history
  useEffect(() => {
    if (!session) { setHistory([]); return; }
    setHistoryLoading(true);
    supabase.from('journal_entries').select('*').order('timestamp', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setHistory(data.map(e => ({ id: e.id, text: e.text, mood: e.mood, sentiment: e.sentiment, tags: e.tags || [], aiReflection: e.ai_reflection, aiActionableSteps: e.ai_steps || [], timestamp: e.timestamp })));
        setHistoryLoading(false);
      });
    try { const f = localStorage.getItem(`mm-flags-${session.user.id}`); if (f) setFlags(JSON.parse(f)); } catch {}
    try { const p = localStorage.getItem(`mm-ach-${session.user.id}`); if (p) prevAch.current = new Set(JSON.parse(p)); } catch {}
  }, [session]);

  const saveFlags = (f) => { setFlags(f); if (session) localStorage.setItem(`mm-flags-${session.user.id}`, JSON.stringify(f)); };

  // Achievement checker
  useEffect(() => {
    if (!history.length) return;
    const streak = calcStreak(history);
    for (const a of ACHIEVEMENTS) {
      if (!prevAch.current.has(a.id) && a.check(history, streak, flags)) {
        prevAch.current.add(a.id);
        if (session) localStorage.setItem(`mm-ach-${session.user.id}`, JSON.stringify([...prevAch.current]));
        setUnlockedBadge(a);
        if (a.id === 'week' || a.id === 'thirty') { setConfetti(true); setTimeout(() => setConfetti(false), 4000); }
        break;
      }
    }
  }, [history, flags, session]);

  const getAiGuidance = async (text) => {
    const sys = `You are 'Aura', a compassionate mental wellness guide. Respond ONLY with valid JSON (no markdown) with: "reflection" (2-sentence empathetic validation), "actionableSteps" (array 2-3 gentle suggestions), "sentiment" (one of: anxious,sad,angry,happy,stressed,grateful,neutral), "moodBoard" (object with "gradient" CSS string, "emoji" 2-3 emojis, "title" 3-5 word poetic title, "affirmation" one uplifting sentence). No medical advice.`;
    try { const raw = await callAI(`Journal entry: "${text}"`, sys); return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
    catch { return { reflection: 'Thank you for sharing.', actionableSteps: ['Take three deep breaths.'], sentiment: 'neutral', moodBoard: null }; }
  };

  const handleSubmit = async () => {
    if (!journalText.trim() || !session) return;
    setIsLoading(true); setError(''); setAiResponse({ reflection: '', actionableSteps: [], sentiment: null, moodBoard: null });
    try {
      const guidance = await getAiGuidance(journalText);
      const { data, error: dbErr } = await supabase.from('journal_entries').insert({
        user_id: session.user.id, text: journalText, mood: selectedMood,
        sentiment: guidance.sentiment, ai_reflection: guidance.reflection,
        ai_steps: guidance.actionableSteps, tags: selectedTags,
      }).select().single();
      if (dbErr) throw dbErr;
      const entry = { id: data.id, text: data.text, mood: data.mood, sentiment: data.sentiment, tags: data.tags || [], aiReflection: data.ai_reflection, aiActionableSteps: data.ai_steps || [], timestamp: data.timestamp };
      setHistory(prev => [entry, ...prev]);
      setAiResponse(guidance);
      setJournalText(''); setSelectedMood(3); setSelectedTags([]);
    } catch (e) { setError('Could not save: ' + e.message); }
    setIsLoading(false);
  };

  const handleGenerateSummary = async () => {
    const week = new Date(); week.setDate(week.getDate() - 7);
    const recent = history.filter(e => new Date(e.timestamp) > week);
    if (recent.length < 2) { setError('Need at least 2 entries this week.'); return; }
    setIsGenSummary(true); setWeeklySummary(''); setError('');
    const text = recent.map(e => `${new Date(e.timestamp).toLocaleDateString()}: ${moodMap[e.mood]?.label} — "${e.text}"`).join('\n');
    try { const s = await callAI(text, 'You are Aura. Summarize in 3-4 warm sentences. Note patterns, highlight positives. Not a diagnosis.'); setWeeklySummary(s); }
    catch { setError("Couldn't generate summary."); }
    setIsGenSummary(false);
  };

  const getJournalPrompt = async () => {
    setIsFetchingPrompt(true); setError('');
    try { const p = await callAI('Give me a journal prompt.', 'You are Aura. One short open-ended self-reflection prompt. Single sentence, no extra text.'); setJournalText(p.trim()); }
    catch { setError("Couldn't get a prompt."); }
    setIsFetchingPrompt(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setHistory([]); setAppScreen('landing'); };

  const handleNavigate = (viewId, opts = {}) => {
    setView(viewId);
    if (opts.prefill) { setJournalText(opts.prefill); }
  };

  // Nav links
  const navLinks = [
    { id: 'dashboard',   label: 'Home',       icon: Icons.home },
    { id: 'journal',     label: 'Journal',    icon: Icons.journal },
    { id: 'chat',        label: 'Chat',       icon: Icons.chat },
    { id: 'predict',     label: 'Predict',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> },
    { id: 'community',   label: 'Community',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'plan',        label: 'Plan',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="16" x2="9" y2="16" strokeWidth="3"/><line x1="15" y1="16" x2="15" y2="16" strokeWidth="3"/></svg> },
    { id: 'analytics',   label: 'Analytics',  icon: Icons.chart },
    { id: 'history',     label: 'History',    icon: Icons.history },
    { id: 'relief',      label: 'Relief',     icon: Icons.relief },
    { id: 'achievements',label: 'Badges',     icon: Icons.trophy },
    { id: 'profile',     label: 'Profile',    icon: Icons.user },
    { id: 'pricing',     label: 'Pricing',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { id: 'doctor',      label: 'Doctor',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  ];

  const renderView = () => {
    switch (view) {
      case 'dashboard':    return <DashboardView history={history} onNavigate={handleNavigate} session={session} />;
      case 'journal':      return <JournalView journalText={journalText} setJournalText={setJournalText} selectedMood={selectedMood} setSelectedMood={setSelectedMood} selectedTags={selectedTags} setSelectedTags={setSelectedTags} handleSubmit={handleSubmit} isLoading={isLoading} aiResponse={aiResponse} getJournalPrompt={getJournalPrompt} isFetchingPrompt={isFetchingPrompt} onVoiceUsed={() => saveFlags({ ...flags, voiceUsed: true })} voiceLang={voiceLang} setVoiceLang={setVoiceLang} />;
      case 'chat':         return <ChatView />;
      case 'analytics':    return <AnalyticsView history={history} />;
      case 'history':      return <HistoryView history={history} handleGenerateSummary={handleGenerateSummary} isGeneratingSummary={isGenSummary} weeklySummary={weeklySummary} onEmailReport={() => {}} onExported={() => saveFlags({ ...flags, exported: true })} />;
      case 'relief':       return <AnxietyReliefView />;
      case 'achievements': return <AchievementsView history={history} flags={flags} />;
      case 'profile':      return <ProfileView session={session} history={history} onLogout={handleLogout} />;
      case 'predict':      return <MoodPredictionView history={history} />;
      case 'community':    return <CommunityView session={session} history={history} />;
      case 'plan':         return <WeeklyPlanView session={session} history={history} />;
      case 'pricing':      return <PricingView session={session} />;
      case 'doctor':       return <DoctorConnectView onNavigate={handleNavigate} />;
      default:             return null;
    }
  };

  // ── Screen routing ──
  if (appScreen === 'loading') return (
    <>
      <GlobalStyles theme={theme} />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 52 }}>🌙</div><Spin size={32} /><p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading MoodMate...</p>
      </div>
    </>
  );

  if (appScreen === 'landing') return (
    <>
      <GlobalStyles theme={theme} />
      <LandingPage onGetStarted={() => setAppScreen('auth')} theme={theme} setTheme={setTheme} />
    </>
  );

  if (appScreen === 'auth') return (
    <>
      <GlobalStyles theme={theme} />
      <AuthScreen onBack={() => setAppScreen('landing')} />
    </>
  );

  if (appScreen === 'onboarding') return (
    <>
      <GlobalStyles theme={theme} />
      <OnboardingPage
        onComplete={(answers) => {
          localStorage.setItem(`mm-onboarded-${session.user.id}`, '1');
          localStorage.setItem(`mm-onboarding-${session.user.id}`, JSON.stringify(answers));
          setAppScreen('app');
        }}
        userName={session?.user?.user_metadata?.full_name || ''}
      />
    </>
  );

  // ── Main App ──
  return (
    <>
      <GlobalStyles theme={theme} />
      <Confetti active={confetti} />
      <div style={{ minHeight: '100vh', display: 'flex' }}>

        {/* ── Left Sidebar (desktop) ── */}
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
          width: 220, display: 'flex', flexDirection: 'column',
          background: 'var(--nav-bg)', backdropFilter: 'blur(24px)',
          borderRight: '1px solid var(--glass-border)',
          padding: '20px 12px',
          overflowY: 'auto',
        }} className="desktop-nav">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 8px 20px', borderBottom: '1px solid var(--glass-border)', marginBottom: 12 }}
            onClick={() => setView('dashboard')}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🌙</div>
            <span style={{ fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MoodMate</span>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {navLinks.map(link => (
              <button key={link.id} onClick={() => setView(link.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontFamily: 'Sora,sans-serif',
                  fontWeight: view === link.id ? 600 : 400,
                  background: view === link.id ? 'rgba(129,140,248,.15)' : 'transparent',
                  color: view === link.id ? '#818cf8' : 'var(--muted)',
                  transition: 'all .2s', textAlign: 'left', width: '100%',
                }}>
                <span style={{ width: 18, height: 18, display: 'inline-flex', flexShrink: 0 }}>{link.icon}</span>
                {link.label}
                {view === link.id && <span style={{ marginLeft: 'auto', width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />}
              </button>
            ))}
          </nav>

          {/* Bottom actions */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {pwaReady && !pwaInstalled && (
              <button className="btn btn-primary btn-sm" onClick={handleInstallPWA} style={{ gap: 6, fontSize: 12, width: '100%' }}>
                📲 Install App
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>👤</div>
              <span style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{session?.user?.email?.split('@')[0]}</span>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 4 }} title="Logout">
                <span style={{ width: 15, height: 15, display: 'inline-flex' }}>{Icons.logout}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── Mobile top bar ── */}
        <div style={{ display: 'none' }} className="mob-topbar">
          <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--nav-bg)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--glass-border)', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setView('dashboard')}>
              <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🌙</div>
              <span style={{ fontSize: 15, fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MoodMate</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <button className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(o => !o)} style={{ padding: '8px 10px' }}>
                <span style={{ width: 20, height: 20, display: 'inline-flex' }}>{menuOpen ? Icons.close : Icons.menu}</span>
              </button>
            </div>
          </header>
        </div>

        {/* Fake nav placeholder for desktop - keeps layout */}
        <div style={{ width: 220, flexShrink: 0 }} className="desktop-nav" />

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 45, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, paddingTop: 80 }}>
            {navLinks.map(link => (
              <button key={link.id} onClick={() => { setView(link.id); setMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 14, border: '1px solid', borderColor: view === link.id ? 'rgba(129,140,248,.4)' : 'var(--glass-border)', background: view === link.id ? 'rgba(129,140,248,.12)' : 'var(--glass)', color: view === link.id ? '#818cf8' : 'var(--text)', fontSize: 15, fontWeight: 600, fontFamily: 'Sora,sans-serif', cursor: 'pointer', width: '100%', maxWidth: 260 }}>
                <span style={{ width: 20, height: 20, display: 'inline-flex' }}>{link.icon}</span>{link.label}
              </button>
            ))}
            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 14, border: '1px solid rgba(248,113,113,.3)', background: 'rgba(248,113,113,.08)', color: '#f87171', fontSize: 15, fontWeight: 600, fontFamily: 'Sora,sans-serif', cursor: 'pointer', width: '100%', maxWidth: 260, marginTop: 8 }}>
              <span style={{ width: 20, height: 20, display: 'inline-flex' }}>{Icons.logout}</span>Sign Out
            </button>
          </div>
        )}

        {error && <div onClick={() => setError('')} style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(248,113,113,.15)', border: '1px solid rgba(248,113,113,.4)', borderRadius: 12, padding: '12px 20px', fontSize: 14, color: '#fca5a5', zIndex: 100, cursor: 'pointer', backdropFilter: 'blur(12px)', whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center' }}>⚠️ {error}</div>}
        {unlockedBadge && <AchievementToast achievement={unlockedBadge} onDone={() => setUnlockedBadge(null)} />}

        {/* ── Main content ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'auto' }}>
        <main style={{ flex: 1, padding: '28px 28px 40px', maxWidth: 960, width: '100%', margin: '0 auto' }} className="main-content">
          {historyLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12, flexDirection: 'column' }}>
              <Spin size={32} /><p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your journal...</p>
            </div>
          ) : (
            <div key={view}>{renderView()}</div>
          )}
        </main>

        {/* PWA Install Banner */}
        {pwaReady && !pwaInstalled && (
          <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'linear-gradient(135deg,rgba(129,140,248,0.95),rgba(192,132,252,0.95))', backdropFilter:'blur(16px)', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }} className="hide-desktop">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:28 }}>📲</span>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'white' }}>Install MoodMate</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>Add to home screen for best experience</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <button onClick={() => setPwaReady(false)} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:99, padding:'7px 14px', color:'white', fontSize:12, cursor:'pointer', fontFamily:'Sora,sans-serif' }}>Later</button>
              <button onClick={handleInstallPWA} style={{ background:'white', border:'none', borderRadius:99, padding:'7px 16px', color:'#818cf8', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'Sora,sans-serif' }}>Install ✓</button>
            </div>
          </div>
        )}

        <footer style={{ textAlign: 'center', padding: '20px 24px', borderTop: '1px solid var(--glass-border)', color: 'var(--muted)', fontSize: 12 }}>
          <p>Not a substitute for professional medical advice · Data secured with Supabase</p>
          <p style={{ marginTop: 4, opacity: .6 }}>Made with ❤️ by Aryan Jaiswal & Alok Jha</p>
        </footer>
      </div>
    </>
  );
}

export default App;