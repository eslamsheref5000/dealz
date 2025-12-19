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

            return { data: newProduct, meta: {} };
        } catch (err) {
            console.error("Create Error:", err);
            throw err;
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
    }
}));
