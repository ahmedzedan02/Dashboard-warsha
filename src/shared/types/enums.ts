export const PaymentStatus = {
  Pending: 0,
  Paid: 1,
  Failed: 2,
  Cancelled: 3,
  Expired: 4,
  Refunded: 5,
} as const;

export const OrderStatus = {
  Pending: 0,
  Confirmed: 1,
  InProgress: 2,
  Completed: 3,
  Cancelled: 4,
} as const;

export const SubscriptionStatus = {
  NotSubscribed: 0,
  Subscribed: 1,
} as const;
