import React, { useState } from 'react';
import { X, Plus, Minus, CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';

const TicketPurchase = ({ show, event, onClose, onPurchase }) => {
const [quantity, setQuantity] = useState(1);
const [customerInfo, setCustomerInfo] = useState({
name: '',
email: '',
phone: '',
address: ''
});
const [isProcessing, setIsProcessing] = useState(false);

const pricePerTicket = parseInt(show.price.replace('Rs. ', '').replace(',', ''));
const totalPrice = pricePerTicket * quantity;

const handleQuantityChange = (action) => {
if (action === 'increment' && quantity < 10) {
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
};

const handlePurchase = async () => {
// Validate form
if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
    alert('Please fill in all required fields');
    return;
}

setIsProcessing(true);

// Simulate API call
try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const purchaseData = {
    event: event.title,
    ticketType: show.type,
    quantity,
    totalPrice,
    customerInfo,
    orderDate: new Date().toISOString()
    };
    
    onPurchase(purchaseData);
    alert('Ticket purchased successfully!');
    onClose();
} catch (error) {
    alert('Purchase failed. Please try again.');
} finally {
    setIsProcessing(false);
}
};

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mt-10">
    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Purchase Tickets</h2>
        <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        >
        <X className="w-6 h-6" />
        </button>
    </div>

    {/* Content */}
    <div className="p-6 space-y-6">
        {/* Event Info */}
        <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
        <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Venue:</strong> {event.location}</p>
            <p><strong>Ticket Type:</strong> {show.type}</p>
            <p><strong>Time:</strong> {show.time}</p>
        </div>
        </div>

        {/* Quantity Selection */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
        </label>
        <div className="flex items-center space-x-3">
            <button
            onClick={() => handleQuantityChange('decrement')}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
            <button
            onClick={() => handleQuantityChange('increment')}
            disabled={quantity >= 10}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <Plus className="w-4 h-4" />
            </button>
        </div>
        </div>

        {/* Price Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Price per ticket:</span>
            <span className="font-semibold">{show.price}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Quantity:</span>
            <span className="font-semibold">{quantity}</span>
        </div>
        <div className="border-t pt-2">
            <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-blue-600">
                Rs. {totalPrice.toLocaleString()}
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
            />
            </div>
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
            />
            </div>
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
            />
            </div>
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
            />
            </div>
        </div>
        </div>

        {/* Purchase Button */}
        <button
        onClick={handlePurchase}
        disabled={isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
        {isProcessing ? (
            <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
            </>
        ) : (
            <>
            <CreditCard className="w-4 h-4" />
            <span>Purchase Tickets</span>
            </>
        )}
        </button>

        <p className="text-xs text-gray-500 text-center">
        By purchasing tickets, you agree to our terms and conditions
        </p>
    </div>
    </div>
</div>
);
};

export default TicketPurchase;