const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Event', 'Theater'],
        trim: true
    },
    subcategory: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true  
    },
    time: {
        type: String,
        required: true  
    },
    venue: {
        type: String,
        required: true  
    },
    image: {
        type: String,
        required: false  
    },
    maxAttendee: {
        type: Number,
        required: true  
    },
    // Reference to the User model (will be an organizer)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // tickets: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Ticket'
    // }],
    // Optional: Add event status
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        default: 'draft'
    }
}, {
    timestamps: true  
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
