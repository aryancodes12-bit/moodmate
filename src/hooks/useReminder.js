import { useState, useEffect, useCallback } from 'react';

/**
 * useReminder — Browser Push Notification based daily journal reminders
 * Works even when app tab is open (uses setTimeout scheduling)
 * For background notifications, a Service Worker would be needed
 */
const useReminder = (userId) => {
  const [permission, setPermission] = useState(Notification.permission);
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const timerRef = { current: null };

  const STORAGE_KEY = `mm-reminder-${userId}`;

  // Load saved settings
  useEffect(() => {
    if (!userId) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.enabled) setEnabled(true);
      if (saved.time) setReminderTime(saved.time);
    } catch {}
  }, [userId]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  // Schedule next notification
  const scheduleNext = useCallback((timeStr) => {
    if (permission !== 'granted') return;
    clearTimeout(timerRef.current);

    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (next <= now) next.setDate(next.getDate() + 1);

    const msUntil = next - now;
    const hoursUntil = Math.round(msUntil / 1000 / 60 / 60 * 10) / 10;
    console.log(`📔 Reminder scheduled in ${hoursUntil}h`);

    timerRef.current = setTimeout(() => {
      if (Notification.permission === 'granted') {
        const notif = new Notification('MoodMate 🌙', {
          body: "Time to journal! How are you feeling today? ✍️",
          icon: '/sidebar.png',
          badge: '/sidebar.png',
          tag: 'moodmate-daily',
          requireInteraction: false,
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        // Schedule next day
        scheduleNext(timeStr);
      }
    }, msUntil);
  }, [permission]);

  // Enable reminders
  const enableReminders = useCallback(async (timeStr) => {
    const granted = permission === 'granted' || await requestPermission();
    if (!granted) return false;

    setEnabled(true);
    setReminderTime(timeStr);
    scheduleNext(timeStr);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: true, time: timeStr }));

    // Show confirmation notification immediately
    new Notification('MoodMate 🌙', {
      body: `Daily reminder set for ${formatTime(timeStr)}! We'll remind you to journal every day. 🎉`,
      icon: '/sidebar.png',
      tag: 'moodmate-setup',
    });

    return true;
  }, [permission, requestPermission, scheduleNext, STORAGE_KEY]);

  // Disable reminders
  const disableReminders = useCallback(() => {
    clearTimeout(timerRef.current);
    setEnabled(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: false, time: reminderTime }));
  }, [reminderTime, STORAGE_KEY]);

  // Auto-schedule on load if enabled
  useEffect(() => {
    if (enabled && permission === 'granted') {
      scheduleNext(reminderTime);
    }
    return () => clearTimeout(timerRef.current);
  }, [enabled, permission, reminderTime, scheduleNext]);

  return {
    permission,
    enabled,
    reminderTime,
    setReminderTime,
    enableReminders,
    disableReminders,
    requestPermission,
    supported: 'Notification' in window,
  };
};

const formatTime = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export { formatTime };
export default useReminder;