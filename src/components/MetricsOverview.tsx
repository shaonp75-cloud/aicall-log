import React from 'react';
import { ShoppingCart, CheckCircle, Clock, XCircle, TrendingUp, PhoneCall } from 'lucide-react';
import { OrderRecord } from '../types/order';

interface MetricsOverviewProps {
  orders: OrderRecord[];
  lang: 'bn' | 'en';
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ orders, lang }) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.totalBill : 0), 0);
  const confirmedCount = orders.filter((o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Delivered').length;
  const cancelledCount = orders.filter((o) => o.orderStatus === 'Cancelled').length;
  const pendingCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;

  const totalCallSeconds = orders.reduce((sum, o) => sum + (o.callDurationSeconds || 0), 0);
  const avgSeconds = totalOrders > 0 ? Math.round(totalCallSeconds / totalOrders) : 0;
  const avgMins = Math.floor(avgSeconds / 60);
  const avgSecsRemainder = avgSeconds % 60;
  const avgDurationFormatted = `${avgMins}m ${avgSecsRemainder < 10 ? '0' : ''}${avgSecsRemainder}s`;

  const confirmationRate = totalOrders > 0 ? Math.round((confirmedCount / totalOrders) * 100) : 0;
  const connectedCallsCount = orders.filter((o) => o.callDisposition !== 'No Answer / Unreachable' && o.callDisposition !== 'Wrong Number').length;
  const callConnectRate = totalOrders > 0 ? Math.round((connectedCallsCount / totalOrders) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Metric 1: Total Orders */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">
            {lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
          </span>
          <ShoppingCart className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalOrders}
          </span>
          <span className="text-xs text-slate-500">{lang === 'bn' ? 'টি' : 'orders'}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 font-mono">
          {pendingCount} {lang === 'bn' ? 'অপেক্ষমান' : 'pending queue'}
        </p>
      </div>

      {/* Metric 2: Total Revenue */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">
            {lang === 'bn' ? 'মোট বিক্রয় বিল' : 'Active Revenue'}
          </span>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            ৳{totalRevenue.toLocaleString()}
          </span>
        </div>
        <p className="text-[11px] text-emerald-600 mt-1">
          {lang === 'bn' ? 'সক্রিয় অর্ডারগুলোর মূল্য' : 'Excluding cancelled'}
        </p>
      </div>

      {/* Metric 3: Confirmation Rate */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">
            {lang === 'bn' ? 'কনফার্মেশন রেট' : 'Confirm Rate'}
          </span>
          <CheckCircle className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600">
            {confirmationRate}%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 font-mono">
          {confirmedCount} {lang === 'bn' ? 'টি নিশ্চিত' : 'confirmed'}
        </p>
      </div>

      {/* Metric 4: Call Connect Rate */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">
            {lang === 'bn' ? 'কল সংযোগ হার' : 'Call Connect'}
          </span>
          <PhoneCall className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {callConnectRate}%
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 font-mono">
          {connectedCallsCount}/{totalOrders} {lang === 'bn' ? 'সংযুক্ত' : 'connected'}
        </p>
      </div>

      {/* Metric 5: Avg Call Duration */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">
            {lang === 'bn' ? 'গড় কলের সময়' : 'Avg Duration'}
          </span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {avgDurationFormatted}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 font-mono">
          {Math.round(totalCallSeconds / 60)} {lang === 'bn' ? 'মিনিট মোট টকটাইম' : 'total call mins'}
        </p>
      </div>

      {/* Metric 6: Cancelled Count */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">
            {lang === 'bn' ? 'বাতিল অর্ডার' : 'Cancelled Orders'}
          </span>
          <XCircle className="w-4 h-4 text-rose-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">
            {cancelledCount}
          </span>
          <span className="text-xs text-rose-500 font-mono">
            ({totalOrders > 0 ? Math.round((cancelledCount / totalOrders) * 100) : 0}%)
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          {lang === 'bn' ? 'বাতিলের কারণ সহ ট্র্যাকড' : 'Tracked with reasons'}
        </p>
      </div>
    </div>
  );
};
