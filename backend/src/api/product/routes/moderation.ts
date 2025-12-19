export default {
    routes: [
        {
            method: "POST",
            path: "/products/:id/approve",
            handler: "api::product.product.approve",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/products/:id/reject",
            handler: "api::product.product.reject",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/products/:id/disable",
            handler: "api::product.product.disable",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/moderation/kyc/pending",
            handler: "api::product.product.getPendingKYC",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/moderation/kyc/:id/approve",
            handler: "api::product.product.approveKYC",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/moderation/kyc/:id/reject",
            handler: "api::product.product.rejectKYC",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/settings", // Public
            handler: "api::product.product.getSettingsPublic",
            config: {
                auth: false,
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            path: "/moderation/settings",
            handler: "api::product.product.getSettings",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            path: "/moderation/settings",
            handler: "api::product.product.updateSettings",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
