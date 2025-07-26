const router = require('express').Router();
const { verifyToken, verifyAttendee } = require('../Middleware/auth');
const TicketPurchase = require('../Service/TicketService');

// Get event details with tickets for purchase
router.get('/event/:eventId', verifyToken, verifyAttendee, TicketPurchase.getEventForPurchase);

// Validate ticket selection before creating order
router.post('/validate-selection', verifyToken, verifyAttendee, TicketPurchase.validateTicketSelection);

// Create purchase order (before payment)
router.post('/create-order', verifyToken, verifyAttendee, TicketPurchase.createPurchaseOrder);

// PayHere payment callbacks
router.post('/payment/success', TicketPurchase.processPaymentSuccess);
router.post('/payment/failure', TicketPurchase.processPaymentFailure);
router.post('/payment/notify', TicketPurchase.handlePayHereNotify);

// Get user's purchase history
router.get('/my-purchases', verifyToken, verifyAttendee, TicketPurchase.getUserPurchases);

// Get specific purchase details
router.get('/purchase/:orderReference', verifyToken, verifyAttendee, TicketPurchase.getPurchaseDetails);

// Cancel purchase (only pending payments)
router.delete('/purchase/:orderReference', verifyToken, verifyAttendee, TicketPurchase.cancelPurchase);

// Generate PayHere hash for payment
router.post('/generate-payment-hash', verifyToken, verifyAttendee, TicketPurchase.generatePaymentHash);

module.exports = router;