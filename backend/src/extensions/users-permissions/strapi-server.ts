export default (plugin) => {
    // 1. Create the Custom Controller Logic
    plugin.controllers.auth.googleManualExchange = async (ctx) => {
        try {
            const { access_token } = ctx.request.body;

            if (!access_token) {
                return ctx.badRequest('access_token is required');
            }

            console.log('Manual Exchange Requested with Token:', access_token.substring(0, 10) + '...');

            // A. Verify with Google
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            if (!userInfoRes.ok) {
                return ctx.badRequest('Invalid Google Access Token');
            }

            const googleUser = await userInfoRes.json() as any; // Type Assertion for TS
            const email = googleUser.email;

            console.log('Manual Exchange verified email:', email);

            if (!email) {
                return ctx.badRequest('Google Account has no email');
            }

            // B. Find or Create User
            let user = await strapi.query('plugin::users-permissions.user').findOne({
                where: { email }
            });

            if (!user) {
                console.log('Creating new user from Manual Exchange...');
                const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });

                // Safe username generation
                const baseUsername = email.split('@')[0];
                const uniqueSuffix = Math.floor(Math.random() * 10000);

                const newUserPayload = {
                    username: `${baseUsername}_${uniqueSuffix}`,
                    email: email,
                    provider: 'google',
                    password: Math.random().toString(36).slice(-8),
                    confirmed: true,
                    blocked: false,
                    role: role.id
                };

                user = await strapi.query('plugin::users-permissions.user').create({
                    data: newUserPayload
                });
            }

            // C. Issue JWT
            const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });

            // Return standard Auth response
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
            console.error('Manual Exchange Error:', err);
            return ctx.badRequest('Exchange Failed: ' + err.message);
        }
    };

    // 2. Register the Custom Route
    plugin.routes['content-api'].routes.push({
        method: 'POST',
        path: '/auth/google/manual-exchange',
        handler: 'auth.googleManualExchange',
        config: {
            prefix: '',
            policies: [] // Open to public
        }
    });

    return plugin;
};
