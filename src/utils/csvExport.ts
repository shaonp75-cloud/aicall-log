import { OrderRecord } from '../types/order';

export function exportOrdersToCSV(orders: OrderRecord[], filename = 'orders_tele_sales_report.csv') {
  const headers = [
    'Order ID',
    'Name',
    'Phone',
    'Product',
    'Total Bill',
    'Order Status',
    'Cancel Reason',
    'Call Disposition',
    'Call Duration',
    'Recording Url',
    'Transcript Url',
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((order) => [
    escapeCSV(order.id),
    escapeCSV(order.customerName),
    escapeCSV(order.phone),
    escapeCSV(order.product),
    escapeCSV(order.totalBill),
    escapeCSV(order.orderStatus),
    escapeCSV(order.cancelReason || '-'),
    escapeCSV(order.callDisposition),
    escapeCSV(order.callDuration),
    escapeCSV(order.recordingUrl),
    escapeCSV(order.transcriptUrl),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
