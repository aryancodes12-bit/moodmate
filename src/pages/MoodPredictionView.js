import React, { useState, useMemo } from 'react';
import { moodMap, callAI, calcStreak } from '../constants';
import { Spin, Ico, Icons } from '../components/UI';

// ─── Mood Prediction Algorithm ────────────────────────────────────────────────
const analyzeTrends = (history) => {
  if (history.length < 3) return null;

  const recent = history.slice(0, 14);
  const avg = recent.reduce((s, e) => s + e.mood, 0) / recent.length;

  // Day of week pattern
  const byDay = {};
  recent.forEach(e => {
    const day = new Date(e.timestamp).getDay();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(e.mood);
  });
  const dayAvgs = Object.entries(byDay).map(([d, moods]) => ({
    day: Number(d),
    avg: moods.reduce((s, m) => s + m, 0) / moods.length,
    count: moods.length,
  }));

  // Time of day pattern
  const byHour = { morning: [], afternoon: [], evening: [], night: [] };
  recent.forEach(e => {
    const h = new Date(e.timestamp).getHours();
    if (h < 12) byHour.morning.push(e.mood);
    else if (h < 17) byHour.afternoon.push(e.mood);
    else if (h < 21) byHour.evening.push(e.mood);
    else byHour.night.push(e.mood);
  });

  // Trend direction (last 7 vs prev 7)
  const last7 = history.slice(0, 7);
  const prev7 = history.slice(7, 14);
  const last7Avg = last7.length ? last7.reduce((s, e) => s + e.mood, 0) / last7.length : avg;
  const prev7Avg = prev7.length ? prev7.reduce((s, e) => s + e.mood, 0) / prev7.length : avg;
  const trend = last7Avg - prev7Avg;

  // Sentiment pattern
  const sentiments = recent.map(e => e.sentiment).filter(Boolean);
  const sentimentFreq = sentiments.reduce((acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }), {});
  const dominantSentiment = Object.entries(sentimentFreq).sort((a, b) => b[1] - a[1])[0]?.[0];

  return { avg, dayAvgs, byHour, trend, dominantSentiment, last7Avg, prev7Avg, recentCount: recent.length };
};

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MoodPredictionView = ({ history }) => {
  const [aiPrediction, setAiPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analysis = useMemo(() => analyzeTrends(history), [history]);
  const streak = calcStreak(history);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDay();

  // Simple algorithmic prediction
  const algorithmicPrediction = useMemo(() => {
    if (!analysis) return null;
    const dayData = analysis.dayAvgs.find(d => d.day === tomorrowDay);
    const trendBonus = analysis.trend * 0.3;
    const base = dayData ? dayData.avg : analysis.avg;
    const predicted = Math.max(1, Math.min(5, base + trendBonus));
    return Math.round(predicted * 10) / 10;
  }, [analysis, tomorrowDay]);

  const getAIPrediction = async () => {
    if (!analysis || history.length < 5) return;
    setLoading(true); setError('');
    try {
      const recentText = history.slice(0, 10).map(e =>
        `${new Date(e.timestamp).toLocaleDateString('en', { weekday: 'short' })}: mood ${e.mood}/5 (${moodMap[e.mood].label})${e.sentiment ? `, felt ${e.sentiment}` : ''}${e.text ? ` — "${e.text.slice(0, 60)}..."` : ''}`
      ).join('\n');

      const system = `You are a mood prediction AI. Analyze the user's journal history and predict tomorrow's mood. Respond ONLY in valid JSON (no markdown) with:
{
  "predictedMood": <number 1-5>,
  "confidence": <"low"|"medium"|"high">,
  "reasoning": "<2-3 sentences explaining why>",
  "warning": "<optional: one thing that could negatively affect mood tomorrow>",
  "tip": "<one specific actionable tip to improve tomorrow's mood>",
  "bestTimeToJournal": "<morning|afternoon|evening|night>",
  "tomorrowOutlook": "<positive|neutral|challenging>"
}`;

      const raw = await callAI(
        `Today is ${new Date().toLocaleDateString('en', { weekday: 'long' })}. Tomorrow is ${dayNamesFull[tomorrowDay]}.\n\nRecent mood history:\n${recentText}`,
        system
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setAiPrediction(parsed);
    } catch (e) {
      setError('Could not generate prediction. Try again.');
    }
    setLoading(false);
  };

  if (history.length < 3) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 60 }} className="page-enter">
        <div style={{ fontSize: 64, marginBottom: 20 }}>🧠</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>AI Mood Prediction</h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
          Write at least <strong style={{ color: 'var(--accent)' }}>3 journal entries</strong> to unlock AI mood prediction.
        </p>
        <div style={{ marginTop: 24, background: 'rgba(129,140,248,.1)', border: '1px solid rgba(129,140,248,.2)', borderRadius: 14, padding: '16px 20px', fontSize: 14, color: 'var(--muted)' }}>
          You have {history.length} {history.length === 1 ? 'entry' : 'entries'}. {3 - history.length} more needed!
        </div>
      </div>
    );
  }

  const pred = aiPrediction?.predictedMood || algorithmicPrediction;
  const predMood = moodMap[Math.round(pred)] || moodMap[3];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800 }}>🧠 AI Mood Prediction</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Based on {history.length} journal entries & behavioral patterns</p>
      </div>

      {/* Tomorrow's Prediction Card */}
      <div className="glass" style={{ padding: 32, textAlign: 'center', borderColor: `${predMood.border}`, background: predMood.bg }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Tomorrow — {dayNamesFull[tomorrowDay]}
        </p>
        <div style={{ fontSize: 72, marginBottom: 12 }}>{predMood.emoji}</div>
        <h3 style={{ fontSize: 32, fontWeight: 800, color: predMood.color, marginBottom: 4 }}>
          {predMood.label}
        </h3>
        <p style={{ fontSize: 16, color: 'var(--muted)' }}>Predicted mood score: <strong style={{ color: predMood.color }}>{pred?.toFixed(1)}/5</strong></p>

        {aiPrediction && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, background: 'rgba(129,140,248,.15)', border: '1px solid rgba(129,140,248,.3)', borderRadius: 99, padding: '4px 14px', color: 'var(--accent)', fontWeight: 600 }}>
              {aiPrediction.confidence === 'high' ? '🎯' : aiPrediction.confidence === 'medium' ? '🔮' : '🌫️'} {aiPrediction.confidence.charAt(0).toUpperCase() + aiPrediction.confidence.slice(1)} confidence
            </span>
            <span style={{ fontSize: 12, background: aiPrediction.tomorrowOutlook === 'positive' ? 'rgba(74,222,128,.12)' : aiPrediction.tomorrowOutlook === 'challenging' ? 'rgba(248,113,113,.12)' : 'rgba(250,204,21,.12)', border: `1px solid ${aiPrediction.tomorrowOutlook === 'positive' ? 'rgba(74,222,128,.3)' : aiPrediction.tomorrowOutlook === 'challenging' ? 'rgba(248,113,113,.3)' : 'rgba(250,204,21,.3)'}`, borderRadius: 99, padding: '4px 14px', color: aiPrediction.tomorrowOutlook === 'positive' ? '#4ade80' : aiPrediction.tomorrowOutlook === 'challenging' ? '#f87171' : '#facc15', fontWeight: 600 }}>
              {aiPrediction.tomorrowOutlook === 'positive' ? '☀️ Positive outlook' : aiPrediction.tomorrowOutlook === 'challenging' ? '⛅ Challenging day ahead' : '🌤️ Neutral outlook'}
            </span>
          </div>
        )}

        <button className="btn btn-primary" onClick={getAIPrediction} disabled={loading}
          style={{ marginTop: 20, gap: 8 }}>
          {loading ? <><Spin size={16} /> Analyzing patterns...</> : aiPrediction ? '🔄 Re-analyze' : '🧠 Get AI Prediction'}
        </button>
        {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 10 }}>{error}</p>}
      </div>

      {/* AI Insights */}
      {aiPrediction && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="page-enter">
          {/* Reasoning */}
          <div className="glass" style={{ padding: 22, borderColor: 'rgba(129,140,248,.3)', background: 'rgba(129,140,248,.06)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>🌙 Why this prediction</p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>{aiPrediction.reasoning}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Tip */}
            <div className="glass" style={{ padding: 20, borderColor: 'rgba(74,222,128,.3)', background: 'rgba(74,222,128,.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>💡 Tomorrow's Tip</p>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text)' }}>{aiPrediction.tip}</p>
            </div>

            {/* Warning */}
            {aiPrediction.warning && (
              <div className="glass" style={{ padding: 20, borderColor: 'rgba(250,204,21,.3)', background: 'rgba(250,204,21,.06)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#facc15', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚠️ Watch out for</p>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text)' }}>{aiPrediction.warning}</p>
              </div>
            )}
          </div>

          {/* Best journal time */}
          <div className="glass" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>
              {aiPrediction.bestTimeToJournal === 'morning' ? '🌅' : aiPrediction.bestTimeToJournal === 'afternoon' ? '☀️' : aiPrediction.bestTimeToJournal === 'evening' ? '🌆' : '🌙'}
            </span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Best time to journal tomorrow</p>
              <p style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'capitalize', fontWeight: 600 }}>{aiPrediction.bestTimeToJournal}</p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Pattern Chart */}
      {analysis && (
        <div className="glass" style={{ padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📅 Your Day-of-Week Patterns</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100, justifyContent: 'space-around' }}>
            {dayNames.map((name, i) => {
              const dayData = analysis.dayAvgs.find(d => d.day === i);
              const isToday = i === new Date().getDay();
              const isTomorrow = i === tomorrowDay;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  {dayData ? (
                    <div style={{
                      width: '100%', maxWidth: 40,
                      height: `${(dayData.avg / 5) * 90}px`,
                      background: isTomorrow
                        ? `linear-gradient(to top, ${predMood.color}dd, ${predMood.color}66)`
                        : `linear-gradient(to top, ${moodMap[Math.round(dayData.avg)].color}cc, ${moodMap[Math.round(dayData.avg)].color}44)`,
                      borderRadius: '8px 8px 3px 3px',
                      border: isTomorrow ? `2px solid ${predMood.color}` : `1px solid ${moodMap[Math.round(dayData.avg)].border}`,
                      position: 'relative',
                      transition: 'height .6s ease',
                      minHeight: 6,
                    }}>
                      <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: moodMap[Math.round(dayData.avg)].color, fontWeight: 600, whiteSpace: 'nowrap' }}>{dayData.avg.toFixed(1)}</span>
                    </div>
                  ) : (
                    <div style={{ width: '100%', maxWidth: 40, height: 4, background: 'var(--glass-border)', borderRadius: 2 }} />
                  )}
                  <span style={{ fontSize: 11, color: isTomorrow ? 'var(--accent)' : isToday ? '#facc15' : 'var(--muted)', fontWeight: isTomorrow ? 700 : 400 }}>
                    {name}{isTomorrow ? ' 🎯' : isToday ? ' ←' : ''}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, textAlign: 'center' }}>🎯 = Tomorrow's predicted mood</p>
        </div>
      )}

      {/* Trend analysis */}
      {analysis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: '7-day avg', value: analysis.last7Avg.toFixed(1), emoji: moodMap[Math.round(analysis.last7Avg)].emoji, color: moodMap[Math.round(analysis.last7Avg)].color },
            { label: 'Trend', value: analysis.trend > 0.2 ? '↑ Rising' : analysis.trend < -0.2 ? '↓ Falling' : '→ Stable', emoji: analysis.trend > 0.2 ? '📈' : analysis.trend < -0.2 ? '📉' : '➡️', color: analysis.trend > 0.2 ? '#4ade80' : analysis.trend < -0.2 ? '#f87171' : '#facc15' },
            { label: 'Streak', value: `${streak}d`, emoji: '🔥', color: '#fb923c' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '18px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodPredictionView;