const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { goalValidators } = require('../utils/validators');
const goalController = require('../controllers/goalController');

router.use(auth);

router.route('/')
    .post(goalValidators.create, goalController.createGoal)
    .get(goalController.getGoals);

router.put('/:id/progress', goalController.updateGoalProgress);
router.put('/:id/complete', goalController.completeGoal);

module.exports = router;