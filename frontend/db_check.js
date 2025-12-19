
async function check() {
    try {
        const res = await fetch("http://127.0.0.1:1338/api/products?populate=ad_owner&sort=createdAt:desc&pagination[limit]=5");
        const data = await res.json();
        console.log("Recent Products with Owners:");
        data.data.forEach(p => {
            console.log(`Product ID: ${p.id} | Title: ${p.title} | Owner ID: ${p.ad_owner?.id} | Owner Username: ${p.ad_owner?.username}`);
        });
    } catch (e) {
        console.error(e);
    }
}
check();
