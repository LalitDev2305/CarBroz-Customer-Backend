export class ListNotificationHistoryUseCase {
    notificationLogRepository;
    constructor(notificationLogRepository) {
        this.notificationLogRepository = notificationLogRepository;
    }
    async execute(input) {
        return await this.notificationLogRepository.listByRecipientId(input.recipientId, input.limit ?? 50, input.offset ?? 0);
    }
}
//# sourceMappingURL=ListNotificationHistoryUseCase.js.map