import { useMemo, useState } from 'react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useApproveContractMutation, usePendingContractsQuery, useRejectContractMutation } from '@/modules/subscriptions/hooks/useSubscriptionsQuery';
import { formatDate } from '@/shared/utils/format';

export const PendingContractsPage = () => {
  const query = usePendingContractsQuery();
  const approveMutation = useApproveContractMutation();
  const rejectMutation = useRejectContractMutation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const contracts = useMemo(() => query.data?.data ?? [], [query.data?.data]);

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Pending Contracts' }]} title="Pending Contracts" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contracts.map((contract) => (
          <div className="card-surface p-5" key={contract.id}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-lighter font-semibold text-brand">
                {contract.providerName
                  .split(' ')
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <h3 className="text-base">{contract.providerName}</h3>
                <p className="text-sm text-brand-light">{contract.phone}</p>
              </div>
            </div>
            <p className="text-sm text-brand-light">{contract.email}</p>
            <p className="mt-2 text-sm">Requested {formatDate(contract.requestDate, 'dd MMM yyyy p')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {contract.serviceNames.map((service) => (
                <Badge key={service}>{service}</Badge>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  setSelectedId(contract.id);
                  setDialogMode('approve');
                }}
              >
                Approve
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
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogMode === 'approve'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Contract</DialogTitle>
            <DialogDescription>Confirm this pending contract.</DialogDescription>
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
              Confirm
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
            <textarea className="min-h-28 w-full rounded-xl border border-muted p-3" onChange={(event) => setRejectReason(event.target.value)} value={rejectReason} />
            <Button className="w-full" disabled={rejectMutation.isPending} type="submit">
              Confirm Rejection
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

PendingContractsPage.displayName = 'PendingContractsPage';
