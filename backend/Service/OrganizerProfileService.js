const OrganizerProfile = require('../Models/OrganizerProfile');
const { User, Organizer } = require('../Models/User');
const bcrypt = require('bcryptjs');

class OrganizerProfileService {
    
    // Get or create organizer profile with user data
    async getOrCreateProfile(userId) {
        try {
            // First get the user data
            const user = await Organizer.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }

            // Try to find existing profile
            let profile = await OrganizerProfile.findOne({ userId }).lean();
            
            // Create default profile if doesn't exist
            if (!profile) {
                const defaultProfile = OrganizerProfile.createDefaultProfile(userId);
                profile = await defaultProfile.save();
            }

            // Combine user data with profile data
            const combinedData = {
                // User model data
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                location: user.location,
                memberSince: user.createdAt,
                
                // Profile model data
                profileId: profile._id,
                profilePicture: profile.profilePicture,
                organizationName: profile.organizationName || user.organizationName,
                organizationType: profile.organizationType || user.organizationType,
                bio: profile.bio,
                website: profile.website,
                socialMedia: profile.socialMedia,
                businessDetails: profile.businessDetails,
                contactDetails: profile.contactDetails,
                bankingDetails: profile.bankingDetails,
                preferences: profile.preferences,
                notifications: profile.notifications,
                security: profile.security,
                verification: profile.verification,
                statistics: profile.statistics
            };

            return combinedData;

        } catch (error) {
            console.error('Error in getOrCreateProfile:', error);
            throw error;
        }
    }

    // Update personal information
    async updatePersonalInfo(userId, profileData) {
        try {
            const { 
                firstName, lastName, phone, dateOfBirth, location,
                organizationName, organizationType, bio, website, socialMedia,
                businessDetails, contactDetails, profilePicture
            } = profileData;

            // Update user data
            if (firstName !== undefined || lastName !== undefined || phone !== undefined || 
                dateOfBirth !== undefined || location !== undefined) {
                
                const userUpdateData = {};
                if (firstName !== undefined) userUpdateData.firstName = firstName;
                if (lastName !== undefined) userUpdateData.lastName = lastName;
                if (phone !== undefined) userUpdateData.phone = phone;
                if (dateOfBirth !== undefined) userUpdateData.dateOfBirth = dateOfBirth;
                if (location !== undefined) userUpdateData.location = location;
                if (organizationName !== undefined) userUpdateData.organizationName = organizationName;
                if (organizationType !== undefined) userUpdateData.organizationType = organizationType;

                await Organizer.findByIdAndUpdate(userId, userUpdateData, { new: true });
            }

            // Update profile data
            const profileUpdateData = {};
            if (organizationName !== undefined) profileUpdateData.organizationName = organizationName;
            if (organizationType !== undefined) profileUpdateData.organizationType = organizationType;
            if (bio !== undefined) profileUpdateData.bio = bio;
            if (website !== undefined) profileUpdateData.website = website;
            if (socialMedia !== undefined) profileUpdateData.socialMedia = socialMedia;
            if (businessDetails !== undefined) profileUpdateData.businessDetails = businessDetails;
            if (contactDetails !== undefined) profileUpdateData.contactDetails = contactDetails;
            if (profilePicture !== undefined) profileUpdateData.profilePicture = profilePicture;

            const updatedProfile = await OrganizerProfile.findOneAndUpdate(
                { userId },
                profileUpdateData,
                { new: true, upsert: true }
            );

            return await this.getOrCreateProfile(userId);

        } catch (error) {
            console.error('Error in updatePersonalInfo:', error);
            throw error;
        }
    }

    // Update banking details
    async updateBankingDetails(userId, bankingData) {
        try {
            await OrganizerProfile.findOneAndUpdate(
                { userId },
                { bankingDetails: bankingData },
                { new: true, upsert: true }
            );

            return await this.getOrCreateProfile(userId);

        } catch (error) {
            console.error('Error in updateBankingDetails:', error);
            throw error;
        }
    }

    // Update preferences
    async updatePreferences(userId, preferencesData) {
        try {
            await OrganizerProfile.findOneAndUpdate(
                { userId },
                { preferences: preferencesData },
                { new: true, upsert: true }
            );

            return await this.getOrCreateProfile(userId);

        } catch (error) {
            console.error('Error in updatePreferences:', error);
            throw error;
        }
    }

    // Update notification settings
    async updateNotifications(userId, notificationData) {
        try {
            await OrganizerProfile.findOneAndUpdate(
                { userId },
                { notifications: notificationData },
                { new: true, upsert: true }
            );

            return await this.getOrCreateProfile(userId);

        } catch (error) {
            console.error('Error in updateNotifications:', error);
            throw error;
        }
    }

    // Update security settings
    async updateSecuritySettings(userId, securityData) {
        try {
            await OrganizerProfile.findOneAndUpdate(
                { userId },
                { security: securityData },
                { new: true, upsert: true }
            );

            return await this.getOrCreateProfile(userId);

        } catch (error) {
            console.error('Error in updateSecuritySettings:', error);
            throw error;
        }
    }

    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        try {
            // Get user with password
            const user = await Organizer.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Hash new password
            const saltRounds = 10;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            await Organizer.findByIdAndUpdate(userId, { 
                password: hashedNewPassword 
            });

            return { success: true, message: 'Password updated successfully' };

        } catch (error) {
            console.error('Error in changePassword:', error);
            throw error;
        }
    }

    // Upload profile picture
    async uploadProfilePicture(userId, profilePictureBase64) {
        try {
            await OrganizerProfile.findOneAndUpdate(
                { userId },
                { profilePicture: profilePictureBase64 },
                { new: true, upsert: true }
            );

            return await this.getOrCreateProfile(userId);

        } catch (error) {
            console.error('Error in uploadProfilePicture:', error);
            throw error;
        }
    }

    // Remove profile picture
    async removeProfilePicture(userId) {
        try {
            await OrganizerProfile.findOneAndUpdate(
                { userId },
                { profilePicture: null },
                { new: true }
            );

            return await this.getOrCreateProfile(userId);

        } catch (error) {
            console.error('Error in removeProfilePicture:', error);
            throw error;
        }
    }

    // Get public profile info (for event pages)
    async getPublicProfile(userId) {
        try {
            const profile = await OrganizerProfile.findOne({ userId });
            if (!profile) {
                return null;
            }

            const user = await Organizer.findById(userId).select('firstName lastName organizationName');
            
            return {
                organizerName: user.firstName && user.lastName ? 
                    `${user.firstName} ${user.lastName}` : user.organizationName,
                organizationName: profile.organizationName || user.organizationName,
                organizationType: profile.organizationType,
                bio: profile.bio,
                website: profile.website,
                socialMedia: profile.socialMedia,
                profilePicture: profile.profilePicture,
                verification: profile.verification,
                statistics: profile.statistics
            };

        } catch (error) {
            console.error('Error in getPublicProfile:', error);
            throw error;
        }
    }

    // Update organizer statistics
    async updateStatistics(userId, eventData) {
        try {
            const stats = {
                totalEvents: eventData.totalEvents || 0,
                totalTicketsSold: eventData.totalTicketsSold || 0,
                totalRevenue: eventData.totalRevenue || 0,
                averageEventRating: eventData.averageEventRating || 0,
                lastEventDate: eventData.lastEventDate || null
            };

            await OrganizerProfile.findOneAndUpdate(
                { userId },
                { statistics: stats },
                { new: true, upsert: true }
            );

            return stats;

        } catch (error) {
            console.error('Error in updateStatistics:', error);
            throw error;
        }
    }
}

module.exports = new OrganizerProfileService();