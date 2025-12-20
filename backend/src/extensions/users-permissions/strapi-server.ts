import url from 'url';

console.log('!!! USERS-PERMISSIONS EXTENSION LOADED !!!');

export default (plugin) => {
    const originalCallback = plugin.controllers.auth.callback;

    plugin.controllers.auth.callback = async (ctx) => {
        console.log('!!! CUSTOM CALLBACK TRIGGERED (TS) !!!');

        try {
            // 1. Run default callback
            await originalCallback(ctx);

            // 2. Check the response/redirect
            const redirectUrl = ctx.response.get('Location');

            if (redirectUrl) {
                console.log('Intercepted Redirect URL:', redirectUrl);

                const parsedUrl = url.parse(redirectUrl, true);
                const params = parsedUrl.query;

                // If we have access_token (Google) but NO jwt (Strapi)
                if ((params.access_token || params.id_token) && !params.jwt) {
                    console.log("Found Google Token but no Strapi JWT. Fixing...");

                    const googleAccessToken = params.access_token;

                    if (googleAccessToken) {
                        // 3. Manually fetch user info from Google
                        // Using global fetch (Node 18+)
                        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${googleAccessToken}` }
                        });

                        if (userInfoRes.ok) {
                            const googleUser = await userInfoRes.json() as any;
                            const email = googleUser.email;
                            console.log("Identified Google User:", email);

                            // 4. Find or Create User in Strapi
                            let user = await strapi.query('plugin::users-permissions.user').findOne({
                                where: { email }
                            });

                            if (!user) {
                                console.log("User not found, creating...");
                                const role = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });

                                user = await strapi.query('plugin::users-permissions.user').create({
                                    data: {
                                        username: email.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
                                        email: email,
                                        provider: 'google',
                                        password: Math.random().toString(36).slice(-8),
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
                            // Remove Google params
                            const newParams = { ...params };
                            delete newParams.access_token;
                            delete newParams.raw;
                            delete newParams.id_token;
                            delete newParams.scope;
                            delete newParams.token_type;
                            delete newParams.expires_in;
                            delete newParams.authuser;
                            delete newParams.prompt;

                            // Add Strapi params
                            newParams.jwt = jwt;
                            newParams.user = JSON.stringify({
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                provider: 'google',
                                confirmed: user.confirmed
                            });

                            // Rebuild URL
                            // Use URLSearchParams for safety
                            const cleanBaseUrl = redirectUrl.split('?')[0];
                            // Note: URLSearchParams accepts an object but values must be strings. 
                            // We need to ensure nothing is undefined/null or object
                            const queryParams = new URLSearchParams();

                            Object.entries(newParams).forEach(([key, value]) => {
                                if (typeof value === 'object') {
                                    queryParams.append(key, JSON.stringify(value));
                                } else if (value !== undefined && value !== null) {
                                    queryParams.append(key, String(value));
                                }
                            });

                            // Override the previously stringified user which might be double encoded if not careful, 
                            // but here we are building fresh.
                            // Actually, 'user' above is already stringified.

                            const newRedirectUrl = `${cleanBaseUrl}?${queryParams.toString()}`;

                            console.log("Redirecting to (FIXED):", newRedirectUrl);

                            return ctx.redirect(newRedirectUrl);
                        }
                    }
                }
            }

        } catch (err) {
            console.error('Custom Callback Error:', err);
            // Even if error, return whatever original callback did if possible, or bad request
            if (!ctx.body && !ctx.response.get('Location')) {
                return ctx.badRequest("Custom Auth Error: " + err.message);
            }
        }
    };

    return plugin;
};
