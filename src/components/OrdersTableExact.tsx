import React, { useState } from 'react';
import { 
  Play, 
  Pause,
  FileText, 
  Check, 
  X, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Database,
  ExternalLink,
  RefreshCw,
  Copy,
  Phone
} from 'lucide-react';
import { NormalizedOrder } from '../services/orderMapper';

interface OrdersTableExactProps {
  orders: NormalizedOrder[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpenRecording: (order: NormalizedOrder) => void;
  onOpenTranscript: (order: NormalizedOrder) => void;
  onOpenDetail: (order: NormalizedOrder) => void;
  isConnected: boolean;
  onOpenConnectModal: () => void;
  isLoading: boolean;
  tableName?: string;
  onRefresh?: () => void;
}

export const OrdersTableExact: React.FC<OrdersTableExactProps> = ({
  orders,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onOpenRecording,
  onOpenTranscript,
  onOpenDetail,
  isConnected,
  onOpenConnectModal,
  isLoading,
  tableName = 'dograh_log',
  onRefresh,
}) => {
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const handleCopyPhone = (phoneStr: string, orderId: string) => {
    if (!phoneStr) return;
    navigator.clipboard.writeText(phoneStr);
    setCopiedPhoneId(orderId);
    setTimeout(() => {
      setCopiedPhoneId(null);
    }, 2000);
  };

  const handleCopyOrderId = (idStr: string) => {
    if (!idStr) return;
    const cleanId = idStr.replace(/^#+/, '').trim();
    navigator.clipboard.writeText(cleanId);
    setCopiedOrderId(cleanId);
    setTimeout(() => {
      setCopiedOrderId(null);
    }, 2000);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalCount, currentPage * pageSize);

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('confirm') || s.includes('delivered')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d1fae5] text-[#065f46]">
          <span className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-white shrink-0">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span>Confirmed</span>
        </span>
      );
    }
    if (s.includes('cancel') || s.includes('reject')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#b91c1c]">
          <span className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center text-white shrink-0">
            <X className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span>Cancelled</span>
        </span>
      );
    }
    // Pending
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#b45309]">
        <span className="w-4 h-4 rounded-full border border-[#d97706] flex items-center justify-center text-[#d97706] shrink-0">
          <Clock className="w-2.5 h-2.5 stroke-[2.5]" />
        </span>
        <span>Pending</span>
      </span>
    );
  };

  const renderCallDisposition = (disp: string) => {
    if (!disp || disp === '-' || disp === '—') {
      return <span className="text-slate-400 font-medium">—</span>;
    }

    const lower = disp.toLowerCase();
    if (lower.includes('hangup') || lower.includes('cancel') || lower.includes('failed')) {
      return (
        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-[#fef2f2] text-[#ef4444]">
          {disp}
        </span>
      );
    }

    if (lower.includes('confirm') || lower.includes('connected')) {
      return (
        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#059669]">
          {disp}
        </span>
      );
    }

    return (
      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        {disp}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header row */}
          <thead>
            <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 text-xs font-semibold">
              <th className="py-4 px-5 whitespace-nowrap min-w-[140px]">
                Order ID /<br />Date &amp; Time
              </th>
              <th className="py-4 px-5 whitespace-nowrap min-w-[140px]">Customer</th>
              <th className="py-4 px-5 whitespace-nowrap min-w-[160px]">Product</th>
              <th className="py-4 px-5 whitespace-nowrap min-w-[100px]">Total Bill</th>
              <th className="py-4 px-5 whitespace-nowrap min-w-[130px]">Order Status</th>
              <th className="py-4 px-5 whitespace-nowrap min-w-[100px]">Call Duration</th>
              <th className="py-4 px-5 whitespace-nowrap min-w-[140px]">Call Disposition</th>
              <th className="py-4 px-5 whitespace-nowrap text-center min-w-[140px]">Action</th>
            </tr>
          </thead>

          {/* Body rows */}
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-medium text-slate-600">Loading Supabase orders...</p>
                  </div>
                </td>
              </tr>
            ) : !isConnected ? (
              /* When Supabase is not connected - NO DEMO DATA */
              <tr>
                <td colSpan={8} className="py-16 px-6 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Database className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900">
                        Connect Supabase Database
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        No demo data is displayed. Connect your Supabase Project URL and API Key to load live orders directly.
                      </p>
                    </div>
                    <button
                      onClick={onOpenConnectModal}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      <span>Connect Supabase Database</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              /* When Supabase is connected but table has 0 matching orders */
              <tr>
                <td colSpan={8} className="py-12 px-6 text-center text-slate-500">
                  <div className="max-w-xl mx-auto flex flex-col items-center space-y-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">
                        Connected to Supabase table <code className="bg-slate-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">{tableName}</code>, but no orders returned
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                        If rows exist in your table but do not appear, Supabase <strong>Row Level Security (RLS)</strong> is restricting public read access. Run this query in your Supabase SQL Editor:
                      </p>
                    </div>

                    {/* Quick SQL Helper Box */}
                    <div className="w-full text-left bg-slate-900 text-slate-100 rounded-xl p-3.5 text-xs font-mono relative overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-2 text-[11px]">
                        <span>Paste in Supabase SQL Editor &amp; Run:</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `ALTER TABLE public.dograh_log DISABLE ROW LEVEL SECURITY;\nGRANT SELECT ON TABLE public.dograh_log TO anon, authenticated;`
                            );
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-sans text-[11px] font-semibold transition-colors"
                        >
                          Copy SQL
                        </button>
                      </div>
                      <pre className="text-emerald-400 text-[11px] overflow-x-auto whitespace-pre leading-relaxed">
{`ALTER TABLE public.dograh_log DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.dograh_log TO anon, authenticated;`}
                      </pre>
                    </div>

                    {onRefresh && (
                      <button
                        onClick={onRefresh}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh Orders</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-slate-50/80 transition-colors border-b-2 border-slate-200"
                >
                  {/* 1. Order ID / Date & Time */}
                  <td className="py-4 px-5">
                    <div className="space-y-1">
                      {/* Purple Label for Order ID without # + Copy button */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(order)}
                          className="inline-flex items-center px-2.5 py-1 rounded-md font-mono font-bold text-xs bg-purple-100/90 text-purple-800 border border-purple-200 hover:bg-purple-200 transition-colors shadow-2xs"
                          title="Click to view details"
                        >
                          {order.orderNumber.replace(/^#+/, '')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(order.orderNumber)}
                          className="p-1 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors inline-flex items-center"
                          title={copiedOrderId === order.orderNumber.replace(/^#+/, '') ? 'Copied!' : 'Copy Order ID'}
                          aria-label="Copy Order ID"
                        >
                          {copiedOrderId === order.orderNumber.replace(/^#+/, '') ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1 py-0.5 rounded">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </span>
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-purple-600" />
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        {order.dateStr}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {order.timeStr}
                      </div>
                    </div>
                  </td>

                  {/* 2. Customer */}
                  <td className="py-4 px-5">
                    <div className="font-semibold text-slate-900 text-sm">
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <a
                        href={`tel:${order.phone}`}
                        className="text-xs font-mono font-medium text-slate-700 hover:text-emerald-700 hover:underline"
                        title="Click to call"
                      >
                        {order.phone || '—'}
                      </a>
                      {order.phone && (
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(order.phone, order.id)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors inline-flex items-center"
                          title={copiedPhoneId === order.id ? 'Copied!' : 'Copy phone number'}
                          aria-label="Copy phone number"
                        >
                          {copiedPhoneId === order.id ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1 py-0.5 rounded">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </span>
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* 3. Product */}
                  <td className="py-4 px-5 text-sm text-slate-800">
                    <span className="line-clamp-2">{order.product}</span>
                  </td>

                  {/* 4. Total Bill with Bengali Taka symbol */}
                  <td className="py-4 px-5 font-bold text-[#0f172a] text-[15px] whitespace-nowrap">
                    ৳ {order.totalBill.toLocaleString()}
                  </td>

                  {/* 5. Order Status Pill Badge & Cancel Reason (Full text without truncation) */}
                  <td className="py-4 px-5 min-w-[150px]">
                    <div className="flex flex-col items-start gap-1.5">
                      {renderStatusBadge(order.orderStatus)}
                      {order.cancelReason && order.cancelReason !== '-' && order.cancelReason !== '—' && (
                        <div 
                          className="text-xs font-medium text-rose-600 bg-rose-50/90 border border-rose-200/90 px-2.5 py-1 rounded-md whitespace-normal break-words max-w-[240px] leading-relaxed shadow-2xs"
                          title={`Cancel Reason: ${order.cancelReason}`}
                        >
                          {order.cancelReason}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 6. Call Duration */}
                  <td className="py-4 px-5 font-mono text-slate-600 text-sm whitespace-nowrap">
                    {order.callDuration}
                  </td>

                  {/* 7. Call Disposition */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {renderCallDisposition(order.callDisposition)}
                  </td>

                  {/* 8. Action - Recording & Transcript matching image.png */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      {/* Recording button */}
                      <button
                        type="button"
                        onClick={() => onOpenRecording(order)}
                        className="w-14 py-1.5 px-1 bg-[#eff6ff] hover:bg-[#dbeafe] border border-[#bfdbfe] rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group shadow-2xs"
                        title={order.recordingUrl ? `Play recording: ${order.recordingUrl}` : 'Play recording'}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#2563eb] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                        <span className="text-[10px] font-medium text-[#2563eb]">
                          Recording
                        </span>
                      </button>

                      {/* Transcript button */}
                      <button
                        type="button"
                        onClick={() => onOpenTranscript(order)}
                        className="w-14 py-1.5 px-1 bg-[#eff6ff] hover:bg-[#dbeafe] border border-[#bfdbfe] rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group shadow-2xs"
                        title={order.transcriptUrl ? `View transcript: ${order.transcriptUrl}` : 'View transcript'}
                      >
                        <div className="w-6 h-6 flex items-center justify-center text-[#2563eb]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-[#2563eb]">
                          Transcript
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching image.png */}
      <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing {totalCount === 0 ? '0' : `${startIndex}–${endIndex}`} of {totalCount.toLocaleString()} orders
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-[#047857] text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && (
            <>
              <span className="px-1 text-slate-400">...</span>
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                  currentPage === totalPages
                    ? 'bg-[#047857] text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
