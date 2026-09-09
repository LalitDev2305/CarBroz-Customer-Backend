import type { NodeDefinition, SduiNodeLevel } from '../core/NodeDefinition.js';

export class DuplicateNodeDefinitionError extends Error {
  constructor(level: SduiNodeLevel, type: string) {
    super(`SDUI definition '${type}' is already registered at level '${level}'`);
    this.name = 'DuplicateNodeDefinitionError';
  }
}

export class UnknownNodeDefinitionError extends Error {
  constructor(level: SduiNodeLevel, type: string) {
    super(`SDUI definition '${type}' is not registered at level '${level}'`);
    this.name = 'UnknownNodeDefinitionError';
  }
}

/** Single registry for all reusable SDUI node definitions. */
export class NodeDefinitionRegistry {
  private readonly definitions = new Map<string, NodeDefinition>();

  constructor(definitions: readonly NodeDefinition[] = []) {
    for (const definition of definitions) this.register(definition);
  }

  register(definition: NodeDefinition): this {
    const key = this.key(definition.level, definition.type);

    if (this.definitions.has(key)) {
      throw new DuplicateNodeDefinitionError(definition.level, definition.type);
    }

    this.definitions.set(key, definition);
    return this;
  }

  get(level: SduiNodeLevel, type: string): NodeDefinition {
    const definition = this.definitions.get(this.key(level, type));

    if (!definition) {
      throw new UnknownNodeDefinitionError(level, type);
    }

    return definition;
  }

  has(level: SduiNodeLevel, type: string): boolean {
    return this.definitions.has(this.key(level, type));
  }

  private key(level: SduiNodeLevel, type: string): string {
    return `${level}:${type}`;
  }
}
