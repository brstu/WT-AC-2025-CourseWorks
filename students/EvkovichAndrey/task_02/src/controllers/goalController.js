const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const { validationResult } = require('express-validator');

exports.createGoal = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const goal = await Goal.create({
            ...req.body,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            data: goal
        });
    } catch (error) {
        next(error);
    }
};

exports.getGoals = async (req, res, next) => {
    try {
        const { completed, category } = req.query;
        const filter = { user: req.user._id };

        if (completed !== undefined) {
            filter.isCompleted = completed === 'true';
        }

        if (category) filter.category = category;

        const goals = await Goal.find(filter)
            .sort({ deadline: 1, createdAt: -1 })
            .populate('relatedHabits', 'name color streak');

        res.json({
            success: true,
            count: goals.length,
            data: goals
        });
    } catch (error) {
        next(error);
    }
};

exports.updateGoalProgress = async (req, res, next) => {
    try {
        const { increment } = req.body;

        const goal = await Goal.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Цель не найдена'
            });
        }

        if (increment) {
            goal.current += parseFloat(increment);
        } else if (req.body.current !== undefined) {
            goal.current = req.body.current;
        }

        await goal.save();

        res.json({
            success: true,
            data: goal
        });
    } catch (error) {
        next(error);
    }
};

exports.completeGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Цель не найдена'
            });
        }

        goal.current = goal.target;
        await goal.save();

        res.json({
            success: true,
            data: goal,
            message: 'Цель достигнута! 🎉'
        });
    } catch (error) {
        next(error);
    }
};