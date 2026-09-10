import type { NodeDefinition } from '../core/NodeDefinition.js';
import { StackComponentDefinition } from './component/StackComponent.js';
import { ButtonDefinition } from './element/Button.js';
import { ImageDefinition } from './element/Image.js';
import { InputDefinition } from './element/Input.js';
import { TextDefinition } from './element/Text.js';
import { StackGroupDefinition } from './group/StackGroup.js';
import { StackSectionDefinition } from './section/StackSection.js';
import { DefaultTemplateDefinition } from './template/DefaultTemplate.js';
import { FormTemplateDefinition } from './template/FormTemplate.js';
import { StackTemplateDefinition } from './template/StackTemplate.js';

/** Canonical reusable SDUI vocabulary currently required by the engine migration. */
export const productionNodeDefinitions: readonly NodeDefinition[] = Object.freeze([
  StackTemplateDefinition,
  FormTemplateDefinition,
  DefaultTemplateDefinition,
  StackComponentDefinition,
  StackSectionDefinition,
  StackGroupDefinition,
  TextDefinition,
  ImageDefinition,
  InputDefinition,
  ButtonDefinition,
]);
