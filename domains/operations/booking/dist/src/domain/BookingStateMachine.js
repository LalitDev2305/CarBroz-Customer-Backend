export var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["COMPLETED"] = "COMPLETED";
})(BookingStatus || (BookingStatus = {}));
export class BookingStateMachine {
    static transitions = {
        [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
        [BookingStatus.CANCELLED]: [],
        [BookingStatus.COMPLETED]: []
    };
    static canTransition(from, to) {
        const allowed = this.transitions[from] || [];
        return allowed.includes(to);
    }
    static validateTransition(from, to) {
        if (!this.canTransition(from, to)) {
            throw new Error(`Invalid Booking status transition from ${from} to ${to}`);
        }
    }
}
//# sourceMappingURL=BookingStateMachine.js.map