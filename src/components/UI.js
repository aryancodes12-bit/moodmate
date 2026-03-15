import React, { useState, useEffect } from 'react';
import { moodMap, SENTIMENT_LABELS } from '../constants';

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spin = ({ size = 20 }) => (
  <div style={{ width:size, height:size, border:'2px solid rgba(129,140,248,.2)', borderTop:'2px solid #818cf8', borderRadius:'50%', animation:'spin .8s linear infinite', flexShrink:0 }} />
);

// ─── Icon wrapper ─────────────────────────────────────────────────────────────
export const Ico = ({ icon, size = 18 }) => (
  <span style={{ width:size, height:size, display:'inline-flex', flexShrink:0 }}>{icon}</span>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
export const Icons = {
  journal:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  chat:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  chart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  history:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  relief:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  trophy:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17 12 22 9.5 17"/><path d="M6.5 6H17.5"/><path d="M6 6c0 5.523 2.686 10 6 10s6-4.477 6-10"/><path d="M3 6h3M18 6h3"/></svg>,
  send:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  mic:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  email:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  sparkle:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z"/></svg>,
  menu:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  back:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  home:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  user:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  sun:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon:     <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  search:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  google:   <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  tag:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
};

// ─── Global Styles ────────────────────────────────────────────────────────────
export const GlobalStyles = ({ theme }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

    :root {
      --glass: rgba(255,255,255,0.07);
      --glass-border: rgba(255,255,255,0.15);
      --glass-hover: rgba(255,255,255,0.12);
      --accent: #818cf8;
      --accent2: #c084fc;
      --r: 20px;
      ${theme === 'dark' ? `
        --bg: #0d0f1a;
        --bg2: #111827;
        --text: #e2e8f0;
        --muted: #94a3b8;
        --card: rgba(255,255,255,0.07);
        --border: rgba(255,255,255,0.12);
        --input-bg: rgba(255,255,255,0.05);
        --nav-bg: rgba(13,15,26,0.85);
        --shadow: rgba(0,0,0,0.4);
      ` : `
        --bg: #f0f4ff;
        --bg2: #e8eeff;
        --text: #1e293b;
        --muted: #64748b;
        --card: rgba(255,255,255,0.85);
        --border: rgba(0,0,0,0.1);
        --input-bg: rgba(255,255,255,0.9);
        --nav-bg: rgba(240,244,255,0.92);
        --shadow: rgba(0,0,0,0.08);
        --glass: rgba(255,255,255,0.75);
        --glass-border: rgba(129,140,248,0.2);
        --glass-hover: rgba(255,255,255,0.9);
      `}
    }

    body{font-family:'Sora',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;transition:background .3s,color .3s}

    ${theme === 'dark' ? `
      body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 10%,rgba(129,140,248,0.12) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 80%,rgba(192,132,252,0.10) 0%,transparent 60%);pointer-events:none;z-index:0}
    ` : `
      body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 10%,rgba(129,140,248,0.06) 0%,transparent 60%),radial-gradient(ellipse 60% 50% at 80% 80%,rgba(192,132,252,0.05) 0%,transparent 60%);pointer-events:none;z-index:0}
    `}

    #root{position:relative;z-index:1}

    .glass{background:var(--glass);border:1px solid var(--glass-border);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:var(--r);box-shadow:0 4px 24px var(--shadow)}
    .glass:hover{background:var(--glass-hover)}

    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(129,140,248,0.3);border-radius:3px}

    textarea,input[type="text"],input[type="email"],input[type="password"],select{
      font-family:'Sora',sans-serif;background:var(--input-bg);border:1px solid var(--border);
      border-radius:14px;color:var(--text);transition:border-color .2s,box-shadow .2s;
      outline:none;resize:none;width:100%;padding:12px 16px;font-size:14px
    }
    textarea:focus,input:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(129,140,248,0.15)}
    textarea::placeholder,input::placeholder{color:var(--muted)}
    select option{background:var(--bg2);color:var(--text)}

    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 22px;border-radius:50px;font-family:'Sora',sans-serif;font-weight:600;font-size:14px;cursor:pointer;border:none;transition:all .2s ease}
    .btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important}
    .btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;box-shadow:0 4px 20px rgba(129,140,248,0.3)}
    .btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(129,140,248,0.5)}
    .btn-ghost{background:var(--glass);color:var(--muted);border:1px solid var(--glass-border)}
    .btn-ghost:hover:not(:disabled){color:var(--text);background:var(--glass-hover)}
    .btn-danger{background:rgba(248,113,113,0.12);color:#f87171;border:1px solid rgba(248,113,113,0.3)}
    .btn-danger:hover:not(:disabled){background:rgba(248,113,113,0.22)}
    .btn-sm{padding:7px 14px;font-size:12px}
    .btn-lg{padding:14px 32px;font-size:16px}

    .mood-slider{-webkit-appearance:none;appearance:none;width:100%;height:8px;border-radius:99px;background:linear-gradient(to right,#f87171,#fb923c,#facc15,#4ade80,#2dd4bf);outline:none}
    .mood-slider::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:var(--thumb,white);cursor:pointer;border:3px solid white;box-shadow:0 0 0 2px var(--thumb,#818cf8),0 4px 12px rgba(0,0,0,.3);transition:all .2s}
    .mood-slider::-webkit-slider-thumb:hover{transform:scale(1.2)}

    .bubble-user{background:linear-gradient(135deg,rgba(129,140,248,.25),rgba(192,132,252,.2));border:1px solid rgba(129,140,248,.3);border-radius:18px 18px 4px 18px;padding:12px 16px;max-width:80%;margin-left:auto}
    .bubble-aura{background:var(--glass);border:1px solid var(--glass-border);border-radius:18px 18px 18px 4px;padding:12px 16px;max-width:85%}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .page-enter{animation:fadeUp .4s ease forwards}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .fade-in{animation:fadeIn .3s ease forwards}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes breatheIn{from{transform:scale(.75)}to{transform:scale(1)}}
    @keyframes breatheOut{from{transform:scale(1)}to{transform:scale(.75)}}
    @keyframes holdFull{0%,100%{transform:scale(1)}}
    @keyframes holdSmall{0%,100%{transform:scale(.75)}}
    .anim-b0{animation:breatheIn 4s ease-in-out infinite}
    .anim-b1{animation:holdFull 4s ease-in-out infinite}
    .anim-b2{animation:breatheOut 4s ease-in-out infinite}
    .anim-b3{animation:holdSmall 4s ease-in-out infinite}
    @keyframes dot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
    .td1{animation:dot 1.2s ease infinite 0s}.td2{animation:dot 1.2s ease infinite .2s}.td3{animation:dot 1.2s ease infinite .4s}
    @keyframes badgePop{0%{transform:scale(0) rotate(-10deg);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
    .badge-pop{animation:badgePop .5s cubic-bezier(.34,1.56,.64,1) forwards}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .rec-dot{animation:pulse 1s ease-in-out infinite}
    @keyframes confetti-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
    .confetti{position:fixed;width:10px;height:10px;border-radius:2px;animation:confetti-fall 3s ease forwards;z-index:9999;pointer-events:none}
    .chat-scroll{overflow-y:auto;scroll-behavior:smooth}
    .chat-scroll::-webkit-scrollbar{width:4px}
    .heatmap-cell{transition:transform .2s;cursor:default}.heatmap-cell:hover{transform:scale(1.4)}
    .nav-btn{transition:all .2s ease;position:relative}
    .nav-btn.active::after{content:'';position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:4px;height:4px;background:var(--accent);border-radius:50%}
    .tag-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid;transition:all .15s ease;white-space:nowrap}
    .tag-chip:hover{transform:scale(1.05)}
    .slide-in{animation:fadeUp .35s ease forwards}

    /* Sidebar layout */
    aside::-webkit-scrollbar { width: 4px; }
    aside::-webkit-scrollbar-thumb { background: rgba(129,140,248,0.2); border-radius: 2px; }

    @media(max-width:768px){
      .desktop-nav{display:none!important}
      .mob-btn{display:flex!important}
      .mob-topbar{display:block!important}
      .hide-mobile{display:none!important}
      .main-content { padding-top: 72px !important; }
    }
    @media(min-width:769px){
      .mob-btn{display:none!important}
      .mob-topbar{display:none!important}
      .desktop-nav{display:flex!important}
      .hide-desktop{display:none!important}
    }
  `}</style>
);

// ─── Sentiment Badge ──────────────────────────────────────────────────────────
export const SentimentBadge = ({ sentiment }) => {
  const s = SENTIMENT_LABELS[sentiment] || SENTIMENT_LABELS.neutral;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:`${s.color}22`, border:`1px solid ${s.color}55`, borderRadius:99, padding:'3px 10px', fontSize:12, color:s.color, fontWeight:600 }}>
      {s.emoji} {s.label}
    </span>
  );
};

// ─── Achievement Toast ────────────────────────────────────────────────────────
export const AchievementToast = ({ achievement, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', zIndex:300, animation:'fadeUp .4s ease forwards' }}>
      <div className="glass" style={{ padding:'14px 24px', display:'flex', alignItems:'center', gap:14, border:'1px solid rgba(129,140,248,.5)', background:'rgba(129,140,248,.18)', whiteSpace:'nowrap' }}>
        <span style={{ fontSize:32 }}>{achievement.emoji}</span>
        <div>
          <p style={{ fontSize:11, color:'var(--accent)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Achievement Unlocked!</p>
          <p style={{ fontSize:15, fontWeight:700 }}>{achievement.title}</p>
        </div>
      </div>
    </div>
  );
};

// ─── Confetti ─────────────────────────────────────────────────────────────────
export const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: ['#818cf8','#c084fc','#4ade80','#facc15','#f87171','#2dd4bf'][i % 6],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    size: `${Math.random() * 8 + 6}px`,
  }));
  return (
    <>
      {pieces.map(p => (
        <div key={p.id} className="confetti" style={{ left:p.left, top:0, background:p.color, width:p.size, height:p.size, animationDelay:p.delay }} />
      ))}
    </>
  );
};

// ─── Mood Tags Selector ───────────────────────────────────────────────────────
export const MoodTagSelector = ({ selected, onChange, allTags }) => (
  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
    {allTags.map(tag => {
      const isSelected = selected.includes(tag);
      return (
        <span key={tag} className="tag-chip"
          onClick={() => onChange(isSelected ? selected.filter(t => t !== tag) : [...selected, tag])}
          style={{ background: isSelected ? 'rgba(129,140,248,.2)' : 'transparent', borderColor: isSelected ? 'rgba(129,140,248,.5)' : 'var(--border)', color: isSelected ? 'var(--accent)' : 'var(--muted)' }}>
          {tag}
        </span>
      );
    })}
  </div>
);

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
export const ThemeToggle = ({ theme, setTheme }) => (
  <button className="btn btn-ghost btn-sm" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
    style={{ padding:'8px 12px', gap:6 }} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
    <Ico icon={theme === 'dark' ? Icons.sun : Icons.moon} size={16} />
    <span className="hide-mobile" style={{ fontSize:12 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
  </button>
);