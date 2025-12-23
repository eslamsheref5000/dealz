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

        // AUCTION LOGIC: If it's an auction, validate Buy Now availability
        if (product.isAuction) {
            // Check if auction ended naturally
            if (new Date() > new Date(product.auctionEndTime)) {
                // Check if it's already sold/won? 
                // For now, allow purchase if it wasn't won by bid? 
                // Simpler: Buy Now is only valid while auction is ACTIVE.
                return ctx.badRequest("Auction has ended.");
            }
            if (!product.buyNowPrice) return ctx.badRequest("Buy Now not enabled for this auction.");
        } else {
            // Regular Item
            // @ts-ignore
            if (product.shippingStatus !== 'waiting_payment') return ctx.badRequest("Product not available.");
        }

        // Financial Logic (Commission)
        // For Auction, assume price is Buy Now Price if active, or Current Bid if ended?
        // "Buy Now" implies paying the Buy Now Price.
        // If coming from "Checkout", we assume the user agreed to the price.
        // Let's rely on product.price (Regular) OR product.buyNowPrice (Auction Buy Now)

        let finalPrice = Number(product.price);
        // If Auction, Override price with Buy Now Price
        if (product.isAuction) {
            finalPrice = Number(product.buyNowPrice);
        }

        const commissionRate = 0.10; // 10% Platform Fee
        const commission = finalPrice * commissionRate;
        const netAmount = finalPrice - commission;

        // Create Transaction
        const transaction = await strapi.documents('api::transaction.transaction' as any).create({
            data: {
                buyer: user.documentId,
                // @ts-ignore
                seller: product.ad_owner.documentId,
                product: productId,
                amount: finalPrice,
                commission: commission,
                netAmount: netAmount,
                status: 'held', // Money is held by Escrow
                paymentMethod: paymentMethod || 'card'
            },
            status: 'published'
        });

        // Update Product Status
        // If Auction -> Close it!
        const productUpdates: any = {
            shippingStatus: 'to_ship',
            paymentStatus: 'pending', // Payment held
            paymentTransactionId: transaction.documentId
        };

        if (product.isAuction) {
            productUpdates.auctionEndTime = new Date(); // Close Auction
            productUpdates.currentBid = finalPrice; // Set final bid to sold price
            productUpdates.bidCount = (product.bidCount || 0) + 1;
            // Optionally create a "Bid" record for history?
            // Let's simply mark product.winner if we had that field?
            // "winner" relation update involves Entity Service... simplified here.
        }

        await strapi.documents('api::product.product' as any).update({
            documentId: productId,
            data: productUpdates,
            status: 'published'
        });

        // Create a 'Bid' record for history consistency if Auction
        if (product.isAuction) {
            await strapi.documents('api::bid.bid' as any).create({
                data: {
                    amount: finalPrice,
                    product: productId,
                    bidder: user.documentId,
                    publishedAt: new Date()
                },
                status: 'published'
            });
        }

        return { data: transaction, meta: { message: `Payment secure! ${finalPrice} held in Escrow (Commission: ${commission}).` } };
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
