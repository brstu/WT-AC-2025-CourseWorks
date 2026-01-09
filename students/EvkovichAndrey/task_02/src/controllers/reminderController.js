const Reminder = require('../models/Reminder');
const Habit = require('../models/Habit');

exports.createReminder = async (req, res, next) => {
    try {
        const { habitId, time, days, notificationType } = req.body;

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

        // Проверка формата времени
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный формат времени. Используйте HH:mm'
            });
        }

        const reminder = await Reminder.create({
            user: req.user._id,
            habit: habitId,
            time,
            days: days || [0, 1, 2, 3, 4, 5, 6], // Все дни по умолчанию
            notificationType: notificationType || 'push'
        });

        res.status(201).json({
            success: true,
            data: reminder
        });
    } catch (error) {
        next(error);
    }
};

exports.getReminders = async (req, res, next) => {
    try {
        const reminders = await Reminder.find({ user: req.user._id })
            .populate('habit', 'name category color')
            .sort({ time: 1 });

        res.json({
            success: true,
            data: reminders
        });
    } catch (error) {
        next(error);
    }
};

exports.toggleReminder = async (req, res, next) => {
    try {
        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: 'Напоминание не найдено'
            });
        }

        reminder.isActive = !reminder.isActive;
        await reminder.save();

        res.json({
            success: true,
            data: reminder
        });
    } catch (error) {
        next(error);
    }
};