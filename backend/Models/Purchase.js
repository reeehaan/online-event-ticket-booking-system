const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    // Reference to the buyer
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the event
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    
    // Multiple ticket types in one purchase
    tickets: [{
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true
        },
        ticketName: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        pricePerTicket: {
            type: Number,
            required: true,
            min: 0
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    
    // Purchase totals
    subtotalAmount: {
        type: Number,
        required: true
    },
    convenienceFee: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Payment information
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['visa_master', 'koko', 'other'], 
        default: 'visa_master'
    },
    paymentTransactionId: String,
    paymentOrderId: String,
    
    // PayHere specific fields
    payHereOrderId: String,
    payHereHash: String,
    
    // Purchase metadata
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    
    // Buyer information
    userInfo: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        nicPassport: {
            type: String,
            required: true
        }
    },
    
    // Purchase status
    status: {
        type: String,
        enum: ['active', 'cancelled', 'refunded', 'used'],
        default: 'active'
    },
    
    // Single QR code for entire purchase
    qrCode: {
        type: String,
        required: false,
        unique: true
    },

    // Comprehensive QR code data for frontend
    qrCodeData: {
        qrCodeString: {
            type: String,
            required: false
        },
        userInfo: {
            name: String,
            email: String,
            phone: String,
            nicPassport: String
        },
        eventInfo: {
            title: String,
            date: String,
            venue: String
        },
        ticketInfo: [{
            ticketName: String,
            quantity: Number,
            price: Number
        }],
        totalTickets: Number,
        totalAmount: Number,
        orderReference: String,
        purchaseDate: String
    },
    
    // Unique order reference
    orderReference: {
        type: String,
        unique: true,
        required: false
    },
    
    // Validation tracking
    isValidated: {
        type: Boolean,
        default: false
    },
    validatedAt: Date,
    validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Email sent status
    emailSent: {
        type: Boolean,
        default: false
    },
    
    // Refund information (for future use)
    refundAmount: Number,
    refundDate: Date,
    refundReason: String
}, {
    timestamps: true
});


purchaseSchema.index({ userId: 1, eventId: 1 });
purchaseSchema.index({ paymentOrderId: 1 });
purchaseSchema.index({ 'userInfo.email': 1 });

// Generate unique order reference and QR code before saving
purchaseSchema.pre('save', function(next) {
    // Generate order reference if not exists
    if (!this.orderReference) {
        this.orderReference = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    // Generate QR code if not exists (contains all purchase info)
    if (!this.qrCode) {
        const qrData = {
            orderRef: this.orderReference,
            eventId: this.eventId,
            userId: this.userId,
            totalTickets: this.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
            totalAmount: this.totalAmount
        };
        
        // Create QR code string (you can encrypt this for security)
        this.qrCode = 'QR-' + Buffer.from(JSON.stringify(qrData)).toString('base64').substr(0, 20) + '-' + Date.now();
    }
    
    next();
});

// Method to generate comprehensive QR code data
purchaseSchema.methods.generateQRCodeData = function(eventData = null) {
    const totalTickets = this.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    
    // Create comprehensive QR data object
    const comprehensiveQRData = {
        // Booking Details
        bookingId: this._id.toString(),
        orderReference: this.orderReference,
        
        // Customer Information
        customerName: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
        customerEmail: this.userInfo.email,
        customerPhone: this.userInfo.phoneNo,
        customerNIC: this.userInfo.nicPassport,
        
        // Event Information
        eventId: this.eventId.toString(),
        eventTitle: eventData?.title || 'Event',
        eventDate: eventData?.date || this.purchaseDate,
        eventVenue: eventData?.venue || 'Venue TBA',
        
        // Ticket Information
        tickets: this.tickets.map(ticket => ({
            ticketType: ticket.ticketName,
            quantity: ticket.quantity,
            pricePerTicket: ticket.pricePerTicket,
            subtotal: ticket.subtotal
        })),
        
        // Payment Information
        totalTickets: totalTickets,
        subtotalAmount: this.subtotalAmount,
        totalAmount: this.totalAmount,
        paymentStatus: this.paymentStatus,
        paymentMethod: this.paymentMethod,
        
        // Purchase Metadata
        purchaseDate: this.purchaseDate,
        status: this.status,
        
        // Validation
        isValidated: this.isValidated || false,
        timestamp: new Date().toISOString()
    };
    
    // Generate QR code string (JSON string for complete data)
    const qrCodeString = JSON.stringify(comprehensiveQRData);
    
    // Update qrCodeData field
    this.qrCodeData = {
        qrCodeString: qrCodeString,
        userInfo: {
            name: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
            email: this.userInfo.email,
            phone: this.userInfo.phoneNo,
            nicPassport: this.userInfo.nicPassport
        },
        eventInfo: {
            title: eventData?.title || 'Event',
            date: eventData?.date || this.purchaseDate,
            venue: eventData?.venue || 'Venue TBA'
        },
        ticketInfo: this.tickets.map(ticket => ({
            ticketName: ticket.ticketName,
            quantity: ticket.quantity,
            price: ticket.pricePerTicket
        })),
        totalTickets: totalTickets,
        totalAmount: this.totalAmount,
        orderReference: this.orderReference,
        purchaseDate: this.purchaseDate
    };
    
    return this.qrCodeData;
};

// Method to get total ticket count
purchaseSchema.methods.getTotalTicketCount = function() {
    return this.tickets.reduce((total, ticket) => total + ticket.quantity, 0);
};

// Method to check if purchase is valid for entry
purchaseSchema.methods.isValidForEntry = function() {
    return this.paymentStatus === 'completed' && 
        this.status === 'active' && 
        !this.isValidated;
};

// Static method to find purchase by QR code
purchaseSchema.statics.findByQRCode = function(qrCode) {
    return this.findOne({ qrCode: qrCode })
        .populate('eventId')
        .populate('userId', 'name email');
};

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;