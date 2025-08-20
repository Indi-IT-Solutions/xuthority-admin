import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Pagination, UserFilter, TableSkeleton } from "@/components/common";
import ContactsTable from "@/components/common/ContactsTable";
import ContactDetailsModal from "@/components/common/ContactDetailsModal";
import { ContactService } from "@/services/contactService";
import toast from "react-hot-toast";
import { useContacts } from "@/hooks/useContacts";
import type { UserFilters } from "@/components/common/UserFilter";

const ContactsPage = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'pending' | 'resolved' | 'closed'>('all');
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

    // Map tab to status filter (omit for 'all')
    if (activeTab !== 'all') params.status = activeTab;
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
  }, [currentPage, itemsPerPage, searchQuery, filters, activeTab]);

  const { data, isLoading, error, refetch } = useContacts(apiParams);
  const contacts = data?.contacts || [];
  const pagination = data?.pagination || { page: 1, limit: itemsPerPage, total: 0, totalPages: 1 };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters, activeTab]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = async (id: string) => {
    setSelectedId(id);
    try {
      const res = await ContactService.getContactById(id);
      setSelectedTicket(res.data);
      setModalOpen(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || 'Failed to load ticket');
    }
  };

  const handleReply = async (message: string) => {
    if (!selectedId) return;
    await ContactService.replyToContact(selectedId, message);
    toast.success('Reply sent');
    // refresh detail (status may have changed to pending)
    const res = await ContactService.getContactById(selectedId);
    setSelectedTicket(res.data);
    // Optionally refresh list
    refetch();
  };

  const handleStatusChange = async (status: 'open' | 'pending' | 'resolved' | 'closed') => {
    if (!selectedId) return;
    await ContactService.updateStatus?.(selectedId, status);
  };

  const handleTabChange = (tab: 'all' | 'open' | 'pending' | 'resolved' | 'closed') => {
    setActiveTab(tab);
    setCurrentPage(1);
    refetch();
  };

  return (
    <div className="">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Helpdesk</h1>
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

      {/* Status Tabs */}
      <div className="flex items-center bg-blue-50 rounded-full p-2 max-w-fit mb-4">
        {[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'pending', label: 'Pending' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'closed', label: 'Closed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as any)}
            className={`px-3 py-2 md:px-6 md:py-2 text-xs h-12 md:text-sm font-medium rounded-full capitalize transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <TableSkeleton rows={10} />}
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
          <ContactsTable contacts={contacts} onViewDetails={openModal} />
          <Pagination
            currentPage={currentPage}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
          <ContactDetailsModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            ticket={selectedTicket}
            onReply={handleReply}
            onStatusChange={async (status) => {
              if (!selectedId) return;
              try {
                await ContactService.updateStatus?.(selectedId, status);
                toast.success('Status updated');
                const res = await ContactService.getContactById(selectedId);
                setSelectedTicket(res.data);
                refetch();
              } catch (e: any) {
                toast.error(e?.response?.data?.error?.message || 'Failed to update status');
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default ContactsPage;
