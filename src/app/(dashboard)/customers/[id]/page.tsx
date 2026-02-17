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

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
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
  const [saving, setSaving] = useState(false);

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
      const message = handleClientError(error, 'fetchCustomer');
      toast.error(message || 'Failed to load customer');
      router.push('/customers');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

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
        const error = await res.json();
        toast.error(error.error);
      }
    } catch (error) {
      const message = handleClientError(error, 'handleSave');
      toast.error(message || 'Failed to update');
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
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (error) {
      const message = handleClientError(error, 'handleDelete');
      toast.error(message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;
  if (!customer) return null;

  return (
    <div className="space-y-6">
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
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
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
                    {Object.entries(customerStatusLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
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
                    {Object.entries(leadSourceLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
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
                      setEditData({
                        ...editData,
                        followUpDate: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
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

          {/* Test Drives */}
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Lead Info */}
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

          {/* Interested Cars */}
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

          {/* Sales */}
          {customer.sales && customer.sales.length > 0 && (
            <div className="card p-6 bg-green-50 border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-3">
                Purchases
              </h3>
              {customer.sales.map((sale) => (
                <div key={sale.id} className="p-3 bg-white rounded-lg">
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

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
