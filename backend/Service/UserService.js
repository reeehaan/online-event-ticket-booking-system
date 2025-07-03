const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Attendee, Organizer } = require('../Models/User');

// Register function
const register = async (req, res) => {
try {
    const { userType } = req.body;

    // Validate userType
    if (!userType || !['attendee', 'organizer'].includes(userType)) {
    return res.status(400).json({
        success: false,
        message: 'Invalid or missing user type'
    });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) {
    return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
    });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    let newUser;

    if (userType === 'attendee') {
    // Validate attendee-specific fields
    const { firstName, lastName, email, phone, dateOfBirth, location, interests } = req.body;
    
    if (!firstName || !lastName || !email || !phone || !dateOfBirth || !location) {
        return res.status(400).json({
        success: false,
        message: 'Missing required fields for attendee registration'
        });
    }

    // Create attendee
    newUser = new Attendee({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone.trim(),
        dateOfBirth: new Date(dateOfBirth),
        location: location.trim(),
        interests: interests || []
    });

    } else if (userType === 'organizer') {
    // Validate organizer-specific fields
    const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        organizationName, 
        organizationType, 
        description, 
        address, 
        city 
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !organizationName || 
        !organizationType || !description || !address || !city) {
        return res.status(400).json({
        success: false,
        message: 'Missing required fields for organizer registration'
        });
    }

    // Create organizer
    newUser = new Organizer({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone.trim(),
        organizationName: organizationName.trim(),
        organizationType,
        description: description.trim(),
        address: address.trim(),
        city: city.trim()
    });
    }

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
    { 
        userId: newUser._id, 
        userType: newUser.userType,
        email: newUser.email 
    },
    process.env.TOKEN_SECRET,
    { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
    success: true,
    message: userType === 'organizer' 
        ? 'Organizer registration successful! Your account will be reviewed within 24 hours.'
        : 'Registration successful!',
    data: {
        user: userResponse,
        token
    }
    });

} catch (error) {
    console.error('Registration error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
    });
    }

    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
    return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
    });
    }

    res.status(500).json({
    success: false,
    message: 'Internal server error during registration'
    });
}
};

module.exports = { register };