const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { habitValidators } = require('../utils/validators');
const habitController = require('../controllers/habitController');

// Все маршруты требуют аутентификации
router.use(auth);

router.route('/')
    .post(habitValidators.create, habitController.createHabit)
    .get(habitController.getHabits);

router.get('/stats', habitController.getHabitStats);

router.route('/:id')
    .get(habitController.getHabitById)
    .put(habitValidators.create, habitController.updateHabit)
    .delete(habitController.deleteHabit);

router.put('/:id/archive', habitController.toggleArchive);

module.exports = router;