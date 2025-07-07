const jwt = require('jsonwebtoken');
const { User } = require('../Models/User');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Remove 'Bearer ' from token string
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token format is invalid.'
            });
        }

        // Verify the token
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        
        // Optional: Get fresh user data from database for enhanced security
        // This ensures the user still exists and hasn't been deactivated
        const user = await User.findById(verified._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }

        // Add both token data and fresh user data to request
        req.user = {
            ...verified,
            userData: user // Full user data from database
        };
        
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        
        // Handle different JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token has expired.'
            });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token.'
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token verification failed.'
            });
        }
    }
};

// Enhanced attendee role verification middleware
const verifyAttendee = (req, res, next) => {
    if (req.user.userType !== 'attendee') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Attendee role required.'
        });
    }
    next();
};

// Enhanced organizer role verification middleware
const verifyOrganizer = (req, res, next) => {
    if (req.user.userType !== 'organizer') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Organizer role required.'
        });
    }
    next();
};

// Optional: Admin role verification (if you add admin role in future)
const verifyAdmin = (req, res, next) => {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.'
        });
    }
    next();
};

module.exports = { verifyToken, verifyAttendee, verifyOrganizer, verifyAdmin };