import React, { useState } from 'react';
import { ArrowLeft, Check, Plus, Trash2, Tag } from 'lucide-react';

const TicketCreationForm = ({ eventData, tickets, setTickets, onBack, onSubmit, isSubmitting }) => {
const [errors, setErrors] = useState({});

const handleTicketChange = (index, field, value) => {
const updatedTickets = [...tickets];
updatedTickets[index] = { ...updatedTickets[index], [field]: value };
setTickets(updatedTickets);

// Clear error when user starts typing
if (errors[`ticket-${index}-${field}`]) {
    setErrors(prev => ({ ...prev, [`ticket-${index}-${field}`]: '' }));
}
};

const addTicket = () => {
if (tickets.length < 5) {
    setTickets([...tickets, {
    name: '',
    description: '',
    price: '',
    quantity: '',
    currency: 'LKR',
    maxPerPurchase: 10,
    status: 'active'
    }]);
}
};

const removeTicket = (index) => {
if (tickets.length > 1) {
    const updatedTickets = tickets.filter((_, i) => i !== index);
    setTickets(updatedTickets);
}
};

const validateTickets = () => {
const newErrors = {};

tickets.forEach((ticket, index) => {
    if (!ticket.name?.trim()) {
    newErrors[`ticket-${index}-name`] = 'Ticket name is required';
    }
    if (!ticket.price || ticket.price < 0) {
    newErrors[`ticket-${index}-price`] = 'Price must be 0 or greater';
    }
    if (!ticket.quantity || ticket.quantity <= 0) {
    newErrors[`ticket-${index}-quantity`] = 'Quantity must be greater than 0';
    }
});

// Check total quantity doesn't exceed maxAttendee
const totalQuantity = tickets.reduce((sum, ticket) => sum + (parseInt(ticket.quantity) || 0), 0);
if (totalQuantity > eventData.maxAttendee) {
    newErrors.totalQuantity = `Total tickets (${totalQuantity}) cannot exceed max attendees (${eventData.maxAttendee})`;
}

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
if (validateTickets()) {
    onSubmit();
}
};

return (
<div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
    <div className="mb-8">
    <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
        <Tag className="text-purple-600" size={28} />
        </div>
        Create Tickets
    </h2>
    <p className="text-gray-600">Step 2 of 2: Ticket Types & Pricing</p>
    </div>

    {/* Event Summary */}
    <div className="bg-purple-50 rounded-xl p-6 mb-8">
    <h3 className="text-xl font-semibold text-purple-800 mb-4">Event Summary</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
        <p className="font-semibold text-gray-700">Title:</p>
        <p className="text-gray-600">{eventData.title}</p>
        </div>
        <div>
        <p className="font-semibold text-gray-700">Date & Time:</p>
        <p className="text-gray-600">{eventData.date} at {eventData.time}</p>
        </div>
        <div>
        <p className="font-semibold text-gray-700">Max Attendees:</p>
        <p className="text-gray-600">{eventData.maxAttendee}</p>
        </div>
    </div>
    </div>

    {/* Tickets */}
    <div className="space-y-6">
    <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Ticket Types</h3>
        <button
        onClick={addTicket}
        disabled={tickets.length >= 5}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
        <Plus size={18} />
        Add Ticket
        </button>
    </div>

    {tickets.map((ticket, index) => (
        <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Ticket {index + 1}</h4>
            {tickets.length > 1 && (
            <button
                onClick={() => removeTicket(index)}
                className="text-red-500 hover:text-red-700 p-1"
            >
                <Trash2 size={18} />
            </button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Ticket Name *
            </label>
            <input
                type="text"
                value={ticket.name}
                onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors[`ticket-${index}-name`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., General Admission, VIP"
            />
            {errors[`ticket-${index}-name`] && (
                <p className="text-red-500 text-sm">{errors[`ticket-${index}-name`]}</p>
            )}
            </div>

            <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Description
            </label>
            <input
                type="text"
                value={ticket.description}
                onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Brief description of ticket benefits"
            />
            </div>

            <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Price (LKR) *
            </label>
            <input
                type="number"
                value={ticket.price}
                onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors[`ticket-${index}-price`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
            />
            {errors[`ticket-${index}-price`] && (
                <p className="text-red-500 text-sm">{errors[`ticket-${index}-price`]}</p>
            )}
            </div>

            <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Quantity *
            </label>
            <input
                type="number"
                value={ticket.quantity}
                onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors[`ticket-${index}-quantity`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                min="1"
            />
            {errors[`ticket-${index}-quantity`] && (
                <p className="text-red-500 text-sm">{errors[`ticket-${index}-quantity`]}</p>
            )}
            </div>

            <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Max Per Purchase
            </label>
            <input
                type="number"
                value={ticket.maxPerPurchase}
                onChange={(e) => handleTicketChange(index, 'maxPerPurchase', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="10"
                min="1"
            />
            </div>
        </div>
        </div>
    ))}

    {errors.totalQuantity && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-medium">{errors.totalQuantity}</p>
        </div>
    )}
    </div>

    {/* Action Buttons */}
    <div className="flex justify-between mt-8">
    <button
        onClick={onBack}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 font-semibold"
    >
        <ArrowLeft size={20} />
        Back to Event Details
    </button>
    
    <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold disabled:opacity-50"
    >
        {isSubmitting ? (
        <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Creating Event...
        </>
        ) : (
        <>
            <Check size={20} />
            Create Event
        </>
        )}
    </button>
    </div>
</div>
);
};

export default TicketCreationForm;