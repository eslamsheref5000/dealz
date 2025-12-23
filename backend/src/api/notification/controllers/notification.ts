/**
 * notification controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::notification.notification', ({ strapi }) => ({
    async find(ctx) {
        const user = ctx.state.user;

        if (!user) {
            return ctx.unauthorized("You must be logged in to view notifications");
        }

        // Force filter by current authenticated user
        ctx.query = {
            ...ctx.query,
            filters: {
                ...(ctx.query.filters as object),
                recipient: {
                    id: user.id
                }
            }
        };

        return super.find(ctx);
    }
}));
