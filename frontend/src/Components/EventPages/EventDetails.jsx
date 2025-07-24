import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TicketPurchase from './TicketPurchase';

const EventDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId } = useParams();
    const event = location.state?.event;


    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const handleBackClick = () => navigate(-1);

    const handleBuyTickets = (ticket) => {
        const isAvailable = ticket.status === 'active' && ticket.quantity > ticket.sold;
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
        alert('Purchase completed successfully! Check your email for ticket details.');
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

    // Button styling functions
    const getButtonStyle = (isAvailable) => {
        return isAvailable
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed';
    };

    const getButtonText = (isAvailable) => {
        return isAvailable ? 'Buy Tickets' : 'Sold Out';
    };

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
                                {event.tickets?.map((ticket) => {
                                    const isAvailable = ticket.status === 'active' && ticket.quantity > ticket.sold;
                                    const remaining = ticket.quantity - ticket.sold;
                                    
                                    return (
                                        <div key={ticket._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-gray-900">{ticket.name}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                        <span>
                                                            Remaining: <strong className={remaining > 0 ? 'text-green-600' : 'text-red-600'}>{remaining}</strong>
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {isAvailable ? 'Available' : 'Sold Out'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="text-blue-600 font-bold text-lg mb-2">
                                                        {ticket.currency} {ticket.price.toLocaleString()}
                                                    </p>
                                                    <button
                                                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${getButtonStyle(isAvailable)}`}
                                                        disabled={!isAvailable}
                                                        onClick={() => handleBuyTickets(ticket)}
                                                    >
                                                        {getButtonText(isAvailable)}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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

            
            {showPurchaseModal && selectedTicket && (
                <TicketPurchase
                    eventId={eventId}
                    ticket={selectedTicket}
                    event={event}
                    onClose={handleCloseModal}
                    onPurchaseComplete={handlePurchaseComplete}
                />
            )}
        </div>
    );
};

export default EventDetails;