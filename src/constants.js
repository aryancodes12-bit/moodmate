// ─── Mood Map ─────────────────────────────────────────────────────────────────
export const moodMap = {
  1: { label:'Awful', emoji:'😔', color:'#f87171', bg:'rgba(248,113,113,0.15)', border:'rgba(248,113,113,0.4)' },
  2: { label:'Bad',   emoji:'😟', color:'#fb923c', bg:'rgba(251,146,60,0.15)',  border:'rgba(251,146,60,0.4)'  },
  3: { label:'Okay',  emoji:'😐', color:'#facc15', bg:'rgba(250,204,21,0.15)',  border:'rgba(250,204,21,0.4)'  },
  4: { label:'Good',  emoji:'😊', color:'#4ade80', bg:'rgba(74,222,128,0.15)',  border:'rgba(74,222,128,0.4)'  },
  5: { label:'Great', emoji:'😄', color:'#2dd4bf', bg:'rgba(45,212,191,0.15)',  border:'rgba(45,212,191,0.4)'  },
};

// ─── Mood Tags ────────────────────────────────────────────────────────────────
export const MOOD_TAGS = [
  '📚 Study', '👥 Friends', '💼 Work', '🏃 Exercise', '😴 Sleep',
  '🍕 Food', '👨‍👩‍👧 Family', '💕 Relationship', '🎮 Hobby', '🌿 Nature',
  '💊 Health', '💰 Money', '🎯 Goals', '🧘 Meditation', '📱 Social Media',
];

// ─── Sentiment Labels ─────────────────────────────────────────────────────────
export const SENTIMENT_LABELS = {
  anxious:  { color:'#fb923c', emoji:'😰', label:'Anxious'  },
  sad:      { color:'#818cf8', emoji:'😢', label:'Sad'      },
  angry:    { color:'#f87171', emoji:'😡', label:'Angry'    },
  happy:    { color:'#4ade80', emoji:'😊', label:'Happy'    },
  stressed: { color:'#facc15', emoji:'😤', label:'Stressed' },
  grateful: { color:'#2dd4bf', emoji:'🙏', label:'Grateful' },
  neutral:  { color:'#94a3b8', emoji:'😐', label:'Neutral'  },
};

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id:'first',    emoji:'🌱', title:'First Step',    desc:'Write your first entry',     check: h => h.length >= 1 },
  { id:'three',    emoji:'🔥', title:'On a Roll',     desc:'Write 3 entries',            check: h => h.length >= 3 },
  { id:'week',     emoji:'📅', title:'Week Warrior',  desc:'7-day writing streak',       check: (_h,s) => s >= 7 },
  { id:'ten',      emoji:'⭐', title:'Dedicated',     desc:'Write 10 entries',           check: h => h.length >= 10 },
  { id:'voice',    emoji:'🎙️', title:'Voice of Soul', desc:'Use voice journal once',    check: (_h,_s,f) => f.voiceUsed },
  { id:'export',   emoji:'📦', title:'Data Guardian', desc:'Export your journal',        check: (_h,_s,f) => f.exported },
  { id:'moods',    emoji:'🌈', title:'Full Spectrum', desc:'Log all 5 mood levels',      check: h => new Set(h.map(e=>e.mood)).size === 5 },
  { id:'thirty',   emoji:'🗓️', title:'Month Master',  desc:'30-day writing streak',     check: (_h,s) => s >= 30 },
  { id:'positive', emoji:'☀️', title:'Positive Week', desc:'Avg mood 4+ for 7 days',   check: h => { const r=h.slice(0,7); return r.length>=7 && r.reduce((s,e)=>s+e.mood,0)/r.length>=4; } },
  { id:'night',    emoji:'🌙', title:'Night Owl',     desc:'Write after 10pm',           check: h => h.some(e=>new Date(e.timestamp).getHours()>=22) },
];

// ─── Onboarding Questions ─────────────────────────────────────────────────────
export const ONBOARDING_QUESTIONS = [
  {
    id: 'stress_freq',
    question: 'How often do you feel stressed?',
    options: ['Rarely', 'Sometimes', 'Often', 'Almost Always'],
    emoji: '😤',
  },
  {
    id: 'goal',
    question: 'What do you want help with?',
    options: ['Manage Stress', 'Better Sleep', 'Productivity', 'Anxiety Relief'],
    emoji: '🎯',
    multi: true,
  },
  {
    id: 'journal_freq',
    question: 'How often do you want to journal?',
    options: ['Daily', 'A few times a week', 'Weekly', 'Whenever I feel like'],
    emoji: '📝',
  },
  {
    id: 'reminder_time',
    question: 'Best time for a daily reminder?',
    options: ['Morning (8am)', 'Afternoon (2pm)', 'Evening (7pm)', 'Night (10pm)'],
    emoji: '⏰',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const calcStreak = (history) => {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (history.some(e => new Date(e.timestamp).toDateString() === d.toDateString())) streak++;
    else if (i > 0) break;
  }
  return streak;
};

export const callAI = async (userPrompt, systemPrompt) => {
  const r = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: systemPrompt, userPrompt }),
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return (await r.json()).text || '';
};