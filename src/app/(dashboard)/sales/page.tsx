'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import StatusBadge from '@/components/ui/status-badge';
import StatCard from '@/components/ui/stat-card';
import EmptyState from '@/components/ui/empty-state';
import {
  formatCurrency,
  formatDate,
  paymentStatusColors,
  paymentStatusLabels,
  paymentMethodLabels,
} from '@/lib/utils';
import { SaleWithRelations } from '@/types';
import { handleClientError } from '@/lib/error-handler';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const [sales, setSales] = useState<SaleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  const fetchSales = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (paymentStatusFilter) params.set('paymentStatus', paymentStatusFilter);

      const res = await fetch(`/api/sales?${params.toString()}`);
      const data = await res.json();
      setSales(data);
    } catch (error) {
      const message = handleClientError(error, 'fetchSales');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, paymentStatusFilter]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.salePrice, 0);
  const totalProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Sales</h1>
        <Link href="/sales/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Record Sale
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Sales"
          value={sales.length}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          icon={TrendingUp}
          trendUp={totalProfit > 0}
        />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="label">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All</option>
              {Object.entries(paymentStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      {sales.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No sales found"
          description="Record your first sale or adjust your filters."
          action={
            <Link href="/sales/new" className="btn-primary">
              Record Sale
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Car
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Sale Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Profit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventory/${sale.car.id}`}
                        className="font-medium text-sm text-blue-600 hover:text-blue-800"
                      >
                        {sale.car.make} {sale.car.model} {sale.car.year}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/customers/${sale.customer.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {sale.customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(sale.salePrice)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`font-medium ${
                          (sale.profit || 0) >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(sale.profit || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {paymentMethodLabels[sale.paymentMethod]}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={sale.paymentStatus}
                        colorMap={paymentStatusColors}
                        labelMap={paymentStatusLabels}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t font-semibold">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm">
                    Totals
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {formatCurrency(totalProfit)}
                    </span>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
