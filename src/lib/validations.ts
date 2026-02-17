import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['OWNER', 'SALESPERSON', 'MECHANIC', 'VIEWER']),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const carSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Color is required'),
  mileage: z.number().min(0, 'Mileage must be positive'),
  vin: z.string().min(1, 'VIN is required'),
  licensePlate: z.string().optional().or(z.literal('')),
  purchasePrice: z.number().min(0, 'Price must be positive'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  boughtFrom: z.string().optional().or(z.literal('')),
  targetPrice: z.number().min(0, 'Target price must be positive'),
  minimumPrice: z.number().min(0).optional().or(z.literal(0)),
  status: z
    .enum(['AVAILABLE', 'RESERVED', 'SOLD', 'IN_REPAIR', 'TEST_DRIVE'])
    .default('AVAILABLE'),
  location: z.string().optional().or(z.literal('')),
  conditionNotes: z.string().optional().or(z.literal('')),
});

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z
    .string()
    .email('Invalid email')
    .optional()
    .or(z.literal(''))
    .nullable(),
  address: z.string().optional().nullable(),
  leadSource: z.enum([
    'WALK_IN',
    'PHONE',
    'OLX',
    'STANDVIRTUAL',
    'FACEBOOK',
    'REFERRAL',
    'OTHER',
  ]),
  status: z
    .enum([
      'NEW_LEAD',
      'CONTACTED',
      'TEST_DRIVE_DONE',
      'NEGOTIATING',
      'SOLD',
      'LOST',
    ])
    .default('NEW_LEAD'),
  notes: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
});

export const saleSchema = z.object({
  carId: z.string().min(1, 'Car is required'),
  customerId: z.string().min(1, 'Customer is required'),
  sellerId: z.string().optional().nullable(),
  salePrice: z.preprocess(
    (val) =>
      val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().min(0, 'Sale price must be positive'),
  ),
  saleDate: z.string().min(1, 'Sale date is required'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'FINANCING', 'PAYMENT_PLAN']),
  paymentStatus: z
    .enum(['PENDING', 'DEPOSIT_PAID', 'PAID_IN_FULL'])
    .default('PENDING'),
  commission: z.preprocess(
    (val) =>
      val === '' || val === null || val === undefined ? null : Number(val),
    z.number().nullable().optional(),
  ),
});

// export const saleSchema = z.object({
//   carId: z.string().min(1, 'Car is required'),
//   customerId: z.string().min(1, 'Customer is required'),
//   sellerId: z.string().optional().or(z.literal('')).nullable(),
//   salePrice: z.number().min(0, 'Sale price must be positive'),
//   saleDate: z.string().min(1, 'Sale date is required'),
//   paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'FINANCING', 'PAYMENT_PLAN']),
//   paymentStatus: z
//     .enum(['PENDING', 'DEPOSIT_PAID', 'PAID_IN_FULL'])
//     .default('PENDING'),
//   commission: z.number().nullable().optional(),
// });

// export const saleSchema = z.object({
//   carId: z.string().min(1, 'Car is required'),
//   customerId: z.string().min(1, 'Customer is required'),
//   sellerId: z.string().optional().nullable(),
//   salePrice: z.coerce.number().min(0, 'Sale price must be positive'),
//   saleDate: z.string().min(1, 'Sale date is required'),
//   paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'FINANCING', 'PAYMENT_PLAN']),
//   paymentStatus: z
//     .enum(['PENDING', 'DEPOSIT_PAID', 'PAID_IN_FULL'])
//     .default('PENDING'),
//   commission: z.coerce.number().optional().nullable(),
// });

export const expenseSchema = z.object({
  carId: z.string().min(1, 'Car is required'),
  type: z.enum([
    'REPAIR',
    'DETAILING',
    'REGISTRATION',
    'INSPECTION',
    'TRANSPORT',
    'OTHER',
  ]),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  vendor: z.string().optional().nullable(),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  carId: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z
    .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .default('PENDING'),
});

export const carFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'Color is required'),
  mileage: z.number().min(0, 'Mileage must be positive'),
  vin: z.string().min(1, 'VIN is required'),
  licensePlate: z.string().optional(),
  purchasePrice: z.number().min(0, 'Price must be positive'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  boughtFrom: z.string().optional(),
  targetPrice: z.number().min(0, 'Target price must be positive'),
  minimumPrice: z.number().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'IN_REPAIR', 'TEST_DRIVE']),
  location: z.string().optional(),
  conditionNotes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CarInput = z.infer<typeof carSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type TaskInput = z.infer<typeof taskSchema>;

export type CarFormValues = z.infer<typeof carFormSchema>;
