import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { moodMap, calcStreak, SENTIMENT_LABELS } from '../constants';
import { Icons, Ico, Spin } from '../components/UI';
import useReminder, { formatTime } from '../hooks/useReminder';

const ProfileView = ({ session, history, onLogout }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [displayName, setDisplayName] = useState(session?.user?.user_metadata?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const {
    permission, enabled, reminderTime, setReminderTime,
    enableReminders, disableReminders, supported: notifSupported,
  } = useReminder(session?.user?.id);

  const [pendingTime, setPendingTime] = useState(reminderTime);

  useEffect(() => { setPendingTime(reminderTime); }, [reminderTime]);

  const streak = calcStreak(history);
  const avgMood = history.length ? (history.reduce((s, e) => s + e.mood, 0) / history.length).toFixed(1) : 0;
  const sentimentCounts = history.reduce((acc, e) => { if (e.sentiment) acc[e.sentiment] = (acc[e.sentiment] || 0) + 1; return acc; }, {});
  const dominantEmotion = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const tabs = [
    { id: 'info',    label: 'Profile',  emoji: '👤' },
    { id: 'stats',   label: 'Stats',    emoji: '📊' },
    { id: 'prefs',   label: 'Settings', emoji: '⚙️' },
    { id: 'privacy', label: 'Privacy',  emoji: '🔒' },
  ];

  const saveProfile = async () => {
    setSaving(true);
    if (displayName) await supabase.auth.updateUser({ data: { full_name: displayName } });
    setMsg('✅ Saved!');
    setTimeout(() => setMsg(''), 2500);
    setSaving(false);
  };

  const handleReminderToggle = async () => {
    if (enabled) {
      disableReminders();
    } else {
      const ok = await enableReminders(pendingTime);
      if (!ok) setMsg('❌ Please allow notifications in Chrome to use reminders.');
    }
  };

  const handleReminderTimeChange = async (newTime) => {
    setPendingTime(newTime);
    if (enabled) await enableReminders(newTime);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'moodmate-data.json'; a.click();
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    await supabase.from('journal_entries').delete().eq('user_id', session.user.id);
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }} className="page-enter">
      {/* Header card */}
      <div className="glass" style={{ padding: 28, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, overflow: 'hidden' }}>
          {session?.user?.user_metadata?.avatar_url
            ? <img src={session.user.user_metadata.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '👤'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{displayName || session?.user?.email?.split('@')[0] || 'User'}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{session?.user?.email}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, background: 'rgba(129,140,248,.12)', border: '1px solid rgba(129,140,248,.3)', borderRadius: 99, padding: '3px 12px', color: 'var(--accent)', fontWeight: 600 }}>🔥 {streak} day streak</span>
            <span style={{ fontSize: 12, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 99, padding: '3px 12px', color: '#4ade80', fontWeight: 600 }}>📝 {history.length} entries</span>
            {enabled && <span style={{ fontSize: 12, background: 'rgba(250,204,21,.1)', border: '1px solid rgba(250,204,21,.3)', borderRadius: 99, padding: '3px 12px', color: '#facc15', fontWeight: 600 }}>⏰ Reminder {formatTime(reminderTime)}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-ghost'}`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile Info ── */}
      {activeTab === 'info' && (
        <div className="glass" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Display Name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={session?.user?.email || ''} disabled style={{ opacity: .6, cursor: 'not-allowed' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Member Since</label>
              <input type="text" value={new Date(session?.user?.created_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })} disabled style={{ opacity: .6, cursor: 'not-allowed' }} />
            </div>
          </div>
          {msg && <p style={{ color: msg.startsWith('❌') ? '#f87171' : '#4ade80', fontSize: 13, marginTop: 12 }}>{msg}</p>}
          <button className="btn btn-primary" onClick={saveProfile} disabled={saving} style={{ marginTop: 20 }}>
            {saving ? <><Spin size={14} /> Saving...</> : '💾 Save Changes'}
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      {activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Total Journals', value: history.length, emoji: '📝' },
              { label: 'Longest Streak', value: `${streak} days`, emoji: '🔥' },
              { label: 'Average Mood', value: `${avgMood}/5`, emoji: moodMap[Math.round(avgMood) || 3]?.emoji },
              { label: 'Dominant Emotion', value: dominantEmotion ? `${SENTIMENT_LABELS[dominantEmotion]?.emoji} ${SENTIMENT_LABELS[dominantEmotion]?.label}` : 'N/A', emoji: '🧠' },
            ].map(s => (
              <div key={s.label} className="glass" style={{ padding: 22, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', fontFamily: 'JetBrains Mono,monospace' }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="glass" style={{ padding: 22 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mood Breakdown</p>
            {[5, 4, 3, 2, 1].map(m => {
              const count = history.filter(e => e.mood === m).length;
              const pct = history.length ? (count / history.length) * 100 : 0;
              return (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 16, width: 22 }}>{moodMap[m].emoji}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', width: 40 }}>{moodMap[m].label}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--glass-border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(to right,${moodMap[m].color}aa,${moodMap[m].color})`, borderRadius: 99, transition: 'width .8s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, color: moodMap[m].color, fontWeight: 600, width: 24 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Settings / Reminders ── */}
      {activeTab === 'prefs' && (
        <div className="glass" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>⏰ Daily Journal Reminder</h3>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
            Get a browser notification every day at your chosen time reminding you to journal.
          </p>

          {!notifSupported && (
            <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 12, padding: 14, fontSize: 13, color: '#fca5a5', marginBottom: 16 }}>
              ⚠️ Browser notifications not supported. Please use Chrome.
            </div>
          )}

          {permission === 'denied' && (
            <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 12, padding: 14, fontSize: 13, color: '#fca5a5', marginBottom: 16 }}>
              🔒 Notifications blocked in Chrome.<br />
              Fix: Click the <strong>lock icon</strong> in address bar → <strong>Notifications → Allow</strong> → Refresh page.
            </div>
          )}

          {/* Toggle row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '16px 20px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 14 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>Daily Reminder</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {enabled ? `Active — reminds you at ${formatTime(reminderTime)}` : 'Tap to enable'}
              </p>
            </div>
            <button onClick={handleReminderToggle} disabled={!notifSupported}
              style={{ width: 52, height: 28, borderRadius: 99, background: enabled ? 'var(--accent)' : 'var(--glass-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .3s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 4, left: enabled ? 26 : 4, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left .25s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
            </button>
          </div>

          {/* Time picker */}
          <div>
            <label style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>Reminder Time</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="time" value={pendingTime} onChange={e => handleReminderTimeChange(e.target.value)} style={{ maxWidth: 160 }} />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>= {formatTime(pendingTime)}</span>
            </div>
          </div>

          {/* Quick time presets */}
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Quick presets:</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[{ label: 'Morning', time: '08:00', emoji: '🌅' }, { label: 'Afternoon', time: '14:00', emoji: '☀️' }, { label: 'Evening', time: '19:00', emoji: '🌆' }, { label: 'Night', time: '22:00', emoji: '🌙' }].map(p => (
                <button key={p.time} className={`btn btn-sm ${pendingTime === p.time ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleReminderTimeChange(p.time)} style={{ gap: 5 }}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test notification */}
          {permission === 'granted' && (
            <button className="btn btn-ghost" style={{ marginTop: 20, gap: 8 }}
              onClick={() => new Notification('MoodMate 🌙', { body: "This is a test notification! Your journaling journey continues. ✍️", icon: '/sidebar.png' })}>
              🔔 Send Test Notification
            </button>
          )}

          {msg && <p style={{ color: msg.startsWith('❌') ? '#f87171' : '#4ade80', fontSize: 13, marginTop: 16 }}>{msg}</p>}
        </div>
      )}

      {/* ── Privacy ── */}
      {activeTab === 'privacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Data</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { emoji: '🔒', title: 'Secure Storage', desc: 'Entries stored in Supabase with Row Level Security — only you can read your data.' },
                { emoji: '🚫', title: 'No Ads', desc: 'Your data is never sold or used for advertising.' },
                { emoji: '🛡️', title: 'Auth Protected', desc: 'Every request requires your authenticated session.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 0', borderBottom: i < 2 ? '1px solid var(--glass-border)' : 'none' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                  <div><p style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</p><p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Data Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn-ghost" onClick={exportData} style={{ justifyContent: 'flex-start', gap: 10 }}>
                <Ico icon={Icons.download} size={16} /> Export All Data (JSON)
              </button>
              <button className="btn btn-danger" onClick={handleDeleteAccount} style={{ justifyContent: 'flex-start', gap: 10 }}>
                🗑️ {deleteConfirm ? 'Click again to PERMANENTLY delete' : 'Delete Account & All Data'}
              </button>
              {deleteConfirm && <p style={{ fontSize: 12, color: '#f87171' }}>⚠️ This cannot be undone. All your journal entries will be deleted.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;