
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../routes_fast.txt');
try {
    const content = fs.readFileSync(filePath, 'utf16le'); // PowerShell default
    const lines = content.split('\n');
    const matches = lines.filter(l => l.includes('auth-google') || l.includes('login'));
    console.log("MATCHES FOUND:");
    console.log(matches.join('\n'));
} catch (e) {
    try {
        // Try utf8 if utf16 fails
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const matches = lines.filter(l => l.includes('auth-google') || l.includes('login'));
        console.log("MATCHES FOUND (UTF8):");
        console.log(matches.join('\n'));
    } catch (e2) {
        console.error("Error reading file:", e2);
    }
}
