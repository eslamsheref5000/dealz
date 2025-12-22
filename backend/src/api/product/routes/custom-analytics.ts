export default {
    routes: [
        {
            method: 'GET',
            path: '/analytics/me',
            handler: 'api::product.product.getMyAnalytics', // Will attach to Product controller
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
