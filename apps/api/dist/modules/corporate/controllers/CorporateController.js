export class CorporateController {
    async registerAccount(request, reply) {
        try {
            const user = request.user;
            const useCase = request.diScope.resolve('registerAccountUseCase');
            const result = await useCase.execute(request.body, user.id);
            return reply.status(201).send({ success: true, data: result });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async getProfile(request, reply) {
        try {
            const member = request.corporateMember;
            const corporateAccountRepo = request.diScope.resolve('corporateAccountRepo');
            const account = await corporateAccountRepo.findById(member.corporateAccountId);
            if (!account)
                return reply.status(404).send({ success: false, error: { message: 'Account not found' } });
            return reply.send({ success: true, data: account });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async addMember(request, reply) {
        try {
            const user = request.user;
            const member = request.corporateMember;
            const corporateAccountRepo = request.diScope.resolve('corporateAccountRepo');
            const addMemberUseCase = request.diScope.resolve('addMemberUseCase');
            const account = await corporateAccountRepo.findById(member.corporateAccountId);
            const dto = { ...request.body, accountPublicId: account.publicId };
            const result = await addMemberUseCase.execute(dto, user.id);
            return reply.status(201).send({ success: true, data: result });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async listMembers(request, reply) {
        try {
            const member = request.corporateMember;
            const corporateMemberRepo = request.diScope.resolve('corporateMemberRepo');
            const members = await corporateMemberRepo.listByAccountId(member.corporateAccountId);
            return reply.send({ success: true, data: members });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async removeMember(request, reply) {
        try {
            const user = request.user;
            const member = request.corporateMember;
            const corporateAccountRepo = request.diScope.resolve('corporateAccountRepo');
            const removeMemberUseCase = request.diScope.resolve('removeMemberUseCase');
            const account = await corporateAccountRepo.findById(member.corporateAccountId);
            const { memberPublicId } = request.params;
            await removeMemberUseCase.execute({ accountPublicId: account.publicId, memberPublicId }, user.id);
            return reply.send({ success: true, message: 'Member deactivated' });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async enrollFleetVehicle(request, reply) {
        try {
            const user = request.user;
            const member = request.corporateMember;
            const corporateAccountRepo = request.diScope.resolve('corporateAccountRepo');
            const enrollFleetVehicleUseCase = request.diScope.resolve('enrollFleetVehicleUseCase');
            const account = await corporateAccountRepo.findById(member.corporateAccountId);
            const dto = { ...request.body, accountPublicId: account.publicId };
            const result = await enrollFleetVehicleUseCase.execute(dto, user.id);
            return reply.status(201).send({ success: true, data: result });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async listFleetVehicles(request, reply) {
        try {
            const member = request.corporateMember;
            const fleetVehicleRepo = request.diScope.resolve('fleetVehicleRepo');
            const fleet = await fleetVehicleRepo.listByAccountId(member.corporateAccountId);
            return reply.send({ success: true, data: fleet });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async removeFleetVehicle(request, reply) {
        try {
            const user = request.user;
            const member = request.corporateMember;
            const corporateAccountRepo = request.diScope.resolve('corporateAccountRepo');
            const removeFleetVehicleUseCase = request.diScope.resolve('removeFleetVehicleUseCase');
            const account = await corporateAccountRepo.findById(member.corporateAccountId);
            const { fleetVehiclePublicId } = request.params;
            await removeFleetVehicleUseCase.execute({ accountPublicId: account.publicId, fleetVehiclePublicId }, user.id);
            return reply.send({ success: true, message: 'Fleet vehicle deactivated' });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async getCreditLedger(request, reply) {
        try {
            const member = request.corporateMember;
            const creditLedgerRepo = request.diScope.resolve('creditLedgerRepo');
            const entries = await creditLedgerRepo.listByAccountId(member.corporateAccountId);
            return reply.send({ success: true, data: entries });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
    async listInvoices(request, reply) {
        try {
            const member = request.corporateMember;
            const corporateInvoiceRepo = request.diScope.resolve('corporateInvoiceRepo');
            const invoices = await corporateInvoiceRepo.listByAccountId(member.corporateAccountId);
            return reply.send({ success: true, data: invoices });
        }
        catch (err) {
            return reply.status(400).send({ success: false, error: { message: err.message } });
        }
    }
}
//# sourceMappingURL=CorporateController.js.map