import React from 'react';
import { useDeleteFavoriteList } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listName: string;
  productCount: number;
  onSuccess?: () => void;
  className?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onOpenChange,
  listName,
  productCount,
  onSuccess,
  className
}) => {
  // API hooks
  const deleteMutation = useDeleteFavoriteList();

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(listName);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Errors are handled by mutation hooks with toast notifications
      console.error('Error deleting list:', error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    onOpenChange(false);
  };

  // Loading state
  const isDeleting = deleteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[500px] p-0", className)}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          disabled={isDeleting}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Delete List</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Are you sure you want to delete "<span className="font-semibold text-gray-700">{listName}</span>"?<br />
              This action cannot be undone.
            </p>
          </div>

          {/* List Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Products in this list:</span>
              <span className="text-sm font-semibold text-gray-900">{productCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              loading={isDeleting}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full disabled:opacity-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal; 