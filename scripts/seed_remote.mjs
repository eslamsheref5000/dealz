// Using global fetch available in Node.js 18+

const API_URL = 'https://shando5000-dealz.hf.space';
const COUNTRIES = [
    { id: 'eg-ar', currency: 'EGP', cities: ['Cairo', 'Giza', 'Alexandria'] },
    { id: 'ae-en', currency: 'AED', cities: ['Dubai', 'Abu Dhabi', 'Sharjah'] },
    { id: 'sa-en', currency: 'SAR', cities: ['Riyadh', 'Jeddah', 'Dammam'] },
    { id: 'qa-en', currency: 'QAR', cities: ['Doha', 'Al Rayyan'] },
    { id: 'kw-en', currency: 'KWD', cities: ['Kuwait City', 'Hawalli'] }
];

const SEED_USER = {
    username: 'SeederBot',
    email: 'seeder@bot.com',
    password: 'Password123!'
};

const ITEMS = [
    { title: "iPhone 13 Pro Max", price: 3000, cat: "Mobiles" },
    { title: "Toyota Camry 2020", price: 45000, cat: "Motors" },
    { title: "Luxury Villa", price: 2500000, cat: "Properties" },
    { title: "Sony PlayStation 5", price: 2000, cat: "Electronics" },
    { title: "IKEA Sofa", price: 800, cat: "Furniture & Garden" },
    { title: "Rolex Watch", price: 15000, cat: "Fashion & Beauty" },
    { title: "MacBook Pro M1", price: 4000, cat: "Mobiles" }, // broadly electronics
    { title: "Honda Civic", price: 35000, cat: "Motors" },
    { title: "Apartment in Downtown", price: 1200000, cat: "Properties" },
    { title: "Samsung TV 65 Inch", price: 2500, cat: "Electronics" }
];

async function main() {
    console.log("🚀 Starting Seeding Process...");

    // 1. Auth / Register
    let token = await login(SEED_USER);
    if (!token) {
        console.log("⚠️  User not found, registering...");
        token = await register(SEED_USER);
    }
    if (!token) {
        console.error("❌ Failed to authenticate.");
        return;
    }
    console.log("✅ Authenticated as SeederBot");

    // 2. Fetch Metadata
    const categories = await fetchGet(`${API_URL}/api/categories?populate=sub_categories`);
    const files = await fetchGet(`${API_URL}/api/upload/files`);

    if (!categories || categories.length === 0) {
        console.error("❌ No categories found. Cannot seed.");
        return;
    }

    // We need at least one image to link. If none, we can't add images easily without uploading one.
    // For this script, we assume at least one file exists or we skip images.
    const imageIds = files ? files.map(f => f.id) : [];
    if (imageIds.length === 0) console.warn("⚠️  No uploaded files found. Products will have no images.");
    else console.log(`✅ Found ${imageIds.length} existing images to cycle through.`);

    // 3. Loop and Create
    for (const country of COUNTRIES) {
        console.log(`\n🌍 Seeding for ${country.id}...`);

        for (let i = 0; i < 20; i++) {
            const template = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            const category = categories.find(c => c.name === template.cat) || categories[0];
            const subCategory = category.sub_categories && category.sub_categories.length > 0
                ? category.sub_categories[Math.floor(Math.random() * category.sub_categories.length)]
                : null;

            const city = country.cities[Math.floor(Math.random() * country.cities.length)];
            const imageId = imageIds.length > 0 ? imageIds[Math.floor(Math.random() * imageIds.length)] : null;

            const product = {
                title: `${template.title} - ${Math.floor(Math.random() * 1000)}`,
                description: `This is a randomly generated description for ${template.title}. Great condition, available in ${city}. Contact for more details.`,
                price: template.price + Math.floor(Math.random() * 500),
                currency: country.currency,
                city: city,
                country: country.id,
                category: category.id,
                sub_category: subCategory ? subCategory.id : null,
                isFeatured: Math.random() > 0.8, // 20% chance
                approvalStatus: 'approved', // Auto approve
                publishedAt: new Date().toISOString(),
                year: 2020 + Math.floor(Math.random() * 5),
                mileage: Math.floor(Math.random() * 100000),
                images: imageId ? [imageId] : []
            };

            await createProduct(product, token);
            // Small delay to be nice to the server
            await new Promise(r => setTimeout(r, 100));
        }
    }

    console.log("\n🎉 Seeding Completed!");
}

async function fetchGet(url) {
    try {
        const res = await fetch(url);
        const json = await res.json();
        // Strapi returns { data: [...] } for content types, but array for /upload/files
        return Array.isArray(json) ? json : (json.data || []);
    } catch (e) {
        console.error("Fetch Error:", e.message);
        return [];
    }
}

async function login(user) {
    try {
        const res = await fetch(`${API_URL}/api/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: user.email, password: user.password })
        });
        const data = await res.json();
        return data.jwt;
    } catch (e) { return null; }
}

async function register(user) {
    try {
        const res = await fetch(`${API_URL}/api/auth/local/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const data = await res.json();
        return data.jwt;
    } catch (e) { return null; }
}

async function createProduct(data, token) {
    try {
        const res = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ data })
        });

        if (res.ok) process.stdout.write(".");
        else {
            const err = await res.json();
            process.stdout.write("x");
            // console.error(JSON.stringify(err));
        }
    } catch (e) {
        process.stdout.write("E");
    }
}

main();
