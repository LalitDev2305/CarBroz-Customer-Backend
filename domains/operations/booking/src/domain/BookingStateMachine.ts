export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export class BookingStateMachine {
  private static readonly transitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.COMPLETED]: []
  };

  public static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    const allowed = this.transitions[from] || [];
    return allowed.includes(to);
  }

  public static validateTransition(from: BookingStatus, to: BookingStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid Booking status transition from ${from} to ${to}`);
    }
  }
}
