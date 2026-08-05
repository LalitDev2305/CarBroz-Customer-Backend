export class GetInvoiceUseCase {
    invoiceRepository;
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    async execute(publicId) {
        const invoice = await this.invoiceRepository.findByPublicId(publicId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        return invoice;
    }
}
//# sourceMappingURL=GetInvoiceUseCase.js.map