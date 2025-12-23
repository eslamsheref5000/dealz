/**
 * notification controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::notification.notification' as any, ({ strapi }) => ({
    async find(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.unauthorized("You must be logged in to view notifications");
        }

        try {
            // Use entityService directly to bypass generic validation limits
            const notifications = await strapi.entityService.findMany('api::notification.notification' as any, {
                filters: {
                    recipient: { id: user.id },
                    isRead: ctx.query.filters?.['isRead'] === 'true' || ctx.query.filters?.['isRead'] === true
                        ? true
                        : (ctx.query.filters?.['isRead'] === 'false' || ctx.query.filters?.['isRead'] === false ? false : undefined)
                },
                sort: { createdAt: 'desc' },
                limit: 10,
                populate: ['product'] // Optional: populate if needed
            });

            // Count for meta
            const total = await strapi.entityService.count('api::notification.notification' as any, {
                filters: {
                    recipient: { id: user.id },
                    isRead: { $eq: false }
                }
            });

            // Manual sanitizer not strictly needed for just ID/content but good practice
            return {
                data: notifications,
                meta: {
                    pagination: {
                        page: 1,
                        pageSize: 10,
                        pageCount: 1, // Simplified
                        total: total
                    }
                }
            };
        } catch (error) {
            ctx.body = error;
            ctx.status = 500;
        }
    }
}));
