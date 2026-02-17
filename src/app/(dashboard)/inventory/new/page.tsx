'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { getErrorMessage } from '@/lib/error-handler';
import { carFormSchema, CarFormValues } from '@/lib/validations';

export default function NewCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      status: 'AVAILABLE',
      purchaseDate: new Date().toISOString().split('T')[0],
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setPhotos((prev) => [...prev, data.url]);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CarFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          mainPhoto: photos[0] || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create car');
      }

      const car = await res.json();

      // Upload photos
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          await fetch(`/api/cars/${car.id}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: photos[i],
              isMain: i === 0,
            }),
          });
        }
      }

      toast.success('Car added successfully!');
      router.push(`/inventory/${car.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
        <h1 className="page-title">Add New Car</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Make *</label>
              <input
                {...register('make')}
                className="input-field"
                placeholder="e.g. Volkswagen"
              />
              {errors.make && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.make.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Model *</label>
              <input
                {...register('model')}
                className="input-field"
                placeholder="e.g. Golf"
              />
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
                {...register('year', { valueAsNumber: true })}
                className="input-field"
                placeholder="2020"
              />
              {errors.year && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.year.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Color *</label>
              <input
                {...register('color')}
                className="input-field"
                placeholder="e.g. White"
              />
              {errors.color && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.color.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Mileage (km) *</label>
              <input
                type="number"
                {...register('mileage', { valueAsNumber: true })}
                className="input-field"
                placeholder="50000"
              />
              {errors.mileage && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.mileage.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">VIN *</label>
              <input
                {...register('vin')}
                className="input-field"
                placeholder="Vehicle ID Number"
              />
              {errors.vin && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.vin.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">License Plate</label>
              <input
                {...register('licensePlate')}
                className="input-field"
                placeholder="AA-00-AA"
              />
            </div>

            <div>
              <label className="label">Location</label>
              <input
                {...register('location')}
                className="input-field"
                placeholder="Lot / Warehouse"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input-field">
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="IN_REPAIR">In Repair</option>
                <option value="TEST_DRIVE">Test Drive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Purchase Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Purchase Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Purchase Price (€) *</label>
              <input
                type="number"
                step="0.01"
                {...register('purchasePrice', { valueAsNumber: true })}
                className="input-field"
                placeholder="8500"
              />
              {errors.purchasePrice && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.purchasePrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Purchase Date *</label>
              <input
                type="date"
                {...register('purchaseDate')}
                className="input-field"
              />
              {errors.purchaseDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.purchaseDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Bought From</label>
              <input
                {...register('boughtFrom')}
                className="input-field"
                placeholder="Person or Dealer name"
              />
            </div>
          </div>
        </div>

        {/* Selling Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Selling Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Target Selling Price (€) *</label>
              <input
                type="number"
                step="0.01"
                {...register('targetPrice', { valueAsNumber: true })}
                className="input-field"
                placeholder="11500"
              />
              {errors.targetPrice && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.targetPrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Minimum Acceptable Price (€)</label>
              <input
                type="number"
                step="0.01"
                {...register('minimumPrice', { valueAsNumber: true })}
                className="input-field"
                placeholder="10500"
              />
            </div>
          </div>
        </div>

        {/* Condition Notes */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Condition & Notes
          </h2>
          <textarea
            {...register('conditionNotes')}
            className="input-field"
            rows={4}
            placeholder="Describe condition, damages, special features..."
          />
        </div>

        {/* Photos */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {photos.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden group"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {uploading ? 'Uploading...' : 'Click or drag photos here'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/inventory" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Add Car'}
          </button>
        </div>
      </form>
    </div>
  );
}
