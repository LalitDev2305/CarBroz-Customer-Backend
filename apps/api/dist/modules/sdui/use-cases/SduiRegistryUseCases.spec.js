import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSduiScreenUseCase } from './GetSduiScreenUseCase.js';
import { CreateSduiComponentUseCase } from './CreateSduiComponentUseCase.js';
import { CreateSduiSubcomponentUseCase } from './CreateSduiSubcomponentUseCase.js';
import { CreateSduiChildUseCase } from './CreateSduiChildUseCase.js';
import { CreateSduiChildrenDataUseCase } from './CreateSduiChildrenDataUseCase.js';
import { UpdateSduiScreenLayoutUseCase } from './UpdateSduiScreenLayoutUseCase.js';
import { SduiScreenEntity, SduiComponentEntity, SduiSubcomponentEntity, SduiChildEntity, SduiChildrenDataEntity, ForbiddenError, NotFoundError } from '@carbroz/foundation-kernel';
import { ScreenFactory, BaseScreenBuilder } from '@carbroz/sdui-engine';
class MockLoginBuilder extends BaseScreenBuilder {
    screenId = 'auth_login';
    async build() {
        return {
            screenId: 'auth_login',
            templateId: 'auth_layout',
            templateType: 'form_template',
            template: { id: 'login_main', type: 'form_template' }
        };
    }
}
describe('SDUI Registry UseCases', () => {
    let repository;
    let factory;
    beforeEach(() => {
        repository = {
            findPublishedScreen: vi.fn(),
            upsertScreen: vi.fn(),
            createComponent: vi.fn(),
            createSubcomponent: vi.fn(),
            createChild: vi.fn(),
            createChildrenData: vi.fn(),
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
                versionNumber: 1,
                status: 'PUBLISHED',
                lockVersion: 1,
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
    describe('CreateSduiComponentUseCase', () => {
        it('should allow admin to create component', async () => {
            const useCase = new CreateSduiComponentUseCase(repository);
            const mockComponent = new SduiComponentEntity({
                id: 10,
                publicId: 'uuid-10',
                name: 'banner_component',
                componentType: 'banner',
                schemaJson: { properties: ['imageUrl'] },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            repository.createComponent.mockResolvedValue(mockComponent);
            const result = await useCase.execute({
                context: { authenticatedUser: { id: 1, isAdmin: true } },
                data: { name: 'banner_component', componentType: 'banner', schemaJson: { properties: ['imageUrl'] } }
            });
            expect(result.name).toBe('banner_component');
            expect(result.nodeLevel).toBe('COMPONENT');
            expect(repository.createComponent).toHaveBeenCalled();
        });
        it('should throw ForbiddenError if user is not admin', async () => {
            const useCase = new CreateSduiComponentUseCase(repository);
            await expect(useCase.execute({
                context: { authenticatedUser: { id: 2, isAdmin: false } },
                data: { name: 'banner', componentType: 'banner', schemaJson: {} }
            })).rejects.toThrow(ForbiddenError);
        });
    });
    describe('CreateSduiSubcomponentUseCase', () => {
        it('should allow admin to create subcomponent with nodeLevel SUBCOMPONENT', async () => {
            const useCase = new CreateSduiSubcomponentUseCase(repository);
            const mockSubcomponent = new SduiSubcomponentEntity({
                id: 11,
                publicId: 'uuid-11',
                name: 'card_subcomponent',
                componentType: 'card_container',
                schemaJson: {},
                createdAt: new Date(),
                updatedAt: new Date()
            });
            repository.createSubcomponent.mockResolvedValue(mockSubcomponent);
            const result = await useCase.execute({
                context: { authenticatedUser: { id: 1, isAdmin: true } },
                data: { name: 'card_subcomponent', componentType: 'card_container', schemaJson: {} }
            });
            expect(result.name).toBe('card_subcomponent');
            expect(result.nodeLevel).toBe('SUBCOMPONENT');
            expect(repository.createSubcomponent).toHaveBeenCalledWith('card_subcomponent', 'card_container', {}, undefined, undefined);
        });
    });
    describe('CreateSduiChildUseCase', () => {
        it('should allow admin to create child with nodeLevel CHILD', async () => {
            const useCase = new CreateSduiChildUseCase(repository);
            const mockChild = new SduiChildEntity({
                id: 12,
                publicId: 'uuid-12',
                name: 'button_group_child',
                componentType: 'button_group',
                schemaJson: {},
                createdAt: new Date(),
                updatedAt: new Date()
            });
            repository.createChild.mockResolvedValue(mockChild);
            const result = await useCase.execute({
                context: { authenticatedUser: { id: 1, isAdmin: true } },
                data: { name: 'button_group_child', componentType: 'button_group', schemaJson: {} }
            });
            expect(result.name).toBe('button_group_child');
            expect(result.nodeLevel).toBe('CHILD');
            expect(repository.createChild).toHaveBeenCalledWith('button_group_child', 'button_group', {}, undefined, undefined);
        });
    });
    describe('CreateSduiChildrenDataUseCase', () => {
        it('should allow admin to create childrenData with nodeLevel CHILDREN_DATA', async () => {
            const useCase = new CreateSduiChildrenDataUseCase(repository);
            const mockChildrenData = new SduiChildrenDataEntity({
                id: 13,
                publicId: 'uuid-13',
                name: 'primary_action_btn',
                componentType: 'atom_button',
                schemaJson: {},
                createdAt: new Date(),
                updatedAt: new Date()
            });
            repository.createChildrenData.mockResolvedValue(mockChildrenData);
            const result = await useCase.execute({
                context: { authenticatedUser: { id: 1, isAdmin: true } },
                data: { name: 'primary_action_btn', componentType: 'atom_button', schemaJson: {} }
            });
            expect(result.name).toBe('primary_action_btn');
            expect(result.nodeLevel).toBe('CHILDREN_DATA');
            expect(repository.createChildrenData).toHaveBeenCalledWith('primary_action_btn', 'atom_button', {}, undefined, undefined);
        });
    });
    describe('UpdateSduiScreenLayoutUseCase', () => {
        it('should reject invalid SDUI layout JSON contract', async () => {
            const useCase = new UpdateSduiScreenLayoutUseCase(repository);
            await expect(useCase.execute({
                context: { authenticatedUser: { id: 1, isAdmin: true } },
                data: {
                    screenId: 'auth_login',
                    targetApp: 'CUSTOMER',
                    isPublished: true,
                    layoutJson: { invalidKey: true }
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
                versionNumber: 1,
                status: 'PUBLISHED',
                lockVersion: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            repository.upsertScreen.mockResolvedValue(mockScreen);
            const result = await useCase.execute({
                context: { authenticatedUser: { id: 1, isAdmin: true } },
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
//# sourceMappingURL=SduiRegistryUseCases.spec.js.map