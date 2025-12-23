/**
 * review controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::review.review', ({ strapi }) => ({
    async find(ctx) {
        try {
            const { query } = ctx;
            const entries = await strapi.documents('api::review.review').findMany({
                ...query,
                populate: {
                    reviewer: {
                        fields: ['username', 'email']
                    },
                    seller: {
                        fields: ['username', 'email']
                    }
                },
                status: 'published',
            });
            console.log("Raw Entries (First):", JSON.stringify(entries[0], null, 2));
            const sanitized = await this.sanitizeOutput(entries, ctx);

            // Re-attach safe reviewer info if sanitized stripped it
            const finalOutput = (Array.isArray(sanitized) ? sanitized : [sanitized]).map((item, index) => {
                const raw = entries[index];
                if (raw && raw.reviewer) {
                    return {
                        ...item,
                        reviewer: {
                            id: raw.reviewer.id,
                            username: raw.reviewer.username
                        }
                    };
                }
                return item;
            });

            return this.transformResponse(finalOutput);
        } catch (err) {
            console.error("Custom Find Error:", err);
            return ctx.badRequest("Failed to fetch reviews");
        }
    },

    async create(ctx) {
        const user = ctx.state.user;

        // Ensure user is logged in
        if (!user) {
            return ctx.unauthorized('You must be logged in to leave a review');
        }

        // Get data from body
        // Strapi 5 request body usually has { data: { ... } } structure for REST
        const { data } = ctx.request.body;

        // Validate requirements
        if (!data.seller) {
            return ctx.badRequest('Seller is required');
        }

        try {
            // Using Document Service API (Strapi 5)
            // We accept seller as ID or DocumentId. Document Service prefers DocumentId but might handle ID?
            // Let's assume the frontend sends what it sends (ID).
            // If standard create fails, we might need to look up seller DocumentId.

            // Construct payload
            const payload = {
                ...data,
                reviewer: user.documentId, // Link current user by Document ID
                publishedAt: new Date(), // Auto-publish
            };

            // Note: data.seller should be user documentId ideally.
            // If frontend sends ID (int), let's keep it and see if Strapi handles it.
            // If not, we fix inputs.

            // VERIFICATION: Check if user has a COMPLETED transaction with this seller
            // We need to query the Transaction collection
            // Note: In Strapi 5, we use strapi.documents or strapi.db

            // Normalize seller ID to what Strapi expects (likely DocumentId in v5, but let's check both if possible or rely on relation lookup)
            // @ts-ignore
            const transactions = await strapi.documents('api::transaction.transaction').findMany({
                filters: {
                    buyer: {
                        documentId: {
                            $eq: user.documentId
                        }
                    },
                    seller: {
                        id: { // Assuming seller comes as ID from frontend, we might need to handle lookup if it fails
                            $eq: data.seller
                        }
                    },
                    status: 'completed'
                } as any
            });

            if (transactions.length === 0) {
                // Fallback: Frontend sends ID, but maybe we need to check via DocumentId? 
                // If the above query fails due to ID mismatch (int vs string), let's try a looser check or assume stricter frontend logic.
                // For now, let's assume strict verification is required.
                return ctx.forbidden('You can only review sellers you have successfully purchased from.');
            }

            const entry = await strapi.documents('api::review.review').create({
                data: payload,
                status: 'published'
            });

            // GAMIFICATION: Award Seller for 5-Star Reviews
            try {
                if (Number(data.rating) === 5) {
                    const gamificationService = strapi.service('api::gamification-profile.gamification-profile' as any);

                    // Award 20 points to the reviewee (Seller)
                    // We need to ensure we have the correct user ID for the reviewee
                    let targetUserId = data.reviewee || data.seller; // Handle both simplified and relation cases

                    if (targetUserId) {
                        // If object, extract id
                        if (typeof targetUserId === 'object') targetUserId = targetUserId.id || targetUserId.documentId;

                        await gamificationService.addPoints(
                            targetUserId,
                            20,
                            'review',
                            `Received 5-star review from ${user.username}`
                        );
                    }
                }
            } catch (gError) {
                console.error("Gamification Error in Review:", gError);
            }

            const sanitizedEntity = await this.sanitizeOutput(entry, ctx);
            return this.transformResponse(sanitizedEntity);

        } catch (err) {
            // Log the error for better debugging
            console.error("Custom Create Error:", err);
            throw err;
        }
    }
}));
