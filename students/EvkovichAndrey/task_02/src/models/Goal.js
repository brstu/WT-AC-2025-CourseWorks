const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    target: {
        type: Number,
        required: true,
        min: 1
    },
    current: {
        type: Number,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        required: true
    },
    deadline: {
        type: Date
    },
    category: {
        type: String,
        enum: ['habit', 'reading', 'sports', 'learning', 'other'],
        default: 'other'
    },
    progress: {
        type: Number, // Процент выполнения 0-100
        default: 0,
        min: 0,
        max: 100
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    relatedHabits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

// Автоматический расчет прогресса
goalSchema.pre('save', function(next) {
    if (this.target > 0) {
        this.progress = Math.min(100, Math.round((this.current / this.target) * 100));
        this.isCompleted = this.progress >= 100;
        if (this.isCompleted && !this.completedAt) {
            this.completedAt = new Date();
        }
    }
    next();
});

module.exports = mongoose.model('Goal', goalSchema);