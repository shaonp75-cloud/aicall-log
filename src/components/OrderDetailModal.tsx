import React, { useState } from 'react';
import { X, Headphones, FileText, CheckCircle2, Clock, Phone, MapPin, Package, Calendar, User, DollarSign, AlertCircle } from 'lucide-react';
import { OrderRecord, OrderStatus, CallDisposition } from '../types/order';

interface OrderDetailModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder: (updatedOrder: OrderRecord) => void;
  onOpenAudio: (order: OrderRecord) => void;
  onOpenTranscript: (order: OrderRecord) => void;
  lang: 'bn' | 'en';
}

const COMMON_CANCEL_REASONS = [
  "Customer changed mind",
  "Delivery delay issue",
  "High delivery charge / Found cheaper elsewhere",
  "Ordered by mistake / Child placed order",
  "Customer unreachable after 3 attempts",
  "Size doubt / Not sure about fitting",
  "Duplicate order",
  "Cash shortage at delivery time"
];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateOrder,
  onOpenAudio,
  onOpenTranscript,
  lang,
}) => {
  if (!isOpen || !order) return null;

  const [status, setStatus] = useState<OrderStatus>(order.orderStatus);
  const [cancelReason, setCancelReason] = useState<string>(order.cancelReason === '-' ? '' : order.cancelReason);
  const [disposition, setDisposition] = useState<CallDisposition>(order.callDisposition);
  const [notes, setNotes] = useState<string>(order.notes || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    const updated: OrderRecord = {
      ...order,
      orderStatus: status,
      cancelReason: status === 'Cancelled' ? (cancelReason.trim() || 'Customer requested cancellation') : '-',
      callDisposition: disposition,
      notes: notes,
    };
    onUpdateOrder(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl max-h-[92vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 id="order-detail-title" className="text-base font-semibold text-slate-900">
                {lang === 'bn' ? `অর্ডার বিবরণী #${order.id}` : `Order Details #${order.id}`}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {order.createdAt} · {order.agentName ? `Agent: ${order.agentName}` : ''}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick info cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'গ্রাহকের তথ্য' : 'Customer Info'}
              </span>
              <p className="text-sm font-semibold text-slate-900">{order.customerName}</p>
              <p className="text-xs text-slate-600 font-mono flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {order.phone}
              </p>
              {order.shippingAddress && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{order.shippingAddress}</span>
                </p>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'অর্ডার ও বিল' : 'Order & Billing'}
              </span>
              <p className="text-sm font-semibold text-slate-900 truncate">{order.product}</p>
              <p className="text-base font-bold text-slate-900 font-mono">
                ৳{order.totalBill.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500">
                {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)'}
              </p>
            </div>
          </div>

          {/* Call & Audio / Transcript Quick Access Bar */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-md">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900">
                  {lang === 'bn' ? 'কল সম্পন্ন হয়েছে' : 'Call Recorded'}: <span className="font-mono">{order.callDuration}</span>
                </p>
                <p className="text-slate-500">
                  {order.callDisposition}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAudio(order)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors shadow-2xs"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'অডিও শুনুন' : 'Audio'}</span>
              </button>
              <button
                onClick={() => onOpenTranscript(order)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ট্রান্সক্রিপ্ট' : 'Transcript'}</span>
              </button>
            </div>
          </div>

          {/* Status & Disposition Editor Form */}
          <div className="space-y-4 pt-1">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {lang === 'bn' ? 'স্ট্যাটাস ও কল ফলাফল আপডেট করুন' : 'Update Status & Dispositions'}
            </h3>

            {/* Order Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                {lang === 'bn' ? 'অর্ডার স্ট্যাটাস (Order Status)' : 'Order Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Confirmed">Confirmed (নিশ্চিত)</option>
                <option value="Pending">Pending (অপেক্ষমান)</option>
                <option value="Processing">Processing (প্রক্রিয়াধীন)</option>
                <option value="Delivered">Delivered (ডেলিভার্ড)</option>
                <option value="Cancelled">Cancelled (বাতিল)</option>
                <option value="Returned">Returned (রিটার্ন)</option>
              </select>
            </div>

            {/* Cancel Reason (visible if status is Cancelled or user wants to add) */}
            {status === 'Cancelled' && (
              <div className="space-y-1.5 p-3.5 bg-rose-50/60 border border-rose-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-rose-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'বাতিলের কারণ (Cancel Reason)' : 'Cancel Reason (Required)'}
                  </label>
                </div>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: কাস্টমার রিচ করা যায়নি / দাম বেশি' : 'e.g. Customer changed mind / Unreachable'}
                  className="w-full px-3 py-2 text-xs bg-white border border-rose-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
                {/* Preset shortcuts */}
                <div className="pt-1.5">
                  <span className="text-[11px] text-slate-500 block mb-1">
                    {lang === 'bn' ? 'সাধারণ কারণসমূহ নির্বাচন করুন:' : 'Quick Select:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_CANCEL_REASONS.slice(0, 4).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCancelReason(r)}
                        className="text-[11px] px-2 py-0.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Call Disposition */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                {lang === 'bn' ? 'কল ডিসপজিশন (Call Disposition)' : 'Call Disposition'}
              </label>
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value as CallDisposition)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Confirmed on Call">Confirmed on Call (ফোনে কনফার্ম)</option>
                <option value="Follow-up Needed">Follow-up Needed (পুনরায় যোগাযোগ প্রয়োজন)</option>
                <option value="No Answer / Unreachable">No Answer / Unreachable (ফোন ধরেনি / বন্ধ)</option>
                <option value="Cancelled by Customer">Cancelled by Customer (গ্রাহক বাতিল করেছেন)</option>
                <option value="Busy / Call Later">Busy / Call Later (ব্যস্ত / পরে কল দিতে বলেছে)</option>
                <option value="Wrong Number">Wrong Number (ভুল নম্বর)</option>
                <option value="Voice Mail">Voice Mail (ভয়েস মেইল)</option>
              </select>
            </div>

            {/* Internal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                {lang === 'bn' ? 'অর্ডার নোটস (Internal Notes)' : 'Internal Notes'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === 'bn' ? 'অতিরিক্ত কোনো মন্তব্য বা স্পেশাল ইন্সট্রাকশন...' : 'Special instructions or delivery notes...'}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
            <span>{isSaved ? (lang === 'bn' ? 'সংরক্ষিত হয়েছে' : 'Saved!') : (lang === 'bn' ? 'আপডেট সংরক্ষণ করুন' : 'Save Changes')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
