import React, { useState, useMemo, useEffect } from "react";
import { Search, Calendar, MapPin, ChevronLeft, ChevronRight, ArrowRight, Loader2, Ticket } from "lucide-react";
import axios from 'axios';
import { Navigate, useNavigate } from "react-router-dom";

// Create axios instance with default config
const apiClient = axios.create({
baseURL: 'http://localhost:3000/api',
 // 10 seconds timeout
});

// Add request interceptor to include token in every request
apiClient.interceptors.request.use(
(config) => {
const token = localStorage.getItem('authToken');
if (token) {
    config.headers.Authorization = `Bearer ${token}`;
}
return config;
},
(error) => {
return Promise.reject(error);
}
);


apiClient.interceptors.response.use(
(response) => response,
(error) => {
if (error.response?.status === 401) {
    
    localStorage.removeItem('authToken');
    window.location.href = '/login';
}
return Promise.reject(error);
}
);

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
    const response = await apiClient.get('/attendee/get-all-event');
    
    if (response.data.success) {
        setEvents(response.data.data.events);
    } else {
        throw new Error(response.data.message || 'Failed to fetch events');
    }
    } catch (err) {
    
    if (err.response?.status === 401) {
        setError('Please log in to view events');
    } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch events');
    }
    console.error('Error fetching events:', err);
    } finally {
    setLoading(false);
    }
};

fetchEvents();
}, []);

// Convert base64 to image URL
const getImageUrl = (base64String) => {
if (!base64String) return null;

// Check if it's already a complete data URL
if (base64String.startsWith('data:image/')) {
    return base64String;
}

// Add data URL prefix if it's just base64 string
return `data:image/jpeg;base64,${base64String}`;
};

// Format date for display
const formatEventDate = (dateStr) => {
const date = new Date(dateStr);
return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
});
};

// Format time for display
const formatEventTime = (timeStr) => {
if (!timeStr) return '';

// If time is already formatted, return as is
if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr;
}

// Convert 24-hour format to 12-hour format
const [hours, minutes] = timeStr.split(':');
const hour = parseInt(hours);
const ampm = hour >= 12 ? 'PM' : 'AM';
const displayHour = hour % 12 || 12;

return `${displayHour}:${minutes} ${ampm}`;
};

// Get button style based on status
const getButtonStyle = (status) => {
switch (status) {
    case 'sold-out':
    return 'bg-red-100 text-red-600 cursor-not-allowed';
    case 'coming-soon':
    return 'bg-gray-100 text-gray-600 cursor-not-allowed';
    case 'published':
    default:
    return 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer';
}
};

const getButtonText = (status) => {
switch (status) {
    case 'sold-out':
    return 'Sold Out';
    case 'coming-soon':
    return 'Coming Soon';
    case 'published':
    default:
    return 'Buy Tickets';
}
};

// Handle event click
const handleEventClick = (event) => {
    if (event.status === 'published') {
        navigate(`/event-details/${event._id}`, { state: { event } });
        console.log('Navigate to event details:', event);
    }
};

// Filter events based on search query
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

// Filter events by month
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

// Get events with deals 
const ticketDeals = useMemo(() => {
return searchFilteredEvents.filter(event => 
    event.tickets && event.tickets.length > 1 
).slice(0, 8);
}, [searchFilteredEvents]);

// Event Card Component
const EventCard = ({ event, showDiscount = false }) => {
const imageUrl = getImageUrl(event.image);
const eventDate = formatEventDate(event.date);
const eventTime = formatEventTime(event.time);

// Get pricing information from tickets
const getEventPrice = () => {
    if (!event.tickets || event.tickets.length === 0) return "Free";
    
    const prices = event.tickets.map(ticket => ticket.price).filter(price => price > 0);
    if (prices.length === 0) return "Free";
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currency = event.tickets[0].currency || 'LKR';
    
    if (minPrice === maxPrice) {
    return `${minPrice} ${currency}`;
    }
    return `${minPrice} - ${maxPrice} ${currency}`;
};

// Get available ticket count
// const getAvailableTickets = () => {
//     if (!event.tickets || event.tickets.length === 0) return 0;
//     return event.tickets.reduce((total, ticket) => total + ticket.quantity, 0);
// };

// Check if event has multiple ticket types
const hasMultipleTicketTypes = event.tickets && event.tickets.length > 1;

return (
    <div
    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
    onClick={() => handleEventClick(event)}
    >
    {/* Event Image - Made Square */}
    <div className="relative overflow-hidden aspect-square">
        {imageUrl ? (
        <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
            }}
        />
        ) : null}
        
        {/* Fallback gradient background */}
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
        <div className="text-white text-center">
            <div className="text-xl font-bold mb-2">{event.title?.split(' ')[0]}</div>
            <div className="text-sm opacity-90">Event Image</div>
        </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
        {event.category}
        </div>
        
        {/* Deal badge */}
        {showDiscount && hasMultipleTicketTypes && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Multiple Options
        </div>
        )}

        {/* Ticket availability indicator */}
        {/* {getAvailableTickets() > 0 && (
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
            <Ticket className="w-3 h-3" />
            <span>{getAvailableTickets()} available</span>
        </div>
        )} */}
    </div>

    {/* Event Details */}
    <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-[3.5rem]">
        {event.title}
        </h3>

        {/* Date & Time */}
        <div className="flex items-center space-x-2 text-gray-600 mb-2">
        <Calendar className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{eventDate} • {eventTime}</span>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2 text-gray-600 mb-4">
        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span className="text-sm line-clamp-2">{event.venue}</span>
        </div>

        {/* Price */}
        <div className="mb-4 mt-auto">
        <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl font-bold text-blue-600">{getEventPrice()}</span>
        </div>
        {getEventPrice() !== "Free" && hasMultipleTicketTypes && (
            <span className="text-gray-500 text-sm">Multiple pricing options</span>
        )}
        </div>

        {/* Action Button */}
        <button
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${getButtonStyle(event.status)}`}
        disabled={event.status === 'sold-out' || event.status === 'coming-soon'}
        onClick={(e) => {
            e.stopPropagation();
            handleEventClick(event);
        }}
        >
        {getButtonText(event.status)}
        </button>
    </div>
    </div>
);
};

// Loading state
if (loading) {
return (
    <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading events...</p>
    </div>
    </div>
);
}

// Error state
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