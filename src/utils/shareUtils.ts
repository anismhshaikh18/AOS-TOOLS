import type { KhataRecord } from '../components/KhataDiary';

export function sanitizePhoneForShare(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppShareUrl(message: string, phone?: string): string {
  const cleanDigits = sanitizePhoneForShare(phone);
  const encoded = encodeURIComponent(message);
  return cleanDigits
    ? `https://wa.me/${cleanDigits}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}

export function buildSmsShareUrl(message: string, phone?: string): string {
  const cleanDigits = sanitizePhoneForShare(phone);
  const encoded = encodeURIComponent(message);
  return cleanDigits ? `sms:${cleanDigits}?body=${encoded}` : `sms:?body=${encoded}`;
}

export function formatKhataEntryShareMessage(record: KhataRecord): string {
  const lines = [
    `*AOS CLIENT DIARY · SERVICE UPDATE*`,
    `Token No: *${record.tokenNum}*`,
    `Client: ${record.clientName}`,
    `Service: ${record.services}`,
    `Department: ${record.government}`,
    `Date: ${record.date}`,
    `Govt Fee: ₹${record.governmentFees.toLocaleString('en-IN')}`,
    `Service Charge: ₹${record.workCharge.toLocaleString('en-IN')}`,
    `*Total Payable/Paid: ₹${record.totalPrice.toLocaleString('en-IN')}/-*`,
    `Status: *${record.status}*`,
  ];
  if (record.notes?.trim()) {
    lines.push(`Note: ${record.notes.trim()}`);
  }
  lines.push('', 'Anis Online Services · AOS Tools');
  return lines.join('\n');
}

export function formatKhataSummaryShareMessage(
  records: KhataRecord[],
  stats: {
    todayWorkCharge: number;
    monthWorkCharge: number;
    totalGovFeesAll: number;
    pendingCount: number;
    totalRecords: number;
  }
): string {
  const todayStr = new Date().toISOString().split('T')[0];
  const recentLines = records.slice(0, 5).map(
    (r, idx) =>
      `${idx + 1}. [${r.tokenNum}] ${r.clientName} — ₹${r.totalPrice.toLocaleString('en-IN')} (${r.status})`
  );

  return [
    `*AOS CLIENT DIARY · SUMMARY REPORT*`,
    `Report Date: ${todayStr}`,
    `Total Entries: ${stats.totalRecords} (${stats.pendingCount} Pending)`,
    `Today's Service Profit: ₹${stats.todayWorkCharge.toLocaleString('en-IN')}`,
    `Monthly Service Profit: ₹${stats.monthWorkCharge.toLocaleString('en-IN')}`,
    `Govt Challans Disbursed: ₹${stats.totalGovFeesAll.toLocaleString('en-IN')}`,
    recentLines.length > 0 ? '\n*Recent Tickets:*' : '',
    ...recentLines,
    '',
    'Generated via AOS Tools Client Diary',
  ]
    .filter(Boolean)
    .join('\n');
}
