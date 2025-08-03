const mongoose = require('mongoose');

const attendeeProfileSchema = new mongoose.Schema({
    // Reference to the User model
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Profile Image (stored as base64)
    profilePicture: {
        type: String, 
        default: null
    },
    
    // Extended Personal Information
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: ''
    },
    
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    
    website: {
        type: String,
        default: ''
    },
    
    // Address Information
    country: {
        type: String,
        default: 'Sri Lanka'
    },
    
    city: {
        type: String,
        default: ''
    },
    
    address: {
        type: String,
        default: ''
    },
    
    postalCode: {
        type: String,
        default: ''
    },
    
    // Emergency Contact
    emergencyContact: {
        name: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        relationship: {
            type: String,
            default: ''
        }
    },
    
    // Event Preferences
    preferences: {
        favoriteCategories: [{
            type: String,
            enum: [
                'Concert', 'DJ', 'Electronic', 'Festival', 'Theater', 'Comedy',
                'Workshop', 'Educational', 'Spiritual', 'Sports', 'Art', 'Food'
            ]
        }],
        
        // Accessibility Requirements
        accessibility: {
            wheelchairAccess: {
                type: Boolean,
                default: false
            },
            signLanguage: {
                type: Boolean,
                default: false
            },
            audioDescription: {
                type: Boolean,
                default: false
            }
        },
        
        // Language and Region
        language: {
            type: String,
            enum: ['English', 'Sinhala', 'Tamil'],
            default: 'English'
        },
        
        timezone: {
            type: String,
            default: 'Asia/Colombo'
        },
        
        currency: {
            type: String,
            enum: ['LKR', 'USD', 'EUR'],
            default: 'LKR'
        }
    },
    
    // Notification Preferences
    notifications: {
        email: {
            eventReminders: {
                type: Boolean,
                default: true
            },
            newEvents: {
                type: Boolean,
                default: true
            },
            priceDrops: {
                type: Boolean,
                default: true
            },
            marketing: {
                type: Boolean,
                default: false
            },
            weeklyDigest: {
                type: Boolean,
                default: true
            }
        },
        
        sms: {
            eventReminders: {
                type: Boolean,
                default: true
            },
            ticketUpdates: {
                type: Boolean,
                default: true
            },
            emergencyAlerts: {
                type: Boolean,
                default: true
            }
        }
    },
    
    // Privacy Settings
    privacy: {
        publicProfile: {
            type: Boolean,
            default: false
        },
        showAttendingEvents: {
            type: Boolean,
            default: true
        },
        allowFriendRequests: {
            type: Boolean,
            default: true
        }
    },
    
    // Security Settings
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        loginAlerts: {
            type: Boolean,
            default: true
        },
        lastPasswordChange: {
            type: Date,
            default: Date.now
        }
    },
    
    // Profile Completion Status
    profileCompletion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    // Member Status
    memberStatus: {
        type: String,
        enum: ['basic', 'premium', 'vip'],
        default: 'basic'
    },
    
    memberSince: {
        type: Date,
        default: Date.now
    }
    
}, {
    timestamps: true
});

// Index for faster queries
attendeeProfileSchema.index({ userId: 1 });

// Virtual for full name (derived from User model)
attendeeProfileSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to calculate profile completion percentage
attendeeProfileSchema.methods.calculateProfileCompletion = function() {
    let completionScore = 0;
    const totalFields = 15; // Total number of important fields
    
    // Check basic fields
    if (this.profilePicture) completionScore += 1;
    if (this.gender) completionScore += 1;
    if (this.bio) completionScore += 1;
    if (this.country) completionScore += 1;
    if (this.city) completionScore += 1;
    if (this.address) completionScore += 1;
    if (this.postalCode) completionScore += 1;
    if (this.emergencyContact.name) completionScore += 1;
    if (this.emergencyContact.phone) completionScore += 1;
    if (this.preferences.favoriteCategories.length > 0) completionScore += 1;
    if (this.preferences.language) completionScore += 1;
    if (this.preferences.currency) completionScore += 1;
    
    // Check notification preferences are set
    if (Object.keys(this.notifications.email).length > 0) completionScore += 1;
    if (Object.keys(this.notifications.sms).length > 0) completionScore += 1;
    
    // Check privacy settings are configured
    if (Object.keys(this.privacy).length > 0) completionScore += 1;
    
    const percentage = Math.round((completionScore / totalFields) * 100);
    this.profileCompletion = percentage;
    
    return percentage;
};

// Pre-save middleware to calculate profile completion
attendeeProfileSchema.pre('save', function(next) {
    this.calculateProfileCompletion();
    next();
});

// Static method to create default profile for new user
attendeeProfileSchema.statics.createDefaultProfile = function(userId) {
    return new this({
        userId: userId,
        preferences: {
            favoriteCategories: [],
            accessibility: {
                wheelchairAccess: false,
                signLanguage: false,
                audioDescription: false
            },
            language: 'English',
            timezone: 'Asia/Colombo',
            currency: 'LKR'
        },
        notifications: {
            email: {
                eventReminders: true,
                newEvents: true,
                priceDrops: true,
                marketing: false,
                weeklyDigest: true
            },
            sms: {
                eventReminders: true,
                ticketUpdates: true,
                emergencyAlerts: true
            }
        },
        privacy: {
            publicProfile: false,
            showAttendingEvents: true,
            allowFriendRequests: true
        },
        security: {
            twoFactorEnabled: false,
            loginAlerts: true,
            lastPasswordChange: new Date()
        }
    });
};

const AttendeeProfile = mongoose.model('AttendeeProfile', attendeeProfileSchema);

module.exports = AttendeeProfile;