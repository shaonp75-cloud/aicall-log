import React from 'react';
import { Package, Check, X, Clock } from 'lucide-react';

interface MetricCardsProps {
  totalOrders: number;
  confirmedCount: number;
  cancelledCount: number;
  pendingCount: number;
  isConnected: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalOrders,
  confirmedCount,
  cancelledCount,
  pendingCount,
  isConnected,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Orders */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
          <Package className="w-6 h-6 text-[#10b981]" strokeWidth={2} />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-slate-500">Total Orders</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
            {isConnected ? totalOrders.toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* 2. Confirmed */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#10b981] flex items-center justify-center text-white">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-slate-500">Confirmed</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
            {isConnected ? confirmedCount.toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* 3. Cancelled */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#ef4444] flex items-center justify-center text-white">
            <X className="w-4 h-4 stroke-[3]" />
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-slate-500">Cancelled</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
            {isConnected ? cancelledCount.toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* 4. Pending */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-[#fef3c7] flex items-center justify-center shrink-0">
          <div className="w-7 h-7 rounded-full border-2 border-[#d97706] flex items-center justify-center text-[#d97706]">
            <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-slate-500">Pending</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
            {isConnected ? pendingCount.toLocaleString() : '0'}
          </p>
        </div>
      </div>
    </div>
  );
};
