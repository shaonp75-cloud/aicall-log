import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  FileText, 
  Phone, 
  ExternalLink, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { OrderRecord, OrderStatus } from '../types/order';
import { audioEngine } from '../utils/audioSynthesizer';

interface OrderTableProps {
  orders: OrderRecord[];
  onOpenAudio: (order: OrderRecord) => void;
  onOpenTranscript: (order: OrderRecord) => void;
  onOpenDetail: (order: OrderRecord) => void;
  onQuickStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  lang: 'bn' | 'en';
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onOpenAudio,
  onOpenTranscript,
  onOpenDetail,
  onQuickStatusChange,
  lang,
}) => {
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  const handleInlineAudioToggle = (order: OrderRecord) => {
    if (activePlayingId === order.id) {
      audioEngine.stop();
      setActivePlayingId(null);
    } else {
      setActivePlayingId(order.id);
      audioEngine.play(
        order.id,
        order.callDurationSeconds || 60,
        order.transcriptSummary || `${order.customerName} on call`,
        1.0,
        undefined,
        () => {
          setActivePlayingId(null);
        }
      );
    }
  };

  const renderOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{lang === 'bn' ? 'Confirmed (নিশ্চিত)' : 'Confirmed'}</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50/80 border border-amber-200/80 px-2 py-0.5 rounded-md">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{lang === 'bn' ? 'Pending (অপেক্ষমান)' : 'Pending'}</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/80 px-2 py-0.5 rounded-md">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{lang === 'bn' ? 'Processing (প্রক্রিয়াধীন)' : 'Processing'}</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50/80 border border-teal-200/80 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{lang === 'bn' ? 'Delivered (ডেলিভার্ড)' : 'Delivered'}</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50/80 border border-rose-200/80 px-2 py-0.5 rounded-md">
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{lang === 'bn' ? 'Cancelled (বাতিল)' : 'Cancelled'}</span>
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50/80 border border-purple-200/80 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{lang === 'bn' ? 'Returned (রিটার্ন)' : 'Returned'}</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-700">{status}</span>;
    }
  };

  const renderCallDisposition = (disposition: string) => {
    let colorClass = 'text-slate-700';
    if (disposition.includes('Confirmed')) colorClass = 'text-emerald-700 font-medium';
    else if (disposition.includes('Cancelled')) colorClass = 'text-rose-700 font-medium';
    else if (disposition.includes('No Answer') || disposition.includes('Unreachable')) colorClass = 'text-amber-700';
    else if (disposition.includes('Busy') || disposition.includes('Follow-up')) colorClass = 'text-blue-700';

    return (
      <span className={`text-xs ${colorClass}`}>
        {disposition}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header with all 11 columns */}
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold tracking-wide">
              {/* 1. Order ID */}
              <th className="py-3 px-4 whitespace-nowrap">
                {lang === 'bn' ? 'অর্ডার আইডি' : 'Order ID'}
              </th>
              {/* 2. Name */}
              <th className="py-3 px-4 min-w-[140px]">
                {lang === 'bn' ? 'গ্রাহকের নাম' : 'Name'}
              </th>
              {/* 3. Phone */}
              <th className="py-3 px-4 whitespace-nowrap font-mono">
                {lang === 'bn' ? 'ফোন নম্বর' : 'Phone'}
              </th>
              {/* 4. Product */}
              <th className="py-3 px-4 min-w-[170px]">
                {lang === 'bn' ? 'পণ্য' : 'Product'}
              </th>
              {/* 5. Total Bill */}
              <th className="py-3 px-4 whitespace-nowrap text-right font-mono">
                {lang === 'bn' ? 'মোট বিল' : 'Total Bill'}
              </th>
              {/* 6. Order Status */}
              <th className="py-3 px-4 whitespace-nowrap">
                {lang === 'bn' ? 'অর্ডার স্ট্যাটাস' : 'Order Status'}
              </th>
              {/* 7. Cancel Reason */}
              <th className="py-3 px-4 min-w-[160px]">
                {lang === 'bn' ? 'বাতিলের কারণ' : 'Cancel Reason'}
              </th>
              {/* 8. Call Disposition */}
              <th className="py-3 px-4 min-w-[150px]">
                {lang === 'bn' ? 'কল ডিসপজিশন' : 'Call Disposition'}
              </th>
              {/* 9. Call Duration */}
              <th className="py-3 px-4 whitespace-nowrap font-mono text-center">
                {lang === 'bn' ? 'কলের সময়কাল' : 'Call Duration'}
              </th>
              {/* 10. Recording Url */}
              <th className="py-3 px-4 whitespace-nowrap text-center">
                {lang === 'bn' ? 'রেকর্ডিং' : 'Recording'}
              </th>
              {/* 11. Transcript Url */}
              <th className="py-3 px-4 whitespace-nowrap text-center">
                {lang === 'bn' ? 'ট্রান্সক্রিপ্ট' : 'Transcript'}
              </th>
              {/* Actions */}
              <th className="py-3 px-3 text-right whitespace-nowrap">
                {lang === 'bn' ? 'অ্যাকশন' : 'Actions'}
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="text-sm font-medium text-slate-600">
                      {lang === 'bn' ? 'কোনো অর্ডার রেকর্ড পাওয়া যায়নি' : 'No order records found'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {lang === 'bn' ? 'ফিল্টার পরিবর্তন করুন অথবা নতুন অর্ডার যোগ করুন' : 'Try adjusting filters or add a new order.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isPlaying = activePlayingId === order.id;

                return (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* 1. Order ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenDetail(order)}
                          className="font-mono font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                        >
                          {order.id}
                        </button>
                      </div>
                    </td>

                    {/* 2. Customer Name */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 leading-tight">
                        {order.customerName}
                      </div>
                      {order.customerNameBn && lang === 'bn' && (
                        <div className="text-[11px] text-slate-500 pt-0.5">
                          {order.customerNameBn}
                        </div>
                      )}
                    </td>

                    {/* 3. Phone */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                      <a 
                        href={`tel:${order.phone}`} 
                        className="hover:text-indigo-600 hover:underline inline-flex items-center gap-1"
                        title={lang === 'bn' ? 'কল করুন' : 'Call number'}
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{order.phone}</span>
                      </a>
                    </td>

                    {/* 4. Product */}
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium line-clamp-1" title={order.product}>
                        {order.product}
                      </div>
                    </td>

                    {/* 5. Total Bill */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                      ৳{order.totalBill.toLocaleString()}
                    </td>

                    {/* 6. Order Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderOrderStatusBadge(order.orderStatus)}
                    </td>

                    {/* 7. Cancel Reason */}
                    <td className="py-3 px-4">
                      {order.cancelReason && order.cancelReason !== '-' ? (
                        <span className="text-rose-600 font-medium text-xs leading-snug line-clamp-2" title={order.cancelReason}>
                          {lang === 'bn' && order.cancelReasonBn ? order.cancelReasonBn : order.cancelReason}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* 8. Call Disposition */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderCallDisposition(order.callDisposition)}
                    </td>

                    {/* 9. Call Duration */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-center text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                        {order.callDuration}
                      </span>
                    </td>

                    {/* 10. Recording Url & Audio Action */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Quick inline Play/Pause */}
                        <button
                          onClick={() => handleInlineAudioToggle(order)}
                          className={`p-1.5 rounded-full transition-all ${
                            isPlaying
                              ? 'bg-indigo-600 text-white animate-pulse'
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800'
                          }`}
                          title={isPlaying ? 'Pause' : 'Quick Play Call Audio'}
                          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                        </button>

                        {/* Open Player Modal */}
                        <button
                          onClick={() => onOpenAudio(order)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title={lang === 'bn' ? 'প্লেয়ার ডায়ালগ খুলুন' : 'Open Audio Player'}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* 11. Transcript Url & View Button */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onOpenTranscript(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/70 rounded-md transition-colors"
                        title={lang === 'bn' ? 'ট্রান্সক্রিপ্ট পড়ুন' : 'View Transcript'}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'পাঠ' : 'Read'}</span>
                      </button>
                    </td>

                    {/* Row Action: Details & Quick Status */}
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenDetail(order)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title={lang === 'bn' ? 'সম্পূর্ণ বিবরণ দেখুন ও এডিট করুন' : 'View & Edit Details'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Stats */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>{lang === 'bn' ? 'প্রদর্শিত রো সংখ্যা:' : 'Showing:'}</span>
          <span className="font-mono font-semibold text-slate-800">{orders.length}</span>
          <span>{lang === 'bn' ? 'টি অর্ডার' : 'orders'}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span>
            {lang === 'bn' ? 'মোট মূল্য:' : 'Subtotal:'}{' '}
            <strong className="text-slate-800 font-bold">
              ৳{orders.reduce((sum, o) => sum + o.totalBill, 0).toLocaleString()}
            </strong>
          </span>
          <span>·</span>
          <span>
            {lang === 'bn' ? 'বাতিল:' : 'Cancelled:'}{' '}
            <strong className="text-rose-600 font-bold">
              {orders.filter((o) => o.orderStatus === 'Cancelled').length}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
