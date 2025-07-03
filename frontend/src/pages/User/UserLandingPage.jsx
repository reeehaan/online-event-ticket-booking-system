import React, { useState, useMemo } from "react";
import { Search, Calendar, MapPin, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom'; // Add this import

function UserLandingPage() {
const navigate = useNavigate(); // Add this hook
const [searchQuery, setSearchQuery] = useState("");
const [activeMonth, setActiveMonth] = useState("This Month");
const [activeCategory, setActiveCategory] = useState("All");

// Your existing Events array stays the same
const Events = [
{
    id: 1,
    title: "Lakshapana Rope Jumping - Waterfall Adventure",
    date: "Jul 04, 2025",
    time: "08:00 AM IST",
    venue: "Lakshapana Waterfall",
    price: "35,000 LKR",
    originalPrice: null,
    image: "/api/placeholder/300/200",
    category: "Adventure",
    status: "available", // Add status property
    location: "Lakshapana Waterfall", // Add location property for consistency
    description: "Experience the thrill of rope jumping at the beautiful Lakshapana Waterfall."
},
{
    id: 2,
    title: "Harima Badu Thunak - Comedy Show",
    date: "Jul 04, 2025",
    time: "06:30 PM IST",
    venue: "Tower Hall Maradana",
    price: "500 LKR",
    originalPrice: null,
    image: "/api/placeholder/300/200",
    category: "Theater",
    status: "available",
    location: "Tower Hall Maradana",
    description: "A hilarious comedy show that will keep you laughing all night."
},
{
    id: 3,
    title: "Lakshapana Rope Jump",
    date: "Jul 05, 2025",
    time: "08:00 AM IST",
    venue: "Lakshapana Waterfall",
    price: "35,000 LKR",
    originalPrice: null,
    image: "/api/placeholder/300/200",
    category: "Adventure",
    status: "available",
    location: "Lakshapana Waterfall",
    description: "Another thrilling rope jumping adventure at Lakshapana Waterfall."
},
{
    id: 4,
    title: "Dewale Sajje - Festival Celebration",
    date: "Jul 06, 2025",
    time: "03:00 PM IST",
    venue: "Tower Hall Maradana",
    price: "500 LKR",
    originalPrice: null,
    image: "/api/placeholder/300/200",
    category: "Events",
    status: "available",
    location: "Tower Hall Maradana",
    description: "A traditional festival celebration with cultural performances."
},
{
    id: 5,
    title: "Summer Music Festival",
    date: "Aug 15, 2025",
    time: "07:00 PM IST",
    venue: "Galle Face Green",
    price: "1,500 LKR",
    originalPrice: null,
    image: "/api/placeholder/300/200",
    category: "Events",
    status: "available",
    location: "Galle Face Green",
    description: "A spectacular summer music festival featuring local and international artists."
},
{
    id: 6,
    title: "Stand-up Comedy Night",
    date: "Aug 20, 2025",
    time: "08:00 PM IST",
    venue: "BMICH",
    price: "750 LKR",
    originalPrice: null,
    image: "/api/placeholder/300/200",
    category: "Theater",
    status: "sold-out", // Example of sold-out event
    location: "BMICH",
    description: "An evening of stand-up comedy with renowned comedians."
},
{
    id: 7,
    title: "Adventure Hiking Tour",
    date: "Aug 25, 2025",
    time: "06:00 AM IST",
    venue: "Adam's Peak",
    price: "2,500 LKR",
    originalPrice: null,
    image: "/api/placeholder/300/200",
    category: "Adventure",
    status: "available",
    location: "Adam's Peak",
    description: "A challenging hiking adventure to the summit of Adam's Peak."
},
{
    id: 8,
    title: "Cultural Dance Performance",
    date: "Aug 30, 2025",
    time: "05:00 PM IST",
    venue: "Nelum Pokuna Theatre",
    price: "1,200 LKR",
    originalPrice: null,
    image: "/api/placeholder/300/200",
    category: "Events",
    status: "available",
    location: "Nelum Pokuna Theatre",
    description: "A mesmerizing cultural dance performance showcasing traditional Sri Lankan dances."
}
];

// Add the same functions from EventsPage
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

// Add event click handler
const handleEventClick = (event) => {
if (event.status === 'available') {
    navigate('/event-details', { state: { event } });
}
};

// Rest of your existing code for ticketDeals, chillVibeEvents, and filteredEvents...
const ticketDeals = [
{
    id: 1,
    title: "Harmony Sessions",
    date: "Jul 06, 2025",
    time: "06:00 PM IST",
    venue: "Harmony Center - Boralesgamuwa",
    price: "2,000 LKR",
    originalPrice: "2,500 LKR",
    discount: "500 LKR Off",
    badge: "Deal",
    image: "/api/placeholder/300/200",
    status: "available",
    location: "Harmony Center - Boralesgamuwa",
    category: "Events",
    description: "A relaxing harmony session with live music and meditation."
},
{
    id: 2,
    title: "ALPHA BLONDY LIVE IN SRI LANKA",
    date: "Jul 19, 2025",
    time: "07:00 PM IST",
    venue: "Air Force Ground",
    price: "7,500 LKR",
    originalPrice: null,
    discount: "1+ Deals",
    badge: "Deal",
    image: "/api/placeholder/300/200",
    status: "available",
    location: "Air Force Ground",
    category: "Events",
    description: "Live concert by the legendary Alpha Blondy in Sri Lanka."
},
{
    id: 3,
    title: "Bera Clinic",
    date: "Aug 03, 2025",
    time: "05:00 PM IST",
    venue: "Viharamaha Devi Open Air Theater",
    price: "1,500 LKR",
    originalPrice: "2,000 LKR",
    discount: "500 LKR Off",
    badge: "Deal",
    image: "/api/placeholder/300/200",
    status: "available",
    location: "Viharamaha Devi Open Air Theater",
    category: "Events",
    description: "A unique musical experience at the open air theater."
},
{
    id: 4,
    title: "Kandy Esala Perahera (International Package)",
    date: "Aug 08, 2025",
    time: "10:00 AM IST",
    venue: "Kandy City Hotel",
    price: "80 USD",
    originalPrice: "100 USD",
    discount: "20 USD Off",
    badge: "Deal",
    image: "/api/placeholder/300/200",
    status: "available",
    location: "Kandy City Hotel",
    category: "Events",
    description: "Experience the grandeur of Kandy Esala Perahera with international package."
}
];

const chillVibeEvents = [
{
    id: 1,
    title: "Harima Badu Thunak - Comedy Night",
    date: "Jul 04, 2025",
    time: "06:30 PM IST",
    venue: "Tower Hall Maradana",
    price: "500 LKR",
    image: "/api/placeholder/300/200",
    status: "available",
    location: "Tower Hall Maradana",
    category: "Theater",
    description: "A hilarious comedy night at Tower Hall Maradana."
},
{
    id: 2,
    title: "Dewale Sajje - Cultural Evening",
    date: "Jul 05, 2025",
    time: "03:30 PM IST",
    venue: "Tower Hall Maradana",
    price: "500 LKR",
    image: "/api/placeholder/300/200",
    status: "available",
    location: "Tower Hall Maradana",
    category: "Events",
    description: "A cultural evening celebrating traditional Sri Lankan heritage."
},
{
    id: 3,
    title: "Dewale Sajje - Night Show",
    date: "Jul 05, 2025",
    time: "06:30 PM IST",
    venue: "Tower Hall Maradana",
    price: "500 LKR",
    image: "/api/placeholder/300/200",
    status: "available",
    location: "Tower Hall Maradana",
    category: "Events",
    description: "An evening cultural show with traditional performances."
},
{
    id: 4,
    title: "Harmony Sessions - Live Music",
    date: "Jul 06, 2025",
    time: "06:00 PM IST",
    venue: "Harmony Center - Boralesgamuwa",
    price: "2,500 LKR",
    image: "/api/placeholder/300/200",
    status: "available",
    location: "Harmony Center - Boralesgamuwa",
    category: "Events",
    description: "Live music sessions in a serene and harmonious environment."
}
];

// Function to filter events by month
const filteredEvents = useMemo(() => {
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();
const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

return Events.filter(event => {
    // Parse the event date (format: "Jul 04, 2025")
    const eventDate = new Date(event.date);

    if (activeMonth === "This Month") {
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    } else if (activeMonth === "Next Month") {
    return eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextMonthYear;
    }
    return true;
});
}, [activeMonth]);

// Updated EventCard component that matches EventsPage style
const EventCard = ({ event, showDiscount = false }) => (
<div
    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
    onClick={() => handleEventClick(event)}
>
    {/* Event Image */}
    <div className="relative overflow-hidden aspect-[4/3]">
    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
        <div className="text-xl font-bold mb-2">{event.title.split(' ')[0]}</div>
        <div className="text-sm opacity-90">Event Image</div>
        </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    {/* Category badge */}
    <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
        {event.category}
    </div>
    
    {/* Deal badge */}
    {event.badge && (
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
        {event.badge}
        </div>
    )}
    </div>

    {/* Event Details */}
    <div className="p-5 flex flex-col flex-1">
    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-[3.5rem]">
        {event.title}
    </h3>

    {/* Date & Time */}
    <div className="flex items-center space-x-2 text-gray-600 mb-2">
        <Calendar className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{event.date} • {event.time}</span>
    </div>

    {/* Location */}
    <div className="flex items-start space-x-2 text-gray-600 mb-4">
        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span className="text-sm line-clamp-2">{event.location || event.venue}</span>
    </div>

    {/* Price */}
    <div className="mb-4 mt-auto">
        <div className="flex items-center space-x-2 mb-1">
        <span className="text-xl font-bold text-blue-600">{event.price}</span>
        {event.originalPrice && (
            <span className="text-sm text-gray-500 line-through">{event.originalPrice}</span>
        )}
        </div>
        {event.price.includes('LKR') && (
        <span className="text-gray-500 text-sm">upwards</span>
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
        {showDiscount && event.discount 
        ? `${getButtonText(event.status)} • ${event.discount}` 
        : getButtonText(event.status)
        }
    </button>
    </div>
</div>
);

return (
<div className="min-h-screen bg-white">
    {/* Hero Section */}
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900"></div>
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

        <div className="flex flex-col sm:flex-row gap-3 max-w-md bg-white rounded-xl">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 " size={20} />
            <input
                type="text"
                placeholder="Search by Artist, Event or Venue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-4 rounded-lg border-0 focus:ring-2 focus:ring-blue-300"
            />
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-900 font-medium transition-colors rounded-1xl m-0.5">
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
            <EventCard key={event.id} event={event} />
        ))
        ) : (
        <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎭</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No events found for {activeMonth.toLowerCase()}</p>
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
    <div className="container mx-auto px-4 py-12">
    <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">My Tickets Deals</h2>
        <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
        View more <ArrowRight size={16} className="ml-1" />
        </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {ticketDeals.map((event) => (
        <EventCard key={event.id} event={event} showDiscount={true} />
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

    {/* Chill & Vibe section */}
    <div className="container mx-auto px-4 py-12">
    <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Chill & Vibe</h2>
        <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
            {["All", "Events", "Theater", "Sports"].map((category) => (
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
        <EventCard key={event.id} event={event} />
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