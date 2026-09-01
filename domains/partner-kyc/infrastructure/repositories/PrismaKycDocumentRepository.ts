import type { KycDocument } from '../../domain/KycDocument.js';
import type { KycDocumentStatus } from '../../domain/KycDocumentStatus.js';
import type { KycDocumentType } from '../../domain/KycDocumentType.js';
import type {
  IKycDocumentRepository,
  NewKycDocument,
} from '../../domain/repositories/IKycDocumentRepository.js';
import type {
  KycPersistenceClient,
  KycPersistenceRecord,
} from '../persistence/KycPersistenceClient.js';

export class PrismaKycDocumentRepository implements IKycDocumentRepository {
  constructor(private readonly client: KycPersistenceClient) {}

  private mapToDomain(entity: KycPersistenceRecord): KycDocument {
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
    return entities.map((entity) => this.mapToDomain(entity));
  }

  async findByPartnerIdAndStatus(partnerId: number, status: KycDocumentStatus): Promise<KycDocument[]> {
    const entities = await this.client.kycDocument.findMany({ where: { partnerId, status } });
    return entities.map((entity) => this.mapToDomain(entity));
  }

  async create(document: NewKycDocument): Promise<KycDocument> {
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

  async updateStatus(
    id: number,
    status: KycDocumentStatus,
    verifiedById: number,
    rejectionReason?: string | null,
  ): Promise<KycDocument> {
    const entity = await this.client.kycDocument.update({
      where: { id },
      data: { status, verifiedById, rejectionReason },
    });
    return this.mapToDomain(entity);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.client.kycDocument.delete({ where: { id } });
      return true;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  async findAll(): Promise<KycDocument[]> {
    const entities = await this.client.kycDocument.findMany();
    return entities.map((entity) => this.mapToDomain(entity));
  }

  async save(document: KycDocument): Promise<KycDocument> {
    return this.update(document.id, document);
  }
}
