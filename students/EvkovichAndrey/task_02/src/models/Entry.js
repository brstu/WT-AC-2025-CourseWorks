const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    note: {
        type: String,
        trim: true,
        maxlength: 500
    },
    mood: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    isCompleted: {
        type: Boolean,
        default: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Составной индекс для уникальности записи на день
entrySchema.index({ user: 1, habit: 1, date: 1 }, { unique: true });

// Индексы для статистики
entrySchema.index({ user: 1, date: 1 });
entrySchema.index({ habit: 1, date: 1 });

module.exports = mongoose.model('Entry', entrySchema);