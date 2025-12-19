
// Using global fetch (Node 18+)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://shando5000-dealz.hf.space';
const ARTIFACTS_DIR = 'C:/Users/shando/.gemini/antigravity/brain/5ce8f1f8-36e4-4a16-81e7-ee4c13b424d5';

const SEED_USER = {
    email: 'seeder@bot.com',
    password: 'Password123!'
};

const COUNTRIES = [
    { id: 'Egypt', currency: 'EGP', cities: ['Cairo', 'Giza', 'Alexandria', 'Sharm El Sheikh', 'Hurghada'] },
    { id: 'UAE', currency: 'AED', cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'] },
    { id: 'KSA', currency: 'SAR', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'] }
];

const ITEMS = [
    { title: "iPhone 15 Pro Max", price: 4500, cat: "Mobiles", sub: "Mobile Phones", imgKeyword: "iphone" },
    { title: "Mercedes Benz S-Class", price: 350000, cat: "Motors", sub: "Used Cars", imgKeyword: "car" },
    { title: "Luxury Villa with Pool", price: 5000000, cat: "Properties", sub: "Villas for Sale", imgKeyword: "villa" },
    { title: "MacBook Pro M2", price: 6000, cat: "Electronics", sub: "Laptops", imgKeyword: "macbook" },
    { title: "Toyota Land Cruiser", price: 250000, cat: "Motors", sub: "Used Cars", imgKeyword: "car" },
    { title: "Modern Apartment", price: 1500000, cat: "Properties", sub: "Apartments for Sale", imgKeyword: "villa" }, // Fallback to villa img if apartment missing
    { title: "PlayStation 5 Slim", price: 1800, cat: "Electronics", sub: "Video Games & Consoles", imgKeyword: "macbook" }, // Fallback
    { title: "Samsung Galaxy S24", price: 3800, cat: "Mobiles", sub: "Mobile Phones", imgKeyword: "iphone" },
    { title: "Dell XPS 13", price: 5000, cat: "Electronics", sub: "Laptops", imgKeyword: "macbook" },
    { title: "Palm Jumeirah Villa", price: 12000000, cat: "Properties", sub: "Villas for Sale", imgKeyword: "villa" },
    { title: "BMW X5 2023", price: 280000, cat: "Motors", sub: "Used Cars", imgKeyword: "car" },
    { title: "Gaming PC RTX 4090", price: 12000, cat: "Electronics", sub: "Computers & Networking", imgKeyword: "macbook" }
];

async function main() {
    console.log("🚀 Starting Seeding with Images...");

    // 1. Auth
    const token = await login(SEED_USER);
    if (!token) {
        console.error("❌ Auth Failed");
        return;
    }
    console.log("✅ Authenticated");

    // 2. Scan and Upload Images
    const files = fs.readdirSync(ARTIFACTS_DIR).filter(f => f.endsWith('.png') && f.startsWith('seed_'));
    console.log(`📸 Found ${files.length} images to upload:`, files);

    const uploadedImages = {}; // Map keyword -> imageId

    for (const file of files) {
        const filePath = path.join(ARTIFACTS_DIR, file);
        const imageId = await uploadImage(filePath, token);
        if (imageId) {
            // Determine keyword from filename (e.g., seed_car_luxury -> car)
            if (file.includes('car')) uploadedImages['car'] = imageId;
            if (file.includes('iphone')) uploadedImages['iphone'] = imageId;
            if (file.includes('villa')) uploadedImages['villa'] = imageId;
            if (file.includes('macbook')) uploadedImages['macbook'] = imageId;
        }
    }

    // Fill gaps if some images failed generation
    const availableIds = Object.values(uploadedImages);
    if (availableIds.length === 0) {
        console.warn("⚠️ No images uploaded. Seeding text only.");
    } else {
        console.log("✅ Images ready:", uploadedImages);
    }

    // 3. Fetch Categories
    const categories = await fetchGet(`${API_URL}/api/categories?populate=sub_categories`);

    // 4. Create Products
    for (const country of COUNTRIES) {
        console.log(`\n🌍 Seeding ${country.id}...`);

        for (let i = 0; i < 15; i++) { // Generated 15 items per country
            const template = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            const category = categories.find(c => c.name === template.cat);
            if (!category) continue;

            const subCategory = category.sub_categories?.find(s => s.name === template.sub) || category.sub_categories?.[0];
            const city = country.cities[Math.floor(Math.random() * country.cities.length)];

            // Select Image
            let imageId = uploadedImages[template.imgKeyword];
            if (!imageId && availableIds.length > 0) imageId = availableIds[0]; // Fallback

            const product = {
                title: `${template.title}`,
                description: `Experience the best with this ${template.title}. In excellent condition. Contact us for more details about this amazing offer in ${city}.`,
                price: template.price + Math.floor(Math.random() * 500),
                currency: country.currency,
                city: city,
                country: country.id,
                category: category.id,
                sub_category: subCategory ? subCategory.id : null,
                isFeatured: Math.random() > 0.7,
                approvalStatus: 'approved',
                publishedAt: new Date().toISOString(),
                year: 2021 + Math.floor(Math.random() * 3),
                mileage: Math.floor(Math.random() * 50000),
                images: imageId ? [imageId] : []
            };

            await createProduct(product, token);
        }
    }
    console.log("\n🎉 Seeding Finished!");
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

async function uploadImage(filePath, token) {
    try {
        const buffer = fs.readFileSync(filePath);
        const blob = new Blob([buffer], { type: 'image/png' });
        const formData = new FormData();
        formData.append('files', blob, path.basename(filePath));

        const res = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (data && data[0] && data[0].id) {
            console.log(`   ✅ Uploaded ${path.basename(filePath)} -> ID: ${data[0].id}`);
            return data[0].id;
        }
        return null;
    } catch (e) {
        console.error(`   ❌ Failed to upload ${path.basename(filePath)}`, e.message);
        return null;
    }
}

async function fetchGet(url) {
    const res = await fetch(url);
    const json = await res.json();
    return json.data || [];
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
        if (res.ok) process.stdout.write("P"); // P for Product
        else process.stdout.write("x");
    } catch (e) { process.stdout.write("E"); }
}

main();
