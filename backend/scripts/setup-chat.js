
async function setupPermissions() {
    try {
        const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
            where: { type: 'authenticated' }
        });

        if (!authenticatedRole) {
            console.error("Authenticated role not found");
            return;
        }

        const actions = [
            'api::message.message.find',
            'api::message.message.create'
        ];

        for (const action of actions) {
            const existing = await strapi.query('plugin::users-permissions.permission').findOne({
                where: { action, role: authenticatedRole.id }
            });

            if (!existing) {
                console.log(`Granting ${action} to Authenticated role...`);
                await strapi.query('plugin::users-permissions.permission').create({
                    data: {
                        action,
                        role: authenticatedRole.id
                    }
                });
            } else {
                console.log(`${action} already granted.`);
            }
        }

        console.log("Permissions setup complete.");
        process.exit(0);
    } catch (err) {
        console.error("Setup Error:", err);
        process.exit(1);
    }
}

setupPermissions();
