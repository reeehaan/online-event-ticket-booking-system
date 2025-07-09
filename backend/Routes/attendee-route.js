const router = require('express').Router();

const { verifyToken } = require('../Middleware/auth');
const Attendee = require('../Service/AttendeeService');

router.get('/get-all-event', verifyToken, Attendee.getAllEvents);

module.exports = router;