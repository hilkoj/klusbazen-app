import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Trophy,
  Gift,
  Settings,
  Plus,
  Check,
  Sparkles,
  Trash2,
  Calendar,
  Cloud,
  CloudOff,
  Smartphone,
  RefreshCw,
  Star,
  Flame,
  Award,
  X,
  RotateCcw,
  Users,
  User,
  Pencil,
  Clock,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX
} from 'lucide-react';

// ============================================================================
// STANDAARD GEGEVENS & CONFIGURATIE
// ============================================================================

const AVATAR_OPTIONS = [
  // Dieren
  '🦁', '🦊', '🐼', '🦄', '🐸', '🐙', '🐶', '🐱', '🐰', '🐨', '🐯', '🐧', '🦖', '🦉', '🦋', '🐬',
  // Helden & Fantasie
  '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🧚‍♀️', '🥷', '🤖', '👽', '👩‍🚀', '👨‍🚀', '🤠',
  // Gezin
  '👩', '👨', '👧', '👦', '👶', '👵', '👴'
];
const CHORE_EMOJIS = ['🍽️', '🧹', '🛏️', '🧺', '🧽', '🐶', '🐰', '🌱', '🗑️', '🚗', '📚', '🧸', '🍳', '🛒', '✨'];
const DEFAULT_REWARD_EMOJI = '🎁';

const REWARD_PRESETS = [
  { title: 'Samen uit eten bij de pizzeria', emoji: '🍕', target: 200 },
  { title: 'Grote spelletjesavond met snacks', emoji: '🎲', target: 150 },
  { title: 'Met het hele gezin naar de bioscoop', emoji: '🍿', target: 300 },
  { title: 'Dagje pretpark of zwembad', emoji: '🎢', target: 500 },
  { title: 'IJsjes halen bij de ijssalon', emoji: '🍦', target: 100 },
];

const SIZE_CONFIG = {
  mini: { label: 'Mini', points: 5, color: 'bg-sky-100 text-sky-700 border-sky-200' },
  klein: { label: 'Klein', points: 10, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  middel: { label: 'Middel', points: 20, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  groot: { label: 'Groot', points: 35, color: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const FREQUENCY_OPTIONS = [
  { id: 'none', label: 'Onbeperkt', shortLabel: '' },
  { id: 'day', label: 'Per dag', shortLabel: 'dag' },
  { id: 'week', label: 'Per week', shortLabel: 'week' },
  { id: 'month', label: 'Per maand', shortLabel: 'maand' },
];

const DUTCH_DAYS = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

// ============================================================================
// GELUIDSEFFECTEN (WEB AUDIO API - VOLLEDIG OFFLINE & ZONDER EXTERNE BESTANDEN)
// ============================================================================

let sharedAudioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

const playTone = (ctx, freq, startTime, duration, waveType = 'triangle', peakGain = 0.22) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = waveType;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
};

const playAppSound = (type = 'chore', size = 'klein') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'chore') {
      // Vrolijk, helder 'pling!' geluid dat nét iets feestelijker klinkt bij grotere klusjes
      if (size === 'groot') {
        playTone(ctx, 523.25, now, 0.14, 'triangle', 0.22);        // C5
        playTone(ctx, 659.25, now + 0.08, 0.16, 'triangle', 0.22); // E5
        playTone(ctx, 783.99, now + 0.16, 0.18, 'triangle', 0.24); // G5
        playTone(ctx, 1046.5, now + 0.24, 0.36, 'sine', 0.26);     // C6
      } else if (size === 'middel') {
        playTone(ctx, 587.33, now, 0.13, 'triangle', 0.20);        // D5
        playTone(ctx, 739.99, now + 0.08, 0.15, 'triangle', 0.22); // F#5
        playTone(ctx, 880.0, now + 0.16, 0.30, 'sine', 0.24);      // A5
      } else {
        // Mini & Klein: lekker vlot dubbel muntjes-geluid
        playTone(ctx, 659.25, now, 0.12, 'triangle', 0.20);        // E5
        playTone(ctx, 987.77, now + 0.09, 0.28, 'sine', 0.24);     // B5
      }
    } else if (type === 'celebration') {
      // Feestelijke overwinningsfanfare voor het behalen van de gezinsbeloning!
      const melody = [
        { f: 523.25, t: 0.00, d: 0.16 }, // C5
        { f: 659.25, t: 0.11, d: 0.16 }, // E5
        { f: 783.99, t: 0.22, d: 0.16 }, // G5
        { f: 1046.5, t: 0.34, d: 0.22 }, // C6
        { f: 783.99, t: 0.50, d: 0.14 }, // G5
        { f: 1046.5, t: 0.62, d: 0.55 }, // C6 (lang)
      ];
      melody.forEach((n) => {
        playTone(ctx, n.f, now + n.t, n.d, 'triangle', 0.24);
      });
      // Warm slotakkoord eronder
      playTone(ctx, 523.25, now + 0.62, 0.55, 'sine', 0.14); // C5
      playTone(ctx, 659.25, now + 0.62, 0.55, 'sine', 0.14); // E5
      playTone(ctx, 783.99, now + 0.62, 0.55, 'sine', 0.14); // G5
    } else if (type === 'undo') {
      // Zacht dalend 'bloop'-geluid bij ongedaan maken
      playTone(ctx, 440.0, now, 0.11, 'sine', 0.16);        // A4
      playTone(ctx, 329.63, now + 0.09, 0.18, 'sine', 0.15); // E4
    }
  } catch (err) {
    // Negeer audiofouten zodat de app nooit crasht
    console.warn('Geluid kon niet worden afgespeeld:', err);
  }
};

// ============================================================================
// HULPFUNCTIES VOOR PERIODES, SPREIDING & BESCHIKBAARHEID
// ============================================================================

const getPeriodBounds = (period, now = new Date()) => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === 'day') {
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start: start.getTime(), end: end.getTime() };
  }
  if (period === 'week') {
    // Zondag als start van de nieuwe week (getDay(): 0 = zondag, 1 = maandag, ...)
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start: start.getTime(), end: end.getTime() };
  }
  if (period === 'month') {
    start.setDate(1);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return { start: start.getTime(), end: end.getTime() };
  }
  return { start: 0, end: 0 };
};

const normalizeCompletionEntry = (entry) => {
  if (typeof entry === 'number') {
    return { ts: entry, memberId: null };
  }
  if (entry && typeof entry === 'object' && typeof entry.ts === 'number') {
    return { ts: entry.ts, memberId: entry.memberId || null };
  }
  return null;
};

const getChoreCompletions = (chore) => {
  if (Array.isArray(chore.completedTimestamps) && chore.completedTimestamps.length > 0) {
    return chore.completedTimestamps.map(normalizeCompletionEntry).filter(Boolean);
  }
  if (chore.lastCompletedAt) {
    return [{ ts: chore.lastCompletedAt, memberId: null }];
  }
  return [];
};

const getRelevantCompletionsInPeriod = (chore, memberId = null, now = new Date()) => {
  const period = chore.frequencyPeriod || 'none';
  if (period === 'none') return [];

  const { start } = getPeriodBounds(period, now);
  const taskType = chore.taskType || 'family';

  return getChoreCompletions(chore).filter((entry) => {
    if (entry.ts < start) return false;
    if (taskType === 'individual') {
      return memberId ? entry.memberId === memberId : false;
    }
    return true;
  });
};

const getCompletionsInCurrentPeriod = (chore, memberId = null, now = new Date()) => {
  return getRelevantCompletionsInPeriod(chore, memberId, now).length;
};

// Geeft null terug als het klusje nu beschikbaar is, of het exacte tijdstip (ms) waarop het weer zichtbaar wordt
const getNextAvailableTimestamp = (chore, memberId = null, now = new Date()) => {
  const period = chore.frequencyPeriod || 'none';
  if (period === 'none') return null;

  const maxCount = Math.max(1, Number(chore.frequencyCount) || 1);
  const { start, end } = getPeriodBounds(period, now);
  const relevant = getRelevantCompletionsInPeriod(chore, memberId, now);

  if (relevant.length === 0) return null;

  // Maximaal aantal keer in deze periode al bereikt -> wachten tot de volgende periode (bijv. zondag 00:00)
  if (relevant.length >= maxCount) {
    return end;
  }

  // Nog niet aan het maximum, maar wel even wachten zodat uitvoeringen netjes over de periode worden verspreid
  // Bijv. 2x per week -> wachttijd = 3,5 dag (halve week); 3x per week -> 1/3 week
  const lastTs = Math.max(...relevant.map((entry) => entry.ts));
  const cooldownMs = Math.floor((end - start) / maxCount);
  const nextAvailable = Math.min(end, lastTs + cooldownMs);

  return now.getTime() < nextAvailable ? nextAvailable : null;
};

const isChoreAvailable = (chore, memberId = null, now = new Date()) => {
  return getNextAvailableTimestamp(chore, memberId, now) === null;
};

const getFrequencyLabel = (chore) => {
  const period = chore.frequencyPeriod || 'none';
  if (period === 'none') return null;

  const count = Math.max(1, Number(chore.frequencyCount) || 1);
  const opt = FREQUENCY_OPTIONS.find((o) => o.id === period);
  return `${count}x / ${opt?.shortLabel || period}`;
};

const getNextAvailableLabel = (chore, memberId = null, now = new Date()) => {
  const nextTs = getNextAvailableTimestamp(chore, memberId, now);
  if (!nextTs) return '';

  const nextDate = new Date(nextTs);
  const isMidnight = nextDate.getHours() === 0 && nextDate.getMinutes() === 0;
  const timeStr = nextDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const targetDayStart = new Date(nextDate);
  targetDayStart.setHours(0, 0, 0, 0);
  const diffDays = Math.round((targetDayStart - todayStart) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Vandaag om ${timeStr} weer zichtbaar`;
  }
  if (diffDays === 1) {
    return isMidnight ? 'Morgen weer zichtbaar' : `Morgen om ${timeStr} weer zichtbaar`;
  }
  if (diffDays > 1 && diffDays <= 7) {
    const dayName = DUTCH_DAYS[nextDate.getDay()];
    return isMidnight ? `${dayName} weer zichtbaar` : `${dayName} om ${timeStr} weer zichtbaar`;
  }
  if (chore.frequencyPeriod === 'month' && isMidnight && nextDate.getDate() === 1) {
    return 'Volgende maand weer zichtbaar';
  }

  const dateStr = nextDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  return isMidnight ? `${dateStr} weer zichtbaar` : `${dateStr} om ${timeStr} weer zichtbaar`;
};

const normalizeChores = (chores) => {
  if (!Array.isArray(chores)) return [];
  return chores.map((c) => ({
    ...c,
    taskType: c.taskType === 'individual' ? 'individual' : 'family',
    frequencyPeriod: c.frequencyPeriod || 'none',
    frequencyCount: Math.max(1, Number(c.frequencyCount) || 1),
    lastCompletedAt: c.lastCompletedAt || null,
    completedTimestamps: getChoreCompletions(c),
  }));
};

// Standaard startdata zodat het gezin de app direct kan testen
const getInitialState = () => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const endDateStr = nextWeek.toISOString().split('T')[0];

  return {
    members: [
      { id: 'm1', name: 'Mama', avatar: '🦸‍♀️', points: 45 },
      { id: 'm2', name: 'Papa', avatar: '🦸‍♂️', points: 40 },
      { id: 'm3', name: 'Emma', avatar: '🦄', points: 55 },
      { id: 'm4', name: 'Lucas', avatar: '🦁', points: 30 },
    ],
    chores: [
      { id: 'c1', title: 'Tafel dekken & afruimen', emoji: '🍽️', size: 'klein', points: 10, taskType: 'family', frequencyPeriod: 'none', frequencyCount: 1, lastCompletedAt: null, completedTimestamps: [] },
      { id: 'c2', title: 'Eigen bed opmaken', emoji: '🛏️', size: 'klein', points: 10, taskType: 'individual', frequencyPeriod: 'day', frequencyCount: 1, lastCompletedAt: null, completedTimestamps: [] },
      { id: 'c3', title: 'Vaatwasser uitruimen', emoji: '✨', size: 'middel', points: 20, taskType: 'family', frequencyPeriod: 'none', frequencyCount: 1, lastCompletedAt: null, completedTimestamps: [] },
      { id: 'c4', title: 'Woonkamer stofzuigen', emoji: '🧹', size: 'middel', points: 20, taskType: 'family', frequencyPeriod: 'week', frequencyCount: 2, lastCompletedAt: null, completedTimestamps: [] },
      { id: 'c5', title: 'Was opvouwen & opruimen', emoji: '🧺', size: 'middel', points: 20, taskType: 'family', frequencyPeriod: 'none', frequencyCount: 1, lastCompletedAt: null, completedTimestamps: [] },
      { id: 'c6', title: 'Badkamer schoonmaken', emoji: '🧽', size: 'groot', points: 35, taskType: 'family', frequencyPeriod: 'week', frequencyCount: 1, lastCompletedAt: null, completedTimestamps: [] },
      { id: 'c7', title: 'Auto wassen', emoji: '🚗', size: 'groot', points: 35, taskType: 'family', frequencyPeriod: 'month', frequencyCount: 1, lastCompletedAt: null, completedTimestamps: [] },
    ],
    reward: {
      title: 'Samen uit eten bij de pizzeria',
      emoji: '🍕',
      targetPoints: 200,
      endDate: endDateStr,
    },
    history: [
      { id: 'h1', choreId: 'c3', memberId: 'm3', memberName: 'Emma', memberAvatar: '🦄', choreTitle: 'Vaatwasser uitruimen', points: 20, timestamp: Date.now() - 3600000 * 2 },
      { id: 'h2', choreId: 'c5', memberId: 'm1', memberName: 'Mama', memberAvatar: '🦸‍♀️', choreTitle: 'Was opvouwen & opruimen', points: 20, timestamp: Date.now() - 3600000 * 5 },
      { id: 'h3', choreId: 'c1', memberId: 'm4', memberName: 'Lucas', memberAvatar: '🦁', choreTitle: 'Tafel dekken & afruimen', points: 10, timestamp: Date.now() - 3600000 * 8 },
    ],
    pastRewards: [
      { id: 'pr1', title: 'Grote spelletjesavond met snacks', emoji: '🎲', date: 'Vorige week', totalPoints: 165 }
    ]
  };
};

// ============================================================================
// HOOFDCOMPONENT
// ============================================================================

export default function App() {
  // App-data state (lokaal opgeslagen of gesynchroniseerd met Firebase)
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('klusjes_kampioen_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          chores: normalizeChores(parsed.chores),
        };
      }
      return getInitialState();
    } catch (e) {
      return getInitialState();
    }
  });

  // UI & Navigatie state
  const [activeTab, setActiveTab] = useState('chores'); // 'chores' | 'leaderboard' | 'reward' | 'settings'
  const [activeMemberId, setActiveMemberId] = useState(() => {
    try {
      const savedId = localStorage.getItem('klusjes_active_member_id');
      if (savedId && data.members.some((m) => m.id === savedId)) {
        return savedId;
      }
    } catch (e) {
      // Negeer localStorage-fouten
    }
    return data.members[0]?.id || 'm1';
  });
  const [toast, setToast] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCompletedChores, setShowCompletedChores] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('klusjes_sound_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  // Modals state
  const [showChoreModal, setShowChoreModal] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [confirmDeleteMember, setConfirmDeleteMember] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmChore, setConfirmChore] = useState(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberAvatar, setEditMemberAvatar] = useState('🐼');

  // Formulier state: Klusje toevoegen / bewerken
  const [choreTitleInput, setChoreTitleInput] = useState('');
  const [choreEmojiInput, setChoreEmojiInput] = useState('🧹');
  const [choreSizeInput, setChoreSizeInput] = useState('klein');
  const [choreTaskTypeInput, setChoreTaskTypeInput] = useState('family');
  const [choreFreqPeriodInput, setChoreFreqPeriodInput] = useState('none');
  const [choreFreqCountInput, setChoreFreqCountInput] = useState(1);

  // Formulier state: Nieuw gezinslid
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('🐼');

  // Formulier state: Beloning aanpassen
  const [editRewardTitle, setEditRewardTitle] = useState(data.reward.title);
  const [editRewardEmoji, setEditRewardEmoji] = useState(data.reward.emoji);
  const [editRewardTarget, setEditRewardTarget] = useState(data.reward.targetPoints);
  const [editRewardDate, setEditRewardDate] = useState(data.reward.endDate);

  // Firebase Synchronisatie state (via Realtime Database REST API)
  const [firebaseUrl, setFirebaseUrl] = useState(() => {
    try {
      return localStorage.getItem('klusjes_firebase_url') || '';
    } catch {
      return '';
    }
  });
  const [firebaseInput, setFirebaseInput] = useState(firebaseUrl);
  const [syncStatus, setSyncStatus] = useState(firebaseUrl ? 'connected' : 'local'); // 'local' | 'syncing' | 'connected' | 'error'

  // Ververs elke minuut de tijd zodat verlopen periodes/wachttijden vanzelf weer zichtbaar worden
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Zorg dat activeMemberId altijd geldig blijft
  useEffect(() => {
    if (data.members.length === 0) {
      if (activeMemberId !== null) setActiveMemberId(null);
    } else if (!data.members.find((m) => m.id === activeMemberId)) {
      setActiveMemberId(data.members[0].id);
    }
  }, [data.members, activeMemberId]);

  // Onthoud het laatst geselecteerde gezinslid op dit apparaat
  useEffect(() => {
    try {
      if (activeMemberId) {
        localStorage.setItem('klusjes_active_member_id', activeMemberId);
      } else {
        localStorage.removeItem('klusjes_active_member_id');
      }
    } catch (e) {
      console.error('Kon geselecteerd gezinslid niet opslaan:', e);
    }
  }, [activeMemberId]);

  // Sla wijzigingen lokaal op
  useEffect(() => {
    try {
      localStorage.setItem('klusjes_kampioen_data_v1', JSON.stringify(data));
    } catch (e) {
      console.error('Kon niet opslaan in localStorage:', e);
    }
  }, [data]);

  // Onthoud geluidsinstelling per apparaat
  useEffect(() => {
    try {
      localStorage.setItem('klusjes_sound_enabled', String(soundEnabled));
    } catch {
      // Negeer localStorage-fouten
    }
  }, [soundEnabled]);

  const triggerSound = useCallback(
    (type, size) => {
      if (soundEnabled) {
        playAppSound(type, size);
      }
    },
    [soundEnabled]
  );

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        playAppSound('chore', 'klein');
      }
      return next;
    });
  };

  // Hulpfunctie om melding (toast) te tonen
  const showToast = (message, emoji = '🎉') => {
    setToast({ message, emoji });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 2800);
  };

  // ============================================================================
  // FIREBASE SYNCHRONISATIE LOGICA
  // ============================================================================

  const getCleanFirebaseEndpoint = (url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    return `${trimmed}/gezin_klusjes.json`;
  };

  const pushToFirebase = useCallback(async (newData, customUrl = firebaseUrl) => {
    const endpoint = getCleanFirebaseEndpoint(customUrl);
    if (!endpoint) return;

    setSyncStatus('syncing');
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error('Firebase schrijffout');
      setSyncStatus('connected');
    } catch (err) {
      console.error('Firebase sync fout:', err);
      setSyncStatus('error');
    }
  }, [firebaseUrl]);

  const pullFromFirebase = useCallback(async (customUrl = firebaseUrl, silent = false) => {
    const endpoint = getCleanFirebaseEndpoint(customUrl);
    if (!endpoint) return;

    if (!silent) setSyncStatus('syncing');
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Firebase leesfout');
      const remoteData = await res.json();
      if (remoteData && typeof remoteData === 'object') {
        // Firebase laat lege arrays weg uit JSON; normaliseer ze zodat verwijderde items & timestamps kloppen
        const normalized = {
          members: Array.isArray(remoteData.members) ? remoteData.members : [],
          chores: normalizeChores(remoteData.chores),
          reward: remoteData.reward || getInitialState().reward,
          history: Array.isArray(remoteData.history) ? remoteData.history : [],
          pastRewards: Array.isArray(remoteData.pastRewards) ? remoteData.pastRewards : [],
        };
        setData(normalized);
        setEditRewardTitle(normalized.reward?.title || '');
        setEditRewardEmoji(normalized.reward?.emoji || DEFAULT_REWARD_EMOJI);
        setEditRewardTarget(normalized.reward?.targetPoints || 200);
        setEditRewardDate(normalized.reward?.endDate || '');
        if (!silent) showToast('Gegevens bijgewerkt uit Firebase!', '☁️');
      } else if (remoteData === null) {
        // Database is nog leeg, upload huidige lokale data
        await pushToFirebase(data, customUrl);
        if (!silent) showToast('Database gevuld met startgegevens!', '☁️');
      }
      setSyncStatus('connected');
    } catch (err) {
      console.error('Firebase ophaalfout:', err);
      setSyncStatus('error');
      if (!silent) showToast('Kon niet verbinden met Firebase', '⚠️');
    }
  }, [firebaseUrl, data, pushToFirebase]);

  // Periodiek ophalen als Firebase gekoppeld is (elke 15 seconden)
  useEffect(() => {
    if (!firebaseUrl) return;
    pullFromFirebase(firebaseUrl, true);
    const interval = setInterval(() => {
      pullFromFirebase(firebaseUrl, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [firebaseUrl]);

  // Centrale functie om data bij te werken + direct naar Firebase te sturen
  const updateData = (updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (firebaseUrl) {
        pushToFirebase(next);
      }
      return next;
    });
  };

  // ============================================================================
  // BEREKENINGEN
  // ============================================================================

  const nowDate = new Date(nowTick);
  const totalPoints = data.members.reduce((sum, m) => sum + (m.points || 0), 0);
  const targetPoints = Math.max(1, Number(data.reward.targetPoints) || 100);
  const progressPercent = Math.min(100, Math.round((totalPoints / targetPoints) * 100));
  const isGoalReached = totalPoints >= targetPoints;

  const activeMember = data.members.find((m) => m.id === activeMemberId) || data.members[0];

  // Splits klusjes in beschikbaar vs. tijdelijk verborgen (rekening houdend met spreiding, zondag-start en gezinstaak vs. individueel)
  const availableChores = data.chores.filter((c) => isChoreAvailable(c, activeMember?.id, nowDate));
  const completedPeriodChores = data.chores.filter((c) => !isChoreAvailable(c, activeMember?.id, nowDate));

  // Dagen over berekenen
  const getDaysRemaining = () => {
    if (!data.reward.endDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(data.reward.endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysRemaining = getDaysRemaining();

  // Gesorteerde ranglijst
  const sortedMembers = [...data.members].sort((a, b) => (b.points || 0) - (a.points || 0));

  // ============================================================================
  // ACTIES (KLUSJES, LEDEN, BELONING)
  // ============================================================================

  const openAddChoreModal = () => {
    setEditingChore(null);
    setChoreTitleInput('');
    setChoreEmojiInput('🧹');
    setChoreSizeInput('klein');
    setChoreTaskTypeInput('family');
    setChoreFreqPeriodInput('none');
    setChoreFreqCountInput(1);
    setShowChoreModal(true);
  };

  const openEditChoreModal = (chore) => {
    setEditingChore(chore);
    setChoreTitleInput(chore.title);
    setChoreEmojiInput(chore.emoji || '🧹');
    setChoreSizeInput(chore.size || 'klein');
    setChoreTaskTypeInput(chore.taskType === 'individual' ? 'individual' : 'family');
    setChoreFreqPeriodInput(chore.frequencyPeriod || 'none');
    setChoreFreqCountInput(Math.max(1, Number(chore.frequencyCount) || 1));
    setShowChoreModal(true);
  };

  const handleSaveChore = (e) => {
    e.preventDefault();
    if (!choreTitleInput.trim()) return;

    const cleanTaskType = choreTaskTypeInput === 'individual' ? 'individual' : 'family';
    const cleanPeriod = choreFreqPeriodInput || 'none';
    const cleanCount = cleanPeriod === 'none' ? 1 : Math.max(1, Math.min(20, Number(choreFreqCountInput) || 1));
    const points = (SIZE_CONFIG[choreSizeInput] || SIZE_CONFIG.klein).points;

    if (editingChore) {
      updateData((prev) => ({
        ...prev,
        chores: prev.chores.map((c) =>
          c.id === editingChore.id
            ? {
                ...c,
                title: choreTitleInput.trim(),
                emoji: choreEmojiInput,
                size: choreSizeInput,
                points,
                taskType: cleanTaskType,
                frequencyPeriod: cleanPeriod,
                frequencyCount: cleanCount,
              }
            : c
        ),
      }));
      showToast('Klusje bijgewerkt!', choreEmojiInput);
    } else {
      const newChore = {
        id: `c_${Date.now()}`,
        title: choreTitleInput.trim(),
        emoji: choreEmojiInput,
        size: choreSizeInput,
        points,
        taskType: cleanTaskType,
        frequencyPeriod: cleanPeriod,
        frequencyCount: cleanCount,
        lastCompletedAt: null,
        completedTimestamps: [],
      };

      updateData((prev) => ({
        ...prev,
        chores: [newChore, ...prev.chores],
      }));
      showToast('Nieuw klusje toegevoegd!', newChore.emoji);
    }

    setShowChoreModal(false);
    setEditingChore(null);
  };

  const handleRequestCompleteChore = (chore) => {
    if (!activeMember) {
      showToast('Voeg eerst een gezinslid toe!', '👨‍👩‍👧‍👦');
      setShowAddMember(true);
      return;
    }
    setConfirmChore(chore);
  };

  const handleCompleteChore = (chore) => {
    if (!activeMember || !chore) {
      showToast('Voeg eerst een gezinslid toe!', '👨‍👩‍👧‍👦');
      setShowAddMember(true);
      return;
    }

    const nowTs = Date.now();
    const wasGoalReached = totalPoints >= targetPoints;
    const newTotal = totalPoints + chore.points;

    updateData((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === activeMember.id ? { ...m, points: (m.points || 0) + chore.points } : m
      ),
      chores: prev.chores.map((c) => {
        if (c.id !== chore.id) return c;
        // Bewaar uitvoeringen van de afgelopen 35 dagen inclusief welk gezinslid het deed
        const cutoff = nowTs - 35 * 24 * 60 * 60 * 1000;
        const recentCompletions = [
          ...getChoreCompletions(c).filter((entry) => entry.ts >= cutoff),
          { ts: nowTs, memberId: activeMember.id },
        ];
        return {
          ...c,
          lastCompletedAt: nowTs,
          completedTimestamps: recentCompletions,
        };
      }),
      history: [
        {
          id: `h_${nowTs}`,
          choreId: chore.id,
          memberId: activeMember.id,
          memberName: activeMember.name,
          memberAvatar: activeMember.avatar,
          choreTitle: chore.title,
          points: chore.points,
          timestamp: nowTs,
        },
        ...(prev.history || []).slice(0, 29), // Bewaar laatste 30 activiteiten
      ],
    }));

    setNowTick(nowTs);
    setConfirmChore(null);
    showToast(`+${chore.points} punten voor ${activeMember.name}!`, chore.emoji);

    // Vier feest als het doel zojuist is behaald, anders vrolijk klusjes-geluidje!
    if (!wasGoalReached && newTotal >= targetPoints) {
      triggerSound('celebration');
      setShowCelebration(true);
    } else {
      triggerSound('chore', chore.size);
    }
  };

  const handleDeleteChore = (id) => {
    updateData((prev) => ({
      ...prev,
      chores: prev.chores.filter((c) => c.id !== id),
    }));
    showToast('Klusje verwijderd', '🗑️');
  };

  const handleUndoHistoryItem = (item) => {
    updateData((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === item.memberId
          ? { ...m, points: Math.max(0, (m.points || 0) - (item.points || 0)) }
          : m
      ),
      // Verwijder de uitvoeringstijd ook weer van het klusje zodat het direct weer zichtbaar wordt
      chores: prev.chores.map((c) => {
        const isMatch = item.choreId ? c.id === item.choreId : c.title === item.choreTitle;
        if (!isMatch) return c;
        const completions = getChoreCompletions(c);
        const updatedCompletions = [...completions];
        const exactIdx = updatedCompletions.findIndex(
          (entry) => entry.ts === item.timestamp && (!entry.memberId || entry.memberId === item.memberId)
        );
        if (exactIdx !== -1) {
          updatedCompletions.splice(exactIdx, 1);
        } else {
          // Fallback als het een ouder history-item zonder exacte match was
          const fallbackIdx = [...updatedCompletions]
            .reverse()
            .findIndex((entry) => !entry.memberId || entry.memberId === item.memberId);
          if (fallbackIdx !== -1) {
            updatedCompletions.splice(updatedCompletions.length - 1 - fallbackIdx, 1);
          }
        }
        const newLast =
          updatedCompletions.length > 0
            ? Math.max(...updatedCompletions.map((entry) => entry.ts))
            : null;
        return {
          ...c,
          lastCompletedAt: newLast,
          completedTimestamps: updatedCompletions,
        };
      }),
      history: (prev.history || []).filter((h) => h.id !== item.id),
    }));
    setNowTick(Date.now());
    triggerSound('undo');
    showToast(`${item.choreTitle} ongedaan gemaakt (-${item.points} pnt)`, '↩️');
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember = {
      id: `m_${Date.now()}`,
      name: newMemberName.trim(),
      avatar: newMemberAvatar,
      points: 0,
    };

    updateData((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }));

    setActiveMemberId(newMember.id);
    setNewMemberName('');
    setShowAddMember(false);
    showToast(`${newMember.name} doet nu mee!`, newMember.avatar);
  };

  const openEditMember = (member, e) => {
    if (e) e.stopPropagation();
    setEditingMember(member);
    setEditMemberName(member.name);
    setEditMemberAvatar(member.avatar);
    setConfirmDeleteMember(false);
  };

  const handleUpdateMember = (e) => {
    e.preventDefault();
    if (!editingMember || !editMemberName.trim()) return;

    const updatedName = editMemberName.trim();
    const updatedAvatar = editMemberAvatar;

    updateData((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === editingMember.id
          ? { ...m, name: updatedName, avatar: updatedAvatar }
          : m
      ),
      history: (prev.history || []).map((h) =>
        h.memberId === editingMember.id
          ? { ...h, memberName: updatedName, memberAvatar: updatedAvatar }
          : h
      ),
    }));

    setEditingMember(null);
    setConfirmDeleteMember(false);
    showToast(`${updatedName} bijgewerkt!`, updatedAvatar);
  };

  const handleDeleteMember = (id) => {
    const removed = data.members.find((m) => m.id === id);
    updateData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }));

    setEditingMember(null);
    setConfirmDeleteMember(false);
    showToast(`${removed?.name || 'Gezinslid'} verwijderd`, '🗑️');
  };

  const handleDeletePastReward = (id) => {
    updateData((prev) => ({
      ...prev,
      pastRewards: (prev.pastRewards || []).filter((pr) => pr.id !== id),
    }));
    showToast('Behaalde beloning verwijderd', '🗑️');
  };

  const handleSaveReward = (e) => {
    e.preventDefault();
    if (!editRewardTitle.trim()) return;

    const finalEmoji = editRewardEmoji.trim() || DEFAULT_REWARD_EMOJI;

    updateData((prev) => ({
      ...prev,
      reward: {
        title: editRewardTitle.trim(),
        emoji: finalEmoji,
        targetPoints: Math.max(10, Number(editRewardTarget) || 100),
        endDate: editRewardDate,
      },
    }));

    setEditRewardEmoji(finalEmoji);
    showToast('Beloning opgeslagen!', finalEmoji);
  };

  const handleClaimAndStartNewRound = () => {
    const todayStr = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    updateData((prev) => ({
      ...prev,
      members: prev.members.map((m) => ({ ...m, points: 0 })),
      history: [],
      pastRewards: isGoalReached
        ? [
            {
              id: `pr_${Date.now()}`,
              title: prev.reward.title,
              emoji: prev.reward.emoji,
              date: todayStr,
              totalPoints: totalPoints,
            },
            ...(prev.pastRewards || []),
          ]
        : prev.pastRewards || [],
      reward: {
        ...prev.reward,
        endDate: nextWeek.toISOString().split('T')[0],
      },
    }));

    setConfirmReset(false);
    setShowCelebration(false);
    showToast('Nieuwe ronde gestart! Succes allemaal!', '🚀');
  };

  const handleSaveFirebase = (e) => {
    e.preventDefault();
    const cleaned = firebaseInput.trim().replace(/\/+$/, '');
    try {
      localStorage.setItem('klusjes_firebase_url', cleaned);
    } catch {}
    setFirebaseUrl(cleaned);
    if (cleaned) {
      pullFromFirebase(cleaned, false);
    } else {
      setSyncStatus('local');
      showToast('Overgeschakeld naar lokale modus', '📱');
    }
  };

  // Tijdweergave voor geschiedenis
  const formatTimeAgo = (ts) => {
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'Zojuist';
    if (mins < 60) return `${mins} min geleden`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} uur geleden`;
    return `${Math.floor(hours / 24)} dagen geleden`;
  };

  // ============================================================================
  // RENDERING (Schermvullend & Responsive voor Portrait + Landscape)
  // ============================================================================

  return (
    <div className="h-[100dvh] w-full bg-slate-50 flex flex-col relative overflow-hidden font-sans text-slate-800">
      {/* Bovenste Statusbalk / Header (compact in landscape) */}
      <header
        className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white px-4 sm:px-6 pb-4 landscape:pb-3 rounded-b-3xl shadow-md z-10 shrink-0"
        style={{
          paddingTop: 'max(0.85rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* App Titel + Geluid & Sync Knoppen */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">KlusBazen</h1>
                <p className="text-[11px] text-indigo-100/90 font-medium mt-0.5">Samen klussen, samen vieren!</p>
              </div>
            </div>

            {/* Geluid & Firebase Sync Knoppen */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSound}
                className="flex items-center justify-center bg-white/15 hover:bg-white/25 transition p-1.5 rounded-full backdrop-blur-sm"
                title={soundEnabled ? 'Geluid uitzetten' : 'Geluid aanzetten'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-300" />
                ) : (
                  <VolumeX className="w-4 h-4 text-indigo-200/80" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition px-2.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
                title="Firebase synchronisatie status"
              >
                {syncStatus === 'connected' && <><Cloud className="w-3.5 h-3.5 text-emerald-300" /> <span>Live</span></>}
                {syncStatus === 'syncing' && <><RefreshCw className="w-3.5 h-3.5 text-amber-300 animate-spin" /> <span>Sync...</span></>}
                {syncStatus === 'error' && <><CloudOff className="w-3.5 h-3.5 text-rose-300" /> <span>Fout</span></>}
                {syncStatus === 'local' && <><Smartphone className="w-3.5 h-3.5 text-indigo-200" /> <span>Demo</span></>}
              </button>
            </div>
          </div>

          {/* Gezinsbeloning Voortgangskaart */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:flex-1 sm:max-w-md">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl sm:text-3xl bg-white/20 w-10 h-10 flex items-center justify-center rounded-xl shrink-0">
                  {data.reward.emoji || DEFAULT_REWARD_EMOJI}
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-indigo-100 font-semibold flex items-center gap-1">
                    <span>Gezinsdoel</span>
                    {daysRemaining !== null && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                        {daysRemaining > 0 ? `nog ${daysRemaining}d` : daysRemaining === 0 ? 'vandaag!' : 'verlopen'}
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-sm truncate">{data.reward.title}</h2>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-base sm:text-lg font-black text-amber-300 leading-none">
                  {totalPoints} <span className="text-xs font-semibold text-white/80">/ {targetPoints}</span>
                </div>
                <span className="text-[11px] text-indigo-100">{progressPercent}% behaald</span>
              </div>
            </div>

            {/* Voortgangsbalk */}
            <div className="w-full h-3 bg-black/25 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1 ${
                  isGoalReached
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400'
                }`}
                style={{ width: `${Math.max(6, progressPercent)}%` }}
              >
                {progressPercent >= 15 && <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />}
              </div>
            </div>

            {isGoalReached && (
              <button
                onClick={() => {
                  triggerSound('celebration');
                  setShowCelebration(true);
                }}
                className="mt-2 w-full bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs py-1.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition animate-pulse"
              >
                <Gift className="w-4 h-4" /> Doel behaald! Claim de beloning! 🎉
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Scrollbare Hoofdinhoud */}
      <main
        className="flex-1 overflow-y-auto py-4"
        style={{
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div className="max-w-4xl mx-auto space-y-5 pb-4">
          {/* ============================================================== */}
          {/* TAB 1: KLUSJES                                                 */}
          {/* ============================================================== */}
          {activeTab === 'chores' && (
            <>
              {/* Gezinslid Kiezer */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Wie doet het klusje?
                  </h3>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-full transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lid
                  </button>
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
                  {data.members.length === 0 ? (
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="w-full bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-4 text-xs font-bold text-indigo-600 flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" /> Voeg je eerste gezinslid toe
                    </button>
                  ) : (
                    data.members.map((member) => {
                      const isSelected = member.id === activeMember?.id;
                      return (
                        <div
                          key={member.id}
                          onClick={() => setActiveMemberId(member.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setActiveMemberId(member.id);
                          }}
                          className={`relative flex flex-col items-center p-2.5 pt-3 rounded-2xl min-w-[84px] border-2 transition shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 shadow-sm scale-[1.02]'
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => openEditMember(member, e)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white/80 transition"
                            title={`${member.name} bewerken of verwijderen`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <span className="text-2xl mb-1">{member.avatar}</span>
                          <span className={`text-xs font-bold truncate max-w-[70px] ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                            {member.name}
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full mt-0.5">
                            {member.points || 0} pnt
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Klusjeslijst (2 kolommen in landscape / bredere schermen) */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Kies een klusje voor {activeMember?.name || '...'}
                  </h3>
                  <button
                    onClick={openAddChoreModal}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nieuw klusje
                  </button>
                </div>

                {data.chores.length === 0 ? (
                  <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 text-slate-400 text-sm">
                    Nog geen klusjes! Voeg je eerste klusje toe.
                  </div>
                ) : availableChores.length === 0 ? (
                  <div className="bg-white rounded-3xl p-6 text-center border border-emerald-100 space-y-1">
                    <div className="text-3xl">🎉</div>
                    <p className="text-sm font-bold text-slate-700">
                      Alle klusjes voor {activeMember?.name || 'nu'} zijn even gedaan!
                    </p>
                    <p className="text-xs text-slate-400">Ze verschijnen vanzelf weer zodra ze weer aan de beurt zijn.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {availableChores.map((chore) => {
                      const sizeCfg = SIZE_CONFIG[chore.size] || SIZE_CONFIG.klein;
                      const freqLabel = getFrequencyLabel(chore);
                      const isIndividual = chore.taskType === 'individual';
                      const doneCount = getCompletionsInCurrentPeriod(chore, activeMember?.id, nowDate);
                      const maxCount = Math.max(1, Number(chore.frequencyCount) || 1);

                      return (
                        <div
                          key={chore.id}
                          className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0">
                              {chore.emoji}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-800 truncate">{chore.title}</h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sizeCfg.color}`}>
                                  {sizeCfg.label}
                                </span>
                                <span className="text-xs font-extrabold text-amber-600 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> +{chore.points}
                                </span>
                                {freqLabel && (
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                                      isIndividual
                                        ? 'text-violet-700 bg-violet-50'
                                        : 'text-indigo-600 bg-indigo-50'
                                    }`}
                                    title={isIndividual ? 'Individuele taak (per gezinslid)' : 'Gezinstaak (samen)'}
                                  >
                                    {isIndividual ? <User className="w-2.5 h-2.5" /> : <Users className="w-2.5 h-2.5" />}
                                    {maxCount > 1 ? `${doneCount}/${maxCount} • ${freqLabel}` : freqLabel}
                                    {isIndividual ? ' • p.p.' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditChoreModal(chore)}
                              className="p-1.5 text-slate-300 hover:text-indigo-600 transition rounded-xl"
                              title="Klusje bewerken"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChore(chore.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-500 transition rounded-xl"
                              title="Klusje verwijderen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRequestCompleteChore(chore)}
                              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs px-3 py-2.5 rounded-xl flex items-center gap-1 shadow-sm transition"
                            >
                              <Check className="w-4 h-4 stroke-[3]" /> Gedaan
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Ingeklapt overzicht van klusjes die tijdelijk op pauze staan of al gedaan zijn */}
                {completedPeriodChores.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCompletedChores((v) => !v)}
                      className="w-full flex items-center justify-between bg-slate-100/80 hover:bg-slate-200/70 text-slate-500 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Al gedaan / even op pauze ({completedPeriodChores.length})
                      </span>
                      {showCompletedChores ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showCompletedChores && (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {completedPeriodChores.map((chore) => {
                          const isIndividual = chore.taskType === 'individual';
                          const nextLabel = getNextAvailableLabel(chore, activeMember?.id, nowDate);
                          return (
                            <div
                              key={chore.id}
                              className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/70 flex items-center justify-between gap-2 opacity-80"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shrink-0 grayscale">
                                  {chore.emoji}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-slate-600 truncate line-through">{chore.title}</h4>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    <span className="truncate">
                                      {nextLabel}
                                      {isIndividual && activeMember ? ` (${activeMember.name})` : ''}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openEditChoreModal(chore)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 transition rounded-xl"
                                  title="Klusje bewerken"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteChore(chore.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-xl"
                                  title="Klusje verwijderen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 2: RANGLIJST & GESCHIEDENIS                                */}
          {/* ============================================================== */}
          {activeTab === 'leaderboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Ranglijst */}
              <section className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" /> Gezinsranglijst
                </h3>

                {sortedMembers.length === 0 ? (
                  <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 text-slate-400 text-sm">
                    Nog geen gezinsleden toegevoegd.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sortedMembers.map((member, idx) => {
                      const share = totalPoints > 0 ? Math.round(((member.points || 0) / totalPoints) * 100) : 0;
                      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                      return (
                        <div
                          key={member.id}
                          className={`bg-white rounded-2xl p-3.5 shadow-sm border flex items-center gap-3 ${
                            idx === 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'
                          }`}
                        >
                          <div className="w-8 text-center font-black text-lg shrink-0">{medal}</div>
                          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0">
                            {member.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm text-slate-800 truncate">{member.name}</span>
                              <span className="text-sm font-black text-indigo-600 shrink-0">
                                {member.points || 0} pnt
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                                  style={{ width: `${share}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-400 w-9 text-right">{share}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Laatst gedane klusjes (met ongedaan maken knop) */}
              <section className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Laatst gedane klusjes
                </h3>

                {(!data.history || data.history.length === 0) ? (
                  <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 text-slate-400 text-sm">
                    Nog geen klusjes afgevinkt in deze ronde.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
                    {data.history.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl bg-slate-50 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                            {item.memberAvatar}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {item.memberName} <span className="font-normal text-slate-500">deed</span> {item.choreTitle}
                            </p>
                            <p className="text-[11px] text-slate-400">{formatTimeAgo(item.timestamp)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            +{item.points}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUndoHistoryItem(item)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Klusje ongedaan maken"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: BELONING & TROFEEËNKAST                                 */}
          {/* ============================================================== */}
          {activeTab === 'reward' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Beloning instellen */}
              <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-indigo-500" /> Gezinsbeloning instellen
                </h3>

                {/* Snelle ideeën */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {REWARD_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setEditRewardTitle(preset.title);
                        setEditRewardEmoji(preset.emoji);
                        setEditRewardTarget(preset.target);
                      }}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1.5 rounded-xl shrink-0 transition"
                    >
                      {preset.emoji} {preset.title.split(' ').slice(0, 3).join(' ')}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSaveReward} className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-16 shrink-0">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Icoon</label>
                      <input
                        type="text"
                        value={editRewardEmoji}
                        onChange={(e) => setEditRewardEmoji(e.target.value)}
                        className="w-full text-center text-xl bg-slate-50 border border-slate-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Beloning</label>
                      <input
                        type="text"
                        required
                        value={editRewardTitle}
                        onChange={(e) => setEditRewardTitle(e.target.value)}
                        placeholder="Bijv. Samen uit eten"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Doelpunten</label>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        required
                        value={editRewardTarget}
                        onChange={(e) => setEditRewardTarget(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Einddatum
                      </label>
                      <input
                        type="date"
                        value={editRewardDate}
                        onChange={(e) => setEditRewardDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition"
                  >
                    Beloning opslaan
                  </button>
                </form>

                {/* Nieuwe ronde starten */}
                <div className="pt-3 border-t border-slate-100">
                  {!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Nieuwe ronde starten (punten op 0)
                    </button>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2">
                      <p className="text-xs font-bold text-amber-900 text-center">
                        {isGoalReached
                          ? 'Beloning bijschrijven in de trofeeënkast en alle punten op 0 zetten?'
                          : 'Alle punten terugzetten naar 0 voor een nieuwe ronde?'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl"
                        >
                          Annuleren
                        </button>
                        <button
                          type="button"
                          onClick={handleClaimAndStartNewRound}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-xl"
                        >
                          Ja, starten!
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Trofeeënkast / Behaalde beloningen */}
              <section className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Behaalde beloningen
                </h3>

                {(!data.pastRewards || data.pastRewards.length === 0) ? (
                  <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 text-slate-400 text-sm">
                    Nog geen behaalde beloningen in de trofeeënkast.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {data.pastRewards.map((pr) => (
                      <div
                        key={pr.id}
                        className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl bg-amber-50 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                            {pr.emoji || DEFAULT_REWARD_EMOJI}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-800 truncate">{pr.title}</h4>
                            <p className="text-xs text-slate-400">
                              {pr.date} • <span className="font-bold text-amber-600">{pr.totalPoints} pnt</span>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePastReward(pr.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition shrink-0"
                          title="Behaalde beloning verwijderen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: APP & FIREBASE SYNC                                     */}
          {/* ============================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-indigo-500" /> Firebase Live Synchronisatie
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      syncStatus === 'connected'
                        ? 'bg-emerald-50 text-emerald-700'
                        : syncStatus === 'error'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {syncStatus === 'connected' && 'Verbonden'}
                    {syncStatus === 'syncing' && 'Synchroniseren...'}
                    {syncStatus === 'error' && 'Verbindingsfout'}
                    {syncStatus === 'local' && 'Lokale modus'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Vul hier de URL van jullie gratis <strong>Firebase Realtime Database</strong> in zodat alle telefoons in het gezin automatisch dezelfde klusjes, gezinsleden en punten zien.
                </p>

                <form onSubmit={handleSaveFirebase} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Database URL</label>
                    <input
                      type="url"
                      value={firebaseInput}
                      onChange={(e) => setFirebaseInput(e.target.value)}
                      placeholder="https://jouw-project-default-rtdb.europe-west1.firebasedatabase.app"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition"
                    >
                      Koppelen & Synchroniseren
                    </button>
                    {firebaseUrl && (
                      <button
                        type="button"
                        onClick={() => pullFromFirebase(firebaseUrl, false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition"
                        title="Nu ophalen uit Firebase"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {/* Geluidseffecten instellen & testen */}
              <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-500" /> Geluidseffecten
                  </h3>
                  <button
                    type="button"
                    onClick={toggleSound}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition ${
                      soundEnabled
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {soundEnabled ? 'Aan 🔊' : 'Uit 🔇'}
                  </button>
                </div>

                <p className="text-xs text-slate-500">
                  Speel vrolijke geluidjes af bij het afvinken van klusjes en een feestelijke fanfare zodra de beloning binnen is.
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => playAppSound('chore', 'groot')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
                  >
                    🔔 Test klusje
                  </button>
                  <button
                    type="button"
                    onClick={() => playAppSound('celebration')}
                    className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs py-2.5 rounded-xl transition"
                  >
                    🎉 Test fanfare
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Zwevende Toast Melding */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap">
          <span className="text-base">{toast.emoji}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Onderste Navigatiebalk (met safe-area padding voor Android-knoppen) */}
      <nav
        className="bg-white border-t border-slate-200 px-2 pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-20 shrink-0"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
        }}
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1">
          {[
            { id: 'chores', label: 'Klusjes', icon: CheckSquare },
            { id: 'leaderboard', label: 'Ranglijst', icon: Trophy },
            { id: 'reward', label: 'Beloning', icon: Gift },
            { id: 'settings', label: 'App & Sync', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 rounded-2xl transition ${
                  isActive ? 'text-indigo-600 bg-indigo-50/80' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] font-bold mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ============================================================== */}
      {/* MODAL: KLUSJE BEVESTIGEN                                       */}
      {/* ============================================================== */}
      {confirmChore && activeMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800">Klusje bevestigen</h3>
              <button
                type="button"
                onClick={() => setConfirmChore(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              {/* Gezinslid */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shrink-0">
                  {activeMember.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gezinslid</p>
                  <p className="font-extrabold text-base text-slate-800 truncate">{activeMember.name}</p>
                </div>
              </div>

              <div className="border-t border-slate-200/70" />

              {/* Klusje & Punten */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl shrink-0">{confirmChore.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Klusje</p>
                    <p className="font-bold text-sm text-slate-800 truncate">{confirmChore.title}</p>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-800 font-black text-sm px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> +{confirmChore.points} pnt
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmChore(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm py-3 rounded-xl transition"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={() => handleCompleteChore(confirmChore)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Bevestigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KLUSJE TOEVOEGEN / BEWERKEN                             */}
      {/* ============================================================== */}
      {showChoreModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingChore ? 'Klusje bewerken' : 'Nieuw klusje toevoegen'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowChoreModal(false);
                  setEditingChore(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChore} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Naam van het klusje</label>
                <input
                  type="text"
                  required
                  value={choreTitleInput}
                  onChange={(e) => setChoreTitleInput(e.target.value)}
                  placeholder="Bijv. Konijnen WC verschonen of Eigen bed opmaken"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Kies een icoontje</label>
                <div className="flex flex-wrap gap-2">
                  {CHORE_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setChoreEmojiInput(em)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition ${
                        choreEmojiInput === em ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Hoe groot is het klusje?</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(SIZE_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setChoreSizeInput(key)}
                      className={`p-2.5 rounded-xl border-2 text-center transition ${
                        choreSizeInput === key
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800">{cfg.label}</div>
                      <div className="text-xs font-extrabold text-amber-600">+{cfg.points} pnt</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequentie & Type taak */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Hoe vaak mag dit klusje?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setChoreFreqPeriodInput(opt.id)}
                        className={`py-2 px-2 rounded-xl border-2 text-xs font-bold transition ${
                          choreFreqPeriodInput === opt.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200/70 bg-white text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {choreFreqPeriodInput !== 'none' && (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-600">
                        Aantal keer per {FREQUENCY_OPTIONS.find((o) => o.id === choreFreqPeriodInput)?.shortLabel}:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setChoreFreqCountInput((c) => Math.max(1, Number(c) - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={choreFreqCountInput}
                          onChange={(e) => setChoreFreqCountInput(Math.max(1, Number(e.target.value) || 1))}
                          className="w-12 text-center bg-white border border-slate-200 rounded-lg py-1 text-sm font-extrabold text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setChoreFreqCountInput((c) => Math.min(20, Number(c) + 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Gezinstaak vs. Individuele taak */}
                    <div className="pt-1 border-t border-slate-200/70">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Voor wie geldt deze limiet?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setChoreTaskTypeInput('family')}
                          className={`p-2.5 rounded-xl border-2 text-left transition flex items-start gap-2 ${
                            choreTaskTypeInput === 'family'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                              : 'border-slate-200/70 bg-white text-slate-600'
                          }`}
                        >
                          <Users className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold leading-tight">Gezinstaak</div>
                            <div className="text-[10px] opacity-80 mt-0.5">Klaar voor iedereen</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setChoreTaskTypeInput('individual')}
                          className={`p-2.5 rounded-xl border-2 text-left transition flex items-start gap-2 ${
                            choreTaskTypeInput === 'individual'
                              ? 'border-violet-600 bg-violet-50 text-violet-800'
                              : 'border-slate-200/70 bg-white text-slate-600'
                          }`}
                        >
                          <User className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold leading-tight">Individueel</div>
                            <div className="text-[10px] opacity-80 mt-0.5">Per gezinslid apart</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <p className="text-[11px] text-slate-400">
                  {choreFreqPeriodInput === 'none'
                    ? 'Dit klusje blijft altijd zichtbaar en mag zo vaak als nodig gedaan worden.'
                    : `${
                        choreTaskTypeInput === 'individual'
                          ? 'Ieder gezinslid mag'
                          : 'Het gezin mag'
                      } dit klusje ${choreFreqCountInput}x per ${
                        FREQUENCY_OPTIONS.find((o) => o.id === choreFreqPeriodInput)?.shortLabel
                      } doen${
                        choreFreqCountInput > 1
                          ? ' (automatisch verspreid over de periode)'
                          : ''
                      }.${choreFreqPeriodInput === 'week' ? ' Een nieuwe week start op zondag.' : ''}`}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl shadow-md"
              >
                {editingChore ? 'Wijzigingen opslaan' : 'Klusje toevoegen'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NIEUW GEZINSLID TOEVOEGEN                               */}
      {/* ============================================================== */}
      {showAddMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800">Gezinslid toevoegen</h3>
              <button onClick={() => setShowAddMember(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Naam</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Bijv. Sophie of Max"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Kies een leuke avatar</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setNewMemberAvatar(av)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition ${
                        newMemberAvatar === av ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl shadow-md"
              >
                Toevoegen aan gezin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: GEZINSLID BEWERKEN / VERWIJDEREN                        */}
      {/* ============================================================== */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800">Gezinslid bewerken</h3>
              <button
                onClick={() => {
                  setEditingMember(null);
                  setConfirmDeleteMember(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Naam</label>
                <input
                  type="text"
                  required
                  value={editMemberName}
                  onChange={(e) => setEditMemberName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Avatar</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditMemberAvatar(av)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition ${
                        editMemberAvatar === av ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-xl shadow-md"
              >
                Wijzigingen opslaan
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100">
              {!confirmDeleteMember ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteMember(true)}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4" /> {editingMember.name} verwijderen
                </button>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 space-y-2">
                  <p className="text-xs font-bold text-rose-800 text-center">
                    Weet je zeker dat je {editingMember.name} wilt verwijderen?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteMember(false)}
                      className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl"
                    >
                      Annuleren
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(editingMember.id)}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-xl"
                    >
                      Ja, verwijderen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: FEEST! GEZINSDOEL BEHAALD                               */}
      {/* ============================================================== */}
      {showCelebration && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md z-50 flex items-center justify-center p-5">
          <div className="bg-white w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="text-6xl animate-bounce">{data.reward.emoji || DEFAULT_REWARD_EMOJI}</div>
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full mb-2">
                🎉 DOEL BEHAALD! 🎉
              </span>
              <h2 className="text-xl font-black text-slate-900">Geweldig gedaan samen!</h2>
              <p className="text-sm text-slate-600 mt-1">
                Jullie hebben <strong>{totalPoints} punten</strong> verzameld en daarmee de beloning verdiend:
              </p>
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 font-extrabold text-amber-900 text-base">
                {data.reward.title}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleClaimAndStartNewRound}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3 rounded-xl shadow-md transition"
              >
                Beloning bijschrijven & Nieuwe ronde starten 🚀
              </button>
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full text-slate-500 hover:text-slate-700 font-bold text-xs py-2"
              >
                Sluiten (nog even door sparen)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}