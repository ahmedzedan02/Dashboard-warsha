import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { queryClient } from '@/shared/lib/queryClient';
import { getSupportTickets, getTicketMessages, markTicketAsSeen, replyToTicket } from '@/modules/support/api/supportApi';
import type { ApiError } from '@/shared/types/common';
import type { ReplyTicketPayload, SupportInboxItem, TicketMessagesResponseDto } from '@/modules/support/types/support';

export const SUPPORT_TICKETS_QUERY_KEY = ['support', 'tickets'] as const;
export const SUPPORT_MESSAGES_QUERY_KEY = ['support', 'messages'] as const;

export const useSupportTicketsQuery = () =>
  useQuery({
    queryKey: SUPPORT_TICKETS_QUERY_KEY,
    queryFn: getSupportTickets,
    refetchInterval: 30_000,
    select: (response) => ({
      ...response,
      data: [...response.data].sort((left, right) => right.unseenCount - left.unseenCount),
    }),
  });

export const useSupportMessagesQuery = (supportChatId?: number, page = 1, pageSize = 20) =>
  useQuery({
    queryKey: [...SUPPORT_MESSAGES_QUERY_KEY, supportChatId, page, pageSize],
    queryFn: () => getTicketMessages(supportChatId ?? 0, page, Math.min(pageSize, 50)),
    enabled: Boolean(supportChatId),
  });

const updateInboxItem = (
  inbox: SupportInboxItem[] | undefined,
  supportChatId: number,
  updater: (item: SupportInboxItem) => SupportInboxItem,
) => {
  if (!inbox) {
    return inbox;
  }

  return inbox.map((item) => (item.supportChatId === supportChatId ? updater(item) : item));
};

export const useReplyTicketMutation = () =>
  useMutation({
    mutationFn: (payload: ReplyTicketPayload) => replyToTicket(payload),
    onSuccess: (response, variables) => {
      if (!response.isSuccess) {
        toast.error(response.message);
        return;
      }

      queryClient.setQueriesData<TicketMessagesResponseDto>(
        { queryKey: [...SUPPORT_MESSAGES_QUERY_KEY, variables.supportChatId] },
        (current) => {
          if (!current) {
            return current;
          }

          const existingMessages = current.data.messages ?? [];
          const hasMessage = existingMessages.some((message) => message.messageId === response.data.messageId);

          return {
            ...current,
            data: {
              ...current.data,
              totalCount: hasMessage ? current.data.totalCount : current.data.totalCount + 1,
              messages: hasMessage ? existingMessages : [...existingMessages, response.data],
            },
          };
        },
      );

      queryClient.setQueryData(SUPPORT_TICKETS_QUERY_KEY, (current: { data: SupportInboxItem[] } | undefined) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: updateInboxItem(current.data, variables.supportChatId, (item) => ({
            ...item,
            lastMessageText: response.data.messageText,
            lastMessageImageUrl: response.data.imageUrl,
            lastMessageSenderRole: response.data.senderRole,
            lastMessageAt: response.data.createdAt,
          })) ?? current.data,
        };
      });

      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

export const useMarkTicketSeenMutation = () =>
  useMutation({
    mutationFn: (supportChatId: number) => markTicketAsSeen(supportChatId),
    onSuccess: (_, supportChatId) => {
      queryClient.setQueryData(SUPPORT_TICKETS_QUERY_KEY, (current: { data: SupportInboxItem[] } | undefined) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: updateInboxItem(current.data, supportChatId, (item) => ({
            ...item,
            unseenCount: 0,
          })) ?? current.data,
        };
      });

      queryClient.invalidateQueries({ queryKey: [...SUPPORT_MESSAGES_QUERY_KEY, supportChatId] });
      queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_QUERY_KEY });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
