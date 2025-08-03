const express = require('express');
const router = express.Router();
const attendeeProfileService = require('../Service/AttendeeProfileService');
const { verifyToken, verifyAttendee } = require('../Middleware/auth'); // Using your actual auth functions

// Validation middleware for profile updates
const validateProfileData = (req, res, next) => {
    const { profilePicture } = req.body;
    
    // Validate profile picture if provided
    if (profilePicture && !attendeeProfileService.validateBase64Image(profilePicture)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid profile picture format or size. Must be a valid base64 image under 5MB.'
        });
    }
    
    next();
};

// Validation middleware for password change
const validatePasswordData = (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Current password, new password, and confirm password are required'
        });
    }
    
    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'New password and confirm password do not match'
        });
    }
    
    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 8 characters long'
        });
    }
    
    next();
};

// Helper function to get user ID from request
const getUserId = (req) => {
    // Your auth middleware stores the JWT payload in req.user
    // The user ID is likely in req.user._id (based on your JWT verification)
    return req.user._id || req.user.id;
};

// @route   GET /api/attendee/profile
// @desc    Get attendee profile (combines User and Profile data)
// @access  Private (Attendee only)
router.get('/profile', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await attendeeProfileService.getOrCreateProfile(userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in GET /profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   PUT /api/attendee/profile/personal
// @desc    Update personal information
// @access  Private (Attendee only)
router.put('/profile/personal', verifyToken, verifyAttendee, validateProfileData, async (req, res) => {
    try {
        const userId = getUserId(req);
        const updateData = req.body;
        
        const result = await attendeeProfileService.updatePersonalInfo(userId, updateData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in PUT /profile/personal:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   PUT /api/attendee/profile/preferences
// @desc    Update preferences
// @access  Private (Attendee only)
router.put('/profile/preferences', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        const preferencesData = req.body;
        
        const result = await attendeeProfileService.updatePreferences(userId, preferencesData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in PUT /profile/preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   PUT /api/attendee/profile/notifications
// @desc    Update notification settings
// @access  Private (Attendee only)
router.put('/profile/notifications', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        const notificationData = req.body;
        
        const result = await attendeeProfileService.updateNotificationSettings(userId, notificationData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in PUT /profile/notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   PUT /api/attendee/profile/security
// @desc    Update security settings
// @access  Private (Attendee only)
router.put('/profile/security', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        const securityData = req.body;
        
        const result = await attendeeProfileService.updateSecuritySettings(userId, securityData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in PUT /profile/security:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   PUT /api/attendee/profile/change-password
// @desc    Change password
// @access  Private (Attendee only)
router.put('/profile/change-password', verifyToken, verifyAttendee, validatePasswordData, async (req, res) => {
    try {
        const userId = getUserId(req);
        const passwordData = req.body;
        
        const result = await attendeeProfileService.changePassword(userId, passwordData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in PUT /profile/change-password:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   PUT /api/attendee/profile/privacy
// @desc    Update privacy settings
// @access  Private (Attendee only)
router.put('/profile/privacy', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        const privacyData = req.body;
        
        const result = await attendeeProfileService.updatePrivacySettings(userId, privacyData);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in PUT /profile/privacy:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   GET /api/attendee/profile/completion
// @desc    Get profile completion percentage
// @access  Private (Attendee only)
router.get('/profile/completion', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await attendeeProfileService.getProfileCompletion(userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in GET /profile/completion:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   DELETE /api/attendee/profile
// @desc    Delete attendee profile
// @access  Private (Attendee only)
router.delete('/profile', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await attendeeProfileService.deleteProfile(userId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Error in DELETE /profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   POST /api/attendee/profile/upload-image
// @desc    Upload profile image (base64)
// @access  Private (Attendee only)
router.post('/profile/upload-image', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { profilePicture } = req.body;
        
        if (!profilePicture) {
            return res.status(400).json({
                success: false,
                message: 'Profile picture data is required'
            });
        }
        
        // Validate base64 image
        if (!attendeeProfileService.validateBase64Image(profilePicture)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid profile picture format or size. Must be a valid base64 image under 5MB.'
            });
        }
        
        const result = await attendeeProfileService.updatePersonalInfo(userId, { profilePicture });
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: { profilePicture }
        });
        
    } catch (error) {
        console.error('Error in POST /profile/upload-image:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   DELETE /api/attendee/profile/image
// @desc    Remove profile image
// @access  Private (Attendee only)
router.delete('/profile/image', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        const result = await attendeeProfileService.updatePersonalInfo(userId, { profilePicture: null });
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json({
            success: true,
            message: 'Profile picture removed successfully'
        });
        
    } catch (error) {
        console.error('Error in DELETE /profile/image:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// @route   GET /api/attendee/profile/stats
// @desc    Get profile statistics
// @access  Private (Attendee only)
router.get('/profile/stats', verifyToken, verifyAttendee, async (req, res) => {
    try {
        const userId = getUserId(req);
        
        // Get profile completion
        const completionResult = await attendeeProfileService.getProfileCompletion(userId);
        
        // Get profile data for additional stats
        const profileResult = await attendeeProfileService.getOrCreateProfile(userId);
        
        if (!completionResult.success || !profileResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to fetch profile statistics'
            });
        }
        
        const profile = profileResult.data;
        
        res.json({
            success: true,
            data: {
                profileCompletion: completionResult.data.completion,
                memberStatus: profile.memberStatus,
                memberSince: profile.memberSince,
                lastUpdate: profile.updatedAt,
                hasProfilePicture: !!profile.profilePicture,
                favoriteCategories: profile.preferences?.favoriteCategories?.length || 0,
                twoFactorEnabled: profile.security?.twoFactorEnabled || false
            }
        });
        
    } catch (error) {
        console.error('Error in GET /profile/stats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;