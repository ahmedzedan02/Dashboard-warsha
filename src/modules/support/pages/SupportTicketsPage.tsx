import { useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { useCustomerDetailsQuery } from '@/modules/customers/hooks/useCustomersQuery';
import { useOrderDetailsQuery, useOrdersQuery } from '@/modules/orders/hooks/useOrdersQuery';
import { usePaymentsQuery } from '@/modules/payments/hooks/usePaymentsQuery';
import { useProviderDetailsQuery } from '@/modules/providers/hooks/useProvidersQuery';
import type { CustomerDetails } from '@/modules/customers/types/customers';
import type { OrderRecord } from '@/modules/orders/types/orders';
import type { PaymentRecord } from '@/modules/payments/types/payments';
import type { ProviderDetails } from '@/modules/providers/types/providers';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { useMarkTicketSeenMutation, useReplyTicketMutation, useSupportMessagesQuery, useSupportTicketsQuery } from '@/modules/support/hooks/useSupportTicketsQuery';
import type { SupportInboxItem, SupportMessage } from '@/modules/support/types/support';
import { toAbsoluteAssetUrl } from '@/shared/utils/asset';


const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const getInboxRoleVariant = (role: SupportInboxItem['otherPartyRole']) => {
  if (role === 'provider') {
    return 'info';
  }

  if (role === 'support') {
    return 'warning';
  }

  return 'muted';
};

const getStatusVariant = (status?: string | null) => {
  const normalized = (status ?? '').trim().toLowerCase();

  if (['completed', 'paid', 'active', 'verified', 'subscribed'].includes(normalized)) {
    return 'success' as const;
  }

  if (['pending', 'inprogress', 'in progress', 'processing'].includes(normalized)) {
    return 'warning' as const;
  }

  if (['cancelled', 'canceled', 'failed', 'inactive', 'rejected'].includes(normalized)) {
    return 'danger' as const;
  }

  return 'muted' as const;
};

const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex items-start justify-between gap-3 text-sm">
    <span className="text-brand-light">{label}</span>
    <span className="text-right text-brand-darker">{value || '--'}</span>
  </div>
);

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-muted bg-white p-4">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-dark">{title}</h3>
    <div className="mt-3 space-y-3">{children}</div>
  </section>
);

const DetailLoading = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, index) => (
      <LoadingSkeleton key={index} />
    ))}
  </div>
);

const OrdersList = ({ orders }: { orders: OrderRecord[] }) => (
  <div className="space-y-3">
    {orders.map((order) => (
      <article className="rounded-xl border border-muted p-3" key={order.id}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-brand-darker">{order.orderNumber || `Order #${order.id}`}</p>
            <p className="text-xs text-brand-light">{formatDate(order.createdAt, 'dd MMM yyyy p')}</p>
          </div>
          <Badge variant={getStatusVariant(order.status)}>{order.status || 'Unknown'}</Badge>
        </div>
        <div className="mt-3 space-y-2">
          <InfoRow label="Customer" value={order.customerName} />
          <InfoRow label="Provider" value={order.providerName} />
          <InfoRow label="Amount" value={formatCurrency(order.amount, 'QAR')} />
        </div>
      </article>
    ))}
  </div>
);

const PaymentsList = ({ payments }: { payments: PaymentRecord[] }) => (
  <div className="space-y-3">
    {payments.map((payment) => (
      <article className="rounded-xl border border-muted p-3" key={payment.id}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-brand-darker">{formatCurrency(payment.amount, payment.currency)}</p>
            <p className="text-xs text-brand-light">{formatDate(payment.createdAt, 'dd MMM yyyy p')}</p>
          </div>
          <Badge variant={getStatusVariant(payment.status)}>{payment.status || 'Unknown'}</Badge>
        </div>
        <div className="mt-3 space-y-2">
          <InfoRow label="Provider" value={payment.providerName} />
          <InfoRow label="Request Ref" value={payment.requestRef} />
          <InfoRow label="Transaction" value={payment.transactionRef} />
        </div>
      </article>
    ))}
  </div>
);

export const SupportTicketsPage = () => {

  const ticketsQuery = useSupportTicketsQuery();
  const tickets = ticketsQuery.data?.data ?? [];
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localMessages, setLocalMessages] = useState<SupportMessage[]>([]);
  const lastSeenMarkerRef = useRef<string>('');
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const selectedTicket = useMemo<SupportInboxItem | null>(
    () => tickets.find((ticket) => ticket.supportChatId === selectedTicketId) ?? null,
    [selectedTicketId, tickets],
  );
  const selectedProviderId = selectedTicket?.otherPartyRole === 'provider' ? String(selectedTicket.otherPartyId) : undefined;
  const selectedCustomerId = selectedTicket?.otherPartyRole === 'user' ? String(selectedTicket.otherPartyId) : undefined;
  const orderFilters = useMemo(
    () => ({
      page: 1,
      pageSize: 5,
      providerId: selectedProviderId,
      userId: selectedCustomerId,
    }),
    [selectedCustomerId, selectedProviderId],
  );
  const paymentFilters = useMemo(
    () => ({
      page: 1,
      pageSize: 5,
      providerId: selectedProviderId,
    }),
    [selectedProviderId],
  );
  const messagesQuery = useSupportMessagesQuery(selectedTicket?.supportChatId);
  const providerDetailsQuery = useProviderDetailsQuery(selectedProviderId);
  const customerDetailsQuery = useCustomerDetailsQuery(selectedCustomerId);
  const ordersQuery = useOrdersQuery(orderFilters, Boolean(selectedProviderId || selectedCustomerId));
  const paymentsQuery = usePaymentsQuery(paymentFilters, Boolean(selectedProviderId));
  const replyMutation = useReplyTicketMutation();
  const seenMutation = useMarkTicketSeenMutation();

  useEffect(() => {
    if (!selectedTicketId && tickets[0]) {
      setSelectedTicketId(tickets[0].supportChatId);
      return;
    }

    if (selectedTicketId && !tickets.some((ticket) => ticket.supportChatId === selectedTicketId) && tickets[0]) {
      setSelectedTicketId(tickets[0].supportChatId);
    }
  }, [selectedTicketId, tickets]);

  useEffect(() => {
    setLocalMessages(messagesQuery.data?.data.messages ?? []);
  }, [messagesQuery.data?.data.messages, selectedTicket?.supportChatId]);

  useEffect(() => {
    const latestMessageId = (messagesQuery.data?.data.messages ?? []).at(-1)?.messageId ?? 0;

    if (!selectedTicket || !messagesQuery.isSuccess || selectedTicket.unseenCount < 1 || latestMessageId < 1) {
      return;
    }

    const marker = `${selectedTicket.supportChatId}:${latestMessageId}`;
    if (lastSeenMarkerRef.current === marker) {
      return;
    }

    lastSeenMarkerRef.current = marker;
    seenMutation.mutate(selectedTicket.supportChatId, {
      onError: () => {
        if (lastSeenMarkerRef.current === marker) {
          lastSeenMarkerRef.current = '';
        }
      },
    });
  }, [messagesQuery.data?.data.messages, messagesQuery.isSuccess, seenMutation, selectedTicket]);

  const messages = useMemo(
    () => [...localMessages].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()),
    [localMessages],
  );

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, selectedTicket?.supportChatId]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldStickToBottomRef.current = distanceFromBottom < 80;
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedTicket?.supportChatId]);

  const canSend = Boolean(selectedTicket) && (message.trim().length > 0 || selectedFile);
  const isInboxLoading = ticketsQuery.isLoading;
  const isThreadLoading = messagesQuery.isLoading;
  const inboxError = ticketsQuery.isError ? ticketsQuery.error : null;
  const threadError = messagesQuery.isError ? messagesQuery.error : null;
  const providerDetails = providerDetailsQuery.data?.data as ProviderDetails | undefined;
  const customerDetails = customerDetailsQuery.data?.data as CustomerDetails | undefined;
  const recentOrders = ordersQuery.data?.data?.data ?? [];
  const recentPayments = paymentsQuery.data?.data?.data ?? [];

  return (
    <div>
      <PageHeader breadcrumb={[{ label: 'Home' }, { label: 'Support Tickets' }]} title="Support Tickets" />
      <div className="grid gap-6 xl:h-[calc(100vh-12rem)] xl:grid-cols-[360px,minmax(0,1fr),340px]">
        <div className="card-surface flex min-h-0 flex-col overflow-hidden">
          <div className="border-b border-muted px-4 py-4">
            <h2 className="text-lg">Inbox</h2>
            <p className="text-sm text-brand-light">Open support conversations</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isInboxLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))}
            </div>
          ) : inboxError ? (
            <ErrorState title="Failed to load tickets" message={inboxError.message} />
          ) : tickets.length === 0 ? (
            <EmptyState title="No open tickets" description="The support inbox is currently empty." />
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <button
                  className={`w-full rounded-2xl border p-4 text-left ${selectedTicketId === ticket.supportChatId ? 'border-brand bg-brand-lighter' : 'border-muted bg-white'}`}
                  key={ticket.supportChatId}
                  onClick={() => setSelectedTicketId(ticket.supportChatId)}
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    {ticket.otherPartyAvatarUrl ? (
                      <img
                        alt={ticket.otherPartyName ?? 'Customer'}
                        className="h-10 w-10 rounded-full object-cover"
                        src={toAbsoluteAssetUrl(ticket.otherPartyAvatarUrl)}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                        {(ticket.otherPartyName ?? '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{ticket.otherPartyName ?? 'Unknown'}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant={getInboxRoleVariant(ticket.otherPartyRole)}>{ticket.otherPartyRole}</Badge>
                            {ticket.unseenCount > 0 ? <span className="rounded-full bg-brand px-2 py-1 text-xs text-white">{ticket.unseenCount}</span> : null}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-brand-light">{formatDate(ticket.lastMessageAt, 'dd MMM yyyy p')}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-brand-light">
                        {ticket.lastMessageText ?? (ticket.lastMessageImageUrl ? 'Image attachment' : 'No messages yet')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
        <div className="card-surface flex h-[calc(100vh-12rem)] min-h-[640px] min-w-0 flex-col overflow-hidden">
          <div className="border-b border-muted px-5 py-4">
            {selectedTicket ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg">{selectedTicket.otherPartyName ?? 'Unknown'}</h2>
                  <p className="text-sm text-brand-light">Ticket #{selectedTicket.supportChatId}</p>
                </div>
                <Badge variant={getInboxRoleVariant(selectedTicket.otherPartyRole)}>{selectedTicket.otherPartyRole}</Badge>
              </div>
            ) : (
              <>
                <h2 className="text-lg">Select a ticket</h2>
                <p className="text-sm text-brand-light">Choose a conversation from the inbox.</p>
              </>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5" ref={messagesContainerRef}>
            <div className="space-y-4">
            {!selectedTicket ? (
              <EmptyState title="No ticket selected" description="Select a support ticket to open the conversation thread." />
            ) : isThreadLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <LoadingSkeleton key={index} />
                ))}
              </div>
            ) : threadError ? (
              <ErrorState title="Failed to load messages" message={threadError.message} />
            ) : messages.length === 0 ? (
              <EmptyState title="No messages yet" description="This ticket has no messages yet." />
            ) : (
              messages.map((item) => {
                const isOwnMessage = item.senderRole === 'support' || item.senderRole === 'admin';

                return (
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`} key={`${item.messageId}-${item.createdAt}`}>
                    <ChatMessageBubble
                      attachmentUrl={item.imageUrl}
                      createdAt={item.createdAt}
                      isOwnMessage={isOwnMessage}
                      message={item.messageText}
                    />
                  </div>
                );
              })
            )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <form
            className="border-t border-muted p-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const trimmedMessage = message.trim();

              if (!selectedTicket || (!trimmedMessage && !selectedFile)) {
                return;
              }

              if (selectedFile && !ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
                return;
              }

              const response = await replyMutation.mutateAsync({
                supportChatId: selectedTicket.supportChatId,
                messageText: trimmedMessage || undefined,
                image: selectedFile,
              });

              if (response.isSuccess) {
                setLocalMessages((current) => [...current, response.data]);
              }

              setMessage('');
              setSelectedFile(null);
            }}
          >
            <div className="flex gap-3">
              <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-muted bg-white">
                <Paperclip className="h-4 w-4" />
                <input
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  type="file"
                />
              </label>
              <Input disabled={!selectedTicket || replyMutation.isPending} onChange={(event) => setMessage(event.target.value)} placeholder="Type your reply..." value={message} />
              <Button disabled={replyMutation.isPending || !canSend} size="icon" type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {selectedFile ? <p className="mt-2 text-xs text-brand-light">Attached: {selectedFile.name}</p> : null}
          </form>
        </div>
        <div className="card-surface flex min-h-0 flex-col overflow-hidden">
          <div className="border-b border-muted px-4 py-4">
            <h2 className="text-lg">Conversation Details</h2>
            <p className="text-sm text-brand-light">Provider, customer, order, and payment context.</p>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            {!selectedTicket ? (
              <EmptyState title="No conversation selected" description="Select a ticket to load related details." />
            ) : (
              <>
                <SectionCard title="Provider">
                  {selectedTicket.otherPartyRole !== 'provider' ? (
                    <p className="text-sm text-brand-light">This conversation is not linked to a provider profile.</p>
                  ) : providerDetailsQuery.isLoading ? (
                    <DetailLoading />
                  ) : providerDetailsQuery.isError ? (
                    <p className="text-sm text-red-600">{providerDetailsQuery.error.message}</p>
                  ) : providerDetails ? (
                    <>
                      <InfoRow label="Name" value={providerDetails.providerName} />
                      <InfoRow label="Email" value={providerDetails.email} />
                      <InfoRow label="Mobile" value={providerDetails.mobileNo} />
                      <InfoRow label="WhatsApp" value={providerDetails.whatsapp} />
                      <InfoRow label="Country" value={providerDetails.countryName} />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-brand-light">Status</span>
                        <Badge variant={providerDetails.isActive ? 'success' : 'danger'}>{providerDetails.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-brand-light">Paper</span>
                        <Badge variant={providerDetails.isPaperOk ? 'success' : 'warning'}>{providerDetails.isPaperOk ? 'Verified' : 'Pending'}</Badge>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-brand-light">Provider details are not available.</p>
                  )}
                </SectionCard>

                <SectionCard title="Customer">
                  {selectedTicket.otherPartyRole !== 'user' ? (
                    <p className="text-sm text-brand-light">This conversation is not linked to a customer profile.</p>
                  ) : customerDetailsQuery.isLoading ? (
                    <DetailLoading />
                  ) : customerDetailsQuery.isError ? (
                    <p className="text-sm text-red-600">{customerDetailsQuery.error.message}</p>
                  ) : customerDetails ? (
                    <>
                      <InfoRow label="Name" value={customerDetails.fullName} />
                      <InfoRow label="Email" value={customerDetails.email} />
                      <InfoRow label="Mobile" value={customerDetails.mobileNo} />
                      <InfoRow label="WhatsApp" value={customerDetails.whatsapp} />
                      <InfoRow label="Country" value={customerDetails.country} />
                      <InfoRow label="Address" value={customerDetails.address} />
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-brand-light">Status</span>
                        <Badge variant={customerDetails.isActive ? 'success' : 'danger'}>{customerDetails.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-brand-light">Customer details are not available.</p>
                  )}
                </SectionCard>

                <SectionCard title="Orders">
                  {ordersQuery.isLoading ? (
                    <DetailLoading />
                  ) : ordersQuery.isError ? (
                    <p className="text-sm text-red-600">{ordersQuery.error.message}</p>
                  ) : recentOrders.length > 0 ? (
                    <OrdersList orders={recentOrders} />
                  ) : (
                    <p className="text-sm text-brand-light">No related orders were found for this conversation.</p>
                  )}
                </SectionCard>

                <SectionCard title="Payments">
                  {selectedTicket.otherPartyRole !== 'provider' ? (
                    <p className="text-sm text-brand-light">Payments are available only for provider conversations.</p>
                  ) : paymentsQuery.isLoading ? (
                    <DetailLoading />
                  ) : paymentsQuery.isError ? (
                    <p className="text-sm text-red-600">{paymentsQuery.error.message}</p>
                  ) : recentPayments.length > 0 ? (
                    <PaymentsList payments={recentPayments} />
                  ) : (
                    <p className="text-sm text-brand-light">No related payments were found for this provider.</p>
                  )}
                </SectionCard>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SupportTicketsPage.displayName = 'SupportTicketsPage';
