// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import Link from 'next/link';
// import { Plus, Search, Users, Phone, Calendar } from 'lucide-react';
// import LoadingSpinner from '@/components/ui/loading-spinner';
// import StatusBadge from '@/components/ui/status-badge';
// import EmptyState from '@/components/ui/empty-state';
// import {
//   formatDate,
//   customerStatusLabels,
//   leadSourceLabels,
//   customerStatusColors,
// } from '@/lib/utils';
// import { CustomerWithRelations } from '@/types';

// export default function CustomersPage() {
//   const [customers, setCustomers] = useState<CustomerWithRelations[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [leadSourceFilter, setLeadSourceFilter] = useState('');

//   const fetchCustomers = useCallback(async () => {
//     try {
//       const params = new URLSearchParams();
//       if (search) params.set('search', search);
//       if (statusFilter) params.set('status', statusFilter);
//       if (leadSourceFilter) params.set('leadSource', leadSourceFilter);

//       const res = await fetch(`/api/customers?${params.toString()}`);
//       const data = await res.json();
//       setCustomers(data);
//     } catch (error) {
//       console.error('Error fetching customers:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [search, statusFilter, leadSourceFilter]);

//   useEffect(() => {
//     fetchCustomers();
//   }, [fetchCustomers]);

//   const isFollowUpDue = (date: Date | string | null | undefined) => {
//     if (!date) return false;
//     const followUp = new Date(date);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     return followUp <= today;
//   };

//   if (loading) return <LoadingSpinner className="h-96" />;

//   return (
//     <div className="space-y-6">
//       <div className="page-header">
//         <div>
//           <h1 className="page-title">Customers</h1>
//           <p className="text-sm text-gray-500 mt-1">
//             {customers.length} customer(s) total
//           </p>
//         </div>
//         <Link
//           href="/customers/new"
//           className="btn-primary flex items-center gap-2"
//         >
//           <Plus className="h-4 w-4" />
//           Add New Customer
//         </Link>
//       </div>

//       {/* Search & Filters */}
//       <div className="card p-4">
//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by name or phone..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="input-field pl-10"
//             />
//           </div>
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="input-field sm:w-48"
//           >
//             <option value="">All Statuses</option>
//             {Object.entries(customerStatusLabels).map(([value, label]) => (
//               <option key={value} value={value}>
//                 {label}
//               </option>
//             ))}
//           </select>
//           <select
//             value={leadSourceFilter}
//             onChange={(e) => setLeadSourceFilter(e.target.value)}
//             className="input-field sm:w-48"
//           >
//             <option value="">All Sources</option>
//             {Object.entries(leadSourceLabels).map(([value, label]) => (
//               <option key={value} value={value}>
//                 {label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Customer Table */}
//       {customers.length === 0 ? (
//         <EmptyState
//           icon={Users}
//           title="No customers found"
//           description="Add your first customer or adjust your filters."
//           action={
//             <Link href="/customers/new" className="btn-primary">
//               Add New Customer
//             </Link>
//           }
//         />
//       ) : (
//         <div className="card overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b">
//                 <tr>
//                   <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
//                     Name
//                   </th>
//                   <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
//                     Phone
//                   </th>
//                   <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
//                     Status
//                   </th>
//                   <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
//                     Source
//                   </th>
//                   <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
//                     Interested Cars
//                   </th>
//                   <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
//                     Follow-up
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">
//                 {customers.map((customer) => (
//                   <tr
//                     key={customer.id}
//                     className={`hover:bg-gray-50 ${
//                       isFollowUpDue(customer.followUpDate) ? 'bg-yellow-50' : ''
//                     }`}
//                   >
//                     <td className="px-4 py-3">
//                       <Link
//                         href={`/customers/${customer.id}`}
//                         className="font-medium text-blue-600 hover:text-blue-800"
//                       >
//                         {customer.name}
//                       </Link>
//                       {customer.email && (
//                         <p className="text-xs text-gray-500">
//                           {customer.email}
//                         </p>
//                       )}
//                     </td>
//                     <td className="px-4 py-3 text-sm">
//                       <div className="flex items-center gap-1">
//                         <Phone className="h-3.5 w-3.5 text-gray-400" />
//                         {customer.phone}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <StatusBadge
//                         status={customer.status}
//                         colorMap={customerStatusColors}
//                         labelMap={customerStatusLabels}
//                       />
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-600">
//                       {leadSourceLabels[customer.leadSource]}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-600">
//                       {customer.interestedCars &&
//                       customer.interestedCars.length > 0
//                         ? customer.interestedCars
//                             .map((cc) => `${cc.car.make} ${cc.car.model}`)
//                             .join(', ')
//                         : '-'}
//                     </td>
//                     <td className="px-4 py-3 text-sm">
//                       {customer.followUpDate ? (
//                         <div
//                           className={`flex items-center gap-1 ${
//                             isFollowUpDue(customer.followUpDate)
//                               ? 'text-orange-600 font-medium'
//                               : 'text-gray-600'
//                           }`}
//                         >
//                           <Calendar className="h-3.5 w-3.5" />
//                           {formatDate(customer.followUpDate)}
//                         </div>
//                       ) : (
//                         '-'
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, Phone, Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import StatusBadge from '@/components/ui/status-badge';
import EmptyState from '@/components/ui/empty-state';
import {
  formatDate,
  customerStatusLabels,
  leadSourceLabels,
  customerStatusColors,
} from '@/lib/utils';
import { CustomerWithRelations } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [leadSourceFilter, setLeadSourceFilter] = useState('');

  // ✅ Debounce search to avoid API call on every keystroke
  const debouncedSearch = useDebounce(search, 400);

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (leadSourceFilter) params.set('leadSource', leadSourceFilter);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, leadSourceFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const isFollowUpDue = (date: Date | string | null | undefined) => {
    if (!date) return false;
    const followUp = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return followUp <= today;
  };

  if (loading) return <LoadingSpinner className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {customers.length} customer(s) total
          </p>
        </div>
        <Link
          href="/customers/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Customer
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="">All Statuses</option>
            {Object.entries(customerStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={leadSourceFilter}
            onChange={(e) => setLeadSourceFilter(e.target.value)}
            className="input-field sm:w-48"
          >
            <option value="">All Sources</option>
            {Object.entries(leadSourceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Table */}
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="Add your first customer or adjust your filters."
          action={
            <Link href="/customers/new" className="btn-primary">
              Add New Customer
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
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Source
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Interested Cars
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Follow-up
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={`hover:bg-gray-50 ${
                      isFollowUpDue(customer.followUpDate) ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {customer.name}
                      </Link>
                      {customer.email && (
                        <p className="text-xs text-gray-500">
                          {customer.email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={customer.status}
                        colorMap={customerStatusColors}
                        labelMap={customerStatusLabels}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {leadSourceLabels[customer.leadSource]}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {customer.interestedCars &&
                      customer.interestedCars.length > 0
                        ? customer.interestedCars
                            .map((cc) => `${cc.car.make} ${cc.car.model}`)
                            .join(', ')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {customer.followUpDate ? (
                        <div
                          className={`flex items-center gap-1 ${
                            isFollowUpDue(customer.followUpDate)
                              ? 'text-orange-600 font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(customer.followUpDate)}
                        </div>
                      ) : (
                        '-'
                      )}
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
