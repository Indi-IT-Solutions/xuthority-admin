import React from 'react';
import { Eye } from 'lucide-react';

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
  onView?: (id: string) => void;
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

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, onView }) => {
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
                <button onClick={() => onView?.(c._id)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs md:text-sm flex items-center gap-2 cursor-pointer">
                  <Eye className="w-4 h-4" /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsTable;
