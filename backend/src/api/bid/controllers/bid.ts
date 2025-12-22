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

        // Safety check for user ownership:
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

        // 3.5 Find Previous Highest Bidder (for Notification)
        let previousLowBidder = null;
        try {
            // Re-fetch product with bids to be sure we have latest state
            const productWithBids = await strapi.documents('api::product.product' as any).findOne({
                documentId: productId,
                populate: ['bids', 'bids.bidder']
            }) as any;

            if (productWithBids && productWithBids.bids && productWithBids.bids.length > 0) {
                const sortedBids = (productWithBids.bids as any[]).sort((a: any, b: any) => b.amount - a.amount);
                if (sortedBids.length > 0) {
                    previousLowBidder = sortedBids[0].bidder;
                }
            }
        } catch (e) {
            console.error("Error finding previous bidder:", e);
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
            // Extend by 5 minutes
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
            } as any,
            status: 'published'
        });

        // 6. Notify Previous Bidder (Outbid)
        if (previousLowBidder && previousLowBidder.documentId !== user.documentId) {
            try {
                console.log(`Notifying previous bidder ${previousLowBidder.username}`);
                await strapi.documents('api::notification.notification' as any).create({
                    data: {
                        type: 'outbid',
                        content: `You have been outbid on "${product.title}"! Current bid: ${amount}`,
                        recipient: previousLowBidder.documentId,
                        product: productId,
                        isRead: false
                    },
                    status: 'published'
                });
            } catch (err) {
                console.error("Failed to create outbid notification:", err);
            }
        }

        return {
            data: newBid,
            meta: {
                message: newEndTime ? "Bid placed! Auction time extended." : "Bid placed successfully",
                auctionExtended: !!newEndTime
            }
        };
    }
}));
