import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
  isDeleting?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  isDeleting = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Are you sure you want to delete the "{itemName}" {itemType}?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            This action cannot be undone. Deleting this {itemType.toLowerCase()} will permanently
            remove all associated reviews, ratings, and visibility from the platform.
          </DialogDescription>
        </DialogHeader>
              {/* Action Buttons */}
              <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              loading={isDeleting}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full disabled:opacity-50"
            >
              Delete
            </Button>
          </div>
    
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;