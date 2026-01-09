const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    habit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
        required: true
    },
    time: {
        type: String, // Формат HH:mm
        required: true
    },
    days: [{
        type: Number, // 0-6 для дней недели
        min: 0,
        max: 6
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    notificationType: {
        type: String,
        enum: ['push', 'email', 'both'],
        default: 'push'
    },
    lastSent: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reminder', reminderSchema);