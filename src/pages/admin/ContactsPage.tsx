import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Pagination, UserFilter } from "@/components/common";
import ContactsTable from "@/components/common/ContactsTable";
import { useContacts } from "@/hooks/useContacts";
import type { UserFilters } from "@/components/common/UserFilter";

const ContactsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState<UserFilters>({
    dateFilter: null,
    dateFrom: undefined,
    dateTo: undefined,
    status: undefined,
    loginType: undefined,
    isVerified: undefined,
    appliedAt: undefined,
  });

  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    if (filters.status) params.status = filters.status; // reuse status toggle as contact status
    if (filters.dateFilter && filters.dateFilter !== 'custom') {
      params.period = filters.dateFilter;
    } else if (filters.dateFilter === 'custom') {
      if (filters.dateFrom) params.dateFrom = new Date(filters.dateFrom).toISOString();
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setUTCHours(23, 59, 59, 999);
        params.dateTo = endDate.toISOString();
      }
    }
    if (filters.appliedAt) params.appliedAt = filters.appliedAt;
    return params;
  }, [currentPage, itemsPerPage, searchQuery, filters]);

  const { data, isLoading, error, refetch } = useContacts(apiParams);
  const contacts = data?.contacts || [];
  const pagination = data?.pagination || { page: 1, limit: itemsPerPage, total: 0, totalPages: 1 };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  return (
    <div className="">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Contacts</h1>
        <div className="flex justify-between items-center gap-4 my-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-6 h-6" />
            <Input
              type="text"
              placeholder="Search by name, email, subject, ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border h-12 border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:w-96"
            />
          </div>
          <UserFilter onFilterChange={setFilters} currentFilters={filters} />
        </div>
      </div>

      {isLoading && <div className="min-h-[65vh]" />}
      {error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center mb-4">
            <p className="text-lg font-medium">Failed to load contacts</p>
            <p className="text-sm mt-1">{(error as any).message}</p>
          </div>
          <button onClick={() => refetch()} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 min-h-[65vh]">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">📬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && contacts.length > 0 && (
        <>
          <ContactsTable contacts={contacts} onView={() => {}} />
          <Pagination
            currentPage={currentPage}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default ContactsPage;
