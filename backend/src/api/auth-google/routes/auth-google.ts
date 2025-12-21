
export default {
    routes: [
        {
            method: 'POST',
            path: '/auth-google/login',
            handler: 'auth-google.login',
            config: {
                auth: false, // Public endpoint
                policies: [],
                middlewares: [],
            },
        },
    ],
};
