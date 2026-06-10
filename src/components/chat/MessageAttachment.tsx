import { useMemo, useState } from 'react';
import { Download, FileText, ImageOff, ZoomIn } from 'lucide-react';
import { ImageLightbox } from '@/components/chat/ImageLightbox';
import { getAttachmentType, getFileNameFromUrl, type AttachmentType } from '@/utils/attachmentUtils';

interface MessageAttachmentProps {
  url: string;
  attachmentType?: AttachmentType;
  fileName?: string;
}

export const MessageAttachment = ({ url, attachmentType, fileName }: MessageAttachmentProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const resolvedType = attachmentType ?? getAttachmentType(url);
  const resolvedFileName = useMemo(() => fileName || getFileNameFromUrl(url), [fileName, url]);

  if (!resolvedType) {
    return null;
  }

  if (resolvedType === 'file') {
    return (
      <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-all duration-200">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-brand" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-darker">{resolvedFileName}</p>
          </div>
          <a
            className="inline-flex items-center gap-1 text-sm text-brand transition-all duration-200 hover:text-brand-dark"
            href={url}
            rel="noreferrer"
            target="_blank"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        className="group relative mt-2 block overflow-hidden rounded-lg border border-gray-200 text-left transition-all duration-200"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (!isImageError) {
            setIsLightboxOpen(true);
          }
        }}
      >
        {!isImageLoaded && !isImageError ? <div className="h-[180px] w-[240px] animate-pulse rounded-lg bg-gray-200" /> : null}

        {isImageError ? (
          <div className="flex h-[120px] w-[240px] items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 text-gray-400">
            <ImageOff className="h-5 w-5" />
            <span className="text-sm">Image unavailable</span>
          </div>
        ) : (
          <div className={`${isImageLoaded ? 'block' : 'hidden'} relative`}>
            <img
              alt={resolvedFileName}
              className="max-h-[300px] max-w-[240px] object-cover"
              src={url}
              onError={() => {
                setIsImageError(true);
                setIsImageLoaded(false);
              }}
              onLoad={() => {
                setIsImageLoaded(true);
                setIsImageError(false);
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/20 group-hover:opacity-100">
              <div className="rounded-full bg-black/50 p-2 text-white">
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>
          </div>
        )}
      </button>

      <ImageLightbox alt={resolvedFileName} isOpen={isLightboxOpen} src={url} onClose={() => setIsLightboxOpen(false)} />
    </>
  );
};

MessageAttachment.displayName = 'MessageAttachment';
