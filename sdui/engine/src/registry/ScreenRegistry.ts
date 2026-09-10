import type { SduiTargetApp } from '../core/SduiModel.js';
import type { ScreenComposer } from '../core/ScreenComposer.js';

export class DuplicateScreenRegistrationError extends Error {
  constructor(targetApp: SduiTargetApp, screenId: string) {
    super(`SDUI screen '${screenId}' is already registered for target '${targetApp}'`);
    this.name = 'DuplicateScreenRegistrationError';
  }
}

export class UnknownScreenError extends Error {
  constructor(targetApp: SduiTargetApp, screenId: string) {
    super(`SDUI screen '${screenId}' is not registered for target '${targetApp}'`);
    this.name = 'UnknownScreenError';
  }
}

/** Resolves an application target + screen id to exactly one ScreenComposer. */
export class ScreenRegistry {
  private readonly composers = new Map<string, ScreenComposer>();

  register(composer: ScreenComposer): this {
    const key = this.key(composer.targetApp, composer.screenId);

    if (this.composers.has(key)) {
      throw new DuplicateScreenRegistrationError(composer.targetApp, composer.screenId);
    }

    this.composers.set(key, composer);
    return this;
  }

  get(targetApp: SduiTargetApp, screenId: string): ScreenComposer {
    const composer = this.composers.get(this.key(targetApp, screenId));

    if (!composer) {
      throw new UnknownScreenError(targetApp, screenId);
    }

    return composer;
  }

  has(targetApp: SduiTargetApp, screenId: string): boolean {
    return this.composers.has(this.key(targetApp, screenId));
  }

  private key(targetApp: SduiTargetApp, screenId: string): string {
    return `${targetApp}:${screenId}`;
  }
}
