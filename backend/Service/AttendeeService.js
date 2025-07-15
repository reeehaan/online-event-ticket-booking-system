const Event = require('../Models/Event');


const Ticket = require('../Models/Ticket');

const getAllEvents = async (req, res) => {
    try {
        const { category, subcategory, date, status = 'published' } = req.query;
        
        let query = { status };
        
        
        if (category) query.category = category;
        if (subcategory) query.subcategory = new RegExp(subcategory, 'i');
        if (date) {
            const filterDate = new Date(date);
            query.date = { $gte: filterDate };
        } else {
            query.date = { $gte: new Date() };
        }

        
        const events = await Event.find(query)
            .populate('createdBy', 'firstName lastName organizationName organizationType')
            .sort({ createdAt: -1 });

        
        const eventsWithTickets = await Promise.all(
            events.map(async (event) => {
                
                const tickets = await Ticket.find({ 
                    eventId: event._id,
                    status: 'active' 
                })
                .select('name description price currency quantity sold maxPerPurchase status saleStartDate saleEndDate')
                .sort({ price: 1 }); 

                // Convert to plain object and add tickets
                const eventObj = event.toObject();
                eventObj.tickets = tickets;
                
                return eventObj;
            })
        );

        res.json({
            success: true,
            message: 'Events retrieved successfully',
            data: {
                events: eventsWithTickets,
                count: eventsWithTickets.length
            }
        });

    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving events'
        });
    }
};

const getEventsByCategory = async (req, res) => {
    try {
        const { subcategory } = req.query;


        if (!subcategory) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory is required'
            });
        }

        const query = {
            subcategory
        };

        const events = await Event.find(query)
            .populate('createdBy', 'firstName lastName organizationName organizationType')
            .sort({ createdAt: -1 }); 

        const eventsWithTickets = await Promise.all(
            events.map(async (event) => {
                
                const tickets = await Ticket.find({ 
                    eventId: event._id,
                    status: 'active' 
                })
                .select('name description price currency quantity sold maxPerPurchase status saleStartDate saleEndDate')
                .sort({ price: 1 }); 

                
                const eventObj = event.toObject();
                eventObj.tickets = tickets;
                
                return eventObj;
            })
        );

        res.json({
            success: true,
            message: 'Events retrieved successfully',
            data: {
                events: eventsWithTickets,
                count: eventsWithTickets.length
            }
        });

    } catch (error) {
        console.error('Error retrieving events by category:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving events'
        });
    }
};


const getRecentEvents = async (req, res) => {
    try {
        const recentEvents = await Event.find()
        .sort({ createdAt: -1 })
        .limit(3);

    const eventsWithTickets = await Promise.all(
        recentEvents.map(async (event) => {
        const firstTicket = await Ticket.findOne({
            eventId: event._id,
            status: 'active'
        })
            .select('price')
            .sort({ createdAt: 1 }); 

        return {
            ...event.toObject(),
            firstTicketPrice: firstTicket ? firstTicket.price : null
        };
        })
    );

    res.status(200).json({
        success: true,
        data: eventsWithTickets
    });
    } catch (error) {
    console.error('Error fetching recent events:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
    }
};


module.exports = {
    getAllEvents,
    getEventsByCategory,
    getRecentEvents
};