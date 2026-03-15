import React, { useState } from 'react';
import { Ico, Icons, Spin } from '../components/UI';

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    period: 'forever',
    emoji: '🌱',
    color: '#4ade80',
    description: 'Perfect for getting started with mental wellness',
    features: [
      { text: 'Unlimited journal entries', included: true },
      { text: 'AI mood analysis (Aura)', included: true },
      { text: 'Mood tracking & calendar', included: true },
      { text: 'Box breathing & relief exercises', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Community (read & share)', included: true },
      { text: '5 AI chat messages/day', included: true },
      { text: 'Voice journaling', included: true },
      { text: 'Achievements & badges', included: true },
      { text: 'Unlimited AI chat', included: false },
      { text: 'AI Mood Prediction', included: false },
      { text: 'Weekly AI Therapy Plan', included: false },
      { text: 'Doctor Connect (counselor chat)', included: false },
      { text: 'Video call with therapist', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  pro: {
    name: 'Pro',
    price: 199,
    period: 'month',
    emoji: '⭐',
    color: '#818cf8',
    description: 'For serious mental wellness transformation',
    badge: 'Most Popular',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited AI chat with Aura', included: true },
      { text: 'AI Mood Prediction', included: true },
      { text: 'Weekly AI Therapy Plan', included: true },
      { text: 'Advanced analytics & insights', included: true },
      { text: 'Export to PDF', included: true },
      { text: 'Doctor Connect — counselor chat', included: true, badge: 'Coming Soon' },
      { text: 'Video call with therapist', included: true, badge: 'Coming Soon' },
      { text: 'Appointment booking', included: true, badge: 'Coming Soon' },
      { text: 'Priority AI responses', included: true },
      { text: 'Ad-free experience', included: true },
      { text: 'Priority support', included: true },
    ],
  },
};

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes! Cancel anytime from your Profile → Settings. No questions asked.' },
  { q: 'Is my data private?', a: 'Absolutely. Your journal entries are encrypted and stored securely in Supabase. We never sell your data.' },
  { q: 'What payment methods are accepted?', a: 'UPI, credit/debit cards, net banking via Razorpay (coming soon).' },
  { q: 'When will Doctor Connect be available?', a: 'We are onboarding licensed counselors and expect to launch Doctor Connect by Q2 2026.' },
  { q: 'Is there a student discount?', a: 'Yes! Students get 50% off with a valid .edu email. Contact us at support@moodmate.app' },
];

const PricingView = ({ session }) => {
  const [billing, setBilling] = useState('monthly'); // monthly | yearly
  const [openFaq, setOpenFaq] = useState(null);

  const yearlyPrice = Math.round(PLANS.pro.price * 12 * 0.6); // 40% off yearly
  const monthlyEquivalent = Math.round(yearlyPrice / 12);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }} className="page-enter">

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(129,140,248,.12)', border: '1px solid rgba(129,140,248,.3)', borderRadius: 99, padding: '6px 18px', fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 16 }}>
          💜 Simple, transparent pricing
        </div>
        <h2 style={{ fontSize: 'clamp(26px,5vw,40px)', fontWeight: 800, marginBottom: 12 }}>
          Invest in Your Mental Wellness
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
          Start free forever. Upgrade when you're ready for the full experience.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 99, padding: 4, marginTop: 24 }}>
          {['monthly', 'yearly'].map(b => (
            <button key={b} onClick={() => setBilling(b)}
              style={{ padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Sora,sans-serif', fontWeight: 600, background: billing === b ? 'linear-gradient(135deg,#818cf8,#c084fc)' : 'transparent', color: billing === b ? 'white' : 'var(--muted)', transition: 'all .2s' }}>
              {b === 'monthly' ? 'Monthly' : 'Yearly'}
              {b === 'yearly' && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(74,222,128,.3)', color: '#4ade80', padding: '2px 6px', borderRadius: 99 }}>-40%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
        {Object.entries(PLANS).map(([key, plan]) => {
          const isPro = key === 'pro';
          const displayPrice = isPro
            ? billing === 'yearly' ? monthlyEquivalent : plan.price
            : 0;

          return (
            <div key={key} className="glass" style={{
              padding: 32, position: 'relative',
              border: isPro ? '2px solid rgba(129,140,248,.5)' : '1px solid var(--glass-border)',
              background: isPro ? 'rgba(129,140,248,.07)' : 'var(--glass)',
            }}>
              {/* Popular badge */}
              {plan.badge && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#818cf8,#c084fc)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  ⭐ {plan.badge}
                </div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{plan.emoji}</span>
                  <span style={{ fontSize: 20, fontWeight: 800 }}>{plan.name}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 42, fontWeight: 800, color: plan.color, fontFamily: 'JetBrains Mono,monospace' }}>
                    ₹{displayPrice}
                  </span>
                  {isPro && <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 6 }}>/month</span>}
                  {!isPro && <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 6 }}>forever</span>}
                </div>
                {isPro && billing === 'yearly' && (
                  <p style={{ fontSize: 12, color: '#4ade80' }}>Billed ₹{yearlyPrice}/year (save ₹{PLANS.pro.price * 12 - yearlyPrice})</p>
                )}
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{plan.description}</p>
              </div>

              {/* CTA button */}
              <button className={`btn ${isPro ? 'btn-primary' : 'btn-ghost'}`}
                style={{ width: '100%', marginBottom: 24, padding: '13px 22px', fontSize: 15 }}
                onClick={() => isPro ? alert('Payment integration coming soon! For early access, email: support@moodmate.app') : null}>
                {isPro ? '🚀 Upgrade to Pro' : '✓ Current Plan'}
              </button>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1, color: f.included ? '#4ade80' : 'var(--muted)', opacity: f.included ? 1 : 0.4 }}>
                      {f.included ? '✓' : '✗'}
                    </span>
                    <span style={{ fontSize: 13, color: f.included ? 'var(--text)' : 'var(--muted)', opacity: f.included ? 1 : 0.5, lineHeight: 1.4 }}>
                      {f.text}
                      {f.badge && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(250,204,21,.15)', color: '#facc15', padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>{f.badge}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust signals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
        {[
          { emoji: '🔒', title: 'Secure & Private', desc: 'Supabase RLS encryption' },
          { emoji: '🚫', title: 'No Ads Ever', desc: 'Your data is never sold' },
          { emoji: '↩️', title: 'Cancel Anytime', desc: 'No lock-in contracts' },
          { emoji: '🎓', title: 'Student Discount', desc: '50% off with .edu email' },
        ].map(t => (
          <div key={t.title} className="glass" style={{ padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{t.emoji}</div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Doctor Connect Preview */}
      <div className="glass" style={{ padding: 32, borderColor: 'rgba(192,132,252,.3)', background: 'rgba(192,132,252,.06)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍⚕️</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Doctor Connect — Coming Soon</h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px' }}>
          Connect with licensed mental health counselors via chat and video call. AI handles first assessment, doctor steps in for deeper support.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {['💬 Counselor Chat', '📹 Video Call', '📅 Book Appointment', '🤖 AI + Doctor Hybrid'].map(f => (
            <span key={f} style={{ fontSize: 13, background: 'rgba(192,132,252,.12)', border: '1px solid rgba(192,132,252,.25)', borderRadius: 99, padding: '6px 14px', color: '#c084fc', fontWeight: 500 }}>{f}</span>
          ))}
        </div>
        <button className="btn btn-primary" style={{ gap: 8 }}
          onClick={() => { const e = prompt('Enter your email to get early access notification:'); if(e) alert(`✅ We'll notify ${e} when Doctor Connect launches!`); }}>
          🔔 Notify Me at Launch
        </button>
      </div>

      {/* FAQ */}
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQ.map((item, i) => (
            <div key={i} className="glass" style={{ overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Sora,sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'left' }}>
                {item.q}
                <span style={{ fontSize: 18, color: 'var(--accent)', transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }} className="fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingView;