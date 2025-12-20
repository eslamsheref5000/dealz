const url = require('url');

module.exports = (plugin) => {
    const originalCallback = plugin.controllers.auth.callback;

    plugin.controllers.auth.callback = async (ctx) => {
        console.log('!!! CUSTOM CALLBACK TRIGGERED !!!');

        try {
            // 1. Run default callback to handle the OAuth Exchange
            await originalCallback(ctx);

            // 2. Check the response/redirect
            // Strapi usually sets ctx.body = { ... } if it returns JSON, 
            // or ctx.redirect() which sets the Location header.

            // If Strapi already redirected, we need to intercept that redirect URL
            const redirectUrl = ctx.response.get('Location');

            if (redirectUrl) {
                console.log('Intercepted Redirect URL:', redirectUrl);

                const parsedUrl = url.parse(redirectUrl, true);
                const params = parsedUrl.query;

                // If we have access_token (Google) but NOT jwt/token (Strapi)
                // Note: Strapi usually sends 'jwt' or 'token' in the redirect params.
                if ((params.access_token || params.id_token) && !params.jwt) {
                    console.log("Found Google Token but no Strapi JWT. Fixing...");

                    const googleAccessToken = params.access_token;

                    if (googleAccessToken) {
                        // 3. Manually fetch user info from Google
                        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${googleAccessToken}` }
                        });

                        if (userInfoRes.ok) {
                            const googleUser = await userInfoRes.json();
                            const email = googleUser.email;
                            console.log("Identified Google User:", email);

                            // 4. Find or Create User in Strapi
                            let user = await strapi.query('plugin::users-permissions.user').findOne({
                                where: { email }
                            });

                            if (!user) {
                                console.log("User not found, creating...");
                                // Create user
                                const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });

                                user = await strapi.query('plugin::users-permissions.user').create({
                                    data: {
                                        username: email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
                                        email: email,
                                        provider: 'google',
                                        password: Math.random().toString(36).slice(-8), // Random password
                                        confirmed: true,
                                        blocked: false,
                                        role: role.id
                                    }
                                });
                            }

                            // 5. Issue Strapi JWT
                            const jwt = strapi.plugin('users-permissions').service('jwt').issue({ id: user.id });
                            console.log("Generated Strapi JWT for user:", user.id);

                            // 6. Construct new Redirect URL with JWT
                            delete params.access_token; // Remove Google token to avoid confusion
                            delete params.raw;
                            delete params.id_token;

                            params.jwt = jwt;
                            params.user = JSON.stringify({
                                id: user.id,
                                username: user.username,
                                email: user.email
                            });

                            // Rebuild URL
                            // We must use the frontend redirect URL we know
                            // 'https://dealz-market.vercel.app/connect/google/redirect' or similar.
                            // Usually parsedUrl.pathname is correct, but let's be safe and use the base from the intercepted URL

                            const newQuery = new URLSearchParams(params).toString();
                            const cleanBaseUrl = redirectUrl.split('?')[0];
                            const newRedirectUrl = `${cleanBaseUrl}?${newQuery}`;

                            console.log("Redirecting to (FIXED):", newRedirectUrl);

                            return ctx.redirect(newRedirectUrl);
                        }
                    }
                }
            }

        } catch (err) {
            console.error('Custom Callback Error:', err);
            // Fallback to original behavior if our hack fails
            // throw err; // Don't throw, let original response stand if possible, or return error
            return ctx.badRequest(err.toString());
        }
    };

    return plugin;
};
