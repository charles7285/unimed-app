const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(require('cors')());

// =======================
// SIMPLE FILE-BASED DATABASE
// =======================
const dbFile = path.join(__dirname, 'database.json');

// Initialize database file if missing
if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify({ users: [] }));
}

// Helper functions for file-based database
function readDB() {
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// =======================
// API Routes
// =======================

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ Backend is working! No MongoDB needed!' });
});

// Example register route (you can add your full version here)
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.users.push({ username, password: hashedPassword });
    writeDB(db);

    res.json({ message: '✅ User registered successfully' });
});

// =======================
// Serve Frontend
// =======================
// Note: frontend is OUTSIDE backend folder
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// =======================
// Start server
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`💾 Using file-based database (no MongoDB required!)`);
});