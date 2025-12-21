
export default (config, { strapi }) => {
    return async (ctx, next) => {
        if (ctx.method === 'POST' && ctx.url === '/api/manual-exchange') {
            console.log('Middleware: Intercepting Google Exchange Request');
            try {
                const { access_token } = ctx.request.body;

                if (!access_token) {
                    return ctx.badRequest('access_token is required');
                }

                // 1. Verify with Google
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${access_token}` }
                });

                if (!userInfoRes.ok) {
                    return ctx.badRequest('Invalid Google Access Token');
                }

                const googleUser = await userInfoRes.json() as any;
                const email = googleUser.email;
                console.log('Middleware Verified Email:', email);

                if (!email) {
                    return ctx.badRequest('Google Account has no email');
                }

                // 2. Find or Create User
                // Use query API which is lower-level and safer here
                let user = await strapi.query('plugin::users-permissions.user').findOne({
                    where: { email }
                });

                if (!user) {
                    console.log('Middleware: Creating new user...');
                    const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });
                    const baseUsername = email.split('@')[0];

                    user = await strapi.query('plugin::users-permissions.user').create({
                        data: {
                            username: `${baseUsername}_${Math.floor(Math.random() * 10000)}`,
                            email,
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

                // Respond directly
                ctx.body = {
                    jwt,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        confirmed: user.confirmed,
                        provider: user.provider
                    }
                };
                return; // Return without calling next(), terminating the request

            } catch (err) {
                console.error('Middleware Exchange Error:', err);
                return ctx.badRequest('Middleware Exchange Error');
            }
        }

        await next();
    };
};
