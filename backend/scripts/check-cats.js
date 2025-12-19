
async function checkCats() {
    const count = await strapi.db.query('api::category.category').count();
    const all = await strapi.db.query('api::category.category').findMany();
    console.log(`Count: ${count}`);
    console.log('Names:', all.map(c => c.name));
    process.exit(0);
}
checkCats();
