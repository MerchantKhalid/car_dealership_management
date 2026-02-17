'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Wrench } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { formatCurrency, formatDate, expenseTypeLabels } from '@/lib/utils';
import { ExpenseWithRelations } from '@/types';
import { handleClientError } from '@/lib/error-handler';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchExpenses = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      const message = handleClientError(error, 'fetchExpenses');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: {formatCurrency(totalExpenses)}
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="label">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Types</option>
              {Object.entries(expenseTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
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
        </div>
      </div>

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No expenses found"
          description="Add an expense or adjust your filters."
          action={
            <Link href="/expenses/new" className="btn-primary">
              Add Expense
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
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/inventory/${expense.car.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expense.car.make} {expense.car.model}{' '}
                        {expense.car.year}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {expenseTypeLabels[expense.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {expense.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {expense.vendor || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm font-semibold">
                    Total
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
