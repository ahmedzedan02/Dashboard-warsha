import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox = ({ src, alt = 'Attachment preview', isOpen, onClose }: ImageLightboxProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 transition-opacity duration-200"
      role="dialog"
      onClick={onClose}
    >
      <button
        aria-label="Close image preview"
        className="absolute right-4 top-4 rounded-full p-2 text-white transition-all duration-200 hover:bg-white/10"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X className="h-6 w-6" />
      </button>
      <img
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        src={src}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
};

ImageLightbox.displayName = 'ImageLightbox';
