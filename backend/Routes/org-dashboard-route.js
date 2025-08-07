const express = require('express');
const router = express.Router();
const { verifyToken, verifyOrganizer } = require('../Middleware/auth');
const OrgLandingPageServices = require('../Service/OrgLandingPageServices');

// Helper function to get user ID from request
const getUserId = (req) => {
    return req.user._id;
};

// Test route without middleware first
router.get('/test', async (req, res) => {
  res.json({ success: true, message: 'Dashboard routes are working' });
});

// GET /api/org/dashboard/stats - Get dashboard statistics
router.get('/stats', (req, res, next) => {
  console.log('Headers received:', req.headers.authorization);
  next();
}, verifyToken, async (req, res) => {
  try {
    console.log('Token verification passed, req.user:', req.user);
    const userId = getUserId(req);
    console.log('User ID extracted:', userId);
    const result = await OrgLandingPageServices.getDashboardStats(userId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/org/dashboard/revenue - Get revenue data for charts
router.get('/revenue', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { timeframe = '7D' } = req.query;
    const result = await OrgLandingPageServices.getRevenueData(userId, timeframe);
    res.json(result);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/org/dashboard/events - Get organizer's events
router.get('/events', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { limit = 10 } = req.query;
    const result = await OrgLandingPageServices.getOrganizerEvents(userId, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/org/dashboard/ticket-types - Get ticket type distribution
router.get('/ticket-types', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await OrgLandingPageServices.getTicketTypeData(userId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching ticket types:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/org/dashboard/sales-trend - Get sales trend data
router.get('/sales-trend', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { period = '30D' } = req.query;
    const result = await OrgLandingPageServices.getSalesTrendData(userId, period);
    res.json(result);
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/org/dashboard/traffic-sources - Get traffic sources data
router.get('/traffic-sources', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await OrgLandingPageServices.getTrafficSourcesData(userId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/org/dashboard/event-performance - Get event performance data
router.get('/event-performance', verifyToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await OrgLandingPageServices.getEventPerformance(userId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching event performance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;