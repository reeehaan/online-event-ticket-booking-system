const router = require('express').Router();

const Event = require('../Service/OrganizerService');

const {verifyToken} = require('../Middleware/auth');

router.post('/create-event',verifyToken,Event.createEvent);

module.exports = router;