import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in Euro (Portuguese format)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format date in Portuguese format DD/MM/YYYY
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy');
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy HH:mm');
}

// Calculate days in inventory
export function daysInInventory(purchaseDate: Date | string): number {
  const d =
    typeof purchaseDate === 'string' ? new Date(purchaseDate) : purchaseDate;
  return differenceInDays(new Date(), d);
}

// Format relative time
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// Calculate profit
export function calculateProfit(
  salePrice: number,
  purchasePrice: number,
  totalExpenses: number,
): number {
  return salePrice - purchasePrice - totalExpenses;
}

// Format number in Portuguese format
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-PT').format(value);
}

// Status color mappings
export function getCarStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    RESERVED: 'bg-yellow-100 text-yellow-800',
    SOLD: 'bg-blue-100 text-blue-800',
    IN_REPAIR: 'bg-orange-100 text-orange-800',
    TEST_DRIVE: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getCustomerStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW_LEAD: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    TEST_DRIVE_DONE: 'bg-purple-100 text-purple-800',
    NEGOTIATING: 'bg-orange-100 text-orange-800',
    SOLD: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    DEPOSIT_PAID: 'bg-blue-100 text-blue-800',
    PAID_IN_FULL: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}

// Readable labels
export const carStatusLabels: Record<string, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  SOLD: 'Sold',
  IN_REPAIR: 'In Repair',
  TEST_DRIVE: 'Test Drive',
};

export const customerStatusLabels: Record<string, string> = {
  NEW_LEAD: 'New Lead',
  CONTACTED: 'Contacted',
  TEST_DRIVE_DONE: 'Test Drive Done',
  NEGOTIATING: 'Negotiating',
  SOLD: 'Sold',
  LOST: 'Lost',
};

export const leadSourceLabels: Record<string, string> = {
  WALK_IN: 'Walk-in',
  PHONE: 'Phone',
  OLX: 'OLX',
  STANDVIRTUAL: 'Standvirtual',
  FACEBOOK: 'Facebook',
  REFERRAL: 'Referral',
  OTHER: 'Other',
};

export const paymentMethodLabels: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  FINANCING: 'Financing',
  PAYMENT_PLAN: 'Payment Plan',
};

export const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Pending',
  DEPOSIT_PAID: 'Deposit Paid',
  PAID_IN_FULL: 'Paid in Full',
};

export const expenseTypeLabels: Record<string, string> = {
  REPAIR: 'Repair',
  DETAILING: 'Detailing',
  REGISTRATION: 'Registration',
  INSPECTION: 'Inspection',
  TRANSPORT: 'Transport',
  OTHER: 'Other',
};

export const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const taskStatusLabels: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
