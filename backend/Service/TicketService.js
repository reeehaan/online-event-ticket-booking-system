const Event = require('../Models/Event');
const Ticket = require('../Models/Ticket');
const Purchase = require('../Models/Purchase');
const User = require('../Models/User.js');
const mongoose = require('mongoose');
const crypto = require('crypto');

// PayHere configuration
const PAYHERE_CONFIG = {
    MERCHANT_ID: '1231227',
    MERCHANT_SECRET: process.env.MERCHANT_SECRET,
    SANDBOX: true, 
    CURRENCY: 'LKR'
};

// Generate PayHere hash
const generatePayHereHash = (orderId, amount, currency, merchantSecret) => {
    // Step 1: Hash the merchant secret first
    const hashedMerchantSecret = crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();
    
    // Step 2: Create the hash string with the hashed merchant secret
    const hashString = `${PAYHERE_CONFIG.MERCHANT_ID}${orderId}${amount}${currency}${hashedMerchantSecret}`;
    
    // Step 3: Hash the entire string
    return crypto
        .createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();
};

// Get event details with tickets for purchase
const getEventForPurchase = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        // Get event without populating tickets
        const event = await Event.findById(eventId);

        if (!event || event.status !== 'published') {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not available for purchase'
            });
        }

        // Check if event has passed
        if (new Date() > new Date(event.endDate)) {
            return res.status(400).json({
                success: false,
                message: 'This event has already ended'
            });
        }

        // Get tickets separately (same as in getAllEvents)
        const tickets = await Ticket.find({ 
            eventId: event._id,
            status: 'active' 
        })
        .select('name price currency quantity sold maxPerPurchase status description saleStartDate saleEndDate')
        .sort({ price: 1 });

        // Add availability information to tickets
        const ticketsWithAvailability = tickets.map(ticket => ({
            ...ticket.toObject(),
            available: Math.max(0, ticket.quantity - ticket.sold),
            isAvailable: ticket.quantity > ticket.sold,
            // Check if ticket sale period is active
            saleActive: (!ticket.saleStartDate || new Date() >= new Date(ticket.saleStartDate)) &&
                       (!ticket.saleEndDate || new Date() <= new Date(ticket.saleEndDate))
        }));

        // Convert event to plain object and add tickets
        const eventObj = event.toObject();
        eventObj.tickets = ticketsWithAvailability;

        res.status(200).json({
            success: true,
            message: 'Event details retrieved successfully',
            data: {
                event: eventObj
            }
        });

    } catch (error) {
        console.error('Get event for purchase error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving event details'
        });
    }
};

// Validate ticket selection before purchase
const validateTicketSelection = async (req, res) => {
    try {
        const { eventId, ticketQuantities } = req.body;

        if (!eventId || !ticketQuantities || Object.keys(ticketQuantities).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Event ID and ticket quantities are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        // Check if event exists and is available
        const event = await Event.findById(eventId);
        if (!event || event.status !== 'published') {
            return res.status(404).json({
                success: false,
                message: 'Event not found or not available'
            });
        }

        // Check if event has passed
        if (new Date() > new Date(event.endDate)) {
            return res.status(400).json({
                success: false,
                message: 'This event has already ended'
            });
        }

        // Get selected tickets
        const ticketIds = Object.keys(ticketQuantities).filter(id => ticketQuantities[id] > 0);
        const tickets = await Ticket.find({
            _id: { $in: ticketIds },
            eventId: eventId,
            status: 'active'
        });

        if (tickets.length !== ticketIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some selected tickets are not available'
            });
        }

        // Validate each ticket quantity and calculate totals
        const validatedTickets = [];
        let totalAmount = 0;
        let totalTickets = 0;

        for (const ticket of tickets) {
            const requestedQuantity = parseInt(ticketQuantities[ticket._id.toString()]);
            const available = ticket.quantity - ticket.sold;

            // Validation checks
            if (requestedQuantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid quantity for ${ticket.name}`
                });
            }

            if (requestedQuantity > available) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${available} tickets available for ${ticket.name}`
                });
            }

            if (requestedQuantity > ticket.maxPerPurchase) {
                return res.status(400).json({
                    success: false,
                    message: `Maximum ${ticket.maxPerPurchase} tickets allowed per purchase for ${ticket.name}`
                });
            }

            const subtotal = ticket.price * requestedQuantity;
            totalAmount += subtotal;
            totalTickets += requestedQuantity;

            validatedTickets.push({
                ticketId: ticket._id,
                ticketName: ticket.name,
                quantity: requestedQuantity,
                pricePerTicket: ticket.price,
                subtotal: subtotal,
                currency: ticket.currency || 'LKR'
            });
        }

        // Calculate fees
        const convenienceFee = Math.round(totalAmount * 0.01); // 1% convenience fee
        const finalTotal = totalAmount + convenienceFee;

        res.status(200).json({
            success: true,
            message: 'Ticket selection validated successfully',
            data: {
                tickets: validatedTickets,
                subtotalAmount: totalAmount,
                convenienceFee: convenienceFee,
                totalAmount: finalTotal,
                totalTickets: totalTickets,
                event: {
                    _id: event._id,
                    title: event.title,
                    date: event.date,
                    venue: event.venue
                }
            }
        });

    } catch (error) {
        console.error('Validate ticket selection error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while validating ticket selection'
        });
    }
};

// Create purchase order (before payment)
const createPurchaseOrder = async (req, res) => {
    try {
        const { eventId, ticketQuantities, userInfo, paymentMethod } = req.body;
        const userId = req.user._id;
        // Validate required fields
        if (!eventId || !ticketQuantities || !userInfo || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate user info
        const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
        for (const field of requiredFields) {
            if (!userInfo[field] || userInfo[field].trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required in user information`
                });
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userInfo.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if user is an attendee
        if (!req.user || req.user.userType !== 'attendee') {
            return res.status(403).json({
                success: false,
                message: 'Only attendees can purchase tickets'
            });
        }
        // Start database transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Validate event and tickets again (to prevent race conditions)
            const event = await Event.findById(eventId);
            if (!event || event.status !== 'published') {
                throw new Error('Event not found or not available');
            }

            if (new Date() > new Date(event.endDate)) {
                throw new Error('This event has already ended');
            }

            const ticketIds = Object.keys(ticketQuantities).filter(id => ticketQuantities[id] > 0);
            const tickets = await Ticket.find({
                _id: { $in: ticketIds },
                eventId: eventId,
                status: 'active'
            });

            if (tickets.length !== ticketIds.length) {
                throw new Error('Some selected tickets are not available');
            }

            // Validate and calculate totals
            const validatedTickets = [];
            let totalAmount = 0;

            for (const ticket of tickets) {
                const requestedQuantity = parseInt(ticketQuantities[ticket._id.toString()]);
                const available = ticket.quantity - ticket.sold;

                if (requestedQuantity > available) {
                    throw new Error(`Only ${available} tickets available for ${ticket.name}`);
                }

                if (requestedQuantity > ticket.maxPerPurchase) {
                    throw new Error(`Maximum ${ticket.maxPerPurchase} tickets allowed per purchase for ${ticket.name}`);
                }

                const subtotal = ticket.price * requestedQuantity;
                totalAmount += subtotal;

                validatedTickets.push({
                    ticketId: ticket._id,
                    ticketName: ticket.name,
                    quantity: requestedQuantity,
                    pricePerTicket: ticket.price,
                    subtotal: subtotal
                });

                // Reserve tickets (temporarily increase sold count)
                await Ticket.findByIdAndUpdate(
                    ticket._id,
                    { $inc: { sold: requestedQuantity } },
                    { session }
                );
            }

            const convenienceFee = Math.round(totalAmount * 0.01);
            const finalTotal = totalAmount + convenienceFee;

            // Create purchase order
            const purchaseData = {
                userId: userId,
                eventId: eventId,
                tickets: validatedTickets,
                subtotalAmount: totalAmount,
                convenienceFee: convenienceFee,
                totalAmount: finalTotal,
                paymentStatus: 'pending',
                paymentMethod: paymentMethod,
                userInfo: {
                    firstName: userInfo.firstName.trim(),
                    lastName: userInfo.lastName.trim(),
                    email: userInfo.email.toLowerCase().trim(),
                    phoneNo: userInfo.phone.trim(),
                    nicPassport: userInfo.nicPassport ? userInfo.nicPassport.trim() : ''
                },
                status: 'active'
            };

            const purchase = new Purchase(purchaseData);
            await purchase.save({ session });

            await session.commitTransaction();

            res.status(201).json({
                success: true,
                message: 'Purchase order created successfully',
                data: {
                    orderReference: purchase.orderReference,
                    orderId: purchase._id,
                    totalAmount: purchase.totalAmount,
                    paymentStatus: purchase.paymentStatus,
                    tickets: purchase.tickets,
                    userInfo: purchase.userInfo
                }
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Create purchase order error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Internal server error while creating purchase order'
        });
    }
};

// Generate PayHere payment hash
const generatePaymentHash = async (req, res) => {
    try {
        const { orderReference, amount } = req.body;

        if (!orderReference || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Order reference and amount are required'
            });
        }

        // Find the purchase order
        const purchase = await Purchase.findOne({
            orderReference: orderReference,
            userId: req.user._id,
            paymentStatus: 'pending'
        });

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase order not found or already processed'
            });
        }

        // Verify amount matches
        if (parseFloat(amount) !== purchase.totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Amount mismatch'
            });
        }
        console.log(orderReference,
            amount.toFixed(2),
            PAYHERE_CONFIG.CURRENCY,
            PAYHERE_CONFIG.MERCHANT_SECRET);
        // Generate PayHere hash
        const hash = generatePayHereHash(
            orderReference,
            amount.toFixed(2),
            PAYHERE_CONFIG.CURRENCY,
            PAYHERE_CONFIG.MERCHANT_SECRET
        );

        res.status(200).json({
            success: true,
            message: 'Payment hash generated successfully',
            data: {
                hash: hash,
                merchantId: PAYHERE_CONFIG.MERCHANT_ID,
                sandbox: PAYHERE_CONFIG.SANDBOX,
                currency: PAYHERE_CONFIG.CURRENCY
            }
        });

    } catch (error) {
        console.error('Generate payment hash error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while generating payment hash'
        });
    }
};

// Process successful payment (PayHere callback)
const processPaymentSuccess = async (req, res) => {
    try {
        const {
            order_id: orderReference,
            payment_id: paymentTransactionId,
            payhere_order_id: payHereOrderId,
            payhere_amount: amount,
            payhere_currency: currency,
            status_code,
            md5sig
        } = req.body;

        if (!orderReference || !paymentTransactionId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and Payment ID are required'
            });
        }

        // Find purchase order
        const purchase = await Purchase.findOne({ orderReference: orderReference })
            .populate('eventId', 'title date venue')
            .populate('userId', 'firstName lastName email');

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase order not found'
            });
        }

        if (purchase.paymentStatus === 'completed') {
            // Generate QR data if missing (for older purchases)
            if (!purchase.qrCodeData || !purchase.qrCodeData.qrCodeString) {
                const eventData = purchase.eventId;
                purchase.generateQRCodeData(eventData);
                await purchase.save();
            }
            
            return res.status(200).json({
                success: true,
                message: 'Payment already processed',
                data: {
                    orderReference: purchase.orderReference,
                    qrCode: purchase.qrCode,
                    qrCodeData: purchase.qrCodeData
                }
            });
        }

        // Update purchase with payment information
        purchase.paymentStatus = 'completed';
        purchase.paymentTransactionId = paymentTransactionId;
        purchase.payHereOrderId = payHereOrderId;
        purchase.status = 'active';

        // Generate comprehensive QR code data with event information
        const eventData = purchase.eventId;
        purchase.generateQRCodeData(eventData);

        await purchase.save();

        // Here you would typically send confirmation email
        // await sendConfirmationEmail(purchase);

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                orderReference: purchase.orderReference,
                qrCode: purchase.qrCode,
                qrCodeData: purchase.qrCodeData,
                paymentStatus: purchase.paymentStatus,
                event: purchase.eventId
            }
        });

    } catch (error) {
        console.error('Process payment success error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while processing payment'
        });
    }
};

// Process failed payment (PayHere callback)
const processPaymentFailure = async (req, res) => {
    try {
        const { order_id: orderReference, reason } = req.body;

        if (!orderReference) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Start database transaction to release reserved tickets
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const purchase = await Purchase.findOne({ orderReference: orderReference });

            if (!purchase) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase order not found'
                });
            }

            // Update purchase status
            purchase.paymentStatus = 'failed';
            purchase.status = 'cancelled';
            await purchase.save({ session });

            // Release reserved tickets
            for (const ticketInfo of purchase.tickets) {
                await Ticket.findByIdAndUpdate(
                    ticketInfo.ticketId,
                    { $inc: { sold: -ticketInfo.quantity } },
                    { session }
                );
            }

            await session.commitTransaction();

            res.status(200).json({
                success: true,
                message: 'Payment failure processed and tickets released',
                data: {
                    orderReference: purchase.orderReference,
                    paymentStatus: purchase.paymentStatus,
                    reason: reason || 'Payment failed'
                }
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Process payment failure error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while processing payment failure'
        });
    }
};

// Handle PayHere notify callback
const handlePayHereNotify = async (req, res) => {
    try {
        // PayHere will send notification here for payment status updates
        console.log('PayHere Notify:', req.body);
        
        const { order_id, payment_id, status } = req.body;
        
        if (status === 'APPROVED') {
            await processPaymentSuccess(req, res);
        } else {
            await processPaymentFailure(req, res);
        }
    } catch (error) {
        console.error('PayHere notify error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while handling PayHere notification'
        });
    }
};

// Get user's purchase history (reuse from previous implementation)
const getUserPurchases = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const query = { userId: userId };
        if (status) query.paymentStatus = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const purchases = await Purchase.find(query)
            .populate('eventId', 'title date venue image category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Purchase.countDocuments(query);

        // Ensure QR data exists for completed purchases
        const purchasesWithSummary = [];
        for (const purchase of purchases) {
            // Generate QR data if missing and payment is completed
            if (purchase.paymentStatus === 'completed' && (!purchase.qrCodeData || !purchase.qrCodeData.qrCodeString)) {
                const eventData = purchase.eventId;
                purchase.generateQRCodeData(eventData);
                await purchase.save();
            }

            purchasesWithSummary.push({
                ...purchase.toObject(),
                totalTickets: purchase.tickets.reduce((sum, t) => sum + t.quantity, 0),
                canCancel: purchase.paymentStatus === 'pending',
                canUse: purchase.paymentStatus === 'completed' && !purchase.isValidated
            });
        }

        res.status(200).json({
            success: true,
            message: 'Purchase history retrieved successfully',
            data: {
                purchases: purchasesWithSummary,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get user purchases error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving purchase history'
        });
    }
};

// Get specific purchase details (reuse from previous implementation)
const getPurchaseDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderReference } = req.params;

        if (!orderReference) {
            return res.status(400).json({
                success: false,
                message: 'Order reference is required'
            });
        }

        const purchase = await Purchase.findOne({
            orderReference: orderReference,
            userId: userId
        })
        .populate('eventId')
        .populate('userId', 'firstName lastName email')
        .lean();

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }

        const purchaseWithDetails = {
            ...purchase,
            totalTickets: purchase.tickets.reduce((sum, t) => sum + t.quantity, 0),
            canCancel: purchase.paymentStatus === 'pending',
            canUse: purchase.paymentStatus === 'completed' && !purchase.isValidated,
            canRefund: purchase.paymentStatus === 'completed' && purchase.isValidated === false
        };

        res.status(200).json({
            success: true,
            message: 'Purchase details retrieved successfully',
            data: purchaseWithDetails
        });

    } catch (error) {
        console.error('Get purchase details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving purchase details'
        });
    }
};

// Cancel purchase (reuse from previous implementation)
const cancelPurchase = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderReference } = req.params;

        if (!orderReference) {
            return res.status(400).json({
                success: false,
                message: 'Order reference is required'
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const purchase = await Purchase.findOne({ 
                orderReference: orderReference,
                userId: userId 
            });
            
            if (!purchase) {
                return res.status(404).json({
                    success: false,
                    message: 'Purchase not found'
                });
            }

            if (purchase.paymentStatus === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel completed payment. Please request refund instead.'
                });
            }

            if (purchase.paymentStatus === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Purchase is already cancelled'
                });
            }

            purchase.paymentStatus = 'cancelled';
            purchase.status = 'cancelled';
            await purchase.save({ session });

            // Release reserved tickets
            for (const ticketInfo of purchase.tickets) {
                await Ticket.findByIdAndUpdate(
                    ticketInfo.ticketId,
                    { $inc: { sold: -ticketInfo.quantity } },
                    { session }
                );
            }

            await session.commitTransaction();

            res.status(200).json({
                success: true,
                message: 'Purchase cancelled successfully',
                data: {
                    orderReference: purchase.orderReference,
                    status: purchase.status
                }
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Cancel purchase error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while cancelling purchase'
        });
    }
};

module.exports = {
    getEventForPurchase,
    validateTicketSelection,
    createPurchaseOrder,
    generatePaymentHash,
    processPaymentSuccess,
    processPaymentFailure,
    handlePayHereNotify,
    getUserPurchases,
    getPurchaseDetails,
    cancelPurchase
};