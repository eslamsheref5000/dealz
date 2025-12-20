
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::google-login.google-login', ({ strapi }) => ({
    async exchange(ctx) {
        try {
            const { access_token } = ctx.request.body;

            if (!access_token) {
                return ctx.badRequest('access_token is required');
            }

            console.log('Dedicated Google Auth Exchange: Processing token...');

            // 1. Verify with Google
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            if (!userInfoRes.ok) {
                return ctx.badRequest('Invalid Google Access Token');
            }

            const googleUser = await userInfoRes.json() as any;
            const email = googleUser.email;

            console.log('Google Auth Verified:', email);

            if (!email) {
                return ctx.badRequest('Google Account has no email');
            }

            // 2. Find or Create User
            let user = await strapi.query('plugin::users-permissions.user').findOne({
                where: { email }
            });

            if (!user) {
                console.log('Creating new user in Google Auth...');
                const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });

                const baseUsername = email.split('@')[0];
                const uniqueSuffix = Math.floor(Math.random() * 10000);

                user = await strapi.query('plugin::users-permissions.user').create({
                    data: {
                        username: `${baseUsername}_${uniqueSuffix}`,
                        email: email,
                        provider: 'google',
                        password: Math.random().toString(36).slice(-8),
                        confirmed: true,
                        blocked: false,
                        role: role.id
                    }
                });
            }

            // 3. Issue JWT
            const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

            return ctx.send({
                jwt,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    confirmed: user.confirmed,
                    provider: user.provider
                }
            });

        } catch (err) {
            console.error('Google Auth Exchange Error:', err);
            return ctx.badRequest('Internal Exchange Error: ' + err.message);
        }
    }
}));
