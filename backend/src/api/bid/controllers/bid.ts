/**
 * bid controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::bid.bid' as any, ({ strapi }) => ({
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
        const product = await strapi.documents('api::product.product').findOne({
            documentId: productId,
            populate: ['ad_owner']
        });

        if (!product) {
            return ctx.notFound("Product not found.");
        }

        // 2. Validate Auction Rules
        if (!product.isAuction) {
            return ctx.badRequest("This item is not up for auction.");
        }

        if (new Date() > new Date(product.auctionEndTime)) {
            return ctx.badRequest("This auction has ended.");
        }

        if (product.ad_owner && product.ad_owner.documentId === user.documentId) {
            // Check against documentId for consistency, or id if mixed. 
            // strapi.documents returns documentId. user from ctx might have id or documentId.
            // Best to check both or assume documentId if Strapi 5 user
        }
        // Safety check for user ownership:
        // user object in ctx usually has id (int) and documentId (string) in Strapi 5
        if (product.ad_owner && (product.ad_owner.documentId === user.documentId || product.ad_owner.id === user.id)) {
            return ctx.badRequest("You cannot bid on your own item.");
        }

        // 3. Validate Bid Amount
        const currentHighest = Number(product.currentBid) > 0 ? Number(product.currentBid) : Number(product.price);

        const minRequired = (product.bidCount || 0) > 0
            ? currentHighest + Number(product.minBidIncrement)
            : Number(product.price);

        if (amount < minRequired) {
            return ctx.badRequest(`Bid must be at least ${minRequired}.`);
        }

        // 4. Create Bid
        // Use documentId for relations
        const newBid = await strapi.documents('api::bid.bid').create({
            data: {
                amount,
                product: productId, // Relation by documentId
                bidder: user.documentId, // Relation by documentId
                publishedAt: new Date()
            },
            status: 'published'
        });

        // 5. Update Product (Current Bid & Count)
        await strapi.documents('api::product.product').update({
            documentId: productId,
            data: {
                currentBid: amount,
                bidCount: (product.bidCount || 0) + 1
            },
            status: 'published'
        });

        return { data: newBid, meta: { message: "Bid placed successfully" } };
    }
}));

