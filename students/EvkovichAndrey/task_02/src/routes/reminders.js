const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const reminderController = require('../controllers/reminderController');

router.use(auth);

router.route('/')
    .post(reminderController.createReminder)
    .get(reminderController.getReminders);

router.put('/:id/toggle', reminderController.toggleReminder);

module.exports = router;