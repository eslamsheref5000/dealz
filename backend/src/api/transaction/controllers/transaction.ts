/**
 * transaction controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::transaction.transaction' as any, ({ strapi }) => ({
    // 1. Checkout (Create held transaction)
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized("Log in to purchase.");

        const { product: productId, paymentMethod } = ctx.request.body.data;

        // Fetch Product
        const product = await strapi.documents('api::product.product' as any).findOne({
            documentId: productId,
            populate: ['ad_owner']
        }) as any;

        if (!product) return ctx.notFound("Product not found");
        // @ts-ignore
        if (product.ad_owner.documentId === user.documentId) return ctx.badRequest("Cannot buy your own item.");
        // @ts-ignore
        if (product.shippingStatus !== 'waiting_payment') return ctx.badRequest("Product not available.");

        // Financial Logic (Commission)
        const amount = Number(product.price);
        const commissionRate = 0.10; // 10% Platform Fee
        const commission = amount * commissionRate;
        const netAmount = amount - commission;

        // Create Transaction
        const transaction = await strapi.documents('api::transaction.transaction' as any).create({
            data: {
                buyer: user.documentId,
                // @ts-ignore
                seller: product.ad_owner.documentId,
                product: productId,
                amount: amount,
                commission: commission,
                netAmount: netAmount,
                status: 'held', // Money is held by Escrow
                paymentMethod: paymentMethod || 'card'
            },
            status: 'published'
        });

        // Update Product Status
        await strapi.documents('api::product.product' as any).update({
            documentId: productId,
            data: {
                // @ts-ignore
                shippingStatus: 'to_ship',
                paymentStatus: 'pending', // Payment held
                paymentTransactionId: transaction.documentId
            },
            status: 'published'
        });

        return { data: transaction, meta: { message: `Payment secure! ${amount} held in Escrow (Commission: ${commission}).` } };
    },

    // 2. Mark as Shipped (Seller)
    async ship(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;
        const transaction = await strapi.documents('api::transaction.transaction' as any).findOne({
            documentId: id,
            populate: ['seller', 'product']
        }) as any;

        if (!transaction) return ctx.notFound();
        if (transaction.seller.documentId !== user.documentId) return ctx.unauthorized("Not seller");
        if (transaction.status !== 'held') return ctx.badRequest("Invalid status");

        const updated = await strapi.documents('api::transaction.transaction' as any).update({
            documentId: id,
            data: { status: 'shipped' },
            status: 'published'
        });

        await strapi.documents('api::product.product' as any).update({
            documentId: transaction.product.documentId,
            data: { shippingStatus: 'shipped' },
            status: 'published'
        });

        return { data: updated, meta: { message: "Item marked as shipped!" } };
    },

    // 3. Confirm Receipt (Buyer) -> Release Funds
    async receive(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;

        const transaction = await strapi.documents('api::transaction.transaction' as any).findOne({
            documentId: id,
            populate: ['buyer', 'seller', 'product'] // Populate seller too for Gamification
        }) as any;

        if (!transaction) return ctx.notFound();
        if (transaction.buyer.documentId !== user.documentId) return ctx.unauthorized("Not buyer");
        if (transaction.status !== 'shipped') return ctx.badRequest("Item triggered as shipped first");

        // Update Transaction -> Completed
        const updated = await strapi.documents('api::transaction.transaction' as any).update({
            documentId: id,
            data: { status: 'completed' },
            status: 'published'
        });

        // Update Product -> Delivered / Sold
        await strapi.documents('api::product.product' as any).update({
            documentId: transaction.product.documentId,
            data: {
                shippingStatus: 'delivered',
                paymentStatus: 'completed'
            },
            status: 'published'
        });

        // RELEASE FUNDS
        console.log(`[Escrow] Payout:`);
        console.log(`- Total: ${transaction.amount}`);
        console.log(`- Platform Fee: ${transaction.commission}`);
        console.log(`- Seller Payout: ${transaction.netAmount}`);

        // GAMIFICATION REWARDS
        try {
            const gamification = strapi.service('api::gamification-profile.gamification-profile' as any);

            // 1. Buyer (50 pts)
            await gamification.addPoints(user.id, 50, 'purchase', `Bought item: ${transaction.product.title}`);

            // 2. Seller (100 pts)
            if (transaction.seller) {
                await gamification.addPoints(transaction.seller.id, 100, 'sale', `Sold item: ${transaction.product.title}`);
            }
        } catch (err) {
            console.error("Gamification error:", err);
        }

        return { data: updated, meta: { message: "Transaction complete! Funds released to seller." } };
    }
}));
