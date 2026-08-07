export async function appRoutes(app) {
    app.get('/health', async () => {
        return { status: 'ok', service: '@carbroz/api', timestamp: new Date().toISOString() };
    });
}
//# sourceMappingURL=app.routes.js.map