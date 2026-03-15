import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { moodMap, SENTIMENT_LABELS } from '../constants';
import { Spin, Ico, Icons, SentimentBadge } from '../components/UI';

const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// Generate random anonymous name from post id
const getAnonName = (id) => {
  const adjectives = ['Calm', 'Gentle', 'Brave', 'Hopeful', 'Mindful', 'Serene', 'Quiet', 'Warm', 'Kind', 'Steady'];
  const nouns = ['Sparrow', 'River', 'Cloud', 'Forest', 'Moon', 'Star', 'Petal', 'Wave', 'Leaf', 'Dawn'];
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `${adjectives[hash % adjectives.length]} ${nouns[Math.floor(hash / 10) % nouns.length]}`;
};

const CommunityView = ({ session, history }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [shareModal, setShareModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterMood, setFilterMood] = useState(0);
  const [tab, setTab] = useState('recent'); // recent | mood | mine

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filterMood) query = query.eq('mood', filterMood);
      if (tab === 'mine') query = query.eq('user_id', session.user.id);

      const { data, error } = await query;
      if (!error && data) setPosts(data);

      // Load user's likes
      const { data: likes } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', session.user.id);
      if (likes) setLikedPosts(new Set(likes.map(l => l.post_id)));
    } catch {}
    setLoading(false);
  }, [filterMood, tab, session.user.id]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleLike = async (postId, currentLikes, isLiked) => {
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p));
    setLikedPosts(prev => { const n = new Set(prev); isLiked ? n.delete(postId) : n.add(postId); return n; });

    if (isLiked) {
      await supabase.from('community_likes').delete().eq('user_id', session.user.id).eq('post_id', postId);
      await supabase.from('community_posts').update({ likes: currentLikes - 1 }).eq('id', postId);
    } else {
      await supabase.from('community_likes').insert({ user_id: session.user.id, post_id: postId });
      await supabase.from('community_posts').update({ likes: currentLikes + 1 }).eq('id', postId);
    }
  };

  const handleShare = async (entry) => {
    if (!entry) return;
    setSharing(true);
    try {
      const { error } = await supabase.from('community_posts').insert({
        user_id: session.user.id,
        content: entry.text,
        mood: entry.mood,
        sentiment: entry.sentiment,
        tags: entry.tags || [],
      });
      if (!error) {
        setShareModal(false);
        setSelectedEntry(null);
        loadPosts();
        alert('✅ Shared anonymously! Others can now see your entry.');
      }
    } catch {}
    setSharing(false);
  };

  const handleDelete = async (postId) => {
    await supabase.from('community_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }} className="page-enter">

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800 }}>🫂 Community</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6, maxWidth: 480, margin: '8px auto 0' }}>
          Anonymized entries from people going through similar feelings. You're not alone. ❤️
        </p>
      </div>

      {/* Privacy notice */}
      <div style={{ background: 'rgba(129,140,248,.08)', border: '1px solid rgba(129,140,248,.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text)' }}>100% Anonymous</strong> — No names, no photos. Random names are auto-generated. Only you can share your entries.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['recent', 'mine'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
              {t === 'recent' ? '🌍 Community' : '✍️ My Shares'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={filterMood} onChange={e => setFilterMood(Number(e.target.value))}
            style={{ fontSize: 12, padding: '6px 10px', borderRadius: 99, width: 'auto' }}>
            <option value={0}>All moods</option>
            {Object.entries(moodMap).map(([k, m]) => <option key={k} value={k}>{m.emoji} {m.label}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShareModal(true)} style={{ gap: 6 }}>
            <Ico icon={Icons.sparkle} size={13} /> Share Entry
          </button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <Spin size={24} /><span style={{ color: 'var(--muted)' }}>Loading community...</span>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>{tab === 'mine' ? "You haven't shared anything yet." : "Be the first to share!"}</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Your anonymized entry could help someone feel less alone.</p>
          <button className="btn btn-primary" onClick={() => setShareModal(true)} style={{ marginTop: 16 }}>
            Share an Entry
          </button>
        </div>
      ) : posts.map(post => {
        const m = moodMap[post.mood] || moodMap[3];
        const isLiked = likedPosts.has(post.id);
        const isOwn = post.user_id === session.user.id;
        const anonName = getAnonName(post.id);

        return (
          <div key={post.id} className="glass" style={{ padding: 22, transition: 'transform .2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

            {/* Post header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${m.color}66, ${m.color}33)`, border: `1px solid ${m.border}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{m.emoji}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isOwn ? 'var(--accent)' : 'var(--text)' }}>
                    {isOwn ? 'You (anonymous)' : anonName}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{timeAgo(post.created_at)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {post.sentiment && <SentimentBadge sentiment={post.sentiment} />}
                <span style={{ background: m.bg, border: `1px solid ${m.border}`, borderRadius: 99, padding: '4px 10px', fontSize: 12, color: m.color, fontWeight: 600 }}>{m.emoji} {m.label}</span>
              </div>
            </div>

            {/* Content */}
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text)', marginBottom: 14 }}>{post.content}</p>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {post.tags.map(t => <span key={t} style={{ fontSize: 11, background: 'rgba(129,140,248,.1)', border: '1px solid rgba(129,140,248,.2)', borderRadius: 99, padding: '2px 8px', color: 'var(--accent)' }}>{t}</span>)}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => handleLike(post.id, post.likes, isLiked)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: isLiked ? 'rgba(248,113,113,.12)' : 'transparent', border: `1px solid ${isLiked ? 'rgba(248,113,113,.3)' : 'var(--glass-border)'}`, borderRadius: 99, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: isLiked ? '#f87171' : 'var(--muted)', fontFamily: 'Sora,sans-serif', transition: 'all .2s' }}>
                {isLiked ? '❤️' : '🤍'} {post.likes > 0 ? post.likes : ''} {post.likes === 1 ? 'hug' : post.likes > 1 ? 'hugs' : 'Send hug'}
              </button>
              {isOwn && (
                <button onClick={() => handleDelete(post.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'Sora,sans-serif' }}>
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Share Modal */}
      {shareModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="glass" style={{ width: '100%', maxWidth: 520, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>🫂 Share Anonymously</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShareModal(false)}><Ico icon={Icons.close} size={16} /></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Pick a journal entry to share. Your name will <strong style={{ color: 'var(--text)' }}>never</strong> be shown — only the words.
            </p>
            {history.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>No journal entries yet. Write one first!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                {history.slice(0, 20).map(entry => {
                  const m = moodMap[entry.mood] || moodMap[3];
                  const isSelected = selectedEntry?.id === entry.id;
                  return (
                    <div key={entry.id} onClick={() => setSelectedEntry(entry)}
                      style={{ padding: '14px 16px', borderRadius: 14, border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--glass-border)'}`, background: isSelected ? 'rgba(129,140,248,.12)' : 'var(--glass)', cursor: 'pointer', transition: 'all .15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(entry.timestamp).toLocaleDateString()}</span>
                        <span style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>{m.emoji} {m.label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{entry.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="btn btn-primary" onClick={() => handleShare(selectedEntry)}
              disabled={!selectedEntry || sharing} style={{ width: '100%', marginTop: 20 }}>
              {sharing ? <><Spin size={16} /> Sharing...</> : '🫂 Share Anonymously'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityView;