
export default {
    routes: [
        {
            method: 'POST',
            path: '/ai/analyze',
            handler: 'ai.analyze',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
