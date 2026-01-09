const { body } = require('express-validator');

const authValidators = {
    register: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Имя пользователя должно быть от 3 до 30 символов')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Имя пользователя может содержать только буквы, цифры и подчеркивания'),

        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Пожалуйста, введите корректный email'),

        body('password')
            .isLength({ min: 6 })
            .withMessage('Пароль должен быть минимум 6 символов')
            .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
            .withMessage('Пароль должен содержать хотя бы одну букву и одну цифру')
    ],

    login: [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ]
};

const habitValidators = {
    create: [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Название привычки обязательно')
            .isLength({ max: 100 })
            .withMessage('Название не должно превышать 100 символов'),

        body('description').optional().isLength({ max: 500 }),

        body('category')
            .isIn(['health', 'productivity', 'learning', 'sports', 'mindfulness', 'other'])
            .withMessage('Некорректная категория'),

        body('frequency')
            .isIn(['daily', 'weekly', 'custom'])
            .withMessage('Некорректная частота'),

        body('goal').optional().isFloat({ min: 0 }),

        body('color').optional().matches(/^#[0-9A-F]{6}$/i)
    ]
};

const goalValidators = {
    create: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Название цели обязательно')
            .isLength({ max: 200 }),

        body('target')
            .isFloat({ min: 1 })
            .withMessage('Цель должна быть не менее 1'),

        body('deadline')
            .optional()
            .isISO8601()
            .withMessage('Некорректный формат даты')
    ]
};

const entryValidators = {
    create: [
        body('habitId').isMongoId().withMessage('Некорректный ID привычки'),
        body('value').isFloat({ min: 0 }).withMessage('Значение должно быть неотрицательным'),
        body('date').optional().isISO8601(),
        body('mood').optional().isInt({ min: 1, max: 5 })
    ]
};

module.exports = {
    authValidators,
    habitValidators,
    goalValidators,
    entryValidators
};