import React, { useEffect, useState } from 'react';
import { 
Trash2, 
Pencil, 
Plus, 
X, 
Calendar, 
Clock, 
MapPin, 
Users, 
Tag, 
Save,
Eye,
AlertCircle,
Check,
FileText,
Ticket
} from 'lucide-react';
import axios from 'axios';





function ManageEvents() {
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);
const [editingEvent, setEditingEvent] = useState(null);
const [editingTickets, setEditingTickets] = useState(null);
const [error, setError] = useState(null);
const [viewMode, setViewMode] = useState('list'); // 'list' or 'edit'
const [notifications, setNotifications] = useState([]);

const showNotification = (message, type = 'success') => {
const id = Date.now();
setNotifications(prev => [...prev, { id, message, type }]);
setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== id));
}, 3000);
};

const fetchEvents = async () => {
try {
setLoading(true);
const token = localStorage.getItem('authToken');

const response = await axios.get('http://localhost:3000/api/org/get-my-events', {
    headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
    }
});

if (response.data.success) {
    const eventsWithTickets = response.data.data.events.map(event => {
    let imageUrl = null;
    if (event.image) {
        try {
        if (event.image.startsWith('data:image/')) {
            imageUrl = event.image;
        } else {
            imageUrl = `data:image/jpeg;base64,${event.image}`;
        }
        } catch (imageError) {
        console.error('Error processing image for event:', event._id, imageError);
        imageUrl = null;
        }
    }

    return {
        ...event,
        image: imageUrl,
        ticketTypes: event.tickets || []
    };
    });

    setEvents(eventsWithTickets);
} else {
    throw new Error(response.data.message || 'Failed to fetch events');
}
} catch (err) {
if (err.response?.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
} else {
    setError(err.response?.data?.message || err.message || 'Failed to fetch events');
}
console.error('Error fetching events:', err);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchEvents();
}, []);

const handleDeleteEvent = (eventId) => {
if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
setEvents(prev => prev.filter(e => e._id !== eventId));
showNotification('Event deleted successfully');
};

const handleEventStatusUpdate = (eventId, newStatus) => {
setEvents(prev => 
    prev.map(e => e._id === eventId ? { ...e, status: newStatus } : e)
);
showNotification(`Event status updated to ${newStatus}`);
};

const handleEditEvent = (event) => {
setEditingEvent({ ...event });
setViewMode('edit');
};

const handleSaveEvent = () => {
if (!editingEvent.title?.trim()) {
    showNotification('Event title is required', 'error');
    return;
}

setEvents(prev => 
    prev.map(e => e._id === editingEvent._id ? editingEvent : e)
);
setEditingEvent(null);
setViewMode('list');
showNotification('Event updated successfully');
};

const handleEventFieldChange = (field, value) => {
setEditingEvent(prev => ({ ...prev, [field]: value }));
};

const handleManageTickets = (event) => {
setEditingTickets({ ...event });
};

const handleTicketChange = (ticketId, field, value) => {
setEditingTickets(prev => ({
    ...prev,
    ticketTypes: prev.ticketTypes.map(ticket => 
    ticket._id === ticketId ? { ...ticket, [field]: value } : ticket
    )
}));
};

const handleAddTicket = () => {
const newTicket = {
    _id: 'new_' + Date.now(),
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    sold: 0,
    maxPerPurchase: 1,
    status: 'active'
};

setEditingTickets(prev => ({
    ...prev,
    ticketTypes: [...prev.ticketTypes, newTicket]
}));
};

const handleRemoveTicket = (ticketId) => {
if (editingTickets.ticketTypes.length === 1) {
    showNotification('Cannot remove the last ticket type', 'error');
    return;
}

setEditingTickets(prev => ({
    ...prev,
    ticketTypes: prev.ticketTypes.filter(t => t._id !== ticketId)
}));
};

const handleSaveTickets = () => {
// Validation
const hasInvalidTickets = editingTickets.ticketTypes.some(ticket => 
    !ticket.name.trim() || ticket.price < 0 || ticket.quantity < 0
);

if (hasInvalidTickets) {
    showNotification('Please fill all required fields with valid values', 'error');
    return;
}

const totalTickets = editingTickets.ticketTypes.reduce((sum, ticket) => 
    sum + parseInt(ticket.quantity) + parseInt(ticket.sold), 0
);

if (totalTickets > editingTickets.maxAttendee) {
    showNotification(`Total tickets (${totalTickets}) cannot exceed max attendees (${editingTickets.maxAttendee})`, 'error');
    return;
}

setEvents(prev => 
    prev.map(e => e._id === editingTickets._id ? editingTickets : e)
);
setEditingTickets(null);
showNotification('Tickets updated successfully');
};

const handleTicketStatusToggle = (ticketId) => {
setEditingTickets(prev => ({
    ...prev,
    ticketTypes: prev.ticketTypes.map(ticket => 
    ticket._id === ticketId 
        ? { ...ticket, status: ticket.status === 'active' ? 'inactive' : 'active' }
        : ticket
    )
}));
};

const getEventStatusColor = (status) => {
switch (status) {
    case 'Active': return 'bg-green-100 text-green-800';
    case 'Draft': return 'bg-yellow-100 text-yellow-800';
    case 'Completed': return 'bg-blue-100 text-blue-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
}
};

const getTicketStatusColor = (status) => {
switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    case 'sold_out': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
}
};

if (loading) {
return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
    <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
        ))}
        </div>
    </div>
    </div>
);
}

return (
<div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-15">
    
    {notifications.length > 0 && (
    <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
        <div
            key={notification.id}
            className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
            }`}
        >
            {notification.type === 'success' && <Check size={16} />}
            {notification.type === 'error' && <AlertCircle size={16} />}
            {notification.message}
        </div>
        ))}
    </div>
    )}


    <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
        <FileText className="text-purple-600" size={28} />
        </div>
        Event Management
    </h2>
    
    {viewMode === 'edit' && (
        <button
        onClick={() => {
            setEditingEvent(null);
            setViewMode('list');
        }}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 mt-15"
        >
        <X size={16} />
        Back to List
        </button>
    )}
    </div>

    {viewMode === 'list' ? (

    <>
        {events.length === 0 ? (
        <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
            <Calendar className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg">You haven't created any events yet.</p>
        </div>
        ) : (
        <div className="space-y-6">
            {events.map((event) => {
            const totalTickets = event.ticketTypes.reduce((sum, t) => sum + t.quantity + t.sold, 0);
            const soldTickets = event.ticketTypes.reduce((sum, t) => sum + t.sold, 0);
            const availableTickets = event.ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
            
            return (
                <div
                key={event._id}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                
                    <div className="lg:w-48 h-48 flex-shrink-0">
                        <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-xl"
                        />
                    </div>

                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventStatusColor(event.status)}`}>
                            {event.status}
                        </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} className="text-purple-600" />
                            {event.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={16} className="text-purple-600" />
                            {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={16} className="text-purple-600" />
                            {event.venue}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={16} className="text-purple-600" />
                            {soldTickets}/{event.maxAttendee} attendees
                        </div>
                        </div>

                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Ticket size={16} className="text-purple-600" />
                            Ticket Summary
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                            <p className="text-gray-600">Total Tickets</p>
                            <p className="font-semibold">{totalTickets}</p>
                            </div>
                            <div>
                            <p className="text-gray-600">Sold</p>
                            <p className="font-semibold text-green-600">{soldTickets}</p>
                            </div>
                            <div>
                            <p className="text-gray-600">Available</p>
                            <p className="font-semibold text-blue-600">{availableTickets}</p>
                            </div>
                            <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-semibold text-purple-600">
                                LKR {event.ticketTypes.reduce((sum, t) => sum + (t.price * t.sold), 0).toLocaleString()}
                            </p>
                            </div>
                        </div>
                        </div>

                        
                        <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleEditEvent(event)}
                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"
                        >
                            <Pencil size={14} />
                            Edit Event
                        </button>
                        
                        <button
                            onClick={() => handleManageTickets(event)}
                            className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
                        >
                            <Ticket size={14} />
                            Manage Tickets
                        </button>
                        
                        <select
                            value={event.status}
                            onChange={(e) => handleEventStatusUpdate(event._id, e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        
                        <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            );
            })}
        </div>
        )}
    </>
    ) : (
    // Edit Event View
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
            <input
                type="text"
                value={editingEvent?.title || ''}
                onChange={(e) => handleEventFieldChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            </div>
            
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
                rows={4}
                value={editingEvent?.description || ''}
                onChange={(e) => handleEventFieldChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                value={editingEvent?.category || ''}
                onChange={(e) => handleEventFieldChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                <option value="">Select Category</option>
                <option value="Event">Event</option>
                <option value="Theater">Theater</option>
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <input
                type="text"
                value={editingEvent?.subcategory || ''}
                onChange={(e) => handleEventFieldChange('subcategory', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            </div>
        </div>
        
        
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                type="date"
                value={editingEvent?.date || ''}
                onChange={(e) => handleEventFieldChange('date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                type="time"
                value={editingEvent?.time || ''}
                onChange={(e) => handleEventFieldChange('time', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
            </div>
            </div>
            
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
            <input
                type="text"
                value={editingEvent?.venue || ''}
                onChange={(e) => handleEventFieldChange('venue', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            </div>
            
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees</label>
            <input
                type="number"
                value={editingEvent?.maxAttendee || ''}
                onChange={(e) => handleEventFieldChange('maxAttendee', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="1"
            />
            </div>
        </div>
        </div>
        
        
        <div className="flex justify-end">
        <button
            onClick={handleSaveEvent}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
            <Save size={16} />
            Save Changes
        </button>
        </div>
    </div>
    )}

    
    {editingTickets && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 mt-20">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Manage Tickets - {editingTickets.title}</h3>
            <button
                onClick={() => setEditingTickets(null)}
                className="text-gray-500 hover:text-gray-700"
            >
                <X size={24} />
            </button>
            </div>

            <div className="space-y-6">
            {editingTickets.ticketTypes.map((ticket) => (
                <div key={ticket._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-gray-800">Ticket Type</h4>
                    <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTicketStatusColor(ticket.status)}`}>
                        {ticket.status}
                    </span>
                    <button
                        onClick={() => handleTicketStatusToggle(ticket._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        Toggle Status
                    </button>
                    <button
                        onClick={() => handleRemoveTicket(ticket._id)}
                        className="text-red-600 hover:text-red-800"
                    >
                        <Trash2 size={16} />
                    </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => handleTicketChange(ticket._id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
                    <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(ticket._id, 'price', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="0"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity</label>
                    <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => handleTicketChange(ticket._id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="0"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sold</label>
                    <input
                        type="number"
                        value={ticket.sold}
                        onChange={(e) => handleTicketChange(ticket._id, 'sold', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="0"
                    />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Per Purchase</label>
                    <input
                        type="number"
                        value={ticket.maxPerPurchase}
                        onChange={(e) => handleTicketChange(ticket._id, 'maxPerPurchase', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="1"
                    />
                    </div>
                </div>
                
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                    rows={2}
                    value={ticket.description}
                    onChange={(e) => handleTicketChange(ticket._id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Optional description of ticket benefits"
                    />
                </div>
                </div>
            ))}
            </div>

            <div className="flex justify-between items-center mt-6">
            <button
                onClick={handleAddTicket}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
                <Plus size={16} />
                Add Ticket Type
            </button>
            
            <div className="flex gap-3">
                <button
                onClick={() => setEditingTickets(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                Cancel
                </button>
                <button
                onClick={handleSaveTickets}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                <Save size={16} />
                Save Tickets
                </button>
            </div>
            </div>
        </div>
        </div>
    </div>
    )}
</div>
);
}

export default ManageEvents;