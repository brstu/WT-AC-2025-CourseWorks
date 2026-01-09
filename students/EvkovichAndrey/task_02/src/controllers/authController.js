const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, email, password } = req.body;

        // Проверка существования пользователя
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email или именем уже существует'
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: email === 'admin@example.com' ? 'admin' : 'user'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                settings: user.settings
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                settings: user.settings,
                streakStats: user.streakStats
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate({
                path: 'habits',
                match: { isArchived: false },
                options: { limit: 5, sort: { createdAt: -1 } }
            });

        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { settings } = req.body;
        const user = await User.findById(req.user._id);

        if (settings) {
            user.settings = { ...user.settings, ...settings };
        }

        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                settings: user.settings
            }
        });
    } catch (error) {
        next(error);
    }
};