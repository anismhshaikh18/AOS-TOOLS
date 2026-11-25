import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  Plus,
  Search,
  Pin,
  Archive,
  Trash2,
  RotateCcw,
  Palette,
  CheckSquare,
  AlignLeft,
  Tag,
  Copy,
  Check,
  Download,
  Cloud,
  CloudOff,
  RefreshCw,
  LayoutGrid,
  List,
  X,
  StickyNote,
  Sparkles,
  CopyPlus,
  ArchiveRestore,
} from 'lucide-react';
import {
  auth,
  db,
  OperationType,
  handleFirestoreError,
  isFirestorePermissionError,
} from '../firebase';
import { useAuthSecurity } from '../context/AuthSecurityContext';

export type NoteColorKey =
  | 'default'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'rose'
  | 'purple'
  | 'teal'
  | 'orange';

export interface NoteChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface GoogleNoteItem {
  id: string;
  title: string;
  body: string;
  noteType: 'text' | 'checklist';
  checklist: NoteChecklistItem[];
  color: NoteColorKey;
  labels: string[];
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  createdAt: number;
  updatedAt: number;
}

// Preserve original localStorage key for 100% backward compatibility with existing notes
export const NOTES_STORAGE_KEY = 'aos_utility_notes_v1';

const VALID_COLORS: NoteColorKey[] = [
  'default',
  'yellow',
  'blue',
  'green',
  'rose',
  'purple',
  'teal',
  'orange',
];

const DEFAULT_SUGGESTED_LABELS = ['Personal', 'Counter', 'Work', 'Important'];

interface ColorThemeStyle {
  key: NoteColorKey;
  name: string;
  dot: string;
  card: string;
  modal: string;
}

const NOTE_COLOR_THEMES: Record<NoteColorKey, ColorThemeStyle> = {
  default: {
    key: 'default',
    name: 'Default',
    dot: 'bg-white dark:bg-[#10253f] border-slate-300 dark:border-sky-400/50',
    card: 'bg-white dark:bg-[#0e223d] border-slate-200/80 dark:border-sky-400/20',
    modal: 'bg-white dark:bg-[#0B192C]',
  },
  yellow: {
    key: 'yellow',
    name: 'Keep Yellow',
    dot: 'bg-[#fef08a] border-amber-400',
    card: 'bg-[#fef9c3]/90 dark:bg-[#423410]/85 border-amber-300/70 dark:border-amber-500/35',
    modal: 'bg-[#fefce8] dark:bg-[#2c230c]',
  },
  orange: {
    key: 'orange',
    name: 'Peach',
    dot: 'bg-[#fed7aa] border-orange-400',
    card: 'bg-[#ffedd5]/90 dark:bg-[#432312]/85 border-orange-300/70 dark:border-orange-500/35',
    modal: 'bg-[#fff7ed] dark:bg-[#2e180d]',
  },
  green: {
    key: 'green',
    name: 'Mint',
    dot: 'bg-[#bbf7d0] border-emerald-400',
    card: 'bg-[#dcfce7]/90 dark:bg-[#113726]/85 border-emerald-300/70 dark:border-emerald-500/35',
    modal: 'bg-[#f0fdf4] dark:bg-[#0d271c]',
  },
  teal: {
    key: 'teal',
    name: 'Teal',
    dot: 'bg-[#99f6e4] border-teal-400',
    card: 'bg-[#ccfbf1]/90 dark:bg-[#0f3636]/85 border-teal-300/70 dark:border-teal-500/35',
    modal: 'bg-[#f0fdfa] dark:bg-[#0b2727]',
  },
  blue: {
    key: 'blue',
    name: 'Sky',
    dot: 'bg-[#bfdbfe] border-sky-400',
    card: 'bg-[#dbeafe]/90 dark:bg-[#112c4d]/85 border-sky-300/70 dark:border-sky-500/35',
    modal: 'bg-[#eff6ff] dark:bg-[#0c2038]',
  },
  purple: {
    key: 'purple',
    name: 'Lavender',
    dot: 'bg-[#e9d5ff] border-purple-400',
    card: 'bg-[#f3e8ff]/90 dark:bg-[#2d1c47]/85 border-purple-300/70 dark:border-purple-500/35',
    modal: 'bg-[#faf5ff] dark:bg-[#201433]',
  },
  rose: {
    key: 'rose',
    name: 'Coral',
    dot: 'bg-[#fecdd3] border-rose-400',
    card: 'bg-[#ffe4e6]/90 dark:bg-[#451725]/85 border-rose-300/70 dark:border-rose-500/35',
    modal: 'bg-[#fff1f2] dark:bg-[#2e1019]',
  },
};

const STARTER_NOTE_ID = 'welcome-note';

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 64);
  return cleaned.length > 0
    ? cleaned
    : `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeItemId(prefix = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function sanitizeChecklist(raw: unknown): NoteChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 100)
    .filter((i): i is Record<string, unknown> => Boolean(i && typeof i === 'object'))
    .map((i, idx) => ({
      id:
        typeof i.id === 'string' && i.id.trim().length > 0
          ? sanitizeId(i.id)
          : `chk-${Date.now()}-${idx}`,
      text: typeof i.text === 'string' ? i.text.slice(0, 300) : '',
      done: Boolean(i.done),
    }));
}

function sanitizeLabels(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim().slice(0, 32);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= 10) break;
  }
  return out;
}

function normalizeNote(raw: unknown): GoogleNoteItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const now = Date.now();
  const id =
    typeof r.id === 'string' && r.id.trim().length > 0 ? sanitizeId(r.id) : makeItemId('note');
  const title = typeof r.title === 'string' ? r.title.slice(0, 200) : '';
  const body = typeof r.body === 'string' ? r.body.slice(0, 15000) : '';
  const noteType = r.noteType === 'checklist' ? 'checklist' : 'text';
  const checklist = sanitizeChecklist(r.checklist);
  const color: NoteColorKey = VALID_COLORS.includes(r.color as NoteColorKey)
    ? (r.color as NoteColorKey)
    : 'default';
  const labels = sanitizeLabels(r.labels);
  const pinned = Boolean(r.pinned);
  const archived = Boolean(r.archived);
  const trashed = Boolean(r.trashed);

  const createdAt =
    typeof r.clientCreatedAt === 'number' && r.clientCreatedAt >= 0
      ? r.clientCreatedAt
      : typeof r.createdAt === 'number' && r.createdAt >= 0
      ? r.createdAt
      : r.createdAt instanceof Timestamp
      ? r.createdAt.toMillis()
      : now;

  const updatedAt =
    typeof r.clientUpdatedAt === 'number' && r.clientUpdatedAt >= 0
      ? r.clientUpdatedAt
      : typeof r.updatedAt === 'number' && r.updatedAt >= 0
      ? r.updatedAt
      : r.updatedAt instanceof Timestamp
      ? r.updatedAt.toMillis()
      : createdAt;

  return {
    id,
    title,
    body,
    noteType,
    checklist,
    color,
    labels,
    pinned,
    archived,
    trashed,
    createdAt,
    updatedAt,
  };
}

function loadLocalNotes(storageKey: string): GoogleNoteItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = parsed
          .map((item) => normalizeNote(item))
          .filter((item): item is GoogleNoteItem => Boolean(item));
        if (normalized.length > 0) return normalized;
      }
    }
  } catch {
    // Fallback
  }
  return [
    {
      id: STARTER_NOTE_ID,
      title: 'Welcome to AOS Google Notes',
      body: 'Write quick counter notes, checklists, color-coded reminders, and labels. Sign in with Google to sync your notes automatically across phone & desktop — just like Google Keep!',
      noteType: 'text',
      checklist: [],
      color: 'yellow',
      labels: ['Personal'],
      pinned: true,
      archived: false,
      trashed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
}

function saveLocalNotes(storageKey: string, notes: GoogleNoteItem[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  } catch {
    // Ignore storage quota issues
  }
}

const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

export const GoogleNotesApp: React.FC = () => {
  const { user, authReady, isSigningIn, signInWithGoogle } = useAuthSecurity();
  const isCloudEligible = Boolean(
    authReady && user && user.emailVerified && auth.currentUser?.uid === user.uid
  );

  const userStorageKey = user?.uid ? `${NOTES_STORAGE_KEY}::${user.uid}` : NOTES_STORAGE_KEY;

  const [notes, setNotes] = useState<GoogleNoteItem[]>(() => loadLocalNotes(NOTES_STORAGE_KEY));
  const [activeFolder, setActiveFolder] = useState<'notes' | 'archive' | 'trash'>('notes');
  const [selectedLabel, setSelectedLabel] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync status
  const [syncState, setSyncState] = useState<'local' | 'syncing' | 'synced' | 'offline'>('local');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const cloudNoteIdsRef = useRef<Set<string>>(new Set());
  const didInitialMergeRef = useRef<string | null>(null);

  // Google Keep "Take a note..." composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<'text' | 'checklist'>('text');
  const [composerTitle, setComposerTitle] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [composerChecklist, setComposerChecklist] = useState<NoteChecklistItem[]>([]);
  const [composerNewCheckText, setComposerNewCheckText] = useState('');
  const [composerColor, setComposerColor] = useState<NoteColorKey>('default');
  const [composerPinned, setComposerPinned] = useState(false);
  const [composerLabels, setComposerLabels] = useState<string[]>([]);
  const [composerPaletteOpen, setComposerPaletteOpen] = useState(false);

  // Active editor modal
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [modalNewCheckText, setModalNewCheckText] = useState('');
  const [modalCustomLabel, setModalCustomLabel] = useState('');
  const [openCardPaletteId, setOpenCardPaletteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    | { type: 'delete-forever'; noteId: string; title: string }
    | { type: 'empty-trash'; count: number }
    | null
  >(null);

  const editDebounceRef = useRef<number | null>(null);
  const notesRef = useRef<GoogleNoteItem[]>(notes);
  notesRef.current = notes;

  // Persist locally whenever notes change (always keep backward-compatible key synced too)
  useEffect(() => {
    saveLocalNotes(userStorageKey, notes);
    if (userStorageKey !== NOTES_STORAGE_KEY) {
      saveLocalNotes(NOTES_STORAGE_KEY, notes);
    }
  }, [notes, userStorageKey]);

  // Firestore Write Helper (strictly matches firebase-blueprint.json & firestore.rules)
  const syncNoteToCloud = useCallback(
    async (note: GoogleNoteItem, forceCreate = false): Promise<boolean> => {
      if (!isCloudEligible || !user?.uid) return false;
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncState('offline');
        setSyncMessage('Offline — saved locally, will sync when online.');
        return false;
      }

      const uid = user.uid;
      const safeId = sanitizeId(note.id);
      const notePath = `users/${uid}/notes/${safeId}`;
      const noteRef = doc(db, 'users', uid, 'notes', safeId);

      const safeTitle = note.title.slice(0, 200);
      const safeBody = note.body.slice(0, 15000);
      const safeType: 'text' | 'checklist' = note.noteType === 'checklist' ? 'checklist' : 'text';
      const safeChecklist = sanitizeChecklist(note.checklist);
      const safeColor: NoteColorKey = VALID_COLORS.includes(note.color) ? note.color : 'default';
      const safeLabels = sanitizeLabels(note.labels);
      const safeCreatedAt = Math.max(0, Math.floor(note.createdAt || Date.now()));
      const safeUpdatedAt = Math.max(0, Math.floor(note.updatedAt || Date.now()));

      const existsInCloud = !forceCreate && cloudNoteIdsRef.current.has(safeId);
      setSyncState('syncing');

      try {
        if (existsInCloud) {
          await updateDoc(noteRef, {
            title: safeTitle,
            body: safeBody,
            noteType: safeType,
            checklist: safeChecklist,
            color: safeColor,
            labels: safeLabels,
            pinned: Boolean(note.pinned),
            archived: Boolean(note.archived),
            trashed: Boolean(note.trashed),
            clientUpdatedAt: safeUpdatedAt,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(noteRef, {
            id: safeId,
            ownerId: uid,
            title: safeTitle,
            body: safeBody,
            noteType: safeType,
            checklist: safeChecklist,
            color: safeColor,
            labels: safeLabels,
            pinned: Boolean(note.pinned),
            archived: Boolean(note.archived),
            trashed: Boolean(note.trashed),
            clientCreatedAt: safeCreatedAt,
            clientUpdatedAt: safeUpdatedAt,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          cloudNoteIdsRef.current.add(safeId);
        }
        setSyncState('synced');
        setLastSyncedAt(Date.now());
        setSyncMessage('');
        return true;
      } catch (err) {
        handleFirestoreError(
          err,
          existsInCloud ? OperationType.UPDATE : OperationType.CREATE,
          notePath
        );
        if (isFirestorePermissionError(err)) {
          setSyncState('local');
          setSyncMessage('Saved locally (verify Google sign-in for cloud sync).');
        } else {
          setSyncState('offline');
          setSyncMessage('Saved locally — cloud sync will retry automatically.');
        }
        return false;
      }
    },
    [isCloudEligible, user?.uid]
  );

  const deleteNoteFromCloud = useCallback(
    async (noteId: string): Promise<boolean> => {
      if (!isCloudEligible || !user?.uid) return false;
      const uid = user.uid;
      const safeId = sanitizeId(noteId);
      const notePath = `users/${uid}/notes/${safeId}`;
      try {
        setSyncState('syncing');
        await deleteDoc(doc(db, 'users', uid, 'notes', safeId));
        cloudNoteIdsRef.current.delete(safeId);
        setSyncState('synced');
        setLastSyncedAt(Date.now());
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, notePath);
        setSyncState('offline');
        return false;
      }
    },
    [isCloudEligible, user?.uid]
  );

  // Real-Time Google Cloud Firestore Subscription (when Google user is signed in)
  useEffect(() => {
    if (!isCloudEligible || !user?.uid) {
      cloudNoteIdsRef.current.clear();
      didInitialMergeRef.current = null;
      setSyncState('local');
      setSyncMessage('');
      return;
    }

    const uid = user.uid;
    const notesColPath = `users/${uid}/notes`;
    const notesQuery = query(
      collection(db, 'users', uid, 'notes'),
      where('ownerId', '==', uid)
    );

    setSyncState('syncing');
    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const remoteList: GoogleNoteItem[] = [];
        const remoteIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const normalized = normalizeNote({ id: docSnap.id, ...docSnap.data() });
          if (normalized) {
            remoteList.push(normalized);
            remoteIds.add(normalized.id);
          }
        });

        cloudNoteIdsRef.current = remoteIds;

        // First sync after Google login: merge any pre-existing local notes into Google Cloud seamlessly
        if (didInitialMergeRef.current !== uid) {
          didInitialMergeRef.current = uid;
          const localCandidates = loadLocalNotes(NOTES_STORAGE_KEY);
          const unsyncedLocals = localCandidates.filter((localNote) => {
            if (remoteIds.has(localNote.id)) return false;
            // Skip untouched starter note if user already has cloud notes
            if (localNote.id === STARTER_NOTE_ID && remoteList.length > 0) return false;
            return true;
          });

          if (unsyncedLocals.length > 0) {
            const merged = [...remoteList, ...unsyncedLocals];
            setNotes(merged);
            void Promise.all(unsyncedLocals.map((n) => syncNoteToCloud(n, true)));
            setSyncState('synced');
            setLastSyncedAt(Date.now());
            return;
          }
        }

        setNotes(remoteList);
        setSyncState('synced');
        setLastSyncedAt(Date.now());
        setSyncMessage('');
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, notesColPath);
        setSyncState('offline');
        setSyncMessage('Showing locally saved notes. Cloud sync will reconnect automatically.');
      }
    );

    return () => unsubscribe();
  }, [isCloudEligible, user?.uid, syncNoteToCloud]);

  // Listen for browser online/offline transitions to re-sync
  useEffect(() => {
    const handleOnline = () => {
      if (isCloudEligible) {
        setSyncState('syncing');
        void Promise.all(notesRef.current.map((n) => syncNoteToCloud(n)));
      }
    };
    const handleOffline = () => {
      if (isCloudEligible) setSyncState('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isCloudEligible, syncNoteToCloud]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (editDebounceRef.current) {
        window.clearTimeout(editDebounceRef.current);
      }
    };
  }, []);

  // All unique labels across non-trashed notes + default suggestions
  const availableLabels = useMemo(() => {
    const set = new Set<string>(DEFAULT_SUGGESTED_LABELS);
    for (const n of notes) {
      if (!n.trashed) {
        for (const lbl of n.labels) set.add(lbl);
      }
    }
    return Array.from(set);
  }, [notes]);

  const folderCounts = useMemo(() => {
    let active = 0;
    let archived = 0;
    let trashed = 0;
    for (const n of notes) {
      if (n.trashed) trashed++;
      else if (n.archived) archived++;
      else active++;
    }
    return { active, archived, trashed };
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (activeFolder === 'trash') return n.trashed;
        if (activeFolder === 'archive') return !n.trashed && n.archived;
        return !n.trashed && !n.archived;
      })
      .filter((n) => {
        if (selectedLabel === 'ALL') return true;
        return n.labels.some((l) => l.toLowerCase() === selectedLabel.toLowerCase());
      })
      .filter((n) => {
        if (!q) return true;
        const inChecklist = n.checklist.some((c) => c.text.toLowerCase().includes(q));
        const inLabels = n.labels.some((l) => l.toLowerCase().includes(q));
        return (
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          inChecklist ||
          inLabels
        );
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, activeFolder, selectedLabel, searchTerm]);

  const pinnedNotes = useMemo(
    () => (activeFolder === 'notes' ? filteredNotes.filter((n) => n.pinned) : []),
    [filteredNotes, activeFolder]
  );

  const otherNotes = useMemo(
    () => (activeFolder === 'notes' ? filteredNotes.filter((n) => !n.pinned) : filteredNotes),
    [filteredNotes, activeFolder]
  );

  const editingNote = useMemo(
    () => (editingNoteId ? notes.find((n) => n.id === editingNoteId) || null : null),
    [notes, editingNoteId]
  );

  // Reset composer cleanly
  const resetComposer = () => {
    setComposerOpen(false);
    setComposerType('text');
    setComposerTitle('');
    setComposerBody('');
    setComposerChecklist([]);
    setComposerNewCheckText('');
    setComposerColor('default');
    setComposerPinned(false);
    setComposerLabels([]);
    setComposerPaletteOpen(false);
  };

  const handleSaveComposer = () => {
    const pendingItems = [...composerChecklist];
    if (composerType === 'checklist' && composerNewCheckText.trim()) {
      pendingItems.push({
        id: makeItemId('chk'),
        text: composerNewCheckText.trim().slice(0, 300),
        done: false,
      });
    }

    const hasContent =
      composerTitle.trim().length > 0 ||
      composerBody.trim().length > 0 ||
      pendingItems.length > 0;

    if (!hasContent) {
      resetComposer();
      return;
    }

    const now = Date.now();
    const created: GoogleNoteItem = {
      id: makeItemId('note'),
      title: composerTitle.trim().slice(0, 200),
      body: composerBody.slice(0, 15000),
      noteType: composerType,
      checklist: pendingItems.slice(0, 100),
      color: composerColor,
      labels: composerLabels.slice(0, 10),
      pinned: composerPinned,
      archived: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    };

    setNotes((prev) => [created, ...prev]);
    if (activeFolder !== 'notes') setActiveFolder('notes');
    void syncNoteToCloud(created, true);
    resetComposer();
  };

  const mutateNote = useCallback(
    (
      noteId: string,
      updater: (prev: GoogleNoteItem) => GoogleNoteItem,
      options?: { debounceCloud?: boolean }
    ) => {
      let updatedSnapshot: GoogleNoteItem | null = null;
      setNotes((prev) =>
        prev.map((item) => {
          if (item.id !== noteId) return item;
          const next = updater(item);
          updatedSnapshot = { ...next, updatedAt: Date.now() };
          return updatedSnapshot;
        })
      );

      if (!updatedSnapshot) return;
      const toSync = updatedSnapshot;

      if (options?.debounceCloud) {
        if (editDebounceRef.current) window.clearTimeout(editDebounceRef.current);
        editDebounceRef.current = window.setTimeout(() => {
          void syncNoteToCloud(toSync);
        }, 450);
      } else {
        if (editDebounceRef.current) {
          window.clearTimeout(editDebounceRef.current);
          editDebounceRef.current = null;
        }
        void syncNoteToCloud(toSync);
      }
    },
    [syncNoteToCloud]
  );

  const handleDuplicateNote = (source: GoogleNoteItem) => {
    const now = Date.now();
    const copy: GoogleNoteItem = {
      ...source,
      id: makeItemId('note'),
      title: source.title ? `${source.title} (Copy)`.slice(0, 200) : 'Untitled Copy',
      pinned: false,
      archived: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [copy, ...prev]);
    void syncNoteToCloud(copy, true);
  };

  const handleDeleteForever = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (editingNoteId === noteId) setEditingNoteId(null);
    void deleteNoteFromCloud(noteId);
    setConfirmAction(null);
  };

  const handleEmptyTrash = () => {
    const trashedIds = notes.filter((n) => n.trashed).map((n) => n.id);
    setNotes((prev) => prev.filter((n) => !n.trashed));
    if (editingNoteId && trashedIds.includes(editingNoteId)) {
      setEditingNoteId(null);
    }
    void Promise.all(trashedIds.map((id) => deleteNoteFromCloud(id)));
    setConfirmAction(null);
  };

  const formatNoteAsPlainText = (note: GoogleNoteItem): string => {
    const lines: string[] = [];
    if (note.title.trim()) lines.push(note.title.trim());
    if (note.noteType === 'checklist') {
      for (const item of note.checklist) {
        lines.push(`${item.done ? '[x]' : '[ ]'} ${item.text}`);
      }
    } else if (note.body.trim()) {
      lines.push(note.body.trim());
    }
    return lines.join('\n');
  };

  const handleCopyNote = async (note: GoogleNoteItem) => {
    try {
      await navigator.clipboard.writeText(formatNoteAsPlainText(note));
      setCopiedId(note.id);
      window.setTimeout(() => setCopiedId((cur) => (cur === note.id ? null : cur)), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleExportTxt = (note: GoogleNoteItem) => {
    const blob = new Blob([formatNoteAsPlainText(note)], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = (note.title || 'aos-google-note')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 32);
    link.download = `${slug || 'aos-google-note'}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleManualSync = async () => {
    if (!isCloudEligible) return;
    setSyncState('syncing');
    await Promise.all(notesRef.current.map((n) => syncNoteToCloud(n)));
    setSyncState('synced');
    setLastSyncedAt(Date.now());
  };

  const toggleNoteMode = (note: GoogleNoteItem) => {
    if (note.noteType === 'text') {
      const converted: NoteChecklistItem[] = note.body
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 100)
        .map((text, idx) => ({
          id: `chk-${Date.now()}-${idx}`,
          text: text.slice(0, 300),
          done: false,
        }));
      mutateNote(note.id, (n) => ({
        ...n,
        noteType: 'checklist',
        checklist: converted.length > 0 ? converted : n.checklist,
      }));
    } else {
      const bodyText = note.checklist.map((c) => c.text).join('\n').slice(0, 15000);
      mutateNote(note.id, (n) => ({
        ...n,
        noteType: 'text',
        body: bodyText || n.body,
      }));
    }
  };

  const renderNoteCard = (note: GoogleNoteItem) => {
    const theme = NOTE_COLOR_THEMES[note.color] || NOTE_COLOR_THEMES.default;
    const isPaletteOpen = openCardPaletteId === note.id;

    return (
      <article
        key={note.id}
        className={`group relative rounded-[20px] border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between gap-3 ${theme.card}`}
      >
        {/* Top Row: Title + Pin */}
        <div
          onClick={() => {
            setOpenCardPaletteId(null);
            setEditingNoteId(note.id);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpenCardPaletteId(null);
              setEditingNoteId(note.id);
            }
          }}
          className="cursor-pointer space-y-2.5 flex-1 text-left focus:outline-none"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm sm:text-[15px] font-extrabold text-slate-900 dark:text-white leading-snug break-words">
              {note.title || (
                <span className="text-slate-400 dark:text-slate-400 font-semibold italic">
                  Untitled note
                </span>
              )}
            </h3>
            {!note.trashed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  mutateNote(note.id, (n) => ({
                    ...n,
                    pinned: !n.pinned,
                    archived: false,
                  }));
                }}
                aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                title={note.pinned ? 'Unpin note' : 'Pin note'}
                className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                  note.pinned
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Note Body or Inline Interactive Checklist */}
          {note.noteType === 'checklist' ? (
            <div className="space-y-1.5">
              {note.checklist.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Empty checklist...
                </p>
              ) : (
                note.checklist.slice(0, 6).map((chk) => (
                  <div
                    key={chk.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      mutateNote(note.id, (n) => ({
                        ...n,
                        checklist: n.checklist.map((item) =>
                          item.id === chk.id ? { ...item, done: !item.done } : item
                        ),
                      }));
                    }}
                    className="flex items-start gap-2 text-xs sm:text-[13px] cursor-pointer py-0.5"
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                        chk.done
                          ? 'bg-[#0284c7] border-[#0284c7] text-white'
                          : 'border-slate-400 dark:border-slate-400 bg-white/60 dark:bg-black/20'
                      }`}
                    >
                      {chk.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span
                      className={`break-words leading-snug ${
                        chk.done
                          ? 'line-through text-slate-400 dark:text-slate-400'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {chk.text}
                    </span>
                  </div>
                ))
              )}
              {note.checklist.length > 6 && (
                <p className="text-[11px] font-semibold text-slate-500 dark:text-sky-200/75 pt-0.5">
                  +{note.checklist.length - 6} more items
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 whitespace-pre-wrap line-clamp-6 leading-relaxed break-words">
              {note.body || 'Empty note — tap to write...'}
            </p>
          )}

          {/* Labels */}
          {note.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {note.labels.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/6 dark:bg-white/10 text-slate-700 dark:text-slate-200"
                >
                  <Tag className="w-2.5 h-2.5 opacity-70" />
                  <span>{lbl}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Card Quick Toolbar */}
        <div className="pt-2 border-t border-black/6 dark:border-white/10 flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-300/75">
            {new Date(note.updatedAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
            })}
          </span>

          <div className="flex items-center gap-0.5 relative">
            {!note.trashed ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpenCardPaletteId(isPaletteOpen ? null : note.id)}
                  aria-label="Change note color"
                  title="Background color"
                  className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopyNote(note)}
                  aria-label="Copy note"
                  title="Copy note"
                  className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  {copiedId === note.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDuplicateNote(note)}
                  aria-label="Make a copy"
                  title="Make a copy"
                  className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <CopyPlus className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    mutateNote(note.id, (n) => ({
                      ...n,
                      archived: !n.archived,
                      pinned: false,
                    }))
                  }
                  aria-label={note.archived ? 'Unarchive note' : 'Archive note'}
                  title={note.archived ? 'Unarchive note' : 'Archive note'}
                  className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  {note.archived ? (
                    <ArchiveRestore className="w-3.5 h-3.5" />
                  ) : (
                    <Archive className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    mutateNote(note.id, (n) => ({
                      ...n,
                      trashed: true,
                      pinned: false,
                      archived: false,
                    }))
                  }
                  aria-label="Move note to trash"
                  title="Move to Trash"
                  className="p-2 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    mutateNote(note.id, (n) => ({
                      ...n,
                      trashed: false,
                    }))
                  }
                  aria-label="Restore note from trash"
                  title="Restore note"
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-bold text-[#0284c7] dark:text-sky-300 hover:bg-sky-500/15 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      type: 'delete-forever',
                      noteId: note.id,
                      title: note.title || 'Untitled note',
                    })
                  }
                  aria-label="Delete note permanently"
                  title="Delete permanently"
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}

            {/* Inline Color Swatch Popover */}
            {isPaletteOpen && (
              <div className="absolute right-0 bottom-full mb-2 p-2 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-400/35 shadow-xl flex items-center gap-1.5 z-30">
                {VALID_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    aria-label={`Set color ${NOTE_COLOR_THEMES[col].name}`}
                    title={NOTE_COLOR_THEMES[col].name}
                    onClick={() => {
                      mutateNote(note.id, (n) => ({ ...n, color: col }));
                      setOpenCardPaletteId(null);
                    }}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center ${NOTE_COLOR_THEMES[col].dot} ${
                      note.color === col ? 'ring-2 ring-[#0284c7] scale-110' : ''
                    }`}
                  >
                    {note.color === col && (
                      <Check className="w-3 h-3 text-slate-900 dark:text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Google Account Cloud Sync Banner (Google Keep-style Account Integration) */}
      <div className="p-4 sm:p-5 rounded-[20px] liquid-glass-sub flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {isCloudEligible && user ? (
          <>
            <div className="flex items-center gap-3 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0284c7] shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {(user.displayName || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {user.displayName}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      syncState === 'synced'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : syncState === 'syncing'
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                        : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {syncState === 'offline' ? (
                      <CloudOff className="w-3 h-3 shrink-0" />
                    ) : (
                      <Cloud className="w-3 h-3 shrink-0" />
                    )}
                    <span>
                      {syncState === 'synced'
                        ? 'Google Cloud Synced'
                        : syncState === 'syncing'
                        ? 'Syncing...'
                        : 'Offline (Local Saved)'}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-sky-200/75 truncate mt-0.5">
                  {syncMessage ||
                    `${user.email} · Real-time sync across phone & desktop${
                      lastSyncedAt
                        ? ` · Synced ${new Date(lastSyncedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : ''
                    }`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleManualSync()}
              disabled={syncState === 'syncing'}
              className="aos-btn-soft px-4 py-2 min-h-[42px] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#0284c7] dark:text-sky-300 ${
                  syncState === 'syncing' ? 'animate-spin' : ''
                }`}
              />
              <span>Sync Now</span>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400/35 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                <StickyNote className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Google Cloud Notes Sync</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-sky-200/80 leading-relaxed mt-0.5">
                  Sign in with your Google account to auto-sync your color notes, checklists &amp;
                  labels across all devices — just like Google Keep.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSigningIn}
              onClick={() => void signInWithGoogle()}
              className="px-4 py-2.5 min-h-[44px] rounded-full bg-white hover:bg-slate-50 dark:bg-white dark:hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm hover:shadow-md text-xs font-extrabold inline-flex items-center justify-center gap-2.5 cursor-pointer transition-all shrink-0 disabled:opacity-60"
            >
              <GoogleGIcon className="w-4 h-4 shrink-0" />
              <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          </>
        )}
      </div>

      {/* 2. Google Keep "Take a note..." Quick Capture Bar */}
      {activeFolder === 'notes' && (
        <div
          className={`rounded-[20px] border transition-all shadow-md ${
            NOTE_COLOR_THEMES[composerColor].card
          }`}
        >
          {!composerOpen ? (
            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
              <button
                type="button"
                onClick={() => {
                  setComposerType('text');
                  setComposerOpen(true);
                }}
                className="flex-1 text-left py-2 text-sm font-medium text-slate-500 dark:text-sky-200/75 cursor-text"
              >
                Take a note...
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setComposerType('checklist');
                    setComposerOpen(true);
                  }}
                  aria-label="New checklist note"
                  title="New list"
                  className="p-2.5 min-w-[42px] min-h-[42px] rounded-full text-slate-600 dark:text-sky-200 hover:bg-black/6 dark:hover:bg-white/10 inline-flex items-center justify-center cursor-pointer transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComposerType('text');
                    setComposerColor('yellow');
                    setComposerOpen(true);
                  }}
                  aria-label="New yellow note"
                  title="Quick Yellow Note"
                  className="p-2.5 min-w-[42px] min-h-[42px] rounded-full text-amber-600 dark:text-amber-300 hover:bg-amber-500/15 inline-flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Palette className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  maxLength={200}
                  value={composerTitle}
                  onChange={(e) => setComposerTitle(e.target.value)}
                  placeholder="Title"
                  className="flex-1 bg-transparent text-base font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none border-none shadow-none px-0 py-1"
                />
                <button
                  type="button"
                  onClick={() => setComposerPinned((v) => !v)}
                  aria-label={composerPinned ? 'Unpin new note' : 'Pin new note'}
                  title={composerPinned ? 'Pinned' : 'Pin note'}
                  className={`p-2 rounded-full cursor-pointer transition-colors ${
                    composerPinned
                      ? 'bg-[#0284c7] text-white'
                      : 'text-slate-500 hover:bg-black/6 dark:hover:bg-white/10'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>

              {composerType === 'text' ? (
                <textarea
                  rows={3}
                  maxLength={15000}
                  value={composerBody}
                  onChange={(e) => setComposerBody(e.target.value)}
                  placeholder="Take a note..."
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed border-none shadow-none px-0"
                />
              ) : (
                <div className="space-y-2">
                  {composerChecklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setComposerChecklist((prev) =>
                            prev.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c))
                          )
                        }
                        aria-label="Toggle checklist item"
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                          item.done
                            ? 'bg-[#0284c7] border-[#0284c7] text-white'
                            : 'border-slate-400 bg-white/70 dark:bg-black/20'
                        }`}
                      >
                        {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <input
                        type="text"
                        maxLength={300}
                        value={item.text}
                        onChange={(e) =>
                          setComposerChecklist((prev) =>
                            prev.map((c) =>
                              c.id === item.id ? { ...c, text: e.target.value } : c
                            )
                          )
                        }
                        className={`flex-1 bg-transparent text-sm focus:outline-none border-none shadow-none px-1 py-0.5 ${
                          item.done
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setComposerChecklist((prev) => prev.filter((c) => c.id !== item.id))
                        }
                        aria-label="Remove item"
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      maxLength={300}
                      value={composerNewCheckText}
                      onChange={(e) => setComposerNewCheckText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && composerNewCheckText.trim()) {
                          e.preventDefault();
                          setComposerChecklist((prev) => [
                            ...prev,
                            {
                              id: makeItemId('chk'),
                              text: composerNewCheckText.trim().slice(0, 300),
                              done: false,
                            },
                          ]);
                          setComposerNewCheckText('');
                        }
                      }}
                      placeholder="List item (press Enter to add)..."
                      className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none border-none shadow-none px-1 py-1"
                    />
                  </div>
                </div>
              )}

              {/* Composer Quick Labels */}
              <div className="flex flex-wrap items-center gap-1.5">
                {availableLabels.map((lbl) => {
                  const active = composerLabels.includes(lbl);
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() =>
                        setComposerLabels((prev) =>
                          active ? prev.filter((l) => l !== lbl) : [...prev, lbl].slice(0, 10)
                        )
                      }
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#0284c7] text-white'
                          : 'bg-black/6 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-black/10'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      <span>{lbl}</span>
                    </button>
                  );
                })}
              </div>

              {/* Composer Footer Actions */}
              <div className="pt-2 border-t border-black/8 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 relative">
                  <button
                    type="button"
                    onClick={() => setComposerType((t) => (t === 'text' ? 'checklist' : 'text'))}
                    title={composerType === 'text' ? 'Switch to checklist' : 'Switch to text'}
                    aria-label="Toggle text or checklist mode"
                    className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer"
                  >
                    {composerType === 'text' ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <AlignLeft className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setComposerPaletteOpen((v) => !v)}
                    title="Background color"
                    aria-label="Choose note color"
                    className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer"
                  >
                    <Palette className="w-4 h-4" />
                  </button>

                  {composerPaletteOpen && (
                    <div className="flex items-center gap-1.5 ml-1 flex-wrap">
                      {VALID_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setComposerColor(col)}
                          aria-label={NOTE_COLOR_THEMES[col].name}
                          title={NOTE_COLOR_THEMES[col].name}
                          className={`w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center ${NOTE_COLOR_THEMES[col].dot} ${
                            composerColor === col ? 'ring-2 ring-[#0284c7] scale-110' : ''
                          }`}
                        >
                          {composerColor === col && (
                            <Check className="w-3 h-3 text-slate-900 dark:text-white stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetComposer}
                    className="aos-btn-soft px-4 py-1.5 min-h-[38px] text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveComposer}
                    className="aos-btn-primary px-5 py-1.5 min-h-[38px] text-xs font-bold cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Folders (Notes / Archive / Trash) + Search + View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="aos-segmented-track aos-track-multi rounded-2xl p-1 inline-flex flex-wrap items-center gap-1 self-start">
          {(
            [
              { id: 'notes', label: 'Notes', count: folderCounts.active, icon: StickyNote },
              { id: 'archive', label: 'Archive', count: folderCounts.archived, icon: Archive },
              { id: 'trash', label: 'Trash', count: folderCounts.trashed, icon: Trash2 },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeFolder === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFolder(tab.id)}
                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                  active ? 'aos-btn-soft-active' : 'aos-btn-soft-tab'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-80 font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-1 md:max-w-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes, checklists, labels..."
              aria-label="Search notes"
              className="w-full min-h-[42px] pl-10 pr-8 rounded-full liquid-glass-sub text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/40"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'grid' ? 'list' : 'grid'))}
            aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            title={viewMode === 'grid' ? 'List view' : 'Grid view'}
            className="aos-btn-icon w-11 h-11 cursor-pointer shrink-0"
          >
            {viewMode === 'grid' ? (
              <List className="w-4 h-4 text-slate-700 dark:text-sky-200" />
            ) : (
              <LayoutGrid className="w-4 h-4 text-slate-700 dark:text-sky-200" />
            )}
          </button>
        </div>
      </div>

      {/* Label Filter Chips */}
      {activeFolder !== 'trash' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedLabel('ALL')}
            className={`px-3.5 py-1.5 min-h-[36px] text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
              selectedLabel === 'ALL' ? 'aos-btn-soft-active' : 'aos-btn-soft'
            }`}
          >
            All Labels
          </button>
          {availableLabels.map((lbl) => (
            <button
              key={lbl}
              type="button"
              onClick={() => setSelectedLabel((cur) => (cur === lbl ? 'ALL' : lbl))}
              className={`px-3.5 py-1.5 min-h-[36px] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                selectedLabel === lbl ? 'aos-btn-soft-active' : 'aos-btn-soft'
              }`}
            >
              <Tag className="w-3 h-3 opacity-75" />
              <span>{lbl}</span>
            </button>
          ))}
        </div>
      )}

      {/* Trash Banner */}
      {activeFolder === 'trash' && folderCounts.trashed > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-rose-800 dark:text-rose-200">
            Notes in Trash can be restored or deleted permanently.
          </span>
          <button
            type="button"
            onClick={() =>
              setConfirmAction({ type: 'empty-trash', count: folderCounts.trashed })
            }
            className="px-3.5 py-1.5 min-h-[36px] rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
          >
            Empty Trash
          </button>
        </div>
      )}

      {/* 4. Notes Board (Pinned & Others) */}
      {filteredNotes.length === 0 ? (
        <div className="p-10 rounded-[20px] liquid-glass-sub text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-[#0284c7] dark:text-sky-300 flex items-center justify-center mx-auto">
            <StickyNote className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {searchTerm
              ? `No notes match "${searchTerm}".`
              : activeFolder === 'archive'
              ? 'Your archived notes will appear here.'
              : activeFolder === 'trash'
              ? 'Trash is empty.'
              : 'No notes yet. Tap "Take a note..." above to create one!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pinnedNotes.length > 0 && (
            <div className="space-y-2.5">
              <div className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-sky-300/80">
                Pinned ({pinnedNotes.length})
              </div>
              <div
                className={
                  viewMode === 'list'
                    ? 'space-y-3 max-w-2xl mx-auto'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start'
                }
              >
                {pinnedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}

          {otherNotes.length > 0 && (
            <div className="space-y-2.5">
              {pinnedNotes.length > 0 && (
                <div className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-sky-300/80">
                  Others ({otherNotes.length})
                </div>
              )}
              <div
                className={
                  viewMode === 'list'
                    ? 'space-y-3 max-w-2xl mx-auto'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start'
                }
              >
                {otherNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Google Keep Full Note Editor Modal */}
      {editingNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-sm"
          onClick={() => setEditingNoteId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit Note"
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl max-h-[88vh] flex flex-col rounded-[24px] border border-slate-200/80 dark:border-sky-400/30 shadow-2xl overflow-hidden ${
              (NOTE_COLOR_THEMES[editingNote.color] || NOTE_COLOR_THEMES.default).modal
            }`}
          >
            {/* Modal Header */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-2">
              <input
                type="text"
                maxLength={200}
                value={editingNote.title}
                onChange={(e) =>
                  mutateNote(
                    editingNote.id,
                    (n) => ({ ...n, title: e.target.value }),
                    { debounceCloud: true }
                  )
                }
                placeholder="Note title..."
                className="flex-1 bg-transparent text-lg font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none border-none shadow-none px-0"
              />
              <div className="flex items-center gap-1 shrink-0">
                {!editingNote.trashed && (
                  <button
                    type="button"
                    onClick={() =>
                      mutateNote(editingNote.id, (n) => ({ ...n, pinned: !n.pinned }))
                    }
                    aria-label={editingNote.pinned ? 'Unpin note' : 'Pin note'}
                    className={`p-2 rounded-full cursor-pointer ${
                      editingNote.pinned
                        ? 'bg-[#0284c7] text-white'
                        : 'text-slate-500 hover:bg-black/8 dark:hover:bg-white/10'
                    }`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingNoteId(null)}
                  aria-label="Close note editor"
                  className="p-2 rounded-full text-slate-500 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="px-5 py-3 overflow-y-auto space-y-4 flex-1">
              {editingNote.noteType === 'text' ? (
                <textarea
                  rows={9}
                  maxLength={15000}
                  value={editingNote.body}
                  onChange={(e) =>
                    mutateNote(
                      editingNote.id,
                      (n) => ({ ...n, body: e.target.value }),
                      { debounceCloud: true }
                    )
                  }
                  placeholder="Write your note here..."
                  className="w-full bg-transparent text-sm sm:text-[15px] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none leading-relaxed border-none shadow-none px-0 resize-none"
                />
              ) : (
                <div className="space-y-2">
                  {editingNote.checklist.map((chk) => (
                    <div key={chk.id} className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          mutateNote(editingNote.id, (n) => ({
                            ...n,
                            checklist: n.checklist.map((c) =>
                              c.id === chk.id ? { ...c, done: !c.done } : c
                            ),
                          }))
                        }
                        aria-label="Toggle item"
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                          chk.done
                            ? 'bg-[#0284c7] border-[#0284c7] text-white'
                            : 'border-slate-400 bg-white/70 dark:bg-black/20'
                        }`}
                      >
                        {chk.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <input
                        type="text"
                        maxLength={300}
                        value={chk.text}
                        onChange={(e) =>
                          mutateNote(
                            editingNote.id,
                            (n) => ({
                              ...n,
                              checklist: n.checklist.map((c) =>
                                c.id === chk.id ? { ...c, text: e.target.value } : c
                              ),
                            }),
                            { debounceCloud: true }
                          )
                        }
                        className={`flex-1 bg-transparent text-sm focus:outline-none border-none shadow-none px-1 py-0.5 ${
                          chk.done
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          mutateNote(editingNote.id, (n) => ({
                            ...n,
                            checklist: n.checklist.filter((c) => c.id !== chk.id),
                          }))
                        }
                        aria-label="Remove item"
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-2 border-t border-black/8 dark:border-white/10">
                    <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      maxLength={300}
                      value={modalNewCheckText}
                      onChange={(e) => setModalNewCheckText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && modalNewCheckText.trim()) {
                          e.preventDefault();
                          const nextItem: NoteChecklistItem = {
                            id: makeItemId('chk'),
                            text: modalNewCheckText.trim().slice(0, 300),
                            done: false,
                          };
                          mutateNote(editingNote.id, (n) => ({
                            ...n,
                            checklist: [...n.checklist, nextItem].slice(0, 100),
                          }));
                          setModalNewCheckText('');
                        }
                      }}
                      placeholder="Add list item and press Enter..."
                      className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none border-none shadow-none px-1 py-1"
                    />
                  </div>
                </div>
              )}

              {/* Color Swatches */}
              <div className="space-y-1.5 pt-2 border-t border-black/8 dark:border-white/10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Color Theme
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {VALID_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => mutateNote(editingNote.id, (n) => ({ ...n, color: col }))}
                      aria-label={NOTE_COLOR_THEMES[col].name}
                      title={NOTE_COLOR_THEMES[col].name}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${NOTE_COLOR_THEMES[col].dot} ${
                        editingNote.color === col ? 'ring-2 ring-[#0284c7] scale-110' : ''
                      }`}
                    >
                      {editingNote.color === col && (
                        <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Labels Manager */}
              <div className="space-y-2 pt-2 border-t border-black/8 dark:border-white/10">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Labels
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {availableLabels.map((lbl) => {
                    const active = editingNote.labels.includes(lbl);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() =>
                          mutateNote(editingNote.id, (n) => ({
                            ...n,
                            labels: active
                              ? n.labels.filter((l) => l !== lbl)
                              : [...n.labels, lbl].slice(0, 10),
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                          active
                            ? 'bg-[#0284c7] text-white'
                            : 'bg-black/6 dark:bg-white/10 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{lbl}</span>
                      </button>
                    );
                  })}
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      maxLength={32}
                      value={modalCustomLabel}
                      onChange={(e) => setModalCustomLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && modalCustomLabel.trim()) {
                          e.preventDefault();
                          const clean = modalCustomLabel.trim().slice(0, 32);
                          mutateNote(editingNote.id, (n) => ({
                            ...n,
                            labels: sanitizeLabels([...n.labels, clean]),
                          }));
                          setModalCustomLabel('');
                        }
                      }}
                      placeholder="+ Custom label"
                      className="w-28 px-2.5 py-1 rounded-full text-xs bg-black/5 dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none border border-transparent focus:border-[#0284c7]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Toolbar */}
            <div className="px-5 py-3.5 border-t border-black/8 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 bg-black/3 dark:bg-black/20">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleNoteMode(editingNote)}
                  title={
                    editingNote.noteType === 'text'
                      ? 'Convert to Checklist'
                      : 'Convert to Text Note'
                  }
                  className="px-3 py-1.5 min-h-[38px] rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {editingNote.noteType === 'text' ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Checkboxes</span>
                    </>
                  ) : (
                    <>
                      <AlignLeft className="w-3.5 h-3.5" />
                      <span>Text Mode</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopyNote(editingNote)}
                  className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer"
                  aria-label="Copy note"
                  title="Copy"
                >
                  {copiedId === editingNote.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleExportTxt(editingNote)}
                  className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer"
                  aria-label="Export note as .txt"
                  title="Export .txt"
                >
                  <Download className="w-4 h-4" />
                </button>

                {!editingNote.trashed && (
                  <button
                    type="button"
                    onClick={() => {
                      mutateNote(editingNote.id, (n) => ({
                        ...n,
                        archived: !n.archived,
                        pinned: false,
                      }));
                      setEditingNoteId(null);
                    }}
                    className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:bg-black/8 dark:hover:bg-white/10 cursor-pointer"
                    aria-label={editingNote.archived ? 'Unarchive' : 'Archive'}
                    title={editingNote.archived ? 'Unarchive' : 'Archive'}
                  >
                    {editingNote.archived ? (
                      <ArchiveRestore className="w-4 h-4" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (editingNote.trashed) {
                      setConfirmAction({
                        type: 'delete-forever',
                        noteId: editingNote.id,
                        title: editingNote.title || 'Untitled note',
                      });
                    } else {
                      mutateNote(editingNote.id, (n) => ({
                        ...n,
                        trashed: true,
                        pinned: false,
                        archived: false,
                      }));
                      setEditingNoteId(null);
                    }
                  }}
                  className="p-2 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                  aria-label={editingNote.trashed ? 'Delete permanently' : 'Move to trash'}
                  title={editingNote.trashed ? 'Delete permanently' : 'Move to Trash'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setEditingNoteId(null)}
                className="aos-btn-primary px-5 py-2 min-h-[40px] text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Explicit Confirmation Dialog for Permanent Deletion */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setConfirmAction(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm permanent deletion"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[20px] bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-sky-400/30 p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {confirmAction.type === 'empty-trash'
                ? `Empty Trash (${confirmAction.count} notes)?`
                : 'Delete note permanently?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmAction.type === 'empty-trash'
                ? 'All notes in Trash will be permanently removed from this device and your synced Google Cloud account. This cannot be undone.'
                : `"${confirmAction.title}" will be permanently deleted from this device and your synced Google Cloud account.`}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="aos-btn-soft px-4 py-2 min-h-[40px] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmAction.type === 'empty-trash') handleEmptyTrash();
                  else handleDeleteForever(confirmAction.noteId);
                }}
                className="px-4 py-2 min-h-[40px] rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
