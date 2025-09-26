const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: 6
    },
    scores: [{
        year: String,
        subject: String,
        score: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        date: { type: Date, default: Date.now }
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Add percentage calculation before saving scores
userSchema.methods.addScore = function(scoreData) {
    scoreData.percentage = (scoreData.score / scoreData.total) * 100;
    this.scores.push(scoreData);
    return this.save();
};

module.exports = mongoose.model('User', userSchema);