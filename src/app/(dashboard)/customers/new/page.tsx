'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { customerSchema, CustomerInput } from '@/lib/validations';
import { handleClientError } from '@/lib/error-handler';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      status: 'NEW_LEAD',
      leadSource: 'WALK_IN',
    },
  });

  const onSubmit = async (data: CustomerInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create customer');
      }

      toast.success('Customer added successfully!');
      router.push('/customers');
    } catch (error) {
      const message = handleClientError(error, 'onSubmit');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Customers
        </Link>
        <h1 className="page-title">Add New Customer</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                {...register('name')}
                className="input-field"
                placeholder="João Silva"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Phone *</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="input-field"
                  placeholder="+351 912 345 678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="input-field"
                  placeholder="joao@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <input
                type="text"
                {...register('address')}
                className="input-field"
                placeholder="Rua Example, Lisboa"
              />
            </div>
          </div>
        </div>

        {/* Lead Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Lead Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Lead Source *</label>
                <select {...register('leadSource')} className="input-field">
                  <option value="WALK_IN">Walk In</option>
                  <option value="PHONE">Phone</option>
                  <option value="OLX">OLX</option>
                  <option value="STANDVIRTUAL">Stand Virtual</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.leadSource && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.leadSource.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="NEW_LEAD">New Lead</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="TEST_DRIVE_DONE">Test Drive Done</option>
                  <option value="NEGOTIATING">Negotiating</option>
                  <option value="SOLD">Sold</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Follow-up Date</label>
              <input
                type="date"
                {...register('followUpDate')}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                {...register('notes')}
                className="input-field"
                rows={4}
                placeholder="Customer preferences, budget, interested cars..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/customers" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding...' : 'Add Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
