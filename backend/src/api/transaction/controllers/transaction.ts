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

        // Create Transaction
        const transaction = await strapi.documents('api::transaction.transaction' as any).create({
            data: {
                buyer: user.documentId,
                // @ts-ignore
                seller: product.ad_owner.documentId,
                product: productId,
                amount: product.price,
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

        return { data: transaction, meta: { message: "Payment secure! Funds are held in Escrow." } };
    },

    // 2. Mark as Shipped (Seller)
    async ship(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params; // Transaction Document ID

        const transaction = await strapi.documents('api::transaction.transaction' as any).findOne({
            documentId: id,
            populate: ['seller', 'product']
        }) as any;

        if (!transaction) return ctx.notFound();
        // @ts-ignore
        if (transaction.seller.documentId !== user.documentId) return ctx.unauthorized("Not seller");
        // @ts-ignore
        if (transaction.status !== 'held') return ctx.badRequest("Invalid status");

        // Update Transaction
        const updated = await strapi.documents('api::transaction.transaction' as any).update({
            documentId: id,
            data: { status: 'shipped' },
            status: 'published'
        });

        // Update Product
        await strapi.documents('api::product.product' as any).update({
            // @ts-ignore
            documentId: transaction.product.documentId,
            data: { shippingStatus: 'shipped' },
            status: 'published'
        });

        // Notify Buyer
        // (Notification logic would go here)

        return { data: updated, meta: { message: "Item marked as shipped!" } };
    },

    // 3. Confirm Receipt (Buyer)
    async receive(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;

        const transaction = await strapi.documents('api::transaction.transaction' as any).findOne({
            documentId: id,
            populate: ['buyer', 'product']
        }) as any;

        if (!transaction) return ctx.notFound();
        // @ts-ignore
        if (transaction.buyer.documentId !== user.documentId) return ctx.unauthorized("Not buyer");
        // @ts-ignore
        if (transaction.status !== 'shipped') return ctx.badRequest("Item triggered as shipped first");

        // Update Transaction -> Completed (Release Funds)
        const updated = await strapi.documents('api::transaction.transaction' as any).update({
            documentId: id,
            data: { status: 'completed' },
            status: 'published'
        });

        // Update Product -> Delivered / Sold
        await strapi.documents('api::product.product' as any).update({
            // @ts-ignore
            documentId: transaction.product.documentId,
            data: {
                shippingStatus: 'delivered',
                paymentStatus: 'completed' // Funds released
            },
            status: 'published'
        });

        // In a real app, this triggers Stripe Payout
        console.log(`[Escrow] Released ${transaction.amount} to Seller.`);

        return { data: updated, meta: { message: "Transaction complete! Funds released to seller." } };
    }
}));
