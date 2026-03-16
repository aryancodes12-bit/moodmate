import React, { useState, useEffect } from 'react';
import { Icons, Ico } from '../components/UI';

const LandingPage = ({ onGetStarted, theme, setTheme }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const features = [
    { emoji:'📝', title:'Mood Journal', desc:'Write freely about your day. AI listens, reflects, and gives gentle guidance.', color:'#818cf8' },
    { emoji:'🤖', title:'AI Wellness Chat', desc:'Talk to Aura, your personal AI companion, whenever you need support.', color:'#c084fc' },
    { emoji:'📊', title:'Mood Analytics', desc:'Visualize emotional patterns with beautiful charts and insights.', color:'#4ade80' },
    { emoji:'🧘', title:'Relax & Relief', desc:'Guided breathing, ambient sounds, and grounding exercises.', color:'#2dd4bf' },
  ];

  const steps = [
    { num:'01', title:'Write about your day', desc:'Journal your thoughts freely — text or voice.', emoji:'✍️' },
    { num:'02', title:'Track your mood', desc:'Pick how you feel on a simple 1–5 scale with emoji.', emoji:'😊' },
    { num:'03', title:'Get AI insights', desc:'Aura reads your entry and gives personalized reflection.', emoji:'🌙' },
    { num:'04', title:'Grow over time', desc:'Watch your emotional patterns improve week by week.', emoji:'🌱' },
  ];

  const testimonials = [
    { text:'MoodMate helped me recognize my anxiety triggers. The AI reflections feel genuinely caring.', name:'Priya S.', role:'College Student', emoji:'🎓' },
    { text:'I love the mood calendar — seeing my whole month at a glance is incredibly motivating.', name:'Rahul M.', role:'Software Developer', emoji:'💻' },
    { text:'The breathing exercises during my relief breaks have made a real difference in my focus.', name:'Sneha K.', role:'Working Professional', emoji:'🌿' },
  ];

  return (
    <div style={{ minHeight:'100vh', overflowX:'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--glass-border)' : 'none',
        transition: 'all .3s ease',
        padding:'0 24px',
      }}>
        <div style={{ maxWidth:1100, margin:'0 auto', height:68, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src="/sidebar.png" alt="MoodMate" style={{ width:38, height:38, borderRadius:12, objectFit:'cover' }} />
            <span style={{ fontSize:20, fontWeight:800, background:'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>MoodMate</span>
          </div>

          {/* Desktop links */}
          <div className="desktop-nav" style={{ display:'flex', alignItems:'center', gap:32 }}>
            {['Features','How it Works','Testimonials'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                style={{ fontSize:14, fontWeight:500, color:'var(--muted)', textDecoration:'none', transition:'color .2s' }}
                onMouseEnter={e=>e.target.style.color='var(--text)'}
                onMouseLeave={e=>e.target.style.color='var(--muted)'}>
                {l}
              </a>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Theme toggle */}
            <button className="btn btn-ghost btn-sm" onClick={() => setTheme(t => t==='dark'?'light':'dark')} style={{ padding:'8px 12px' }}>
              <Ico icon={theme==='dark' ? Icons.sun : Icons.moon} size={16} />
            </button>
            <button className="btn btn-ghost btn-sm hide-mobile" onClick={onGetStarted}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 24px 80px', position:'relative' }}>
        <div style={{ maxWidth:800, textAlign:'center' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(129,140,248,.12)', border:'1px solid rgba(129,140,248,.3)', borderRadius:99, padding:'6px 18px', fontSize:13, color:'var(--accent)', fontWeight:600, marginBottom:28 }}>
            <span>✨</span> AI-Powered Mental Wellness
          </div>

          <h1 style={{ fontSize:'clamp(42px,7vw,76px)', fontWeight:800, lineHeight:1.1, marginBottom:24 }}>
            <span style={{ background:'linear-gradient(135deg,var(--text),var(--text))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Your Mind,</span>
            <br />
            <span style={{ background:'linear-gradient(135deg,#818cf8,#c084fc,#2dd4bf)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Your Journey</span>
          </h1>

          <p style={{ fontSize:'clamp(16px,2.5vw,20px)', color:'var(--muted)', lineHeight:1.7, marginBottom:40, maxWidth:600, margin:'0 auto 40px' }}>
            MoodMate is your AI-powered mental wellness companion. Journal your emotions, chat with Aura, and understand your patterns — all in one beautiful space.
          </p>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:60 }}>
            <button className="btn btn-primary btn-lg" onClick={onGetStarted} style={{ fontSize:16, gap:8 }}>
              Start Your Journey <Ico icon={Icons.arrow} size={18} />
            </button>
            <a href="#how-it-works" className="btn btn-ghost btn-lg" style={{ fontSize:16, textDecoration:'none' }}>
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:32, justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { value:'100%', label:'Free to use' },
              { value:'AI-first', label:'Personalized insights' },
              { value:'Private', label:'Your data, your control' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <p style={{ fontSize:22, fontWeight:800, background:'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{s.value}</p>
                <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating mood cards */}
        <div className="hide-mobile" style={{ position:'absolute', left:'5%', top:'30%', animation:'float1 6s ease-in-out infinite' }}>
          <div className="glass" style={{ padding:'16px 20px', borderRadius:16, textAlign:'center' }}>
            <div style={{ fontSize:28 }}>😊</div>
            <p style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>Feeling Good</p>
          </div>
        </div>
        <div className="hide-mobile" style={{ position:'absolute', right:'5%', top:'40%', animation:'float2 7s ease-in-out infinite' }}>
          <div className="glass" style={{ padding:'16px 20px', borderRadius:16, textAlign:'center' }}>
            <img src="/sidebar.png" alt="Aura" style={{ width: 32, height: 32, borderRadius: 8, margin: '0 auto', objectFit: 'cover' }} />
            <p style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>Aura is here</p>
          </div>
        </div>
        <style>{`
          @keyframes float1{0%,100%{transform:translateY(0px)}50%{transform:translateY(-20px)}}
          @keyframes float2{0%,100%{transform:translateY(0px)}50%{transform:translateY(-15px)}}
        `}</style>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding:'100px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Everything You Need</p>
            <h2 style={{ fontSize:'clamp(28px,5vw,44px)', fontWeight:800, marginBottom:16 }}>Features Built for Your Wellbeing</h2>
            <p style={{ fontSize:16, color:'var(--muted)', maxWidth:500, margin:'0 auto' }}>Tools that adapt to you, not the other way around.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24 }}>
            {features.map((f, i) => (
              <div key={f.title} className="glass" style={{ padding:32, transition:'transform .3s', animationDelay:`${i*0.1}s` }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-8px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ width:56, height:56, background:`${f.color}20`, border:`1px solid ${f.color}40`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:20 }}>{f.emoji}</div>
                <h3 style={{ fontSize:18, fontWeight:700, marginBottom:10 }}>{f.title}</h3>
                <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" style={{ padding:'100px 24px', background: theme==='dark' ? 'rgba(129,140,248,0.04)' : 'rgba(129,140,248,0.03)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Simple & Powerful</p>
            <h2 style={{ fontSize:'clamp(28px,5vw,44px)', fontWeight:800 }}>How MoodMate Works</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24 }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ textAlign:'center', padding:28 }}>
                <div style={{ fontSize:40, marginBottom:16 }}>{s.emoji}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>Step {s.num}</div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10 }}>{s.title}</h3>
                <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6 }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hide-mobile" style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:20 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ padding:'100px 24px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Real Stories</p>
            <h2 style={{ fontSize:'clamp(28px,5vw,44px)', fontWeight:800 }}>People Love MoodMate</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="glass" style={{ padding:32 }}>
                <div style={{ fontSize:32, marginBottom:16 }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontSize:15, lineHeight:1.7, color:'var(--text)', marginBottom:24, fontStyle:'italic' }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:44, height:44, background:'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{t.emoji}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14 }}>{t.name}</p>
                    <p style={{ fontSize:12, color:'var(--muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'100px 24px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <img src="/sidebar.png" alt="MoodMate" style={{ width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px', objectFit: 'cover', display: 'block' }} />
          <h2 style={{ fontSize:'clamp(28px,5vw,44px)', fontWeight:800, marginBottom:16 }}>
            Start Your Mental Wellness Journey Today
          </h2>
          <p style={{ fontSize:16, color:'var(--muted)', marginBottom:40, lineHeight:1.7 }}>
            Join thousands who are already understanding themselves better with MoodMate. Free, private, and always here for you.
          </p>
          <button className="btn btn-primary btn-lg" onClick={onGetStarted} style={{ fontSize:17, gap:10 }}>
            Get Started — It's Free <Ico icon={Icons.arrow} size={20} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ textAlign:'center', padding:'32px 24px', borderTop:'1px solid var(--glass-border)', color:'var(--muted)', fontSize:13 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:8 }}>
          <img src="/sidebar.png" alt="MoodMate" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ fontWeight:700, color:'var(--text)' }}>MoodMate</span>
        </div>
        <p>Not a substitute for professional medical advice.</p>
        <p style={{ marginTop:4, opacity:.6 }}>Made with ❤️ by the MoodMate Team</p>
      </footer>
    </div>
  );
};

export default LandingPage;