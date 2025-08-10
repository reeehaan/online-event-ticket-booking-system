const Event = require('../Models/Event');

const Purchase = require('../Models/Purchase');

const Ticket = require('../Models/Ticket');

const mongoose = require('mongoose'); 
const { ObjectId } = mongoose.Types;

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
                // Get the first ticket price for display
                const firstTicket = await Ticket.findOne({
                    eventId: event._id,
                    status: 'active'
                })
                .select('price currency')
                .sort({ createdAt: 1 }); 

                // Get ALL tickets for this event
                const allTickets = await Ticket.find({
                    eventId: event._id
                });

                return {
                    ...event.toObject(),
                    firstTicketPrice: firstTicket ? `${firstTicket.currency} ${firstTicket.price}` : 'TBD',
                    tickets: allTickets 
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

//Get user's booking history
const getBookingHistory = async (req, res) => {
    try {
        const userId = req.user._id; 
        const { status, limit = 10, page = 1 } = req.query;

        
        let query = { userId };
        if (status) {
            query.paymentStatus = status;
        }

        
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get purchases with populated event data
        const purchases = await Purchase.find(query)
            .populate({
                path: 'eventId',
                select: 'title description date time venue status',
                populate: {
                    path: 'createdBy',
                    select: 'firstName lastName organizationName'
                }
            })
            .sort({ purchaseDate: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count for pagination
        const totalCount = await Purchase.countDocuments(query);

        // Transform data for frontend
        const transformedPurchases = purchases.map(purchase => {
            return {
                _id: purchase._id,
                orderReference: purchase.orderReference,
                qrCodeData: {
                    qrCodeString: purchase.qrCode,
                    totalTickets: purchase.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
                    userInfo: {
                        name: `${purchase.userInfo.firstName} ${purchase.userInfo.lastName}`,
                        email: purchase.userInfo.email,
                        phone: purchase.userInfo.phoneNo
                    },
                    orderRef: purchase.orderReference,
                    eventId: purchase.eventId?._id,
                    userId: purchase.userId,
                    totalAmount: purchase.totalAmount
                },
                event: purchase.eventId ? {
                    _id: purchase.eventId._id,
                    name: purchase.eventId.title,
                    date: purchase.eventId.date,
                    time: purchase.eventId.time,
                    venue: purchase.eventId.venue,
                    organizer: purchase.eventId.createdBy
                } : null,
                tickets: purchase.tickets,
                totalAmount: purchase.totalAmount,
                subtotalAmount: purchase.subtotalAmount,
                purchaseDate: purchase.purchaseDate,
                status: purchase.status,
                paymentStatus: purchase.paymentStatus,
                paymentMethod: purchase.paymentMethod,
                paymentTransactionId: purchase.paymentTransactionId,
                isValidated: purchase.isValidated,
                validatedAt: purchase.validatedAt
            };
        });

        res.json({
            success: true,
            message: 'Booking history retrieved successfully',
            data: {
                purchases: transformedPurchases,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNext: skip + purchases.length < totalCount,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching booking history:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving booking history'
        });
    }
};




//Get purchase statistics for user
const getBookingStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await Purchase.aggregate([
            { $match: { userId: new ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    totalTickets: { $sum: { $sum: '$tickets.quantity' } },
                    completedBookings: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0]
                        }
                    },
                    pendingBookings: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0]
                        }
                    },
                    upcomingEvents: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $eq: ['$paymentStatus', 'completed'] },
                                        { $eq: ['$status', 'active'] }
                                    ]
                                }, 
                                1, 
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const userStats = stats.length > 0 ? stats[0] : {
            totalBookings: 0,
            totalSpent: 0,
            totalTickets: 0,
            completedBookings: 0,
            pendingBookings: 0,
            upcomingEvents: 0
        };

        res.json({
            success: true,
            message: 'Booking statistics retrieved successfully',
            data: userStats
        });

    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving booking statistics'
        });
    }
};


module.exports = {
    getAllEvents,
    getEventsByCategory,
    getRecentEvents,
    getBookingHistory,
    getBookingStats,
};