const Habit = require('../models/Habit');
const Entry = require('../models/Entry');
const { validationResult } = require('express-validator');
const moment = require('moment-timezone');

exports.createHabit = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const habit = await Habit.create({
            ...req.body,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            data: habit
        });
    } catch (error) {
        next(error);
    }
};

exports.getHabits = async (req, res, next) => {
    try {
        const { category, archived } = req.query;
        const filter = { user: req.user._id };

        if (category) filter.category = category;
        if (archived !== undefined) filter.isArchived = archived === 'true';

        const habits = await Habit.find(filter)
            .sort({ createdAt: -1 })
            .populate('user', 'username');

        // Добавляем статистику за сегодня
        const today = moment().startOf('day').toDate();
        const habitsWithToday = await Promise.all(
            habits.map(async (habit) => {
                const todayEntry = await Entry.findOne({
                    habit: habit._id,
                    date: { $gte: today }
                });
                return {
                    ...habit.toObject(),
                    completedToday: !!todayEntry,
                    todayValue: todayEntry?.value || 0
                };
            })
        );

        res.json({
            success: true,
            count: habits.length,
            data: habitsWithToday
        });
    } catch (error) {
        next(error);
    }
};

exports.getHabitById = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Привычка не найдена'
            });
        }

        // Статистика за последние 30 дней
        const thirtyDaysAgo = moment().subtract(30, 'days').startOf('day').toDate();
        const entries = await Entry.find({
            habit: habit._id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: 1 });

        const completionRate = entries.length / 30 * 100;

        res.json({
            success: true,
            data: {
                ...habit.toObject(),
                stats: {
                    totalEntries: entries.length,
                    completionRate: Math.round(completionRate),
                    last30Days: entries
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateHabit = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        let habit = await Habit.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Привычка не найдена'
            });
        }

        habit = await Habit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: habit
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Привычка не найдена'
            });
        }

        // Удаляем связанные записи и напоминания
        await Promise.all([
            Entry.deleteMany({ habit: habit._id }),
            require('../models/Reminder').deleteMany({ habit: habit._id })
        ]);

        res.json({
            success: true,
            message: 'Привычка удалена'
        });
    } catch (error) {
        next(error);
    }
};

exports.toggleArchive = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!habit) {
            return res.status(404).json({
                success: false,
                message: 'Привычка не найдена'
            });
        }

        habit.isArchived = !habit.isArchived;
        await habit.save();

        res.json({
            success: true,
            data: habit
        });
    } catch (error) {
        next(error);
    }
};

exports.getHabitStats = async (req, res, next) => {
    try {
        const { period = 'month' } = req.query;
        const user = req.user._id;

        const dateFilter = {
            day: moment().subtract(1, 'day'),
            week: moment().subtract(1, 'week'),
            month: moment().subtract(1, 'month'),
            year: moment().subtract(1, 'year')
        }[period] || moment().subtract(1, 'month');

        const stats = await Entry.aggregate([
            {
                $match: {
                    user: user,
                    date: { $gte: dateFilter.toDate() }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
                    },
                    count: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        const habits = await Habit.find({ user });
        const categories = [...new Set(habits.map(h => h.category))];

        const categoryStats = await Entry.aggregate([
            {
                $match: {
                    user: user,
                    date: { $gte: dateFilter.toDate() }
                }
            },
            {
                $lookup: {
                    from: 'habits',
                    localField: 'habit',
                    foreignField: '_id',
                    as: 'habitData'
                }
            },
            { $unwind: '$habitData' },
            {
                $group: {
                    _id: '$habitData.category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                period,
                totalHabits: habits.length,
                activeHabits: habits.filter(h => !h.isArchived).length,
                streak: req.user.streakStats.currentStreak,
                completionRate: stats.length > 0
                    ? Math.round((stats.reduce((a, b) => a + b.completed, 0) / stats.reduce((a, b) => a + b.count, 0)) * 100)
                    : 0,
                dailyStats: stats,
                categoryStats
            }
        });
    } catch (error) {
        next(error);
    }
};