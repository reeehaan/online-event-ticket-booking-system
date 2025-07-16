import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, CreditCard, User, Mail, Phone, MapPin, Loader2, Calendar, Clock, Map } from 'lucide-react';
import axios from 'axios';

const TicketPurchase = ({ ticket, event, onClose, onPurchaseComplete }) => {
    const [quantity, setQuantity] = useState(1);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [paymentStatus, setPaymentStatus] = useState('');

    const totalPrice = ticket.price * quantity;
    const maxQuantity = Math.min(ticket.maxPerPurchase, ticket.remaining);

    
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://www.payhere.lk/lib/payhere.js';
        script.async = true;
        document.body.appendChild(script);

        
        axios.defaults.baseURL = 'http://localhost:3000/api';
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        
        
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized access
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );

        return () => {
            // Cleanup
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const handleQuantityChange = (action) => {
        if (action === 'increment' && quantity < maxQuantity) {
            setQuantity(quantity + 1);
        } else if (action === 'decrement' && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleInputChange = (field, value) => {
        setCustomerInfo(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!customerInfo.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!customerInfo.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        
        if (!customerInfo.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s\-\(\)]+$/.test(customerInfo.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'TBD';
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Generate a simple hash for demonstration (in production, this should be done on backend)
    const generateHash = (orderId, amount, currency) => {
        // This is a simplified hash generation - in production, use proper HMAC with secret key
        const merchantId = "1221149";
        const merchantSecret = "your_merchant_secret"; // This should be kept secure on backend
        const hashString = `${merchantId}${orderId}${amount}${currency}${merchantSecret}`;
        return btoa(hashString); // Base64 encode for demo - use proper crypto in production
    };

    // API call functions using axios
    const createPurchaseOrder = async (purchaseData) => {
        try {
            const response = await axios.post('/purchases/create', purchaseData);
            return response.data;
        } catch (error) {
            console.error('Error creating purchase order:', error);
            throw new Error(error.response?.data?.message || 'Failed to create purchase order');
        }
    };

    const updatePurchaseStatus = async (orderId, status, transactionId) => {
        try {
            const response = await axios.put(`/purchases/${orderId}/status`, {
                status,
                transactionId
            });
            return response.data;
        } catch (error) {
            console.error('Error updating purchase status:', error);
            throw new Error(error.response?.data?.message || 'Failed to update purchase status');
        }
    };

    const sendTicketEmail = async (purchaseId) => {
        try {
            const response = await axios.post(`/purchases/${purchaseId}/send-email`);
            return response.data;
        } catch (error) {
            console.error('Error sending ticket email:', error);
            throw new Error(error.response?.data?.message || 'Failed to send ticket email');
        }
    };

    // Mock fallback functions for demo purposes
    const createPurchaseOrderMock = async (purchaseData) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate order ID
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const purchaseId = `PURCHASE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate hash (this should be done on backend with proper security)
        const hash = generateHash(orderId, purchaseData.totalAmount, ticket.currency);
        
        // Mock successful response
        return {
            success: true,
            orderId,
            purchaseId,
            hash,
            message: 'Order created successfully'
        };
    };

    const updatePurchaseStatusMock = async (orderId, status, transactionId) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`Updated purchase ${orderId} status to ${status}`, { transactionId });
        
        return {
            success: true,
            message: 'Purchase status updated'
        };
    };

    const sendTicketEmailMock = async (purchaseId) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`Sending ticket email for purchase ${purchaseId}`);
        
        return {
            success: true,
            message: 'Ticket email sent'
        };
    };

    const initializePayHere = (orderData) => {
        const payment = {
            sandbox: true, // Set to false for production
            merchant_id: "1221149", // Replace with your PayHere merchant ID
            return_url: window.location.origin + "/payment/return",
            cancel_url: window.location.origin + "/payment/cancel",
            notify_url: window.location.origin + "/api/payment/notify",
            order_id: orderData.orderId,
            items: `${event.title} - ${ticket.name}`,
            amount: totalPrice.toFixed(2),
            currency: ticket.currency,
            hash: orderData.hash,
            first_name: customerInfo.name.split(' ')[0],
            last_name: customerInfo.name.split(' ').slice(1).join(' ') || '',
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address || '',
            city: "Colombo",
            country: "Sri Lanka",
            delivery_address: customerInfo.address || '',
            delivery_city: "Colombo",
            delivery_country: "Sri Lanka",
            custom_1: ticket.id,
            custom_2: quantity.toString()
        };

        // PayHere event handlers
        window.payhere.onCompleted = async function onCompleted(orderId) {
            console.log("Payment completed. OrderID:" + orderId);
            setPaymentStatus('Processing payment completion...');
            
            try {
                // Try real API first, fallback to mock
                try {
                    await updatePurchaseStatus(orderData.purchaseId, 'completed', orderId);
                    await sendTicketEmail(orderData.purchaseId);
                } catch (apiError) {
                    console.log('API not available, using mock functions');
                    await updatePurchaseStatusMock(orderData.purchaseId, 'completed', orderId);
                    await sendTicketEmailMock(orderData.purchaseId);
                }
                
                // Notify parent component
                onPurchaseComplete({
                    orderId,
                    purchaseId: orderData.purchaseId,
                    event: event.title,
                    ticketType: ticket.name,
                    quantity,
                    totalPrice,
                    customerInfo
                });
                
                setPaymentStatus('Payment successful!');
                setTimeout(() => {
                    onClose();
                }, 2000);
                
            } catch (error) {
                console.error('Error processing completed payment:', error);
                setPaymentStatus('Payment completed but there was an error. Please contact support.');
                setIsProcessing(false);
            }
        };

        window.payhere.onDismissed = function onDismissed() {
            console.log("Payment dismissed");
            setPaymentStatus('Payment was cancelled');
            setIsProcessing(false);
        };

        window.payhere.onError = async function onError(error) {
            console.log("Error:" + error);
            setPaymentStatus('Payment failed. Please try again.');
            
            try {
                // Try real API first, fallback to mock
                try {
                    await updatePurchaseStatus(orderData.purchaseId, 'failed', null);
                } catch (apiError) {
                    console.log('API not available, using mock function');
                    await updatePurchaseStatusMock(orderData.purchaseId, 'failed', null);
                }
            } catch (updateError) {
                console.error('Error updating failed payment status:', updateError);
            }
            
            setIsProcessing(false);
        };

        // Check if PayHere is loaded
        if (window.payhere) {
            window.payhere.startPayment(payment);
        } else {
            console.error('PayHere script not loaded');
            setPaymentStatus('Payment system not available. Please try again.');
            setIsProcessing(false);
        }
    };

    const handlePurchase = async () => {
        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);
        setPaymentStatus('Creating order...');

        try {
            // Create purchase order
            const purchaseData = {
                eventId: event._id,
                ticketId: ticket.id,
                quantity,
                pricePerTicket: ticket.price,
                totalAmount: totalPrice,
                userInfo: customerInfo,
                paymentMethod: 'payhere'
            };

            // Try real API first, fallback to mock for demo
            let orderResponse;
            try {
                orderResponse = await createPurchaseOrder(purchaseData);
            } catch (apiError) {
                console.log('API not available, using mock response');
                orderResponse = await createPurchaseOrderMock(purchaseData);
            }
            
            if (orderResponse.success) {
                setPaymentStatus('Redirecting to payment...');
                
                // Initialize PayHere payment
                initializePayHere({
                    orderId: orderResponse.orderId,
                    purchaseId: orderResponse.purchaseId,
                    hash: orderResponse.hash
                });
            } else {
                throw new Error(orderResponse.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            setPaymentStatus(`Failed to process purchase: ${error.message}`);
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Purchase Tickets</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isProcessing}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Payment Status */}
                    {paymentStatus && (
                        <div className={`p-4 rounded-lg ${
                            paymentStatus.includes('successful') ? 'bg-green-50 text-green-700' :
                            paymentStatus.includes('failed') || paymentStatus.includes('cancelled') ? 'bg-red-50 text-red-700' :
                            'bg-blue-50 text-blue-700'
                        }`}>
                            <p className="text-sm font-medium">{paymentStatus}</p>
                        </div>
                    )}

                    {/* Event Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">{event.title}</h3>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(event.time)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Map className="w-4 h-4" />
                                <span>{event.venue}</span>
                            </div>
                            <div className="mt-3 pt-2 border-t">
                                <p className="text-sm font-medium text-gray-900">
                                    Ticket Type: {ticket.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {ticket.remaining} tickets remaining
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quantity Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity (Max: {maxQuantity})
                        </label>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleQuantityChange('decrement')}
                                disabled={quantity <= 1 || isProcessing}
                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange('increment')}
                                disabled={quantity >= maxQuantity || isProcessing}
                                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Price per ticket:</span>
                            <span className="font-semibold">{ticket.currency} {ticket.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Quantity:</span>
                            <span className="font-semibold">{quantity}</span>
                        </div>
                        <div className="border-t pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total:</span>
                                <span className="text-lg font-bold text-blue-600">
                                    {ticket.currency} {totalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Customer Information</h4>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={customerInfo.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your full name"
                                    disabled={isProcessing}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={customerInfo.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your email"
                                    disabled={isProcessing}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="tel"
                                    value={customerInfo.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your phone number"
                                    disabled={isProcessing}
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address (Optional)
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <textarea
                                    value={customerInfo.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="2"
                                    placeholder="Enter your address"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Purchase Button */}
                    <button
                        onClick={handlePurchase}
                        disabled={isProcessing || maxQuantity === 0}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : maxQuantity === 0 ? (
                            <span>Sold Out</span>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" />
                                <span>Proceed to Payment</span>
                            </>
                        )}
                    </button>

                    <div className="text-center space-y-2">
                        <p className="text-xs text-gray-500">
                            Payment secured by PayHere
                        </p>
                        <p className="text-xs text-gray-500">
                            By purchasing tickets, you agree to our terms and conditions
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default TicketPurchase;