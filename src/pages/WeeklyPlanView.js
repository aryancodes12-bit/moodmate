import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { moodMap, callAI } from '../constants';
import { Spin, Ico, Icons } from '../components/UI';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyPlanView = ({ session, history }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [completedDays, setCompletedDays] = useState({});
  const [activeDay, setActiveDay] = useState(null);
  const [error, setError] = useState('');

  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
  const weekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
    return d.toISOString().split('T')[0];
  })();

  // Load existing plan
  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('weekly_plans')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('week_start', weekStart)
          .single();
        if (data) {
          setPlan(data.plan);
          const saved = localStorage.getItem(`mm-plan-completed-${session.user.id}-${weekStart}`);
          if (saved) setCompletedDays(JSON.parse(saved));
          setActiveDay(todayDayIndex);
        }
      } catch {}
      setLoading(false);
    };
    loadPlan();
  }, [session.user.id, weekStart, todayDayIndex]);

  const generatePlan = async () => {
    if (history.length < 3) { setError('Write at least 3 journal entries to generate a personalized plan.'); return; }
    setGenerating(true); setError('');

    try {
      const recentEntries = history.slice(0, 7).map(e =>
        `${new Date(e.timestamp).toLocaleDateString('en', { weekday: 'short' })}: mood ${e.mood}/5 (${moodMap[e.mood].label})`
      ).join(', ');

      const onboarding = (() => {
        try { return JSON.parse(localStorage.getItem(`mm-onboarding-${session.user.id}`) || '{}'); } catch { return {}; }
      })();

      const goals = onboarding.goal ? (Array.isArray(onboarding.goal) ? onboarding.goal.join(', ') : onboarding.goal) : 'wellness';

      const system = `You are Aura. Create a 7-day mental wellness plan. Return ONLY a single-line compact JSON with no newlines inside strings. Use this exact format:
{"weekTheme":"string","overview":"string","weeklyGoal":"string","days":[{"day":"Monday","focus":"string","morningTask":{"title":"string","duration":"5 min","description":"string","emoji":"🌅"},"eveningTask":{"title":"string","duration":"10 min","description":"string","emoji":"🌙"},"affirmation":"string","journalPrompt":"string","mood_goal":3},{"day":"Tuesday","focus":"string","morningTask":{"title":"string","duration":"5 min","description":"string","emoji":"🌅"},"eveningTask":{"title":"string","duration":"10 min","description":"string","emoji":"🌙"},"affirmation":"string","journalPrompt":"string","mood_goal":3},{"day":"Wednesday","focus":"string","morningTask":{"title":"string","duration":"5 min","description":"string","emoji":"🌿"},"eveningTask":{"title":"string","duration":"10 min","description":"string","emoji":"🌙"},"affirmation":"string","journalPrompt":"string","mood_goal":3},{"day":"Thursday","focus":"string","morningTask":{"title":"string","duration":"5 min","description":"string","emoji":"💪"},"eveningTask":{"title":"string","duration":"10 min","description":"string","emoji":"🌙"},"affirmation":"string","journalPrompt":"string","mood_goal":3},{"day":"Friday","focus":"string","morningTask":{"title":"string","duration":"5 min","description":"string","emoji":"✨"},"eveningTask":{"title":"string","duration":"10 min","description":"string","emoji":"🌙"},"affirmation":"string","journalPrompt":"string","mood_goal":4},{"day":"Saturday","focus":"string","morningTask":{"title":"string","duration":"5 min","description":"string","emoji":"🎨"},"eveningTask":{"title":"string","duration":"10 min","description":"string","emoji":"🌙"},"affirmation":"string","journalPrompt":"string","mood_goal":4},{"day":"Sunday","focus":"string","morningTask":{"title":"string","duration":"5 min","description":"string","emoji":"🧘"},"eveningTask":{"title":"string","duration":"10 min","description":"string","emoji":"🌙"},"affirmation":"string","journalPrompt":"string","mood_goal":4}]}
Replace every "string" with SHORT text (max 8 words). No markdown. No extra whitespace.`;

      const raw = await callAI(
        `Mood history: ${recentEntries}. User goals: ${goals}.`,
        system
      );

      let jsonStr = raw.replace(/```json|```/g, '').trim();
      const start = jsonStr.indexOf('{');
      const end = jsonStr.lastIndexOf('}');
      if (start !== -1 && end !== -1) jsonStr = jsonStr.slice(start, end + 1);
      const parsed = JSON.parse(jsonStr)
      // Save to Supabase
      await supabase.from('weekly_plans').upsert({
        user_id: session.user.id,
        week_start: weekStart,
        plan: parsed,
      });

      setPlan(parsed);
      setActiveDay(todayDayIndex);
    } catch (e) {
      setError('Could not generate plan. Please try again.');
      console.error(e);
    }
    setGenerating(false);
  };

  const toggleDayComplete = (dayIndex) => {
    const updated = { ...completedDays, [dayIndex]: !completedDays[dayIndex] };
    setCompletedDays(updated);
    localStorage.setItem(`mm-plan-completed-${session.user.id}-${weekStart}`, JSON.stringify(updated));
  };

  const completedCount = Object.values(completedDays).filter(Boolean).length;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80, gap: 12, flexDirection: 'column', alignItems: 'center' }}>
      <Spin size={32} /><p style={{ color: 'var(--muted)' }}>Loading your plan...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800 }}>🎯 Weekly Wellness Plan</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
          AI-personalized therapy plan based on your mood patterns
        </p>
      </div>

      {!plan ? (
        /* No plan yet */
        <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🌱</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No plan for this week yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
            Aura will analyze your journal history and create a personalized 7-day mental wellness plan — morning routines, evening tasks, affirmations, and journal prompts tailored just for you.
          </p>
          {history.length < 3 && (
            <div style={{ background: 'rgba(250,204,21,.1)', border: '1px solid rgba(250,204,21,.3)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#facc15', marginBottom: 20 }}>
              ⚠️ Write at least 3 journal entries first ({history.length}/3 done)
            </div>
          )}
          <button className="btn btn-primary btn-lg" onClick={generatePlan} disabled={generating || history.length < 3}>
            {generating ? <><Spin size={18} /> Generating your plan...</> : <><Ico icon={Icons.sparkle} size={18} /> Generate My Week Plan</>}
          </button>
          {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>
      ) : (
        <>
          {/* Week overview */}
          <div className="glass" style={{ padding: 24, borderColor: 'rgba(129,140,248,.3)', background: 'rgba(129,140,248,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>This Week's Theme</p>
                <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>✨ {plan.weekTheme}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65 }}>{plan.overview}</p>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', fontFamily: 'JetBrains Mono,monospace' }}>{completedCount}/7</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>days done</div>
                {/* Progress bar */}
                <div style={{ width: 80, height: 6, background: 'var(--glass-border)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(completedCount / 7) * 100}%`, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', borderRadius: 99, transition: 'width .5s ease' }} />
                </div>
              </div>
            </div>
            {/* Weekly goal */}
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 12 }}>
              <p style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>🎯 Weekly Goal</p>
              <p style={{ fontSize: 14, color: 'var(--text)' }}>{plan.weeklyGoal}</p>
            </div>
          </div>

          {/* Day selector */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {plan.days?.map((day, i) => {
              const isToday = i === todayDayIndex;
              const isDone = completedDays[i];
              return (
                <button key={i} onClick={() => setActiveDay(i)}
                  style={{ flexShrink: 0, padding: '10px 14px', borderRadius: 14, border: `2px solid ${activeDay === i ? 'var(--accent)' : isDone ? 'rgba(74,222,128,.4)' : 'var(--glass-border)'}`, background: activeDay === i ? 'rgba(129,140,248,.15)' : isDone ? 'rgba(74,222,128,.08)' : 'var(--glass)', cursor: 'pointer', fontFamily: 'Sora,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 64 }}>
                  <span style={{ fontSize: 11, color: activeDay === i ? 'var(--accent)' : isDone ? '#4ade80' : 'var(--muted)', fontWeight: 600 }}>{dayNames[i].slice(0, 3)}</span>
                  <span style={{ fontSize: 16 }}>{isDone ? '✅' : isToday ? '👉' : '○'}</span>
                  {isToday && <span style={{ fontSize: 9, color: '#facc15', fontWeight: 700 }}>TODAY</span>}
                </button>
              );
            })}
          </div>

          {/* Active day detail */}
          {activeDay !== null && plan.days?.[activeDay] && (() => {
            const day = plan.days[activeDay];
            const isDone = completedDays[activeDay];
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="page-enter" key={activeDay}>
                {/* Day header */}
                <div className="glass" style={{ padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{dayNames[activeDay]}</p>
                      <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>🎯 {day.focus}</h3>
                    </div>
                    <button onClick={() => toggleDayComplete(activeDay)}
                      className={`btn btn-sm ${isDone ? 'btn-ghost' : 'btn-primary'}`} style={{ gap: 6 }}>
                      {isDone ? '↩️ Undo' : '✅ Complete Day'}
                    </button>
                  </div>

                  {/* Affirmation */}
                  <div style={{ background: 'linear-gradient(135deg,rgba(129,140,248,.12),rgba(192,132,252,.08))', border: '1px solid rgba(129,140,248,.25)', borderRadius: 12, padding: '14px 18px', textAlign: 'center' }}>
                    <p style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.65 }}>"{day.affirmation}"</p>
                  </div>
                </div>

                {/* Tasks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Morning */}
                  <div className="glass" style={{ padding: 20, borderColor: 'rgba(250,204,21,.25)', background: 'rgba(250,204,21,.05)' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#facc15', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🌅 Morning</p>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{day.morningTask?.emoji}</div>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{day.morningTask?.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>⏱ {day.morningTask?.duration}</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{day.morningTask?.description}</p>
                  </div>

                  {/* Evening */}
                  <div className="glass" style={{ padding: 20, borderColor: 'rgba(129,140,248,.25)', background: 'rgba(129,140,248,.05)' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🌙 Evening</p>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{day.eveningTask?.emoji}</div>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{day.eveningTask?.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>⏱ {day.eveningTask?.duration}</p>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{day.eveningTask?.description}</p>
                  </div>
                </div>

                {/* Journal prompt */}
                <div className="glass" style={{ padding: 20, borderColor: 'rgba(74,222,128,.25)', background: 'rgba(74,222,128,.05)' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#4ade80', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📝 Today's Journal Prompt</p>
                  <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic' }}>"{day.journalPrompt}"</p>
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Mood goal for today:</span>
                    <span style={{ fontSize: 20 }}>{moodMap[day.mood_goal]?.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: moodMap[day.mood_goal]?.color }}>{moodMap[day.mood_goal]?.label}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Regenerate */}
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={generatePlan} disabled={generating} style={{ gap: 6 }}>
              {generating ? <><Spin size={14} /> Regenerating...</> : '🔄 Regenerate Plan'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Plan resets every Monday</p>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyPlanView;