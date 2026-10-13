import React, { useState } from 'react';
import { X, Plus, AlertCircle, Phone, Package, DollarSign, Clock, Headphones, FileText } from 'lucide-react';
import { OrderRecord, OrderStatus, CallDisposition } from '../types/order';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: OrderRecord) => void;
  lang: 'bn' | 'en';
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  onAddOrder,
  lang,
}) => {
  if (!isOpen) return null;

  const defaultOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const [orderId, setOrderId] = useState<string>(defaultOrderId);
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('+880 ');
  const [product, setProduct] = useState<string>('');
  const [totalBill, setTotalBill] = useState<string>('1500');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Pending');
  const [cancelReason, setCancelReason] = useState<string>('-');
  const [callDisposition, setCallDisposition] = useState<CallDisposition>('Confirmed on Call');
  const [callDurationMinutes, setCallDurationMinutes] = useState<string>('2');
  const [callDurationSeconds, setCallDurationSeconds] = useState<string>('30');
  const [recordingUrl, setRecordingUrl] = useState<string>(`https://storage.googleapis.com/tele-recordings/calls/${defaultOrderId}-rec.mp3`);
  const [transcriptUrl, setTranscriptUrl] = useState<string>(`https://storage.googleapis.com/tele-recordings/transcripts/${defaultOrderId}.json`);
  const [transcriptText, setTranscriptText] = useState<string>('Customer confirmed the order. Requested express delivery.');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError(lang === 'bn' ? 'অর্ডার আইডি প্রয়োজন' : 'Order ID is required');
      return;
    }
    if (!customerName.trim()) {
      setError(lang === 'bn' ? 'গ্রাহকের নাম দিন' : 'Customer Name is required');
      return;
    }
    if (!phone.trim()) {
      setError(lang === 'bn' ? 'ফোন নম্বর দিন' : 'Phone is required');
      return;
    }
    if (!product.trim()) {
      setError(lang === 'bn' ? 'পণ্যের নাম দিন' : 'Product name is required');
      return;
    }

    const billNumber = parseFloat(totalBill) || 0;
    const mins = parseInt(callDurationMinutes) || 0;
    const secs = parseInt(callDurationSeconds) || 0;
    const totalSecs = mins * 60 + secs;
    const durationFormatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

    const newRecord: OrderRecord = {
      id: orderId.trim(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      product: product.trim(),
      totalBill: billNumber,
      orderStatus: orderStatus,
      cancelReason: orderStatus === 'Cancelled' ? (cancelReason.trim() || 'Customer requested') : '-',
      callDisposition: callDisposition,
      callDuration: durationFormatted,
      callDurationSeconds: totalSecs,
      recordingUrl: recordingUrl.trim() || `https://storage.googleapis.com/tele-recordings/calls/${orderId}-rec.mp3`,
      transcriptUrl: transcriptUrl.trim() || `https://storage.googleapis.com/tele-recordings/transcripts/${orderId}.json`,
      transcriptSummary: transcriptText,
      sentiment: orderStatus === 'Cancelled' ? 'Negative' : orderStatus === 'Confirmed' ? 'Positive' : 'Neutral',
      agentName: 'Staff Tele-Agent',
      createdAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      transcriptMessages: [
        {
          speaker: 'Agent',
          time: '00:03',
          text: `Hello, calling regarding your order #${orderId} for ${product.trim()}.`,
        },
        {
          speaker: 'Customer',
          time: '00:15',
          text: transcriptText,
        },
      ],
    };

    onAddOrder(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl max-h-[92vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-order-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-order-title" className="text-base font-semibold text-slate-900">
                {lang === 'bn' ? 'নতুন অর্ডার ও কল রেকর্ড যুক্ত করুন' : 'Add New Order & Call Record'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'ডাটাবেজের সব ১১টি ফিল্ড পূরণ করুন' : 'Fill all 11 fields for database record'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Order ID & Customer Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                1. {lang === 'bn' ? 'অর্ডার আইডি (Order ID)' : 'Order ID'} *
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                2. {lang === 'bn' ? 'গ্রাহকের নাম (Name)' : 'Customer Name'} *
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'bn' ? 'যেমন: তানভীর হাসান' : 'e.g. Tanvir Hasan'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Phone & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                3. {lang === 'bn' ? 'ফোন নম্বর (Phone)' : 'Phone Number'} *
              </label>
              <input
                type="text"
                required
                placeholder="+880 1712-XXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                4. {lang === 'bn' ? 'পণ্য (Product)' : 'Product'} *
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'bn' ? 'যেমন: ওয়্যারলেস ব্লুটুথ হেডফোন' : 'e.g. Wireless Headphones'}
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Total Bill & Order Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                5. {lang === 'bn' ? 'মোট বিল (Total Bill - ৳)' : 'Total Bill (BDT ৳)'} *
              </label>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={totalBill}
                onChange={(e) => setTotalBill(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                6. {lang === 'bn' ? 'অর্ডার স্ট্যাটাস (Order Status)' : 'Order Status'} *
              </label>
              <select
                value={orderStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as OrderStatus;
                  setOrderStatus(newStatus);
                  if (newStatus !== 'Cancelled') {
                    setCancelReason('-');
                  } else if (cancelReason === '-') {
                    setCancelReason('Customer changed mind');
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>

          {/* Row 4: Cancel Reason (Field 7) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              7. {lang === 'bn' ? 'বাতিলের কারণ (Cancel Reason)' : 'Cancel Reason'} {orderStatus === 'Cancelled' ? '(প্রযোজ্য)' : '(প্রযোজ্য নয় হলে -)'}
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder={orderStatus === 'Cancelled' ? 'বাতিলের সুনির্দিষ্ট কারণ লিখুন...' : '-'}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Row 5: Call Disposition & Call Duration (Field 8 & 9) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                8. {lang === 'bn' ? 'কল ডিসপজিশন (Call Disposition)' : 'Call Disposition'} *
              </label>
              <select
                value={callDisposition}
                onChange={(e) => setCallDisposition(e.target.value as CallDisposition)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Confirmed on Call">Confirmed on Call</option>
                <option value="Follow-up Needed">Follow-up Needed</option>
                <option value="No Answer / Unreachable">No Answer / Unreachable</option>
                <option value="Cancelled by Customer">Cancelled by Customer</option>
                <option value="Busy / Call Later">Busy / Call Later</option>
                <option value="Wrong Number">Wrong Number</option>
                <option value="Voice Mail">Voice Mail</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                9. {lang === 'bn' ? 'কলের সময়কাল (Call Duration)' : 'Call Duration'} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={callDurationMinutes}
                    onChange={(e) => setCallDurationMinutes(e.target.value)}
                    className="w-full px-2 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500">min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={callDurationSeconds}
                    onChange={(e) => setCallDurationSeconds(e.target.value)}
                    className="w-full px-2 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500">sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 6: Recording URL & Transcript URL (Field 10 & 11) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                10. {lang === 'bn' ? 'রেকর্ডিং URL (Recording Url)' : 'Recording Url'}
              </label>
              <input
                type="url"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                11. {lang === 'bn' ? 'ট্রান্সক্রিপ্ট URL (Transcript Url)' : 'Transcript Url'}
              </label>
              <input
                type="url"
                value={transcriptUrl}
                onChange={(e) => setTranscriptUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Transcript Dialogue Preview */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              {lang === 'bn' ? 'কলের সংক্ষিপ্ত বিবরণ / ট্রান্সক্রিপ্ট টেক্সট' : 'Call Dialogue Note / Transcript Summary'}
            </label>
            <textarea
              rows={2}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Summary of what customer and agent said..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {lang === 'bn' ? 'রো সেভ করুন' : 'Save Order Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
