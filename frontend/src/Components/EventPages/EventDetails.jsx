import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TicketPurchase from './TicketPurchase';

const EventDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId } = useParams();
    const event = location.state?.event;

    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [purchaseDetails, setPurchaseDetails] = useState(null);

    const handleBackClick = () => navigate(-1);

    const handleBuyTickets = (ticket) => {
        const isActive = ticket.status === 'active';
        const hasRemaining = ticket.sold < ticket.quantity; 
        const isAvailable = isActive && hasRemaining;
        
        if (isAvailable) {
            setSelectedTicket({
                id: ticket._id,
                name: ticket.name,
                description: ticket.description,
                price: ticket.price,
                currency: ticket.currency,
                maxPerPurchase: ticket.maxPerPurchase || 10,
                remaining: ticket.quantity - ticket.sold
            });
            setShowPurchaseModal(true);
        }
    };

    const handlePurchaseComplete = (purchaseData) => {
        console.log('Purchase Completed:', purchaseData);
        setPurchaseDetails(purchaseData);
        setShowSuccessPopup(true);
        
        
        // setTimeout(() => {
        //     setShowSuccessPopup(false);
        // }, 5000);
    };

    const closeSuccessPopup = () => {
        setShowSuccessPopup(false);
        setPurchaseDetails(null);
    };

    const handleCloseModal = () => {
        setShowPurchaseModal(false);
        setSelectedTicket(null);
    };

    // Format date function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time function
    const formatTime = (timeString) => {
        if (!timeString) return 'TBD';
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Show all tickets (both active and inactive)
    const allTickets = event?.tickets || [];
    
    // Debug logging
    console.log('Event data:', event);
    console.log('All tickets:', allTickets);
    console.log('Tickets count:', allTickets.length);

    useEffect(() => {
        if (!event) navigate('/');
    }, [event, navigate]);

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Event not found</h2>
                    <button onClick={handleBackClick} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white mt-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white relative">
                <button 
                    onClick={handleBackClick} 
                    className="absolute top-6 left-6 flex items-center space-x-2 z-10 text-white hover:text-gray-300"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Events</span>
                </button>
                <div className="px-6 py-20">
                    <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.time)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{event.createdBy?.organizationName || 'Event Organizer'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
                            <p className="text-gray-600 leading-relaxed">{event.description}</p>
                        </div>

                       
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Available Tickets</h3>
                            <div className="space-y-4">
                                {allTickets.length > 0 ? (
                                    allTickets.map((ticket) => {
                                        console.log('Processing ticket:', ticket.name, 'Status:', ticket.status, 'Sold:', ticket.sold, 'Quantity:', ticket.quantity);
                                        
                                        
                                        const isActive = ticket.status === 'active';
                                        const isSoldOut = ticket.sold >= ticket.quantity; // Sold out when sold equals or exceeds quantity
                                        const hasRemaining = ticket.sold < ticket.quantity; // Has remaining when sold is less than quantity
                                        const isAvailable = isActive && hasRemaining;
                                        
                                        
                                        // Determine display status 
                                        let statusText, statusClass, buttonText, buttonClass;
                                        
                                        if (!isActive) {
                                            // Inactive ticket 
                                            statusText = 'Unavailable';
                                            statusClass = 'bg-gray-100 text-gray-800';
                                            buttonText = 'Unavailable';
                                            buttonClass = 'bg-gray-400 text-white cursor-not-allowed opacity-60';
                                        } else if (isSoldOut) {
                                            // Active but sold out 
                                            statusText = 'Sold Out';
                                            statusClass = 'bg-red-100 text-red-800';
                                            buttonText = 'SOLD OUT';
                                            buttonClass = 'bg-red-500 text-white cursor-not-allowed font-bold border-2 border-red-600';
                                        } else {
                                            // Available for purchase 
                                            statusText = 'Available';
                                            statusClass = 'bg-green-100 text-green-800';
                                            buttonText = 'Buy Tickets';
                                            buttonClass = 'bg-blue-600 text-white hover:bg-blue-700 transition-colors';
                                        }
                                        
                                        return (
                                            <div key={ticket._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-gray-900">{ticket.name}</h4>
                                                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            {/* <span>
                                                                Remaining: <strong className={
                                                                    remaining > 0 ? 'text-green-600' : 'text-red-600'
                                                                }>
                                                                    {remaining}
                                                                </strong> / {ticket.quantity}
                                                            </span> */}
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                                                {statusText}
                                                            </span>
                                                            
                                                        </div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <p className="text-blue-600 font-bold text-lg mb-2">
                                                            {ticket.currency} {ticket.price.toLocaleString()}
                                                        </p>
                                                        <button
                                                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${buttonClass}`}
                                                            disabled={!isAvailable}
                                                            onClick={() => isAvailable ? handleBuyTickets(ticket) : null}
                                                        >
                                                            {buttonText}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-lg">No tickets found for this event.</p>
                                        <p className="text-sm mt-2">Please check back later or contact the organizer.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-8">
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-auto rounded-xl shadow-lg"
                            onError={(e) => {
                                e.target.src = '/api/placeholder/600/400';
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Purchase Modal */}
            {showPurchaseModal && selectedTicket && (
                <TicketPurchase
                    eventId={eventId}
                    ticket={selectedTicket}
                    event={event}
                    onClose={handleCloseModal}
                    onPurchaseComplete={handlePurchaseComplete}
                />
            )}

            {/* Success Popup */}
            {showSuccessPopup && purchaseDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl relative">
                            <button 
                                onClick={closeSuccessPopup}
                                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="bg-white bg-opacity-20 rounded-full p-2">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Purchase Successful!</h3>
                                    <p className="text-green-100 text-sm">Your tickets have been confirmed</p>
                                </div>
                            </div>
                        </div>

                        {/* Success Content */}
                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    {purchaseDetails.event?.title || event.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Order Reference: <span className="font-medium text-blue-600">
                                        {purchaseDetails.orderReference}
                                    </span>
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Event Date:</span>
                                    <span className="font-medium">{formatDate(event.date)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Venue:</span>
                                    <span className="font-medium">{event.venue}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Time:</span>
                                    <span className="font-medium">{formatTime(event.time)}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-3">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    <span>Confirmation email sent</span>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    <span>QR code generated for entry</span>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={closeSuccessPopup}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        
                                        closeSuccessPopup();
                                        navigate('/event-details/:eventId');
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    View Tickets
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetails;