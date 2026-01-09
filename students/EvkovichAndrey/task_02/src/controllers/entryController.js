const Entry = require('../models/Entry');
const Habit = require('../models/Habit');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const moment = require('moment-timezone');

exports.createEntry = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { habitId, value, note, mood, date } = req.body;

        const habit = await Habit.findOne({
            _id: habitId,
            user: req.user._id
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Привычка не найдена'
            });
        }

        const entryDate = date ? new Date(date) : new Date();
        entryDate.setHours(0, 0, 0, 0);

        // Проверяем существующую запись
        const existingEntry = await Entry.findOne({
            user: req.user._id,
            habit: habitId,
            date: entryDate
        });

        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: 'Запись на эту дату уже существует'
            });
        }

        const entry = await Entry.create({
            user: req.user._id,
            habit: habitId,
            date: entryDate,
            value,
            note,
            mood,
            completedAt: new Date()
        });

        // Обновляем streak привычки
        const yesterday = moment(entryDate).subtract(1, 'day').toDate();
        const yesterdayEntry = await Entry.findOne({
            habit: habitId,
            date: yesterday
        });

        if (yesterdayEntry) {
            habit.streak += 1;
        } else {
            habit.streak = 1;
        }

        if (habit.streak > habit.bestStreak) {
            habit.bestStreak = habit.streak;
        }

        habit.lastCompleted = new Date();
        await habit.save();

        // Обновляем streak пользователя
        const user = await User.findById(req.user._id);
        const userYesterdayEntry = await Entry.findOne({
            user: req.user._id,
            date: yesterday
        });

        if (userYesterdayEntry) {
            user.streakStats.currentStreak += 1;
        } else {
            user.streakStats.currentStreak = 1;
        }

        if (user.streakStats.currentStreak > user.streakStats.longestStreak) {
            user.streakStats.longestStreak = user.streakStats.currentStreak;
        }

        user.streakStats.totalCompleted += 1;
        await user.save();

        res.status(201).json({
            success: true,
            data: entry
        });
    } catch (error) {
        next(error);
    }
};

exports.getEntries = async (req, res, next) => {
    try {
        const {
            habitId,
            startDate,
            endDate,
            page = 1,
            limit = 20
        } = req.query;

        const filter = { user: req.user._id };

        if (habitId) filter.habit = habitId;

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [entries, total] = await Promise.all([
            Entry.find(filter)
                .populate('habit', 'name category color')
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Entry.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: entries,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateEntry = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const entry = await Entry.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('habit');

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Запись не найдена'
            });
        }

        Object.assign(entry, req.body);
        await entry.save();

        res.json({
            success: true,
            data: entry
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteEntry = async (req, res, next) => {
    try {
        const entry = await Entry.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Запись не найдена'
            });
        }

        res.json({
            success: true,
            message: 'Запись удалена'
        });
    } catch (error) {
        next(error);
    }
};

exports.getCalendarData = async (req, res, next) => {
    try {
        const { year, month } = req.query;

        // Используем moment для создания дат
        const date = moment()
            .year(year || moment().year())
            .month(month || moment().month());

        const startDate = date.clone().startOf('month').toDate();
        const endDate = date.clone().endOf('month').toDate();

        const entries = await Entry.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        }).populate('habit', 'name color');

        // Группируем по дням
        const daysInMonth = date.daysInMonth();
        const calendarData = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = date.clone().date(day).startOf('day').toDate();
            const dayEntries = entries.filter(entry =>
                moment(entry.date).isSame(currentDate, 'day')
            );

            calendarData.push({
                date: currentDate,
                day,
                completed: dayEntries.length,
                entries: dayEntries.map(e => ({
                    id: e._id,
                    habitName: e.habit.name,
                    habitColor: e.habit.color,
                    value: e.value,
                    mood: e.mood
                }))
            });
        }

        res.json({
            success: true,
            data: calendarData,
            month: date.format('MMMM YYYY'),
            totalCompleted: entries.length
        });
    } catch (error) {
        next(error);
    }
};