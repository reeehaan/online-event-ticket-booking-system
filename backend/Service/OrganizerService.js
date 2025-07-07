const Event = require('../Models/Event');

const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            subcategory,
            date,
            time,
            venue,
            image,
            maxAttendee
        } = req.body;

        // Validate required fields
        if (!title || !description || !category || !subcategory || !date || !time || !venue || !maxAttendee) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                requiredFields: ['title', 'description', 'category', 'subcategory', 'date', 'time', 'venue', 'maxAttendee']
            });
        }

        // Validate category
        if (!['Event', 'Theater'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category. Must be "Event" or "Theater"'
            });
        }

        // Validate date (must be in the future)
        const eventDate = new Date(date);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        if (eventDate < currentDate) {
            return res.status(400).json({
                success: false,
                message: 'Event date must be in the future'
            });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid time format. Use HH:MM format (e.g., 14:30)'
            });
        }

        // Validate maxAttendee
        if (maxAttendee <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Maximum attendees must be greater than 0'
            });
        }

        // Create new event
        const newEvent = new Event({
            title: title.trim(),
            description: description.trim(),
            category,
            subcategory: subcategory.trim(),
            date: eventDate,
            time: time.trim(),
            venue: venue.trim(),
            image: image ? image.trim() : null,
            maxAttendee: parseInt(maxAttendee),
            createdBy: req.user._id,
            status: 'published' // You can change this to 'draft' if you want events to be drafts initially
        });

        // Save event to database
        await newEvent.save();

        // Populate organizer details for response
        await newEvent.populate('createdBy', 'firstName lastName email organizationName organizationType');

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: {
                event: newEvent
            }
        });

    } catch (error) {
        console.error('Create event error:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error while creating event'
        });
    }
};

// Get events created by the authenticated organizer
const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user._id })
            .sort({ date: 1, time: 1 });

        res.json({
            success: true,
            message: 'Your events retrieved successfully',
            data: {
                events,
                count: events.length
            }
        });

    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving your events'
        });
    }
};
module.exports = {
    createEvent,
    getMyEvents
};