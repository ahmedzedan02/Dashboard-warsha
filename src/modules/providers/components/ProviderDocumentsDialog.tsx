import { useMemo, useState } from 'react';
import { ImageLightbox } from '@/components/chat/ImageLightbox';
import { useProviderDetailsQuery, useSetProviderPaperMutation } from '@/modules/providers/hooks/useProvidersQuery';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { getAttachmentType, getFileNameFromUrl } from '@/utils/attachmentUtils';

interface ProviderDocumentsDialogProps {
  open: boolean;
  providerId: string | null;
  providerName?: string;
  onOpenChange: (open: boolean) => void;
}

const isPdfDocument = (url: string): boolean => /\.pdf(?:$|[?#])/i.test(url);

export const ProviderDocumentsDialog = ({ open, providerId, providerName, onOpenChange }: ProviderDocumentsDialogProps) => {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const providerDetailsQuery = useProviderDetailsQuery(open ? providerId ?? undefined : undefined);
  const details = providerDetailsQuery.data?.data;
  const providerLabel = details?.providerName || providerName || 'Provider';
  const documents = useMemo(() => (details?.documents ?? []).filter((document) => document.url), [details?.documents]);
  const paperMutation = useSetProviderPaperMutation();

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setLightboxImage(null);
          }

          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <DialogTitle>Provider Papers</DialogTitle>
              <DialogDescription>Uploaded paper documents for {providerLabel}.</DialogDescription>
            </div>
            {details && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-brand-dark">Paper Status:</span>
                <Badge variant={details.isPaperOk ? 'success' : 'warning'}>
                  {details.isPaperOk ? 'OK' : 'Pending'}
                </Badge>
                <Button
                  size="sm"
                  variant={details.isPaperOk ? 'outline' : 'default'}
                  onClick={() => paperMutation.mutate({ providerId: details.id, isPaperOk: !details.isPaperOk })}
                  disabled={paperMutation.isPending}
                >
                  {details.isPaperOk ? 'Set Pending' : 'Approve (Paper OK)'}
                </Button>
              </div>
            )}
          </DialogHeader>

          {providerDetailsQuery.isLoading ? (
            <p className="text-sm text-brand-light">Loading documents...</p>
          ) : providerDetailsQuery.isError ? (
            <p className="text-sm text-red-600">{providerDetailsQuery.error.message}</p>
          ) : !documents.length ? (
            <p className="text-sm text-brand-light">No documents available for this provider.</p>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => {
                const documentName = document.fileName || getFileNameFromUrl(document.url);
                const attachmentType = getAttachmentType(document.url);

                if (attachmentType === 'image') {
                  return (
                    <div className="overflow-hidden rounded-2xl border border-muted bg-white" key={document.id}>
                      <div className="flex items-center justify-between gap-3 border-b border-muted bg-brand-lighter px-4 py-3">
                        <p className="text-sm font-medium text-brand-dark">{documentName}</p>
                        <Button asChild size="sm" variant="outline">
                          <a href={document.url} rel="noreferrer" target="_blank">
                            Open Full Size
                          </a>
                        </Button>
                      </div>
                      <button
                        className="block w-full bg-white p-3"
                        type="button"
                        onClick={() => setLightboxImage({ src: document.url, alt: documentName })}
                      >
                        <img alt={documentName} className="max-h-[28rem] w-full rounded-xl object-contain" src={document.url} />
                      </button>
                    </div>
                  );
                }

                if (isPdfDocument(document.url)) {
                  return (
                    <div className="overflow-hidden rounded-2xl border border-muted bg-white" key={document.id}>
                      <div className="flex items-center justify-between gap-3 border-b border-muted bg-brand-lighter px-4 py-3">
                        <p className="text-sm font-medium text-brand-dark">{documentName}</p>
                        <Button asChild size="sm" variant="outline">
                          <a href={document.url} rel="noreferrer" target="_blank">
                            Open PDF
                          </a>
                        </Button>
                      </div>
                      <iframe className="h-[32rem] w-full bg-white" src={document.url} title={documentName} />
                    </div>
                  );
                }

                return (
                  <div className="rounded-2xl border border-muted bg-brand-lighter p-4" key={document.id}>
                    <p className="text-sm font-medium text-brand-dark">{documentName}</p>
                    <p className="mt-1 text-sm text-brand-light">Preview is not available for this file type.</p>
                    <Button asChild className="mt-3" size="sm" variant="outline">
                      <a href={document.url} rel="noreferrer" target="_blank">
                        Open Document
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ImageLightbox
        alt={lightboxImage?.alt}
        isOpen={Boolean(lightboxImage)}
        src={lightboxImage?.src ?? ''}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
};

ProviderDocumentsDialog.displayName = 'ProviderDocumentsDialog';
