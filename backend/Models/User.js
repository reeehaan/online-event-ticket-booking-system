const mongoose = require('mongoose');

// Base User Schema
const userSchema = new mongoose.Schema({
  // Common fields for both attendees and organizers
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
        userType: {
        type: String,
        required: true,
        enum: ['attendee', 'organizer']
    }
}, {
    discriminatorKey: 'userType',
    timestamps: true
});

// Create base User model
const User = mongoose.model('User', userSchema);

// Attendee-specific schema (only form fields)
const attendeeSchema = new mongoose.Schema({
    dateOfBirth: {
    type: Date,
    required: true
    },
    location: {
    type: String,
    required: true,
    trim: true
    },
    interests: [{
    type: String,
    enum: [
        'Music & Concerts',
        'Sports', 
        'Food & Dining',
        'Art & Culture',
        'Technology',
        'Business',
        'Education',
        'Health & Wellness',
        'Travel',
        'Photography',
        'Fashion',
        'Gaming'
        ]
    }]
});

// Organizer-specific schema (only form fields)
const organizerSchema = new mongoose.Schema({
    organizationName: {
    type: String,
    required: true,
    trim: true
    },
    organizationType: {
    type: String,
    required: true,
    enum: [
        'Event Management Company',
        'Corporate',
        'Non-Profit',
        'Educational Institution',
        'Entertainment',
        'Sports Club',
        'Restaurant/Bar',
        'Art Gallery',
        'Other'
    ]
    },
    description: {
    type: String,
    required: true,
    trim: true
    },
    address: {
    type: String,
    required: true,
    trim: true
    },
    city: {
    type: String,
    required: true,
    trim: true
    }
});

// Create discriminator models
const Attendee = User.discriminator('attendee', attendeeSchema);
const Organizer = User.discriminator('organizer', organizerSchema);

// Export models
module.exports = {
    User,
    Attendee,
    Organizer
};

