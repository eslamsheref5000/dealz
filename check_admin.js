const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'backend', '.tmp', 'data.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, username, email, isAdmin FROM up_users", [], (err, rows) => {
    if (err) {
        console.error("Error reading users:", err);
        return;
    }
    console.log("Users in database:");
    console.table(rows);
    db.close();
});
