import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import the TicketPurchase component
// import TicketPurchase from './TicketPurchase';

// For demo purposes, I'll include the component here
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
if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
    alert('Please fill in all required fields');
    return;
}

setIsProcessing(true);

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
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900">Purchase Tickets</h2>
        <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        >
        ×
        </button>
    </div>

    <div className="p-6 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
        <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Venue:</strong> {event.location}</p>
            <p><strong>Ticket Type:</strong> {show.type}</p>
            <p><strong>Time:</strong> {show.time}</p>
        </div>
        </div>

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
            -
            </button>
            <span className="font-semibold text-lg w-8 text-center">{quantity}</span>
            <button
            onClick={() => handleQuantityChange('increment')}
            disabled={quantity >= 10}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            +
            </button>
        </div>
        </div>

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

        <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Customer Information</h4>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
            </label>
            <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
            </label>
            <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
            </label>
            <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your phone number"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            Address (Optional)
            </label>
            <textarea
            value={customerInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            placeholder="Enter your address"
            />
        </div>
        </div>

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
            <span>Purchase Tickets</span>
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

const EventDetails = () => {
const location = useLocation();
const navigate = useNavigate();
const event = location.state?.event;

// State for ticket purchase modal
const [showPurchaseModal, setShowPurchaseModal] = useState(false);
const [selectedShow, setSelectedShow] = useState(null);

// Sample show times data with proper pricing
let showTimes = [];

if (event?.category === 'Concert') {
showTimes = [
    { id: 1, type: 'Early Bird', time: '05.00 PM IST', status: 'sold-out', price: event?.earlyBirdPrice || 'Rs. 2,000' },
    { id: 2, type: 'Standard', time: '05.00 PM IST', status: 'available', price: event?.standardPrice || 'Rs. 2,500' },
    { id: 3, type: 'VIP', time: '05.00 PM IST', status: 'available', price: event?.vipPrice || 'Rs. 3,000' }
];
} else if (event?.category === 'DJ') {
showTimes = [
    { id: 1, type: 'Phase 01', time: '05.00 PM IST', status: 'sold-out', price: event?.phase1Price || 'Rs. 2,000' },
    { id: 2, type: 'Phase 02', time: '05.00 PM IST', status: 'available', price: event?.phase2Price || 'Rs. 2,500' },
    { id: 3, type: 'Phase 03', time: '05.00 PM IST', status: 'available', price: event?.phase3Price || 'Rs. 3,000' }
];
} else {
// Default ticket types for other events
showTimes = [
    { id: 1, type: 'General Admission', time: '05.00 PM IST', status: 'available', price: event?.price || 'Rs. 2,500' },
    { id: 2, type: 'Premium', time: '05.00 PM IST', status: 'available', price: 'Rs. 3,500' },
    { id: 3, type: 'VIP', time: '05.00 PM IST', status: 'available', price: 'Rs. 5,000' }
];
}

const getButtonStyle = (status) => {
switch (status) {
    case 'sold-out':
    return 'bg-red-100 text-red-600 cursor-not-allowed';
    case 'available':
    return 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer';
    default:
    return 'bg-gray-100 text-gray-600 cursor-not-allowed';
}
};

const getButtonText = (status) => {
switch (status) {
    case 'sold-out':
    return 'Sold Out';
    case 'available':
    return 'Buy Tickets';
    default:
    return 'Not Available';
}
};

const handleBackClick = () => {
navigate(-1);
};

useEffect(() => {
if (!event) {
    navigate('/');
}
}, [event, navigate]);

const handleBuyTickets = (show) => {
if (show.status === 'available') {
    setSelectedShow(show);
    setShowPurchaseModal(true);
}
};

const handlePurchaseComplete = (purchaseData) => {
console.log('Purchase completed:', purchaseData);
// Here you would typically:
// 1. Send the purchase data to your backend
// 2. Update the ticket availability
// 3. Show success message
// 4. Redirect to confirmation page
};

// If no event data is found, show error message
if (!event) {
return (
    <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
        <button 
        onClick={handleBackClick}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
        Back to Events
        </button>
    </div>
    </div>
);
}

return (
<div className="min-h-screen bg-white mt-10">
    {/* Header with Back Button */}
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white relative">
    <button 
        onClick={handleBackClick}
        className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-gray-300 z-10"
    >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Events</span>
    </button>
    
    <div className="px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
        
        <div className="flex flex-wrap gap-6 text-sm">
        <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{event.date}</span>
        </div>
        <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
        </div>
        <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>NOT DECIDED</span>
        </div>
        </div>
    </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Event Details */}
        <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-semibold mb-4">More info</h2>
            <h3 className="font-semibold text-gray-700 mb-2">{event.title}</h3>
            
            <div className="space-y-4 text-gray-600">
            <p>
                {event.description}
            </p>
            <p>
                Each hour, we land on a new "planet"—with music, vibes, and visuals that shift and evolve. Think deep red 
                Martian deserts, glowing Neptune blue, the wild chaos of Jupiter's storms—all brought to life through 
                immersive design and next-level performances.
            </p>
            <p>
                Expect a night filled with wonder, connection, and escape. A space to be your wildest self, to dance with 
                strangers who feel like old friends, and to celebrate the unknown.
            </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
                <strong>Date:</strong> {event.date}
            </p>
            <p className="text-sm text-gray-600">
                <strong>Venue:</strong> {event.location}
            </p>
            </div>
        </div>

        {/* Available Tickets */}
        <div>
            <h3 className="text-xl font-semibold mb-4">Available Tickets</h3>
            <div className="space-y-4">
            {showTimes.map((show) => (
                <div key={show.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg text-gray-900">{show.type}</h4>
                        <span className="text-xl font-bold text-blue-600">{show.price}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{show.time}</span>
                        </div>
                        {show.status === 'available' && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Available
                        </span>
                        )}
                        {show.status === 'sold-out' && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            Sold Out
                        </span>
                        )}
                    </div>
                    </div>
                    <button
                    className={`ml-4 px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${getButtonStyle(show.status)}`}
                    disabled={show.status === 'sold-out'}
                    onClick={() => handleBuyTickets(show)}
                    >
                    {getButtonText(show.status)}
                    </button>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Ticket Policy */}
        <div>
            <h3 className="text-xl font-semibold mb-4">Ticket Policy</h3>
            <div className="space-y-3 text-sm text-gray-600">
            <p>
                <strong>Ticket policy</strong><br />
                Only the initial email or SMS provided by MyTicketsLK will be accepted as proof of purchase, Tickets will 
                not be redeemed for any forwarded or screenshots.
            </p>
            <p>
                Valid NIC or Passport will be required if needed during the process of Redeeming.
            </p>
            <p>
                Children aged 5 years and under may enter free of charge but will not be provided with a separate seat. 
                They must sit on a parent or guardian's lap throughout the event. If a seat is required, a full ticket must be 
                purchased.
            </p>
            </div>
        </div>
        </div>

        {/* Right Side - Event Image */}
        <div className="lg:sticky lg:top-8">
        <img
            src={event.image}
            alt={event.title}
            className="w-full h-auto rounded-xl shadow-lg"
        />
        </div>
    </div>
    </div>

    {/* Ticket Purchase Modal */}
    {showPurchaseModal && selectedShow && (
    <TicketPurchase
        show={selectedShow}
        event={event}
        onClose={() => setShowPurchaseModal(false)}
        onPurchase={handlePurchaseComplete}
    />
    )}
</div>
);
};

export default EventDetails;