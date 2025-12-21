
const Strapi = require('@strapi/strapi');
const path = require('path');

(async () => {
    try {
        const appDir = path.resolve(__dirname, '..');
        const strapi = await Strapi.createStrapi({ appDir }).load();

        const routes = strapi.server.listRoutes();
        const googleRoutes = routes.filter(r => r.path.includes('google'));

        console.log("=== GOOGLE ROUTES FOUND ===");
        console.log(JSON.stringify(googleRoutes, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
