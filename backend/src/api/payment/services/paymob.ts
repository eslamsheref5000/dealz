import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
    async getAuthToken() {
        try {
            const apiKey = process.env.PAYMOB_API_KEY;
            if (!apiKey) throw new Error("PAYMOB_API_KEY is not defined");

            const response = await strapi.fetch("https://accept.paymob.com/api/auth/tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: apiKey }),
            });

            const data = await response.json() as any;
            return data.token;
        } catch (error) {
            console.error("Paymob Auth Error:", error);
            throw new Error("Failed to authenticate with Paymob");
        }
    },

    async createOrder(authToken: string, amountCents: number, merchantOrderId: string) {
        try {
            const response = await strapi.fetch("https://accept.paymob.com/api/ecommerce/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    auth_token: authToken,
                    delivery_needed: "false",
                    amount_cents: amountCents,
                    currency: "EGP",
                    merchant_order_id: merchantOrderId, // Unique transaction ID from our side
                    items: [], // Optional: Add items details if needed
                }),
            });

            const data = await response.json() as any;
            return data.id; // Paymob Order ID
        } catch (error) {
            console.error("Paymob Create Order Error:", error);
            throw new Error("Failed to create Paymob order");
        }
    },

    async getPaymentKey(authToken: string, paymobOrderId: string, amountCents: number, billingData: any, integrationId: string) {
        try {
            const response = await strapi.fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    auth_token: authToken,
                    amount_cents: amountCents,
                    expiration: 3600, // 1 hour
                    order_id: paymobOrderId,
                    billing_data: billingData, // User details
                    currency: "EGP",
                    integration_id: integrationId,
                    lock_order_when_paid: "false"
                }),
            });

            const data = await response.json() as any;
            return data.token; // The Payment Key to launch iframe
        } catch (error) {
            console.error("Paymob Payment Key Error:", error);
            throw new Error("Failed to generate payment key");
        }
    },
});
