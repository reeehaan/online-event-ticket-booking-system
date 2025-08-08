const express = require('express');
const router = express.Router();
const { verifyToken, verifyOrganizer } = require('../Middleware/auth');
const OrganizerProfileService = require('../Service/OrganizerProfileService');

// Helper function to get user ID from request
const getUserId = (req) => {
    return req.user._id;
};

// GET /api/organizer-profile/profile - Get organizer profile
router.get('/profile', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const profile = await OrganizerProfileService.getOrCreateProfile(userId);

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: profile
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch profile'
        });
    }
});

// PUT /api/organizer-profile/profile/personal - Update personal information
router.put('/profile/personal', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const profileData = req.body;

        const updatedProfile = await OrganizerProfileService.updatePersonalInfo(userId, profileData);

        res.json({
            success: true,
            message: 'Personal information updated successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Error updating personal info:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update personal information'
        });
    }
});

// PUT /api/organizer-profile/profile/banking - Update banking details
router.put('/profile/banking', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const bankingData = req.body;

        const updatedProfile = await OrganizerProfileService.updateBankingDetails(userId, bankingData);

        res.json({
            success: true,
            message: 'Banking details updated successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Error updating banking details:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update banking details'
        });
    }
});

// PUT /api/organizer-profile/profile/preferences - Update preferences
router.put('/profile/preferences', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const preferencesData = req.body;

        const updatedProfile = await OrganizerProfileService.updatePreferences(userId, preferencesData);

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update preferences'
        });
    }
});

// PUT /api/organizer-profile/profile/notifications - Update notification settings
router.put('/profile/notifications', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const notificationData = req.body;

        const updatedProfile = await OrganizerProfileService.updateNotifications(userId, notificationData);

        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update notification settings'
        });
    }
});

// PUT /api/organizer-profile/profile/security - Update security settings
router.put('/profile/security', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const securityData = req.body;

        const updatedProfile = await OrganizerProfileService.updateSecuritySettings(userId, securityData);

        res.json({
            success: true,
            message: 'Security settings updated successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Error updating security settings:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update security settings'
        });
    }
});

// PUT /api/organizer-profile/profile/change-password - Change password
router.put('/profile/change-password', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate passwords
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const result = await OrganizerProfileService.changePassword(userId, currentPassword, newPassword);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to change password'
        });
    }
});

// POST /api/organizer-profile/profile/upload-image - Upload profile picture
router.post('/profile/upload-image', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { profilePicture } = req.body;

        if (!profilePicture) {
            return res.status(400).json({
                success: false,
                message: 'Profile picture data is required'
            });
        }

        const updatedProfile = await OrganizerProfileService.uploadProfilePicture(userId, profilePicture);

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to upload profile picture'
        });
    }
});

// DELETE /api/organizer-profile/profile/image - Remove profile picture
router.delete('/profile/image', verifyToken, verifyOrganizer, async (req, res) => {
    try {
        const userId = getUserId(req);
        const updatedProfile = await OrganizerProfileService.removeProfilePicture(userId);

        res.json({
            success: true,
            message: 'Profile picture removed successfully',
            data: updatedProfile
        });

    } catch (error) {
        console.error('Error removing profile picture:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to remove profile picture'
        });
    }
});

// GET /api/organizer-profile/public/:userId - Get public profile info
router.get('/public/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const publicProfile = await OrganizerProfileService.getPublicProfile(userId);

        if (!publicProfile) {
            return res.status(404).json({
                success: false,
                message: 'Organizer profile not found'
            });
        }

        res.json({
            success: true,
            message: 'Public profile retrieved successfully',
            data: publicProfile
        });

    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch public profile'
        });
    }
});

module.exports = router;