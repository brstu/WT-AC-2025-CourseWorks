const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { entryValidators } = require('../utils/validators');
const entryController = require('../controllers/entryController');

router.use(auth);

router.route('/')
    .post(entryValidators.create, entryController.createEntry)
    .get(entryController.getEntries);

router.get('/calendar', entryController.getCalendarData);

router.route('/:id')
    .put(entryValidators.create, entryController.updateEntry)
    .delete(entryController.deleteEntry);

module.exports = router;