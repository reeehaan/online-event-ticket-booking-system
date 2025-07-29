import { useState, useEffect } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventsPage = () => {
const location = useLocation();
const navigate = useNavigate();

const [activeFilter, setActiveFilter] = useState('All');
const [events, setEvents] = useState([]);
const [isLoading, setIsLoading] = useState(false);
// eslint-disable-next-line no-unused-vars
const [error, setError] = useState('');

console.log(events);
const token = localStorage.getItem('authToken');

const getAllEvents = async () => {
setIsLoading(true);
try {
    const response = await axios.get('http://localhost:3000/api/attendee/get-all-event', {
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
    });
    setEvents(response.data.data.events);
} catch (error) {
    console.error('Failed to fetch events:', error);
    setError('Failed to load events');
} finally {
    setIsLoading(false);
}
};

const fetchEventsByCategory = async (category) => {
setIsLoading(true);
try {
    const response = await axios.get(`http://localhost:3000/api/attendee/by-category?subcategory=${category}`, {
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
    });
    setEvents(response.data.data.events);
} catch (error) {
    console.error('Failed to fetch category-related events:', error);
    setError('Failed to load events');
} finally {
    setIsLoading(false);
}
};

const handleFilterChange = (category) => {
setActiveFilter(category);
if (category === 'All') {
    navigate('/events-page', { replace: true });
    getAllEvents();
} else {
    navigate(`/events-page?category=${encodeURIComponent(category)}`);
    fetchEventsByCategory(category);
}
};

useEffect(() => {
const searchParams = new URLSearchParams(location.search);
const categoryFromUrl = searchParams.get('category');

if (categoryFromUrl) {
    const decodedCategory = decodeURIComponent(categoryFromUrl);
    setActiveFilter(decodedCategory);
    fetchEventsByCategory(decodedCategory);
} else {
    setActiveFilter('All');
    getAllEvents();
}
}, [location.search]);

const getImageUrl = (base64String) => {
if (!base64String) return null;
return base64String.startsWith('data:image/')
    ? base64String
    : `data:image/jpeg;base64,${base64String}`;
};

const formatEventDate = (dateStr) => {
const date = new Date(dateStr);
return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
});
};

const formatEventTime = (timeStr) => {
if (!timeStr) return '';
if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
const [hours, minutes] = timeStr.split(':');
const hour = parseInt(hours);
const ampm = hour >= 12 ? 'PM' : 'AM';
const displayHour = hour % 12 || 12;
return `${displayHour}:${minutes} ${ampm}`;
};

const filterCategories = [
'All', 'Concert', 'Electronic', 'DJ', 'Festival',
'Musical', 'Drama', 'Musicals', 'Children Theater', 'Comedy',
];

// UPDATED: Check if event is sold out based on ticket availability
const isEventSoldOut = (event) => {
    const tickets = event.ticketTypes || event.tickets || [];
    if (tickets.length === 0) return false;
    
    // Check if ALL tickets are sold out (sold >= quantity)
    return tickets.every(ticket => {
        const isActive = ticket.status === 'active';
        const isSoldOut = ticket.sold >= ticket.quantity;
        return !isActive || isSoldOut;
    });
};

// UPDATED: Enhanced button style logic with ticket-based sold out detection
const getButtonStyle = (event) => {
    // First check ticket-based sold out status
    if (isEventSoldOut(event)) {
        return 'bg-red-500 text-white cursor-not-allowed font-bold border-2 border-red-600';
    }
    
    // Then check event status (fallback for events without detailed ticket info)
    switch (event.status) {
        case 'sold-out': 
            return 'bg-red-500 text-white cursor-not-allowed font-bold border-2 border-red-600';
        case 'coming-soon': 
            return 'bg-gray-100 text-gray-600 cursor-not-allowed';
        case 'published':
        default: 
            return 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer';
    }
};

// UPDATED: Enhanced button text logic with ticket-based sold out detection
const getButtonText = (event) => {
    // First check ticket-based sold out status
    if (isEventSoldOut(event)) {
        return 'SOLD OUT';
    }
    
    // Then check event status (fallback for events without detailed ticket info)
    switch (event.status) {
        case 'sold-out': 
            return 'SOLD OUT';
        case 'coming-soon': 
            return 'Coming Soon';
        case 'published':
        default: 
            return 'Buy Tickets';
    }
};

// UPDATED: Check if event is clickable (not sold out and published)
const isEventClickable = (event) => {
    // Event must be published and not sold out
    return event.status === 'published' && !isEventSoldOut(event);
};

const filteredEvents = Array.isArray(events)
    ? (activeFilter === 'All'
        ? events
        : events.filter(event => event.subcategory === activeFilter))
    : [];

const handleEventClick = (event) => {
    // Only allow navigation if event is clickable
    if (isEventClickable(event)) {
        navigate(`/event-details/${event._id}`, { state: { event } });
        console.log('Navigate to event details:', event);
    }
};

const getHeroTitle = () => activeFilter === 'All' ? 'Events' : activeFilter;
const getHeroDescription = () =>
activeFilter === 'All'
    ? 'Discover amazing events happening around you'
    : `Explore the best ${activeFilter.toLowerCase()} events`;

return (
<div className="min-h-screen bg-white">
    {/* Hero */}
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white w-full">
    <div className="px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl md:text-6xl font-bold">{getHeroTitle()}</h1>
        <p className="text-xl text-blue-100 mt-4 opacity-90">{getHeroDescription()}</p>
        {activeFilter !== 'All' && (
        <div className="mt-4">
            <button onClick={() => handleFilterChange('All')} className="text-blue-200 hover:text-white underline transition-colors duration-200">
            ← Back to All Events
            </button>
        </div>
        )}
    </div>
    </div>

    {/* Filters */}
    <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
    <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto py-6 space-x-2 scrollbar-hide">
        {filterCategories.map((category) => (
            <button
            key={category}
            onClick={() => handleFilterChange(category)}
            className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeFilter === category
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            >
            {category}
            </button>
        ))}
        </div>
    </div>
    </div>

    {/* Loading Spinner */}
    {isLoading ? (
    <div className="text-center py-20 text-gray-600">
        <div className="text-2xl font-semibold mb-4">Loading events...</div>
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-opacity-50 mx-auto"></div>
    </div>
    ) : (
    <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
        <p className="text-gray-600">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            {activeFilter !== 'All' && <span> in <strong>{activeFilter}</strong></span>}
        </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredEvents.map((event) => {
            const imageUrl = getImageUrl(event.image);
            const eventDate = formatEventDate(event.date);
            const eventTime = formatEventTime(event.time);
            const ticketTypes = event.ticketTypes || event.tickets || [];
            const hasMultipleTicketTypes = Array.isArray(ticketTypes) && ticketTypes.length > 1;
            const eventSoldOut = isEventSoldOut(event);
            const clickable = isEventClickable(event);

            const getEventPrice = () => {
            if (ticketTypes.length === 0) return "Free";
            const prices = ticketTypes.map(t => t.price || 0);
            const minPrice = Math.min(...prices);
            return minPrice === 0 ? "Free" : `Rs. ${minPrice.toFixed(2)}`;
            };

            return (
            <div
                key={event._id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col ${
                    clickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                }`}
                onClick={() => handleEventClick(event)}
            >
                <div className="relative overflow-hidden aspect-square">
                {imageUrl ? (
                    <img
                    src={imageUrl}
                    alt={event.title}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                        clickable ? 'group-hover:scale-105' : ''
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

                <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
                    clickable ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'
                }`}></div>

                <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {event.subcategory}
                </div>

                {hasMultipleTicketTypes && !eventSoldOut && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Multiple Options
                    </div>
                )}

                {/* Show sold out badge */}
                {eventSoldOut && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold border border-red-600">
                        SOLD OUT
                    </div>
                )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                <h3 className={`text-lg font-bold text-gray-900 mb-3 transition-colors duration-200 line-clamp-2 min-h-[3.5rem] ${
                    clickable ? 'group-hover:text-blue-600' : ''
                }`}>
                    {event.title}
                </h3>

                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{eventDate} • {eventTime}</span>
                </div>

                <div className="flex items-start space-x-2 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm line-clamp-2">{event.venue}</span>
                </div>

                <div className="mb-4 mt-auto">
                    <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xl font-bold text-blue-600">{getEventPrice()}</span>
                    </div>
                    {getEventPrice() !== "Free" && hasMultipleTicketTypes && !eventSoldOut && (
                    <span className="text-gray-500 text-sm">Multiple pricing options</span>
                    )}
                </div>

                {/* UPDATED: Button with enhanced sold out logic */}
                <button
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${getButtonStyle(event)}`}
                    disabled={!clickable}
                    onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                    }}
                >
                    {getButtonText(event)}
                </button>
                </div>
            </div>
            );
        })}
        </div>

        {filteredEvents.length === 0 && (
        <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {activeFilter.toLowerCase()} events found
            </h3>
            <p className="text-gray-600">
            Try selecting a different category or check back later for new events.
            </p>
            <button
            onClick={() => handleFilterChange('All')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
            View All Events
            </button>
        </div>
        )}
    </div>
    )}
</div>
);
};

export default EventsPage;