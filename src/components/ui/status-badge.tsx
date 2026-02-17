import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  colorMap: Record<string, string>;
  labelMap: Record<string, string>;
}

export default function StatusBadge({
  status,
  colorMap,
  labelMap,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorMap[status] || 'bg-gray-100 text-gray-800',
      )}
    >
      {labelMap[status] || status}
    </span>
  );
}
