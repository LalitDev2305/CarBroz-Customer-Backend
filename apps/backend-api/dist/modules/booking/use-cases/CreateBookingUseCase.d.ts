import { Booking, IAddressRepository, IBookingRepository, ICatalogRepository, ICustomerProfileRepository, IPricingRepository, ITransactionProvider, IVehicleRepository } from '@carbroz/common';
export interface CreateBookingInput {
    customerId: number;
    vehicleId: number;
    addressId: number;
    serviceId: number;
    addonIds?: number[];
    slotStartTime: Date;
    slotEndTime: Date;
}
export declare class CreateBookingUseCase {
    private readonly bookingRepository;
    private readonly vehicleRepository;
    private readonly addressRepository;
    private readonly catalogRepository;
    private readonly pricingRepository;
    private readonly customerRepository;
    private readonly transactionProvider;
    constructor(bookingRepository: IBookingRepository, vehicleRepository: IVehicleRepository, addressRepository: IAddressRepository, catalogRepository: ICatalogRepository, pricingRepository: IPricingRepository, customerRepository: ICustomerProfileRepository, transactionProvider: ITransactionProvider);
    execute(input: CreateBookingInput): Promise<Booking>;
}
