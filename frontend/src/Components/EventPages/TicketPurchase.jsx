import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ArrowLeft } from 'lucide-react';

const TicketPurchase = ({ ticket, event, onClose, onPurchaseComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [ticketQuantities, setTicketQuantities] = useState({});
    const [billingDetails, setBillingDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nicPassport: ''
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Use actual event tickets data with fallback
    const eventTickets = event?.tickets || [];

    useEffect(() => {
        // Initialize with empty quantities - let user select from all available tickets
        setTicketQuantities({});
    }, []);

    const updateQuantity = (ticketId, change) => {
        setTicketQuantities(prev => {
            const currentQty = prev[ticketId] || 0;
            const newQty = Math.max(0, currentQty + change);
            const ticketData = eventTickets.find(t => t._id === ticketId);
            const maxAvailable = ticketData ? (ticketData.quantity - ticketData.sold) : 0;
            
            // Remove ticket from selection if quantity becomes 0
            if (newQty === 0) {
                const { [ticketId]: removed, ...rest } = prev;
                return rest;
            }
            
            return {
                ...prev,
                [ticketId]: Math.min(newQty, maxAvailable)
            };
        });
    };

    const calculateSubtotal = () => {
        return Object.entries(ticketQuantities).reduce((total, [ticketId, quantity]) => {
            const ticketData = eventTickets.find(t => t._id === ticketId);
            return total + (ticketData ? ticketData.price * quantity : 0);
        }, 0);
    };

    const calculateConvenienceFee = (subtotal) => {
        return Math.round(subtotal * 0.01); // 1% convenience fee
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const convenienceFee = calculateConvenienceFee(subtotal);
        return subtotal + convenienceFee;
    };

    const isTicketAvailable = (ticketData) => {
        if (!ticketData) return false;
        return ticketData.status === 'active' && ticketData.quantity > ticketData.sold;
    };

    const getTicketCategoryDisplay = (ticketData) => {
        if (!ticketData) return null;
        
        const isAvailable = isTicketAvailable(ticketData);
        const quantity = ticketQuantities[ticketData._id] || 0;
        const remaining = ticketData.quantity - ticketData.sold;
        
        return (
            <div key={ticketData._id} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1">
                    <div className="font-medium text-gray-900">{ticketData.name}</div>
                    <div className="text-sm text-gray-600">
                        {ticketData.price ? ticketData.price.toLocaleString() : '0'} {ticketData.currency || 'LKR'}
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    {!isAvailable ? (
                        <>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                SOLD OUT
                            </span>
                            <span className="text-gray-400 w-8 text-center">-</span>
                        </>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => updateQuantity(ticketData._id, -1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                disabled={quantity === 0}
                            >
                                <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => updateQuantity(ticketData._id, 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                disabled={quantity >= remaining}
                            >
                                <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    )}
                    
                    <div className="w-24 text-right font-medium">
                        {isAvailable && quantity > 0 
                            ? `${(ticketData.price * quantity).toLocaleString()} LKR`
                            : '-'
                        }
                    </div>
                </div>
            </div>
        );
    };

    const handleCheckout = () => {
        if (Object.keys(ticketQuantities).length === 0) {
            alert('Please select at least one ticket');
            return;
        }
        setCurrentStep(2);
    };

    const handleBack = () => {
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
    };

    const handleProceedToPay = async () => {
        if (!selectedPaymentMethod) {
            alert('Please select a payment method');
            return;
        }
        
        if (!termsAccepted) {
            alert('Please accept the terms and conditions');
            return;
        }

        // Validate billing details
        const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
        const missingFields = requiredFields.filter(field => !billingDetails[field]?.trim());
        
        if (missingFields.length > 0) {
            alert(`Please fill in: ${missingFields.join(', ')}`);
            return;
        }

        setLoading(true);
        
        try {
            // Here you would integrate with PayHere
            // For now, we'll simulate the payment process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const purchaseData = {
                tickets: ticketQuantities,
                billingDetails,
                paymentMethod: selectedPaymentMethod,
                total: calculateTotal(),
                event: event
            };
            
            onPurchaseComplete(purchaseData);
            onClose();
        } catch (error) {
            alert('Payment failed. Please try again.');
            console.error('Payment error:', error);
        } finally {
            setLoading(false);
        }
    };

    const subtotal = calculateSubtotal();
    const convenienceFee = calculateConvenienceFee(subtotal);
    const total = calculateTotal();

    // Safety check for event data
    if (!event) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-20">
                <div className="bg-white rounded-lg p-6">
                    <p>Event data not available</p>
                    <button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-20">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-4">
                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold">
                            {currentStep === 1 ? 'Select Tickets' : 'Payment Details'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
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
                                1
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

                <div className="p-6">
                    {currentStep === 1 ? (
                        /* Step 1: Ticket Selection */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left side - Event image */}
                            <div>
                                <img
                                    src={event.image || '/api/placeholder/400/500'}
                                    alt={event.title || 'Event'}
                                    className="w-full h-auto rounded-lg"
                                    onError={(e) => {
                                        e.target.src = '/api/placeholder/400/500';
                                    }}
                                />
                            </div>

                            {/* Right side - Ticket selection */}
                            <div>
                                <h3 className="text-2xl font-bold text-blue-600 mb-6 text-center">
                                    {event.title?.toUpperCase() || 'EVENT TICKETS'}
                                </h3>

                                <div className="bg-white border rounded-lg">
                                    <div className="p-4 border-b bg-gray-50">
                                        <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
                                            <div>Category</div>
                                            <div>Price</div>
                                            <div>No. of Tickets</div>
                                            <div className="text-right">Amount</div>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {eventTickets.length > 0 ? (
                                            eventTickets.map(ticketData => getTicketCategoryDisplay(ticketData))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                No tickets available for this event
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 border-t bg-gray-50">
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span>Total</span>
                                            <span>{total.toLocaleString()} LKR</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={Object.keys(ticketQuantities).length === 0}
                                    className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <span>Checkout</span>
                                    <span>→</span>
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
                                        placeholder="First Name"
                                        value={billingDetails.firstName}
                                        onChange={(e) => handleBillingChange('firstName', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={billingDetails.lastName}
                                        onChange={(e) => handleBillingChange('lastName', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={billingDetails.email}
                                        onChange={(e) => handleBillingChange('email', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone No"
                                        value={billingDetails.phone}
                                        onChange={(e) => handleBillingChange('phone', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="NIC / Passport / Driving License"
                                        value={billingDetails.nicPassport}
                                        onChange={(e) => handleBillingChange('nicPassport', e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Right side - Booking Summary & Payment */}
                            <div>
                                <h3 className="text-xl font-semibold text-blue-600 mb-6">Booking Summary</h3>
                                <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
                                    {Object.entries(ticketQuantities).map(([ticketId, quantity]) => {
                                        const ticketData = eventTickets.find(t => t._id === ticketId);
                                        if (!ticketData) return null;
                                        return (
                                            <div key={ticketId} className="flex justify-between">
                                                <span>{quantity} x {ticketData.name} Ticket(s)</span>
                                                <span>{(ticketData.price * quantity).toLocaleString()} LKR</span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between pt-2 border-t">
                                        <span>Sub Total</span>
                                        <span>{subtotal.toLocaleString()} LKR</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Convenience Fee (1%)</span>
                                        <span>+ {convenienceFee.toLocaleString()} LKR</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span>{total.toLocaleString()} LKR</span>
                                    </div>
                                </div>

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

                                {!selectedPaymentMethod && (
                                    <p className="text-red-600 text-sm mb-4">Please select a payment method to proceed</p>
                                )}

                                <div className="mb-6">
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="mt-1 text-blue-600"
                                        />
                                        <span className="text-sm">
                                            * I accept and agree to{' '}
                                            <button 
                                                type="button"
                                                className="text-blue-600 hover:underline"
                                                onClick={() => {/* Handle terms modal */}}
                                            >
                                                Terms and Conditions
                                            </button>
                                        </span>
                                    </label>
                                </div>

                                <p className="text-sm text-blue-600 mb-6">
                                    In order to proceed, you should agree to T & C by clicking the above box
                                </p>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleBack}
                                        className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 flex items-center justify-center space-x-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        onClick={handleProceedToPay}
                                        disabled={!selectedPaymentMethod || !termsAccepted || loading}
                                        className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        <span>{loading ? 'Processing...' : 'Proceed to pay'}</span>
                                        {!loading && <span>→</span>}
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