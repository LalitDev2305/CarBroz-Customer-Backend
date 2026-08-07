import { PrismaProvider } from '@carbroz/platform-database';
import { TrackingSession } from '../../domain/TrackingSession.js';
import { TrackingStatus } from '../../domain/TrackingStatus.js';

export class PrismaTrackingSessionRepository {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  private get prisma() {
    return this.prismaProvider.getClient();
  }


  private mapToDomain(record: any): TrackingSession {
    return new TrackingSession({
      id: record.id,
      publicId: record.publicId,
      bookingId: record.bookingId,
      partnerId: record.partnerId,
      customerId: record.customerId,
      currentLatitude: record.currentLatitude,
      currentLongitude: record.currentLongitude,
      heading: record.heading,
      speed: record.speed,
      etaMinutes: record.etaMinutes,
      status: record.status as TrackingStatus,
      startedAt: record.startedAt,
      endedAt: record.endedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(session: TrackingSession): Promise<TrackingSession> {
    const record = await this.prisma.trackingSession.create({
      data: {
        bookingId: session.bookingId,
        partnerId: session.partnerId,
        customerId: session.customerId,
        currentLatitude: session.currentLatitude,
        currentLongitude: session.currentLongitude,
        heading: session.heading,
        speed: session.speed,
        etaMinutes: session.etaMinutes,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
      },
    });
    return this.mapToDomain(record);
  }

  async findById(id: number): Promise<TrackingSession | null> {
    const record = await this.prisma.trackingSession.findUnique({ where: { id } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByPublicId(publicId: string): Promise<TrackingSession | null> {
    const record = await this.prisma.trackingSession.findUnique({ where: { publicId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findByBookingId(bookingId: number): Promise<TrackingSession | null> {
    const record = await this.prisma.trackingSession.findUnique({ where: { bookingId } });
    return record ? this.mapToDomain(record) : null;
  }

  async findActiveByPartnerId(partnerId: number): Promise<TrackingSession | null> {
    const record = await this.prisma.trackingSession.findFirst({
      where: { partnerId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.mapToDomain(record) : null;
  }

  async update(session: TrackingSession): Promise<TrackingSession> {
    const record = await this.prisma.trackingSession.update({
      where: { id: session.id },
      data: {
        currentLatitude: session.currentLatitude,
        currentLongitude: session.currentLongitude,
        heading: session.heading,
        speed: session.speed,
        etaMinutes: session.etaMinutes,
        status: session.status,
        endedAt: session.endedAt,
      },
    });
    return this.mapToDomain(record);
  }
}
