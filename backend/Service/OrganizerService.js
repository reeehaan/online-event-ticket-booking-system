const mongoose = require('mongoose');

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
        currentDate.setHours(0, 0, 0, 0); 
        
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
        );
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

// Add a new ticket to an existing event
const addTicketToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const ticketData = req.body;

        // Find event and verify ownership
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
                message: 'You can only add tickets to your own events'
            });
        }

        // Check current ticket count
        const currentTicketCount = await Ticket.countDocuments({ eventId: eventId });
        if (currentTicketCount >= 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 ticket types allowed per event'
            });
        }

        // Validate ticket data
        if (!ticketData.name || ticketData.name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Ticket name is required'
            });
        }

        if (ticketData.price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be 0 or greater'
            });
        }

        if (ticketData.quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        if (ticketData.maxPerPurchase <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Max per purchase must be greater than 0'
            });
        }

        // Check total capacity
        const existingTickets = await Ticket.find({ eventId: eventId });
        const currentTotalTickets = existingTickets.reduce((sum, ticket) => 
            sum + ticket.quantity + (ticket.sold || 0), 0
        );
        
        const newTotalTickets = currentTotalTickets + ticketData.quantity;
        if (newTotalTickets > event.maxAttendee) {
            return res.status(400).json({
                success: false,
                message: `Adding this ticket would exceed maximum attendees. Current: ${currentTotalTickets}, Max allowed: ${event.maxAttendee}`
            });
        }

        // Create new ticket
        const newTicket = new Ticket({
            name: ticketData.name.trim(),
            description: ticketData.description ? ticketData.description.trim() : '',
            price: parseInt(ticketData.price) || 0,
            currency: ticketData.currency || 'LKR',
            quantity: parseInt(ticketData.quantity),
            eventId: eventId,
            status: ticketData.status || 'active',
            maxPerPurchase: parseInt(ticketData.maxPerPurchase) || 1,
            saleStartDate: ticketData.saleStartDate ? new Date(ticketData.saleStartDate) : undefined,
            saleEndDate: ticketData.saleEndDate ? new Date(ticketData.saleEndDate) : undefined
        });

        const savedTicket = await newTicket.save();

        res.status(201).json({
            success: true,
            message: 'Ticket added successfully',
            data: {
                ticket: savedTicket
            }
        });

    } catch (error) {
        console.error('Add ticket error:', error);

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
            message: 'Internal server error while adding ticket'
        });
    }
};

// Update a specific ticket
const updateTicket = async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;
        const ticketData = req.body;

        // Find event and verify ownership
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
                message: 'You can only update tickets for your own events'
            });
        }

        // Find the ticket
        const ticket = await Ticket.findOne({ _id: ticketId, eventId: eventId });
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found or doesn\'t belong to this event'
            });
        }

        // Validate ticket data
        if (!ticketData.name || ticketData.name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Ticket name is required'
            });
        }

        if (ticketData.price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be 0 or greater'
            });
        }

        if (ticketData.quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be 0 or greater'
            });
        }

        if (ticketData.maxPerPurchase <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Max per purchase must be greater than 0'
            });
        }

        // Check total capacity
        const existingTickets = await Ticket.find({ eventId: eventId, _id: { $ne: ticketId } });
        const otherTicketsTotal = existingTickets.reduce((sum, t) => 
            sum + t.quantity + (t.sold || 0), 0
        );
        
        const newTotalTickets = otherTicketsTotal + parseInt(ticketData.quantity) + (ticket.sold || 0);
        if (newTotalTickets > event.maxAttendee) {
            return res.status(400).json({
                success: false,
                message: `Total tickets would exceed maximum attendees. Max allowed: ${event.maxAttendee}`
            });
        }

        // Update ticket
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            {
                name: ticketData.name.trim(),
                description: ticketData.description ? ticketData.description.trim() : '',
                price: parseInt(ticketData.price) || 0,
                currency: ticketData.currency || 'LKR',
                quantity: parseInt(ticketData.quantity) || 0,
                status: ticketData.status || 'active',
                maxPerPurchase: parseInt(ticketData.maxPerPurchase) || 1,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Ticket updated successfully',
            data: {
                ticket: updatedTicket
            }
        });

    } catch (error) {
        console.error('Update ticket error:', error);

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
            message: 'Internal server error while updating ticket'
        });
    }
};

// Toggle ticket status between active and inactive
const toggleTicketStatus = async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;
        const { status } = req.body;

        // Find event and verify ownership
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
                message: 'You can only update tickets for your own events'
            });
        }

        // Find the ticket
        const ticket = await Ticket.findOne({ _id: ticketId, eventId: eventId });
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found or doesn\'t belong to this event'
            });
        }

        // Validate status
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either "active" or "inactive"'
            });
        }

        // Update ticket status
        const updatedTicket = await Ticket.findByIdAndUpdate(
            ticketId,
            { 
                status: status,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: `Ticket status updated to ${status}`,
            data: {
                ticket: updatedTicket
            }
        });

    } catch (error) {
        console.error('Toggle ticket status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating ticket status'
        });
    }
};

// Get tickets for a specific event
const getEventTickets = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Find event and verify ownership
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
                message: 'You can only view tickets for your own events'
            });
        }

        // Get all tickets for the event
        const tickets = await Ticket.find({ eventId: eventId }).sort({ createdAt: 1 });

        // Calculate summary
        const summary = {
            totalTypes: tickets.length,
            totalQuantity: tickets.reduce((sum, t) => sum + t.quantity, 0),
            totalSold: tickets.reduce((sum, t) => sum + (t.sold || 0), 0),
            totalRevenue: tickets.reduce((sum, t) => sum + (t.price * (t.sold || 0)), 0),
            activeTickets: tickets.filter(t => t.status === 'active').length
        };

        res.json({
            success: true,
            message: 'Event tickets retrieved successfully',
            data: {
                tickets,
                summary
            }
        });

    } catch (error) {
        console.error('Get event tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving tickets'
        });
    }
};

// Delete a specific ticket
const deleteTicket = async (req, res) => {
    try {
        const { eventId, ticketId } = req.params;

        // Find event and verify ownership
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
                message: 'You can only delete tickets from your own events'
            });
        }

        // Check if this is the last ticket
        const ticketCount = await Ticket.countDocuments({ eventId: eventId });
        if (ticketCount <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the last ticket. Events must have at least one ticket type.'
            });
        }

        // Find and delete the ticket
        const ticket = await Ticket.findOneAndDelete({
            _id: ticketId,
            eventId: eventId
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found or doesn\'t belong to this event'
            });
        }

        res.json({
            success: true,
            message: 'Ticket deleted successfully',
            data: {
                deletedTicket: ticket
            }
        });

    } catch (error) {
        console.error('Delete ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting ticket'
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

        
        const ticketDeleteResult = await Ticket.deleteMany({ eventId: eventId });
        
        // Delete the event
        await Event.findByIdAndDelete(eventId);

        return res.status(200).json({
            success: true,
            message: 'Event and related tickets deleted successfully',
            deletedTicketsCount: ticketDeleteResult.deletedCount
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
    deleteEvent,
    getEventTickets,
    addTicketToEvent,
    updateTicket,
    deleteTicket,
    toggleTicketStatus
};