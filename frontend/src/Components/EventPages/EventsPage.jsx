import { useState, useEffect } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Sample events data
const events = [
{
id: 1,
title: "INTERSTELLAR",
date: "Saturday, Jul 12 IST",
time: "8:00 PM",
location: "Ceynor Restaurant - Colombo",
price: "Rs. 2,500",
category: "Electronic",
status: "available",
image: "/api/placeholder/400/400",
description: "This isn't just a party—it's a journey. Welcome to INTERSTELLAR 2025, where you and your crew board a vessel bound for the stars."
},
{
id: 2,
title: "Jazz Night",
date: "Friday, Jul 18 IST",
time: "7:30 PM",
location: "Blue Note Club - Colombo",
price: "Rs. 1,800",
category: "Concert",
status: "available",
image: "/api/placeholder/400/400",
description: "Experience the smooth sounds of jazz in an intimate setting."
},
{
id: 3,
title: "Classical Symphony",
date: "Sunday, Jul 20 IST",
time: "6:00 PM",
location: "National Theatre - Colombo",
price: "Rs. 3,200",
category: "Classical",
status: "sold-out",
image: "/api/placeholder/400/400",
description: "A magnificent evening of classical music featuring renowned orchestra performers."
},
{
id: 4,
title: "DJ Night Extravaganza",
date: "Saturday, Jul 25 IST",
time: "9:00 PM",
location: "Club Aura - Colombo",
price: "Rs. 2,200",
category: "DJ",
status: "available",
image: "/api/placeholder/400/400",
description: "Dance the night away with top DJs spinning the latest hits."
},
{
id: 5,
title: "Dinner Dance Gala",
date: "Friday, Jul 30 IST",
time: "7:00 PM",
location: "Hilton Colombo",
price: "Rs. 4,500",
category: "Dinner Dance",
status: "available",
image: "/api/placeholder/400/400",
description: "An elegant evening of fine dining and dancing."
},
{
id: 6,
title: "Educational Workshop",
date: "Monday, Aug 2 IST",
time: "2:00 PM",
location: "University of Colombo",
price: "Rs. 1,000",
category: "Educational",
status: "available",
image: "/api/placeholder/400/400",
description: "Learn new skills in this comprehensive workshop."
},
{
id: 7,
title: "Theater Drama",
date: "Wednesday, Aug 5 IST",
time: "7:30 PM",
location: "Lionel Wendt Theatre",
price: "Rs. 1,500",
category: "Drama",
status: "available",
image: "/api/placeholder/400/400",
description: "A captivating theatrical performance."
},
{
id: 8,
title: "Musical Evening",
date: "Saturday, Aug 8 IST",
time: "6:30 PM",
location: "BMICH",
price: "Rs. 2,800",
category: "Musicals",
status: "available",
image: "/api/placeholder/400/400",
description: "Enjoy beautiful musical performances."
},
// Add more sample events for other categories
{
id: 9,
title: "Cricket Championship",
date: "Sunday, Aug 10 IST",
time: "2:00 PM",
location: "R. Premadasa Stadium",
price: "Rs. 1,200",
category: "Cricket",
status: "available",
image: "/api/placeholder/400/400",
description: "Watch the exciting cricket championship match."
},
{
id: 10,
title: "Football League Finals",
date: "Saturday, Aug 15 IST",
time: "4:00 PM",
location: "Sugathadasa Stadium",
price: "Rs. 800",
category: "Football",
status: "available",
image: "/api/placeholder/400/400",
description: "The ultimate football showdown."
},
{
id: 11,
title: "Wellness Retreat",
date: "Sunday, Aug 17 IST",
time: "9:00 AM",
location: "Bentota Beach Resort",
price: "Rs. 3,500",
category: "Wellness",
status: "available",
image: "/api/placeholder/400/400",
description: "Rejuvenate your mind and body."
},
{
id: 12,
title: "Food Festival",
date: "Friday, Aug 22 IST",
time: "5:00 PM",
location: "Galle Face Green",
price: "Rs. 500",
category: "Food Fairs",
status: "available",
image: "/api/placeholder/400/400",
description: "Taste the best local and international cuisines."
}
];

const EventsPage = () => {
const location = useLocation();
const navigate = useNavigate();
const [activeFilter, setActiveFilter] = useState('All');

// Extract category from URL parameters
useEffect(() => {
const searchParams = new URLSearchParams(location.search);
const categoryFromUrl = searchParams.get('category');

if (categoryFromUrl) {
    setActiveFilter(decodeURIComponent(categoryFromUrl));
} else {
    setActiveFilter('All');
}
}, [location.search]);

// Update URL when filter changes
const handleFilterChange = (category) => {
setActiveFilter(category);
if (category === 'All') {
    navigate('/events-page', { replace: true });
} else {
    navigate(`/events-page?category=${encodeURIComponent(category)}`, { replace: true });
}
};

const filterCategories = [
'All', 'Concert', 'Dinner Dance', 'Electronic', 'DJ', 'Classical', 
'Educational', 'Exhibition', 'Festival', 'Orchestral', 'Seminar', 
'Conference', 'Musical', 'Drama', 'Musicals', 'Children Theater', 
'Comedy', 'Cricket', 'Football', 'Rugby', 'Esports', 'Travel', 
'Wellness', 'Fun Fairs', 'Workshops', 'Food Fairs', 'Wine Tasting', 
'Buffets', 'Spiritual'
];

const getButtonStyle = (status) => {
switch (status) {
    case 'sold-out':
    return 'bg-red-100 text-red-600 cursor-not-allowed';
    case 'coming-soon':
    return 'bg-gray-100 text-gray-600 cursor-not-allowed';
    case 'available':
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
    case 'available':
    default:
    return 'Buy Tickets';
}
};

// Filter events based on active filter
const filteredEvents = activeFilter === 'All' 
? events 
: events.filter(event => event.category === activeFilter);

const handleEventClick = (event) => {
if (event.status === 'available') {
    navigate('/event-details', { state: { event } });
}
};

// Dynamic hero title based on selected category
const getHeroTitle = () => {
if (activeFilter === 'All') {
    return 'Events';
}
return activeFilter;
};

// Dynamic hero description
const getHeroDescription = () => {
if (activeFilter === 'All') {
    return 'Discover amazing events happening around you';
}
return `Explore the best ${activeFilter.toLowerCase()} events`;
};

return (
<div className="min-h-screen bg-white">
    {/* Hero Section - Dynamic title based on URL category */}
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white w-full">
    <div className="px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl md:text-6xl font-bold">{getHeroTitle()}</h1>
        <p className="text-xl text-blue-100 mt-4 opacity-90">
        {getHeroDescription()}
        </p>
        {activeFilter !== 'All' && (
        <div className="mt-4">
            <button 
            onClick={() => handleFilterChange('All')}
            className="text-blue-200 hover:text-white transition-colors duration-200 underline"
            >
            ← Back to All Events
            </button>
        </div>
        )}
    </div>
    </div>

    {/* Filter Section */}
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

    {/* Events Grid */}
    <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    {/* Results count */}
    <div className="mb-6">
        <p className="text-gray-600">
        Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} 
        {activeFilter !== 'All' && <span> in <strong>{activeFilter}</strong></span>}
        </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredEvents.map((event) => (
        <div
            key={event.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
            onClick={() => handleEventClick(event)}
        >
            {/* Event Image */}
            <div className="relative overflow-hidden aspect-[3/3]">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                <div className="text-2xl font-bold mb-2">{event.title.split(' ')[0]}</div>
                <div className="text-sm opacity-90">Event Image</div>
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Category badge */}
            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {event.category}
            </div>
            </div>

            {/* Event Details */}
            <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-200">
                {event.title}
            </h3>

            {/* Date & Time */}
            <div className="flex items-center space-x-2 text-gray-600 mb-3">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{event.date} • {event.time}</span>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{event.location}</span>
            </div>

            {/* Price */}
            <div className="mb-4">
                <span className="text-2xl font-bold text-blue-600">{event.price}</span>
                <span className="text-gray-500 text-sm ml-1">upwards</span>
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
        ))}
    </div>

    {/* Load More Button */}
    {filteredEvents.length > 0 && (
        <div className="text-center mt-12">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200">
            Load More {activeFilter === 'All' ? 'Events' : activeFilter}
        </button>
        </div>
    )}

    {/* No Events Message */}
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
</div>
);
};

export default EventsPage;