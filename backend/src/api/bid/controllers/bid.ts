/**
 * bid controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::bid.bid', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;
        if (!user) {
            return ctx.unauthorized("You must be logged in to place a bid.");
        }

        const { amount, product: productId } = ctx.request.body.data;

        if (!amount || !productId) {
            return ctx.badRequest("Amount and Product ID are required.");
        }

        // 1. Fetch Product
        // @ts-ignore
        const product = await strapi.entityService.findOne('api::product.product', productId, {
            fields: ['id', 'title', 'price', 'isAuction', 'auctionEndTime', 'currentBid', 'minBidIncrement', 'bidCount', 'ad_owner'],
            populate: ['ad_owner']
        });

        if (!product) {
            return ctx.notFound("Product not found.");
        }

        // 2. Validate Auction Rules
        // @ts-ignore
        if (!product.isAuction) {
            return ctx.badRequest("This item is not up for auction.");
        }

        // @ts-ignore
        if (new Date() > new Date(product.auctionEndTime)) {
            return ctx.badRequest("This auction has ended.");
        }

        // @ts-ignore
        if (product.ad_owner && product.ad_owner.id === user.id) {
            return ctx.badRequest("You cannot bid on your own item.");
        }

        // 3. Validate Bid Amount
        // @ts-ignore
        const currentHighest = Number(product.currentBid) > 0 ? Number(product.currentBid) : Number(product.price);
        // If no bids yet, first bid must be at least the starting price.
        // If bids exist, must be current + increment.
        // @ts-ignore
        const minRequired = (product.bidCount || 0) > 0
            // @ts-ignore
            ? currentHighest + Number(product.minBidIncrement)
            // @ts-ignore
            : Number(product.price);

        if (amount < minRequired) {
            return ctx.badRequest(`Bid must be at least ${minRequired}.`);
        }

        // 4. Create Bid
        const newBid = await strapi.entityService.create('api::bid.bid', {
            data: {
                amount,
                product: productId,
                bidder: user.id,
                publishedAt: new Date()
            }
        });

        // 5. Update Product (Current Bid & Count)
        await strapi.entityService.update('api::product.product', productId, {
            data: {
                currentBid: amount,
                // @ts-ignore
                bidCount: (product.bidCount || 0) + 1
            } as any
        });

        return { data: newBid, meta: { message: "Bid placed successfully" } };
    }
}));
