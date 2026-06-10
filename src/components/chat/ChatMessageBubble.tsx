import { MessageAttachment } from '@/components/chat/MessageAttachment';
import { formatDate } from '@/shared/utils/format';
import { getAttachmentType, resolveAttachmentUrl, type AttachmentType } from '@/utils/attachmentUtils';

interface ChatMessageBubbleProps {
  message: string | null;
  attachmentUrl: string | null;
  attachmentType?: AttachmentType;
  createdAt: string;
  isOwnMessage: boolean;
  fileName?: string;
}

export const ChatMessageBubble = ({
  message,
  attachmentUrl,
  attachmentType,
  createdAt,
  isOwnMessage,
  fileName,
}: ChatMessageBubbleProps) => {
  const resolvedAttachmentUrl = attachmentUrl ? resolveAttachmentUrl(attachmentUrl) : '';
  const resolvedAttachmentType = attachmentUrl ? attachmentType ?? getAttachmentType(attachmentUrl) : null;

  return (
    <div className={`max-w-[72%] rounded-2xl px-4 py-3 ${isOwnMessage ? 'bg-brand text-white' : 'bg-brand-lighter text-brand-darker'}`} dir="auto">
      {message ? <p className="text-sm">{message}</p> : null}
      {attachmentUrl ? <MessageAttachment attachmentType={resolvedAttachmentType} fileName={fileName} url={resolvedAttachmentUrl} /> : null}
      <p className="mt-2 text-[11px] opacity-70">{formatDate(createdAt, 'dd MMM yyyy p')}</p>
    </div>
  );
};

ChatMessageBubble.displayName = 'ChatMessageBubble';
