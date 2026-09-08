import { describe, expect, it } from 'vitest';
import {
  PRODUCTION_COMPONENT_TYPES, PRODUCTION_ELEMENT_TYPES, PRODUCTION_GROUP_TYPES,
  PRODUCTION_SECTION_TYPES, PRODUCTION_TEMPLATE_TYPES,
} from '../src/public/index.js';

describe('stack production vocabulary', () => {
  it('registers stack at every structural container level', () => {
    expect(PRODUCTION_TEMPLATE_TYPES).toContain('stack_template');
    expect(PRODUCTION_COMPONENT_TYPES).toContain('stack_component');
    expect(PRODUCTION_SECTION_TYPES).toContain('stack_section');
    expect(PRODUCTION_GROUP_TYPES).toContain('stack_group');
  });

  it('registers divider as a terminal reusable element', () => {
    expect(PRODUCTION_ELEMENT_TYPES).toContain('divider');
  });
});
