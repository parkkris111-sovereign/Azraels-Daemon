import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Mail,
  HardDrive,
  Cloud,
  BookOpen,
  CheckSquare,
  Activity,
  Send,
  ArrowRight
} from 'lucide-react';
import { ConnectedService, OnlineServiceId } from '../types';

interface ServicesHubModalProps {
  services: ConnectedService[];
  onClose: () => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  onOpenGoogleDrive?: () => void;
}

export const ServicesHubModal: React.FC<ServicesHubModalProps> = ({
  services,
  onClose,
  onSyncAll,
  isSyncing,
  onOpenGoogleDrive,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'email' | 'project_management' | 'cloud_storage' | 'notebook'>('all');
  const [testedAction, setTestedAction] = useState<string | null>(null);

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const getServiceIcon = (id: OnlineServiceId) => {
    switch (id) {
      case 'gmail':
      case 'outlook':
        return <Mail className="w-5 h-5 text-red-500" />;
      case 'trello':
        return <Layers className="w-5 h-5 text-blue-500" />;
      case 'asana':
        return <CheckSquare className="w-5 h-5 text-rose-500" />;
      case 'google_drive':
        return <HardDrive className="w-5 h-5 text-emerald-500" />;
      case 'dropbox':
        return <Cloud className="w-5 h-5 text-sky-500" />;
      case 'jupyter':
        return <BookOpen className="w-5 h-5 text-amber-500" />;
      case 'notebooklm':
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
      default:
        return <Layers className="w-5 h-5 text-stone-500" />;
    }
  };

  const handleSimulateTestAction = (actionName: string) => {
    setTestedAction(actionName);
    setTimeout(() => {
      setTestedAction(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  Connected Online Services & Action Dispatcher
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  {services.filter(s => s.connected).length} Active
                </span>
              </div>
              <p className="text-xs text-stone-300">
                The Integrator Daemon communicates directly with your tools to execute predefined closing actions before sleep.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSyncAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors"
              title="Poll services for updated drafts & cards"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isSyncing ? 'Polling...' : 'Sync All'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Services ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory('email')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'email'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Email Clients (Gmail, Outlook)
          </button>
          <button
            onClick={() => setSelectedCategory('project_management')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'project_management'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Project Management (Trello, Asana)
          </button>
          <button
            onClick={() => setSelectedCategory('cloud_storage')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'cloud_storage'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Cloud Storage (Drive, Dropbox)
          </button>
          <button
            onClick={() => setSelectedCategory('notebook')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'notebook'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Notebooks (Jupyter & Colab)
          </button>
        </div>

        {/* Services List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="border border-stone-200 rounded-xl p-4 bg-white hover:border-stone-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 shrink-0 mt-0.5">
                    {getServiceIcon(service.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-stone-900 text-sm">
                        {service.name}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        OAuth 2.0 / API Connected
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {service.activeAccountInfo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {service.id === 'google_drive' && onOpenGoogleDrive && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenGoogleDrive();
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Drive Explorer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[11px] font-medium text-emerald-700">Online</span>
                </div>
              </div>

              {/* Supported Predefined Actions */}
              <div className="bg-stone-50/70 border border-stone-150 rounded-xl p-3 space-y-2">
                <p className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                  Automated Predefined Actions ({service.supportedActions.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.supportedActions.map((action) => {
                    const isJustTested = testedAction === action.name;
                    return (
                      <div
                        key={action.id}
                        className="bg-white border border-stone-200 rounded-lg p-2.5 flex flex-col justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-medium text-stone-900">
                            <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>{action.name}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                            {action.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                          <span className="text-[10px] text-stone-400 font-mono">
                            Auto-Dispatchable
                          </span>
                          <button
                            onClick={() => handleSimulateTestAction(action.name)}
                            className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors"
                          >
                            {isJustTested ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Test Passed
                              </span>
                            ) : (
                              <span>Dry Run Test</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pre-Sleep Sweep executes predefined actions across all active services automatically.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
