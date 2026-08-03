import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSduiScreenUseCase } from './GetSduiScreenUseCase.js';
import { RegisterSduiComponentUseCase } from './RegisterSduiComponentUseCase.js';
import { UpdateSduiScreenLayoutUseCase } from './UpdateSduiScreenLayoutUseCase.js';
import { SduiScreenEntity, SduiComponentRegistryEntity, ForbiddenError, NotFoundError } from '@carbroz/common';
import { ScreenFactory, BaseScreenBuilder, IScreen } from '@carbroz/ui-sdk';

class MockLoginBuilder extends BaseScreenBuilder {
  public readonly screenId = 'auth_login';
  public async build(): Promise<IScreen> {
    return {
      screenId: 'auth_login',
      templateId: 'auth_layout',
      templateType: 'form_template',
      template: { id: 'login_main', type: 'form_template' }
    };
  }
}

describe('SDUI Registry UseCases', () => {
  let repository: any;
  let factory: ScreenFactory;

  beforeEach(() => {
    repository = {
      findPublishedScreen: vi.fn(),
      upsertScreen: vi.fn(),
      registerComponent: vi.fn(),
    };

    factory = new ScreenFactory();
    factory.registerBuilder('auth_login', new MockLoginBuilder());
  });

  describe('GetSduiScreenUseCase', () => {
    it('should return DB screen layout if published layout exists and is valid', async () => {
      const useCase = new GetSduiScreenUseCase(repository, factory);
      const mockDbScreen = new SduiScreenEntity({
        id: 1,
        publicId: 'uuid-1',
        screenId: 'auth_login',
        targetApp: 'CUSTOMER',
        layoutJson: {
          screenId: 'auth_login',
          templateId: 'db_template',
          templateType: 'dynamic_form',
          template: { id: 'main', type: 'dynamic' }
        },
        version: 1,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      repository.findPublishedScreen.mockResolvedValue(mockDbScreen);

      const result = await useCase.execute({ data: { screenId: 'auth_login', targetApp: 'CUSTOMER' } });
      expect(result.templateId).toBe('db_template');
      expect(repository.findPublishedScreen).toHaveBeenCalledWith('auth_login', 'CUSTOMER');
    });

    it('should fall back to ScreenFactory static builder if DB record is absent', async () => {
      const useCase = new GetSduiScreenUseCase(repository, factory);
      repository.findPublishedScreen.mockResolvedValue(null);

      const result = await useCase.execute({ data: { screenId: 'auth_login', targetApp: 'CUSTOMER' } });
      expect(result.screenId).toBe('auth_login');
      expect(result.templateId).toBe('auth_layout');
    });

    it('should throw NotFoundError if screen does not exist in DB or static factory', async () => {
      const useCase = new GetSduiScreenUseCase(repository, factory);
      repository.findPublishedScreen.mockResolvedValue(null);

      await expect(useCase.execute({ data: { screenId: 'non_existent', targetApp: 'CUSTOMER' } }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('RegisterSduiComponentUseCase', () => {
    it('should allow admin to register component', async () => {
      const useCase = new RegisterSduiComponentUseCase(repository);
      const mockComponent = new SduiComponentRegistryEntity({
        id: 10,
        publicId: 'uuid-10',
        name: 'banner_component',
        componentType: 'banner',
        schemaJson: { properties: ['imageUrl'] },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      repository.registerComponent.mockResolvedValue(mockComponent);

      const result = await useCase.execute({
        context: { authenticatedUser: { id: 1, isAdmin: true } } as any,
        data: { name: 'banner_component', componentType: 'banner', schemaJson: { properties: ['imageUrl'] } }
      });

      expect(result.name).toBe('banner_component');
      expect(repository.registerComponent).toHaveBeenCalled();
    });

    it('should throw ForbiddenError if user is not admin', async () => {
      const useCase = new RegisterSduiComponentUseCase(repository);

      await expect(useCase.execute({
        context: { authenticatedUser: { id: 2, isAdmin: false } } as any,
        data: { name: 'banner', componentType: 'banner', schemaJson: {} }
      })).rejects.toThrow(ForbiddenError);
    });
  });

  describe('UpdateSduiScreenLayoutUseCase', () => {
    it('should reject invalid SDUI layout JSON contract', async () => {
      const useCase = new UpdateSduiScreenLayoutUseCase(repository);

      await expect(useCase.execute({
        context: { authenticatedUser: { id: 1, isAdmin: true } } as any,
        data: {
          screenId: 'auth_login',
          targetApp: 'CUSTOMER',
          isPublished: true,
          layoutJson: { invalidKey: true } as any
        }
      })).rejects.toThrow();
    });

    it('should save valid SDUI screen layout for admin', async () => {
      const useCase = new UpdateSduiScreenLayoutUseCase(repository);
      const validLayout = {
        screenId: 'auth_login',
        templateId: 'auth_layout',
        templateType: 'form_template',
        template: { id: 'main', type: 'form_template' }
      };

      const mockScreen = new SduiScreenEntity({
        id: 1,
        publicId: 'uuid-1',
        screenId: 'auth_login',
        targetApp: 'CUSTOMER',
        layoutJson: validLayout,
        version: 1,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      repository.upsertScreen.mockResolvedValue(mockScreen);

      const result = await useCase.execute({
        context: { authenticatedUser: { id: 1, isAdmin: true } } as any,
        data: {
          screenId: 'auth_login',
          targetApp: 'CUSTOMER',
          isPublished: true,
          layoutJson: validLayout
        }
      });

      expect(result.screenId).toBe('auth_login');
      expect(repository.upsertScreen).toHaveBeenCalledWith('auth_login', 'CUSTOMER', validLayout, true);
    });
  });
});
