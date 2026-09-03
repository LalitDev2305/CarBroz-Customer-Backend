import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterCorporateAccountUseCase } from '@carbroz/domain-enterprise';
import { AddCorporateMemberUseCase } from '@carbroz/domain-enterprise';
import { RemoveCorporateMemberUseCase } from '@carbroz/domain-enterprise';
import { EnrollFleetVehicleUseCase } from '@carbroz/domain-enterprise';
import { RemoveFleetVehicleUseCase } from '@carbroz/domain-enterprise';

export class CorporateController {
  async registerAccount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const useCase = (request as any).diScope.resolve('registerAccountUseCase') as RegisterCorporateAccountUseCase;
      const result = await useCase.execute(request.body as any, user.id);
      return reply.status(201).send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const member = (request as any).corporateMember;
      const corporateAccountRepo = (request as any).diScope.resolve('corporateAccountRepo');
      const account = await corporateAccountRepo.findById(member.corporateAccountId);
      if (!account) return reply.status(404).send({ success: false, error: { message: 'Account not found' } });
      return reply.send({ success: true, data: account });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async addMember(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const member = (request as any).corporateMember;
      const corporateAccountRepo = (request as any).diScope.resolve('corporateAccountRepo');
      const addMemberUseCase = (request as any).diScope.resolve('addMemberUseCase') as AddCorporateMemberUseCase;
      const account = await corporateAccountRepo.findById(member.corporateAccountId);
      const dto = { ...(request.body as any), accountPublicId: account!.publicId };
      const result = await addMemberUseCase.execute(dto, user.id);
      return reply.status(201).send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async listMembers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const member = (request as any).corporateMember;
      const corporateMemberRepo = (request as any).diScope.resolve('corporateMemberRepo');
      const members = await corporateMemberRepo.listByAccountId(member.corporateAccountId);
      return reply.send({ success: true, data: members });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async removeMember(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const member = (request as any).corporateMember;
      const corporateAccountRepo = (request as any).diScope.resolve('corporateAccountRepo');
      const removeMemberUseCase = (request as any).diScope.resolve('removeMemberUseCase') as RemoveCorporateMemberUseCase;
      const account = await corporateAccountRepo.findById(member.corporateAccountId);
      const { memberPublicId } = request.params as any;
      await removeMemberUseCase.execute({ accountPublicId: account!.publicId!, memberPublicId }, user.id);
      return reply.send({ success: true, message: 'Member deactivated' });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async enrollFleetVehicle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const member = (request as any).corporateMember;
      const corporateAccountRepo = (request as any).diScope.resolve('corporateAccountRepo');
      const enrollFleetVehicleUseCase = (request as any).diScope.resolve('enrollFleetVehicleUseCase') as EnrollFleetVehicleUseCase;
      const account = await corporateAccountRepo.findById(member.corporateAccountId);
      const dto = { ...(request.body as any), accountPublicId: account!.publicId };
      const result = await enrollFleetVehicleUseCase.execute(dto, user.id);
      return reply.status(201).send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async listFleetVehicles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const member = (request as any).corporateMember;
      const fleetVehicleRepo = (request as any).diScope.resolve('fleetVehicleRepo');
      const fleet = await fleetVehicleRepo.listByAccountId(member.corporateAccountId);
      return reply.send({ success: true, data: fleet });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async removeFleetVehicle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const member = (request as any).corporateMember;
      const corporateAccountRepo = (request as any).diScope.resolve('corporateAccountRepo');
      const removeFleetVehicleUseCase = (request as any).diScope.resolve('removeFleetVehicleUseCase') as RemoveFleetVehicleUseCase;
      const account = await corporateAccountRepo.findById(member.corporateAccountId);
      const { fleetVehiclePublicId } = request.params as any;
      await removeFleetVehicleUseCase.execute({ accountPublicId: account!.publicId!, fleetVehiclePublicId }, user.id);
      return reply.send({ success: true, message: 'Fleet vehicle deactivated' });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async getCreditLedger(request: FastifyRequest, reply: FastifyReply) {
    try {
      const member = (request as any).corporateMember;
      const creditLedgerRepo = (request as any).diScope.resolve('creditLedgerRepo');
      const entries = await creditLedgerRepo.listByAccountId(member.corporateAccountId);
      return reply.send({ success: true, data: entries });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }

  async listInvoices(request: FastifyRequest, reply: FastifyReply) {
    try {
      const member = (request as any).corporateMember;
      const corporateInvoiceRepo = (request as any).diScope.resolve('corporateInvoiceRepo');
      const invoices = await corporateInvoiceRepo.listByAccountId(member.corporateAccountId);
      return reply.send({ success: true, data: invoices });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: { message: err.message } });
    }
  }
}
