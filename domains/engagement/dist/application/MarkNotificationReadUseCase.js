export class MarkNotificationReadUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(notificationId) {
        const log = await this.notificationRepository.findById(notificationId);
        if (!log) {
            throw new Error(`Notification log with ID ${notificationId} not found`);
        }
        log.status = 'READ';
        return log;
    }
}
//# sourceMappingURL=MarkNotificationReadUseCase.js.map