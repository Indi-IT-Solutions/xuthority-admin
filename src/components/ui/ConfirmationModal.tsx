import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive';
  isLoading?: boolean;
  body?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'destructive',
  isLoading = false,
  body,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-xl flex flex-col items-center justify-center bg-white">
        <DialogHeader >
          <DialogTitle className="text-xl font-bold text-center">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 pt-2 text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        {body && (
          <div className="w-full mt-2">
            {body}
          </div>
        )}
        <DialogFooter className="pt-4 sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" className='rounded-full sm:min-w-44' variant="outline" >
              {cancelText}
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            disabled={isLoading} 
            className='rounded-full bg-blue-600 text-white hover:bg-blue-700 sm:min-w-44' 
            variant={confirmVariant} 
            onClick={onConfirm}
            loading={isLoading}
          > 
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal; 