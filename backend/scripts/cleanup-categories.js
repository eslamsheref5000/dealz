
async function cleanupDuplicates() {
    try {
        const categories = await strapi.query('api::category.category').findMany();
        const seen = new Set();
        const toDelete = [];

        for (const cat of categories) {
            if (seen.has(cat.name)) {
                toDelete.push(cat.id);
            } else {
                seen.add(cat.name);
            }
        }

        for (const id of toDelete) {
            console.log(`Deleting duplicate category ID: ${id}`);
            await strapi.entityService.delete('api::category.category', id);
        }

        console.log("Cleanup complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanupDuplicates();
