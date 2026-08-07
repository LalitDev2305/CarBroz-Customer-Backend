export class ListNotificationsQueryHandler {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId) {
        return this.notificationRepository.listByRecipientId(userId);
    }
}
//# sourceMappingURL=ListNotificationsQueryHandler.js.map