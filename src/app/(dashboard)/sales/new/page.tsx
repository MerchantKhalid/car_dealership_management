'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { saleSchema, SaleInput } from '@/lib/validations';
import { formatCurrency } from '@/lib/utils';
import { CarWithRelations, Customer } from '@/types';
import { handleClientError } from '@/lib/error-handler';

export default function NewSalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCarId = searchParams.get('carId');

  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<CarWithRelations[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarWithRelations | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      carId: preselectedCarId || '',
      saleDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: 'PENDING',
    },
  });

  const watchSalePrice = watch('salePrice');
  const watchCarId = watch('carId');

  const fetchData = useCallback(async () => {
    try {
      const [carsRes, customersRes] = await Promise.all([
        fetch('/api/cars?status=AVAILABLE'),
        fetch('/api/customers'),
      ]);
      const carsData = await carsRes.json();
      const customersData = await customersRes.json();
      setCars(carsData.cars || []);
      setCustomers(customersData);
    } catch (error) {
      const message = handleClientError(error, 'fetchData');
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (watchCarId) {
      const car = cars.find((c) => c.id === watchCarId);
      setSelectedCar(car || null);
    }
  }, [watchCarId, cars]);

  const onSubmit = async (data: SaleInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success('Sale recorded successfully!');
      router.push('/sales');
    } catch (error) {
      const message = handleClientError(error, 'onSubmit');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = selectedCar?.totalExpenses || 0;
  const purchasePrice = selectedCar?.purchasePrice || 0;
  const salePriceNum = typeof watchSalePrice === 'number' ? watchSalePrice : 0;
  const profit = salePriceNum
    ? salePriceNum - purchasePrice - totalExpenses
    : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/sales"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales
        </Link>
        <h1 className="page-title">Record New Sale</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sale Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Car *</label>
              <select {...register('carId')} className="input-field">
                <option value="">Select a car...</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model} {car.year} -{' '}
                    {formatCurrency(car.targetPrice)}
                  </option>
                ))}
              </select>
              {errors.carId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.carId.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Customer *</label>
              <select {...register('customerId')} className="input-field">
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Sale Price (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('salePrice', { valueAsNumber: true })}
                  className="input-field"
                  placeholder="11200"
                />
                {errors.salePrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.salePrice.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Sale Date *</label>
                <input
                  type="date"
                  {...register('saleDate')}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Payment Method *</label>
                <select {...register('paymentMethod')} className="input-field">
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="FINANCING">Financing</option>
                  <option value="PAYMENT_PLAN">Payment Plan</option>
                </select>
              </div>
              <div>
                <label className="label">Payment Status</label>
                <select {...register('paymentStatus')} className="input-field">
                  <option value="PENDING">Pending</option>
                  <option value="DEPOSIT_PAID">Deposit Paid</option>
                  <option value="PAID_IN_FULL">Paid in Full</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Commission (€)</label>
              <input
                type="number"
                step="0.01"
                {...register('commission', { valueAsNumber: true })}
                className="input-field"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Profit Preview */}
        {selectedCar && salePriceNum > 0 && (
          <div
            className={`card p-6 ${
              profit >= 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-3">
              Profit Calculation
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sale Price</span>
                <span className="font-medium">
                  {formatCurrency(salePriceNum)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Purchase Price</span>
                <span className="font-medium">
                  - {formatCurrency(purchasePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses</span>
                <span className="font-medium">
                  - {formatCurrency(totalExpenses)}
                </span>
              </div>
              <hr
                className={profit >= 0 ? 'border-green-300' : 'border-red-300'}
              />
              <div className="flex justify-between text-lg font-bold">
                <span>Profit</span>
                <span
                  className={profit >= 0 ? 'text-green-700' : 'text-red-700'}
                >
                  {formatCurrency(profit)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/sales" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Recording...' : 'Record Sale'}
          </button>
        </div>
      </form>
    </div>
  );
}
