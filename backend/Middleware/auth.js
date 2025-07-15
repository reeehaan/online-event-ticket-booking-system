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
        
        const user = await User.findById(verified._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }

        
        req.user = {
            ...verified,
            userData: user 
        };
        
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        
        
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


const verifyAttendee = (req, res, next) => {
    if (req.user.userType !== 'attendee') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Attendee role required.'
        });
    }
    next();
};


const verifyOrganizer = (req, res, next) => {
    if (req.user.userType !== 'organizer') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Organizer role required.'
        });
    }
    next();
};


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