const router = require('express').Router();

const Event = require('../Service/OrganizerService');

const {verifyToken,verifyOrganizer ,verifyAttendee} = require('../Middleware/auth');

router.post('/create-event', verifyToken, Event.createEvent);

router.get('/get-my-events', verifyToken,verifyOrganizer, Event.getMyEvents);

router.patch('/update-event/:eventId', verifyToken, Event.updateEvent);

router.delete('/delete-event/:eventId', verifyToken, verifyOrganizer, Event.deleteEvent);


module.exports = router;