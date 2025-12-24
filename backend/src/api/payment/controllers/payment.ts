
import crypto from 'crypto';

import type { Context } from 'koa';

declare const strapi: any; // Global strapi

export default {
    // 1. Initiate Paymob Payment
    async initiatePaymob(ctx) {
        try {
            const { amount, orderType, transactionId, billingData } = ctx.request.body;
            const user = ctx.state.user;

            if (!user) return ctx.unauthorized("You must be logged in");

            // Load Service
            const paymobService = strapi.service("api::payment.paymob");

            // Step 1: Auth
            const authToken = await paymobService.getAuthToken();

            // Step 2: Create Order
            // Convert amount to cents
            const amountCents = Math.round(amount * 100);
            const merchantOrderId = `${transactionId}_${Date.now()}`; // Unique ID
            const paymobOrderId = await paymobService.createOrder(authToken, amountCents, merchantOrderId);

            // Save Paymob Order ID to Transaction (Updating existing transaction)
            // Assuming 'transactionId' is the ID of our local 'transaction' or 'bid' record.
            // Ideally we should find the transaction and update it.
            await strapi.documents('api::transaction.transaction').update({
                documentId: transactionId,
                data: {
                    // We need to add these fields to schema later or store in 'details' json
                    note: `Paymob Order: ${paymobOrderId}`
                },
                status: 'published'
            });

            // Step 3: Get Payment Key
            // Integration ID depends on type (Card vs Wallet) - defaulting to CARD for now
            const integrationId = process.env.PAYMOB_INTEGRATION_ID_CARD;
            if (!integrationId) throw new Error("PAYMOB_INTEGRATION_ID_CARD is missing");

            // Ensure billing data has mandatory fields (even if dummy) for Paymob
            const refinedBilling = {
                email: user.email || "test@test.com",
                first_name: user.username || "Test",
                last_name: "User",
                phone_number: "01010101010",
                floor: "NA",
                street: "NA",
                building: "NA",
                apartment: "NA",
                city: "Cairo",
                country: "EG",
                state: "NA",
                ...billingData // Override with actual if provided
            };

            const paymentToken = await paymobService.getPaymentKey(authToken, paymobOrderId, amountCents, refinedBilling, integrationId);
            const iframeId = process.env.PAYMOB_IFRAME_ID;

            ctx.send({
                status: "success",
                iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`,
                paymobOrderId
            });

        } catch (err) {
            console.error(err);
            ctx.badRequest("Payment initiation failed", { error: err.message });
        }
    },

    // 2. Paymob Webhook (Callback)
    async paymobWebhook(ctx) {
        try {
            const { obj, type } = ctx.request.body;
            const hmac = ctx.request.query.hmac;

            // TODO: Verify HMAC Signature for security
            // const secret = process.env.PAYMOB_HMAC_SECRET;
            // ... verification logic ...

            if (type === "TRANSACTION" && obj.success === true) {
                const paymobOrderId = obj.order.id;

                // Find transaction by Paymob Order ID (which we stored in note, or ideally a dedicated field)
                // For MVP, we might need a better lookup. 
                // Let's assume we stored it.
                // A better way: The 'merchant_order_id' contains our transaction ID: "123_17000000"

                const merchantOrderId = obj.order.merchant_order_id;
                const [localTxId] = merchantOrderId.split('_'); // '123'

                if (localTxId) {
                    await strapi.documents('api::transaction.transaction').update({
                        documentId: localTxId,
                        data: {
                            status: 'paid', // Update status
                            // updatedAt is auto-handled
                        },
                        status: 'published'
                    });
                    // Trigger notification
                    // ...
                }
            }

            ctx.send("Received");
        } catch (err) {
            console.error(err);
            ctx.send("Error");
        }
    },

    // 3. Manual Payment Upload
    async uploadProof(ctx) {
        try {
            // This requires 'upload' middleware handling 'files'
            // We will simplify: user uploads file to /upload standard API first, then sends the ID here.
            const { transactionId, fileId, method } = ctx.request.body;
            const user = ctx.state.user;

            if (!user) return ctx.unauthorized();

            await strapi.documents('api::transaction.transaction').update({
                documentId: transactionId,
                data: {
                    status: 'pending_review', // New status we need to add or map to 'held'
                    // We need to link 'paymentProof' (Media) - verify schema supports it
                    // For now, let's assume we can store it or add a relationship
                    note: `Manual Payment: ${method}. File ID: ${fileId}`
                },
                status: 'published'
            });

            ctx.send({ status: "success", message: "Receipt submitted for review" });

        } catch (err) {
            ctx.badRequest("Upload failed");
        }
    }
};
