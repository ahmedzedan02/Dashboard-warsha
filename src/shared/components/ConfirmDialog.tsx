import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/shared/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({ open, title, description, isLoading, onConfirm, onCancel }: ConfirmDialogProps) => (
  <AlertDialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 z-50 bg-brand-darker/40" />
      <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-card">
        <AlertDialog.Title className="text-lg font-medium">{title}</AlertDialog.Title>
        <AlertDialog.Description className="mt-2 text-sm text-brand-light">{description}</AlertDialog.Description>
        <div className="mt-6 flex justify-end gap-3">
          <AlertDialog.Cancel asChild>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

ConfirmDialog.displayName = 'ConfirmDialog';
