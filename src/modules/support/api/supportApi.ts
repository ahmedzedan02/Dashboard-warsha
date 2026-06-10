import { axiosInstance } from '@/shared/lib/axiosInstance';
import { authStore } from '@/modules/auth/store/authStore';
import type { ResponseDTONew, SupportResponseDto } from '@/shared/types/common';
import type {
  SupportInboxItem,
  SupportInboxRole,
  ReplyTicketPayload,
  ReplyTicketResponseDto,
  SupportActorRole,
  SupportMessage,
  SeenTicketResponseDto,
  SupportTicketsResponseDto,
  TicketMessagesResponseDto,
} from '@/modules/support/types/support';

type SupportEnvelope<T> = SupportResponseDto<T> | ResponseDTONew<T>;

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {};

const normalizeKey = (key: string): string => key.replace(/[_\-\s]/g, '').toLowerCase();

const getField = (source: unknown, ...keys: string[]): unknown => {
  const record = asRecord(source);
  const entries = Object.entries(record);

  for (const key of keys) {
    const normalizedKey = normalizeKey(key);
    const match = entries.find(([entryKey]) => normalizeKey(entryKey) === normalizedKey);

    if (match) {
      return match[1];
    }
  }

  return undefined;
};

const getString = (source: unknown, ...keys: string[]): string => {
  const value = getField(source, ...keys);

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const getNumber = (source: unknown, ...keys: string[]): number => {
  const value = getField(source, ...keys);

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const getArray = (source: unknown, ...keys: string[]): unknown[] => {
  const value = getField(source, ...keys);
  return Array.isArray(value) ? value : [];
};

const normalizeSupportRole = (value: string): SupportActorRole => {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'provider' || normalized === 'support' || normalized === 'admin') {
    return normalized;
  }

  return 'user';
};

const normalizeInboxRole = (value: string): SupportInboxRole => {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'provider' || normalized === 'support') {
    return normalized;
  }

  return 'user';
};

const toSupportResponse = <T>(payload: SupportEnvelope<unknown>, data: T): SupportResponseDto<T> => ({
  statusCode: 'statusCode' in payload ? payload.statusCode : payload.code ?? 200,
  isSuccess: payload.isSuccess ?? payload.success ?? true,
  message: payload.message,
  data,
});

const getSupportEnvelopeData = (payload: SupportEnvelope<unknown>): unknown => {
  if ('data' in payload && payload.data !== undefined) {
    return payload.data;
  }

  if ('generalData' in payload) {
    return payload.generalData;
  }

  const fallbackData = getField(payload, 'data', 'generalData', 'Data', 'GeneralData');
  if (fallbackData !== undefined) {
    return fallbackData;
  }

  return undefined;
};

const mapSupportTicket = (value: unknown): SupportInboxItem => {
  const ticket = asRecord(value);

  return {
    supportChatId: getNumber(ticket, 'supportChatId', 'support_chat_id', 'chatId', 'id'),
    otherPartyId: getNumber(ticket, 'otherPartyId', 'senderId', 'userId', 'providerId'),
    otherPartyRole: normalizeInboxRole(getString(ticket, 'otherPartyRole', 'senderRole', 'partyRole', 'role', 'userType') || 'user'),
    otherPartyName: getString(ticket, 'otherPartyName', 'senderName', 'fullName', 'name', 'userName', 'providerName') || null,
    otherPartyAvatarUrl: getString(ticket, 'otherPartyAvatarUrl', 'avatarUrl', 'imageUrl', 'photoURL', 'logoURL') || null,
    lastMessageText: getString(ticket, 'lastMessageText', 'messageText', 'lastMessage', 'message') || null,
    lastMessageImageUrl: getString(ticket, 'lastMessageImageUrl', 'imageUrl', 'lastImageUrl') || null,
    lastMessageSenderRole: getString(ticket, 'lastMessageSenderRole', 'senderRole') || null,
    lastMessageAt: getString(ticket, 'lastMessageAt', 'createdAt', 'updatedAt', 'messageDate') || null,
    unseenCount: getNumber(ticket, 'unseenCount', 'unReadCount', 'unreadCount', 'unseenMessages'),
  };
};

const mapSupportMessage = (value: unknown, fallbackSupportChatId: number): SupportMessage => {
  const message = asRecord(value);

  return {
    messageId: getNumber(message, 'messageId', 'id'),
    supportChatId: getNumber(message, 'supportChatId', 'support_chat_id', 'chatId') || fallbackSupportChatId,
    senderId: getNumber(message, 'senderId', 'fromId', 'userId'),
    senderRole: normalizeSupportRole(getString(message, 'senderRole', 'fromRole', 'role') || 'user'),
    receiverId: getNumber(message, 'receiverId', 'toId'),
    receiverRole: normalizeSupportRole(getString(message, 'receiverRole', 'toRole') || 'user'),
    messageText: getString(message, 'messageText', 'text', 'message') || null,
    imageUrl: getString(message, 'imageUrl', 'image', 'imagePath', 'attachmentUrl') || null,
    createdAt: getString(message, 'createdAt', 'created_on', 'messageDate', 'sentAt') || new Date(0).toISOString(),
  };
};

const getSupportBasePath = (): string => {
  const usertype = authStore.getState().user?.usertype;
  return usertype === 'support' ? '/api/SupportApp/support' : '/api/AdminApp/support';
};

export const getSupportTickets = async (): Promise<SupportTicketsResponseDto> => {
  const response = await axiosInstance.get<SupportEnvelope<unknown>>(`${getSupportBasePath()}/tickets`);
  const rawData = getSupportEnvelopeData(response.data) ?? [];
  const items = Array.isArray(rawData) ? rawData : getArray(rawData, 'data', 'items', 'list', 'rows', 'tickets', 'chats');

  return toSupportResponse(response.data, items.map(mapSupportTicket));
};

export const getTicketMessages = async (supportChatId: number, page = 1, pageSize = 20): Promise<TicketMessagesResponseDto> => {
  const response = await axiosInstance.get<SupportEnvelope<unknown>>(`${getSupportBasePath()}/tickets/${supportChatId}`, {
    params: { page, pageSize },
  });
  const rawPayload = getSupportEnvelopeData(response.data) ?? {};
  const payload = asRecord(rawPayload);
  const rawMessages = Array.isArray(rawPayload) ? rawPayload : getArray(payload, 'messages', 'data', 'items', 'list', 'rows');

  return toSupportResponse(response.data, {
    supportChatId: getNumber(payload, 'supportChatId', 'support_chat_id', 'chatId') || supportChatId,
    totalCount: getNumber(payload, 'totalCount', 'total', 'count') || rawMessages.length,
    page: getNumber(payload, 'page', 'currentPage') || page,
    pageSize: getNumber(payload, 'pageSize', 'limit', 'perPage') || pageSize,
    messages: rawMessages.map((message) => mapSupportMessage(message, supportChatId)),
  });
};

export const replyToTicket = async ({ supportChatId, messageText, image }: ReplyTicketPayload): Promise<ReplyTicketResponseDto> => {
  const formData = new FormData();
  if (messageText && messageText.trim().length > 0) {
    formData.append('messageText', messageText.trim());
  }
  if (image) {
    formData.append('image', image);
  }

  const response = await axiosInstance.post<SupportEnvelope<unknown>>(`${getSupportBasePath()}/tickets/${supportChatId}/reply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const rawPayload = getSupportEnvelopeData(response.data) ?? {};

  return toSupportResponse(response.data, mapSupportMessage(rawPayload, supportChatId));
};

export const markTicketAsSeen = async (supportChatId: number): Promise<SeenTicketResponseDto> => {
  const response = await axiosInstance.post<SupportEnvelope<unknown>>(`${getSupportBasePath()}/tickets/${supportChatId}/seen`);
  const rawPayload = getSupportEnvelopeData(response.data);
  const result = typeof rawPayload === 'string' ? rawPayload : getString(rawPayload, 'message', 'result') || response.data.message;

  return toSupportResponse(response.data, result);
};
