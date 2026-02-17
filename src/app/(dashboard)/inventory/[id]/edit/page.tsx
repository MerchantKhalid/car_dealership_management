'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { getErrorMessage } from '@/lib/error-handler';
import { carFormSchema, CarFormValues } from '@/lib/validations';

export default function EditCarPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
  });

  useEffect(() => {
    fetchCar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchCar = async () => {
    try {
      const res = await fetch(`/api/cars/${params.id}`);
      const car = await res.json();
      reset({
        ...car,
        purchaseDate: new Date(car.purchaseDate).toISOString().split('T')[0],
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push('/inventory');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CarFormValues) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cars/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success('Car updated successfully!');
      router.push(`/inventory/${params.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/inventory/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Car Details
        </Link>
        <h1 className="page-title">Edit Car</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Make *</label>
              <input {...register('make')} className="input-field" />
              {errors.make && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.make.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">Model *</label>
              <input {...register('model')} className="input-field" />
              {errors.model && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.model.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">Year *</label>
              <input
                type="number"
                {...register('year', { valueAsNumber: true })} // ✅ ADD THIS
                className="input-field"
              />
              {errors.year && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.year.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">Color *</label>
              <input {...register('color')} className="input-field" />
            </div>
            <div>
              <label className="label">Mileage (km) *</label>
              <input
                type="number"
                {...register('mileage', { valueAsNumber: true })} // ✅ ADD THIS
                className="input-field"
              />
            </div>
            <div>
              <label className="label">VIN *</label>
              <input {...register('vin')} className="input-field" />
            </div>
            <div>
              <label className="label">License Plate</label>
              <input {...register('licensePlate')} className="input-field" />
            </div>
            <div>
              <label className="label">Location</label>
              <input {...register('location')} className="input-field" />
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input-field">
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="IN_REPAIR">In Repair</option>
                <option value="TEST_DRIVE">Test Drive</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Purchase Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Purchase Price (€) *</label>
              <input
                type="number"
                step="0.01"
                {...register('purchasePrice', { valueAsNumber: true })} // ✅ ADD THIS
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Purchase Date *</label>
              <input
                type="date"
                {...register('purchaseDate')}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Bought From</label>
              <input {...register('boughtFrom')} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Selling Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Target Price (€) *</label>
              <input
                type="number"
                step="0.01"
                {...register('targetPrice', { valueAsNumber: true })} // ✅ ADD THIS
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Minimum Price (€)</label>
              <input
                type="number"
                step="0.01"
                {...register('minimumPrice', { valueAsNumber: true })} // ✅ ADD THIS
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Condition & Notes
          </h2>
          <textarea
            {...register('conditionNotes')}
            className="input-field"
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link href={`/inventory/${params.id}`} className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
