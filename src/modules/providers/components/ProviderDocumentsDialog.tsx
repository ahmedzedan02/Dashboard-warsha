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
const isMixedContentPreview = (url: string): boolean =>
  typeof window !== 'undefined' && window.location.protocol === 'https:' && /^http:\/\//i.test(url);

const FileIcon = () => (
  <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ImageIcon = () => (
  <svg className="h-8 w-8 text-brand" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PdfIcon = () => (
  <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ProviderDocumentsDialog = ({ open, providerId, providerName, onOpenChange }: ProviderDocumentsDialogProps) => {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const providerDetailsQuery = useProviderDetailsQuery(open ? providerId ?? undefined : undefined);
  const details = providerDetailsQuery.data?.data;
  const providerLabel = details?.providerName || providerName || 'Provider';
  const documents = useMemo(() => (details?.documents ?? []).filter((document) => document.url), [details?.documents]);
  const paperMutation = useSetProviderPaperMutation();

  const activeDoc = documents[activeDocIndex];

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setLightboxImage(null);
            setActiveDocIndex(0);
          }
          onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden p-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-muted bg-brand-lighter px-6 py-4">
            <div>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold text-brand-dark">
                  Provider Documents
                </DialogTitle>
                <DialogDescription className="text-sm text-brand-light">
                  {documents.length > 0
                    ? `${documents.length} document${documents.length > 1 ? 's' : ''} for ${providerLabel}`
                    : `Documents for ${providerLabel}`}
                </DialogDescription>
              </DialogHeader>
            </div>
            {details && (
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={details.isPaperOk ? 'success' : 'warning'}>
                  {details.isPaperOk ? '✓ Verified' : '⏳ Pending'}
                </Badge>
                <Button
                  disabled={paperMutation.isPending}
                  size="sm"
                  variant={details.isPaperOk ? 'outline' : 'default'}
                  onClick={() => paperMutation.mutate({ providerId: details.id, isPaperOk: !details.isPaperOk })}
                >
                  {paperMutation.isPending ? 'Saving...' : details.isPaperOk ? 'Revoke' : 'Approve Papers'}
                </Button>
              </div>
            )}
          </div>

          {/* Body */}
          {providerDetailsQuery.isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-brand-light">Loading documents...</p>
            </div>
          ) : providerDetailsQuery.isError ? (
            <div className="flex h-64 items-center justify-center px-6">
              <p className="text-sm text-red-600">{providerDetailsQuery.error.message}</p>
            </div>
          ) : !documents.length ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 px-6">
              <FileIcon />
              <p className="text-sm text-brand-light">No documents uploaded for this provider.</p>
            </div>
          ) : (
            <div className="flex h-[75vh] overflow-hidden">
              {/* Sidebar — doc list */}
              {documents.length > 1 && (
                <aside className="flex w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r border-muted bg-white p-3">
                  {documents.map((doc, index) => {
                    const name = doc.fileName.trim() || getFileNameFromUrl(doc.url);
                    const isPdf = isPdfDocument(doc.url);
                    const isImage = getAttachmentType(doc.url) === 'image';
                    const isActive = index === activeDocIndex;

                    return (
                      <button
                        key={doc.id || index}
                        className={`flex w-full items-center gap-2 rounded-xl p-2 text-left transition-colors ${
                          isActive
                            ? 'bg-brand text-white'
                            : 'hover:bg-brand-lighter text-brand-dark'
                        }`}
                        type="button"
                        onClick={() => setActiveDocIndex(index)}
                      >
                        <span className={isActive ? 'text-white' : ''}>
                          {isImage ? <ImageIcon /> : isPdf ? <PdfIcon /> : <FileIcon />}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{name}</p>
                          <p className={`text-[10px] ${isActive ? 'text-white/70' : 'text-brand-light'}`}>
                            {isImage ? 'Image' : isPdf ? 'PDF' : 'Document'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </aside>
              )}

              {/* Main viewer */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {activeDoc && (() => {
                  const docName = activeDoc.fileName.trim() || getFileNameFromUrl(activeDoc.url);
                  const attachmentType = getAttachmentType(activeDoc.url);
                  const isPdf = isPdfDocument(activeDoc.url);
                  const requiresDirectOpen = isMixedContentPreview(activeDoc.url);

                  return (
                    <>
                      {/* Doc toolbar */}
                      <div className="flex items-center justify-between gap-3 border-b border-muted bg-white px-4 py-3">
                        <div className="flex items-center gap-2">
                          {attachmentType === 'image' ? <ImageIcon /> : isPdf ? <PdfIcon /> : <FileIcon />}
                          <div>
                            <p className="text-sm font-medium text-brand-dark">{docName}</p>
                            {documents.length > 1 && (
                              <p className="text-xs text-brand-light">
                                {activeDocIndex + 1} of {documents.length}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {documents.length > 1 && (
                            <>
                              <Button
                                disabled={activeDocIndex === 0}
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveDocIndex((i) => Math.max(0, i - 1))}
                              >
                                ← Prev
                              </Button>
                              <Button
                                disabled={activeDocIndex === documents.length - 1}
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveDocIndex((i) => Math.min(documents.length - 1, i + 1))}
                              >
                                Next →
                              </Button>
                            </>
                          )}
                          <Button asChild size="sm" variant="outline">
                            <a href={activeDoc.url} rel="noreferrer" target="_blank">
                              ↗ Open
                            </a>
                          </Button>
                        </div>
                      </div>

                      {/* Viewer area */}
                      <div className="flex-1 overflow-auto bg-gray-50 p-4">
                        {requiresDirectOpen ? (
                          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                            <FileIcon />
                            <p className="max-w-md text-sm text-brand-light">
                              This document uses an `http` URL and cannot be previewed inside the secure dashboard.
                              Open it directly to use the original path.
                            </p>
                            <Button asChild variant="default">
                              <a href={activeDoc.url} rel="noreferrer" target="_blank">
                                Open Original Document
                              </a>
                            </Button>
                          </div>
                        ) : attachmentType === 'image' ? (
                          <button
                            className="flex h-full w-full items-center justify-center"
                            type="button"
                            onClick={() => setLightboxImage({ src: activeDoc.url, alt: docName })}
                          >
                            <img
                              alt={docName}
                              className="max-h-full max-w-full rounded-xl object-contain shadow-md"
                              src={activeDoc.url}
                            />
                          </button>
                        ) : isPdf ? (
                          <iframe
                            className="h-full w-full rounded-xl border-0 bg-white shadow-sm"
                            src={activeDoc.url}
                            title={docName}
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-4">
                            <FileIcon />
                            <p className="text-sm text-brand-light">
                              Preview not available for this file type.
                            </p>
                            <Button asChild variant="default">
                              <a href={activeDoc.url} rel="noreferrer" target="_blank">
                                Download / Open Document
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
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
