const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
const FILE_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip']);

export type AttachmentType = 'image' | 'file' | null;

const getExtension = (url: string): string => {
  const cleanUrl = url.split('?')[0]?.split('#')[0] ?? '';
  const extension = cleanUrl.split('.').pop();

  return extension ? extension.toLowerCase() : '';
};

export const getAttachmentType = (url: string): AttachmentType => {
  if (!url.trim()) {
    return null;
  }

  const extension = getExtension(url);

  if (IMAGE_EXTENSIONS.has(extension)) {
    return 'image';
  }

  if (FILE_EXTENSIONS.has(extension)) {
    return 'file';
  }

  return null;
};

export const resolveAttachmentUrl = (path: string): string => {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? '';
  const normalizedPath = path.replace(/^\/+/, '');

  return `${baseUrl}/${normalizedPath}`;
};

export const getFileNameFromUrl = (url: string): string => {
  const cleanUrl = url.split('?')[0]?.split('#')[0] ?? '';
  const segments = cleanUrl.split('/');

  return segments.at(-1) || 'attachment';
};
