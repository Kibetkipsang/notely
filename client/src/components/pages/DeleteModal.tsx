import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password?: string) => Promise<void>;
  title: string;
  description: string;
  type: 'account' | 'notes';
  isPending: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type,
  isPending
}: DeleteConfirmationModalProps) {
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  const handleSubmit = async () => {
    await onConfirm(type === 'account' ? password : undefined);
    if (type === 'notes') setConfirmationText('');
    setPassword('');
  };

  const canSubmit = type === 'account' 
    ? password.length >= 6
    : confirmationText === 'DELETE_ALL_NOTES';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {type === 'account' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Enter your password to confirm
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">
                For security, please enter your current password to confirm account deletion.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Type "DELETE_ALL_NOTES" to confirm
              </label>
              <Input
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE_ALL_NOTES"
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">
                This will permanently delete ALL your notes. This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="flex-1"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {type === 'account' ? 'Deleting...' : 'Deleting Notes...'}
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                {type === 'account' ? 'Delete Account' : 'Delete All Notes'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}