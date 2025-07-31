/* eslint-disable no-prototype-builtins */
import React, { useState, useMemo, useEffect } from "react";
import { Search, Calendar, MapPin, ChevronLeft, ChevronRight, ArrowRight, Loader2, Ticket } from "lucide-react";
import axios from 'axios';
import { Navigate, useNavigate } from "react-router-dom";

function UserLandingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMonth, setActiveMonth] = useState("This Month");
    const [activeCategory, setActiveCategory] = useState("All");
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

useEffect(() => {
    const fetchEvents = async () => {
        try {
        setLoading(true);
        
        
        const token = localStorage.getItem('authToken');
        
        
        const response = await axios.get('http://localhost:3000/api/attendee/get-all-event', {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            setEvents(response.data.data.events);
        } else {
            throw new Error(response.data.message || 'Failed to fetch events');
        }
        } catch (err) {
        console.error('Error fetching events:', err);
        
        
        if (err.response?.status === 401) {
            setError('Please log in to view events');
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        } else {
            setError(err.response?.data?.message || err.message || 'Failed to fetch events');
        }
        } finally {
        setLoading(false);
        }
    };

    fetchEvents();
}, []);

const getImageUrl = (base64String) => {
    if (!base64String) return null;
    
    if (base64String.startsWith('data:image/')) {
        return base64String;
    }
    
    return `data:image/jpeg;base64,${base64String}`;
};

const formatEventDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });
};

const formatEventTime = (timeStr) => {
    if (!timeStr) return '';

    if (timeStr.includes('AM') || timeStr.includes('PM')) {
        return timeStr;
    }

    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
};




const isEventAvailable = (event) => {
    // Check if event status allows purchasing
    if (event.status === 'canceled' || event.status === 'completed' || event.status === 'sold-out') {
        return false;
    }
    
    // Check if event has tickets available
    if (!event.tickets || event.tickets.length === 0) {
        return false;
    }
    
    // Debug logging (remove in production)
    console.log(`Checking availability for event: ${event.title}`);
    console.log('Event tickets:', event.tickets);
    
    // Check if at least ONE ticket is active AND has available quantity
    const hasAvailableTickets = event.tickets.some(ticket => {
       
        const isActive = ticket.status === 'active';
        
        // Check if ticket has remaining quantity
        let hasQuantity = false;
        if (ticket.hasOwnProperty('quantity') && ticket.hasOwnProperty('sold')) {
            // If both quantity and sold fields exist, check remaining
            hasQuantity = ticket.quantity > ticket.sold && ticket.quantity > 0;
        } else if (ticket.hasOwnProperty('quantity')) {
            // If only quantity field exists, check if > 0
            hasQuantity = ticket.quantity > 0;
        } else {
            // If no quantity field, assume available if price exists and ticket is active
            hasQuantity = ticket.price !== undefined && ticket.price !== null;
        }
        
        // Debug logging for each ticket
        console.log(`Ticket: ${ticket.name}, Status: ${ticket.status}, Active: ${isActive}, HasQuantity: ${hasQuantity}, Available: ${isActive && hasQuantity}`);
        
        // Ticket is available if it's BOTH active AND has quantity
        return isActive && hasQuantity;
    });
    
    console.log(`Event ${event.title} availability result: ${hasAvailableTickets}`);
    return hasAvailableTickets;
};

// Helper function to determine event status for display
const getEventDisplayStatus = (event) => {
    if (event.status === 'canceled') return 'canceled';
    if (event.status === 'completed') return 'completed';
    if (event.status === 'coming-soon') return 'coming-soon';
    
    // Check if event is available based on ticket status and quantity
    if (!isEventAvailable(event)) {
        // If event has tickets but none are available, it's sold out
        if (event.tickets && event.tickets.length > 0) {
            return 'sold-out';
        }
        return 'sold-out';
    }
    
    if (event.status === 'published') return 'published';
    return 'published'; // default for available events
};

// Update button styles to show red for sold-out events
const getButtonStyle = (event) => {
    const status = getEventDisplayStatus(event);
    
    switch (status) {
        case 'sold-out':
            return 'bg-red-500 text-white cursor-not-allowed'; // Changed to red background
        case 'canceled':
            return 'bg-gray-100 text-gray-600 cursor-not-allowed';
        case 'completed':
            return 'bg-gray-100 text-gray-600 cursor-not-allowed';
        case 'coming-soon':
            return 'bg-gray-100 text-gray-600 cursor-not-allowed';
        case 'published':
        default:
            return 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer';
    }
};

// Add the missing getButtonText function
const getButtonText = (event) => {
    const status = getEventDisplayStatus(event);
    
    switch (status) {
        case 'sold-out':
            return 'Sold Out';
        case 'canceled':
            return 'Canceled';
        case 'completed':
            return 'Completed';
        case 'coming-soon':
            return 'Coming Soon';
        case 'published':
        default:
            return 'Buy Tickets';
    }
};

const handleEventClick = (event) => {
    const status = getEventDisplayStatus(event);
    if (status === 'published' && isEventAvailable(event)) {
        navigate(`/event-details/${event._id}`, { state: { event } });
        console.log('Navigate to event details:', event);
    }
};

const searchFilteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();
    return events.filter(event => 
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query) ||
        event.createdBy?.organizationName?.toLowerCase().includes(query)
    );
}, [events, searchQuery]);

const filteredEvents = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    return searchFilteredEvents.filter(event => {
        const eventDate = new Date(event.date);

        if (activeMonth === "This Month") {
        return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        } else if (activeMonth === "Next Month") {
        return eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextMonthYear;
    }
        return true;
    });
}, [searchFilteredEvents, activeMonth]);

const chillVibeEvents = useMemo(() => {
    const filteredByCategory = activeCategory === "All" 
        ? searchFilteredEvents 
        : searchFilteredEvents.filter(event => event.category === activeCategory);

    return filteredByCategory.slice(0, 8); 
}, [searchFilteredEvents, activeCategory]);

const ticketDeals = useMemo(() => {
    return searchFilteredEvents.filter(event => 
    event.tickets && event.tickets.length > 1 && isEventAvailable(event)
    ).slice(0, 8);
}, [searchFilteredEvents]);

const EventCard = ({ event, showDiscount = false }) => {
    const imageUrl = getImageUrl(event.image);
    const eventDate = formatEventDate(event.date);
    const eventTime = formatEventTime(event.time);
    const eventAvailable = isEventAvailable(event);
    const displayStatus = getEventDisplayStatus(event);

    const getEventPrice = () => {
        if (!eventAvailable) {
            if (displayStatus === 'canceled') return "Canceled";
            if (displayStatus === 'completed') return "Completed";
            return "Sold out";
        }
    
        if (!event.tickets || event.tickets.length === 0) return "Sold out";
    
        const prices = event.tickets.map(ticket => ticket.price).filter(price => price > 0);
        if (prices.length === 0) return "Sold out";
    
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const currency = event.tickets[0].currency || 'LKR';
    
        if (minPrice === maxPrice) {
        return `${minPrice} ${currency}`;
    }
    return `${minPrice} - ${maxPrice} ${currency}`;
    };

    const hasMultipleTicketTypes = event.tickets && event.tickets.length > 1;

    return (
    <div
        className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col ${
            eventAvailable ? 'hover:shadow-xl group cursor-pointer' : 'cursor-not-allowed opacity-75'
        }`}
        onClick={() => eventAvailable && handleEventClick(event)}
    >
        <div className="relative overflow-hidden aspect-square">
        {imageUrl ? (
            <img
            src={imageUrl}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
                eventAvailable ? 'group-hover:scale-105' : ''
            }`}
            onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
            }}
            />
        ) : null}
        
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
            <div className="text-white text-center">
            <div className="text-xl font-bold mb-2">{event.title?.split(' ')[0]}</div>
            <div className="text-sm opacity-90">Event Image</div>
            </div>
        </div>
        
        {eventAvailable && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
        
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
        {event.subcategory}
        </div>
        
        {!eventAvailable && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {displayStatus === 'canceled' && 'Canceled'}
                {displayStatus === 'completed' && 'Completed'}
                {displayStatus === 'sold-out' && 'Sold Out'}
            </div>
        )}
        
        {showDiscount && hasMultipleTicketTypes && eventAvailable && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Multiple Options
        </div>
        )}
    </div>

    <div className="p-5 flex flex-col flex-1">
        <h3 className={`text-lg font-bold mb-3 transition-colors duration-200 line-clamp-2 min-h-[3.5rem] ${
            eventAvailable ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-500'
        }`}>
        {event.title}
        </h3>

        <div className={`flex items-center space-x-2 mb-2 ${eventAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
        <Calendar className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{eventDate} • {eventTime}</span>
        </div>

        <div className={`flex items-start space-x-2 mb-4 ${eventAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span className="text-sm line-clamp-2">{event.venue}</span>
        </div>

        <div className="mb-4 mt-auto">
        <div className="flex items-center space-x-2 mb-1">
            <span className={`text-xl font-bold ${
                eventAvailable ? 'text-blue-600' : 
                displayStatus === 'canceled' ? 'text-red-600' :
                displayStatus === 'completed' ? 'text-gray-600' : 'text-red-600'
            }`}>
                {getEventPrice()}
            </span>
        </div>
        {eventAvailable && getEventPrice() !== "Free" && hasMultipleTicketTypes && (
            <span className="text-gray-500 text-sm">Multiple pricing options</span>
        )}
        </div>

        <button
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${getButtonStyle(event)}`}
        disabled={!eventAvailable}
        onClick={(e) => {
            e.stopPropagation();
            if (eventAvailable) {
                handleEventClick(event);
            }
        }}
        >
        {getButtonText(event)}
        </button>
    </div>
    </div>
);
};

if (loading) {
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
);
}

if (error) {
return (
    <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-xl font-semibold text-gray-900 mb-2">Error loading events</p>
        <p className="text-gray-600">{error}</p>
        <button 
        onClick={() => window.location.reload()} 
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
        Try Again
        </button>
    </div>
    </div>
);
}

return (
<div className="min-h-screen bg-white">
    {/* Hero Section */}
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-primary-900/20 to-secondary-900/20"></div>
    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
        <svg width="100" height="140" viewBox="0 0 148 112" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M144.941 110.573L106.532 3.41421L68.3621 15.2697C65.2322 46.682 49.2698 42.5062 32.4581 25.7326L3.5486 30.5841L31.9261 109.858" stroke="white" strokeWidth="3"/>
        </svg>
        </svg>
    </div>

    <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Let's Book Your Ticket
        </h1>
        <p className="text-xl text-blue-100 mb-8">
            Discover your favorite entertainment right here
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-md bg-white rounded-xl p-1">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                placeholder="Search by Artist, Event or Venue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            </div>
            <button 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
            onClick={() => {
                console.log('Search triggered for:', searchQuery);
            }}
            >
            Search
            </button>
        </div>
        </div>
    </div>
    </div>

    {/* What's happening section */}
    <div className="container mx-auto px-4 py-12">
    <div className="flex items-center justify-between mb-8">
        <div>
        <h2 className="text-2xl font-bold text-gray-800">
            What's happening <span className="text-blue-600">{activeMonth.toLowerCase()}</span>
        </h2>
        </div>
        <div className="flex space-x-2">
        <button
            onClick={() => setActiveMonth("This Month")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeMonth === "This Month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
        >
            This Month
        </button>
        <button
            onClick={() => setActiveMonth("Next Month")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeMonth === "Next Month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
        >
            Next Month
        </button>
        </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {filteredEvents.length > 0 ? (
        filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
        ))
        ) : (
        <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎭</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
            No events found for {activeMonth.toLowerCase()}
            </p>
            <p className="text-gray-600">Check back later for new events in this period.</p>
        </div>
        )}
    </div>

    <div className="flex justify-center">
        <div className="flex space-x-2">
        <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
            <ChevronLeft size={20} />
        </button>
        <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
            <ChevronRight size={20} />
        </button>
        </div>
    </div>
    </div>

    {/* My Tickets Deals section */}
    {ticketDeals.length > 0 && (
    <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Multiple Ticket Options</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
            View more <ArrowRight size={16} className="ml-1" />
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {ticketDeals.map((event) => (
            <EventCard key={event._id} event={event} showDiscount={true} />
            ))}
        </div>

        <div className="flex justify-center">
            <div className="flex space-x-2">
            <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                <ChevronLeft size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                <ChevronRight size={20} />
            </button>
            </div>
        </div>
        </div>
    </div>
    )}

    {/* Chill & Vibe section */}
    <div className="container mx-auto px-4 py-12">
    <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Chill & Vibe</h2>
        <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
            {["All", "Event", "Theater"].map((category) => (
            <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
            >
                {category}
            </button>
            ))}
        </div>
        <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
            View more <ArrowRight size={16} className="ml-1" />
        </button>
        </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {chillVibeEvents.map((event) => (
        <EventCard key={event._id} event={event} />
        ))}
    </div>

    <div className="flex justify-center">
        <div className="flex space-x-2">
        <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
            <ChevronLeft size={20} />
        </button>
        <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
            <ChevronRight size={20} />
        </button>
        </div>
    </div>
    </div>
</div>
);
}

export default UserLandingPage;