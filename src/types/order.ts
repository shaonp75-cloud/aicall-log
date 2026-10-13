export type OrderStatus = 'Confirmed' | 'Pending' | 'Processing' | 'Delivered' | 'Cancelled' | 'Returned';

export type CallDisposition = 
  | 'Confirmed on Call'
  | 'Follow-up Needed'
  | 'No Answer / Unreachable'
  | 'Cancelled by Customer'
  | 'Busy / Call Later'
  | 'Wrong Number'
  | 'Voice Mail';

export interface TranscriptMessage {
  speaker: 'Agent' | 'Customer';
  speakerBn?: string;
  time: string;
  text: string;
  textEn?: string;
}

export interface OrderRecord {
  id: string; // Order ID
  customerName: string; // Name
  customerNameBn?: string;
  phone: string; // Phone
  product: string; // Product
  productBn?: string;
  totalBill: number; // Total Bill (amount)
  orderStatus: OrderStatus; // Order Status
  cancelReason: string; // Cancel Reason (if cancelled)
  cancelReasonBn?: string;
  callDisposition: CallDisposition; // Call Disposition
  callDuration: string; // Call Duration (e.g., "2m 45s")
  callDurationSeconds: number;
  recordingUrl: string; // Recording Url
  transcriptUrl: string; // Transcript Url
  transcriptSummary?: string;
  transcriptSummaryBn?: string;
  transcriptMessages: TranscriptMessage[];
  sentiment?: 'Positive' | 'Neutral' | 'Hesitant' | 'Negative';
  agentName: string;
  agentNameBn?: string;
  createdAt: string; // Date string
  shippingAddress?: string;
  notes?: string;
}

export interface FilterState {
  search: string;
  status: OrderStatus | 'ALL';
  disposition: CallDisposition | 'ALL';
  hasCancelReason: boolean;
  sortBy: 'createdAt' | 'totalBill' | 'callDurationSeconds' | 'customerName' | 'id';
  sortOrder: 'asc' | 'desc';
}
