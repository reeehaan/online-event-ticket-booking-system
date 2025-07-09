const mongoose = require('mongoose');

// Ticket Schema
const ticketSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
        // e.g., "General Admission", "VIP", "Early Bird", "Student"
    },
    description: {
        type: String,
        required: false,
        trim: true
        // e.g., "Includes access to main event area"
    },
    price: {
        type: Number,
        required: true,
        min: 0
        // Price in your currency (e.g., dollars, cents)
    },
    currency: {
        type: String,
        required: true,
        default: 'LKR',
        trim: true
        // e.g., "USD", "EUR", "LKR"
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
        // Total number of tickets available for this type
    },
    sold: {
        type: Number,
        default: 0,
        min: 0
        // Number of tickets sold
    },
    // Reference to the Event
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    // Ticket availability settings
    saleStartDate: {
        type: Date,
        required: false
        // When this ticket type goes on sale
    },
    saleEndDate: {
        type: Date,
        required: false
        // When this ticket type sale ends
    },
    // Ticket type status
    status: {
        type: String,
        enum: ['active', 'inactive', 'sold_out'],
        default: 'active'
    },
    // Optional: Ticket limitations
    maxPerPurchase: {
        type: Number,
        default: 10,
        min: 1
        // Maximum tickets of this type per purchase
    }
}, {
    timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;