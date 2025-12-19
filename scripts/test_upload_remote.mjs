
// Using global fetch available in Node.js 18+

const API_URL = 'https://shando5000-dealz.hf.space';
const TEST_USER = {
    email: 'seeder@bot.com', // Using the seeder account
    password: 'Password123!'
};

async function main() {
    console.log("🚀 Starting Upload Verification...");

    // 1. Auth
    const token = await login(TEST_USER);
    if (!token) {
        console.error("❌ Failed to authenticate.");
        return;
    }
    console.log("✅ Authenticated");

    // 2. Prepare Dummy File
    // Create a simple 1x1 transparent GIF buffer
    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([buffer], { type: 'image/gif' });

    // FormData
    const formData = new FormData();
    formData.append('files', blob, 'test_image.gif');

    // 3. Upload
    console.log("📤 Uploading file...");
    const uploadedFiles = await uploadFile(formData, token);

    if (uploadedFiles && uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        console.log(`✅ Upload Successful!`);
        console.log(`   ID: ${file.id}`);
        console.log(`   URL: ${file.url}`);

        if (file.url.includes('cloudinary.com')) {
            console.log("🎉 Verification Passed: Image is hosted on Cloudinary.");
        } else {
            console.warn("⚠️  Warning: Image URL does not look like Cloudinary. Check configuration.");
            console.warn(`   URL Pattern: ${file.url}`);
        }
    } else {
        console.error("❌ Upload Failed or no files returned.");
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
    } catch (e) {
        console.error("Login Check Failed:", e.message);
        return null;
    }
}

async function uploadFile(formData, token) {
    try {
        const res = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            console.error(`Upload error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(text);
            return null;
        }

        return await res.json();
    } catch (e) {
        console.error("Upload Exception:", e.message);
        return null;
    }
}

main();
