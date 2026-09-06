/**
 * Outbound application port invoked after a booking is durably completed.
 *
 * Booking owns the lifecycle fact; downstream bounded contexts decide what
 * effect completion causes. Implementations may trigger financial eligibility,
 * notifications, analytics, or other reactions without leaking those concerns
 * into the Booking application layer.
 */
export interface IBookingCompletionEffect {
  execute(bookingId: number): Promise<unknown>;
}
