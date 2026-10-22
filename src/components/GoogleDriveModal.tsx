import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Folder,
  FileText,
  FileCode,
  ExternalLink,
  RefreshCw,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Sparkles,
  ShieldCheck,
  LogOut,
  FolderPlus,
  Clock,
  ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  logoutGoogleDrive, 
  getAccessToken, 
  setCachedAccessToken 
} from '../utils/googleAuth';
import { 
  listDriveFiles, 
  uploadFileToDrive, 
  ensureBedtimeClosuresFolder, 
  deleteDriveFile,
  getDriveAbout,
  DriveFileItem,
  DriveStorageQuota
} from '../utils/googleDrive';
import { IncompleteTask, DailySummaryReport } from '../types';
import { sounds } from '../utils/audio';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: IncompleteTask[];
  dailyReport?: DailySummaryReport | null;
  currentUser: User | null;
  accessToken: string | null;
  onAuthChange: (user: User | null, token: string | null) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  tasks,
  dailyReport,
  currentUser,
  accessToken,
  onAuthChange,
}) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [aboutInfo, setAboutInfo] = useState<DriveStorageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Deletion Confirmation Modal State (Mandatory User Confirmation for Destructive Ops)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Note Modal state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  // Fetch files and about info whenever we have an access token
  useEffect(() => {
    if (isOpen && accessToken) {
      loadDriveData(accessToken);
    }
  }, [isOpen, accessToken]);

  const loadDriveData = async (token: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const [filesRes, aboutRes] = await Promise.allSettled([
        listDriveFiles(token, { query: searchQuery }),
        getDriveAbout(token),
      ]);

      if (filesRes.status === 'fulfilled') {
        setFiles(filesRes.value.files || []);
      }
      if (aboutRes.status === 'fulfilled') {
        setAboutInfo(aboutRes.value);
      }
    } catch (err: any) {
      console.error('Error loading Google Drive data:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to load files from Google Drive.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      onAuthChange(res.user, res.accessToken);
      sounds.playTaskFinished();
      setStatusMessage({ type: 'success', text: `Connected as ${res.user.email} to Google Drive!` });
      await loadDriveData(res.accessToken);
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to authenticate with Google Drive.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogleDrive();
      onAuthChange(null, null);
      setFiles([]);
      setAboutInfo(null);
      setStatusMessage({ type: 'info', text: 'Disconnected from Google Drive.' });
    } catch (err: any) {
      console.error('Logout failed:', err);
    }
  };

  // Sync / Upload Completed Tasks to Google Drive folder
  const handleBackupClosedTasksToDrive = async () => {
    if (!accessToken) return;
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    if (completedTasks.length === 0) {
      setStatusMessage({ type: 'info', text: 'No completed tasks to backup. Close out some loops first!' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      // Find or create the dedicated folder
      const folderId = await ensureBedtimeClosuresFolder(accessToken);

      let uploadedCount = 0;
      for (const t of completedTasks) {
        const fileName = `${t.title.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 40)}_resolution.md`;
        const content = `# Deliverable: ${t.title}
**Status:** 100% Completed by Integrator Daemon
**Domain:** ${t.category.toUpperCase()} • ${t.sourceTrail}
**Detected At:** ${t.detectedAt}
**Completed At:** ${t.completedAt || new Date().toLocaleTimeString()}
**Attestation Seal:** ${t.masterCombine?.aaa?.attestationChecksum || 'AAA-ATT-VERIFIED'}

---

## Final Deliverable Content
${t.completedContent || t.originalContent}

---

## Daemon Loop Closure Summary
${t.completionSummary || 'Synthesized to 100% completion before bedtime.'}

### Actions Executed
${(t.daemonActionsTaken || []).map((act) => `- ${act}`).join('\n')}
`;

        await uploadFileToDrive(accessToken, {
          name: fileName,
          content,
          parentFolderId: folderId,
          description: `Auto-saved closure deliverable for ${t.title}`,
        });
        uploadedCount++;
      }

      sounds.playAllClearSleepReady();
      setStatusMessage({
        type: 'success',
        text: `✓ Successfully saved ${uploadedCount} deliverable(s) to Google Drive in "/Daemon_Bedtime_Closures/"!`,
      });
      await loadDriveData(accessToken);
    } catch (err: any) {
      console.error('Backup to Google Drive failed:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to backup files to Google Drive.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Create new quick file in Drive
  const handleCreateNewFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFileName.trim()) return;

    setIsUploading(true);
    try {
      const folderId = await ensureBedtimeClosuresFolder(accessToken);
      const name = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;

      await uploadFileToDrive(accessToken, {
        name,
        content: newFileContent || `# ${newFileName}\nCreated via Integrator Daemon.`,
        parentFolderId: folderId,
      });

      sounds.playTaskFinished();
      setStatusMessage({ type: 'success', text: `Created "${name}" in Google Drive!` });
      setIsCreatingNew(false);
      setNewFileName('');
      setNewFileContent('');
      await loadDriveData(accessToken);
    } catch (err: any) {
      console.error('Create file failed:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to create file in Google Drive.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file with explicit user confirmation (Mandatory per Workspace Skill)
  const confirmDeleteFile = async () => {
    if (!fileToDelete || !accessToken) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      sounds.playTaskFinished();
      setStatusMessage({ type: 'success', text: `Deleted "${fileToDelete.name}" from Google Drive.` });
      setFileToDelete(null);
      await loadDriveData(accessToken);
    } catch (err: any) {
      console.error('Failed to delete file:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Could not delete file.' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-900 text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-500 flex items-center justify-center text-white shadow-md">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Google Drive Workspace Sync
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  API v3
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  seismic-sublime-d3kqt
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Direct OAuth cloud storage integration for pre-sleep loop deliverables & backups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {accessToken && (
              <button
                onClick={() => loadDriveData(accessToken)}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                title="Refresh Drive files"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div
            className={`px-5 py-2.5 text-xs flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-stone-400 hover:text-stone-600 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Authentication Banner */}
          {!accessToken ? (
            <div className="p-8 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white text-center flex flex-col items-center justify-center space-y-4 border border-stone-800 shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10 shadow-inner">
                <HardDrive className="w-7 h-7" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Connect Your Google Drive
                </h3>
                <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                  Sign in with your Google account to automatically archive nighttime deliverables, commit Jupyter notebooks, and sync closed tasks directly into your Drive.
                </p>
              </div>

              {/* Official Google Material Sign-In Button */}
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="gsi-material-button relative inline-flex items-center justify-center bg-white hover:bg-stone-50 text-stone-800 font-medium px-5 py-2.5 rounded-xl border border-stone-300 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="text-xs font-semibold">
                    {isSigningIn ? 'Connecting to Google Drive...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* Authenticated Account Info & Actions Bar */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {aboutInfo?.photoLink ? (
                    <img
                      src={aboutInfo.photoLink}
                      alt={aboutInfo.displayName}
                      className="w-10 h-10 rounded-full border border-stone-300 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">
                        {aboutInfo?.displayName || currentUser?.displayName || 'Google Account'}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                        Active Token
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                      {aboutInfo?.emailAddress || currentUser?.email}
                    </p>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleBackupClosedTasksToDrive}
                    disabled={isUploading || completedCount === 0}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Upload className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
                    <span>
                      {isUploading ? 'Uploading to Drive...' : `Archive ${completedCount} Closed Trails`}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsCreatingNew(!isCreatingNew)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-600" />
                    <span>New Drive Doc</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 border border-stone-300 transition-colors cursor-pointer"
                    title="Disconnect Google Drive"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Create New File Form */}
              {isCreatingNew && (
                <form
                  onSubmit={handleCreateNewFile}
                  className="bg-stone-900 text-stone-100 rounded-xl p-4 border border-stone-800 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Create New Document in /Daemon_Bedtime_Closures/
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="text-stone-400 hover:text-stone-200 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="File Name (e.g. Sprint_Retro_Notes.md)"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="Markdown content to save directly into Google Drive..."
                      value={newFileContent}
                      onChange={(e) => setNewFileContent(e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={isUploading || !newFileName.trim()}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isUploading ? 'Saving...' : 'Save Directly to Google Drive'}
                    </button>
                  </div>
                </form>
              )}

              {/* Search & File Filter */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Google Drive files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && accessToken) loadDriveData(accessToken);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <button
                  onClick={() => accessToken && loadDriveData(accessToken)}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Files Table / List */}
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-stone-500" />
                    Files in Google Drive ({files.length})
                  </span>
                  <span className="text-[11px] font-normal text-stone-500">
                    Target Folder: <code>/Daemon_Bedtime_Closures/</code>
                  </span>
                </div>

                {isLoading ? (
                  <div className="p-8 text-center text-xs text-stone-500 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                    <span>Loading files from Google Drive...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                    <HardDrive className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="font-medium text-stone-700">No files found in Google Drive query</p>
                    <p className="text-[11px] text-stone-400">
                      Use the "Archive Closed Trails" button above to upload completed task artifacts.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                    {files.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const isCode = file.name.endsWith('.ipynb') || file.name.endsWith('.ts') || file.name.endsWith('.py');

                      return (
                        <div
                          key={file.id}
                          className="p-3 hover:bg-stone-50/80 transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                              {isFolder ? (
                                <Folder className="w-4 h-4 text-amber-500" />
                              ) : isCode ? (
                                <FileCode className="w-4 h-4 text-purple-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-emerald-600" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-stone-900 truncate block">
                                {file.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                                <span>{file.mimeType.split('.').pop() || 'file'}</span>
                                {file.modifiedTime && (
                                  <>
                                    <span>•</span>
                                    <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete from Drive"
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Google Drive API v3 • Client-side OAuth with explicit user confirmation</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Modal for File Deletion */}
      {fileToDelete && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-100"
          onClick={() => setFileToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">
                Delete from Google Drive?
              </h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-stone-900 font-mono">{fileToDelete.name}</strong> from your Google Drive? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
