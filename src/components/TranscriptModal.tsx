import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Search, 
  Headphones, 
  X, 
  User, 
  Headphones as AgentIcon, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { NormalizedOrder } from '../services/orderMapper';

interface TranscriptModalProps {
  order: NormalizedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayAudio?: (order: NormalizedOrder) => void;
}

interface ParsedMessage {
  time: string;
  speaker: 'assistant' | 'user' | string;
  text: string;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  order,
  isOpen,
  onClose,
  onPlayAudio,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchedContent, setFetchedContent] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dialogue' | 'raw'>('dialogue');

  useEffect(() => {
    if (isOpen && order) {
      setSearchTerm('');
      setFetchError(null);
      setFetchedContent('');

      const cleanUrl = (order.transcriptUrl || '').replace(/^[\r\n\s]+|[\r\n\s]+$/g, '').trim();

      if (cleanUrl) {
        setIsLoading(true);
        fetch(cleanUrl)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: Failed to load transcript file.`);
            }
            return res.text();
          })
          .then((text) => {
            setFetchedContent(text);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Transcript direct fetch error:', err);
            setFetchError('Unable to fetch directly due to network restrictions.');
            setIsLoading(false);
          });
      }
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const finalContent = fetchedContent || order.transcriptText || '';

  const parseMessages = (raw: string): ParsedMessage[] => {
    if (!raw) return [];
    
    const messages: ParsedMessage[] = [];
    const regex = /\[([^\]]+)\]\s*(assistant|user|agent|customer|system):\s*([^\[]+)/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(raw)) !== null) {
      const timeStr = match[1];
      const speakerStr = match[2].toLowerCase();
      const textStr = match[3].trim();

      let displayTime = timeStr;
      try {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
          displayTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        }
      } catch {
        // Fallback
      }

      messages.push({
        time: displayTime,
        speaker: speakerStr,
        text: textStr,
      });
    }

    if (messages.length === 0 && raw.trim()) {
      const lines = raw.split('\n').filter((l) => l.trim().length > 0);
      lines.forEach((line) => {
        messages.push({
          time: '—',
          speaker: line.toLowerCase().includes('agent') ? 'assistant' : 'user',
          text: line,
        });
      });
    }

    return messages;
  };

  const parsedDialogue = parseMessages(finalContent);

  const filteredDialogue = parsedDialogue.filter((m) =>
    searchTerm ? m.text.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleCopy = () => {
    const fullText = `Order ID: ${order.orderNumber}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nCall Duration: ${order.callDuration}\nDisposition: ${order.callDisposition}\n\nTranscript Content:\n${finalContent || order.transcriptUrl}`;
    
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transcript-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#2563eb] rounded-xl shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="transcript-modal-title" className="text-base font-bold text-slate-900">
                Call Transcript &amp; Dialogue
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Order {order.orderNumber.replace(/^#+/, '')} · {order.customerName} ({order.phone || 'No phone'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search dialogue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white text-slate-800"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('dialogue')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'dialogue' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dialogue View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'raw' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Raw Text
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onPlayAudio && order.recordingUrl && (
                <button
                  type="button"
                  onClick={() => onPlayAudio(order)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2563eb] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors shadow-2xs"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Listen Audio</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
          </div>

          {fetchError && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{fetchError}</span>
              </div>
              {order.transcriptUrl && (
                <a
                  href={order.transcriptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline text-blue-600 inline-flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Content Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-2.5">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">Loading transcript...</p>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">{order.transcriptUrl}</p>
            </div>
          ) : viewMode === 'raw' ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <pre className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                {finalContent || 'No transcript text available.'}
              </pre>
            </div>
          ) : filteredDialogue.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <p className="text-slate-600 font-medium">No transcript dialogue found</p>
              {order.transcriptUrl && (
                <p>
                  Direct link:{' '}
                  <a
                    href={order.transcriptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-mono inline-flex items-center gap-1"
                  >
                    <span>{order.transcriptUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              )}
            </div>
          ) : (
            filteredDialogue.map((msg, idx) => {
              const isAgent = msg.speaker === 'assistant' || msg.speaker === 'agent';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[88%] ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAgent ? 'bg-blue-100 text-[#2563eb]' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isAgent ? <AgentIcon className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-[11px] text-slate-400 ${isAgent ? '' : 'justify-end'}`}>
                      <span className="font-semibold text-slate-700">
                        {isAgent ? 'Tele-Agent (Assistant)' : `Customer: ${order.customerName}`}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{msg.time}</span>
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                          : 'bg-[#2563eb] text-white shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="truncate max-w-[380px] font-mono text-[11px] flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Source:</span>
            <span className="text-slate-400 truncate">{order.transcriptUrl || '—'}</span>
            {order.transcriptUrl && (
              <a
                href={order.transcriptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
