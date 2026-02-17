import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  className,
}: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                trendUp ? 'text-green-600' : 'text-red-600',
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
