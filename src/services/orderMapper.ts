export interface NormalizedOrder {
  id: string;
  orderNumber: string; // e.g. "#URB-10482"
  dateStr: string;     // e.g. "14 Oct 2026"
  timeStr: string;     // e.g. "10:42 AM"
  rawDate: string;
  customerName: string;
  phone: string;
  phoneMasked: string; // e.g. "01•••••4582"
  product: string;
  totalBill: number;
  orderStatus: 'Confirmed' | 'Cancelled' | 'Pending' | string;
  cancelReason: string;
  callDisposition: string;
  callDuration: string; // e.g. "00:48"
  callDurationSeconds: number;
  recordingUrl: string;
  transcriptUrl: string;
  transcriptText?: string;
  raw: Record<string, unknown>;
}

function maskPhone(phoneStr: string): string {
  if (!phoneStr) return '—';
  const clean = phoneStr.replace(/\s+/g, '');
  if (clean.length >= 10) {
    const firstTwo = clean.slice(0, 2);
    const lastFour = clean.slice(-4);
    return `${firstTwo}•••••${lastFour}`;
  }
  return phoneStr;
}

function formatDuration(val: unknown): { formatted: string; seconds: number } {
  if (!val) return { formatted: '00:00', seconds: 0 };
  
  if (typeof val === 'number') {
    const mins = Math.floor(val / 60);
    const secs = Math.floor(val % 60);
    return {
      formatted: `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`,
      seconds: val,
    };
  }

  const str = String(val).trim();
  // Check if mm:ss or hh:mm:ss format already
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 2) {
      const mins = parts[0];
      const secs = parts[1];
      return {
        formatted: `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`,
        seconds: mins * 60 + secs,
      };
    } else if (parts.length === 3) {
      const mins = parts[1];
      const secs = parts[2];
      return {
        formatted: `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`,
        seconds: parts[0] * 3600 + mins * 60 + secs,
      };
    }
  }

  // Check if "2m 30s" or "45s" format
  const minMatch = str.match(/(\d+)\s*m/i);
  const secMatch = str.match(/(\d+)\s*s/i);
  if (minMatch || secMatch) {
    const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
    const secs = secMatch ? parseInt(secMatch[1], 10) : 0;
    return {
      formatted: `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`,
      seconds: mins * 60 + secs,
    };
  }

  // Fallback if numeric string
  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    const mins = Math.floor(num / 60);
    const secs = Math.floor(num % 60);
    return {
      formatted: `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`,
      seconds: num,
    };
  }

  return { formatted: str || '00:00', seconds: 0 };
}

function parseOrderDateTime(rawDate: unknown): { dateStr: string; timeStr: string; rawDate: string } {
  if (!rawDate) {
    const now = new Date();
    return {
      dateStr: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeStr: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      rawDate: now.toISOString(),
    };
  }

  try {
    const d = new Date(String(rawDate));
    if (!isNaN(d.getTime())) {
      const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return {
        dateStr: day,
        timeStr: time,
        rawDate: d.toISOString(),
      };
    }
  } catch {
    // Ignore error
  }

  const str = String(rawDate);
  return {
    dateStr: str.slice(0, 11) || '14 Oct 2026',
    timeStr: str.slice(11, 20) || '10:00 AM',
    rawDate: str,
  };
}

export function mapSupabaseRowToOrder(row: Record<string, unknown>, index: number): NormalizedOrder {
  // Build normalized lookup dictionary (strips spaces, underscores, hyphens, and lowercases)
  const lookup: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    lookup[k.toLowerCase().replace(/[\s_-]+/g, '')] = v;
    lookup[k.toLowerCase()] = v;
  }

  // 1. Order ID
  const rawId = 
    lookup['orderid'] ?? 
    lookup['ordernumber'] ?? 
    lookup['orderno'] ?? 
    lookup['order_id'] ?? 
    lookup['id'] ?? 
    `URB-${10480 + index}`;

  const idStr = String(rawId).replace(/^#+/, '').trim();
  const orderNumber = idStr;

  // Date and Time
  const dateField = 
    lookup['createdat'] ?? 
    lookup['date'] ?? 
    lookup['orderdate'] ?? 
    lookup['timestamp'] ?? 
    lookup['created_at'];
  const { dateStr, timeStr, rawDate } = parseOrderDateTime(dateField);

  // 2. Customer Name
  const customerName = String(
    lookup['customername'] ?? 
    lookup['name'] ?? 
    lookup['customer'] ?? 
    lookup['clientname'] ?? 
    'Customer'
  );

  // 3. Phone
  const rawPhone = String(
    lookup['phone'] ?? 
    lookup['phonenumber'] ?? 
    lookup['phoneno'] ?? 
    lookup['mobile'] ?? 
    lookup['contact'] ?? 
    ''
  );
  const phoneMasked = maskPhone(rawPhone);

  // 4. Product
  const product = String(
    lookup['product'] ?? 
    lookup['productname'] ?? 
    lookup['items'] ?? 
    lookup['item'] ?? 
    'Product Item'
  );

  // 5. Total Bill
  const rawBill = 
    lookup['totalbill'] ?? 
    lookup['total'] ?? 
    lookup['bill'] ?? 
    lookup['amount'] ?? 
    lookup['price'] ?? 
    0;
  const totalBill = typeof rawBill === 'number' ? rawBill : parseFloat(String(rawBill).replace(/[^0-9.]/g, '')) || 0;

  // 6. Order Status
  const rawStatus = String(
    lookup['orderstatus'] ?? 
    lookup['status'] ?? 
    'Pending'
  ).trim();

  let orderStatus: 'Confirmed' | 'Cancelled' | 'Pending' | string = 'Pending';
  const lowerStatus = rawStatus.toLowerCase();
  if (lowerStatus.includes('confirm') || lowerStatus.includes('delivered') || lowerStatus.includes('success')) {
    orderStatus = 'Confirmed';
  } else if (lowerStatus.includes('cancel') || lowerStatus.includes('reject') || lowerStatus.includes('fail')) {
    orderStatus = 'Cancelled';
  } else if (lowerStatus.includes('pend') || lowerStatus.includes('process') || lowerStatus.includes('new')) {
    orderStatus = 'Pending';
  } else {
    orderStatus = rawStatus;
  }

  // 7. Cancel Reason
  const rawCancel = 
    lookup['cancelreason'] ?? 
    lookup['cancellationreason'] ?? 
    lookup['reason'] ?? 
    '';
  const cancelReason = String(rawCancel ?? '').trim();

  // 8. Call Disposition
  const rawDisp = 
    lookup['calldisposition'] ?? 
    lookup['disposition'] ?? 
    lookup['callstatus'] ?? 
    '';
  let callDisposition = String(rawDisp ?? '').trim();
  if (!callDisposition || callDisposition === '-') {
    callDisposition = '—';
  }

  // 9. Call Duration
  const rawDuration = 
    lookup['calldurationseconds'] ?? 
    lookup['durationseconds'] ?? 
    lookup['callduration'] ?? 
    lookup['duration'];
  const { formatted: callDuration, seconds: callDurationSeconds } = formatDuration(rawDuration);

  // 10. Recording Url
  const rawRecording = 
    lookup['recordingurl'] ?? 
    lookup['recording'] ?? 
    lookup['audiourl'] ?? 
    lookup['audio'] ?? 
    '';
  const recordingUrl = String(rawRecording).replace(/^[\r\n\s]+|[\r\n\s]+$/g, '').trim();

  // 11. Transcript Url / Text
  const rawTranscriptUrl = 
    lookup['transcripturl'] ?? 
    lookup['transcript'] ?? 
    lookup['transcription'] ?? 
    '';
  const transcriptUrl = String(rawTranscriptUrl).replace(/^[\r\n\s]+|[\r\n\s]+$/g, '').trim();

  const transcriptText = String(
    lookup['transcripttext'] ?? 
    lookup['notes'] ?? 
    ''
  ).trim();

  return {
    id: idStr,
    orderNumber,
    dateStr,
    timeStr,
    rawDate,
    customerName,
    phone: rawPhone,
    phoneMasked,
    product,
    totalBill,
    orderStatus,
    cancelReason,
    callDisposition,
    callDuration,
    callDurationSeconds,
    recordingUrl,
    transcriptUrl,
    transcriptText,
    raw: row,
  };
}
