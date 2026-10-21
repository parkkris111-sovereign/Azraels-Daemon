import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Activity, Trash2 } from 'lucide-react';
import { DaemonLog } from '../types';

interface DaemonTerminalProps {
  logs: DaemonLog[];
  onClearLogs: () => void;
  isSweeping: boolean;
}

export const DaemonTerminal: React.FC<DaemonTerminalProps> = ({
  logs,
  onClearLogs,
  isSweeping,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-sm mt-8 transition-all">
      {/* Terminal Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-stone-950 flex items-center justify-between cursor-pointer select-none hover:bg-stone-900 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Terminal className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-mono text-xs font-semibold text-stone-300">
              integrator_daemon.log
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              isSweeping ? 'bg-amber-900/60 text-amber-300' : 'bg-stone-800 text-stone-400'
            }`}>
              {isSweeping ? 'PROCESSING_SWEEP' : 'PATROLLING'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-stone-500 hidden sm:inline">
            {logs.length} events logged
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>
      </div>

      {/* Terminal Body */}
      {isOpen && (
        <div className="p-4 bg-stone-950/90 font-mono text-xs text-stone-300 max-h-60 overflow-y-auto space-y-1.5 border-t border-stone-850">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800/80 text-[11px] text-stone-500">
            <span>Daemon active process ID: #8824 • Following Chrome, VSCode, Slack & Gmail</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearLogs();
              }}
              className="text-stone-500 hover:text-stone-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Log</span>
            </button>
          </div>

          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed text-[11px]">
              <span className="text-stone-500 shrink-0 select-none">
                [{log.timestamp}]
              </span>
              <span className={`font-semibold shrink-0 ${
                log.level === 'success' 
                  ? 'text-emerald-400' 
                  : log.level === 'daemon' 
                    ? 'text-indigo-400' 
                    : log.level === 'warn' 
                      ? 'text-amber-400' 
                      : 'text-stone-400'
              }`}>
                {log.level.toUpperCase()}:
              </span>
              <span className={log.level === 'success' ? 'text-emerald-300' : 'text-stone-300'}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
