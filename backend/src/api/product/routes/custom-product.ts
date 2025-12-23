
export default {
    routes: [
        {
            method: 'GET',
            path: '/products/analytics/my-stats',
            handler: 'product.getMyAnalytics',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/products/:id/buy-now',
            handler: 'product.buyNow',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'PUT',
            path: '/products/:id/view',
            handler: 'product.incrementViews',
            config: {
                auth: false, // Allow public view counting
                policies: [],
                middlewares: [],
            },
        }
    ],
};
