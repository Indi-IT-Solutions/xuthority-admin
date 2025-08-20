import React, { useState } from 'react';
import { Eye, MoreHorizontal } from 'lucide-react';

export interface ContactRow {
  id: number;
  _id: string;
  ticketId: string;
  requester: { name: string; email: string; company?: string };
  subject: string;
  reason: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  createdOn: string;
}

interface ContactsTableProps {
  contacts: ContactRow[];
  onViewDetails?: (id: string) => void;
}

const statusBadge = (status: ContactRow['status']) => {
  const base = 'px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium';
  switch (status) {
    case 'open':
      return `${base} bg-red-100 text-red-700`;
    case 'pending':
      return `${base} bg-yellow-100 text-yellow-700`;
    case 'resolved':
      return `${base} bg-green-100 text-green-700`;
    case 'closed':
      return `${base} bg-gray-100 text-gray-700`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
};

interface ActionMenuProps {
  contactId: string;
  onViewDetails?: (contactId: string) => void;
}


const ActionMenu = ({ 
  contactId,
  onViewDetails
}: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 176; // w-44 = 11rem = 176px
      const dropdownHeight = 40 + 16; // Approximate height for one action
      
      let top = rect.bottom + 4; // 4px margin, using viewport coordinates
      let left = rect.right - dropdownWidth; // Align right edge
      
      // Adjust if dropdown would go off-screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Adjust horizontal position if off-screen
      if (left < 10) {
        left = rect.left; // Align to left edge of button
      }
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10;
      }
      
      // Adjust vertical position if off-screen
      if (top + dropdownHeight > viewportHeight - 10) {
        top = rect.top - dropdownHeight - 4; // Show above button
      }
      
      setDropdownPosition({ top, left });
    }
  };

  const handleButtonClick = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleViewDetailsClick = () => {
    onViewDetails?.(contactId)
    setIsOpen(false)
  };

  // Close dropdown on scroll
  React.useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        setIsOpen(false);
      };

      const handleResize = () => {
        if (isOpen) {
          updateDropdownPosition();
        }
      };

      // Add scroll listeners to both window and potential scroll containers
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer"
        aria-label="More actions"
      >
       <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div 
            className="fixed w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <button
              onClick={handleViewDetailsClick}
              className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-3 text-blue-600" />
              <span className="text-gray-700">View Details</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, onViewDetails }) => {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100 min-h-[65vh]">
      <table className="w-full min-w-[1000px]">
        <thead className="bg-gray-100 rounded-b-2xl">
          <tr>
            <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">S. No.</th>
            <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Ticket ID</th>
            <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Requester</th>
            <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Subject</th>
            <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Reason</th>
            <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Status</th>
            <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Created On</th>
            <th className="text-left py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, idx) => (
            <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-900">#{idx + 1}</td>
              <td className="py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-gray-900">{c.ticketId}</td>
              <td className="py-3 px-3 md:py-4 md:px-6">
                <div className="min-w-0">
                  <div className="text-xs md:text-sm font-medium text-gray-900 truncate">{c.requester.name}</div>
                  <div className="text-xs text-gray-500 truncate">{c.requester.email}{c.requester.company ? ` • ${c.requester.company}` : ''}</div>
                </div>
              </td>
              <td className="py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm text-gray-900 truncate max-w-[260px]">{c.subject}</td>
              <td className="py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm text-gray-900">{c.reason}</td>
              <td className="py-3 px-3 md:py-4 md:px-6"><span className={statusBadge(c.status)}>{c.status}</span></td>
              <td className="py-3 px-3 md:py-4 md:px-6 text-xs md:text-sm text-gray-600 whitespace-nowrap">{c.createdOn}</td>
      
              <td className="py-3 px-3 md:py-4 md:px-6">
                  <ActionMenu
                    contactId={c._id}
                    onViewDetails={onViewDetails}
                  />
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsTable;
