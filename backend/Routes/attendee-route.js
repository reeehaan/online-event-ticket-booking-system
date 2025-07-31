const router = require('express').Router();

const { verifyToken , verifyAttendee} = require('../Middleware/auth');
const Attendee = require('../Service/AttendeeService');

router.get('/get-all-event', verifyToken,  Attendee.getAllEvents);
router.get('/by-category', verifyToken, Attendee.getEventsByCategory);
router.get('/recent-events', verifyToken, Attendee.getRecentEvents);


router.get('/booking-history', verifyToken, Attendee.getBookingHistory);
router.get('/booking-stats', verifyToken, Attendee.getBookingStats);

module.exports = router;