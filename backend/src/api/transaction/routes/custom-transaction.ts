
module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/transactions/:id/ship',
            handler: 'transaction.ship',
            config: {
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/transactions/:id/receive',
            handler: 'transaction.receive',
            config: {
                policies: [],
            },
        },
    ],
};
