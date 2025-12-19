const { createStrapi } = require('@strapi/strapi');

// Simple slugify fallback
const makeSlug = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

async function backfill() {
    const strapi = await createStrapi({ distDir: './dist' }).load();

    try {
        const products = await strapi.documents('api::product.product').findMany({
            status: 'published', // and drafts? strapi doc service usually handles both if not specified, usually safer to just iterate
            populate: ['localizations'] // just in case
        });

        console.log(`Found ${products.length} products.Checking slugs...`);

        for (const product of products) {
            if (!product.slug || product.slug === '') {
                const newSlug = makeSlug(product.title) + '-' + product.id; // Append ID to ensure uniqueness easily
                console.log(`Updating product ${product.id} (${product.title}) -> ${newSlug} `);

                await strapi.documents('api::product.product').update({
                    documentId: product.documentId,
                    data: {
                        slug: newSlug
                    },
                    status: product.publishedAt ? 'published' : 'draft'
                });
            }
        }
        console.log("Backfill complete.");
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}

backfill();
