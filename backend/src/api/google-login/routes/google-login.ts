export default {
    routes: [
        {
            method: 'POST',
            path: '/google-login/exchange',
            handler: 'google-login.exchange',
            config: {
                auth: false, // Public endpoint
                policies: [],
                middlewares: [],
            },
        },
    ],
};
