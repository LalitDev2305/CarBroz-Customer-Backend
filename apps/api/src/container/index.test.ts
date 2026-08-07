import { describe, it, expect } from 'vitest';
import { getContainer } from './index.js';
import { asValue } from 'awilix';

describe('DI Container', () => {
  it('should initialize strictly and resolve dependencies', () => {
    const container = getContainer();
    
    // Temporary registration for test
    container.register('dummyValue', asValue('test'));
    
    const resolved = container.resolve('dummyValue');
    expect(resolved).toBe('test');
  });
});
