import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Icons, Ico, Spin } from '../components/UI';

const AuthScreen = ({ onBack }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text:'', type:'' });

  const showMsg = (text, type='error') => setMsg({ text, type });

  const handleEmail = async () => {
    if (!email.trim() || !password.trim()) { showMsg('Email aur password dono bharo.'); return; }
    setLoading(true); setMsg({ text:'', type:'' });
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showMsg('✅ Account ban gaya! Email confirm karo phir login karo.', 'success');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) { showMsg(e.message); }
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!email.trim()) { showMsg('Email daalo pehle.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) showMsg(error.message);
    else showMsg('✅ Password reset link bhej diya!', 'success');
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: window.location.origin } });
    if (error) { showMsg(error.message); setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative' }}>
      {/* Back button */}
      {onBack && (
        <button className="btn btn-ghost btn-sm" onClick={onBack}
          style={{ position:'absolute', top:24, left:24, gap:6 }}>
          <Ico icon={Icons.back} size={14} /> Back
        </button>
      )}

      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:68, height:68, background:'linear-gradient(135deg,#818cf8,#c084fc)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:34, margin:'0 auto 16px', boxShadow:'0 8px 32px rgba(129,140,248,0.4)' }}>🌙</div>
          <h1 style={{ fontSize:26, fontWeight:800, background:'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>MoodMate</h1>
          <p style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>Your personal mental wellness companion</p>
        </div>

        <div className="glass" style={{ padding:32 }}>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24, textAlign:'center' }}>
            {mode==='login' ? 'Welcome back 👋' : mode==='signup' ? 'Create account ✨' : 'Reset password 🔑'}
          </h2>

          {mode !== 'forgot' && (
            <>
              <button className="btn btn-ghost" onClick={handleGoogle} disabled={loading}
                style={{ width:'100%', marginBottom:20, gap:10, justifyContent:'center' }}>
                <Ico icon={Icons.google} size={20} /> Continue with Google
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <div style={{ flex:1, height:1, background:'var(--glass-border)' }} />
                <span style={{ fontSize:12, color:'var(--muted)' }}>or</span>
                <div style={{ flex:1, height:1, background:'var(--glass-border)' }} />
              </div>
            </>
          )}

          <div style={{ marginBottom:12 }}>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" />
          </div>

          {mode !== 'forgot' && (
            <div style={{ marginBottom:20 }}>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="Password (min 6 chars)" onKeyDown={e=>{ if(e.key==='Enter') handleEmail(); }} />
            </div>
          )}

          {msg.text && (
            <div style={{
              background: msg.type==='success' ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)',
              border:`1px solid ${msg.type==='success' ? 'rgba(74,222,128,.35)' : 'rgba(248,113,113,.35)'}`,
              borderRadius:12, padding:'10px 14px', fontSize:13,
              color: msg.type==='success' ? '#4ade80' : '#fca5a5', marginBottom:16
            }}>{msg.text}</div>
          )}

          <button className="btn btn-primary" onClick={mode==='forgot' ? handleForgot : handleEmail}
            disabled={loading} style={{ width:'100%', padding:'13px 22px' }}>
            {loading ? <><Spin size={16}/> Please wait...</> :
              mode==='login' ? 'Sign In' : mode==='signup' ? 'Create Account' : 'Send Reset Link'}
          </button>

          <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--muted)' }}>
            {mode==='login' && <>
              <span>Don't have an account? </span>
              <button onClick={()=>{setMode('signup');setMsg({text:'',type:''}); }}
                style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontWeight:600,fontFamily:'Sora,sans-serif',fontSize:13 }}>Sign up</button>
              <br/><br/>
              <button onClick={()=>{setMode('forgot');setMsg({text:'',type:''}); }}
                style={{ background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontFamily:'Sora,sans-serif',fontSize:13 }}>Forgot password?</button>
            </>}
            {mode==='signup' && <>
              <span>Already have an account? </span>
              <button onClick={()=>{setMode('login');setMsg({text:'',type:''});}}
                style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontWeight:600,fontFamily:'Sora,sans-serif',fontSize:13 }}>Sign in</button>
            </>}
            {mode==='forgot' && (
              <button onClick={()=>{setMode('login');setMsg({text:'',type:''}); }}
                style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontWeight:600,fontFamily:'Sora,sans-serif',fontSize:13 }}>← Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;