import { asFunction, type AwilixContainer } from 'awilix';
import type { ICustomerProfileRepository } from '@carbroz/domain-customer';
import { BookingAccessPolicy, type IBookingPartnerMembershipLookup } from './application/security/BookingAccessPolicy.js';
import type { IBookingRepository } from './domain/repositories/IBookingRepository.js';
import type { BookingPersistenceClient } from './infrastructure/persistence/BookingPersistenceClient.js';
import { PrismaBookingRepository } from './infrastructure/repositories/PrismaBookingRepository.js';

interface PrismaProviderPort {
  getClient(): BookingPersistenceClient;
}

interface BookingCradle {
  prismaProvider: PrismaProviderPort;
  bookingRepository: IBookingRepository;
  customerProfileRepository: ICustomerProfileRepository;
  partnerMemberRepository: IBookingPartnerMembershipLookup;
}

/** registerBookingModule is an exported domains/booking contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerBookingModule(container: AwilixContainer): void {
  container.register({
    bookingRepository: asFunction(
      (cradle: BookingCradle) => new PrismaBookingRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    bookingAccessPolicy: asFunction(
      (cradle: BookingCradle) => new BookingAccessPolicy(
        cradle.bookingRepository,
        cradle.customerProfileRepository,
        cradle.partnerMemberRepository,
      ),
    ).singleton(),
  });
}
