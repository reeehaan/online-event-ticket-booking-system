const router = require('express').Router();

const { verifyToken , verifyAttendee} = require('../Middleware/auth');
const Attendee = require('../Service/AttendeeService');

router.get('/get-all-event', verifyToken, verifyAttendee,  Attendee.getAllEvents);
router.get('/by-category', verifyToken, Attendee.getEventsByCategory);
router.get('/recent-events', verifyToken, Attendee.getRecentEvents);

module.exports = router;