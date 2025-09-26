const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// SIMPLE FILE-BASED DATABASE (No MongoDB needed!)
const dbFile = path.join(__dirname, 'database.json');

// Initialize database file
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

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ Backend is working! No MongoDB needed!' });
});

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const db = readDB();
        
        // Check if user exists
        const existingUser = db.users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            scores: [],
            createdAt: new Date().toISOString()
        };
        
        db.users.push(newUser);
        writeDB(db);
        
        // Create token
        const token = jwt.sign({ userId: newUser.id }, 'unimed-secret-key');
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const db = readDB();
        const user = db.users.find(user => user.email === email);
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user.id }, 'unimed-secret-key');
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Save Score
app.post('/api/save-score', async (req, res) => {
    try {
        const { token, year, subject, score, total } = req.body;
        
        const decoded = jwt.verify(token, 'unimed-secret-key');
        const db = readDB();
        const user = db.users.find(user => user.id === decoded.userId);
        
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        user.scores.push({
            year,
            subject,
            score,
            total,
            percentage: (score / total) * 100,
            date: new Date().toISOString()
        });
        
        writeDB(db);
        res.json({ success: true, message: 'Score saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Scores
app.get('/api/scores', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, 'unimed-secret-key');
        const db = readDB();
        const user = db.users.find(user => user.id === decoded.userId);
        
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        res.json({ success: true, scores: user.scores });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`💾 Using file-based database (no MongoDB required!)`);
});