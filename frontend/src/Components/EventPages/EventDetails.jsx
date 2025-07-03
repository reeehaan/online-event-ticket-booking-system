import {  useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const EventDetails = () => {

const location = useLocation();
const navigate = useNavigate();
const event = location.state?.event;

// For demo purposes, using sample data
// const [event] = useState({
// id: 1,
// title: "INTERSTELLAR",
// date: "Saturday, Jul 12 IST",
// time: "8:00 PM",
// location: "Ceynor Restaurant - Colombo",
// price: "Rs. 2,500",
// category: "Electronic",
// status: "available",
// image: "/api/placeholder/400/400",
// description: "This isn't just a party—it's a journey. Welcome to INTERSTELLAR 2025, where you and your crew board a vessel bound for the stars. From the moment you arrive, you'll be swept into a universe of lights, sound, and energy unlike anything on Earth."
// });

// Sample show times data
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
// In your actual project, use this to navigate back:
navigate(-1);

};
useEffect(() => {
    if (!event) {
        navigate('/');
    }
}, [event, navigate]);

const handleBuyTickets = (show) => {
if (show.status === 'available') {
    console.log('Buy tickets for:', show);
    alert(`Buy tickets for ${show.phase} at ${show.time}`);
}
};


// If no event data is found, show error message
// In your actual project, check: if (!event) return <div>Event not found</div>;

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
                <strong>{event.title} 2025</strong> – A Night to Leave Earth Behind
            </p>
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

        {/* Show Times */}
        <div>
            <h3 className="text-xl font-semibold mb-4">Show Times</h3>
            <div className="space-y-4">
            {showTimes.map((show) => (
                <div key={show.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-md">
                        {show.type}
                    </div>
                <div>
                    <h4 className="font-semibold text-lg">{show.phase} @ {show.time}</h4>
                </div>
                <button
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${getButtonStyle(show.status)}`}
                    disabled={show.status === 'sold-out'}
                    onClick={() => handleBuyTickets(show)}
                >
                    {getButtonText(show.status)}
                </button>
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
</div>
);
};

export default EventDetails;