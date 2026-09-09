import { screenSchema, type SduiScreen } from '@carbroz/ui-sdk';

/** Minimal authenticated Partner Dashboard shell. Business dashboard data remains owned by its feature contexts. */
export function createPartnerDashboardScreen(): SduiScreen {
  return screenSchema.parse({
    screenId: 'partner_dashboard',
    schemaVersion: '3.0.0',
    targetApp: 'PARTNER',
    theme: {
      theme: 'light',
      statusBar: 'transparent',
    },
    template: {
      id: 'partner_dashboard_template',
      type: 'default_template',
      properties: {
        orientation: 'vertical',
        fillMaxSize: true,
        padding: { start: 24, top: 24, end: 24, bottom: 24 },
      },
      components: [
        {
          id: 'dashboard_shell',
          type: 'stack_component',
          properties: {
            orientation: 'vertical',
            verticalArrangement: { type: 'spacedBy', spacing: 8 },
            fillMaxWidth: true,
          },
          elements: [
            {
              id: 'dashboard_title',
              type: 'text',
              properties: {
                text: 'Partner Dashboard',
                fontSize: 28,
                fontWeight: 700,
                color: '#101522',
              },
            },
            {
              id: 'dashboard_status',
              type: 'text',
              properties: {
                text: 'Your workspace is ready.',
                fontSize: 15,
                fontWeight: 400,
                color: '#6B7078',
              },
            },
          ],
        },
      ],
    },
  });
}
