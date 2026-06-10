import type { SupportResponseDto } from '@/shared/types/common';

export type SupportInboxRole = 'user' | 'provider' | 'support';
export type SupportActorRole = 'user' | 'provider' | 'support' | 'admin';

export interface SupportInboxItem {
  supportChatId: number;
  otherPartyId: number;
  otherPartyRole: SupportInboxRole;
  otherPartyName: string | null;
  otherPartyAvatarUrl: string | null;
  lastMessageText: string | null;
  lastMessageImageUrl: string | null;
  lastMessageSenderRole: string | null;
  lastMessageAt: string | null;
  unseenCount: number;
}

export interface SupportMessage {
  messageId: number;
  supportChatId: number;
  senderId: number;
  senderRole: SupportActorRole;
  receiverId: number;
  receiverRole: SupportActorRole;
  messageText: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface TicketMessagesPayload {
  supportChatId: number;
  totalCount: number;
  page: number;
  pageSize: number;
  messages: SupportMessage[];
}

export interface ReplyTicketPayload {
  supportChatId: number;
  messageText?: string;
  image?: File | null;
}

export type SupportTicketsResponseDto = SupportResponseDto<SupportInboxItem[]>;
export type TicketMessagesResponseDto = SupportResponseDto<TicketMessagesPayload>;
export type ReplyTicketResponseDto = SupportResponseDto<SupportMessage>;
export type SeenTicketResponseDto = SupportResponseDto<string>;
