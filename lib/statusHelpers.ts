import { BookingStatus, CommissionStatus, TravelType } from '@/types';

export function bookingStatusVariant(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    pending: 'warning',
    confirmed: 'info',
    cancelled: 'danger',
    completed: 'success',
  };
  return map[status];
}

export function commissionStatusVariant(status: CommissionStatus): string {
  const map: Record<CommissionStatus, string> = {
    pending: 'warning',
    approved: 'info',
    paid: 'success',
    disputed: 'danger',
  };
  return map[status];
}

export function travelTypeLabel(type: TravelType): string {
  const map: Record<TravelType, string> = {
    cruise: 'Cruise',
    resort: 'Resort',
    tour: 'Tour',
    flight: 'Flight',
    hotel: 'Hotel',
    package: 'Package',
  };
  return map[type];
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
