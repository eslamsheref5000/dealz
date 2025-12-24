export default {
    routes: [
        {
            method: 'POST',
            path: '/wallet/withdraw',
            handler: 'withdrawal-request.withdraw',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/wallet/my-withdrawals',
            handler: 'withdrawal-request.getMyWithdrawals',
            config: {
                policies: [],
                middlewares: [],
            },
        }
    ],
};
