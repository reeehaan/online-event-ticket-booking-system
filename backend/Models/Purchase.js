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
    // Reference to the specific ticket type
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    // Purchase details
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
        enum: ['payhere', 'credit_card', 'debit_card', 'bank_transfer'],
        default: 'payhere'
    },
    paymentTransactionId: {
        type: String,
        required: false
    },
    paymentOrderId: {
        type: String,
        required: false
    },
    // Purchase metadata
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    // Buyer information
    userInfo: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: false
        }
    },
    // Purchase status
    status: {
        type: String,
        enum: ['active', 'cancelled', 'refunded', 'used'],
        default: 'active'
    },
    // QR code data for ticket validation
    qrCode: {
        type: String,
        required: false
    },
    // Unique ticket reference
    ticketReference: {
        type: String,
        unique: true,
        required: false
    },
    // Email sent status
    emailSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Generate unique ticket reference before saving
purchaseSchema.pre('save', function(next) {
    if (!this.ticketReference) {
        this.ticketReference = 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;