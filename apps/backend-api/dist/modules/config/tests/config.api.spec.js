import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../../../app.js';
import { asValue } from 'awilix';
import { getContainer } from '../../../container/index.js';
describe('Config API', () => {
    let app;
    beforeAll(async () => {
        const container = getContainer();
        container.register({
            configProvider: asValue({
                get: async (key) => {
                    if (key === 'maintenance.enabled')
                        return false;
                    if (key === 'android.minVersion')
                        return '1.0.0';
                    if (key === 'android.latestVersion')
                        return '1.0.0';
                    if (key === 'ios.minVersion')
                        return '1.0.0';
                    if (key === 'ios.latestVersion')
                        return '1.0.0';
                    return null;
                }
            }),
            featureFlagProvider: asValue({
                getAllFlags: async () => ({
                    'new-ui': true,
                    'beta-feature': false
                })
            })
        });
        app = await buildApp();
        await app.ready();
    });
    afterAll(async () => {
        await app.close();
    });
    it('should return init config successfully', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v1/config/init'
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body.success).toBe(true);
        expect(body.data.maintenance.enabled).toBe(true);
        expect(body.data.maintenance.message).toBe('Testing config API');
        expect(body.data.featureFlags.testFlag).toBe(true);
    });
});
//# sourceMappingURL=config.api.spec.js.map