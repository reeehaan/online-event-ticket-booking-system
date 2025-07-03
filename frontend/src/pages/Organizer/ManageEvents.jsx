import React, { useEffect, useState } from 'react';
import { Trash2, Pencil, Plus, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ManageEvents() {
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);
const [editingEvent, setEditingEvent] = useState(null);

const dummyEvents = [
{
    _id: '1',
    title: 'Sunset Beach Party',
    description: 'Join us for a magical evening with live music and the ocean breeze.',
    date: '2025-07-20',
    time: '18:00',
    location: 'Mount Lavinia Beach',
    category: 'Concert',
    imageUrl: 'https://source.unsplash.com/400x300/?concert',
    ticketTypes: [
    { type: 'VIP', price: 5000, count: 0 },
    { type: 'Regular', price: 2500, count: 100 },
    ],
    status: 'Coming Soon',
},
{
    _id: '2',
    title: 'Online Workshop',
    description: 'A detailed online workshop on digital marketing strategies.',
    date: '2025-07-25',
    time: '10:00',
    location: 'Zoom',
    category: 'Workshop',
    imageUrl: 'https://source.unsplash.com/400x300/?workshop',
    ticketTypes: [{ type: 'General', price: 1500, count: 0 }],
    status: 'Coming Soon',
},
];

// Initialize with dummy data and update status if tickets sold out
const fetchDummyEvents = () => {
const updated = dummyEvents.map((event) => {
    const totalTickets = event.ticketTypes.reduce(
    (sum, t) => sum + parseInt(t.count),
    0
    );
    return {
    ...event,
    status: totalTickets === 0 ? 'Sold Out' : event.status,
    };
});
setTimeout(() => {
    setEvents(updated);
    setLoading(false);
}, 1000);
};

useEffect(() => {
fetchDummyEvents();
}, []);

const handleDelete = (eventId) => {
if (!window.confirm('Are you sure you want to delete this event?')) return;
setEvents((prev) => prev.filter((e) => e._id !== eventId));
toast.success('Event deleted');
};

const handleStatusUpdate = (id, newStatus) => {
setEvents((prev) =>
    prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
);
toast.success('Status updated');
};

// Handle edits on event fields
const handleEditChange = (field, value) => {
setEditingEvent((prev) => ({ ...prev, [field]: value }));
};

// Handle edits on ticket types
const handleTicketChange = (index, field, value) => {
const updatedTickets = [...editingEvent.ticketTypes];
if (field === 'count' || field === 'price') {
    // Ensure numbers
    value = value === '' ? '' : Number(value);
}
updatedTickets[index] = { ...updatedTickets[index], [field]: value };
setEditingEvent((prev) => ({ ...prev, ticketTypes: updatedTickets }));

// Auto update status if total tickets sold out
const total = updatedTickets.reduce(
    (sum, t) => sum + (t.count ? t.count : 0),
    0
);
if (total === 0) {
    setEditingEvent((prev) => ({ ...prev, status: 'Sold Out' }));
} else if (prev.status === 'Sold Out') {
    setEditingEvent((prev) => ({ ...prev, status: 'Coming Soon' }));
}
};

// Add a new ticket type
const addTicketType = () => {
setEditingEvent((prev) => ({
    ...prev,
    ticketTypes: [...prev.ticketTypes, { type: '', price: 0, count: 0 }],
}));
};

// Remove a ticket type
const removeTicketType = (index) => {
const updatedTickets = [...editingEvent.ticketTypes];
updatedTickets.splice(index, 1);
setEditingEvent((prev) => ({ ...prev, ticketTypes: updatedTickets }));

// Recalculate status if needed
const total = updatedTickets.reduce(
    (sum, t) => sum + (t.count ? t.count : 0),
    0
);
if (total === 0) {
    setEditingEvent((prev) => ({ ...prev, status: 'Sold Out' }));
}
};

// Save edited event to events state
const handleSaveEdit = () => {
setEvents((prev) =>
    prev.map((e) => (e._id === editingEvent._id ? editingEvent : e))
);
setEditingEvent(null);
toast.success('Event updated');
};

return (
<div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
    <h2 className="text-2xl font-bold mb-6 text-gray-800">My Events</h2>

    {loading ? (
    <p>Loading events...</p>
    ) : events.length === 0 ? (
    <p>You haven't created any events yet.</p>
    ) : (
    <div className="space-y-6">
        {events.map((event) => (
        <div
            key={event._id}
            className="border rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm"
        >
            <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full md:w-40 h-40 object-cover rounded-xl border"
            />
            <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
            <p className="text-sm italic text-gray-700">{event.description}</p>
            <p className="text-sm text-gray-600">
                {event.date} @ {event.time}
            </p>
            <p className="text-sm text-gray-600">📍 {event.location}</p>
            <p className="text-sm text-gray-600">🎫 {event.category}</p>
            <p className="text-sm font-semibold text-blue-700 mt-1">
                Status: {event.status}
            </p>

            <div className="mt-2">
                <p className="font-semibold">Tickets:</p>
                <ul className="text-sm text-gray-700 list-disc ml-5">
                {event.ticketTypes.map((ticket, i) => (
                    <li key={i}>
                    {ticket.type} – Rs. {ticket.price} × {ticket.count}
                    </li>
                ))}
                </ul>
            </div>

            <div className="flex gap-2 mt-3">
                <button
                onClick={() =>
                    handleStatusUpdate(
                    event._id,
                    event.status === 'Coming Soon' ? 'Sold Out' : 'Coming Soon'
                    )
                }
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-xl text-sm"
                >
                Toggle Status
                </button>
                <button
                onClick={() => setEditingEvent(event)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-xl text-sm flex items-center gap-1"
                >
                <Pencil size={14} /> Edit
                </button>
                <button
                onClick={() => handleDelete(event._id)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-xl text-sm"
                >
                <Trash2 size={14} />
                </button>
            </div>
            </div>
        </div>
        ))}
    </div>
    )}

    {/* Edit Modal */}
    {editingEvent && (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Edit Event</h3>
            <button
            onClick={() => setEditingEvent(null)}
            className="text-gray-500 hover:text-gray-900"
            title="Close"
            >
            <X size={24} />
            </button>
        </div>

        {/* Title */}
        <label className="block font-semibold">Title</label>
        <input
            type="text"
            className="w-full border rounded-xl px-4 py-2"
            value={editingEvent.title}
            onChange={(e) => handleEditChange('title', e.target.value)}
        />

        {/* Description */}
        <label className="block font-semibold mt-2">Description</label>
        <textarea
            rows={3}
            className="w-full border rounded-xl px-4 py-2"
            value={editingEvent.description}
            onChange={(e) => handleEditChange('description', e.target.value)}
        />

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
            <label className="block font-semibold">Date</label>
            <input
                type="date"
                className="w-full border rounded-xl px-4 py-2"
                value={editingEvent.date}
                onChange={(e) => handleEditChange('date', e.target.value)}
            />
            </div>
            <div>
            <label className="block font-semibold">Time</label>
            <input
                type="time"
                className="w-full border rounded-xl px-4 py-2"
                value={editingEvent.time}
                onChange={(e) => handleEditChange('time', e.target.value)}
            />
            </div>
        </div>

        {/* Location */}
        <label className="block font-semibold mt-2">Location</label>
        <input
            type="text"
            className="w-full border rounded-xl px-4 py-2"
            value={editingEvent.location}
            onChange={(e) => handleEditChange('location', e.target.value)}
        />

        {/* Category */}
        <label className="block font-semibold mt-2">Category</label>
        <select
            className="w-full border rounded-xl px-4 py-2"
            value={editingEvent.category}
            onChange={(e) => handleEditChange('category', e.target.value)}
        >
            <option value="">Select Category</option>
            <option value="Concert">Concert</option>
            <option value="Webinar">Webinar</option>
            <option value="Workshop">Workshop</option>
            <option value="Festival">Festival</option>
            <option value="DJ">DJ</option>
            <option value="Exhibition">Exhibition</option>
        </select>

        {/* Ticket Types */}
        <label className="block font-semibold mt-2">Ticket Types</label>
        {editingEvent.ticketTypes.map((ticket, i) => (
            <div
            key={i}
            className="grid grid-cols-12 gap-2 items-center mb-2"
            >
            <input
                type="text"
                placeholder="Type"
                className="col-span-4 px-3 py-2 border rounded-xl"
                value={ticket.type}
                onChange={(e) =>
                handleTicketChange(i, 'type', e.target.value)
                }
                required
            />
            <input
                type="number"
                placeholder="Price (LKR)"
                className="col-span-3 px-3 py-2 border rounded-xl"
                value={ticket.price}
                onChange={(e) =>
                handleTicketChange(i, 'price', e.target.value)
                }
                min="0"
                required
            />
            <input
                type="number"
                placeholder="Count"
                className="col-span-3 px-3 py-2 border rounded-xl"
                value={ticket.count}
                onChange={(e) =>
                handleTicketChange(i, 'count', e.target.value)
                }
                min="0"
                required
            />
            <button
                type="button"
                className="col-span-2 text-red-600 hover:text-red-800"
                onClick={() => removeTicketType(i)}
                title="Remove ticket type"
                disabled={editingEvent.ticketTypes.length === 1}
            >
                <Trash2 size={20} />
            </button>
            </div>
        ))}
        <button
            type="button"
            className="text-blue-600 text-sm hover:underline"
            onClick={addTicketType}
        >
            <Plus size={16} /> Add Ticket Type
        </button>

        {/* Status - Display only, since auto updates based on tickets */}
        <p className="mt-3 text-sm italic text-gray-600">
            Status is auto-updated based on ticket availability (Sold Out if
            no tickets left).
        </p>

        <div className="mt-6 flex justify-end gap-4">
            <button
            onClick={() => setEditingEvent(null)}
            className="px-4 py-2 rounded-xl border border-gray-300"
            >
            Cancel
            </button>
            <button
            onClick={handleSaveEdit}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
            Save Changes
            </button>
        </div>
        </div>
    </div>
    )}

    <ToastContainer position="bottom-center" autoClose={3000} />
</div>
);
}

export default ManageEvents;
