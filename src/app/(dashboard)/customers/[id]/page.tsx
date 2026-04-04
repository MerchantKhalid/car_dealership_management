// // 'use client';

// // import { useEffect, useState, useCallback } from 'react';
// // import { useRouter } from 'next/navigation';
// // import Link from 'next/link';
// // import toast from 'react-hot-toast';
// // import {
// //   ArrowLeft,
// //   Edit,
// //   Trash2,
// //   Phone,
// //   Mail,
// //   MapPin,
// //   Calendar,
// //   Car,
// //   Save,
// // } from 'lucide-react';
// // import LoadingSpinner from '@/components/ui/loading-spinner';
// // import StatusBadge from '@/components/ui/status-badge';
// // import ConfirmDialog from '@/components/ui/confirm-dialog';
// // import {
// //   formatDate,
// //   formatCurrency,
// //   customerStatusColors,
// //   customerStatusLabels,
// //   leadSourceLabels,
// // } from '@/lib/utils';
// // import { CustomerWithRelations } from '@/types';
// // import { handleClientError } from '@/lib/error-handler';

// // interface EditData {
// //   name: string;
// //   phone: string;
// //   email: string;
// //   address: string;
// //   leadSource: string;
// //   status: string;
// //   notes: string;
// //   followUpDate: string;
// // }

// // export default function CustomerDetailPage({
// //   params,
// // }: {
// //   params: { id: string };
// // }) {
// //   const router = useRouter();
// //   const [customer, setCustomer] = useState<CustomerWithRelations | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [deleteConfirm, setDeleteConfirm] = useState(false);
// //   const [editing, setEditing] = useState(false);
// //   const [editData, setEditData] = useState<EditData>({
// //     name: '',
// //     phone: '',
// //     email: '',
// //     address: '',
// //     leadSource: '',
// //     status: '',
// //     notes: '',
// //     followUpDate: '',
// //   });
// //   const [saving, setSaving] = useState(false);

// //   const fetchCustomer = useCallback(async () => {
// //     try {
// //       const res = await fetch(`/api/customers/${params.id}`);
// //       if (!res.ok) throw new Error('Customer not found');
// //       const data = await res.json();
// //       setCustomer(data);
// //       setEditData({
// //         name: data.name,
// //         phone: data.phone,
// //         email: data.email || '',
// //         address: data.address || '',
// //         leadSource: data.leadSource,
// //         status: data.status,
// //         notes: data.notes || '',
// //         followUpDate: data.followUpDate
// //           ? new Date(data.followUpDate).toISOString().split('T')[0]
// //           : '',
// //       });
// //     } catch (error) {
// //       const message = handleClientError(error, 'fetchCustomer');
// //       toast.error(message || 'Failed to load customer');
// //       router.push('/customers');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [params.id, router]);

// //   useEffect(() => {
// //     fetchCustomer();
// //   }, [fetchCustomer]);

// //   const handleSave = async () => {
// //     setSaving(true);
// //     try {
// //       const res = await fetch(`/api/customers/${params.id}`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(editData),
// //       });

// //       if (res.ok) {
// //         toast.success('Customer updated');
// //         setEditing(false);
// //         fetchCustomer();
// //       } else {
// //         const error = await res.json();
// //         toast.error(error.error);
// //       }
// //     } catch (error) {
// //       const message = handleClientError(error, 'handleSave');
// //       toast.error(message || 'Failed to update');
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   const handleDelete = async () => {
// //     try {
// //       const res = await fetch(`/api/customers/${params.id}`, {
// //         method: 'DELETE',
// //       });
// //       if (res.ok) {
// //         toast.success('Customer deleted');
// //         router.push('/customers');
// //       } else {
// //         const data = await res.json();
// //         toast.error(data.error);
// //       }
// //     } catch (error) {
// //       const message = handleClientError(error, 'handleDelete');
// //       toast.error(message || 'Failed to delete');
// //     }
// //   };

// //   if (loading) return <LoadingSpinner className="h-96" />;
// //   if (!customer) return null;

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex items-center justify-between">
// //         <Link
// //           href="/customers"
// //           className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
// //         >
// //           <ArrowLeft className="h-4 w-4" />
// //           Back to Customers
// //         </Link>
// //         <div className="flex gap-2">
// //           {editing ? (
// //             <>
// //               <button
// //                 onClick={() => setEditing(false)}
// //                 className="btn-secondary"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleSave}
// //                 disabled={saving}
// //                 className="btn-primary flex items-center gap-2"
// //               >
// //                 <Save className="h-4 w-4" />
// //                 {saving ? 'Saving...' : 'Save'}
// //               </button>
// //             </>
// //           ) : (
// //             <>
// //               <button
// //                 onClick={() => setEditing(true)}
// //                 className="btn-secondary flex items-center gap-2"
// //               >
// //                 <Edit className="h-4 w-4" />
// //                 Edit
// //               </button>
// //               <button
// //                 onClick={() => setDeleteConfirm(true)}
// //                 className="btn-danger flex items-center gap-2"
// //               >
// //                 <Trash2 className="h-4 w-4" />
// //                 Delete
// //               </button>
// //             </>
// //           )}
// //         </div>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //         {/* Contact Info */}
// //         <div className="lg:col-span-2 space-y-6">
// //           <div className="card p-6">
// //             <div className="flex items-start justify-between mb-4">
// //               {editing ? (
// //                 <input
// //                   value={editData.name}
// //                   onChange={(e) =>
// //                     setEditData({ ...editData, name: e.target.value })
// //                   }
// //                   className="input-field text-xl font-bold"
// //                 />
// //               ) : (
// //                 <h1 className="text-2xl font-bold text-gray-900">
// //                   {customer.name}
// //                 </h1>
// //               )}
// //               {!editing && (
// //                 <StatusBadge
// //                   status={customer.status}
// //                   colorMap={customerStatusColors}
// //                   labelMap={customerStatusLabels}
// //                 />
// //               )}
// //             </div>

// //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //               <div className="flex items-center gap-3">
// //                 <Phone className="h-5 w-5 text-gray-400" />
// //                 {editing ? (
// //                   <input
// //                     value={editData.phone}
// //                     onChange={(e) =>
// //                       setEditData({ ...editData, phone: e.target.value })
// //                     }
// //                     className="input-field flex-1"
// //                   />
// //                 ) : (
// //                   <span>{customer.phone}</span>
// //                 )}
// //               </div>
// //               <div className="flex items-center gap-3">
// //                 <Mail className="h-5 w-5 text-gray-400" />
// //                 {editing ? (
// //                   <input
// //                     value={editData.email}
// //                     onChange={(e) =>
// //                       setEditData({ ...editData, email: e.target.value })
// //                     }
// //                     className="input-field flex-1"
// //                   />
// //                 ) : (
// //                   <span>{customer.email || 'N/A'}</span>
// //                 )}
// //               </div>
// //               <div className="flex items-center gap-3">
// //                 <MapPin className="h-5 w-5 text-gray-400" />
// //                 {editing ? (
// //                   <input
// //                     value={editData.address}
// //                     onChange={(e) =>
// //                       setEditData({ ...editData, address: e.target.value })
// //                     }
// //                     className="input-field flex-1"
// //                   />
// //                 ) : (
// //                   <span>{customer.address || 'N/A'}</span>
// //                 )}
// //               </div>
// //               <div className="flex items-center gap-3">
// //                 <Calendar className="h-5 w-5 text-gray-400" />
// //                 <span className="text-sm text-gray-500">
// //                   Customer since {formatDate(customer.createdAt)}
// //                 </span>
// //               </div>
// //             </div>

// //             {editing && (
// //               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t">
// //                 <div>
// //                   <label className="label">Status</label>
// //                   <select
// //                     value={editData.status}
// //                     onChange={(e) =>
// //                       setEditData({ ...editData, status: e.target.value })
// //                     }
// //                     className="input-field"
// //                   >
// //                     {Object.entries(customerStatusLabels).map(
// //                       ([value, label]) => (
// //                         <option key={value} value={value}>
// //                           {label}
// //                         </option>
// //                       ),
// //                     )}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="label">Lead Source</label>
// //                   <select
// //                     value={editData.leadSource}
// //                     onChange={(e) =>
// //                       setEditData({ ...editData, leadSource: e.target.value })
// //                     }
// //                     className="input-field"
// //                   >
// //                     {Object.entries(leadSourceLabels).map(([value, label]) => (
// //                       <option key={value} value={value}>
// //                         {label}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //                 <div>
// //                   <label className="label">Follow-up Date</label>
// //                   <input
// //                     type="date"
// //                     value={editData.followUpDate}
// //                     onChange={(e) =>
// //                       setEditData({
// //                         ...editData,
// //                         followUpDate: e.target.value,
// //                       })
// //                     }
// //                     className="input-field"
// //                   />
// //                 </div>
// //               </div>
// //             )}
// //           </div>

// //           {/* Notes */}
// //           <div className="card p-6">
// //             <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
// //             {editing ? (
// //               <textarea
// //                 value={editData.notes}
// //                 onChange={(e) =>
// //                   setEditData({ ...editData, notes: e.target.value })
// //                 }
// //                 className="input-field"
// //                 rows={6}
// //                 placeholder="Conversation history, preferences..."
// //               />
// //             ) : (
// //               <p className="text-sm text-gray-600 whitespace-pre-wrap">
// //                 {customer.notes || 'No notes yet'}
// //               </p>
// //             )}
// //           </div>

// //           {/* Test Drives */}
// //           <div className="card p-6">
// //             <h3 className="text-lg font-semibold text-gray-900 mb-3">
// //               Test Drives ({customer.testDrives?.length || 0})
// //             </h3>
// //             {customer.testDrives && customer.testDrives.length > 0 ? (
// //               <div className="space-y-3">
// //                 {customer.testDrives.map((td) => (
// //                   <div
// //                     key={td.id}
// //                     className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
// //                   >
// //                     <Car className="h-5 w-5 text-gray-400" />
// //                     <div>
// //                       <p className="font-medium text-sm">
// //                         {td.car?.make} {td.car?.model} {td.car?.year}
// //                       </p>
// //                       <p className="text-xs text-gray-500">
// //                         {formatDate(td.date)}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             ) : (
// //               <p className="text-sm text-gray-500">No test drives yet</p>
// //             )}
// //           </div>
// //         </div>

// //         {/* Right Column */}
// //         <div className="space-y-6">
// //           {/* Lead Info */}
// //           <div className="card p-6">
// //             <h3 className="text-sm font-medium text-gray-700 mb-3">
// //               Lead Information
// //             </h3>
// //             <div className="space-y-3">
// //               <div>
// //                 <p className="text-xs text-gray-500">Source</p>
// //                 <p className="font-medium">
// //                   {leadSourceLabels[customer.leadSource]}
// //                 </p>
// //               </div>
// //               <div>
// //                 <p className="text-xs text-gray-500">Status</p>
// //                 <StatusBadge
// //                   status={customer.status}
// //                   colorMap={customerStatusColors}
// //                   labelMap={customerStatusLabels}
// //                 />
// //               </div>
// //               {customer.followUpDate && (
// //                 <div>
// //                   <p className="text-xs text-gray-500">Follow-up Date</p>
// //                   <p className="font-medium">
// //                     {formatDate(customer.followUpDate)}
// //                   </p>
// //                 </div>
// //               )}
// //             </div>
// //           </div>

// //           {/* Interested Cars */}
// //           <div className="card p-6">
// //             <h3 className="text-sm font-medium text-gray-700 mb-3">
// //               Interested Cars ({customer.interestedCars?.length || 0})
// //             </h3>
// //             {customer.interestedCars && customer.interestedCars.length > 0 ? (
// //               <div className="space-y-2">
// //                 {customer.interestedCars.map((cc) => (
// //                   <Link
// //                     key={cc.id}
// //                     href={`/inventory/${cc.car.id}`}
// //                     className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
// //                   >
// //                     <p className="font-medium text-sm">
// //                       {cc.car.make} {cc.car.model} {cc.car.year}
// //                     </p>
// //                     <p className="text-xs text-blue-600">
// //                       {formatCurrency(cc.car.targetPrice)}
// //                     </p>
// //                   </Link>
// //                 ))}
// //               </div>
// //             ) : (
// //               <p className="text-sm text-gray-500">No interested cars</p>
// //             )}
// //           </div>

// //           {/* Sales */}
// //           {customer.sales && customer.sales.length > 0 && (
// //             <div className="card p-6 bg-green-50 border-green-200">
// //               <h3 className="text-sm font-medium text-green-800 mb-3">
// //                 Purchases
// //               </h3>
// //               {customer.sales.map((sale) => (
// //                 <div key={sale.id} className="p-3 bg-white rounded-lg">
// //                   <p className="font-medium text-sm">
// //                     {sale.car.make} {sale.car.model} {sale.car.year}
// //                   </p>
// //                   <p className="text-xs text-green-700">
// //                     {formatCurrency(sale.salePrice)} ·{' '}
// //                     {formatDate(sale.saleDate)}
// //                   </p>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       <ConfirmDialog
// //         isOpen={deleteConfirm}
// //         onClose={() => setDeleteConfirm(false)}
// //         onConfirm={handleDelete}
// //         title="Delete Customer"
// //         message="Are you sure you want to delete this customer? This action cannot be undone."
// //         confirmText="Delete"
// //       />
// //     </div>
// //   );
// // }

// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import toast from 'react-hot-toast';
// import {
//   ArrowLeft,
//   Edit,
//   Trash2,
//   Phone,
//   Mail,
//   MapPin,
//   Calendar,
//   Car,
//   Save,
//   Plus,
//   X,
//   CheckCircle,
//   Clock,
//   AlertTriangle,
//   User,
//   CreditCard,
//   DollarSign,
//   ChevronDown,
//   ChevronUp,
// } from 'lucide-react';
// import LoadingSpinner from '@/components/ui/loading-spinner';
// import StatusBadge from '@/components/ui/status-badge';
// import ConfirmDialog from '@/components/ui/confirm-dialog';
// import {
//   formatDate,
//   formatCurrency,
//   customerStatusColors,
//   customerStatusLabels,
//   leadSourceLabels,
// } from '@/lib/utils';
// import { CustomerWithRelations } from '@/types';
// import { handleClientError } from '@/lib/error-handler';

// interface Installment {
//   id: string;
//   installmentNumber: number;
//   amount: number;
//   dueDate: string;
//   paidDate: string | null;
//   status: 'PENDING' | 'PAID' | 'LATE';
//   notes: string | null;
// }

// interface Deal {
//   id: string;
//   customerId: string;
//   carId: string;
//   handlerId: string | null;
//   agreedPrice: number;
//   depositAmount: number;
//   depositDate: string | null;
//   depositPaidBy: string | null;
//   paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'FINANCING' | 'PAYMENT_PLAN';
//   paymentStatus: 'PENDING' | 'DEPOSIT_PAID' | 'PAID_IN_FULL';
//   expectedFinalPaymentDate: string | null;
//   notes: string | null;
//   car: {
//     id: string;
//     make: string;
//     model: string;
//     year: number;
//     color: string;
//     mileage: number;
//     licensePlate: string | null;
//     photos: { url: string; isMain: boolean }[];
//   };
//   handler: { id: string; name: string } | null;
//   installments: Installment[];
// }

// interface EditData {
//   name: string;
//   phone: string;
//   email: string;
//   address: string;
//   leadSource: string;
//   status: string;
//   notes: string;
//   followUpDate: string;
// }

// interface DealFormData {
//   carId: string;
//   handlerId: string;
//   agreedPrice: string;
//   depositAmount: string;
//   depositDate: string;
//   depositPaidBy: string;
//   paymentMethod: string;
//   paymentStatus: string;
//   expectedFinalPaymentDate: string;
//   notes: string;
// }

// interface InstallmentFormRow {
//   installmentNumber: number;
//   amount: string;
//   dueDate: string;
//   notes: string;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const paymentMethodLabels: Record<string, string> = {
//   CASH: 'Cash',
//   BANK_TRANSFER: 'Bank Transfer',
//   FINANCING: 'Financing',
//   PAYMENT_PLAN: 'Payment Plan',
// };

// const paymentStatusLabels: Record<string, string> = {
//   PENDING: 'Pending',
//   DEPOSIT_PAID: 'Deposit Paid',
//   PAID_IN_FULL: 'Paid in Full',
// };

// const paymentStatusColors: Record<string, string> = {
//   PENDING: 'bg-yellow-100 text-yellow-800',
//   DEPOSIT_PAID: 'bg-blue-100 text-blue-800',
//   PAID_IN_FULL: 'bg-green-100 text-green-800',
// };

// const installmentStatusColors: Record<string, string> = {
//   PENDING: 'bg-yellow-100 text-yellow-700',
//   PAID: 'bg-green-100 text-green-700',
//   LATE: 'bg-red-100 text-red-700',
// };

// function isLate(dueDate: string, status: string) {
//   if (status === 'PAID') return false;
//   return new Date(dueDate) < new Date();
// }

// export default function CustomerDetailPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const router = useRouter();

//   // Customer state
//   const [customer, setCustomer] = useState<CustomerWithRelations | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [deleteConfirm, setDeleteConfirm] = useState(false);
//   const [editing, setEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [editData, setEditData] = useState<EditData>({
//     name: '',
//     phone: '',
//     email: '',
//     address: '',
//     leadSource: '',
//     status: '',
//     notes: '',
//     followUpDate: '',
//   });

//   // Deal state
//   const [deal, setDeal] = useState<Deal | null>(null);
//   const [dealLoading, setDealLoading] = useState(true);
//   const [showDealForm, setShowDealForm] = useState(false);
//   const [savingDeal, setSavingDeal] = useState(false);
//   const [editingDeal, setEditingDeal] = useState(false);
//   const [availableCars, setAvailableCars] = useState<
//     { id: string; make: string; model: string; year: number }[]
//   >([]);
//   const [availableHandlers, setAvailableHandlers] = useState<
//     { id: string; name: string }[]
//   >([]);

//   const [dealForm, setDealForm] = useState<DealFormData>({
//     carId: '',
//     handlerId: '',
//     agreedPrice: '',
//     depositAmount: '0',
//     depositDate: '',
//     depositPaidBy: '',
//     paymentMethod: 'CASH',
//     paymentStatus: 'PENDING',
//     expectedFinalPaymentDate: '',
//     notes: '',
//   });

//   // Installment state
//   const [installmentRows, setInstallmentRows] = useState<InstallmentFormRow[]>(
//     [],
//   );
//   const [] = useState(false);
//   const [installmentsExpanded, setInstallmentsExpanded] = useState(true);

//   // ─── Fetch ──────────────────────────────────────────────────────────────────

//   const fetchCustomer = useCallback(async () => {
//     try {
//       const res = await fetch(`/api/customers/${params.id}`);
//       if (!res.ok) throw new Error('Customer not found');
//       const data = await res.json();
//       setCustomer(data);
//       setEditData({
//         name: data.name,
//         phone: data.phone,
//         email: data.email || '',
//         address: data.address || '',
//         leadSource: data.leadSource,
//         status: data.status,
//         notes: data.notes || '',
//         followUpDate: data.followUpDate
//           ? new Date(data.followUpDate).toISOString().split('T')[0]
//           : '',
//       });
//     } catch (error) {
//       const message = handleClientError(error, 'fetchCustomer');
//       toast.error(message || 'Failed to load customer');
//       router.push('/customers');
//     } finally {
//       setLoading(false);
//     }
//   }, [params.id, router]);

//   const fetchDeal = useCallback(async () => {
//     try {
//       const res = await fetch(`/api/deals?customerId=${params.id}`);
//       if (!res.ok) return;
//       const data = await res.json();
//       setDeal(data.length > 0 ? data[0] : null);
//     } catch {
//       // No deal yet — silent
//     } finally {
//       setDealLoading(false);
//     }
//   }, [params.id]);

//   const fetchFormData = useCallback(async () => {
//     try {
//       const [carsRes, usersRes] = await Promise.all([
//         fetch('/api/cars?status=AVAILABLE&limit=100'),
//         fetch('/api/users'),
//       ]);
//       if (carsRes.ok) {
//         const d = await carsRes.json();
//         setAvailableCars(d.cars || []);
//       }
//       if (usersRes.ok) {
//         const u = await usersRes.json();
//         setAvailableHandlers(u || []);
//       }
//     } catch {
//       // Fail silently – dropdowns will just be empty
//     }
//   }, []);

//   useEffect(() => {
//     fetchCustomer();
//     fetchDeal();
//     fetchFormData();
//   }, [fetchCustomer, fetchDeal, fetchFormData]);

//   // ─── Customer save / delete ──────────────────────────────────────────────────

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const res = await fetch(`/api/customers/${params.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editData),
//       });
//       if (res.ok) {
//         toast.success('Customer updated');
//         setEditing(false);
//         fetchCustomer();
//       } else {
//         const error = await res.json();
//         toast.error(error.error || 'Failed to update');
//       }
//     } catch (error) {
//       const message = handleClientError(error, 'handleSave');
//       toast.error(message || 'Failed to update');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       const res = await fetch(`/api/customers/${params.id}`, {
//         method: 'DELETE',
//       });
//       if (res.ok) {
//         toast.success('Customer deleted');
//         router.push('/customers');
//       } else {
//         const data = await res.json();
//         toast.error(data.error);
//       }
//     } catch (error) {
//       const message = handleClientError(error, 'handleDelete');
//       toast.error(message || 'Failed to delete');
//     }
//   };

//   // ─── Deal save / update ─────────────────────────────────────────────────────

//   const openDealForm = () => {
//     if (deal) {
//       // Pre-fill for editing
//       setDealForm({
//         carId: deal.carId,
//         handlerId: deal.handlerId || '',
//         agreedPrice: String(deal.agreedPrice),
//         depositAmount: String(deal.depositAmount),
//         depositDate: deal.depositDate
//           ? new Date(deal.depositDate).toISOString().split('T')[0]
//           : '',
//         depositPaidBy: deal.depositPaidBy || '',
//         paymentMethod: deal.paymentMethod,
//         paymentStatus: deal.paymentStatus,
//         expectedFinalPaymentDate: deal.expectedFinalPaymentDate
//           ? new Date(deal.expectedFinalPaymentDate).toISOString().split('T')[0]
//           : '',
//         notes: deal.notes || '',
//       });
//       setEditingDeal(true);
//     } else {
//       setDealForm({
//         carId: '',
//         handlerId: '',
//         agreedPrice: '',
//         depositAmount: '0',
//         depositDate: '',
//         depositPaidBy: '',
//         paymentMethod: 'CASH',
//         paymentStatus: 'PENDING',
//         expectedFinalPaymentDate: '',
//         notes: '',
//       });
//       setInstallmentRows([]);
//       setEditingDeal(false);
//     }
//     setShowDealForm(true);
//   };

//   const handleSaveDeal = async () => {
//     if (!dealForm.carId) {
//       toast.error('Please select a car');
//       return;
//     }
//     if (!dealForm.agreedPrice || Number(dealForm.agreedPrice) <= 0) {
//       toast.error('Please enter the agreed price');
//       return;
//     }

//     setSavingDeal(true);
//     try {
//       const payload = {
//         customerId: params.id,
//         carId: dealForm.carId,
//         handlerId: dealForm.handlerId || null,
//         agreedPrice: Number(dealForm.agreedPrice),
//         depositAmount: Number(dealForm.depositAmount) || 0,
//         depositDate: dealForm.depositDate || null,
//         depositPaidBy: dealForm.depositPaidBy || null,
//         paymentMethod: dealForm.paymentMethod,
//         paymentStatus: dealForm.paymentStatus,
//         expectedFinalPaymentDate: dealForm.expectedFinalPaymentDate || null,
//         notes: dealForm.notes || null,
//         installments:
//           dealForm.paymentMethod === 'PAYMENT_PLAN' && !editingDeal
//             ? installmentRows.map((r) => ({
//                 installmentNumber: r.installmentNumber,
//                 amount: Number(r.amount),
//                 dueDate: r.dueDate,
//                 notes: r.notes || null,
//               }))
//             : undefined,
//       };

//       const url = editingDeal ? `/api/deals/${deal!.id}` : '/api/deals';
//       const method = editingDeal ? 'PUT' : 'POST';

//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.error || 'Failed to save deal');
//       }

//       toast.success(editingDeal ? 'Deal updated!' : 'Deal created!');
//       setShowDealForm(false);
//       fetchDeal();
//     } catch (error) {
//       const message = handleClientError(error, 'handleSaveDeal');
//       toast.error(message || 'Failed to save deal');
//     } finally {
//       setSavingDeal(false);
//     }
//   };

//   // ─── Installment helpers ────────────────────────────────────────────────────

//   const addInstallmentRow = () => {
//     const next = installmentRows.length + 1;
//     setInstallmentRows([
//       ...installmentRows,
//       { installmentNumber: next, amount: '', dueDate: '', notes: '' },
//     ]);
//   };

//   const removeInstallmentRow = (index: number) => {
//     setInstallmentRows(installmentRows.filter((_, i) => i !== index));
//   };

//   const updateInstallmentRow = (
//     index: number,
//     field: keyof InstallmentFormRow,
//     value: string,
//   ) => {
//     const updated = [...installmentRows];
//     updated[index] = { ...updated[index], [field]: value };
//     setInstallmentRows(updated);
//   };

//   const markInstallment = async (
//     installmentId: string,
//     status: 'PAID' | 'PENDING' | 'LATE',
//   ) => {
//     try {
//       const res = await fetch(`/api/installments/${installmentId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           status,
//           paidDate: status === 'PAID' ? new Date().toISOString() : null,
//         }),
//       });
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.error);
//       }
//       toast.success(status === 'PAID' ? 'Marked as paid!' : 'Status updated');
//       fetchDeal();
//     } catch (error) {
//       const message = handleClientError(error, 'markInstallment');
//       toast.error(message || 'Failed to update installment');
//     }
//   };

//   // ─── Derived values ─────────────────────────────────────────────────────────

//   const totalPaid = deal
//     ? deal.installments
//         .filter((i) => i.status === 'PAID')
//         .reduce((s, i) => s + i.amount, 0) + deal.depositAmount
//     : 0;

//   const remainingBalance = deal ? deal.agreedPrice - totalPaid : 0;

//   const progressPct = deal
//     ? Math.min(100, Math.round((totalPaid / deal.agreedPrice) * 100))
//     : 0;

//   const lateCount = deal
//     ? deal.installments.filter((i) => isLate(i.dueDate, i.status)).length
//     : 0;

//   // ─── Render ──────────────────────────────────────────────────────────────────

//   if (loading) return <LoadingSpinner className="h-96" />;
//   if (!customer) return null;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <Link
//           href="/customers"
//           className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back to Customers
//         </Link>
//         <div className="flex gap-2">
//           {editing ? (
//             <>
//               <button
//                 onClick={() => setEditing(false)}
//                 className="btn-secondary"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={saving}
//                 className="btn-primary flex items-center gap-2"
//               >
//                 <Save className="h-4 w-4" />
//                 {saving ? 'Saving...' : 'Save'}
//               </button>
//             </>
//           ) : (
//             <>
//               <button
//                 onClick={() => setEditing(true)}
//                 className="btn-secondary flex items-center gap-2"
//               >
//                 <Edit className="h-4 w-4" />
//                 Edit
//               </button>
//               <button
//                 onClick={() => setDeleteConfirm(true)}
//                 className="btn-danger flex items-center gap-2"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 Delete
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* ── Left: Contact + Notes + Test Drives ── */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Contact Info */}
//           <div className="card p-6">
//             <div className="flex items-start justify-between mb-4">
//               {editing ? (
//                 <input
//                   value={editData.name}
//                   onChange={(e) =>
//                     setEditData({ ...editData, name: e.target.value })
//                   }
//                   className="input-field text-xl font-bold"
//                 />
//               ) : (
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {customer.name}
//                 </h1>
//               )}
//               {!editing && (
//                 <StatusBadge
//                   status={customer.status}
//                   colorMap={customerStatusColors}
//                   labelMap={customerStatusLabels}
//                 />
//               )}
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="flex items-center gap-3">
//                 <Phone className="h-5 w-5 text-gray-400" />
//                 {editing ? (
//                   <input
//                     value={editData.phone}
//                     onChange={(e) =>
//                       setEditData({ ...editData, phone: e.target.value })
//                     }
//                     className="input-field flex-1"
//                   />
//                 ) : (
//                   <span>{customer.phone}</span>
//                 )}
//               </div>
//               <div className="flex items-center gap-3">
//                 <Mail className="h-5 w-5 text-gray-400" />
//                 {editing ? (
//                   <input
//                     value={editData.email}
//                     onChange={(e) =>
//                       setEditData({ ...editData, email: e.target.value })
//                     }
//                     className="input-field flex-1"
//                   />
//                 ) : (
//                   <span>{customer.email || 'N/A'}</span>
//                 )}
//               </div>
//               <div className="flex items-center gap-3">
//                 <MapPin className="h-5 w-5 text-gray-400" />
//                 {editing ? (
//                   <input
//                     value={editData.address}
//                     onChange={(e) =>
//                       setEditData({ ...editData, address: e.target.value })
//                     }
//                     className="input-field flex-1"
//                   />
//                 ) : (
//                   <span>{customer.address || 'N/A'}</span>
//                 )}
//               </div>
//               <div className="flex items-center gap-3">
//                 <Calendar className="h-5 w-5 text-gray-400" />
//                 <span className="text-sm text-gray-500">
//                   Customer since {formatDate(customer.createdAt)}
//                 </span>
//               </div>
//             </div>

//             {editing && (
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t">
//                 <div>
//                   <label className="label">Status</label>
//                   <select
//                     value={editData.status}
//                     onChange={(e) =>
//                       setEditData({ ...editData, status: e.target.value })
//                     }
//                     className="input-field"
//                   >
//                     {Object.entries(customerStatusLabels).map(
//                       ([value, label]) => (
//                         <option key={value} value={value}>
//                           {label}
//                         </option>
//                       ),
//                     )}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="label">Lead Source</label>
//                   <select
//                     value={editData.leadSource}
//                     onChange={(e) =>
//                       setEditData({ ...editData, leadSource: e.target.value })
//                     }
//                     className="input-field"
//                   >
//                     {Object.entries(leadSourceLabels).map(([value, label]) => (
//                       <option key={value} value={value}>
//                         {label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="label">Follow-up Date</label>
//                   <input
//                     type="date"
//                     value={editData.followUpDate}
//                     onChange={(e) =>
//                       setEditData({ ...editData, followUpDate: e.target.value })
//                     }
//                     className="input-field"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ── DEAL & TRANSACTION PANEL ── */}
//           <div className="card p-6">
//             <div className="flex items-center justify-between mb-5">
//               <div className="flex items-center gap-2">
//                 <DollarSign className="h-5 w-5 text-blue-600" />
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Deal & Transaction
//                 </h3>
//                 {deal && (
//                   <span
//                     className={`text-xs font-medium px-2 py-0.5 rounded-full ${paymentStatusColors[deal.paymentStatus]}`}
//                   >
//                     {paymentStatusLabels[deal.paymentStatus]}
//                   </span>
//                 )}
//               </div>
//               {!showDealForm && (
//                 <button
//                   onClick={openDealForm}
//                   className="btn-primary flex items-center gap-2 text-sm"
//                 >
//                   {deal ? (
//                     <>
//                       <Edit className="h-3.5 w-3.5" />
//                       Edit Deal
//                     </>
//                   ) : (
//                     <>
//                       <Plus className="h-3.5 w-3.5" />
//                       Add Deal
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>

//             {dealLoading ? (
//               <div className="text-sm text-gray-400">Loading deal...</div>
//             ) : !deal && !showDealForm ? (
//               <div className="text-center py-8 text-gray-400">
//                 <Car className="h-10 w-10 mx-auto mb-2 opacity-30" />
//                 <p className="text-sm">No deal recorded yet.</p>
//                 <p className="text-xs mt-1">
//                   Click &quot;Add Deal&quot; to record the chosen car, agreed
//                   price, deposit and payment info.
//                 </p>
//               </div>
//             ) : deal && !showDealForm ? (
//               /* ── Deal Summary ── */
//               <div className="space-y-5">
//                 {/* Car info */}
//                 <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
//                   {deal.car.photos.find((p) => p.isMain)?.url ? (
//                     <img
//                       src={deal.car.photos.find((p) => p.isMain)!.url}
//                       alt="Car"
//                       className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
//                     />
//                   ) : (
//                     <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
//                       <Car className="h-6 w-6 text-gray-400" />
//                     </div>
//                   )}
//                   <div>
//                     <p className="font-semibold text-gray-900 text-base">
//                       {deal.car.year} {deal.car.make} {deal.car.model}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {deal.car.color} · {deal.car.mileage.toLocaleString()} km
//                       {deal.car.licensePlate && ` · ${deal.car.licensePlate}`}
//                     </p>
//                     <Link
//                       href={`/inventory/${deal.car.id}`}
//                       className="text-xs text-blue-600 hover:underline"
//                     >
//                       View in Inventory →
//                     </Link>
//                   </div>
//                 </div>

//                 {/* Financials grid */}
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                   <div className="p-3 bg-blue-50 rounded-lg">
//                     <p className="text-xs text-blue-600 font-medium">
//                       Agreed Price
//                     </p>
//                     <p className="text-lg font-bold text-blue-800">
//                       {formatCurrency(deal.agreedPrice)}
//                     </p>
//                   </div>
//                   <div className="p-3 bg-green-50 rounded-lg">
//                     <p className="text-xs text-green-600 font-medium">
//                       Deposit Paid
//                     </p>
//                     <p className="text-lg font-bold text-green-800">
//                       {formatCurrency(deal.depositAmount)}
//                     </p>
//                     {deal.depositDate && (
//                       <p className="text-xs text-green-600">
//                         {formatDate(deal.depositDate)}
//                       </p>
//                     )}
//                   </div>
//                   <div
//                     className={`p-3 rounded-lg ${remainingBalance <= 0 ? 'bg-green-50' : 'bg-orange-50'}`}
//                   >
//                     <p
//                       className={`text-xs font-medium ${remainingBalance <= 0 ? 'text-green-600' : 'text-orange-600'}`}
//                     >
//                       Remaining Balance
//                     </p>
//                     <p
//                       className={`text-lg font-bold ${remainingBalance <= 0 ? 'text-green-800' : 'text-orange-800'}`}
//                     >
//                       {formatCurrency(Math.max(0, remainingBalance))}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Meta info */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//                   <div className="flex items-center gap-2">
//                     <CreditCard className="h-4 w-4 text-gray-400" />
//                     <span className="text-gray-500">Payment:</span>
//                     <span className="font-medium">
//                       {paymentMethodLabels[deal.paymentMethod]}
//                     </span>
//                   </div>
//                   {deal.depositPaidBy && (
//                     <div className="flex items-center gap-2">
//                       <DollarSign className="h-4 w-4 text-gray-400" />
//                       <span className="text-gray-500">Deposit via:</span>
//                       <span className="font-medium">{deal.depositPaidBy}</span>
//                     </div>
//                   )}
//                   {deal.expectedFinalPaymentDate && (
//                     <div className="flex items-center gap-2">
//                       <Calendar className="h-4 w-4 text-gray-400" />
//                       <span className="text-gray-500">Final payment by:</span>
//                       <span className="font-medium">
//                         {formatDate(deal.expectedFinalPaymentDate)}
//                       </span>
//                     </div>
//                   )}
//                   {deal.handler && (
//                     <div className="flex items-center gap-2">
//                       <User className="h-4 w-4 text-gray-400" />
//                       <span className="text-gray-500">Deal handled by:</span>
//                       <span className="font-medium">{deal.handler.name}</span>
//                     </div>
//                   )}
//                 </div>

//                 {deal.notes && (
//                   <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
//                     {deal.notes}
//                   </p>
//                 )}

//                 {/* ── Payment Plan Tracker ── */}
//                 {deal.paymentMethod === 'PAYMENT_PLAN' &&
//                   deal.installments.length > 0 && (
//                     <div className="mt-2 border-t pt-4">
//                       <div
//                         className="flex items-center justify-between cursor-pointer"
//                         onClick={() =>
//                           setInstallmentsExpanded(!installmentsExpanded)
//                         }
//                       >
//                         <div className="flex items-center gap-2">
//                           <h4 className="text-sm font-semibold text-gray-800">
//                             Payment Plan Tracker
//                           </h4>
//                           {lateCount > 0 && (
//                             <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
//                               <AlertTriangle className="h-3 w-3" />
//                               {lateCount} late
//                             </span>
//                           )}
//                         </div>
//                         {installmentsExpanded ? (
//                           <ChevronUp className="h-4 w-4 text-gray-400" />
//                         ) : (
//                           <ChevronDown className="h-4 w-4 text-gray-400" />
//                         )}
//                       </div>

//                       {/* Progress bar */}
//                       <div className="mt-3 mb-4">
//                         <div className="flex justify-between text-xs text-gray-500 mb-1">
//                           <span>{formatCurrency(totalPaid)} paid</span>
//                           <span>{progressPct}%</span>
//                         </div>
//                         <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
//                           <div
//                             className={`h-full rounded-full transition-all ${progressPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
//                             style={{ width: `${progressPct}%` }}
//                           />
//                         </div>
//                         <div className="flex justify-between text-xs text-gray-400 mt-1">
//                           <span>Total: {formatCurrency(deal.agreedPrice)}</span>
//                           <span>
//                             Remaining:{' '}
//                             {formatCurrency(Math.max(0, remainingBalance))}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Installment rows */}
//                       {installmentsExpanded && (
//                         <div className="space-y-2">
//                           {deal.installments.map((inst) => {
//                             const late = isLate(inst.dueDate, inst.status);
//                             const displayStatus = late ? 'LATE' : inst.status;
//                             return (
//                               <div
//                                 key={inst.id}
//                                 className={`flex items-center justify-between p-3 rounded-lg border ${
//                                   late
//                                     ? 'border-red-200 bg-red-50'
//                                     : inst.status === 'PAID'
//                                       ? 'border-green-200 bg-green-50'
//                                       : 'border-gray-200 bg-white'
//                                 }`}
//                               >
//                                 <div className="flex items-center gap-3">
//                                   {inst.status === 'PAID' ? (
//                                     <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
//                                   ) : late ? (
//                                     <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
//                                   ) : (
//                                     <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
//                                   )}
//                                   <div>
//                                     <p className="text-sm font-medium text-gray-800">
//                                       #{inst.installmentNumber} ·{' '}
//                                       {formatCurrency(inst.amount)}
//                                     </p>
//                                     <p className="text-xs text-gray-500">
//                                       Due: {formatDate(inst.dueDate)}
//                                       {inst.paidDate &&
//                                         ` · Paid: ${formatDate(inst.paidDate)}`}
//                                     </p>
//                                     {inst.notes && (
//                                       <p className="text-xs text-gray-400 italic">
//                                         {inst.notes}
//                                       </p>
//                                     )}
//                                   </div>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <span
//                                     className={`text-xs font-medium px-2 py-0.5 rounded-full ${installmentStatusColors[displayStatus]}`}
//                                   >
//                                     {displayStatus}
//                                   </span>
//                                   {inst.status !== 'PAID' && (
//                                     <button
//                                       onClick={() =>
//                                         markInstallment(inst.id, 'PAID')
//                                       }
//                                       className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
//                                     >
//                                       Mark Paid
//                                     </button>
//                                   )}
//                                   {inst.status === 'PAID' && (
//                                     <button
//                                       onClick={() =>
//                                         markInstallment(inst.id, 'PENDING')
//                                       }
//                                       className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
//                                     >
//                                       Undo
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   )}
//               </div>
//             ) : null}

//             {/* ── Deal Form ── */}
//             {showDealForm && (
//               <div className="space-y-5">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {/* Car */}
//                   <div className="sm:col-span-2">
//                     <label className="label">Chosen Car *</label>
//                     <select
//                       value={dealForm.carId}
//                       onChange={(e) =>
//                         setDealForm({ ...dealForm, carId: e.target.value })
//                       }
//                       className="input-field"
//                       disabled={editingDeal}
//                     >
//                       <option value="">— Select car —</option>
//                       {availableCars.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {c.year} {c.make} {c.model}
//                         </option>
//                       ))}
//                       {/* If editing, show currently linked car even if not AVAILABLE */}
//                       {editingDeal && deal && (
//                         <option value={deal.carId}>
//                           {deal.car.year} {deal.car.make} {deal.car.model}{' '}
//                           (current)
//                         </option>
//                       )}
//                     </select>
//                   </div>

//                   {/* Agreed Price */}
//                   <div>
//                     <label className="label">Agreed Sale Price *</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       value={dealForm.agreedPrice}
//                       onChange={(e) =>
//                         setDealForm({
//                           ...dealForm,
//                           agreedPrice: e.target.value,
//                         })
//                       }
//                       className="input-field"
//                       placeholder="e.g. 15000"
//                     />
//                   </div>

//                   {/* Payment Method */}
//                   <div>
//                     <label className="label">Payment Method *</label>
//                     <select
//                       value={dealForm.paymentMethod}
//                       onChange={(e) =>
//                         setDealForm({
//                           ...dealForm,
//                           paymentMethod: e.target.value,
//                         })
//                       }
//                       className="input-field"
//                     >
//                       <option value="CASH">Cash</option>
//                       <option value="BANK_TRANSFER">Bank Transfer</option>
//                       <option value="FINANCING">Financing</option>
//                       <option value="PAYMENT_PLAN">Payment Plan</option>
//                     </select>
//                   </div>

//                   {/* Deposit Amount */}
//                   <div>
//                     <label className="label">Deposit / Advance Amount</label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       value={dealForm.depositAmount}
//                       onChange={(e) =>
//                         setDealForm({
//                           ...dealForm,
//                           depositAmount: e.target.value,
//                         })
//                       }
//                       className="input-field"
//                       placeholder="0"
//                     />
//                   </div>

//                   {/* Deposit Date */}
//                   <div>
//                     <label className="label">Deposit Date</label>
//                     <input
//                       type="date"
//                       value={dealForm.depositDate}
//                       onChange={(e) =>
//                         setDealForm({
//                           ...dealForm,
//                           depositDate: e.target.value,
//                         })
//                       }
//                       className="input-field"
//                     />
//                   </div>

//                   {/* Deposit paid by */}
//                   <div>
//                     <label className="label">Deposit Paid Via</label>
//                     <input
//                       type="text"
//                       value={dealForm.depositPaidBy}
//                       onChange={(e) =>
//                         setDealForm({
//                           ...dealForm,
//                           depositPaidBy: e.target.value,
//                         })
//                       }
//                       className="input-field"
//                       placeholder="e.g. Cash, MB Way, Transfer..."
//                     />
//                   </div>

//                   {/* Payment Status */}
//                   <div>
//                     <label className="label">Payment Status</label>
//                     <select
//                       value={dealForm.paymentStatus}
//                       onChange={(e) =>
//                         setDealForm({
//                           ...dealForm,
//                           paymentStatus: e.target.value,
//                         })
//                       }
//                       className="input-field"
//                     >
//                       <option value="PENDING">Pending</option>
//                       <option value="DEPOSIT_PAID">Deposit Paid</option>
//                       <option value="PAID_IN_FULL">Paid in Full</option>
//                     </select>
//                   </div>

//                   {/* Final Payment Date */}
//                   <div>
//                     <label className="label">Expected Final Payment Date</label>
//                     <input
//                       type="date"
//                       value={dealForm.expectedFinalPaymentDate}
//                       onChange={(e) =>
//                         setDealForm({
//                           ...dealForm,
//                           expectedFinalPaymentDate: e.target.value,
//                         })
//                       }
//                       className="input-field"
//                     />
//                   </div>

//                   {/* Handler */}
//                   <div>
//                     <label className="label">Deal Handler / Salesperson</label>
//                     <select
//                       value={dealForm.handlerId}
//                       onChange={(e) =>
//                         setDealForm({ ...dealForm, handlerId: e.target.value })
//                       }
//                       className="input-field"
//                     >
//                       <option value="">— Select person —</option>
//                       {availableHandlers.map((u) => (
//                         <option key={u.id} value={u.id}>
//                           {u.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Notes */}
//                   <div className="sm:col-span-2">
//                     <label className="label">Deal Notes</label>
//                     <textarea
//                       value={dealForm.notes}
//                       onChange={(e) =>
//                         setDealForm({ ...dealForm, notes: e.target.value })
//                       }
//                       className="input-field"
//                       rows={3}
//                       placeholder="Any deal-specific notes..."
//                     />
//                   </div>
//                 </div>

//                 {/* ── Installment builder (only when creating, PAYMENT_PLAN) ── */}
//                 {!editingDeal && dealForm.paymentMethod === 'PAYMENT_PLAN' && (
//                   <div className="border-t pt-4">
//                     <div className="flex items-center justify-between mb-3">
//                       <h4 className="text-sm font-semibold text-gray-800">
//                         Payment Plan Installments
//                       </h4>
//                       <button
//                         type="button"
//                         onClick={addInstallmentRow}
//                         className="text-xs btn-secondary flex items-center gap-1"
//                       >
//                         <Plus className="h-3 w-3" />
//                         Add Installment
//                       </button>
//                     </div>

//                     {installmentRows.length === 0 && (
//                       <p className="text-xs text-gray-400 italic">
//                         Click &quot;Add Installment&quot; to schedule payments.
//                       </p>
//                     )}

//                     <div className="space-y-2">
//                       {installmentRows.map((row, i) => (
//                         <div
//                           key={i}
//                           className="grid grid-cols-12 gap-2 items-center"
//                         >
//                           <div className="col-span-1 text-center text-xs text-gray-400">
//                             #{row.installmentNumber}
//                           </div>
//                           <div className="col-span-3">
//                             <input
//                               type="number"
//                               placeholder="Amount"
//                               value={row.amount}
//                               onChange={(e) =>
//                                 updateInstallmentRow(
//                                   i,
//                                   'amount',
//                                   e.target.value,
//                                 )
//                               }
//                               className="input-field text-sm"
//                             />
//                           </div>
//                           <div className="col-span-3">
//                             <input
//                               type="date"
//                               value={row.dueDate}
//                               onChange={(e) =>
//                                 updateInstallmentRow(
//                                   i,
//                                   'dueDate',
//                                   e.target.value,
//                                 )
//                               }
//                               className="input-field text-sm"
//                             />
//                           </div>
//                           <div className="col-span-4">
//                             <input
//                               type="text"
//                               placeholder="Notes (optional)"
//                               value={row.notes}
//                               onChange={(e) =>
//                                 updateInstallmentRow(i, 'notes', e.target.value)
//                               }
//                               className="input-field text-sm"
//                             />
//                           </div>
//                           <div className="col-span-1">
//                             <button
//                               type="button"
//                               onClick={() => removeInstallmentRow(i)}
//                               className="text-gray-400 hover:text-red-500"
//                             >
//                               <X className="h-4 w-4" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Form buttons */}
//                 <div className="flex gap-3 pt-2">
//                   <button
//                     onClick={() => setShowDealForm(false)}
//                     className="btn-secondary"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSaveDeal}
//                     disabled={savingDeal}
//                     className="btn-primary flex items-center gap-2"
//                   >
//                     <Save className="h-4 w-4" />
//                     {savingDeal
//                       ? 'Saving...'
//                       : editingDeal
//                         ? 'Update Deal'
//                         : 'Create Deal'}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Notes */}
//           <div className="card p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
//             {editing ? (
//               <textarea
//                 value={editData.notes}
//                 onChange={(e) =>
//                   setEditData({ ...editData, notes: e.target.value })
//                 }
//                 className="input-field"
//                 rows={6}
//                 placeholder="Conversation history, preferences..."
//               />
//             ) : (
//               <p className="text-sm text-gray-600 whitespace-pre-wrap">
//                 {customer.notes || 'No notes yet'}
//               </p>
//             )}
//           </div>

//           {/* Test Drives */}
//           <div className="card p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-3">
//               Test Drives ({customer.testDrives?.length || 0})
//             </h3>
//             {customer.testDrives && customer.testDrives.length > 0 ? (
//               <div className="space-y-3">
//                 {customer.testDrives.map((td) => (
//                   <div
//                     key={td.id}
//                     className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
//                   >
//                     <Car className="h-5 w-5 text-gray-400" />
//                     <div>
//                       <p className="font-medium text-sm">
//                         {td.car?.make} {td.car?.model} {td.car?.year}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {formatDate(td.date)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500">No test drives yet</p>
//             )}
//           </div>
//         </div>

//         {/* ── Right Column ── */}
//         <div className="space-y-6">
//           {/* Lead Info */}
//           <div className="card p-6">
//             <h3 className="text-sm font-medium text-gray-700 mb-3">
//               Lead Information
//             </h3>
//             <div className="space-y-3">
//               <div>
//                 <p className="text-xs text-gray-500">Source</p>
//                 <p className="font-medium">
//                   {leadSourceLabels[customer.leadSource]}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-500">Status</p>
//                 <StatusBadge
//                   status={customer.status}
//                   colorMap={customerStatusColors}
//                   labelMap={customerStatusLabels}
//                 />
//               </div>
//               {customer.followUpDate && (
//                 <div>
//                   <p className="text-xs text-gray-500">Follow-up Date</p>
//                   <p className="font-medium">
//                     {formatDate(customer.followUpDate)}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Deal quick summary card (right column) */}
//           {deal && (
//             <div className="card p-4 border-blue-200 bg-blue-50">
//               <h3 className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">
//                 Deal Summary
//               </h3>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-blue-600">Car</span>
//                   <span className="font-medium text-blue-900">
//                     {deal.car.year} {deal.car.make} {deal.car.model}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-blue-600">Agreed</span>
//                   <span className="font-bold text-blue-900">
//                     {formatCurrency(deal.agreedPrice)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-blue-600">Deposit</span>
//                   <span className="font-medium text-blue-900">
//                     {formatCurrency(deal.depositAmount)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-t border-blue-200 pt-2">
//                   <span className="text-blue-600 font-medium">Balance</span>
//                   <span className="font-bold text-orange-700">
//                     {formatCurrency(Math.max(0, remainingBalance))}
//                   </span>
//                 </div>
//                 {deal.handler && (
//                   <div className="flex justify-between pt-1">
//                     <span className="text-blue-600">Handler</span>
//                     <span className="font-medium text-blue-900">
//                       {deal.handler.name}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Interested Cars */}
//           <div className="card p-6">
//             <h3 className="text-sm font-medium text-gray-700 mb-3">
//               Interested Cars ({customer.interestedCars?.length || 0})
//             </h3>
//             {customer.interestedCars && customer.interestedCars.length > 0 ? (
//               <div className="space-y-2">
//                 {customer.interestedCars.map((cc) => (
//                   <Link
//                     key={cc.id}
//                     href={`/inventory/${cc.car.id}`}
//                     className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
//                   >
//                     <p className="font-medium text-sm">
//                       {cc.car.make} {cc.car.model} {cc.car.year}
//                     </p>
//                     <p className="text-xs text-blue-600">
//                       {formatCurrency(cc.car.targetPrice)}
//                     </p>
//                   </Link>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500">No interested cars</p>
//             )}
//           </div>

//           {/* Sales */}
//           {customer.sales && customer.sales.length > 0 && (
//             <div className="card p-6 bg-green-50 border-green-200">
//               <h3 className="text-sm font-medium text-green-800 mb-3">
//                 Purchases
//               </h3>
//               {customer.sales.map((sale) => (
//                 <div key={sale.id} className="p-3 bg-white rounded-lg">
//                   <p className="font-medium text-sm">
//                     {sale.car.make} {sale.car.model} {sale.car.year}
//                   </p>
//                   <p className="text-xs text-green-700">
//                     {formatCurrency(sale.salePrice)} ·{' '}
//                     {formatDate(sale.saleDate)}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <ConfirmDialog
//         isOpen={deleteConfirm}
//         onClose={() => setDeleteConfirm(false)}
//         onConfirm={handleDelete}
//         title="Delete Customer"
//         message="Are you sure you want to delete this customer? This action cannot be undone."
//         confirmText="Delete"
//       />
//     </div>
//   );
// }

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  Save,
  Plus,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  CreditCard,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Banknote,
  Receipt,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import StatusBadge from '@/components/ui/status-badge';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import {
  formatDate,
  formatCurrency,
  customerStatusColors,
  customerStatusLabels,
  leadSourceLabels,
} from '@/lib/utils';
import { CustomerWithRelations } from '@/types';
import { handleClientError } from '@/lib/error-handler';
import Image from 'next/image';

// ─── Local types ──────────────────────────────────────────────────────────────

interface PaymentEntry {
  id: string;
  amount: number;
  paidDate: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'MB_WAY' | 'CHECK' | 'OTHER';
  reference: string | null;
  notes: string | null;
  recorder: { id: string; name: string } | null;
}

interface Installment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'PENDING' | 'PAID' | 'LATE';
  notes: string | null;
}

interface Deal {
  id: string;
  customerId: string;
  carId: string;
  handlerId: string | null;
  agreedPrice: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'FINANCING' | 'PAYMENT_PLAN';
  paymentStatus: 'PENDING' | 'DEPOSIT_PAID' | 'PARTIALLY_PAID' | 'PAID_IN_FULL';
  expectedFinalPaymentDate: string | null;
  notes: string | null;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    mileage: number;
    licensePlate: string | null;
    photos: { url: string; isMain: boolean }[];
  };
  handler: { id: string; name: string; phone?: string } | null;
  installments: Installment[];
  payments: PaymentEntry[];
}

interface EditData {
  name: string;
  phone: string;
  email: string;
  address: string;
  leadSource: string;
  status: string;
  notes: string;
  followUpDate: string;
}

interface DealFormData {
  carId: string;
  handlerId: string;
  agreedPrice: string;
  paymentMethod: string;
  paymentStatus: string;
  expectedFinalPaymentDate: string;
  notes: string;
  // initial payment
  initAmount: string;
  initDate: string;
  initMethod: string;
  initReference: string;
  initNotes: string;
}

interface PaymentFormData {
  amount: string;
  paidDate: string;
  method: string;
  reference: string;
  notes: string;
}

interface InstallmentFormRow {
  installmentNumber: number;
  amount: string;
  dueDate: string;
  notes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  FINANCING: 'Financing',
  PAYMENT_PLAN: 'Payment Plan',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  DEPOSIT_PAID: 'Deposit Paid',
  PARTIALLY_PAID: 'Partially Paid',
  PAID_IN_FULL: 'Paid in Full',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  DEPOSIT_PAID: 'bg-blue-100 text-blue-800',
  PARTIALLY_PAID: 'bg-orange-100 text-orange-800',
  PAID_IN_FULL: 'bg-green-100 text-green-800',
};

const ENTRY_METHOD_LABELS: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  MB_WAY: 'MB Way',
  CHECK: 'Check',
  OTHER: 'Other',
};

const ENTRY_METHOD_ICONS: Record<string, React.ReactNode> = {
  CASH: <Banknote className="h-3.5 w-3.5" />,
  BANK_TRANSFER: <CreditCard className="h-3.5 w-3.5" />,
  MB_WAY: <Phone className="h-3.5 w-3.5" />,
  CHECK: <Receipt className="h-3.5 w-3.5" />,
  OTHER: <DollarSign className="h-3.5 w-3.5" />,
};

const INSTALLMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  LATE: 'bg-red-100 text-red-700',
};

function isLate(dueDate: string, status: string) {
  if (status === 'PAID') return false;
  return new Date(dueDate) < new Date();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  // Customer
  const [customer, setCustomer] = useState<CustomerWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    leadSource: '',
    status: '',
    notes: '',
    followUpDate: '',
  });

  // Deal
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealLoading, setDealLoading] = useState(true);
  const [showDealForm, setShowDealForm] = useState(false);
  const [savingDeal, setSavingDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(false);
  const [deleteDealConfirm, setDeleteDealConfirm] = useState(false);

  const [dealForm, setDealForm] = useState<DealFormData>({
    carId: '',
    handlerId: '',
    agreedPrice: '',
    paymentMethod: 'CASH',
    paymentStatus: 'PENDING',
    expectedFinalPaymentDate: '',
    notes: '',
    initAmount: '',
    initDate: new Date().toISOString().split('T')[0],
    initMethod: 'CASH',
    initReference: '',
    initNotes: '',
  });

  // Dropdown data
  const [availableCars, setAvailableCars] = useState<
    { id: string; make: string; model: string; year: number }[]
  >([]);
  const [availableHandlers, setAvailableHandlers] = useState<
    { id: string; name: string; role: string }[]
  >([]);

  // Payment entry form
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amount: '',
    paidDate: new Date().toISOString().split('T')[0],
    method: 'CASH',
    reference: '',
    notes: '',
  });

  // Installments
  const [installmentRows, setInstallmentRows] = useState<InstallmentFormRow[]>(
    [],
  );
  const [installmentsExpanded, setInstallmentsExpanded] = useState(true);
  const [paymentsExpanded, setPaymentsExpanded] = useState(true);

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers/${params.id}`);
      if (!res.ok) throw new Error('Customer not found');
      const data = await res.json();
      setCustomer(data);
      setEditData({
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        address: data.address || '',
        leadSource: data.leadSource,
        status: data.status,
        notes: data.notes || '',
        followUpDate: data.followUpDate
          ? new Date(data.followUpDate).toISOString().split('T')[0]
          : '',
      });
    } catch (error) {
      toast.error(
        handleClientError(error, 'fetchCustomer') || 'Failed to load customer',
      );
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const fetchDeal = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals?customerId=${params.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setDeal(data.length > 0 ? data[0] : null);
    } catch {
      /* silent */
    } finally {
      setDealLoading(false);
    }
  }, [params.id]);

  const fetchFormData = useCallback(async () => {
    try {
      const [carsRes, usersRes] = await Promise.all([
        fetch('/api/cars?status=AVAILABLE&limit=100'),
        fetch('/api/users'),
      ]);
      if (carsRes.ok) {
        const d = await carsRes.json();
        setAvailableCars(d.cars || []);
      }
      if (usersRes.ok) {
        setAvailableHandlers(await usersRes.json());
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchCustomer();
    fetchDeal();
    fetchFormData();
  }, [fetchCustomer, fetchDeal, fetchFormData]);

  // ─── Customer handlers ──────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        toast.success('Customer updated');
        setEditing(false);
        fetchCustomer();
      } else {
        const e = await res.json();
        toast.error(e.error || 'Failed to update');
      }
    } catch (error) {
      toast.error(handleClientError(error, 'handleSave') || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/customers/${params.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Customer deleted');
        router.push('/customers');
      } else {
        const d = await res.json();
        toast.error(d.error);
      }
    } catch (error) {
      toast.error(
        handleClientError(error, 'handleDelete') || 'Failed to delete',
      );
    }
  };

  // ─── Deal handlers ──────────────────────────────────────────────────────────

  const openDealForm = () => {
    if (deal) {
      setDealForm({
        carId: deal.carId,
        handlerId: deal.handlerId || '',
        agreedPrice: String(deal.agreedPrice),
        paymentMethod: deal.paymentMethod,
        paymentStatus: deal.paymentStatus,
        expectedFinalPaymentDate: deal.expectedFinalPaymentDate
          ? new Date(deal.expectedFinalPaymentDate).toISOString().split('T')[0]
          : '',
        notes: deal.notes || '',
        initAmount: '',
        initDate: new Date().toISOString().split('T')[0],
        initMethod: 'CASH',
        initReference: '',
        initNotes: '',
      });
      setEditingDeal(true);
    } else {
      setDealForm({
        carId: '',
        handlerId: '',
        agreedPrice: '',
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING',
        expectedFinalPaymentDate: '',
        notes: '',
        initAmount: '',
        initDate: new Date().toISOString().split('T')[0],
        initMethod: 'CASH',
        initReference: '',
        initNotes: '',
      });
      setInstallmentRows([]);
      setEditingDeal(false);
    }
    setShowDealForm(true);
  };

  const handleSaveDeal = async () => {
    if (!dealForm.carId) {
      toast.error('Please select a car');
      return;
    }
    if (!dealForm.agreedPrice || Number(dealForm.agreedPrice) <= 0) {
      toast.error('Please enter the agreed price');
      return;
    }
    setSavingDeal(true);
    try {
      const payload: Record<string, unknown> = {
        customerId: params.id,
        carId: dealForm.carId,
        handlerId: dealForm.handlerId || null,
        agreedPrice: Number(dealForm.agreedPrice),
        paymentMethod: dealForm.paymentMethod,
        paymentStatus: dealForm.paymentStatus,
        expectedFinalPaymentDate: dealForm.expectedFinalPaymentDate || null,
        notes: dealForm.notes || null,
      };

      // If creating — attach optional first payment
      if (
        !editingDeal &&
        dealForm.initAmount &&
        Number(dealForm.initAmount) > 0
      ) {
        payload.initialPayment = {
          amount: Number(dealForm.initAmount),
          paidDate: dealForm.initDate,
          method: dealForm.initMethod,
          reference: dealForm.initReference || null,
          notes: dealForm.initNotes || null,
        };
      }

      // Attach installments schedule if payment plan
      if (
        !editingDeal &&
        dealForm.paymentMethod === 'PAYMENT_PLAN' &&
        installmentRows.length > 0
      ) {
        payload.installments = installmentRows.map((r) => ({
          installmentNumber: r.installmentNumber,
          amount: Number(r.amount),
          dueDate: r.dueDate,
          notes: r.notes || null,
        }));
      }

      const url = editingDeal ? `/api/deals/${deal!.id}` : '/api/deals';
      const method = editingDeal ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save deal');
      }
      toast.success(editingDeal ? 'Deal updated!' : 'Deal created!');
      setShowDealForm(false);
      fetchDeal();
    } catch (error) {
      toast.error(
        handleClientError(error, 'handleSaveDeal') || 'Failed to save deal',
      );
    } finally {
      setSavingDeal(false);
    }
  };

  const handleDeleteDeal = async () => {
    try {
      const res = await fetch(`/api/deals/${deal!.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deal deleted');
        setDeal(null);
      } else {
        const e = await res.json();
        toast.error(e.error);
      }
    } catch (error) {
      toast.error(
        handleClientError(error, 'handleDeleteDeal') || 'Failed to delete deal',
      );
    }
  };

  // ─── Payment entry handlers ─────────────────────────────────────────────────

  const handleAddPayment = async () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    if (!paymentForm.paidDate) {
      toast.error('Enter the payment date');
      return;
    }

    setSavingPayment(true);
    try {
      const res = await fetch(`/api/deals/${deal!.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(paymentForm.amount),
          paidDate: paymentForm.paidDate,
          method: paymentForm.method,
          reference: paymentForm.reference || null,
          notes: paymentForm.notes || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add payment');
      }
      toast.success('Payment recorded!');
      setShowPaymentForm(false);
      setPaymentForm({
        amount: '',
        paidDate: new Date().toISOString().split('T')[0],
        method: 'CASH',
        reference: '',
        notes: '',
      });
      fetchDeal();
    } catch (error) {
      toast.error(
        handleClientError(error, 'handleAddPayment') || 'Failed to add payment',
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/deals/payments/${paymentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Payment removed');
        fetchDeal();
      } else {
        const e = await res.json();
        toast.error(e.error);
      }
    } catch (error) {
      toast.error(
        handleClientError(error, 'handleDeletePayment') ||
          'Failed to delete payment',
      );
    } finally {
      setDeletePaymentId(null);
    }
  };

  // ─── Installment handlers ───────────────────────────────────────────────────

  const addInstallmentRow = () => {
    const next = installmentRows.length + 1;
    setInstallmentRows([
      ...installmentRows,
      { installmentNumber: next, amount: '', dueDate: '', notes: '' },
    ]);
  };

  const removeInstallmentRow = (i: number) =>
    setInstallmentRows(installmentRows.filter((_, idx) => idx !== i));

  const updateInstallmentRow = (
    i: number,
    field: keyof InstallmentFormRow,
    value: string,
  ) => {
    const updated = [...installmentRows];
    updated[i] = { ...updated[i], [field]: value };
    setInstallmentRows(updated);
  };

  const markInstallment = async (
    instId: string,
    status: 'PAID' | 'PENDING' | 'LATE',
  ) => {
    try {
      const res = await fetch(`/api/installments/${instId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          paidDate: status === 'PAID' ? new Date().toISOString() : null,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error);
      }
      toast.success(status === 'PAID' ? 'Marked as paid!' : 'Status updated');
      fetchDeal();
    } catch (error) {
      toast.error(
        handleClientError(error, 'markInstallment') || 'Failed to update',
      );
    }
  };

  // ─── Derived values ─────────────────────────────────────────────────────────

  const totalPaid = deal ? deal.payments.reduce((s, p) => s + p.amount, 0) : 0;
  const remainingBalance = deal ? Math.max(0, deal.agreedPrice - totalPaid) : 0;
  const progressPct = deal
    ? Math.min(100, Math.round((totalPaid / deal.agreedPrice) * 100))
    : 0;
  const lateCount = deal
    ? deal.installments.filter((i) => isLate(i.dueDate, i.status)).length
    : 0;

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner className="h-96" />;
  if (!customer) return null;

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ════════ LEFT COLUMN ════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Contact card ── */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              {editing ? (
                <input
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="input-field text-xl font-bold"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.name}
                </h1>
              )}
              {!editing && (
                <StatusBadge
                  status={customer.status}
                  colorMap={customerStatusColors}
                  labelMap={customerStatusLabels}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                {editing ? (
                  <input
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    className="input-field flex-1"
                  />
                ) : (
                  <span>{customer.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                {editing ? (
                  <input
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="input-field flex-1"
                  />
                ) : (
                  <span>{customer.email || 'N/A'}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                {editing ? (
                  <input
                    value={editData.address}
                    onChange={(e) =>
                      setEditData({ ...editData, address: e.target.value })
                    }
                    className="input-field flex-1"
                  />
                ) : (
                  <span>{customer.address || 'N/A'}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Customer since {formatDate(customer.createdAt)}
                </span>
              </div>
            </div>

            {editing && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <label className="label">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="input-field"
                  >
                    {Object.entries(customerStatusLabels).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Lead Source</label>
                  <select
                    value={editData.leadSource}
                    onChange={(e) =>
                      setEditData({ ...editData, leadSource: e.target.value })
                    }
                    className="input-field"
                  >
                    {Object.entries(leadSourceLabels).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Follow-up Date</label>
                  <input
                    type="date"
                    value={editData.followUpDate}
                    onChange={(e) =>
                      setEditData({ ...editData, followUpDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════
              DEAL & TRANSACTION PANEL
          ══════════════════════════════════════════════ */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Deal & Transaction
                </h3>
                {deal && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full
                    ${PAYMENT_STATUS_COLORS[deal.paymentStatus]}`}
                  >
                    {PAYMENT_STATUS_LABELS[deal.paymentStatus]}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {deal && !showDealForm && (
                  <>
                    <button
                      onClick={openDealForm}
                      className="btn-secondary flex items-center gap-1.5 text-sm"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit Deal
                    </button>
                    <button
                      onClick={() => setDeleteDealConfirm(true)}
                      className="btn-danger flex items-center gap-1.5 text-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </>
                )}
                {!deal && !showDealForm && (
                  <button
                    onClick={openDealForm}
                    className="btn-primary flex items-center gap-1.5 text-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Deal
                  </button>
                )}
              </div>
            </div>

            {/* Loading */}
            {dealLoading ? (
              <div className="text-sm text-gray-400 py-4">Loading deal...</div>
            ) : /* Empty state */
            !deal && !showDealForm ? (
              <div className="text-center py-10 text-gray-400">
                <Car className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No deal recorded yet.</p>
                <p className="text-xs mt-1 text-gray-400">
                  Click &quot;Add Deal&quot; to record car, price, payments and
                  salesperson.
                </p>
              </div>
            ) : /* Deal summary view */
            deal && !showDealForm ? (
              <div className="space-y-5">
                {/* Car card */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  {deal.car.photos.find((p) => p.isMain)?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <Image
                      src={deal.car.photos.find((p) => p.isMain)!.url}
                      alt="Car"
                      className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-24 h-16 bg-gray-200 rounded-lg flex items-center
                      justify-center flex-shrink-0"
                    >
                      <Car className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {deal.car.year} {deal.car.make} {deal.car.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {deal.car.color} · {deal.car.mileage.toLocaleString()} km
                      {deal.car.licensePlate && ` · ${deal.car.licensePlate}`}
                    </p>
                    <Link
                      href={`/inventory/${deal.car.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View in Inventory →
                    </Link>
                  </div>
                </div>

                {/* Financial summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium">
                      Agreed Price
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {formatCurrency(deal.agreedPrice)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-medium">
                      Total Paid
                    </p>
                    <p className="text-lg font-bold text-green-800">
                      {formatCurrency(totalPaid)}
                    </p>
                    <p className="text-xs text-green-600">
                      {deal.payments.length} payment
                      {deal.payments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${remainingBalance <= 0 ? 'bg-green-50' : 'bg-orange-50'}`}
                  >
                    <p
                      className={`text-xs font-medium ${remainingBalance <= 0 ? 'text-green-600' : 'text-orange-600'}`}
                    >
                      Remaining
                    </p>
                    <p
                      className={`text-lg font-bold ${remainingBalance <= 0 ? 'text-green-800' : 'text-orange-800'}`}
                    >
                      {formatCurrency(remainingBalance)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium">
                      Progress
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {progressPct}%
                    </p>
                    <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                      <div
                        className={`h-full rounded-full transition-all
                        ${progressPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Payment:</span>
                    <span className="font-medium">
                      {PAYMENT_METHOD_LABELS[deal.paymentMethod]}
                    </span>
                  </div>
                  {deal.expectedFinalPaymentDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Final by:</span>
                      <span className="font-medium">
                        {formatDate(deal.expectedFinalPaymentDate)}
                      </span>
                    </div>
                  )}
                  {deal.handler && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Salesperson:</span>
                      <span className="font-medium text-blue-700">
                        {deal.handler.name}
                      </span>
                      {deal.handler.phone && (
                        <span className="text-gray-400 text-xs">
                          · {deal.handler.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {deal.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
                    {deal.notes}
                  </p>
                )}

                {/* ══ PAYMENT HISTORY ══ */}
                <div className="border-t pt-4">
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => setPaymentsExpanded(!paymentsExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-gray-500" />
                      <h4 className="text-sm font-semibold text-gray-800">
                        Payment History
                      </h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {deal.payments.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPaymentForm(true);
                        }}
                        className="text-xs btn-primary flex items-center gap-1 px-2 py-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Payment
                      </button>
                      {paymentsExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Add payment form */}
                  {showPaymentForm && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                      <h5 className="text-sm font-semibold text-blue-800">
                        Record New Payment
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">Amount *</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 2000"
                            value={paymentForm.amount}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                amount: e.target.value,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="label">Date *</label>
                          <input
                            type="date"
                            value={paymentForm.paidDate}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                paidDate: e.target.value,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="label">Method</label>
                          <select
                            value={paymentForm.method}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                method: e.target.value,
                              })
                            }
                            className="input-field"
                          >
                            {Object.entries(ENTRY_METHOD_LABELS).map(
                              ([v, l]) => (
                                <option key={v} value={v}>
                                  {l}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="label">Reference / Receipt #</label>
                          <input
                            type="text"
                            placeholder="Optional"
                            value={paymentForm.reference}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                reference: e.target.value,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="label">Notes</label>
                          <input
                            type="text"
                            placeholder="Optional note"
                            value={paymentForm.notes}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                notes: e.target.value,
                              })
                            }
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowPaymentForm(false)}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddPayment}
                          disabled={savingPayment}
                          className="btn-primary text-sm flex items-center gap-1.5"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {savingPayment ? 'Saving...' : 'Save Payment'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment list */}
                  {paymentsExpanded &&
                    (deal.payments.length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2">
                        No payments recorded yet. Click &quot;Add Payment&quot;
                        to log one.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {deal.payments.map((p, idx) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-3 bg-white
                              border border-gray-100 rounded-lg hover:border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-full bg-green-100 flex items-center
                                justify-center text-green-700 flex-shrink-0"
                              >
                                {idx + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">
                                    {formatCurrency(p.amount)}
                                  </span>
                                  <span
                                    className="flex items-center gap-1 text-xs
                                    bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                                  >
                                    {ENTRY_METHOD_ICONS[p.method]}
                                    {ENTRY_METHOD_LABELS[p.method]}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                                  <span>{formatDate(p.paidDate)}</span>
                                  {p.reference && (
                                    <span>· Ref: {p.reference}</span>
                                  )}
                                  {p.recorder && (
                                    <span>· Logged by {p.recorder.name}</span>
                                  )}
                                  {p.notes && <span>· {p.notes}</span>}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setDeletePaymentId(p.id)}
                              className="text-gray-300 hover:text-red-500 p-1 rounded transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        {/* Running total footer */}
                        <div
                          className="flex justify-between text-sm font-medium
                          pt-2 border-t text-gray-700 mt-1"
                        >
                          <span>Total paid</span>
                          <span className="text-green-700">
                            {formatCurrency(totalPaid)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* ══ PAYMENT PLAN INSTALLMENT TRACKER ══ */}
                {deal.paymentMethod === 'PAYMENT_PLAN' &&
                  deal.installments.length > 0 && (
                    <div className="border-t pt-4">
                      <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() =>
                          setInstallmentsExpanded(!installmentsExpanded)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <h4 className="text-sm font-semibold text-gray-800">
                            Installment Schedule
                          </h4>
                          {lateCount > 0 && (
                            <span
                              className="flex items-center gap-1 text-xs bg-red-100
                            text-red-700 px-2 py-0.5 rounded-full"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {lateCount} late
                            </span>
                          )}
                        </div>
                        {installmentsExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>

                      {installmentsExpanded && (
                        <div className="space-y-2">
                          {deal.installments.map((inst) => {
                            const late = isLate(inst.dueDate, inst.status);
                            const displayStatus = late ? 'LATE' : inst.status;
                            return (
                              <div
                                key={inst.id}
                                className={`flex items-center justify-between p-3 rounded-lg border
                                ${
                                  late
                                    ? 'border-red-200 bg-red-50'
                                    : inst.status === 'PAID'
                                      ? 'border-green-200 bg-green-50'
                                      : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {inst.status === 'PAID' ? (
                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                  ) : late ? (
                                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      #{inst.installmentNumber} ·{' '}
                                      {formatCurrency(inst.amount)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Due: {formatDate(inst.dueDate)}
                                      {inst.paidDate &&
                                        ` · Paid: ${formatDate(inst.paidDate)}`}
                                    </p>
                                    {inst.notes && (
                                      <p className="text-xs text-gray-400 italic">
                                        {inst.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full
                                  ${INSTALLMENT_STATUS_COLORS[displayStatus]}`}
                                  >
                                    {displayStatus}
                                  </span>
                                  {inst.status !== 'PAID' && (
                                    <button
                                      onClick={() =>
                                        markInstallment(inst.id, 'PAID')
                                      }
                                      className="text-xs bg-green-600 text-white px-2 py-1
                                      rounded hover:bg-green-700"
                                    >
                                      Mark Paid
                                    </button>
                                  )}
                                  {inst.status === 'PAID' && (
                                    <button
                                      onClick={() =>
                                        markInstallment(inst.id, 'PENDING')
                                      }
                                      className="text-xs bg-gray-200 text-gray-600 px-2 py-1
                                      rounded hover:bg-gray-300"
                                    >
                                      Undo
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ) : /* Deal create/edit form */
            showDealForm ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Car */}
                  <div className="sm:col-span-2">
                    <label className="label">Chosen Car *</label>
                    <select
                      value={dealForm.carId}
                      onChange={(e) =>
                        setDealForm({ ...dealForm, carId: e.target.value })
                      }
                      className="input-field"
                      disabled={editingDeal}
                    >
                      <option value="">— Select car —</option>
                      {availableCars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.year} {c.make} {c.model}
                        </option>
                      ))}
                      {editingDeal && deal && (
                        <option value={deal.carId}>
                          {deal.car.year} {deal.car.make} {deal.car.model}{' '}
                          (current)
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Salesperson */}
                  <div className="sm:col-span-2">
                    <label className="label">Salesperson / Deal Handler</label>
                    <select
                      value={dealForm.handlerId}
                      onChange={(e) =>
                        setDealForm({ ...dealForm, handlerId: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="">— Not assigned —</option>
                      {availableHandlers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Agreed price */}
                  <div>
                    <label className="label">Agreed Sale Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 15000"
                      value={dealForm.agreedPrice}
                      onChange={(e) =>
                        setDealForm({
                          ...dealForm,
                          agreedPrice: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="label">Payment Method *</label>
                    <select
                      value={dealForm.paymentMethod}
                      onChange={(e) =>
                        setDealForm({
                          ...dealForm,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="input-field"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="FINANCING">Financing</option>
                      <option value="PAYMENT_PLAN">Payment Plan</option>
                    </select>
                  </div>

                  {/* Payment status */}
                  <div>
                    <label className="label">Payment Status</label>
                    <select
                      value={dealForm.paymentStatus}
                      onChange={(e) =>
                        setDealForm({
                          ...dealForm,
                          paymentStatus: e.target.value,
                        })
                      }
                      className="input-field"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="DEPOSIT_PAID">Deposit Paid</option>
                      <option value="PARTIALLY_PAID">Partially Paid</option>
                      <option value="PAID_IN_FULL">Paid in Full</option>
                    </select>
                  </div>

                  {/* Final payment deadline */}
                  <div>
                    <label className="label">Expected Final Payment Date</label>
                    <input
                      type="date"
                      value={dealForm.expectedFinalPaymentDate}
                      onChange={(e) =>
                        setDealForm({
                          ...dealForm,
                          expectedFinalPaymentDate: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="label">Deal Notes</label>
                    <textarea
                      value={dealForm.notes}
                      onChange={(e) =>
                        setDealForm({ ...dealForm, notes: e.target.value })
                      }
                      className="input-field"
                      rows={2}
                      placeholder="Any notes about this deal..."
                    />
                  </div>
                </div>

                {/* ── Initial payment block (create only) ── */}
                {!editingDeal && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Initial / Deposit Payment{' '}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="label">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={dealForm.initAmount}
                          onChange={(e) =>
                            setDealForm({
                              ...dealForm,
                              initAmount: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">Date</label>
                        <input
                          type="date"
                          value={dealForm.initDate}
                          onChange={(e) =>
                            setDealForm({
                              ...dealForm,
                              initDate: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="label">Method</label>
                        <select
                          value={dealForm.initMethod}
                          onChange={(e) =>
                            setDealForm({
                              ...dealForm,
                              initMethod: e.target.value,
                            })
                          }
                          className="input-field"
                        >
                          {Object.entries(ENTRY_METHOD_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Reference</label>
                        <input
                          type="text"
                          placeholder="Optional"
                          value={dealForm.initReference}
                          onChange={(e) =>
                            setDealForm({
                              ...dealForm,
                              initReference: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label">Notes</label>
                        <input
                          type="text"
                          placeholder="Optional"
                          value={dealForm.initNotes}
                          onChange={(e) =>
                            setDealForm({
                              ...dealForm,
                              initNotes: e.target.value,
                            })
                          }
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Installment schedule (create + PAYMENT_PLAN) ── */}
                {!editingDeal && dealForm.paymentMethod === 'PAYMENT_PLAN' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Payment Plan Schedule
                      </h4>
                      <button
                        type="button"
                        onClick={addInstallmentRow}
                        className="text-xs btn-secondary flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Installment
                      </button>
                    </div>
                    {installmentRows.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">
                        Add installments to schedule future payments.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {installmentRows.map((row, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-12 gap-2 items-center"
                          >
                            <div className="col-span-1 text-center text-xs text-gray-400">
                              #{row.installmentNumber}
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                placeholder="Amount"
                                value={row.amount}
                                onChange={(e) =>
                                  updateInstallmentRow(
                                    i,
                                    'amount',
                                    e.target.value,
                                  )
                                }
                                className="input-field text-sm"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="date"
                                value={row.dueDate}
                                onChange={(e) =>
                                  updateInstallmentRow(
                                    i,
                                    'dueDate',
                                    e.target.value,
                                  )
                                }
                                className="input-field text-sm"
                              />
                            </div>
                            <div className="col-span-4">
                              <input
                                type="text"
                                placeholder="Notes"
                                value={row.notes}
                                onChange={(e) =>
                                  updateInstallmentRow(
                                    i,
                                    'notes',
                                    e.target.value,
                                  )
                                }
                                className="input-field text-sm"
                              />
                            </div>
                            <div className="col-span-1">
                              <button
                                type="button"
                                onClick={() => removeInstallmentRow(i)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Form actions */}
                <div className="flex gap-3 pt-2 border-t">
                  <button
                    onClick={() => setShowDealForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDeal}
                    disabled={savingDeal}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {savingDeal
                      ? 'Saving...'
                      : editingDeal
                        ? 'Update Deal'
                        : 'Create Deal'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Notes ── */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
            {editing ? (
              <textarea
                value={editData.notes}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                className="input-field"
                rows={6}
                placeholder="Conversation history, preferences..."
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {customer.notes || 'No notes yet'}
              </p>
            )}
          </div>

          {/* ── Test Drives ── */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Test Drives ({customer.testDrives?.length || 0})
            </h3>
            {customer.testDrives && customer.testDrives.length > 0 ? (
              <div className="space-y-3">
                {customer.testDrives.map((td) => (
                  <div
                    key={td.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Car className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">
                        {td.car?.make} {td.car?.model} {td.car?.year}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(td.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No test drives yet</p>
            )}
          </div>
        </div>

        {/* ════════ RIGHT COLUMN ════════ */}
        <div className="space-y-6">
          {/* Lead info */}
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Lead Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="font-medium">
                  {leadSourceLabels[customer.leadSource]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <StatusBadge
                  status={customer.status}
                  colorMap={customerStatusColors}
                  labelMap={customerStatusLabels}
                />
              </div>
              {customer.followUpDate && (
                <div>
                  <p className="text-xs text-gray-500">Follow-up Date</p>
                  <p className="font-medium">
                    {formatDate(customer.followUpDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Deal quick summary */}
          {deal && (
            <div className="card p-4 border-blue-200 bg-blue-50">
              <h3 className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">
                Deal Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Car</span>
                  <span className="font-medium text-blue-900 text-right">
                    {deal.car.year} {deal.car.make} {deal.car.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Agreed</span>
                  <span className="font-bold text-blue-900">
                    {formatCurrency(deal.agreedPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">
                    Paid ({deal.payments.length}×)
                  </span>
                  <span className="font-medium text-green-700">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-600 font-medium">Balance</span>
                  <span
                    className={`font-bold ${remainingBalance <= 0 ? 'text-green-700' : 'text-orange-700'}`}
                  >
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
                {deal.handler && (
                  <div className="flex justify-between pt-1 border-t border-blue-200">
                    <span className="text-blue-600">Salesperson</span>
                    <span className="font-medium text-blue-900">
                      {deal.handler.name}
                    </span>
                  </div>
                )}
                <div className="pt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${PAYMENT_STATUS_COLORS[deal.paymentStatus]}`}
                  >
                    {PAYMENT_STATUS_LABELS[deal.paymentStatus]}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interested cars */}
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Interested Cars ({customer.interestedCars?.length || 0})
            </h3>
            {customer.interestedCars && customer.interestedCars.length > 0 ? (
              <div className="space-y-2">
                {customer.interestedCars.map((cc) => (
                  <Link
                    key={cc.id}
                    href={`/inventory/${cc.car.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <p className="font-medium text-sm">
                      {cc.car.make} {cc.car.model} {cc.car.year}
                    </p>
                    <p className="text-xs text-blue-600">
                      {formatCurrency(cc.car.targetPrice)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No interested cars</p>
            )}
          </div>

          {/* Purchases */}
          {customer.sales && customer.sales.length > 0 && (
            <div className="card p-6 bg-green-50 border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-3">
                Purchases
              </h3>
              {customer.sales.map((sale) => (
                <div key={sale.id} className="p-3 bg-white rounded-lg mb-2">
                  <p className="font-medium text-sm">
                    {sale.car.make} {sale.car.model} {sale.car.year}
                  </p>
                  <p className="text-xs text-green-700">
                    {formatCurrency(sale.salePrice)} ·{' '}
                    {formatDate(sale.saleDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This cannot be undone."
        confirmText="Delete"
      />

      <ConfirmDialog
        isOpen={deleteDealConfirm}
        onClose={() => setDeleteDealConfirm(false)}
        onConfirm={handleDeleteDeal}
        title="Remove Deal"
        message="This will delete the deal and all payment records. Are you sure?"
        confirmText="Delete Deal"
      />

      <ConfirmDialog
        isOpen={!!deletePaymentId}
        onClose={() => setDeletePaymentId(null)}
        onConfirm={() =>
          deletePaymentId && handleDeletePayment(deletePaymentId)
        }
        title="Remove Payment"
        message="Remove this payment entry? The deal balance will be recalculated."
        confirmText="Remove"
      />
    </div>
  );
}
