
async function getProducts() {
    try {
        const res = await fetch('http://127.0.0.1:1338/api/products?populate=*');
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
}

getProducts();
