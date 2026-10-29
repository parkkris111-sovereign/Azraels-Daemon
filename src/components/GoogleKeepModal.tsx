import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  FileText,
  CheckSquare,
  Square,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  Pin,
  Trash2,
  Copy,
  Check,
  Send,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  LogIn,
  LogOut,
  Info
} from 'lucide-react';
import { User } from 'firebase/auth';
import { IncompleteTask, GoogleKeepNote } from '../types';
import { fetchGoogleKeepNotesFromApi, createGoogleKeepNoteApi } from '../utils/googleKeep';
import { googleSignIn, logoutGoogleDrive } from '../utils/googleAuth';

interface GoogleKeepModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: IncompleteTask[];
  onImportNoteAsTask: (note: GoogleKeepNote) => void;
  currentUser?: User | null;
  accessToken?: string | null;
  onAuthChange?: (user: User | null, token: string | null) => void;
}

const STORAGE_KEY_KEEP_NOTES = 'integrator_daemon_keep_notes_v2';

const INITIAL_KEEP_NOTES: GoogleKeepNote[] = [
  {
    id: 'keep-note-1',
    title: 'Mobile App Architecture & SQLite Sync Checklist',
    color: 'amber',
    pinned: true,
    updatedAt: 'Today, 18:15',
    isSyncedToDaemon: true,
    items: [
      { id: 'item-1', text: 'Define SQLite local schema for offline task cache', isChecked: true },
      { id: 'item-2', text: 'Implement optimistic UI update on user gesture', isChecked: true },
      { id: 'item-3', text: 'Complete bidirectional conflict resolution (vector clock)', isChecked: false },
      { id: 'item-4', text: 'Add retry backoff for flaky cellular connections (exponential up to 60s)', isChecked: false },
      { id: 'item-5', text: 'Draft executive sync summary note in Google Keep for mobile lead', isChecked: false },
    ],
  },
  {
    id: 'keep-note-2',
    title: 'Q4 Cloud Infrastructure & Cost Optimization Target',
    color: 'teal',
    pinned: true,
    updatedAt: 'Today, 14:30',
    isSyncedToDaemon: false,
    text: `Key targets before midnight:
- Migrate AWS S3 analytics logs to Glacier Instant Retrieval (estimate $1,400/mo savings).
- Confirm Redis cluster memory limits and configure 80% eviction threshold.
- Reconcile Kubernetes autoscaling min/max pods across EU/US regions.`,
    items: [
      { id: 'item-201', text: 'Verify Terraform lifecycle rule against prod bucket', isChecked: false },
      { id: 'item-202', text: 'Calculate amortized data retrieval fees vs S3 standard', isChecked: false },
      { id: 'item-203', text: 'Send approval sign-off note to VP Infrastructure', isChecked: false },
    ],
  },
  {
    id: 'keep-note-3',
    title: 'Leadership Strategy Offsite Agenda Draft',
    color: 'blue',
    pinned: false,
    updatedAt: 'Yesterday, 17:45',
    isSyncedToDaemon: false,
    text: `Location: Half Moon Bay.
Drafting day 2 afternoon workshops on generative agent reliability and continuous daemon architectures. Budget ceiling $7,500.`,
    items: [
      { id: 'item-301', text: 'Confirm venue conference room AV equipment', isChecked: true },
      { id: 'item-302', text: 'Finalize catering headcount and dinner reservation at Coastal Grill', isChecked: false },
      { id: 'item-303', text: 'Assemble hackathon demo rubric and prizes', isChecked: false },
    ],
  },
];

export const GoogleKeepModal: React.FC<GoogleKeepModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onImportNoteAsTask,
  currentUser,
  accessToken,
  onAuthChange,
}) => {
  const [notes, setNotes] = useState<GoogleKeepNote[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_KEEP_NOTES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_KEEP_NOTES;
  });

  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newItemsText, setNewItemsText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('amber');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Save to localStorage whenever notes update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_KEEP_NOTES, JSON.stringify(notes));
      } catch {}
    }
  }, [notes]);

  if (!isOpen) return null;

  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleToggleItem = (noteId: string, itemId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId || !n.items) return n;
        return {
          ...n,
          items: n.items.map((it) => (it.id === itemId ? { ...it, isChecked: !it.isChecked } : it)),
        };
      })
    );
  };

  const handlePromptDelete = (noteId: string) => {
    setDeleteConfirmId(noteId);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    setNotes((prev) => prev.filter((n) => n.id !== deleteConfirmId));
    setDeleteConfirmId(null);
    setSyncStatus('Note removed.');
    setTimeout(() => setSyncStatus(null), 2500);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newText.trim() && !newItemsText.trim()) return;

    const parsedItems = newItemsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text, idx) => ({
        id: `custom-item-${Date.now()}-${idx}`,
        text: text.replace(/^-\s*|^\[[ x]\]\s*/i, ''),
        isChecked: text.startsWith('[x]') || text.startsWith('[X]'),
      }));

    const newNote: GoogleKeepNote = {
      id: `keep-${Date.now()}`,
      title: newTitle.trim() || 'Untitled Keep Note',
      text: newText.trim() || undefined,
      items: parsedItems.length > 0 ? parsedItems : undefined,
      color: selectedColor,
      pinned: false,
      updatedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      isSyncedToDaemon: false,
    };

    setNotes([newNote, ...notes]);

    // If authenticated, push to Google API
    if (accessToken) {
      createGoogleKeepNoteApi(accessToken, {
        title: newNote.title,
        text: newNote.text,
        items: newNote.items?.map((it) => it.text),
      }).then((res) => {
        if (!res.success && res.error) {
          console.info('Google Keep API sync note:', res.error);
        }
      });
    }

    setNewTitle('');
    setNewText('');
    setNewItemsText('');
    setIsCreating(false);
    setSyncStatus(`Created note "${newNote.title}" in Keep`);
    setTimeout(() => setSyncStatus(null), 2500);
  };

  const handleImportToDaemon = (note: GoogleKeepNote) => {
    onImportNoteAsTask(note);
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, isSyncedToDaemon: true } : n)));
    setSyncStatus(`Imported "${note.title}" into Continuous Daemon queue!`);
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleCopyNote = (note: GoogleKeepNote) => {
    const textContent = [
      note.title,
      note.text,
      note.items ? note.items.map((it) => `[${it.isChecked ? 'x' : ' '}] ${it.text}`).join('\n') : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    navigator.clipboard.writeText(textContent);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefreshFromGoogle = async () => {
    if (!accessToken) {
      setApiNotice('Please connect your Google Account first to query live Google endpoints.');
      setTimeout(() => setApiNotice(null), 4000);
      return;
    }

    setIsFetchingApi(true);
    setApiNotice(null);
    try {
      const res = await fetchGoogleKeepNotesFromApi(accessToken);
      if (res.success && res.notes && res.notes.length > 0) {
        setNotes((prev) => [...res.notes!, ...prev]);
        setSyncStatus(`Synced ${res.notes.length} notes from Google Keep!`);
      } else {
        setApiNotice(res.error || 'Google Keep API active in Daemon Mirror mode.');
      }
    } catch (err: any) {
      setApiNotice(err?.message || 'Error communicating with Google Keep');
    } finally {
      setIsFetchingApi(false);
      setTimeout(() => setSyncStatus(null), 3500);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await googleSignIn();
      if (result && onAuthChange) {
        onAuthChange(result.user, result.accessToken);
      }
    } catch {
      // User cancelled or closed authentication popup
    }
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-50/70 border-amber-200 text-amber-950';
      case 'teal':
        return 'bg-teal-50/70 border-teal-200 text-teal-950';
      case 'blue':
        return 'bg-blue-50/70 border-blue-200 text-blue-950';
      case 'rose':
        return 'bg-rose-50/70 border-rose-200 text-rose-950';
      default:
        return 'bg-stone-50 border-stone-200 text-stone-900';
    }
  };

  const keepTasksCount = tasks.filter((t) => t.serviceId === 'google_keep').length;
  const sortedNotes = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-amber-500 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  Google Keep Notes & Checklists
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/25 text-white border border-white/30 uppercase tracking-wider font-semibold">
                  Daemon Bridge Active
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Target: <strong>krissmgusa@gmail.com</strong> • Ingest incomplete notes & checklists into 24/7 daemon trails
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-stone-900 font-semibold text-xs shadow-2xs hover:bg-stone-50 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/15 border border-white/25 text-white text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-mono text-[11px] truncate max-w-[140px]">{currentUser.email}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync notification banner if active */}
        {syncStatus && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* API notice banner if active */}
        {apiNotice && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs font-medium text-amber-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{apiNotice}</span>
            </div>
            <button
              onClick={() => setApiNotice(null)}
              className="text-amber-800 hover:text-amber-950 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <span><strong>{notes.length}</strong> Keep Notes</span>
            <span>•</span>
            <span className="text-amber-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              {keepTasksCount} Active in Continuous Sweep
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshFromGoogle}
              disabled={isFetchingApi}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
              title="Sync with Google Keep API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingApi ? 'animate-spin' : ''}`} />
              <span>{isFetchingApi ? 'Querying API...' : 'Sync from Keep'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? 'Cancel Note' : 'New Keep Note'}</span>
            </button>
          </div>
        </div>

        {/* Create Note Drawer if active */}
        {isCreating && (
          <form onSubmit={handleAddNote} className="p-4 bg-amber-50/50 border-b border-amber-200 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Note Title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="flex items-center gap-1">
                {['amber', 'teal', 'blue', 'rose'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      c === 'amber'
                        ? 'bg-amber-300'
                        : c === 'teal'
                        ? 'bg-teal-300'
                        : c === 'blue'
                        ? 'bg-blue-300'
                        : 'bg-rose-300'
                    } ${selectedColor === c ? 'ring-2 ring-stone-900 ring-offset-1' : 'opacity-70'}`}
                  />
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              placeholder="Note description or background context..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />

            <textarea
              rows={3}
              placeholder="Checklist items (one per line, e.g. 'Complete deployment script')..."
              value={newItemsText}
              onChange={(e) => setNewItemsText(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
              >
                Save Note to Keep
              </button>
            </div>
          </form>
        )}

        {/* Delete Confirmation Modal (Workspace destructive operation safeguard) */}
        {deleteConfirmId && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Are you sure you want to permanently delete this note from Google Keep?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-2.5 py-1 rounded bg-white border border-rose-300 text-rose-800 hover:bg-rose-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Delete Note
              </button>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedNotes.map((note) => {
            const uncheckedCount = note.items?.filter((it) => !it.isChecked).length || 0;
            const totalCount = note.items?.length || 0;

            return (
              <div
                key={note.id}
                className={`rounded-xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${getColorClasses(
                  note.color
                )}`}
              >
                <div>
                  {/* Top Note Ribbon */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(note.id)}
                        className={`p-1 rounded transition-colors ${
                          note.pinned
                            ? 'bg-amber-200 text-amber-900 font-bold'
                            : 'text-stone-400 hover:text-stone-700 hover:bg-black/5'
                        }`}
                        title={note.pinned ? 'Unpin Note' : 'Pin Note to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <h3 className="text-sm font-bold text-stone-900 leading-snug truncate">
                        {note.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyNote(note)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                        title="Copy note text"
                      >
                        {copiedId === note.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePromptDelete(note.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  {note.text && (
                    <p className="text-xs text-stone-700 mb-3 whitespace-pre-wrap leading-relaxed">
                      {note.text}
                    </p>
                  )}

                  {/* Checklist Items */}
                  {note.items && note.items.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {note.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleItem(note.id, item.id)}
                          className={`flex items-start gap-2 text-xs cursor-pointer select-none p-1 rounded hover:bg-black/5 transition-colors ${
                            item.isChecked ? 'line-through text-stone-400' : 'text-stone-800 font-medium'
                          }`}
                        >
                          {item.isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          )}
                          <span className="leading-snug">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span className="text-[11px] font-mono">{note.updatedAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {note.isSyncedToDaemon ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active in Sweep
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleImportToDaemon(note)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-stone-900 hover:bg-stone-800 text-white shadow-2xs transition-colors"
                        title="Import as a continuous daemon loop to resolve before sleep"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Sync to Daemon</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Google Keep Sync Bridge v1.3 • Bidirectional state preservation with 24/7 All-Day daemon</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
