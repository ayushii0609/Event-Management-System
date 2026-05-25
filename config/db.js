
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ayushi@123#',
    database: 'event_management'
});

// Try to connect and show result in console
db.connect((err) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL database!');
    }
});

module.exports = db;
