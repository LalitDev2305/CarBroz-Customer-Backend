export declare enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
export declare class BookingStateMachine {
    private static readonly transitions;
    static canTransition(from: BookingStatus, to: BookingStatus): boolean;
    static validateTransition(from: BookingStatus, to: BookingStatus): void;
}
