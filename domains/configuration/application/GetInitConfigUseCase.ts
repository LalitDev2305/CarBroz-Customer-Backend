import { type IUseCase } from '@carbroz/foundation-kernel';
import { type IFeatureFlagRepository } from '../domain/repositories/IFeatureFlagRepository.js';

export interface GetInitConfigInput {
  appVersion?: string;
  platform?: 'IOS' | 'ANDROID';
}

export interface InitConfigResponse {
  maintenanceMode: boolean;
  minSupportedVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  features: Record<string, boolean>;
  contentVersions: Record<string, string>;
}

export class GetInitConfigUseCase implements IUseCase<GetInitConfigInput, InitConfigResponse> {
  constructor(private readonly featureFlagRepository: IFeatureFlagRepository) {}

  async execute(_request: GetInitConfigInput): Promise<InitConfigResponse> {
    const flags = await this.featureFlagRepository.findAll();
    const features = flags.reduce((acc, flag) => {
      acc[flag.key] = flag.enabled;
      return acc;
    }, {} as Record<string, boolean>);

    return {
      maintenanceMode: features['maintenance_mode'] ?? false,
      minSupportedVersion: '1.0.0',
      latestVersion: '1.0.0',
      forceUpdate: false,
      features,
      contentVersions: {
        sdui: 'v1',
        catalog: 'v1',
      },
    };
  }
}
