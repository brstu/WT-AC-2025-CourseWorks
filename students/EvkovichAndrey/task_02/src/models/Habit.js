const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        enum: ['health', 'productivity', 'learning', 'sports', 'mindfulness', 'other'],
        default: 'other'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'daily'
    },
    customDays: [{
        type: Number, // 0-6 для дней недели
        min: 0,
        max: 6
    }],
    goal: {
        type: Number, // Например, 10 минут, 8 стаканов воды
        default: 1
    },
    unit: {
        type: String, // минут, раз, страниц и т.д.
        default: 'times'
    },
    color: {
        type: String,
        default: '#4CAF50'
    },
    icon: {
        type: String,
        default: 'check'
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastCompleted: {
        type: Date
    },
    streak: {
        type: Number,
        default: 0
    },
    bestStreak: {
        type: Number,
        default: 0
    }
});

// Индексы для быстрого поиска
habitSchema.index({ user: 1, isArchived: 1 });
habitSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Habit', habitSchema);