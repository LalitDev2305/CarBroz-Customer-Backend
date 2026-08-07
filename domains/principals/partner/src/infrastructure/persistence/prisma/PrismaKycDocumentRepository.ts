import { PrismaProvider } from '@carbroz/platform-database';
import { KycDocument } from '../../../domain/entities/KycDocument.js';
import { KycDocumentStatus } from '../../../domain/enums/KycDocumentStatus.js';
import { KycDocumentType } from '../../../domain/enums/KycDocumentType.js';

export class PrismaKycDocumentRepository {
  private unitOfWorkPrisma: any = null;

  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get client() {
    return this.unitOfWorkPrisma || this.prismaProvider.getClient();
  }


  private mapToDomain(entity: any): KycDocument {
    return {
      id: entity.id,
      publicId: entity.publicId,
      partnerId: entity.partnerId,
      type: entity.type as KycDocumentType,
      fileUrl: entity.fileUrl,
      status: entity.status as KycDocumentStatus,
      rejectionReason: entity.rejectionReason,
      uploadedById: entity.uploadedById,
      verifiedById: entity.verifiedById,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async findById(id: number): Promise<KycDocument | null> {
    const entity = await this.client.kycDocument.findUnique({ where: { id } });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByPartnerId(partnerId: number): Promise<KycDocument[]> {
    const entities = await this.client.kycDocument.findMany({ where: { partnerId } });
    return entities.map((e: any) => this.mapToDomain(e));
  }

  async findByPartnerIdAndStatus(partnerId: number, status: KycDocumentStatus): Promise<KycDocument[]> {
    const entities = await this.client.kycDocument.findMany({ where: { partnerId, status } });
    return entities.map((e: any) => this.mapToDomain(e));
  }


  async create(document: Omit<KycDocument, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<KycDocument> {
    const entity = await this.client.kycDocument.create({
      data: {
        partnerId: document.partnerId,
        type: document.type,
        fileUrl: document.fileUrl,
        status: document.status,
        rejectionReason: document.rejectionReason,
        uploadedById: document.uploadedById,
        verifiedById: document.verifiedById,
      },
    });
    return this.mapToDomain(entity);
  }

  async update(id: number, data: Partial<KycDocument>): Promise<KycDocument> {
    const entity = await this.client.kycDocument.update({
      where: { id },
      data: {
        type: data.type,
        fileUrl: data.fileUrl,
        status: data.status,
        rejectionReason: data.rejectionReason,
        uploadedById: data.uploadedById,
        verifiedById: data.verifiedById,
      },
    });
    return this.mapToDomain(entity);
  }

  async updateStatus(id: number, status: KycDocumentStatus, verifiedById: number, rejectionReason?: string | null): Promise<KycDocument> {
    const entity = await this.client.kycDocument.update({
      where: { id },
      data: {
        status,
        verifiedById,
        rejectionReason,
      },
    });
    return this.mapToDomain(entity);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.client.kycDocument.delete({ where: { id } });
      return true;
    } catch (e: any) {
      if (e.code === 'P2025') return false;
      throw e;
    }
  }

  async findAll(): Promise<KycDocument[]> {
    const entities = await this.client.kycDocument.findMany();
    return entities.map((e: any) => this.mapToDomain(e));
  }


  async save(entity: KycDocument): Promise<KycDocument> {
    return this.update(entity.id, entity);
  }
}
