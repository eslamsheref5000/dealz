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
        const product = await strapi.documents('api::product.product' as any).findOne({
            documentId: productId,
            populate: ['ad_owner']
        }) as any;

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

        if (product.ad_owner && product.ad_owner.documentId === user.documentId) {
            // Check against documentId for consistency, or id if mixed. 
            // strapi.documents returns documentId. user from ctx might have id or documentId.
            // Best to check both or assume documentId if Strapi 5 user
        }
        // Safety check for user ownership:
        // user object in ctx usually has id (int) and documentId (string) in Strapi 5
        // @ts-ignore
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
        const newBid = await strapi.documents('api::bid.bid' as any).create({
            data: {
                amount,
                product: productId, // Relation by documentId
                bidder: user.documentId, // Relation by documentId
                publishedAt: new Date()
            },
            status: 'published'
        });

        // 5. Update Product (Current Bid, Count & Anti-Sniping)
        // Check for Anti-Sniping (Soft Close)
        // @ts-ignore
        const timeRemaining = new Date(product.auctionEndTime).getTime() - new Date().getTime();
        const FIVE_MINUTES = 5 * 60 * 1000;
        let newEndTime = undefined;

        if (timeRemaining < FIVE_MINUTES && timeRemaining > 0) {
            // Extend by 5 minutes from specific end time or current time? 
            // Standard soft close: Extend to Current Time + 5 mins OR Original End + 5 mins.
            // Let's do Current Time + 5 mins to guarantee a window.
            newEndTime = new Date(Date.now() + FIVE_MINUTES);
            strapi.log.info(`[Anti-Sniping] Auction ${productId} extended by 5 mins.`);
        }

        await strapi.documents('api::product.product' as any).update({
            documentId: productId,
            data: {
                currentBid: amount,
                // @ts-ignore
                bidCount: (product.bidCount || 0) + 1,
                // @ts-ignore
                auctionEndTime: newEndTime || product.auctionEndTime
            } as any, // Cast data to any to bypass strict type check on update
            status: 'published'
        });

        return {
            data: newBid,
            meta: {
                message: newEndTime ? "Bid placed! Auction time extended." : "Bid placed successfully",
                auctionExtended: !!newEndTime
            }
        };
    }
}));

