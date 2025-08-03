const AttendeeProfile = require('../Models/AttendeeProfile');
const { User, Attendee } = require('../Models/User'); 
const bcrypt = require('bcryptjs');

class AttendeeProfileService {
    
    // Get or create attendee profile with user data
    async getOrCreateProfile(userId) {
        try {
            // First get the user data
            const user = await Attendee.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }

            
            let profile = await AttendeeProfile.findOne({ userId }).lean();
            
            
            if (!profile) {
                const defaultProfile = AttendeeProfile.createDefaultProfile(userId);
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
                interests: user.interests,
                memberSince: user.createdAt,
                
                // Profile model data
                profileId: profile._id,
                profilePicture: profile.profilePicture,
                gender: profile.gender,
                bio: profile.bio,
                website: profile.website,
                country: profile.country,
                city: profile.city,
                address: profile.address,
                postalCode: profile.postalCode,
                emergencyContact: profile.emergencyContact,
                preferences: profile.preferences,
                notifications: profile.notifications,
                privacy: profile.privacy,
                security: profile.security,
                profileCompletion: profile.profileCompletion,
                memberStatus: profile.memberStatus
            };

            return {
                success: true,
                data: combinedData
            };

        } catch (error) {
            console.error('Error in getOrCreateProfile:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch profile'
            };
        }
    }

    // Update personal information (both User and Profile models)
    async updatePersonalInfo(userId, updateData) {
    try {
        const {
            // User model fields (EMAIL REMOVED)
            firstName,
            lastName,
            phone,
            dateOfBirth,
            location,
            
            // Profile model fields
            profilePicture,
            gender,
            bio,
            website,
            country,
            city,
            address,
            postalCode,
            emergencyContact
        } = updateData;

        // Prepare user update data (EMAIL EXCLUDED)
        const userUpdateData = {};
        if (firstName) userUpdateData.firstName = firstName;
        if (lastName) userUpdateData.lastName = lastName;
        if (phone) userUpdateData.phone = phone;
        // EMAIL REMOVED: if (email) userUpdateData.email = email;
        if (dateOfBirth) userUpdateData.dateOfBirth = new Date(dateOfBirth);
        if (location) userUpdateData.location = location;

        // Prepare profile update data
        const profileUpdateData = {};
        if (profilePicture !== undefined) profileUpdateData.profilePicture = profilePicture;
        if (gender) profileUpdateData.gender = gender;
        if (bio !== undefined) profileUpdateData.bio = bio;
        if (website !== undefined) profileUpdateData.website = website;
        if (country) profileUpdateData.country = country;
        if (city !== undefined) profileUpdateData.city = city;
        if (address !== undefined) profileUpdateData.address = address;
        if (postalCode !== undefined) profileUpdateData.postalCode = postalCode;
        if (emergencyContact) profileUpdateData.emergencyContact = emergencyContact;

        // Update user data if there are user fields to update
        if (Object.keys(userUpdateData).length > 0) {
            await Attendee.findByIdAndUpdate(userId, userUpdateData, { new: true });
        }

        // Update or create profile data
        let profile = await AttendeeProfile.findOneAndUpdate(
            { userId },
            profileUpdateData,
            { new: true, upsert: true }
        );

        return {
            success: true,
            message: 'Personal information updated successfully',
            data: profile
        };

    } catch (error) {
        console.error('Error in updatePersonalInfo:', error);
        // Remove the email duplicate error check since email is no longer updated
        return {
            success: false,
            message: error.message || 'Failed to update personal information'
        };
    }
}

    // Update preferences
    async updatePreferences(userId, preferencesData) {
        try {
            const updateData = {
                'preferences.favoriteCategories': preferencesData.favoriteCategories,
                'preferences.accessibility': preferencesData.accessibility,
                'preferences.language': preferencesData.language,
                'preferences.timezone': preferencesData.timezone,
                'preferences.currency': preferencesData.currency
            };

            // Remove undefined values
            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            const profile = await AttendeeProfile.findOneAndUpdate(
                { userId },
                updateData,
                { new: true, upsert: true }
            );

            return {
                success: true,
                message: 'Preferences updated successfully',
                data: profile.preferences
            };

        } catch (error) {
            console.error('Error in updatePreferences:', error);
            return {
                success: false,
                message: error.message || 'Failed to update preferences'
            };
        }
    }

    // Update notification settings
    async updateNotificationSettings(userId, notificationData) {
        try {
            const updateData = {};
            
            if (notificationData.email) {
                Object.keys(notificationData.email).forEach(key => {
                    updateData[`notifications.email.${key}`] = notificationData.email[key];
                });
            }
            
            if (notificationData.sms) {
                Object.keys(notificationData.sms).forEach(key => {
                    updateData[`notifications.sms.${key}`] = notificationData.sms[key];
                });
            }

            const profile = await AttendeeProfile.findOneAndUpdate(
                { userId },
                updateData,
                { new: true, upsert: true }
            );

            return {
                success: true,
                message: 'Notification settings updated successfully',
                data: profile.notifications
            };

        } catch (error) {
            console.error('Error in updateNotificationSettings:', error);
            return {
                success: false,
                message: error.message || 'Failed to update notification settings'
            };
        }
    }

    // Update security settings
    async updateSecuritySettings(userId, securityData) {
        try {
            const updateData = {};
            
            if (securityData.twoFactorEnabled !== undefined) {
                updateData['security.twoFactorEnabled'] = securityData.twoFactorEnabled;
            }
            
            if (securityData.loginAlerts !== undefined) {
                updateData['security.loginAlerts'] = securityData.loginAlerts;
            }

            const profile = await AttendeeProfile.findOneAndUpdate(
                { userId },
                updateData,
                { new: true, upsert: true }
            );

            return {
                success: true,
                message: 'Security settings updated successfully',
                data: profile.security
            };

        } catch (error) {
            console.error('Error in updateSecuritySettings:', error);
            return {
                success: false,
                message: error.message || 'Failed to update security settings'
            };
        }
    }

    // Change password
    async changePassword(userId, passwordData) {
        try {
            const { currentPassword, newPassword } = passwordData;

            // Get user with password
            const user = await Attendee.findById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found'
                };
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return {
                    success: false,
                    message: 'Current password is incorrect'
                };
            }

            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password in User model
            await Attendee.findByIdAndUpdate(userId, {
                password: hashedNewPassword
            });

            // Update last password change in profile
            await AttendeeProfile.findOneAndUpdate(
                { userId },
                { 'security.lastPasswordChange': new Date() },
                { upsert: true }
            );

            return {
                success: true,
                message: 'Password changed successfully'
            };

        } catch (error) {
            console.error('Error in changePassword:', error);
            return {
                success: false,
                message: error.message || 'Failed to change password'
            };
        }
    }

    // Update privacy settings
    async updatePrivacySettings(userId, privacyData) {
        try {
            const updateData = {};
            
            Object.keys(privacyData).forEach(key => {
                updateData[`privacy.${key}`] = privacyData[key];
            });

            const profile = await AttendeeProfile.findOneAndUpdate(
                { userId },
                updateData,
                { new: true, upsert: true }
            );

            return {
                success: true,
                message: 'Privacy settings updated successfully',
                data: profile.privacy
            };

        } catch (error) {
            console.error('Error in updatePrivacySettings:', error);
            return {
                success: false,
                message: error.message || 'Failed to update privacy settings'
            };
        }
    }

    // Get profile completion status
    async getProfileCompletion(userId) {
        try {
            const profile = await AttendeeProfile.findOne({ userId });
            
            if (!profile) {
                return {
                    success: true,
                    data: { completion: 0 }
                };
            }

            const completion = profile.calculateProfileCompletion();
            
            return {
                success: true,
                data: { completion }
            };

        } catch (error) {
            console.error('Error in getProfileCompletion:', error);
            return {
                success: false,
                message: error.message || 'Failed to get profile completion'
            };
        }
    }

    // Delete profile (soft delete by setting active: false)
    async deleteProfile(userId) {
        try {
            await AttendeeProfile.findOneAndDelete({ userId });
            
            return {
                success: true,
                message: 'Profile deleted successfully'
            };

        } catch (error) {
            console.error('Error in deleteProfile:', error);
            return {
                success: false,
                message: error.message || 'Failed to delete profile'
            };
        }
    }

    // Validate base64 image
    validateBase64Image(base64String) {
        if (!base64String) return true; // Allow null/empty
        
        // Check if it's a valid base64 image
        const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
        if (!base64Regex.test(base64String)) {
            return false;
        }
        
        // Check size (limit to 5MB)
        const sizeInBytes = (base64String.length * 3) / 4;
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        
        return sizeInBytes <= maxSizeInBytes;
    }

    // Convert base64 to buffer for validation
    base64ToBuffer(base64String) {
        if (!base64String) return null;
        
        try {
            const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
            return Buffer.from(base64Data, 'base64');
        } catch (error) {
            console.error('Error converting base64 to buffer:', error);
            return null;
        }
    }
}

module.exports = new AttendeeProfileService();