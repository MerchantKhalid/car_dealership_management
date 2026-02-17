'use client';

import { useState } from 'react';
import { BarChart3, Download, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { handleClientError } from '@/lib/error-handler';
import toast from 'react-hot-toast';

type ReportType = 'sales' | 'inventory' | 'expenses' | 'profit';

type InventoryCarData = {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  purchasePrice?: number;
  targetPrice: number;
  purchaseDate: string;
};

interface SalesReportData {
  sales: Array<{
    id: string;
    date: string;
    car: string;
    customer: string;
    salePrice: number;
    expenses: number;
    profit: number;
    paymentMethod: string;
    paymentStatus: string;
  }>;
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    avgProfit: number;
  };
}

type ExpenseReportData = Array<{
  id: string;
  date: string;
  car: {
    make: string;
    model: string;
  };
  type: string;
  description: string;
  vendor?: string;
  amount: number;
}>;

type ReportData =
  | { type: 'sales'; data: SalesReportData }
  | { type: 'inventory'; data: InventoryCarData[] }
  | { type: 'expenses'; data: ExpenseReportData };

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      let url = '';
      let data: ReportData;

      switch (reportType) {
        case 'sales':
          url = `/api/reports/sales?${params.toString()}`;
          const salesRes = await fetch(url);
          const salesData = await salesRes.json();
          data = { type: 'sales', data: salesData };
          break;

        case 'inventory':
          url = `/api/cars?${params.toString()}`;
          const invRes = await fetch(url);
          const invData = await invRes.json();
          // Handle both wrapped and unwrapped responses
          const cars = invData.cars || invData;
          data = { type: 'inventory', data: Array.isArray(cars) ? cars : [] };
          break;

        case 'expenses':
          url = `/api/expenses?${params.toString()}`;
          const expRes = await fetch(url);
          const expData = await expRes.json();
          data = {
            type: 'expenses',
            data: Array.isArray(expData) ? expData : [],
          };
          break;

        case 'profit':
          url = `/api/reports/sales?${params.toString()}`;
          const profitRes = await fetch(url);
          const profitData = await profitRes.json();
          data = { type: 'sales', data: profitData };
          break;

        default:
          throw new Error('Invalid report type');
      }

      setReportData(data);
    } catch (error) {
      const message = handleClientError(error, 'generateReport');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let rows: string[][] = [];

    if (reportData.type === 'sales') {
      csvContent =
        'Date,Car,Customer,Sale Price,Expenses,Profit,Payment Method,Status\n';
      rows = reportData.data.sales.map((s) => [
        formatDate(s.date),
        s.car,
        s.customer,
        s.salePrice.toString(),
        s.expenses.toString(),
        s.profit.toString(),
        s.paymentMethod,
        s.paymentStatus,
      ]);
    } else if (reportData.type === 'inventory') {
      csvContent =
        'Make,Model,Year,Purchase Price,Target Price,Status,Days in Stock\n';
      rows = reportData.data.map((c) => [
        c.make,
        c.model,
        c.year.toString(),
        c.purchasePrice?.toString() || '',
        c.targetPrice.toString(),
        c.status,
        Math.floor(
          (Date.now() - new Date(c.purchaseDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ).toString(),
      ]);
    } else if (reportData.type === 'expenses') {
      csvContent = 'Date,Car,Type,Description,Vendor,Amount\n';
      rows = reportData.data.map((e) => [
        formatDate(e.date),
        `${e.car.make} ${e.car.model}`,
        e.type,
        e.description,
        e.vendor || '',
        e.amount.toString(),
      ]);
    }

    csvContent += rows
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      {/* Report Configuration */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Generate Report
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="label">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="input-field"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="expenses">Expense Report</option>
              <option value="profit">Profit Report</option>
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              className="btn-primary flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Generate
            </button>
            {reportData && (
              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Results */}
      {loading && <LoadingSpinner className="h-48" />}

      {reportData && !loading && (
        <div className="card overflow-hidden">
          {/* FIXED: Sales / Profit Report */}
          {reportData.type === 'sales' && (
            <>
              {/* Summary */}
              <div className="p-6 bg-gray-50 border-b">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Sales</p>
                    <p className="text-xl font-bold">
                      {reportData.data.summary.totalSales}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(reportData.data.summary.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Expenses</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(reportData.data.summary.totalExpenses)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Profit</p>
                    <p
                      className={`text-xl font-bold ${reportData.data.summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(reportData.data.summary.totalProfit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avg Profit/Car</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(reportData.data.summary.avgProfit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table */}
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
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Sale Price
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Expenses
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reportData.data.sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {formatDate(sale.date)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {sale.car}
                        </td>
                        <td className="px-4 py-3 text-sm">{sale.customer}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(sale.salePrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">
                          {formatCurrency(sale.expenses)}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm text-right font-medium ${sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(sale.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/*  FIXED: Inventory Report */}
          {reportData.type === 'inventory' && (
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
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Purchase Price
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Target Price
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Days in Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportData.data.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {car.make} {car.model}
                      </td>
                      <td className="px-4 py-3 text-sm">{car.year}</td>
                      <td className="px-4 py-3 text-sm">{car.status}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {car.purchasePrice
                          ? formatCurrency(car.purchasePrice)
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {formatCurrency(car.targetPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        {Math.floor(
                          (Date.now() - new Date(car.purchaseDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/*  FIXED: Expenses Report */}
          {reportData.type === 'expenses' && (
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
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reportData.data.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {expense.car.make} {expense.car.model}
                      </td>
                      <td className="px-4 py-3 text-sm">{expense.type}</td>
                      <td className="px-4 py-3 text-sm">
                        {expense.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-red-600">
                      {formatCurrency(
                        reportData.data.reduce((s, e) => s + e.amount, 0),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {!reportData && !loading && (
        <div className="card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No report generated
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a report type and click Generate to view data
          </p>
        </div>
      )}
    </div>
  );
}
