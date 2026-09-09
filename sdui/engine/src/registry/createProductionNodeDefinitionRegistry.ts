import { productionNodeDefinitions } from '../nodes/definitions.js';
import { NodeDefinitionRegistry } from './NodeDefinitionRegistry.js';

export function createProductionNodeDefinitionRegistry(): NodeDefinitionRegistry {
  return new NodeDefinitionRegistry(productionNodeDefinitions);
}
