export type UserRole = 'advisor' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  agency?: string;
  joinedAt: string;
  tier: CommissionTier;
  totalSales: number;
  ytdSales: number;
}

export type CommissionTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierConfig {
  name: CommissionTier;
  label: string;
  minSales: number;
  maxSales: number | null;
  rate: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type TravelType = 'cruise' | 'resort' | 'tour' | 'flight' | 'hotel' | 'package';
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'disputed';

export interface Booking {
  id: string;
  advisorId: string;
  advisorName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  travelType: TravelType;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  totalValue: number;
  commissionRate: number;
  commissionAmount: number;
  commissionStatus: CommissionStatus;
  bookingStatus: BookingStatus;
  supplierName: string;
  confirmationNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  bookingId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  url: string;
  type: 'supplier' | 'client' | 'commission';
}

export interface Commission {
  id: string;
  bookingId: string;
  advisorId: string;
  amount: number;
  rate: number;
  status: CommissionStatus;
  dueDate: string;
  paidDate?: string;
  notes: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  advisorId?: string;
  travelType?: TravelType | 'all';
  status?: BookingStatus | 'all';
  tier?: CommissionTier | 'all';
}

export type ReportType = 'sales' | 'commission' | 'advisor_performance' | 'booking_status' | 'tier_summary';
