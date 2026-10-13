import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, ChevronDown, Download, Database, RefreshCw, CheckCircle2, LogOut, User } from 'lucide-react';

interface OrdersHeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  dateRangeLabel: string;
  onDateRangeChange: (label: string) => void;
  onExport: () => void;
  onOpenSupabaseModal: () => void;
  isConnected: boolean;
  tableName: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  userEmail?: string;
  onLogout?: () => void;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  dateRangeLabel,
  onDateRangeChange,
  onExport,
  onOpenSupabaseModal,
  isConnected,
  tableName,
  onRefresh,
  isRefreshing,
  userEmail,
  onLogout,
}) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDateOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateOptions = [
    'All Time',
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    '14 Oct 2026 — 14 Oct 2026',
  ];

  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Pending', value: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title, Session Status & Database Connection Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
            Call Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review Ai Confirmation Calls
          </p>
        </div>

        {/* Database Status & User Session */}
        <div className="flex flex-wrap items-center gap-2">
          {isConnected && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
              title="Refresh from Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          )}

          <button
            onClick={onOpenSupabaseModal}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
              isConnected
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {isConnected ? `Supabase: ${tableName}` : 'Connect Supabase'}
            </span>
            {isConnected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          </button>

          {/* User profile & Logout */}
          {userEmail && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100/80 rounded-lg border border-slate-200/80">
                <User className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[140px]">{userEmail}</span>
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors shadow-2xs"
                  title="Sign out from session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Control Row matching image.png */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search order ID, name or phone"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 shadow-2xs transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Date Selector */}
        <div className="relative" ref={dateRef}>
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-xs sm:text-sm">{dateRangeLabel}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isDateOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onDateRangeChange(opt);
                    setIsDateOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors ${
                    dateRangeLabel === opt ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative" ref={statusRef}>
          <button
            type="button"
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-between gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors min-w-[140px]"
          >
            <span className="font-medium text-xs sm:text-sm">
              {selectedStatus === 'ALL'
                ? 'All Statuses'
                : selectedStatus}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isStatusOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onStatusChange(opt.value);
                    setIsStatusOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors ${
                    selectedStatus === opt.value ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Button matching image.png: solid emerald green, download icon */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white rounded-lg text-sm font-semibold shadow-2xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
