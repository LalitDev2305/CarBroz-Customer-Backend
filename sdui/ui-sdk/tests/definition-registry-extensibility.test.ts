import { describe, expect, it } from 'vitest';
import { DefinitionRegistry } from '../src/registry/DefinitionRegistry.js';

type TestInput = Readonly<{
  id: string;
  payload?: Readonly<Record<string, unknown>>;
}>;

type TestOutput = Readonly<{
  id: string;
  type: string;
  payload: Readonly<Record<string, unknown>>;
}>;

/**
 * Contract tests for the UI SDK's definition-registry extension boundary.
 *
 * @remarks
 * These tests intentionally use an isolated registry rather than the global
 * production registries. They prove the Open/Closed requirement: a brand-new
 * definition can be added by registration without modifying the registry
 * implementation or any existing definition.
 */
describe('DefinitionRegistry extensibility contract', () => {
  it('allows a new definition to be added without modifying existing registry code', () => {
    const registry = new DefinitionRegistry<TestInput, TestOutput>();

    registry.register('existing_element', (input) => ({
      id: input.id,
      type: 'existing_element',
      payload: input.payload ?? {},
    }));

    registry.register('future_element', (input) => ({
      id: input.id,
      type: 'future_element',
      payload: input.payload ?? {},
    }));

    expect(registry.create('existing_element', { id: 'existing' })).toEqual({
      id: 'existing',
      type: 'existing_element',
      payload: {},
    });

    expect(registry.create('future_element', {
      id: 'future',
      payload: { text: 'Added later' },
    })).toEqual({
      id: 'future',
      type: 'future_element',
      payload: { text: 'Added later' },
    });
  });

  it('rejects blank definition types', () => {
    const registry = new DefinitionRegistry<TestInput, TestOutput>();

    expect(() => registry.register('   ', (input) => ({
      id: input.id,
      type: 'invalid',
      payload: {},
    }))).toThrow(/must not be empty/);
  });

  it('rejects duplicate registration instead of silently replacing behavior', () => {
    const registry = new DefinitionRegistry<TestInput, TestOutput>();
    const factory = (input: TestInput): TestOutput => ({
      id: input.id,
      type: 'stable_element',
      payload: input.payload ?? {},
    });

    registry.register('stable_element', factory);

    expect(() => registry.register('stable_element', factory)).toThrow(/already registered/);
  });

  it('fails fast for an unknown definition instead of using a fallback', () => {
    const registry = new DefinitionRegistry<TestInput, TestOutput>();

    expect(() => registry.create('unknown_element', { id: 'unknown' })).toThrow(/not registered/);
  });

  it('returns a detached immutable type snapshot', () => {
    const registry = new DefinitionRegistry<TestInput, TestOutput>();

    registry.register('one', (input) => ({ id: input.id, type: 'one', payload: {} }));
    const types = registry.types();

    expect(types).toEqual(['one']);
    expect(Object.isFrozen(types)).toBe(true);

    registry.register('two', (input) => ({ id: input.id, type: 'two', payload: {} }));

    expect(types).toEqual(['one']);
    expect(registry.types()).toEqual(['one', 'two']);
  });
});
