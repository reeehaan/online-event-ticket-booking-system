const router = require('express').Router();

const Event = require('../Service/OrganizerService');

const {verifyToken,verifyOrganizer ,verifyAttendee} = require('../Middleware/auth');

//Create Event component routes
router.post('/create-event', verifyToken, Event.createEvent);

//Manage event component routes
router.get('/get-my-events',  verifyToken,Event.getMyEvents);

router.patch('/update-event/:eventId',  verifyToken,Event.updateEvent);

// Ticket management routes - matching frontend calls
router.post('/add-ticket/:eventId',  verifyToken, Event.addTicketToEvent);

router.patch('/update-ticket/:eventId/:ticketId',  verifyToken, Event.updateTicket);

router.delete('/delete-ticket/:eventId/:ticketId',  verifyToken, Event.deleteTicket);

router.patch('/toggle-ticket-status/:eventId/:ticketId',  verifyToken, Event.toggleTicketStatus);

router.get('/get-event-tickets/:eventId',  verifyToken, Event.getEventTickets);

router.delete('/delete-event/:eventId',  verifyToken, Event.deleteEvent);

module.exports = router;