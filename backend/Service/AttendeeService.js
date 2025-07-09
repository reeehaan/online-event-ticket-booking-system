const Event = require('../Models/Event');

const getAllEvents = async (req, res) => {
    try {
        const { category, subcategory, date, status = 'published' } = req.query;
        
        let query = { status };
        
        // Add filters if provided
        if (category) query.category = category;
        if (subcategory) query.subcategory = new RegExp(subcategory, 'i');
        if (date) {
            const filterDate = new Date(date);
            query.date = { $gte: filterDate };
        } else {
            // By default, only show future events
            query.date = { $gte: new Date() };
        }

        const events = await Event.find(query)
            .populate('createdBy', 'firstName lastName organizationName organizationType')
            .sort({ date: 1, time: 1 });

        res.json({
            success: true,
            message: 'Events retrieved successfully',
            data: {
                events,
                count: events.length
            }
        });

    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while retrieving events'
        });
    }
};

module.exports = {
    getAllEvents
}