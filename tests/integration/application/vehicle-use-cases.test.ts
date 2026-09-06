import { describe, expect, it, beforeEach } from 'vitest';
import {
  ArchiveVehicleUseCase,
  CreateVehicleUseCase,
  IVehicleRepository,
  ListCustomerVehiclesUseCase,
  SetDefaultVehicleUseCase,
  Vehicle,
} from '@carbroz/domain-customer';

class MemoryVehicleRepository implements IVehicleRepository {
  public items: Vehicle[] = [];
  private nextId = 1;

  async create(vehicle: Vehicle): Promise<Vehicle> {
    vehicle.id = this.nextId++;
    vehicle.publicId = `veh_${vehicle.id}`;
    this.items.push(vehicle);
    return vehicle;
  }

  async findById(id: number): Promise<Vehicle | null> {
    return this.items.find((v) => v.id === id) ?? null;
  }

  async findByPublicId(publicId: string): Promise<Vehicle | null> {
    return this.items.find((v) => v.publicId === publicId) ?? null;
  }

  async findByCustomerAndRegistration(customerId: number, registrationNumber: string): Promise<Vehicle | null> {
    return this.items.find((v) => v.customerId === customerId && v.registrationNumber === registrationNumber.toUpperCase() && !v.deletedAt) ?? null;
  }

  async listByCustomerId(customerId: number): Promise<Vehicle[]> {
    return this.items.filter((v) => v.customerId === customerId && !v.deletedAt);
  }

  async update(vehicle: Vehicle): Promise<Vehicle> {
    const idx = this.items.findIndex((v) => v.id === vehicle.id);
    if (idx !== -1) this.items[idx] = vehicle;
    return vehicle;
  }

  async unsetCustomerDefaultVehicles(customerId: number, excludeVehicleId?: number): Promise<void> {
    this.items.forEach((v) => {
      if (v.customerId === customerId && v.id !== excludeVehicleId) {
        v.isDefault = false;
      }
    });
  }

  async softDelete(id: number): Promise<void> {
    const v = await this.findById(id);
    if (v) v.archive();
  }
}

describe('Vehicle Use Cases', () => {
  let repo: MemoryVehicleRepository;
  let createUseCase: CreateVehicleUseCase;
  let listUseCase: ListCustomerVehiclesUseCase;
  let setDefaultUseCase: SetDefaultVehicleUseCase;
  let archiveUseCase: ArchiveVehicleUseCase;

  beforeEach(() => {
    repo = new MemoryVehicleRepository();
    createUseCase = new CreateVehicleUseCase(repo);
    listUseCase = new ListCustomerVehiclesUseCase(repo);
    setDefaultUseCase = new SetDefaultVehicleUseCase(repo);
    archiveUseCase = new ArchiveVehicleUseCase(repo);
  });

  it('should create vehicle and set as default if requested', async () => {
    const v1 = await createUseCase.execute({
      customerId: 1,
      make: 'Toyota',
      model: 'Fortuner',
      year: 2023,
      registrationNumber: 'KA05MN1234',
      fuelType: 'DIESEL',
      isDefault: true,
    });

    expect(v1.isDefault).toBe(true);

    const v2 = await createUseCase.execute({
      customerId: 1,
      make: 'Honda',
      model: 'City',
      year: 2022,
      registrationNumber: 'KA05MN5678',
      fuelType: 'PETROL',
      isDefault: true,
    });

    expect(v2.isDefault).toBe(true);
    expect((await repo.findById(v1.id!))?.isDefault).toBe(false);
  });

  it('should reject duplicate registration number for same customer', async () => {
    await createUseCase.execute({
      customerId: 1,
      make: 'Toyota',
      model: 'Fortuner',
      year: 2023,
      registrationNumber: 'KA05MN1234',
      fuelType: 'DIESEL',
    });

    await expect(
      createUseCase.execute({
        customerId: 1,
        make: 'Toyota',
        model: 'Fortuner',
        year: 2023,
        registrationNumber: 'KA05MN1234',
        fuelType: 'DIESEL',
      }),
    ).rejects.toThrow();
  });

  it('should archive vehicle', async () => {
    const v = await createUseCase.execute({
      customerId: 1,
      make: 'Toyota',
      model: 'Fortuner',
      year: 2023,
      registrationNumber: 'KA05MN1234',
      fuelType: 'DIESEL',
    });

    await archiveUseCase.execute(v.publicId!, 1);
    const list = await listUseCase.execute(1);
    expect(list.length).toBe(0);
  });
});
