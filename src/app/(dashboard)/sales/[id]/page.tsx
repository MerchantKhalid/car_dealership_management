'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { handleClientError } from '@/lib/error-handler';
import LoadingSpinner from '@/components/ui/loading-spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'FINANCING' | 'PAYMENT_PLAN';
type PaymentStatus = 'PENDING' | 'DEPOSIT_PAID' | 'PAID_IN_FULL';
type DeliveryStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED';
type RegistrationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NOT_REQUIRED';

interface SalePayment {
  id: string;
  saleId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
}

interface SaleDetail {
  id: string;
  salePrice: number;
  saleDate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  contractUrl?: string;
  profit?: number;
  commission?: number;
  dueDate?: string;
  cnic?: string;
  dealNotes?: string;
  deliveryStatus: DeliveryStatus;
  registrationStatus: RegistrationStatus;
  payments: SalePayment[];
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    vin: string;
    licensePlate?: string;
    mileage: number;
    mainPhoto?: string;
    purchasePrice: number;
    expenses: { amount: number }[];
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  seller?: { id: string; name: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  FINANCING: 'Financing',
  PAYMENT_PLAN: 'Payment Plan',
};

const DELIVERY_OPTIONS: { value: DeliveryStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const REGISTRATION_OPTIONS: { value: RegistrationStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'NOT_REQUIRED', label: 'Not Required' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDueSoonStatus(dueDate?: string, paymentStatus?: PaymentStatus) {
  if (!dueDate || paymentStatus === 'PAID_IN_FULL') return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0)
    return {
      type: 'overdue',
      label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`,
    };
  if (diffDays === 0) return { type: 'today', label: 'Payment due today' };
  if (diffDays <= 7)
    return {
      type: 'soon',
      label: `Payment due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
    };
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPaymentTimelineColor(payment: SalePayment) {
  return 'bg-emerald-500';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatCurrency(paid)} paid</span>
        <span>{formatCurrency(Math.max(0, total - paid))} remaining</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-right text-gray-400">{pct.toFixed(0)}% paid</p>
    </div>
  );
}

function DueSoonBanner({
  dueDate,
  paymentStatus,
}: {
  dueDate?: string;
  paymentStatus: PaymentStatus;
}) {
  const info = getDueSoonStatus(dueDate, paymentStatus);
  if (!info) return null;
  const styles = {
    overdue: 'bg-rose-50 border-rose-200 text-rose-700',
    today: 'bg-amber-50 border-amber-200 text-amber-700',
    soon: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  }[info.type];
  return (
    <div
      className={`flex items-center gap-2.5 border rounded-lg px-4 py-3 text-sm font-medium ${styles}`}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{info.label}</span>
      {dueDate && (
        <span className="ml-auto font-normal opacity-70">
          Due {formatDate(dueDate)}
        </span>
      )}
    </div>
  );
}

function InlineField({
  label,
  value,
  onSave,
  type = 'text',
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: 'text' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    onSave(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        {type === 'select' && options ? (
          <select
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            autoFocus
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none resize-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <input
            type={type}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            placeholder={placeholder}
            autoFocus
          />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className="w-full text-left group space-y-0.5"
    >
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p
        className={`text-sm py-1.5 px-2 -mx-2 rounded-md group-hover:bg-gray-50 transition-colors ${value ? 'text-gray-800' : 'text-gray-400 italic'}`}
      >
        {type === 'select' && options
          ? (options.find((o) => o.value === value)?.label ?? value)
          : type === 'date' && value
            ? formatDate(value)
            : value || placeholder || 'Click to edit…'}
      </p>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'payments' | 'customer' | 'documents';

export default function SaleDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('payments');

  // New-payment form
  const [paymentDate, setPaymentDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSale = useCallback(async () => {
    try {
      const res = await fetch(`/api/sales/${params.id}`);
      if (!res.ok) throw new Error('Sale not found');
      const data = await res.json();
      setSale(data);
    } catch (err) {
      toast.error(handleClientError(err, 'fetchSale'));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchSale();
  }, [fetchSale]);

  // ── Patch sale field ───────────────────────────────────────────────────────
  async function patchSale(updates: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/sales/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to save');
      const updated = await res.json();
      setSale(updated);
      toast.success('Saved');
    } catch (err) {
      toast.error(handleClientError(err, 'patchSale'));
    }
  }

  // ── Add payment ────────────────────────────────────────────────────────────
  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      toast.error('Enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sales/${params.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: paymentDate,
          amount: parseFloat(paymentAmount),
          method: paymentMethod,
          reference: paymentRef || undefined,
          notes: paymentNotes || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed');
      }
      toast.success('Payment recorded');
      setPaymentAmount('');
      setPaymentRef('');
      setPaymentNotes('');
      fetchSale();
    } catch (err) {
      toast.error(handleClientError(err, 'addPayment'));
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete payment ─────────────────────────────────────────────────────────
  async function handleDeletePayment(paymentId: string) {
    if (!confirm('Delete this payment entry?')) return;
    setDeletingId(paymentId);
    try {
      const res = await fetch(`/api/sales/${params.id}/payments/${paymentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Payment removed');
      fetchSale();
    } catch (err) {
      toast.error(handleClientError(err, 'deletePayment'));
    } finally {
      setDeletingId(null);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner className="h-96" />;
  if (!sale)
    return (
      <div className="p-8 text-center text-gray-500">
        Sale not found.{' '}
        <Link href="/sales" className="text-indigo-600 underline">
          Back to sales
        </Link>
      </div>
    );

  const totalPaid = sale.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, sale.salePrice - totalPaid);

  const statusColors: Record<PaymentStatus, string> = {
    PENDING: 'bg-gray-100 text-gray-600',
    DEPOSIT_PAID: 'bg-amber-100 text-amber-700',
    PAID_IN_FULL: 'bg-emerald-100 text-emerald-700',
  };
  const statusLabels: Record<PaymentStatus, string> = {
    PENDING: 'Pending',
    DEPOSIT_PAID: 'Deposit Paid',
    PAID_IN_FULL: 'Paid in Full',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16">
      {/* ── Back + header ── */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.back()}
          className="mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {sale.car.year} {sale.car.make} {sale.car.model}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sale.customer.name} &mdash; sold {formatDate(sale.saleDate)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColors[sale.paymentStatus]}`}
        >
          {statusLabels[sale.paymentStatus]}
        </span>
      </div>

      {/* ── Due-soon alert ── */}
      <DueSoonBanner
        dueDate={sale.dueDate}
        paymentStatus={sale.paymentStatus}
      />

      {/* ── Summary bar ── */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div className="pr-4">
            <p className="text-xs text-gray-500 mb-0.5">Sale Price</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(sale.salePrice)}
            </p>
          </div>
          <div className="px-4">
            <p className="text-xs text-gray-500 mb-0.5">Total Paid</p>
            <p className="font-semibold text-emerald-600">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="pl-4">
            <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
            <p
              className={`font-semibold ${remaining > 0 ? 'text-rose-500' : 'text-gray-400'}`}
            >
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
        <ProgressBar paid={totalPaid} total={sale.salePrice} />
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0">
          {(
            [
              {
                id: 'payments',
                label: 'Purchase & Payments',
                icon: CreditCard,
              },
              { id: 'customer', label: 'Customer Info', icon: User },
              { id: 'documents', label: 'Documents & Notes', icon: FileText },
            ] as { id: Tab; label: string; icon: React.ElementType }[]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — Purchase & Payments
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Sale overview */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Payment Method
              </span>
              <span className="text-sm text-gray-600">
                {METHOD_LABELS[sale.paymentMethod]}
              </span>
            </div>
            {sale.dueDate && (
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Due Date
                </span>
                <span className="text-sm text-gray-600">
                  {formatDate(sale.dueDate)}
                </span>
              </div>
            )}
          </div>

          {/* Payment timeline */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Payment Timeline
            </h2>
            {sale.payments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                <Clock className="mx-auto h-7 w-7 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">
                  No payments recorded yet
                </p>
              </div>
            ) : (
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-[18px] top-5 bottom-5 w-px bg-gray-200" />
                {sale.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="relative flex gap-4 pb-4 last:pb-0"
                  >
                    {/* Dot */}
                    <div
                      className={`relative z-10 mt-1 h-[14px] w-[14px] shrink-0 rounded-full border-2 border-white ${getPaymentTimelineColor(payment)} shadow-sm`}
                    />
                    {/* Card */}
                    <div className="flex-1 rounded-xl border border-gray-100 bg-white shadow-sm px-4 py-3 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </span>
                            <span className="text-xs rounded-full bg-gray-100 text-gray-600 px-2 py-0.5">
                              {METHOD_LABELS[payment.method]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(payment.date)}
                          </p>
                          {payment.reference && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ref: {payment.reference}
                            </p>
                          )}
                          {payment.notes && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          disabled={deletingId === payment.id}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-all disabled:opacity-50"
                          title="Delete payment"
                        >
                          {deletingId === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add payment form */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-indigo-800 flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Record a new payment
            </h3>
            <form onSubmit={handleAddPayment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Method *
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        paymentMethod === m
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {METHOD_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Reference / Cheque #
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Note
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. received by Bilal"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Save Payment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Customer Info
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'customer' && (
        <div className="space-y-5">
          {/* Customer card */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Customer Details
              </h2>
              <Link
                href={`/customers/${sale.customer.id}`}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View Profile <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <dl className="space-y-3">
              {[
                { label: 'Name', value: sale.customer.name },
                { label: 'Phone', value: sale.customer.phone },
                { label: 'Email', value: sale.customer.email },
                { label: 'Address', value: sale.customer.address },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <dt className="w-24 shrink-0 text-xs font-medium text-gray-500 pt-0.5">
                    {label}
                  </dt>
                  <dd className="text-sm text-gray-800">
                    {value || <span className="text-gray-400 italic">—</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Reference fields */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">
              Deal Reference
            </h2>
            <InlineField
              label="CNIC / ID Number"
              value={sale.cnic ?? ''}
              onSave={(v) => patchSale({ cnic: v })}
              placeholder="e.g. 42201-XXXXXXX-X"
            />
            <InlineField
              label="VIN / Chassis Number"
              value={sale.car.vin}
              onSave={() => {}} // VIN is on car, read-only here
              placeholder="—"
            />
            <InlineField
              label="License Plate"
              value={sale.car.licensePlate ?? ''}
              onSave={() => {}}
              placeholder="—"
            />
          </div>

          {/* Status fields */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Status</h2>
            <InlineField
              label="Delivery Status"
              value={sale.deliveryStatus}
              onSave={(v) => patchSale({ deliveryStatus: v })}
              type="select"
              options={DELIVERY_OPTIONS}
            />
            <InlineField
              label="Registration Status"
              value={sale.registrationStatus}
              onSave={(v) => patchSale({ registrationStatus: v })}
              type="select"
              options={REGISTRATION_OPTIONS}
            />
            <InlineField
              label="Payment Due Date"
              value={
                sale.dueDate
                  ? new Date(sale.dueDate).toISOString().slice(0, 10)
                  : ''
              }
              onSave={(v) => patchSale({ dueDate: v || null })}
              type="date"
              placeholder="No due date set"
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — Documents & Notes
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'documents' && (
        <div className="space-y-5">
          {/* Contract */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Contract</h2>
            <InlineField
              label="Contract URL"
              value={sale.contractUrl ?? ''}
              onSave={(v) => patchSale({ contractUrl: v })}
              placeholder="https://…"
            />
            {sale.contractUrl && (
              <a
                href={sale.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open Contract
              </a>
            )}
          </div>

          {/* Deal notes */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Deal Notes</h2>
            <p className="text-xs text-gray-400">
              Internal notes visible to your team only.
            </p>
            <InlineField
              label="Notes"
              value={sale.dealNotes ?? ''}
              onSave={(v) => patchSale({ dealNotes: v })}
              type="textarea"
              placeholder="Add any internal notes about this deal…"
            />
          </div>

          {/* Quick reference */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Quick Reference
            </h2>
            <dl className="space-y-2.5 text-sm">
              {[
                {
                  label: 'Car',
                  value: `${sale.car.year} ${sale.car.make} ${sale.car.model} (${sale.car.color})`,
                },
                { label: 'VIN', value: sale.car.vin },
                { label: 'Plate', value: sale.car.licensePlate || '—' },
                { label: 'CNIC', value: sale.cnic || '—' },
                { label: 'Seller', value: sale.seller?.name || '—' },
                { label: 'Sale Date', value: formatDate(sale.saleDate) },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <dt className="w-20 shrink-0 text-xs font-medium text-gray-500">
                    {label}
                  </dt>
                  <dd className="text-gray-800 break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
