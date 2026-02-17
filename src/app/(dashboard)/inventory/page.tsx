'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Grid3X3, List, Filter, Car, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import StatusBadge from '@/components/ui/status-badge';
import EmptyState from '@/components/ui/empty-state';
import { formatCurrency, daysInInventory, carStatusLabels } from '@/lib/utils';
import { CarType } from '@/types';

// interface CarType {
//   id: string;
//   make: string;
//   model: string;
//   year: number;
//   mileage: number;
//   targetPrice: number;
//   status: string;
//   purchaseDate: string;
//   mainPhoto?: string;
//   licensePlate?: string;
// }

export default function InventoryPage() {
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const fetchCars = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (makeFilter) params.set('make', makeFilter);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      setCars(data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, makeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const uniqueMakes = Array.from(new Set(cars.map((c) => c.make))).sort();

  const clearFilters = () => {
    setStatusFilter('');
    setMakeFilter('');
    setSearch('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const carStatusColors: Record<string, string> = {
    AVAILABLE: 'green',
    SOLD: 'blue',
    RESERVED: 'yellow',
    MAINTENANCE: 'orange',
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">
            {cars.length} car(s) total
          </p>
        </div>
        <Link
          href="/inventory/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Car
        </Link>
      </div>

      {/* Search & Controls */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by make, model, VIN, or license plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${
                showFilters ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-3 items-end">
            <div>
              <label className="label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                {Object.entries(carStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Make</label>
              <select
                value={makeFilter}
                onChange={(e) => setMakeFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Makes</option>
                {uniqueMakes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                }}
                className="input-field"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="targetPrice-asc">Price: Low to High</option>
                <option value="targetPrice-desc">Price: High to Low</option>
                <option value="mileage-asc">Mileage: Low to High</option>
                <option value="purchaseDate-asc">Longest in Stock</option>
              </select>
            </div>
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Car List */}
      {cars.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No cars found"
          description="Add your first car to the inventory or adjust your filters."
          action={
            <Link href="/inventory/new" className="btn-primary">
              Add New Car
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cars.map((car) => (
            <Link key={car.id} href={`/inventory/${car.id}`}>
              <div className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                  {car.mainPhoto ? (
                    <Image
                      src={car.mainPhoto}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge
                      status={car.status}
                      colorMap={carStatusColors}
                      labelMap={carStatusLabels}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">
                    {car.make} {car.model}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {car.year} · {car.mileage.toLocaleString('pt-PT')} km
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(car.targetPrice)}
                    </p>
                    <span className="text-xs text-gray-400">
                      {daysInInventory(car.purchaseDate)} days
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Car
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Year
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Mileage
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Days in Stock
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    License Plate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventory/${car.id}`}
                        className="flex items-center gap-3 hover:text-blue-600"
                      >
                        <div className="w-12 h-9 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                          {car.mainPhoto ? (
                            <Image
                              src={car.mainPhoto}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium">
                          {car.make} {car.model}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {car.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {car.mileage.toLocaleString('pt-PT')} km
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(car.targetPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={car.status}
                        colorMap={carStatusColors}
                        labelMap={carStatusLabels}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span
                        className={
                          daysInInventory(car.purchaseDate) > 60
                            ? 'text-red-600 font-medium'
                            : ''
                        }
                      >
                        {daysInInventory(car.purchaseDate)} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {car.licensePlate || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
