const mongoose = require('mongoose');

const organizerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    profilePicture: {
        type: String, // Base64 string or URL
        default: null
    },
    organizationName: {
        type: String,
        required: false
    },
    organizationType: {
        type: String,
        enum: ['corporation', 'nonprofit', 'government', 'individual', 'partnership', 'other'],
        default: 'individual'
    },
    bio: {
        type: String,
        maxLength: 1000,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    socialMedia: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    businessDetails: {
        businessRegistrationNumber: { type: String, default: '' },
        taxIdNumber: { type: String, default: '' },
        businessAddress: {
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            postalCode: { type: String, default: '' },
            country: { type: String, default: 'Sri Lanka' }
        }
    },
    contactDetails: {
        primaryPhone: { type: String, default: '' },
        alternatePhone: { type: String, default: '' },
        businessEmail: { type: String, default: '' },
        supportEmail: { type: String, default: '' }
    },
    bankingDetails: {
        bankName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        accountHolderName: { type: String, default: '' },
        routingNumber: { type: String, default: '' },
        swiftCode: { type: String, default: '' }
    },
    preferences: {
        eventCategories: {
            type: [String],
            default: []
        },
        defaultCurrency: {
            type: String,
            default: 'LKR'
        },
        defaultTimezone: {
            type: String,
            default: 'Asia/Colombo'
        },
        language: {
            type: String,
            default: 'English'
        },
        autoApproveTickets: {
            type: Boolean,
            default: true
        },
        allowRefunds: {
            type: Boolean,
            default: true
        },
        refundPolicy: {
            type: String,
            maxLength: 500,
            default: ''
        }
    },
    notifications: {
        email: {
            newTicketSales: { type: Boolean, default: true },
            eventUpdates: { type: Boolean, default: true },
            paymentNotifications: { type: Boolean, default: true },
            systemAlerts: { type: Boolean, default: true },
            marketingEmails: { type: Boolean, default: false },
            weeklyReports: { type: Boolean, default: true }
        },
        sms: {
            urgentAlerts: { type: Boolean, default: true },
            paymentConfirmations: { type: Boolean, default: true },
            eventReminders: { type: Boolean, default: false }
        }
    },
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        loginAlerts: {
            type: Boolean,
            default: true
        },
        apiAccessEnabled: {
            type: Boolean,
            default: false
        }
    },
    verification: {
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationDate: {
            type: Date,
            default: null
        },
        verificationDocuments: [{
            documentType: String,
            documentUrl: String,
            uploadDate: { type: Date, default: Date.now },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
        }]
    },
    statistics: {
        totalEvents: { type: Number, default: 0 },
        totalTicketsSold: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        averageEventRating: { type: Number, default: 0 },
        lastEventDate: { type: Date, default: null }
    }
}, {
    timestamps: true
});

// Static method to create default profile
organizerProfileSchema.statics.createDefaultProfile = function(userId) {
    return new this({
        userId,
        organizationType: 'individual',
        bio: '',
        website: '',
        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
        },
        businessDetails: {
            businessRegistrationNumber: '',
            taxIdNumber: '',
            businessAddress: {
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'Sri Lanka'
            }
        },
        contactDetails: {
            primaryPhone: '',
            alternatePhone: '',
            businessEmail: '',
            supportEmail: ''
        },
        bankingDetails: {
            bankName: '',
            accountNumber: '',
            accountHolderName: '',
            routingNumber: '',
            swiftCode: ''
        },
        preferences: {
            eventCategories: [],
            defaultCurrency: 'LKR',
            defaultTimezone: 'Asia/Colombo',
            language: 'English',
            autoApproveTickets: true,
            allowRefunds: true,
            refundPolicy: ''
        },
        notifications: {
            email: {
                newTicketSales: true,
                eventUpdates: true,
                paymentNotifications: true,
                systemAlerts: true,
                marketingEmails: false,
                weeklyReports: true
            },
            sms: {
                urgentAlerts: true,
                paymentConfirmations: true,
                eventReminders: false
            }
        },
        security: {
            twoFactorEnabled: false,
            loginAlerts: true,
            apiAccessEnabled: false
        }
    });
};

// Method to get public profile info (for event pages)
organizerProfileSchema.methods.getPublicInfo = function() {
    return {
        organizationName: this.organizationName,
        organizationType: this.organizationType,
        bio: this.bio,
        website: this.website,
        socialMedia: this.socialMedia,
        profilePicture: this.profilePicture,
        verification: {
            isVerified: this.verification.isVerified
        },
        statistics: this.statistics
    };
};

module.exports = mongoose.model('OrganizerProfile', organizerProfileSchema);