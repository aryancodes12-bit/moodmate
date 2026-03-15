import React, { useState } from 'react';
import { moodMap, calcStreak, callAI } from '../constants';
import { Icons, Ico, Spin, SentimentBadge } from '../components/UI';

const DashboardView = ({ history, onNavigate, session }) => {
  const [quickText, setQuickText] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const streak = calcStreak(history);
  const today = history.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString());
  const todayAvg = today.length ? today.reduce((s, e) => s + e.mood, 0) / today.length : null;
  const week = history.slice(0, 7);
  const weekAvg = week.length ? (week.reduce((s, e) => s + e.mood, 0) / week.length).toFixed(1) : null;
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Friend';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Sentiment summary
  const recentSentiments = history.slice(0, 5).map(e => e.sentiment).filter(Boolean);
  const dominantSentiment = recentSentiments.length
    ? Object.entries(recentSentiments.reduce((acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const entries = history.filter(e => new Date(e.timestamp).toDateString() === d.toDateString());
    const avg = entries.length ? entries.reduce((s, e) => s + e.mood, 0) / entries.length : null;
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), avg };
  });

  const handleQuickJournal = () => {
    if (!quickText.trim()) return;
    onNavigate('journal', { prefill: quickText });
  };

  return (
    <div style={{ maxWidth:900, margin:'0 auto', display:'flex', flexDirection:'column', gap:22 }} className="page-enter">

      {/* Greeting */}
      <div style={{ marginBottom:4 }}>
        <h1 style={{ fontSize:'clamp(22px,4vw,30px)', fontWeight:800 }}>
          {greeting}, {userName.charAt(0).toUpperCase() + userName.slice(1)} 👋
        </h1>
        <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>
          {new Date().toLocaleDateString('en', { weekday:'long', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Top stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
        {/* Today's Mood */}
        <div className="glass" style={{ padding:'22px 20px', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Today's Mood</p>
          {todayAvg ? (
            <>
              <div style={{ fontSize:40, marginBottom:6 }}>{moodMap[Math.round(todayAvg)].emoji}</div>
              <p style={{ fontSize:15, fontWeight:700, color: moodMap[Math.round(todayAvg)].color }}>{moodMap[Math.round(todayAvg)].label}</p>
              <p style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{today.length} {today.length===1?'entry':'entries'}</p>
            </>
          ) : (
            <>
              <div style={{ fontSize:36, marginBottom:6, opacity:.4 }}>😶</div>
              <p style={{ fontSize:13, color:'var(--muted)' }}>Not logged yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('journal')} style={{ marginTop:10 }}>Log Now</button>
            </>
          )}
        </div>

        {/* Streak */}
        <div className="glass" style={{ padding:'22px 20px', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Journal Streak</p>
          <div style={{ fontSize:40, marginBottom:6 }}>🔥</div>
          <p style={{ fontSize:28, fontWeight:800, fontFamily:'JetBrains Mono,monospace', color:'#fb923c' }}>{streak}</p>
          <p style={{ fontSize:12, color:'var(--muted)' }}>{streak === 1 ? 'day' : 'days'} in a row</p>
        </div>

        {/* Weekly avg */}
        <div className="glass" style={{ padding:'22px 20px', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Weekly Avg</p>
          <div style={{ fontSize:40, marginBottom:6 }}>{weekAvg ? moodMap[Math.round(weekAvg)].emoji : '📊'}</div>
          <p style={{ fontSize:28, fontWeight:800, fontFamily:'JetBrains Mono,monospace', color:'var(--accent)' }}>{weekAvg || '--'}</p>
          <p style={{ fontSize:12, color:'var(--muted)' }}>out of 5</p>
        </div>

        {/* Total entries */}
        <div className="glass" style={{ padding:'22px 20px', textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Total Entries</p>
          <div style={{ fontSize:40, marginBottom:6 }}>📝</div>
          <p style={{ fontSize:28, fontWeight:800, fontFamily:'JetBrains Mono,monospace', color:'#4ade80' }}>{history.length}</p>
          <p style={{ fontSize:12, color:'var(--muted)' }}>journal entries</p>
        </div>
      </div>

      {/* Quick journal + 7-day chart side by side */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {/* Quick journal */}
        <div className="glass" style={{ padding:24 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>✍️ Quick Journal</p>
          <textarea value={quickText} onChange={e => setQuickText(e.target.value)}
            placeholder="How are you feeling right now? Write a thought..." style={{ minHeight:100, marginBottom:12 }} />
          <button className="btn btn-primary" onClick={handleQuickJournal} disabled={!quickText.trim()}
            style={{ width:'100%' }}>
            <Ico icon={Icons.sparkle} size={14} /> Continue in Journal
          </button>
        </div>

        {/* 7-day mini chart */}
        <div className="glass" style={{ padding:24 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:20 }}>📈 This Week</p>
          <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:100 }}>
            {days7.map((d, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flex:1 }}>
                {d.avg !== null ? (
                  <div style={{
                    width:'100%', height:`${(d.avg/5)*90}px`,
                    background:`linear-gradient(to top,${moodMap[Math.round(d.avg)].color}cc,${moodMap[Math.round(d.avg)].color}44)`,
                    borderRadius:'6px 6px 3px 3px', border:`1px solid ${moodMap[Math.round(d.avg)].border}`,
                    transition:'height .6s ease', position:'relative', minHeight:6,
                  }} />
                ) : (
                  <div style={{ width:'100%', height:4, background:'var(--glass-border)', borderRadius:2 }} />
                )}
                <span style={{ fontSize:10, color:'var(--muted)' }}>{d.day[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI insight + recent entry */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {/* AI Insight */}
        <div className="glass" style={{ padding:24, borderColor:'rgba(129,140,248,.3)', background:'rgba(129,140,248,.06)' }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>🌙 Aura's Insight</p>
          {dominantSentiment ? (
            <>
              <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65, marginBottom:14 }}>
                {dominantSentiment === 'happy' && "You've been radiating positive energy lately! Keep nurturing what's working."}
                {dominantSentiment === 'stressed' && "You seem to be under some stress recently. Try the breathing exercises to find relief."}
                {dominantSentiment === 'anxious' && "Anxiety has been showing up for you. Remember — one breath at a time is enough."}
                {dominantSentiment === 'sad' && "It looks like a heavier time for you. Writing about it more can really help."}
                {dominantSentiment === 'grateful' && "Your gratitude is shining through your entries. That's a beautiful practice."}
                {dominantSentiment === 'neutral' && "You've been in a steady, balanced state. Keep the journaling momentum going."}
                {!['happy','stressed','anxious','sad','grateful','neutral'].includes(dominantSentiment) && "Keep journaling — patterns will reveal themselves over time."}
              </p>
              <SentimentBadge sentiment={dominantSentiment} />
            </>
          ) : (
            <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65 }}>
              Start journaling and Aura will share personalized insights based on your emotional patterns.
            </p>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('chat')} style={{ marginTop:16, gap:6 }}>
            <Ico icon={Icons.chat} size={14} /> Chat with Aura
          </button>
        </div>

        {/* Recent entry */}
        <div className="glass" style={{ padding:24 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:14 }}>📓 Recent Entry</p>
          {history.length > 0 ? (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:11, color:'var(--muted)' }}>{new Date(history[0].timestamp).toLocaleDateString('en', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                <span style={{ display:'flex', alignItems:'center', gap:4, background: moodMap[history[0].mood]?.bg, border:`1px solid ${moodMap[history[0].mood]?.border}`, borderRadius:99, padding:'3px 10px', fontSize:12, color: moodMap[history[0].mood]?.color, fontWeight:600 }}>
                  {moodMap[history[0].mood]?.emoji} {moodMap[history[0].mood]?.label}
                </span>
              </div>
              <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{history[0].text}</p>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('history')} style={{ marginTop:14, gap:6 }}>
                <Ico icon={Icons.history} size={14} /> View All Entries
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65 }}>No entries yet. Write your first journal entry to see it here.</p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('journal')} style={{ marginTop:14, gap:6 }}>
                <Ico icon={Icons.sparkle} size={14} /> Write First Entry
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick navigation cards */}
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Quick Access</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
          {[
            { id:'journal', label:'New Entry', emoji:'✍️', color:'#818cf8' },
            { id:'chat', label:'Chat Aura', emoji:'🌙', color:'#c084fc' },
            { id:'analytics', label:'Analytics', emoji:'📊', color:'#4ade80' },
            { id:'relief', label:'Relax', emoji:'🧘', color:'#2dd4bf' },
            { id:'achievements', label:'Badges', emoji:'🏆', color:'#fb923c' },
          ].map(item => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className="glass"
              style={{ padding:'18px 12px', textAlign:'center', cursor:'pointer', border:'none', fontFamily:'Sora,sans-serif', transition:'transform .2s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ fontSize:28, marginBottom:8 }}>{item.emoji}</div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{item.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;