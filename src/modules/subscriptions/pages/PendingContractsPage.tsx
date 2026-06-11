import { useMemo, useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import {
  useApproveContractMutation,
  usePendingContractsQuery,
  useRejectContractMutation,
  useVerifyManualPaymentMutation,
} from '@/modules/subscriptions/hooks/useSubscriptionsQuery';
import { formatDate } from '@/shared/utils/format';

const getStatusLabel = (status: string | number): string => {
  const s = String(status).trim();
  switch (s) {
    case '0':
    case 'Pending':
      return 'Pending';
    case '1':
    case 'Paid':
      return 'Paid';
    case '2':
    case 'Failed':
      return 'Failed';
    case '3':
    case 'Cancelled':
      return 'Cancelled';
    case '4':
    case 'Expired':
      return 'Expired';
    case '5':
    case 'Refunded':
      return 'Refunded';
    default:
      return s || 'Unknown';
  }
};

export const PendingContractsPage = () => {
  const query = usePendingContractsQuery();
  const approveMutation = useApproveContractMutation();
  const rejectMutation = useRejectContractMutation();
  const verifyManualMutation = useVerifyManualPaymentMutation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | 'verify_manual' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const contracts = useMemo(() => query.data?.data ?? [], [query.data?.data]);

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Pending Contracts' }]} title="Pending Contracts" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contracts.map((contract) => {
          const statusStr = getStatusLabel(contract.status);
          const showConfirmReject = statusStr === 'Pending';
          const showVerifyManualPayment = statusStr === 'Failed' || statusStr === 'Expired' || statusStr === 'Cancelled';

          return (
            <div className="card-surface flex flex-col justify-between p-5" key={contract.id}>
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-lighter font-semibold text-brand shrink-0">
                    {contract.providerName
                      .split(' ')
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base truncate font-semibold text-brand-dark">{contract.providerName}</h3>
                    <p className="text-sm text-brand-light truncate">{contract.phone}</p>
                  </div>
                </div>
                <p className="text-sm text-brand-light truncate">{contract.email}</p>
                <p className="mt-2 text-sm text-brand-light">
                  Requested: <span className="text-brand-dark">{formatDate(contract.requestDate, 'dd MMM yyyy p')}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {contract.serviceNames.map((service) => (
                    <Badge key={service}>{service}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="mt-4 flex items-center justify-between border-t border-muted/30 pt-3 text-sm">
                  <div>
                    <span className="text-xs text-brand-light block">Amount</span>
                    <span className="font-semibold text-brand-dark">
                      {(contract.paymentAmount ?? 0).toFixed(2)} {contract.paymentCurrency || 'QAR'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-brand-light block mb-1">Status</span>
                    <StatusBadge status={statusStr} />
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  {showConfirmReject && (
                    <>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedId(contract.id);
                          setDialogMode('approve');
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => {
                          setSelectedId(contract.id);
                          setDialogMode('reject');
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {showVerifyManualPayment && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedId(contract.id);
                        setDialogMode('verify_manual');
                      }}
                    >
                      Verify Manual Payment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={dialogMode === 'approve'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Contract</DialogTitle>
            <DialogDescription>Are you sure you want to approve this contract?</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!selectedId) return;
              await approveMutation.mutateAsync({ paymentId: selectedId });
              setDialogMode(null);
            }}
          >
            <Button className="w-full" disabled={approveMutation.isPending} type="submit">
              {approveMutation.isPending ? 'Confirming...' : 'Confirm'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'reject'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contract</DialogTitle>
            <DialogDescription>Provide the rejection reason for audit history.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!selectedId) return;
              await rejectMutation.mutateAsync({ paymentId: selectedId, reason: rejectReason });
              setRejectReason('');
              setDialogMode(null);
            }}
          >
            <textarea
              className="min-h-28 w-full rounded-xl border border-muted p-3 focus:outline-none focus:ring-1 focus:ring-brand"
              onChange={(event) => setRejectReason(event.target.value)}
              value={rejectReason}
              placeholder="Enter rejection reason..."
              required
            />
            <Button className="w-full" disabled={rejectMutation.isPending || !rejectReason.trim()} type="submit">
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'verify_manual'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Manual Payment</DialogTitle>
            <DialogDescription>Are you sure you want to mark this payment as manually verified?</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!selectedId) return;
              await verifyManualMutation.mutateAsync({ paymentId: selectedId });
              setDialogMode(null);
            }}
          >
            <Button className="w-full" disabled={verifyManualMutation.isPending} type="submit">
              {verifyManualMutation.isPending ? 'Verifying...' : 'Confirm'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

PendingContractsPage.displayName = 'PendingContractsPage';
