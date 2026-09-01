import { z } from 'zod';
import { idSchema, propertiesSchema, targetAppSchema, typeSchema } from './common.schema.js';
import { templateSchema, type SduiTemplate } from './template.schema.js';

const themeSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  showBackButton: z.boolean().optional(),
  statusBar: z.enum(['transparent', 'default']).optional(),
  properties: propertiesSchema.optional(),
}).strict();

function collectNodeIds(template: SduiTemplate): string[] {
  const ids: string[] = [template.id];

  for (const component of template.components) {
    ids.push(component.id);

    if ('elements' in component) {
      for (const element of component.elements) ids.push(element.id);
      continue;
    }

    for (const section of component.sections) {
      ids.push(section.id);

      if ('elements' in section) {
        for (const element of section.elements) ids.push(element.id);
        continue;
      }

      for (const group of section.groups) {
        ids.push(group.id);
        for (const element of group.elements) ids.push(element.id);
      }
    }
  }

  return ids;
}

export const screenSchema = z.object({
  screenId: idSchema,
  templateId: idSchema,
  templateType: typeSchema,
  schemaVersion: z.string().trim().min(1),
  targetApp: targetAppSchema,
  template: templateSchema,
  theme: themeSchema.optional(),
  metadata: propertiesSchema.optional(),
}).strict().superRefine((screen, context) => {
  if (screen.template.id !== screen.templateId) {
    context.addIssue({
      code: 'custom',
      path: ['template', 'id'],
      message: 'template.id must equal templateId',
    });
  }

  if (screen.template.type !== screen.templateType) {
    context.addIssue({
      code: 'custom',
      path: ['template', 'type'],
      message: 'template.type must equal templateType',
    });
  }

  const seen = new Set<string>();
  for (const id of collectNodeIds(screen.template)) {
    if (seen.has(id)) {
      context.addIssue({
        code: 'custom',
        path: ['template'],
        message: `Duplicate structural id '${id}'`,
      });
      break;
    }
    seen.add(id);
  }
});

export type SduiScreen = z.infer<typeof screenSchema>;
export type SduiTheme = z.infer<typeof themeSchema>;
