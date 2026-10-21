import React, { useState } from 'react';
import { 
  Mail, 
  AtSign, 
  ExternalLink, 
  Plus, 
  Check, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  Inbox
} from 'lucide-react';
import { UserEmailAccount } from '../types';

interface EmailAccountsBarProps {
  accounts: UserEmailAccount[];
  selectedEmailId: string | null;
  onSelectEmailId: (id: string | null) => void;
  onAddEmailAccount: (email: string, label: string, provider: 'gmail' | 'outlook' | 'custom') => void;
  tasksCountByEmail?: Record<string, number>;
}

export const EmailAccountsBar: React.FC<EmailAccountsBarProps> = ({
  accounts,
  selectedEmailId,
  onSelectEmailId,
  onAddEmailAccount,
  tasksCountByEmail = {},
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newProvider, setNewProvider] = useState<'gmail' | 'outlook' | 'custom'>('gmail');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    onAddEmailAccount(newEmail.trim(), newLabel.trim() || newEmail.trim(), newProvider);
    setNewEmail('');
    setNewLabel('');
    setIsAdding(false);
  };

  const totalTracked = Object.values(tasksCountByEmail).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 mb-5 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-900 tracking-tight">
                Jump to Email Inboxes ({accounts.length} Connected)
              </span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono">
                Multi-Identity Sync
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              The daemon monitors unfinished drafts across all your personal and corporate email addresses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {selectedEmailId && (
            <button
              onClick={() => onSelectEmailId(null)}
              className="text-[11px] text-stone-500 hover:text-stone-800 underline transition-colors"
            >
              Show all inboxes
            </button>
          )}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Link Another Email</span>
          </button>
        </div>
      </div>

      {/* Account Pills list */}
      <div className="flex items-center gap-2 pt-2.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelectEmailId(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
            selectedEmailId === null
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/60'
          }`}
        >
          <span>All Accounts</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedEmailId === null ? 'bg-stone-800 text-stone-200' : 'bg-stone-200 text-stone-700'
          }`}>
            {totalTracked}
          </span>
        </button>

        {accounts.map((account) => {
          const isSelected = selectedEmailId === account.id;
          const pendingCount = tasksCountByEmail[account.id] || account.taskCount || 0;

          return (
            <button
              key={account.id}
              onClick={() => onSelectEmailId(isSelected ? null : account.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 border ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs ring-2 ring-stone-900/10'
                  : 'bg-stone-50/80 text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                account.provider === 'gmail' ? 'bg-red-500' : account.provider === 'outlook' ? 'bg-sky-500' : 'bg-emerald-500'
              }`} />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">
                    {account.email}
                  </span>
                  {account.isPrimary && (
                    <span className={`text-[9px] px-1 rounded font-normal ${
                      isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-200/80 text-stone-600'
                    }`}>
                      Primary
                    </span>
                  )}
                </div>
              </div>

              {pendingCount > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected 
                    ? 'bg-amber-400 text-amber-950' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {pendingCount} trail{pendingCount > 1 ? 's' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add New Email Form Drawer */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mt-3 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in duration-150">
          <input
            type="email"
            placeholder="e.g. kris.personal@fastmail.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="w-full sm:w-60 text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
          />
          <input
            type="text"
            placeholder="Label (e.g. Side Project Workspace)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full sm:w-52 text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
          />
          <select
            value={newProvider}
            onChange={(e) => setNewProvider(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
          >
            <option value="gmail">Gmail / Google Workspace</option>
            <option value="outlook">Outlook / Office 365</option>
            <option value="custom">IMAP / Fastmail / Proton</option>
          </select>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
            >
              Connect Email
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-xs hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
