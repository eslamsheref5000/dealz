/**
 * product controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
    async create(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.unauthorized("You must be logged in to create an ad");
        }

        const { data } = ctx.request.body;

        try {
            // 1. Generate slug manually if missing (Strapi 5 custom controller fix)
            if (!data.slug && data.title) {
                // Strict slugify to match Strapi 5 regex: /^[A-Za-z0-9-_.~]*$/
                const sanitized = data.title
                    .toLowerCase()
                    .trim()
                    .replace(/ /g, '-')
                    .replace(/[^a-z0-9-_.~]/g, '') // Remove ANY non-allowed character
                    .replace(/-+/g, '-')           // Collapse multiple hyphens
                    .slice(0, 40);                 // Keep it reasonably short before timestamp

                data.slug = (sanitized || 'ad') + `-${Date.now()}`;
            }

            // 1. Create the product (published by default)
            const newProduct = await strapi.documents('api::product.product').create({
                data: {
                    ...data,
                    publishedAt: new Date(),
                },
                status: 'published'
            });

            // 2. FORCE update the ad_owner relation using Entity Service
            await strapi.entityService.update('api::product.product', (newProduct as any).id, {
                data: {
                    ad_owner: user.id
                }
            });

            // 3. Award Points (Gamification)
            try {
                await strapi.service('api::gamification-profile.gamification-profile').addPoints(
                    user.id,
                    50,
                    'post_ad',
                    `Posted new ad: ${data.title}`
                );
            } catch (pErr) {
                console.error("Failed to award points:", pErr);
                // Don't fail the request if points fail
            }

            return { data: newProduct, meta: {} };
        } catch (err) {
            console.error("Create Error:", err);
            throw err;
        }
    },

    async update(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;

        if (!user) {
            return ctx.unauthorized("You must be logged in to update an ad");
        }

        try {
            // 1. Check Ownership
            const existing = await strapi.documents('api::product.product').findOne({
                documentId: id,
                populate: ['ad_owner']
            });

            if (!existing) return ctx.notFound("Ad not found");

            const ownerId = (existing as any).ad_owner?.documentId || (existing as any).ad_owner?.id;
            const isOwner = ownerId === (user.documentId || user.id);
            const isAdmin = (user as any).isAdmin;

            if (!isOwner && !isAdmin) {
                return ctx.unauthorized("You are not the owner of this ad");
            }

            // 2. Prepare Update Data
            // If it's a regular user update, FORCE status to pending to trigger re-moderation
            if (!isAdmin) {
                if (ctx.request.body.data) {
                    ctx.request.body.data.approvalStatus = 'pending';
                    // ctx.request.body.data.publishedAt = new Date(); // Ensure it stays "technically" published in Strapi so admins can see it
                } else {
                    ctx.request.body.data = { approvalStatus: 'pending' };
                }
            }

            // 3. Perform Update
            // We use super.update to let Strapi handle the heavy lifting
            console.log(`User ${user.username} updating ad ${id}. Setting status to pending.`);
            const response = await super.update(ctx);
            return response;

        } catch (err) {
            console.error("Update Error:", err);
            return ctx.badRequest("Update failed", { error: err });
        }
    },

    async findOne(ctx) {
        const { id } = ctx.params;

        // Auto-increment views
        try {
            const doc = await strapi.documents('api::product.product').findOne({ documentId: id });
            if (doc) {
                const newViews = (Number((doc as any).views) || 0) + 1;
                await strapi.documents('api::product.product').update({
                    documentId: id,
                    data: { views: newViews },
                    status: 'published'
                });
            }
        } catch (err) {
            console.error("View increment failed:", err);
        }

        const { data, meta } = await super.findOne(ctx);

        // Ensure ad_owner is populated even if suppressed by default permissions
        if (data && !(data as any).ad_owner) {
            try {
                const fullDoc = await strapi.entityService.findOne('api::product.product', (data as any).id, {
                    populate: ['ad_owner']
                });
                if (fullDoc && (fullDoc as any).ad_owner) {
                    (data as any).ad_owner = (fullDoc as any).ad_owner;
                }
            } catch (e) { }
        }

        // Emit Socket.io Event for "The Watchtower"
        const io = (strapi as any).io;
        if (io && data) {
            try {
                const geo = require('geoip-lite');
                console.log("Watchtower Debug: IP:", ctx.request.ip, "Forwarded:", ctx.request.header['x-forwarded-for']);

                let ip = ctx.request.header['x-forwarded-for'] || ctx.request.ip;

                // Handle multiple IPs in x-forwarded-for
                if (typeof ip === 'string' && ip.includes(',')) {
                    ip = ip.split(',')[0].trim();
                }

                if (ip === '::1') ip = '127.0.0.1';

                let lookup = geo.lookup(ip);
                console.log("Watchtower Debug: Lookup Result:", lookup);

                // Fallback for Development/Localhost if lookup fails
                if (!lookup) {
                    console.log("Watchtower Debug: Using Fallback Location");
                    lookup = { city: 'Local User', country: 'Dev', ll: [25.2048, 55.2708] }; // Default to Dubai
                }

                // Get title safely
                const title = (data as any).attributes?.title || (data as any).title || 'Product';

                io.emit('new_action', {
                    type: 'view',
                    details: `Viewed: ${title}`,
                    city: lookup.city || 'Unknown City',
                    country: lookup.country || 'XX',
                    lat: lookup.ll ? lookup.ll[0] : 0,
                    lng: lookup.ll ? lookup.ll[1] : 0,
                    timestamp: new Date()
                });
            } catch (err) {
                // Ignore analytics errors
            }
        }

        return { data, meta };
    },

    async find(ctx) {
        // Workaround for Strapi 5 rejecting 'ad_owner' in filters
        const { filters } = ctx.query;

        if (filters && typeof filters === 'object' && (filters as any).ad_owner) {
            const adOwnerFilter = (filters as any).ad_owner;
            let targetUserId = null;

            // Robust extraction of user ID from common Strapi filter formats
            if (adOwnerFilter.id) {
                if (typeof adOwnerFilter.id === 'object') {
                    targetUserId = adOwnerFilter.id.$eq || adOwnerFilter.id.id || Object.values(adOwnerFilter.id)[0];
                } else {
                    targetUserId = adOwnerFilter.id;
                }
            } else if (typeof adOwnerFilter === 'object') {
                targetUserId = adOwnerFilter.$eq || Object.values(adOwnerFilter)[0];
            } else {
                targetUserId = adOwnerFilter;
            }

            if (targetUserId) {
                console.log("BYPASS: Fetching ads for User ID:", targetUserId);
                try {
                    const results = await strapi.documents('api::product.product').findMany({
                        filters: {
                            ad_owner: {
                                id: targetUserId
                            }
                        },
                        populate: ['category', 'images', 'ad_owner'],
                        status: 'published'
                    });

                    return { data: results, meta: { bypassed: true, targetUserId } };
                } catch (err) {
                    console.error("Manual find error:", err);
                }
            }
        }

        const { data, meta } = await super.find(ctx);

        // Manually populate ad_owner for each product in the list if missing
        if (Array.isArray(data)) {
            await Promise.all(data.map(async (item: any) => {
                if (!item.ad_owner) {
                    try {
                        const fullDoc = await strapi.entityService.findOne('api::product.product', item.id, {
                            populate: ['ad_owner']
                        });
                        if (fullDoc && (fullDoc as any).ad_owner) {
                            item.ad_owner = (fullDoc as any).ad_owner;
                        }
                    } catch (e) { }
                }
            }));
        }

        return { data, meta };
    },

    // Moderation Actions
    async approve(ctx) {
        const { id } = ctx.params;
        const user = ctx.state.user;

        console.log("Approve attempt by user:", user?.username, "isAdmin:", user?.isAdmin);

        if (!user || !(user as any).isAdmin) {
            return ctx.unauthorized("Only admins can approve ads");
        }

        try {
            const result = await strapi.documents('api::product.product').update({
                documentId: id,
                data: {
                    approvalStatus: 'approved'
                    // We keep featured status as is, assuming it was set during creation
                },
                status: 'published'
            });
            return { data: result };
        } catch (err) {
            return ctx.badRequest("Approval failed", { error: err });
        }
    },

    async reject(ctx) {
        const { id } = ctx.params;
        const user = ctx.state.user;

        if (!user || !(user as any).isAdmin) {
            return ctx.unauthorized("Only admins can reject ads");
        }

        try {
            const result = await strapi.documents('api::product.product').update({
                documentId: id,
                data: {
                    approvalStatus: 'rejected'
                },
                status: 'published'
            });
            return { data: result };
        } catch (err) {
            return ctx.badRequest("Rejection failed", { error: err });
        }
    },

    async disable(ctx) {
        const { id } = ctx.params;
        const user = ctx.state.user;

        if (!user || !(user as any).isAdmin) {
            return ctx.unauthorized("Only admins can disable ads");
        }

        try {
            const result = await strapi.documents('api::product.product').update({
                documentId: id,
                data: {
                    approvalStatus: 'rejected' // Revert to rejected/pending
                },
                status: 'published'
            });
            return { data: result };
        } catch (err) {
            return ctx.badRequest("Disabling failed", { error: err });
        }
    },

    async getPendingKYC(ctx) {
        const user = ctx.state.user;
        if (!user || !(user as any).isAdmin) {
            return ctx.unauthorized("Only admins can view KYC requests");
        }

        try {
            const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
                filters: {
                    kycStatus: 'pending'
                },
                populate: ['kycDocument']
            });
            return { data: users };
        } catch (err) {
            return ctx.badRequest("Failed to fetch pending KYC", { error: err });
        }
    },

    async approveKYC(ctx) {
        const { id } = ctx.params;
        const user = ctx.state.user;

        if (!user || !(user as any).isAdmin) {
            return ctx.unauthorized("Only admins can approve KYC");
        }

        try {
            const result = await strapi.entityService.update('plugin::users-permissions.user', id, {
                data: {
                    kycStatus: 'verified',
                    isVerified: true
                }
            });
            return { data: result };
        } catch (err) {
            return ctx.badRequest("KYC Approval failed", { error: err });
        }
    },

    async rejectKYC(ctx) {
        const { id } = ctx.params;
        const user = ctx.state.user;

        if (!user || !(user as any).isAdmin) {
            return ctx.unauthorized("Only admins can reject KYC");
        }

        try {
            const result = await strapi.entityService.update('plugin::users-permissions.user', id, {
                data: {
                    kycStatus: 'rejected',
                    isVerified: false
                }
            });
            return { data: result };
        } catch (err) {
            return ctx.badRequest("KYC Rejection failed", { error: err });
        }
    },
    async getSettings(ctx) {
        const user = ctx.state.user;
        if (!user || !(user as any).isAdmin) {
            return ctx.unauthorized("Only admins can view settings");
        }

        try {
            let setting = await (strapi as any).documents('api::global-setting.global-setting').findFirst();
            if (!setting) {
                setting = await (strapi as any).documents('api::global-setting.global-setting').create({
                    data: { allowFeaturedAds: true },
                    status: 'published'
                });
            }
            return { data: setting };
        } catch (err) {
            return ctx.badRequest("Failed to fetch settings", { error: err });
        }
    },

    async getSettingsPublic(ctx) {
        try {
            let setting = await (strapi as any).documents('api::global-setting.global-setting').findFirst();
            if (!setting) {
                setting = await (strapi as any).documents('api::global-setting.global-setting').create({
                    data: { allowFeaturedAds: true },
                    status: 'published'
                });
            }
            return { data: setting };
        } catch (err) {
            return { data: { allowFeaturedAds: true } }; // Fallback
        }
    },

    async updateSettings(ctx) {
        const user = ctx.state.user;
        if (!user || !(user as any).isAdmin) {
            return ctx.unauthorized("Only admins can update settings");
        }

        const { data } = ctx.request.body;
        try {
            let setting = await (strapi as any).documents('api::global-setting.global-setting').findFirst();
            let result;
            if (setting) {
                result = await (strapi as any).documents('api::global-setting.global-setting').update({
                    documentId: (setting as any).documentId,
                    data: data,
                    status: 'published'
                });
            } else {
                result = await (strapi as any).documents('api::global-setting.global-setting').create({
                    data: data,
                    status: 'published'
                });
            }
            return { data: result };
        } catch (err) {
            return ctx.badRequest("Failed to update settings", { error: err });
        }
    },

    async incrementViews(ctx) {
        const { id } = ctx.params;
        try {
            const doc = await strapi.documents('api::product.product').findOne({ documentId: id });
            if (!doc) return ctx.notFound("Product not found");

            const newViews = (Number((doc as any).views) || 0) + 1;
            const updated = await strapi.documents('api::product.product').update({
                documentId: id,
                data: { views: newViews },
                status: 'published'
            });

            // Emit Socket.io Event for "The Watchtower"
            const io = (strapi as any).io;
            if (io) {
                try {
                    const geo = require('geoip-lite');
                    console.log("Watchtower Debug: IP:", ctx.request.ip, "Forwarded:", ctx.request.header['x-forwarded-for']);

                    let ip = ctx.request.header['x-forwarded-for'] || ctx.request.ip;
                    if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',')[0].trim();
                    if (ip === '::1') ip = '127.0.0.1';

                    let lookup = geo.lookup(ip);
                    if (!lookup) lookup = { city: 'Local User', country: 'Dev', ll: [25.2048, 55.2708] };

                    io.emit('new_action', {
                        type: 'view',
                        details: `Viewed: ${doc.title || 'Product'}`,
                        city: lookup.city || 'Unknown City',
                        country: lookup.country || 'XX',
                        lat: lookup.ll ? lookup.ll[0] : 0,
                        lng: lookup.ll ? lookup.ll[1] : 0,
                        timestamp: new Date()
                    });
                } catch (err) {
                    // Ignore analytics errors
                }
            }

            return { data: updated };
        } catch (err) {
            return ctx.badRequest("Failed to increment views", { error: err });
        }
    },

    async getMyAnalytics(ctx) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized("Authentication required");

        const { id } = user;

        // 1. Get all products for this user
        const products = await strapi.entityService.findMany('api::product.product', {
            filters: { ad_owner: id },
            fields: ['id', 'title', 'views', 'isAuction', 'auctionEndTime', 'currentBid', 'bidCount', 'publishedAt'] as any,
            sort: { views: 'desc' }
        });

        // 2. Aggregate Data
        const totalViews = products.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const totalAds = products.length;
        // @ts-ignore
        const activeAuctions = products.filter(p => p.isAuction && new Date(p.auctionEndTime) > new Date()).length;
        // @ts-ignore
        const totalBidsReceived = products.reduce((acc, curr) => acc + (curr.bidCount || 0), 0);

        // 3. Prepare Chart Data (Top 5 Ads)
        const topAds = products.slice(0, 5).map(p => ({
            name: p.title,
            views: p.views || 0,
            // @ts-ignore
            bids: p.bidCount || 0
        }));

        return {
            totalViews,
            totalAds,
            activeAuctions,
            totalBidsReceived,
            topAds
        };
    },

    async buyNow(ctx) {
        const user = ctx.state.user;
        const { id } = ctx.params;

        if (!user) {
            return ctx.unauthorized("You must be logged in to buy an item.");
        }

        // 1. Fetch Product
        const product = await strapi.documents('api::product.product' as any).findOne({
            documentId: id,
            populate: ['ad_owner']
        }) as any;

        if (!product) {
            return ctx.notFound("Product not found.");
        }

        // @ts-ignore
        if (!product.isAuction) {
            return ctx.badRequest("This item is not an auction.");
        }

        // @ts-ignore
        if (!product.buyNowPrice) {
            return ctx.badRequest("This item does not have a Buy Now price.");
        }

        // @ts-ignore
        if (new Date() > new Date(product.auctionEndTime)) {
            return ctx.badRequest("This auction has already ended.");
        }

        // Check ownership
        // @ts-ignore
        if (product.ad_owner && (product.ad_owner.documentId === user.documentId || product.ad_owner.id === user.id)) {
            return ctx.badRequest("You cannot buy your own item.");
        }

        // 2. Execute Purchase (Simulated by closing auction with max bid)
        // Create specific "Buy Now" bid
        await strapi.documents('api::bid.bid' as any).create({
            data: {
                // @ts-ignore
                amount: product.buyNowPrice,
                product: id,
                bidder: user.documentId,
                publishedAt: new Date()
            },
            status: 'published'
        });

        // 3. Close Auction
        await strapi.documents('api::product.product' as any).update({
            documentId: id,
            data: {
                // @ts-ignore
                currentBid: product.buyNowPrice,
                // @ts-ignore
                bidCount: (product.bidCount || 0) + 1,
                // End immediately
                auctionEndTime: new Date(),
                // @ts-ignore
                isFeatured: product.isFeatured // Keep other fields
            } as any,
            status: 'published'
        });

        return { message: "Item purchased successfully!", success: true };
    }
}));
