const Event = require('../Models/Event');
const Ticket = require('../Models/Ticket');

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
            maxAttendee,
            tickets 
        } = req.body;

        
        if (!title || !description || !category || !subcategory || !date || !time || !venue || !maxAttendee) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                requiredFields: ['title', 'description', 'category', 'subcategory', 'date', 'time', 'venue', 'maxAttendee']
            });
        }

        
        if (!['Event', 'Theater'].includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category. Must be "Event" or "Theater"'
            });
        }

        
        const eventDate = new Date(date);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        if (eventDate < currentDate) {
            return res.status(400).json({
                success: false,
                message: 'Event date must be in the future'
            });
        }

        
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid time format. Use HH:MM format (e.g., 14:30)'
            });
        }

        
        if (maxAttendee <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Maximum attendees must be greater than 0'
            });
        }

        
        if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one ticket type is required'
            });
        }

        if (tickets.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 ticket types allowed per event'
            });
        }

        
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            
            if (!ticket.name || !ticket.price || !ticket.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Ticket ${i + 1}: Missing required fields (name, price, quantity)`
                });
            }

            if (ticket.price < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Ticket ${i + 1}: Price must be 0 or greater`
                });
            }

            if (ticket.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Ticket ${i + 1}: Quantity must be greater than 0`
                });
            }

            if (ticket.maxPerPurchase && ticket.maxPerPurchase <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Ticket ${i + 1}: Max per purchase must be greater than 0`
                });
            }

            
            if (ticket.saleStartDate) {
                const saleStartDate = new Date(ticket.saleStartDate);
                if (saleStartDate < currentDate) {
                    return res.status(400).json({
                        success: false,
                        message: `Ticket ${i + 1}: Sale start date must be in the future`
                    });
                }
            }

            if (ticket.saleEndDate) {
                const saleEndDate = new Date(ticket.saleEndDate);
                if (saleEndDate < currentDate) {
                    return res.status(400).json({
                        success: false,
                        message: `Ticket ${i + 1}: Sale end date must be in the future`
                    });
                }
                
                if (ticket.saleStartDate && new Date(ticket.saleEndDate) <= new Date(ticket.saleStartDate)) {
                    return res.status(400).json({
                        success: false,
                        message: `Ticket ${i + 1}: Sale end date must be after sale start date`
                    });
                }
            }
        }

        
        const totalTicketQuantity = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
        if (totalTicketQuantity > maxAttendee) {
            return res.status(400).json({
                success: false,
                message: `Total ticket quantity (${totalTicketQuantity}) cannot exceed maximum attendees (${maxAttendee})`
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
        const savedEvent = await newEvent.save();

        // Create tickets for the event
        const ticketPromises = tickets.map(ticketData => {
            const newTicket = new Ticket({
                name: ticketData.name.trim(),
                description: ticketData.description ? ticketData.description.trim() : undefined,
                price: ticketData.price,
                currency: ticketData.currency || 'LKR',
                quantity: ticketData.quantity,
                eventId: savedEvent._id,
                saleStartDate: ticketData.saleStartDate ? new Date(ticketData.saleStartDate) : undefined,
                saleEndDate: ticketData.saleEndDate ? new Date(ticketData.saleEndDate) : undefined,
                status: ticketData.status || 'active',
                maxPerPurchase: ticketData.maxPerPurchase || 10
            });
            
            return newTicket.save();
        });

        // Save all tickets
        const savedTickets = await Promise.all(ticketPromises);

        // Populate organizer details for response
        await savedEvent.populate('createdBy', 'firstName lastName email organizationName organizationType');

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Event and tickets created successfully',
            data: {
                event: savedEvent,
                tickets: savedTickets
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

        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate entry detected',
                error: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating event'
        });
    }
};

// Get events created by the organizer
const getMyEvents = async (req, res) => {
    try {
        
        const events = await Event.find({ createdBy: req.user._id })
            .sort({ createdAt: -1,date: 1, time: 1 });

        
        const eventsWithTickets = await Promise.all(
            events.map(async (event) => {
                const tickets = await Ticket.find({ eventId: event._id });
                return {
                    ...event.toObject(),
                    tickets
                };
            })
        );

        res.json({
            success: true,
            message: 'Your events retrieved successfully',
            data: {
                events: eventsWithTickets,
                count: eventsWithTickets.length
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

//only by the organizer
const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const updates = req.body;

        // Find event
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the creator
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own events'
            });
        }

        // Validate date if being updated
        if (updates.date) {
            const eventDate = new Date(updates.date);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            
            if (eventDate < currentDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Event date must be in the future'
                });
            }
        }

        // Validate time format if being updated
        if (updates.time) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(updates.time)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid time format. Use HH:MM format (e.g., 14:30)'
                });
            }
        }

        // Update event
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('createdBy', 'firstName lastName organizationName organizationType');

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: {
                event: updatedEvent
            }
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating event'
        });
    }
};

// Delete event only by the organizer
const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own events'
            });
        }

        
        await Event.findByIdAndDelete(eventId);

        return res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting event'
        });
    }
};
module.exports = {
    createEvent,
    getMyEvents,
    updateEvent,
    deleteEvent
};