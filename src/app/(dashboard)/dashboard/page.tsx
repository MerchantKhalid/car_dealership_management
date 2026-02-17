'use client';

import { useEffect, useState } from 'react';
import {
  Car,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Users,
  BarChart3,
} from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10b981',
  RESERVED: '#f59e0b',
  IN_REPAIR: '#f97316',
  TEST_DRIVE: '#8b5cf6',
};

interface DashboardStats {
  totalCarsInStock: number;
  inventoryValue: number;
  carsByStatus: Array<{
    status: string;
    count: number;
  }>;
  thisMonth: {
    salesCount: number;
    revenue: number;
    profit: number;
  };
  alerts: {
    oldInventory: number;
    followUpsToday: number;
    lowStock: boolean;
  };
  quickStats: {
    avgDaysToSell: number;
    avgProfit: number;
    bestSellingMake: {
      make: string;
      count: number;
    } | null;
    mostProfitableSale: {
      car: string;
      profit: number;
    } | null;
  };
  monthlyTrend: Array<{
    month: string;
    sales: number;
    revenue: number;
    profit: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null); // ✅ Add | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your dealership performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cars in Stock"
          value={stats.totalCarsInStock}
          icon={Car}
        />
        <StatCard
          title="Inventory Value"
          value={formatCurrency(stats.inventoryValue)}
          icon={Package}
        />
        <StatCard
          title="Monthly Sales"
          value={stats.thisMonth.salesCount}
          icon={DollarSign}
          trend={formatCurrency(stats.thisMonth.revenue)}
          trendUp
        />
        <StatCard
          title="Monthly Profit"
          value={formatCurrency(stats.thisMonth.profit)}
          icon={TrendingUp}
          trendUp={stats.thisMonth.profit > 0}
        />
      </div>

      {/* Alerts */}
      {(stats.alerts.oldInventory > 0 ||
        stats.alerts.followUpsToday > 0 ||
        stats.alerts.lowStock) && (
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alerts
          </h2>
          <div className="space-y-2">
            {stats.alerts.oldInventory > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-orange-800">
                  <strong>{stats.alerts.oldInventory}</strong> car(s) in
                  inventory for over 60 days — consider a price reduction
                </span>
              </div>
            )}
            {stats.alerts.followUpsToday > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  <strong>{stats.alerts.followUpsToday}</strong> customer
                  follow-up(s) due today
                </span>
              </div>
            )}
            {stats.alerts.lowStock && (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <Package className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-800">
                  Low stock alert — fewer than 5 cars in inventory
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sales Trend (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number | undefined) =>
                  value !== undefined ? formatCurrency(value) : '€0'
                }
              />
              <Bar
                dataKey="revenue"
                fill="#2563eb"
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="profit"
                fill="#10b981"
                name="Profit"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cars by Status */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cars by Status
          </h2>
          {stats.carsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.carsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props: PieLabelRenderProps) => {
                    const { status, count } = props.payload as {
                      status: string;
                      count: number;
                    };
                    return `${status}: ${count}`;
                  }}
                >
                  {stats.carsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#6b7280'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Quick Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Avg. Days to Sell</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.quickStats.avgDaysToSell} days
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Avg. Profit per Car</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(stats.quickStats.avgProfit)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Best Selling Make</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.quickStats.bestSellingMake?.make || 'N/A'}
            </p>
            {stats.quickStats.bestSellingMake && (
              <p className="text-xs text-gray-500">
                {stats.quickStats.bestSellingMake.count} units sold
              </p>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              Most Profitable (This Month)
            </p>
            <p className="text-xl font-bold text-gray-900">
              {stats.quickStats.mostProfitableSale
                ? formatCurrency(stats.quickStats.mostProfitableSale.profit)
                : 'N/A'}
            </p>
            {stats.quickStats.mostProfitableSale && (
              <p className="text-xs text-gray-500">
                {stats.quickStats.mostProfitableSale.car}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profit Trend */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Profit Trend
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number | undefined) =>
                value !== undefined ? formatCurrency(value) : '€0'
              }
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
