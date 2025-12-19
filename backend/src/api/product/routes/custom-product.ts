module.exports = {
    routes: [
        {
            method: 'PUT',
            path: '/products/:id/view',
            handler: 'product.incrementViews',
            config: {
                auth: false, // Public endpoint
            },
        },
    ],
};
