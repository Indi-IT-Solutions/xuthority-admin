import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Reply } from 'lucide-react';

interface ContactDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: {
    _id: string;
    ticketId: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    subject: string;
    reason: string;
    message: string;
    status: 'open' | 'pending' | 'resolved' | 'closed';
    createdAt: string;
  } | null;
  onReply: (message: string) => Promise<void>;
  onStatusChange?: (status: 'open' | 'pending' | 'resolved' | 'closed') => Promise<void>;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({ open, onOpenChange, ticket, onReply, onStatusChange }) => {
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nextStatus, setNextStatus] = useState<'open' | 'pending' | 'resolved' | 'closed'>(ticket?.status || 'open');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (ticket?.status) {
      setNextStatus(ticket.status);
    }
  }, [ticket?.status]);

  const handleReplySubmit = async () => {
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await onReply(reply.trim());
      setReply('');
      setIsReplyMode(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!ticket) return null;

  const createdOn = new Date(ticket.createdAt).toLocaleString();

  const statusPill = (s: 'open' | 'pending' | 'resolved' | 'closed') => {
    const base = 'px-2.5 py-1 rounded-full text-xs font-medium';
    switch (s) {
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

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        setIsReplyMode(false);
        setReply('');
        setUpdating(false);
        if (ticket?.status) setNextStatus(ticket.status);
      }
      onOpenChange(val);
    }}>
      <DialogContent key={`${ticket?._id || 'no-ticket'}-${open ? 'open' : 'closed'}`} className="sm:max-w-[620px] bg-white p-0 rounded-xl">
        <div className="flex flex-col max-h-[80vh] ">
          <div className="px-6 pt-6">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-lg sm:text-xl">Ticket {ticket.ticketId}</DialogTitle>
                  {!isReplyMode && <span className={statusPill(ticket.status)}>{ticket.status}</span>}
               
                </div>
              </div>
            </DialogHeader>
          </div>
          <hr className='my-4'/>

          {!isReplyMode ? (
            <>
              <div className="px-6 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Requester</div>
                    <div className="text-sm font-semibold text-gray-900">{ticket.firstName} {ticket.lastName}</div>
                    <div className="text-xs text-gray-600">{ticket.email}{ticket.company ? ` • ${ticket.company}` : ''}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="text-sm font-semibold text-gray-900">{createdOn}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Reason</div>
                    <div className="text-sm font-semibold text-gray-900 capitalize">{ticket.reason}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Subject</div>
                    <div className="text-sm font-semibold text-gray-900 break-words">{ticket.subject}</div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="text-sm text-gray-500 mb-2">Message</div>
                <div className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-56 overflow-auto whitespace-pre-wrap">
                  {ticket.message}
                </div>
              </div>
            </>
          ) : (
            <div className="px-6 pb-6 space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Reply to</div>
                <div className="text-sm font-medium text-gray-900">{ticket.firstName} {ticket.lastName} • {ticket.email}</div>
              </div>
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={8} placeholder="Type your reply. This will be emailed to the requester. We do not store replies." />
              <div className="flex justify-end gap-3">
                <Button  className=" px-6 rounded-full" variant="outline" onClick={() => setIsReplyMode(false)} disabled={submitting}>Cancel</Button>
                <Button  className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-full" onClick={handleReplySubmit} loading={submitting} disabled={!reply.trim()}>Send Reply</Button>
              </div>
            </div>
          )}

          {!isReplyMode && (
            <div className="mt-auto border-t flex items-center justify-between">
              <div className="px-6 py-4 flex items-center justify-between gap-3 w-full">
               <div className='flex justify-between gap-2 items-center'>
               <div className="text-sm text-gray-600">Status</div>
                <div className="flex items-center gap-2">
                  <Select
                    value={nextStatus}
                    onValueChange={(v) => setNextStatus(v as 'open' | 'pending' | 'resolved' | 'closed')}
                  >
                    <SelectTrigger className="w-44 rounded-full">
                      <SelectValue placeholder="Set status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className=" bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-full"
                    onClick={async () => {
                      if (!onStatusChange || nextStatus === ticket.status) return;
                      try {
                        setUpdating(true);
                        await onStatusChange(nextStatus);
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    loading={updating}
                    disabled={updating || !onStatusChange || nextStatus === ticket.status}
                  >
                    Update
                  </Button>
                </div>
                </div>
                {!isReplyMode && (
                    <Button
                      variant="outline"
                    //   size="sm"
                      className=" ml-1 px-6 rounded-full"
                      onClick={() => setIsReplyMode(true)}
                      title="Reply"
                      aria-label="Reply"
                    >
                      <Reply className="w-5 h-5" /> Reply
                    </Button>
                  )}
              </div>
        
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsModal;
