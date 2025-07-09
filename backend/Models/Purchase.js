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
    // Array of purchased tickets
    ticketId: [{
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        priceAtPurchase: {
            type: Number,
            required: true,
            min: 0
            // Store the price at time of purchase (in case prices change)
        }
    }],
    // Purchase details
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
        enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash'],
        required: false
    },
    paymentTransactionId: {
        type: String,
        required: false
        // Store payment gateway transaction ID
    },
    // Purchase metadata
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    // Optional: Buyer information (in case user account is deleted)
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
            required: false
        }
    },
    // Purchase status
    status: {
        type: String,
        enum: ['active', 'cancelled', 'refunded', 'used'],
        default: 'active'
    },
    // Optional: QR code or ticket reference for entry
    ticketReference: {
        type: String,
        unique: true,
        required: false
        // Generate unique reference for ticket validation
    }
}, {
    timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;