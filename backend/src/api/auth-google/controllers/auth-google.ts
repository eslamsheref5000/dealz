
import { factories } from '@strapi/strapi';
import { OAuth2Client } from 'google-auth-library';

export default factories.createCoreController('api::auth-google.auth-google' as any, ({ strapi }) => ({
    async login(ctx) {
        const { token } = ctx.request.body;

        if (!token) {
            return ctx.badRequest('Token is required');
        }

        try {
            // 1. Verify Google Token
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            if (!payload) {
                throw new Error('Invalid Google Token Payload');
            }

            const { email, given_name, family_name, picture, sub } = payload;
            const username = email.split('@')[0];

            // 2. Check if user exists
            const userStr = 'plugin::users-permissions.user';
            let user = await strapi.db.query(userStr).findOne({
                where: { email },
                populate: ['role']
            });

            // 3. Create user if not exists
            if (!user) {
                // Get Authenticated Role
                const authenticatedRole = await strapi
                    .query('plugin::users-permissions.role')
                    .findOne({ where: { type: 'authenticated' } });

                user = await strapi.plugins['users-permissions'].services.user.add({
                    username: username + '_' + sub.slice(-4), // Ensure uniqueness
                    email,
                    password: Math.random().toString(36).slice(-8) + 'Aa1!', // Random secure password
                    role: authenticatedRole ? authenticatedRole.id : null,
                    confirmed: true,
                    provider: 'google',
                    firstName: given_name,
                    lastName: family_name,
                    // You might need to add logic to download/upload the picture if you want to store it locally
                    // For now we skip picture to avoid complexity errors
                });
            }

            // 4. Generate Strapi JWT
            const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
                id: user.id,
            });

            // 5. Return Response
            ctx.send({
                jwt,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    provider: user.provider,
                    confirmed: user.confirmed,
                    blocked: user.blocked,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            });

        } catch (error) {
            console.error('Google Auth Error:', error);
            return ctx.badRequest('Google Authentication Failed', { moreDetails: error.message });
        }
    },
}));
