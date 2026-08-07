export class ListNotificationsUseCase {
    notificationRepository;
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    async execute(userId) {
        return this.notificationRepository.listByRecipientId(userId);
    }
}
//# sourceMappingURL=ListNotificationsUseCase.js.map