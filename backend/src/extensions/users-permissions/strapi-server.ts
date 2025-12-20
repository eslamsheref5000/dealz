module.exports = (plugin) => {
    const originalCallback = plugin.controllers.auth.callback;

    plugin.controllers.auth.callback = async (ctx) => {
        console.log('!!! CUSTOM CALLBACK TRIGGERED !!!');
        console.log('Query:', ctx.query);

        try {
            // Call the original callback
            await originalCallback(ctx);

            // Inspect what Strapi put in the response body
            const response = ctx.body;
            console.log('Original Callback Response:', JSON.stringify(response, null, 2));

            // If we have an id_token (Google) but no Strapi JWT, something is wrong
            if (response && response.id_token && !response.jwt) {
                console.log("DETECTED GOOGLE TOKEN BUT NO STRAPI JWT. ATTEMPTING FIX...");

                // We need to forcefully authenticate/create the user here manually if Strapi didn't.
                // However, usually if Strapi returns the provider token, it means it returned EARLY.
                // This often happens if the email is not verified or some other check failed silently.

                // Let's try to find the user by email from the Google ID Token (decoded) or just trust the process.
                // Since decoding is hard without libs, we rely on the fact that if we got here, Google is happy.
            }

        } catch (err) {
            console.error('Callback Error:', err);
            throw err;
        }
    };

    return plugin;
};
