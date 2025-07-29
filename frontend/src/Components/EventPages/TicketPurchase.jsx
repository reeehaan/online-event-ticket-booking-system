/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const TicketPurchase = ({ eventId, onClose, onPurchaseComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Event and ticket data
    const [event, setEvent] = useState(null);
    const [ticketQuantities, setTicketQuantities] = useState({});
    
    // Order data
    const [orderSummary, setOrderSummary] = useState(null);
    const [orderReference, setOrderReference] = useState('');
    
    // Form data
    const [billingDetails, setBillingDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nicPassport: ''
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('visa_master');
    const [termsAccepted, setTermsAccepted] = useState(false);


    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    // Axios instance with default config
    const api = axios.create({
        baseURL: 'http://localhost:3000/api/attendee/ticket',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    // Load PayHere script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://www.payhere.lk/lib/payhere.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Fetch event details when component mounts
    useEffect(() => {
        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    const fetchEventDetails = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await api.get(`/event/${eventId}`);
            
            if (response.data.success) {
                setEvent(response.data.data.event);
                // Initialize ticket quantities to 0
                const initialQuantities = {};
                response.data.data.event.tickets.forEach(ticket => {
                    initialQuantities[ticket._id] = 0;
                });
                setTicketQuantities(initialQuantities);
            } else {
                setError(response.data.message || 'Failed to load event details');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load event details');
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (ticketId, change) => {
        setTicketQuantities(prev => {
            const currentQty = prev[ticketId] || 0;
            const newQty = Math.max(0, currentQty + change);
            const ticket = event.tickets.find(t => t._id === ticketId);
            
            if (!ticket) return prev;
            
            const maxAvailable = ticket.available;
            const maxAllowed = Math.min(maxAvailable, ticket.maxPerPurchase);
            
            return {
                ...prev,
                [ticketId]: Math.min(newQty, maxAllowed)
            };
        });
    };

    const calculateSubtotal = () => {
        if (!event) return 0;
        return Object.entries(ticketQuantities).reduce((total, [ticketId, quantity]) => {
            const ticket = event.tickets.find(t => t._id === ticketId);
            return total + (ticket ? ticket.price * quantity : 0);
        }, 0);
    };

    const calculateConvenienceFee = (subtotal) => {
        return Math.round(subtotal * 0.02); // 2% convenience fee
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal + calculateConvenienceFee(subtotal);
    };

    const getSelectedTickets = () => {
        return Object.entries(ticketQuantities)
            .filter(([_, quantity]) => quantity > 0)
            .reduce((acc, [ticketId, quantity]) => {
                acc[ticketId] = quantity;
                return acc;
            }, {});
    };

    const validateTicketSelection = async () => {
        const selectedTickets = getSelectedTickets();
        
        if (Object.keys(selectedTickets).length === 0) {
            setError('Please select at least one ticket');
            return false;
        }

        setLoading(true);
        setError('');
        
        try {
            const response = await api.post('/validate-selection', {
                eventId: eventId,
                ticketQuantities: selectedTickets
            });
            
            if (response.data.success) {
                setOrderSummary(response.data.data);
                return true;
            } else {
                setError(response.data.message || 'Ticket validation failed');
                return false;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to validate tickets');
            console.error('Validation error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        setError('');
        const isValid = await validateTicketSelection();
        if (isValid) {
            setCurrentStep(2);
        }
    };

    const handleBack = () => {
        setError('');
        if (currentStep === 1) {
            onClose();
        } else {
            setCurrentStep(1);
        }
    };

    const handleBillingChange = (field, value) => {
        setBillingDetails(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateBillingDetails = () => {
        const requiredFields = [
            { field: 'firstName', label: 'First Name' },
            { field: 'lastName', label: 'Last Name' },
            { field: 'email', label: 'Email' },
            { field: 'phone', label: 'Phone' }
        ];

        for (const { field, label } of requiredFields) {
            if (!billingDetails[field]?.trim()) {
                setError(`${label} is required`);
                return false;
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(billingDetails.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Phone validation (basic)
        if (billingDetails.phone.length < 10) {
            setError('Please enter a valid phone number');
            return false;
        }

        return true;
    };

    const createPurchaseOrder = async () => {
        setLoading(true);
        setError('');
        
        try {
            const selectedTickets = getSelectedTickets();
            
            const response = await api.post('/create-order', {
                eventId: eventId,
                ticketQuantities: selectedTickets,
                userInfo: billingDetails,
                paymentMethod: selectedPaymentMethod
            });
            
            if (response.data.success) {
                setOrderReference(response.data.data.orderReference);
                return response.data.data;
            } else {
                setError(response.data.message || 'Failed to create order');
                return null;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create purchase order');
            console.error('Order creation error:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const generatePaymentHash = async (orderRef, amount) => {
        try {
            const response = await api.post('/generate-payment-hash', {
                orderReference: orderRef,
                amount: amount
            });
            
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to generate payment hash');
            }
        } catch (err) {
            console.error('Hash generation error:', err);
            throw new Error(err.response?.data?.message || 'Failed to generate payment hash');
        }
    };

    const initializePayHere = async (orderData, hashData) => {
        return new Promise((resolve, reject) => {
            // PayHere event handlers
            window.payhere.onCompleted = function(orderId) {
                console.log("Payment completed. OrderID:" + orderId);
                resolve({ success: true, orderId });
            };

            window.payhere.onDismissed = function() {
                console.log("Payment dismissed");
                resolve({ success: false, reason: 'dismissed' });
            };

            window.payhere.onError = function(error) {
                console.log("PayHere Error:" + error);
                reject(new Error(error));
            };

            // Payment object
            const payment = {
                sandbox: hashData.sandbox,
                merchant_id: hashData.merchantId,
                return_url: `${window.location.origin}/payment-success`,
                cancel_url: `${window.location.origin}/payment-cancelled`,
                notify_url: "http://localhost:3000/api/attendee/ticket/payment/notify",
                order_id: orderData.orderReference,
                items: `${event.title} - Event Tickets`,
                amount: orderData.totalAmount.toFixed(2),
                currency: hashData.currency,
                hash: hashData.hash,
                first_name: billingDetails.firstName,
                last_name: billingDetails.lastName,
                email: billingDetails.email,
                phone: billingDetails.phone,
                nicPassport :billingDetails.nicPassport,
                address: "Sri Lanka",
                city: "Colombo",
                country: "Sri Lanka",
                delivery_address: "N/A",
                delivery_city: "N/A",
                delivery_country: "Sri Lanka",
                custom_1: orderData.orderReference,
                custom_2: eventId
            };
            console.log(payment);

            // Start PayHere payment
            window.payhere.startPayment(payment);
        });
    };

    const handleProceedToPay = async () => {
        setError('');

        // Validate form
        if (!selectedPaymentMethod) {
            setError('Please select a payment method');
            return;
        }
        
        if (!termsAccepted) {
            setError('Please accept the terms and conditions');
            return;
        }

        if (!validateBillingDetails()) {
            return;
        }

        try {
            setLoading(true);

            // Step 1: Create purchase order
            const orderData = await createPurchaseOrder();
            if (!orderData) return;

            // Step 2: Generate PayHere hash
            const hashData = await generatePaymentHash(orderData.orderReference, orderData.totalAmount);

            // Step 3: Initialize PayHere payment
            const paymentResult = await initializePayHere(orderData, hashData);

            if (paymentResult.success) {
                // Payment successful - handle success
                await handlePaymentSuccess(orderData.orderReference, paymentResult.orderId);
            } else if (paymentResult.reason === 'dismissed') {
                setError('Payment was cancelled. You can try again.');
            }

        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
            console.error('Payment error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (orderRef, paymentId) => {
        try {
            // Notify backend about successful payment using axios
            const response = await axios.post('http://localhost:3000/api/attendee/ticket/payment/success', {
                order_id: orderRef,
                payment_id: paymentId || Date.now().toString(),
            });
            
            if (response.data.success) {
                // Show success message and close modal
                if (onPurchaseComplete) {
                    onPurchaseComplete({
                        orderReference: orderRef,
                        qrCode: response.data.data.qrCode,
                        event: event
                    });
                }
                onClose();
            } else {
                setError('Payment processing failed. Please contact support.');
            }
        } catch (err) {
            console.error('Payment success handling error:', err);
            setError('Payment completed but confirmation failed. Please contact support.');
        }
    };

    if (loading && !event) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <div className="flex items-center space-x-3">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span>Loading event details...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex items-center space-x-3 text-red-600 mb-4">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-semibold">Error</span>
                    </div>
                    <p className="text-gray-700 mb-4">
                        {error || 'Failed to load event details'}
                    </p>
                    <button 
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const subtotal = calculateSubtotal();
    const convenienceFee = calculateConvenienceFee(subtotal);
    const total = calculateTotal();
    const hasSelectedTickets = Object.values(ticketQuantities).some(q => q > 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-20">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleBack} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={loading}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold">
                            {currentStep === 1 ? 'Select Tickets' : 'Payment Details'}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center py-6 bg-gray-50">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                                currentStep === 1 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-blue-600 text-white'
                            }`}>
                                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                            </div>
                            <span className={currentStep === 1 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                                Select Tickets
                            </span>
                        </div>
                        <div className="w-16 h-px bg-gray-300"></div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                                currentStep === 2 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-300 text-gray-600'
                            }`}>
                                2
                            </div>
                            <span className={currentStep === 2 ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                                Payment
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Error</span>
                        </div>
                        <p className="text-red-700 mt-1">{error}</p>
                    </div>
                )}

                <div className="p-6">
                    {currentStep === 1 ? (
                        /* Step 1: Ticket Selection */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left side - Event image */}
                            <div>
                                <img
                                    src={event.image || '/api/placeholder/400/500'}
                                    alt={event.title}
                                    className="w-full h-auto rounded-lg object-cover"
                                />
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                    <p className="text-gray-600 mt-1">
                                        {new Date(event.date).toLocaleDateString()} • {event.venue}
                                    </p>
                                </div>
                            </div>

                            {/* Right side - Ticket selection */}
                            <div>
                                <h3 className="text-2xl font-bold text-blue-600 mb-6 text-center">
                                    SELECT TICKETS
                                </h3>

                                <div className="bg-white border rounded-lg">
                                    <div className="p-4 border-b bg-gray-50">
                                        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
                                            <div>Category</div>
                                            <div>Price</div>
                                            <div>Quantity</div>
                                            <div className="text-right">Amount</div>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        {event.tickets && event.tickets.length > 0 ? (
                                            event.tickets.map(ticket => {
                                                const quantity = ticketQuantities[ticket._id] || 0;
                                                const isAvailable = ticket.isAvailable && ticket.available > 0;
                                                
                                                return (
                                                    <div key={ticket._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">{ticket.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                Available: {ticket.available}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-center min-w-0 px-2">
                                                            <span className="text-sm font-medium">
                                                                {ticket.price.toLocaleString()} LKR
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-center min-w-0 px-2">
                                                            {!isAvailable ? (
                                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                                                    SOLD OUT
                                                                </span>
                                                            ) : (
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => updateQuantity(ticket._id, -1)}
                                                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        disabled={quantity === 0 || loading}
                                                                    >
                                                                        <Minus className="w-4 h-4 text-gray-600" />
                                                                    </button>
                                                                    <span className="w-8 text-center font-medium">{quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(ticket._id, 1)}
                                                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        disabled={quantity >= Math.min(ticket.available, ticket.maxPerPurchase) || loading}
                                                                    >
                                                                        <Plus className="w-4 h-4 text-gray-600" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="w-24 text-right font-medium min-w-0">
                                                            {isAvailable && quantity > 0 
                                                                ? `${(ticket.price * quantity).toLocaleString()} LKR`
                                                                : '-'
                                                            }
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No tickets available for this event
                                            </div>
                                        )}
                                    </div>

                                    {event.tickets && event.tickets.length > 0 && (
                                        <div className="p-4 border-t bg-gray-50 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>{subtotal.toLocaleString()} LKR</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Convenience Fee (2%)</span>
                                                <span>+ {convenienceFee.toLocaleString()} LKR</span>
                                            </div>
                                            <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                                <span>Total</span>
                                                <span>{total.toLocaleString()} LKR</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={!hasSelectedTickets || loading}
                                    className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Validating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Checkout</span>
                                            <span>→</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Payment Details */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left side - Billing Details */}
                            <div>
                                <h3 className="text-xl font-semibold text-blue-600 mb-6">Billing Details</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="First Name *"
                                        value={billingDetails.firstName}
                                        onChange={(e) => handleBillingChange('firstName', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        disabled={loading}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name *"
                                        value={billingDetails.lastName}
                                        onChange={(e) => handleBillingChange('lastName', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        disabled={loading}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address *"
                                        value={billingDetails.email}
                                        onChange={(e) => handleBillingChange('email', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        disabled={loading}
                                        required
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number *"
                                        value={billingDetails.phone}
                                        onChange={(e) => handleBillingChange('phone', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        disabled={loading}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="NIC / Passport / Driving License"
                                        value={billingDetails.nicPassport}
                                        onChange={(e) => handleBillingChange('nicPassport', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Right side - Booking Summary & Payment */}
                            <div>
                                <h3 className="text-xl font-semibold text-blue-600 mb-6">Booking Summary</h3>
                                
                                {/* Order Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <div className="space-y-3">
                                        {Object.entries(ticketQuantities)
                                            .filter(([_, quantity]) => quantity > 0)
                                            .map(([ticketId, quantity]) => {
                                                const ticket = event.tickets.find(t => t._id === ticketId);
                                                if (!ticket) return null;
                                                return (
                                                    <div key={ticketId} className="flex justify-between items-center">
                                                        <div className="flex-1">
                                                            <span className="font-medium">{ticket.name}</span>
                                                            <span className="text-sm text-gray-600 ml-2">x {quantity}</span>
                                                        </div>
                                                        <span className="font-medium">{(ticket.price * quantity).toLocaleString()} LKR</span>
                                                    </div>
                                                );
                                            })}
                                        
                                        <div className="border-t pt-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>{subtotal.toLocaleString()} LKR</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Convenience Fee (1%)</span>
                                                <span>+ {convenienceFee.toLocaleString()} LKR</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                <span>Total</span>
                                                <span>{total.toLocaleString()} LKR</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                
                                <h4 className="text-lg font-semibold text-blue-600 mb-4">Choose A Payment Method</h4>
                                <div className="space-y-6 mb-6">
                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="visa_master"
                                                checked={selectedPaymentMethod === 'visa_master'}
                                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                className="text-blue-600"
                                            />
                                            <span className="text-gray-700">Pay via VISA / Master</span>
                                        </label>
                                        <div className="ml-7 mt-3 flex items-center space-x-2">
                                            <img 
                                                src="../src/assets/mastercard.webp" 
                                                alt="Visa"
                                                className="h-8 w-auto"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="koko"
                                                checked={selectedPaymentMethod === 'koko'}
                                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                className="text-blue-600"
                                            />
                                            <span className="text-gray-700">Pay via KOKO (Buy Now Pay Later)</span>
                                        </label>
                                        <div className="ml-7 mt-3">
                                            <img 
                                                src="../src/assets/koko.png" 
                                                alt="KOKO"
                                                className="h-8 w-auto"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="other"
                                                checked={selectedPaymentMethod === 'other'}
                                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                className="text-blue-600"
                                            />
                                            <span className="text-gray-700">Pay via AMEX, FriMi and Other</span>
                                        </label>
                                        <div className="ml-7 mt-3">
                                            <img 
                                                src="../src/assets/payhere.webp" 
                                                alt="PayHere"
                                                className="h-8 w-auto"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="mb-6">
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="mt-1 text-blue-600"
                                            disabled={loading}
                                        />
                                        <span className="text-sm text-gray-700">
                                            I accept and agree to the{' '}
                                            <button 
                                                type="button"
                                                className="text-blue-600 hover:underline"
                                                onClick={() => {/* Handle terms modal */}}
                                            >
                                                Terms and Conditions
                                            </button>
                                            {' '}and{' '}
                                            <button 
                                                type="button"
                                                className="text-blue-600 hover:underline"
                                                onClick={() => {/* Handle privacy modal */}}
                                            >
                                                Privacy Policy
                                            </button>
                                        </span>
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleBack}
                                        className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                                        disabled={loading}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        onClick={handleProceedToPay}
                                        disabled={!selectedPaymentMethod || !termsAccepted || loading}
                                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Proceed to Pay</span>
                                                <span>→</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketPurchase;