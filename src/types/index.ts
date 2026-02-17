// src/types/index.ts
// Central type definitions for the Car Dealership application

// ============================================================================
// DATABASE MODELS (matching Prisma schema)
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate?: string;
  mileage: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  features?: string;
  condition?: string;
  purchasePrice: number;
  purchaseDate: Date;
  targetPrice: number;
  minimumPrice?: number;
  status: CarStatus;
  notes?: string;
  mainPhoto?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  photos?: CarPhoto[];
  expenses?: Expense[];
  sale?: Sale;
  customers?: CustomerInterest[];
  testDrives?: TestDrive[];
}

export interface CarType {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  features?: string;
  condition?: string;
  targetPrice: number;
  status: string;
  purchaseDate: string;
  purchasePrice: number;
  totalExpenses: number;
  mainPhoto?: string;
  licensePlate?: string;
  photos?: CarPhoto[];
  expenses?: Expense[];
  sale?: Sale;
  customers?: CustomerInterest[];
  testDrives?: TestDrive[];
}

export interface CarPhoto {
  id: string;
  carId: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  status: CustomerStatus;
  leadSource: LeadSource;
  budget?: number;
  notes?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  interestedCars?: CustomerInterest[];
  testDrives?: TestDrive[];
  sales?: Sale[];
}

export interface CustomerInterest {
  id: string;
  customerId: string;
  carId: string;
  notes?: string;
  createdAt: Date;

  // Relations
  customer?: Customer;
  car?: Car;
}

// export interface TestDrive {
//   id: string;
//   carId: string;
//   customerId: string;
//   scheduledDate: Date;
//   status: TestDriveStatus;
//   notes?: string;
//   createdAt: Date;

//   // Relations
//   car?: Car;
//   customer?: Customer;
// }

export interface TestDrive {
  id: string;
  carId: string;
  customerId: string;
  date: Date; // Match Prisma schema
  notes?: string;
  idCopyUrl?: string; // Add this field from Prisma
  createdAt: Date;

  // Relations
  car?: Car;
  customer?: Customer;
}

export interface Sale {
  id: string;
  carId: string;
  customerId: string;
  sellerId: string;
  salePrice: number;
  saleDate: Date;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  downPayment?: number;
  financingDetails?: string;
  profit?: number;
  notes?: string;
  createdAt: Date;

  // Relations
  car?: Car & { expenses?: Expense[] };
  customer?: Customer;
  seller?: User;
}

export interface Expense {
  id: string;
  carId: string;
  userId: string;
  type: ExpenseType;
  amount: number;
  date: Date;
  description?: string;
  receipt?: string;
  createdAt: Date;

  // Relations
  car?: Car;
  user?: User;
}

// ============================================================================
// ENUMS (matching Prisma schema)
// ============================================================================

export enum UserRole {
  OWNER = 'OWNER',
  SALESPERSON = 'SALESPERSON',
  MECHANIC = 'MECHANIC',
  VIEWER = 'VIEWER',
}

export enum CarStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum CustomerStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  NEGOTIATING = 'NEGOTIATING',
  SOLD = 'SOLD',
  LOST = 'LOST',
}

export enum LeadSource {
  WALK_IN = 'WALK_IN',
  PHONE = 'PHONE',
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  OTHER = 'OTHER',
}

export enum TestDriveStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  FINANCING = 'FINANCING',
  TRADE_IN = 'TRADE_IN',
  MIXED = 'MIXED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}

export enum ExpenseType {
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  DETAILING = 'DETAILING',
  INSPECTION = 'INSPECTION',
  TRANSPORT = 'TRANSPORT',
  REGISTRATION = 'REGISTRATION',
  OTHER = 'OTHER',
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CarsListResponse {
  cars: CarWithRelations[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CarWithRelations extends Car {
  photos: CarPhoto[];
  expenses: Expense[];
  sale?: Sale & { customer: Customer };
  _count?: {
    customers: number;
    testDrives: number;
  };
  totalExpenses?: number;
}

export interface CustomerWithRelations extends Customer {
  interestedCars?: Array<CustomerInterest & { car: Car }>;
  sales?: Array<Sale & { car: Car }>;
  _count?: {
    testDrives: number;
    sales: number;
  };
}

export interface SaleWithRelations extends Sale {
  car: Car & { expenses: Expense[] };
  customer: Customer;
  seller: User;
}

export interface ExpenseWithRelations {
  id: string;
  carId: string;
  userId: string;
  type: ExpenseType;
  amount: number;
  date: Date;
  description?: string;
  receipt?: string;
  createdAt: Date;
  vendor?: string;

  // Custom relations for list views
  car: Pick<Car, 'id' | 'make' | 'model' | 'year' | 'licensePlate'>;
  user: Pick<User, 'name'>;
}

export interface DashboardStats {
  totalCarsInStock: number;
  inventoryValue: number;
  carsByStatus: Array<{
    status: string;
    count: number;
  }>;
  thisMonth: {
    salesCount: number;
    revenue: number;
    profit: number;
  };
  alerts: {
    oldInventory: number;
    followUpsToday: number;
    lowStock: boolean;
  };
  quickStats: {
    avgDaysToSell: number;
    avgProfit: number;
    bestSellingMake: {
      make: string;
      count: number;
    } | null;
    mostProfitableSale: {
      car: string;
      profit: number;
    } | null;
  };
  monthlyTrend: Array<{
    month: string;
    sales: number;
    revenue: number;
    profit: number;
  }>;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CarFormData {
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate?: string;
  mileage: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  features?: string;
  condition?: string;
  purchasePrice: number;
  purchaseDate: string | Date;
  targetPrice: number;
  minimumPrice?: number;
  status: CarStatus;
  notes?: string;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  status: CustomerStatus;
  leadSource: LeadSource;
  budget?: number;
  notes?: string;
  followUpDate?: string | Date;
}

export interface SaleFormData {
  carId: string;
  customerId: string;
  salePrice: number;
  saleDate: string | Date;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  downPayment?: number;
  financingDetails?: string;
  notes?: string;
}

export interface ExpenseFormData {
  carId: string;
  type: ExpenseType;
  amount: number;
  date: string | Date;
  description?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

export interface CarFilters {
  search?: string;
  status?: CarStatus;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'targetPrice' | 'mileage' | 'purchaseDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus;
  leadSource?: LeadSource;
  followUpToday?: boolean;
}

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
}

export interface ExpenseFilters {
  carId?: string;
  type?: ExpenseType;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SelectOption {
  value: string;
  label: string;
}

// Status label mappings
export const userRoleLabels: Record<UserRole, string> = {
  OWNER: 'Owner',
  SALESPERSON: 'Salesperson',
  MECHANIC: 'Mechanic',
  VIEWER: 'Viewer',
};

export const carStatusLabels: Record<CarStatus, string> = {
  AVAILABLE: 'Available',
  SOLD: 'Sold',
  RESERVED: 'Reserved',
  MAINTENANCE: 'Maintenance',
};

export const customerStatusLabels: Record<CustomerStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  INTERESTED: 'Interested',
  NEGOTIATING: 'Negotiating',
  SOLD: 'Sold',
  LOST: 'Lost',
};

export const leadSourceLabels: Record<LeadSource, string> = {
  WALK_IN: 'Walk-in',
  PHONE: 'Phone',
  WEBSITE: 'Website',
  REFERRAL: 'Referral',
  SOCIAL_MEDIA: 'Social Media',
  OTHER: 'Other',
};

export const expenseTypeLabels: Record<ExpenseType, string> = {
  REPAIR: 'Repair',
  MAINTENANCE: 'Maintenance',
  DETAILING: 'Detailing',
  INSPECTION: 'Inspection',
  TRANSPORT: 'Transport',
  REGISTRATION: 'Registration',
  OTHER: 'Other',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  FINANCING: 'Financing',
  TRADE_IN: 'Trade-in',
  MIXED: 'Mixed',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PARTIAL: 'Partial',
  PAID: 'Paid',
};
