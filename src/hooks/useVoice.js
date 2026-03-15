import { useState, useRef, useCallback, useEffect } from 'react';

export const VOICE_LANGUAGES = [
  { code: 'hi-IN',  label: '🇮🇳 Hindi' },
  { code: 'en-IN',  label: '🇮🇳 English (India)' },
  { code: 'en-US',  label: '🇺🇸 English (US)' },
];

const useVoice = (onResult, lang = 'hi-IN') => {
  const [recording, setRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [permissionState, setPermissionState] = useState('unknown');
  const recRef = useRef(null);
  const onResultRef = useRef(onResult);
  const shouldRunRef = useRef(false);
  const langRef = useRef(lang);

  // Track what we've already sent to parent — avoid resending old text
  const sentRef = useRef('');

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!supported || !navigator.permissions) return;
    navigator.permissions.query({ name: 'microphone' })
      .then(r => { setPermissionState(r.state); r.onchange = () => setPermissionState(r.state); })
      .catch(() => {});
  }, [supported]);

  const stop = useCallback(() => {
    shouldRunRef.current = false;
    sentRef.current = '';
    if (recRef.current) { try { recRef.current.stop(); } catch {} recRef.current = null; }
    setRecording(false);
    setVoiceError('');
  }, []);

  const createRec = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = langRef.current;
    rec.continuous = true;
    rec.interimResults = true;

    // Per-session accumulated finals
    let sessionFinal = '';

    rec.onstart = () => { setRecording(true); setVoiceError(''); };

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          sessionFinal += t;
        } else {
          interim = t;
        }
      }

      // Only send the NEW text that hasn't been sent yet
      const currentTotal = (sessionFinal + interim).trim();
      const newText = currentTotal.slice(sentRef.current.length).trim();

      if (newText) {
        // Update parent: append only new text
        onResultRef.current(prev => {
          const base = prev ? prev.trimEnd() + ' ' : '';
          return base + newText;
        });
        // Track what we've committed (only finals, not interim)
        if (sessionFinal.length > sentRef.current.length) {
          sentRef.current = sessionFinal;
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setVoiceError('🔒 Mic blocked! Click lock icon in Chrome address bar → Allow microphone → Refresh page.');
        setPermissionState('denied');
        shouldRunRef.current = false;
        setRecording(false);
      } else if (e.error === 'no-speech') {
        // silence — onend will restart automatically
      } else if (e.error === 'network') {
        setVoiceError('Network error. Check internet and try again.');
        shouldRunRef.current = false;
        setRecording(false);
      } else if (e.error !== 'aborted') {
        console.warn('Speech error:', e.error);
      }
    };

    rec.onend = () => {
      // Chrome auto-stops after ~5s silence — restart seamlessly
      if (shouldRunRef.current) {
        // sentRef keeps accumulating across restarts — no reset
        try {
          const nr = createRec();
          recRef.current = nr;
          nr.start();
        } catch {
          setRecording(false);
          shouldRunRef.current = false;
        }
      } else {
        setRecording(false);
      }
    };

    return rec;
  }, []);

  const start = useCallback(async () => {
    if (!supported) { setVoiceError('Use Google Chrome for voice support.'); return; }
    setVoiceError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setPermissionState('granted');
    } catch (err) {
      if (err.name === 'NotAllowedError') setVoiceError('🔒 Mic blocked! Click lock icon in Chrome address bar → Allow microphone → Refresh.');
      else if (err.name === 'NotFoundError') setVoiceError('No microphone found. Please connect a mic.');
      else setVoiceError('Could not access mic: ' + err.message);
      setPermissionState('denied');
      return;
    }

    shouldRunRef.current = true;
    sentRef.current = '';
    const rec = createRec();
    recRef.current = rec;
    try { rec.start(); }
    catch (e) { setVoiceError('Could not start: ' + e.message); shouldRunRef.current = false; recRef.current = null; }
  }, [supported, createRec]);

  const toggle = useCallback(() => {
    if (recording) stop(); else start();
  }, [recording, start, stop]);

  return { recording, supported, toggle, stop, voiceError, permissionState, clearError: () => setVoiceError('') };
};

export default useVoice;