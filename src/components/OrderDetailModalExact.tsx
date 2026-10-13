import React from 'react';
import { X, Headphones, FileText, Phone, MapPin, Package, Clock, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { NormalizedOrder } from '../services/orderMapper';

interface OrderDetailModalExactProps {
  order: NormalizedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAudio: (order: NormalizedOrder) => void;
  onOpenTranscript: (order: NormalizedOrder) => void;
}

export const OrderDetailModalExact: React.FC<OrderDetailModalExactProps> = ({
  order,
  isOpen,
  onClose,
  onOpenAudio,
  onOpenTranscript,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-exact-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 id="order-detail-exact-title" className="text-base font-bold text-slate-900">
              Order {order.orderNumber}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {order.dateStr} · {order.timeStr}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Status & Bill Hero */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Bill</span>
              <span className="text-2xl font-bold font-mono text-[#0f172a]">
                ৳ {order.totalBill.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px] mb-1">Current Status</span>
              <span className="inline-block px-3 py-1 rounded-full font-semibold text-xs bg-emerald-100 text-emerald-800">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Customer & Product */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[11px]">Customer</span>
              <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 font-mono">{order.phone || '—'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[11px]">Product</span>
              <p className="text-sm font-semibold text-slate-900">{order.product}</p>
            </div>
          </div>

          {/* Call & Telephony */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Call Disposition</span>
                <span className="font-bold text-slate-900 text-sm">{order.callDisposition}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Call Duration</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{order.callDuration}</span>
              </div>
            </div>

            {order.cancelReason && order.cancelReason !== '-' && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                <span className="font-semibold block text-[11px]">Cancel Reason:</span>
                <span>{order.cancelReason}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenAudio(order)}
                className="flex-1 py-2 px-3 bg-white hover:bg-blue-50 border border-blue-200 text-[#2563eb] rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Play Recording</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenTranscript(order)}
                className="flex-1 py-2 px-3 bg-white hover:bg-blue-50 border border-blue-200 text-[#2563eb] rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Transcript</span>
              </button>
            </div>
          </div>

          {/* Raw Database Payload (Inspectable) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-3.5 py-2 bg-slate-100 text-slate-700 font-semibold text-[11px]">
              Raw Supabase Record Fields
            </div>
            <pre className="p-3 bg-slate-50 text-slate-700 font-mono text-[10px] max-h-40 overflow-y-auto leading-relaxed">
              {JSON.stringify(order.raw, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
