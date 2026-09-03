import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const p = (...parts) => path.join(root, ...parts);
const patch = (relative, transform) => {
  const file = p(relative);
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(file, after);
};

const providerPath = 'platform/integrations/notification/src/providers/MultiChannelNotificationProvider.ts';
patch(providerPath, (text) => {
  text = text.replace(
    /providerReference:\s*result\.providerReference,\n/g,
    '...(result.providerReference !== undefined ? { providerReference: result.providerReference } : {}),\n',
  );
  text = text.replace(
    /errorCode:\s*result\.errorCode,\n/g,
    '...(result.errorCode !== undefined ? { errorCode: result.errorCode } : {}),\n',
  );
  return text;
});

// These tests historically bypassed NotificationPayload construction with
// partial literals. Keep the canonical payload contract strict and make the
// provider tests supply the complete normalized shape instead.
patch('platform/integrations/notification/tests/MultiChannelNotificationProvider.spec.ts', (text) => {
  const addRequiredMetadata = (block) => {
    let result = block;
    if (!result.includes('templateId:')) result = result.replace(/channel:\s*'([^']+)',\n/, "channel: '$1',\n      templateId: 'test-template',\n");
    if (!result.includes('recipientId:')) result = result.replace(/recipient:\s*([^\n]+),\n/, 'recipient: $1,\n      recipientId: 1,\n');
    if (!result.includes('bookingId:')) result = result.replace(/recipientId:\s*1,\n/, 'recipientId: 1,\n      bookingId: null,\n');
    if (!result.includes('title:')) result = result.replace(/bookingId:\s*null,\n/, "bookingId: null,\n      title: '',\n");
    if (!result.includes('data:')) result = result.replace(/body:\s*([^\n]+),\n/, 'body: $1,\n      data: {},\n');
    return result;
  };

  return text.replace(/provider\.dispatch\(\{[\s\S]*?\}\)/g, (match) => addRequiredMetadata(match));
});

console.log('Backend V3 integration contracts finalized.');
