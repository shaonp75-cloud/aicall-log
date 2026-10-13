import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Table, 
  Globe, 
  Copy, 
  Check, 
  Code2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';
import { SupabaseConfig, getStoredSupabaseConfig, saveStoredSupabaseConfig, clearStoredSupabaseConfig, getSupabaseClient } from '../services/supabaseClient';

interface SupabaseConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (config: SupabaseConfig) => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rowCount?: number } | null>(null);
  const [showSqlSample, setShowSqlSample] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredSupabaseConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleSql = `-- Create the orders table in your Supabase SQL Editor:
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text,
  product text,
  total_bill numeric default 0,
  order_status text default 'Pending',
  cancel_reason text default '',
  call_disposition text default '—',
  call_duration text default '00:00',
  recording_url text default '',
  transcript_url text default '',
  created_at timestamptz default now()
);

-- Enable Row Level Security & Allow Public/Anon Read
alter table public.orders enable row level security;
create policy "Allow anon read" on public.orders for select using (true);
create policy "Allow anon insert/update" on public.orders for all using (true);`;

  const handleTestConnection = async () => {
    if (!config.url || !config.anonKey) {
      setTestResult({
        success: false,
        message: 'Please provide both Supabase URL and Anon API Key.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const client = getSupabaseClient(config);
      if (!client) {
        throw new Error('Invalid Supabase configuration');
      }

      const tableName = config.tableName.trim() || 'orders';
      const { data, count, error } = await client
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        throw error;
      }

      setTestResult({
        success: true,
        message: `Successfully connected to '${tableName}'!`,
        rowCount: count ?? (data ? data.length : 0),
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setTestResult({
        success: false,
        message: error?.message || 'Connection failed. Please check URL, API Key & Table permissions.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveAndConnect = async () => {
    if (!config.url || !config.anonKey) {
      setTestResult({
        success: false,
        message: 'Supabase URL and Anon Key are required.',
      });
      return;
    }

    saveStoredSupabaseConfig(config);
    onConnected(config);
    onClose();
  };

  const handleDisconnect = () => {
    clearStoredSupabaseConfig();
    setConfig({ url: '', anonKey: '', tableName: 'orders' });
    setTestResult(null);
    onConnected({ url: '', anonKey: '', tableName: 'orders' });
    onClose();
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supabase-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 id="supabase-modal-title" className="text-base font-bold text-slate-900">
                Connect Supabase Database
              </h2>
              <p className="text-xs text-slate-500">
                Real-time connection with zero demo data
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Status Alert if tested */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 flex-1">
                <span className="font-semibold block">{testResult.message}</span>
                {testResult.success && testResult.rowCount !== undefined && (
                  <span className="text-[11px] text-emerald-700 block">
                    Found {testResult.rowCount} rows in table.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="space-y-3.5 text-xs">
            {/* Supabase URL */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Project URL</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://xyzprojectid.supabase.co"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono text-slate-900 transition-colors"
              />
              <p className="text-[11px] text-slate-400">
                Found in Supabase Project Settings → API → Project URL
              </p>
            </div>

            {/* Supabase Anon Key */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase Anon (Public) Key</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono text-slate-900 transition-colors"
              />
              <p className="text-[11px] text-slate-400">
                Found in Supabase Project Settings → API → Project API Keys (anon public)
              </p>
            </div>

            {/* Table Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-slate-400" />
                <span>Table Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="orders"
                value={config.tableName}
                onChange={(e) => setConfig({ ...config, tableName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono text-slate-900 transition-colors"
              />
              <p className="text-[11px] text-slate-400">
                Default: <code className="bg-slate-100 px-1 py-0.5 rounded">orders</code>. Column names like <code className="bg-slate-100 px-1 py-0.5 rounded">order_id</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">name</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">phone</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">product</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">total_bill</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">order_status</code> are automatically mapped.
              </p>
            </div>
          </div>

          {/* Collapsible Supabase Table Schema Helper */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowSqlSample(!showSqlSample)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-semibold text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Need table schema? View Supabase SQL script</span>
              </span>
              {showSqlSample ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showSqlSample && (
              <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] relative">
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="absolute top-2.5 right-2.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 text-[10px] border border-slate-700"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
                <pre className="overflow-x-auto whitespace-pre pr-14 leading-relaxed">
                  {sampleSql}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div>
            {getStoredSupabaseConfig().url && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium underline"
              >
                Disconnect Database
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={testing}
              onClick={handleTestConnection}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              type="button"
              onClick={handleSaveAndConnect}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-sm transition-colors"
            >
              Save & Load Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
