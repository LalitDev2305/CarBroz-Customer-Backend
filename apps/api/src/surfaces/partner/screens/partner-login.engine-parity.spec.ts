import { describe, expect, it } from 'vitest';
import { PartnerLoginScreen as EnginePartnerLoginScreen } from '@carbroz/sdui-engine';
import { PartnerLoginScreenBuilder } from './builders/partner-login-screen.builder.js';

describe('Partner Login SDUI engine migration parity', () => {
  it('produces exactly the same canonical screen as the current API builder', () => {
    const current = new PartnerLoginScreenBuilder().build();
    const engine = new EnginePartnerLoginScreen().build({});

    expect(engine).toEqual(current);
  });
});
