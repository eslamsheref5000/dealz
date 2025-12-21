
export default {
    routes: [
        {
            method: 'POST',
            path: '/google-login/authenticate',
            handler: 'auth-google.login',
            config: {
                auth: false,
            },
        },
        {
            method: 'GET',
            path: '/google-login/test',
            handler: 'auth-google.test',
            config: {
                auth: false,
            },
        },
    ],
};
