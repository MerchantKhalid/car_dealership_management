'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Car,
  Calendar,
  MapPin,
  Gauge,
  Tag,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import StatusBadge from '@/components/ui/status-badge';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import {
  formatCurrency,
  formatDate,
  daysInInventory,
  carStatusLabels,
  expenseTypeLabels,
} from '@/lib/utils';
import { CarWithRelations, CarStatus, Expense } from '@/types';

const carStatusColors: Record<string, string> = {
  AVAILABLE: 'green',
  SOLD: 'blue',
  RESERVED: 'yellow',
  MAINTENANCE: 'orange',
  IN_REPAIR: 'orange',
  TEST_DRIVE: 'purple',
};

const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return '';
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch {
    return '';
  }
};

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [car, setCar] = useState<CarWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    fetchCar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchCar = async () => {
    try {
      const res = await fetch(`/api/cars/${params.id}`);
      if (!res.ok) throw new Error('Car not found');
      const data = await res.json();
      setCar(data);
    } catch (error) {
      console.error('Error fetching car:', error);
      toast.error('Failed to load car details');
      router.push('/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/cars/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Car deleted');
        router.push('/inventory');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    }
  };

  const handleStatusChange = async (newStatus: CarStatus) => {
    if (!car) return;

    try {
      const res = await fetch(`/api/cars/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...car,
          status: newStatus,
          purchaseDate: formatDateForInput(car.purchaseDate),
        }),
      });

      if (res.ok) {
        toast.success('Status updated');
        await fetchCar();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;
  if (!car) return null;

  const allPhotos =
    car.photos && car.photos.length > 0
      ? car.photos.map((p) => p.url)
      : car.mainPhoto
        ? [car.mainPhoto]
        : [];

  const days = daysInInventory(car.purchaseDate);
  const potentialProfit =
    car.targetPrice - car.purchasePrice - (car.totalExpenses ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/inventory/${car.id}/edit`}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          {car.status !== 'SOLD' && (
            <Link
              href={`/sales/new?carId=${car.id}`}
              className="btn-primary flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Mark as Sold
            </Link>
          )}
          <button
            onClick={() => setDeleteConfirm(true)}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photos & Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <div className="card overflow-hidden">
            {allPhotos.length > 0 ? (
              <>
                <div className="relative aspect-[16/9] bg-gray-100">
                  <Image
                    src={allPhotos[activePhoto]}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActivePhoto((p) =>
                            p > 0 ? p - 1 : allPhotos.length - 1,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          setActivePhoto((p) =>
                            p < allPhotos.length - 1 ? p + 1 : 0,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
                {allPhotos.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {allPhotos.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhoto(i)}
                        className={`relative w-16 h-12 rounded overflow-hidden flex-shrink-0 border-2 ${
                          activePhoto === i
                            ? 'border-blue-600'
                            : 'border-transparent'
                        }`}
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                <Car className="h-20 w-20 text-gray-300" />
              </div>
            )}
          </div>

          {/* Car Details */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {car.make} {car.model}
                </h1>
                <p className="text-gray-500">
                  {car.year} · {car.color}
                </p>
              </div>
              <StatusBadge
                status={car.status}
                colorMap={carStatusColors}
                labelMap={carStatusLabels}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Mileage</p>
                  <p className="font-medium">
                    {car.mileage.toLocaleString('pt-PT')} km
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">VIN</p>
                  <p className="font-medium text-sm">{car.vin}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">License Plate</p>
                  <p className="font-medium">{car.licensePlate || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Purchase Date</p>
                  <p className="font-medium">{formatDate(car.purchaseDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Transmission</p>
                  <p className="font-medium">{car.transmission || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Days in Inventory</p>
                  <p
                    className={`font-medium ${days > 60 ? 'text-red-600' : ''}`}
                  >
                    {days} days
                  </p>
                </div>
              </div>
            </div>

            {car.notes && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Notes
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {car.notes}
                </p>
              </div>
            )}
          </div>

          {/* Status Quick Actions */}
          {car.status !== 'SOLD' && (
            <div className="card p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Quick Status Change
              </h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(carStatusLabels) as CarStatus[])
                  .filter((status) => status !== 'SOLD')
                  .map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={car.status === status}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        car.status === status
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {carStatusLabels[status]}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Expenses */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Expenses ({car.expenses?.length || 0})
              </h3>
              <Link
                href={`/expenses/new?carId=${car.id}`}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Expense
              </Link>
            </div>
            {car.expenses && car.expenses.length > 0 ? (
              <div className="divide-y">
                {car.expenses.map((expense: Expense) => (
                  <div
                    key={expense.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {expense.description || expenseTypeLabels[expense.type]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {expenseTypeLabels[expense.type]} ·{' '}
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <span className="font-medium text-red-600">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
                <div className="pt-3 flex items-center justify-between font-semibold">
                  <span>Total Expenses</span>
                  <span className="text-red-600">
                    {formatCurrency(car.totalExpenses || 0)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No expenses recorded</p>
            )}
          </div>
        </div>

        {/* Right Column - Financial & Related */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Purchase Price</span>
                <span className="font-medium">
                  {formatCurrency(car.purchasePrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Expenses</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(car.totalExpenses || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Investment</span>
                <span className="font-medium">
                  {formatCurrency(car.purchasePrice + (car.totalExpenses || 0))}
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Target Price</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(car.targetPrice)}
                </span>
              </div>
              {car.minimumPrice && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Minimum Price</span>
                  <span className="font-medium text-gray-600">
                    {formatCurrency(car.minimumPrice)}
                  </span>
                </div>
              )}
              <hr />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Potential Profit
                </span>
                <span
                  className={`font-bold ${
                    potentialProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(potentialProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Sale Info */}
          {car.sale && (
            <div className="card p-6 bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Sale Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Sale Price</span>
                  <span className="font-bold text-green-800">
                    {formatCurrency(car.sale.salePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Date</span>
                  <span className="text-green-800">
                    {formatDate(car.sale.saleDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Customer</span>
                  <Link
                    href={`/customers/${car.sale.customer.id}`}
                    className="text-green-800 hover:underline"
                  >
                    {car.sale.customer.name}
                  </Link>
                </div>
                {car.sale.profit !== null && car.sale.profit !== undefined && (
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="text-sm font-medium text-green-700">
                      Profit
                    </span>
                    <span
                      className={`font-bold ${
                        car.sale.profit >= 0 ? 'text-green-800' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(car.sale.profit)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Car"
        message="Are you sure you want to delete this car? This action cannot be undone and will also delete all associated expenses and photos."
        confirmText="Delete"
      />
    </div>
  );
}
