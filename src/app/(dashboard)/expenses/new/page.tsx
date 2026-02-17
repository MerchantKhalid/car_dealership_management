'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { expenseSchema, ExpenseInput } from '@/lib/validations';
import { handleClientError } from '@/lib/error-handler';
import { CarWithRelations } from '@/types';

export default function NewExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCarId = searchParams.get('carId');

  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<CarWithRelations[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      carId: preselectedCarId || '',
      date: new Date().toISOString().split('T')[0],
      type: 'REPAIR',
    },
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/cars');
      const data = await res.json();
      setCars(data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const onSubmit = async (data: ExpenseInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success('Expense added!');
      if (preselectedCarId) {
        router.push(`/inventory/${preselectedCarId}`);
      } else {
        router.push('/expenses');
      }
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
          href="/expenses"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Expenses
        </Link>
        <h1 className="page-title">Add Expense</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <div className="space-y-4">
            <div>
              <label className="label">Car *</label>
              <select {...register('carId')} className="input-field">
                <option value="">Select a car...</option>
                {cars
                  .filter((c) => c.status !== 'SOLD')
                  .map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.make} {car.model} {car.year}
                      {car.licensePlate ? ` (${car.licensePlate})` : ''}
                    </option>
                  ))}
              </select>
              {errors.carId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.carId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Expense Type *</label>
                <select {...register('type')} className="input-field">
                  <option value="REPAIR">Repair</option>
                  <option value="DETAILING">Detailing</option>
                  <option value="REGISTRATION">Registration</option>
                  <option value="INSPECTION">Inspection</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Amount (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount')}
                  className="input-field"
                  placeholder="450.00"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                {...register('date')}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                {...register('description')}
                className="input-field"
                rows={3}
                placeholder="Describe the work done..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Vendor</label>
              <input
                {...register('vendor')}
                className="input-field"
                placeholder="Workshop / Service provider name"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/expenses" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
