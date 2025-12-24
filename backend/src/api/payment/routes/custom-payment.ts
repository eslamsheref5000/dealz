export default {
    routes: [
        {
            method: 'POST',
            path: '/payment/paymob/initiate',
            handler: 'payment.initiatePaymob',
            config: {
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/payment/paymob/webhook', // Public endpoint
            handler: 'payment.paymobWebhook',
            config: {
                auth: false, // Paymob calls this, so no JWT
            },
        },
        {
            method: 'POST',
            path: '/payment/manual/confirm',
            handler: 'payment.uploadProof',
            config: {
                policies: [],
            },
        },
    ],
};
