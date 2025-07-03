import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, ImagePlus, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';


function CreateEvent() {
const [formData, setFormData] = useState({
title: '',
description: '',
date: '',
time: '',
location: '',
category: '',
});

const [ticketTypes, setTicketTypes] = useState([
{ type: 'General', price: '', count: '' }
]);

const [image, setImage] = useState(null);
const [previewURL, setPreviewURL] = useState(null);

const isMultiTicket = formData.category === 'Concert' || formData.category === 'DJ';

useEffect(() => {
if (!isMultiTicket) {
    setTicketTypes([{ type: 'General', price: '', count: '' }]);
}
}, [formData.category]);

const handleChange = (e) => {
const { name, value } = e.target;
setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleTicketTypeChange = (index, field, value) => {
const updated = [...ticketTypes];
updated[index][field] = value;
setTicketTypes(updated);
};

const addTicketType = () => {
setTicketTypes([...ticketTypes, { type: '', price: '', count: '' }]);
};

const removeTicketType = (index) => {
const updated = [...ticketTypes];
updated.splice(index, 1);
setTicketTypes(updated);
};

const handleImageChange = (e) => {
const file = e.target.files[0];
if (file) {
    setImage(file);
    setPreviewURL(URL.createObjectURL(file));
}
};

const handleSubmit = async (e) => {
e.preventDefault();

const eventData = new FormData();
for (const key in formData) {
    eventData.append(key, formData[key]);
}
eventData.append('ticketTypes', JSON.stringify(ticketTypes));
if (image) {
    eventData.append('image', image);
}

try {
    const response = await fetch('http://localhost:5000/api/events', {
    method: 'POST',
    body: eventData,
    });

    if (response.ok) {
    toast.success('🎉 Event created successfully!');
    setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: '',
    });
    setTicketTypes([{ type: 'General', price: '', count: '' }]);
    setImage(null);
    setPreviewURL(null);
    } else {
    toast.error('Failed to create event');
    }
} catch (err) {
    console.error(err);
    toast.error('Error submitting event');
}
};

return (
<div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
    <Plus size={24} /> Create New Event
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Form Section */}
    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4" encType="multipart/form-data">
        <h3 className="text-md font-bold mb-2 text-gray-800">Title</h3>
        <input name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="Event Title" />

        <h3 className="text-md font-bold mb-2 text-gray-800">Description</h3>
        <textarea name="description" required value={formData.description} onChange={handleChange} rows={4} className="w-full h-40 px-4 py-2 border rounded-xl" placeholder="Event Description" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" />
        <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" />
        </div>

        <h3 className="text-md font-bold mb-2 text-gray-800">Location</h3>
        <input name="location" required value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl" placeholder="Location / Zoom Link" />

        <h3 className="text-md font-bold mb-2 text-gray-800">Select Event Category</h3>
        <select name="category" required value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl">
        <option value="">Category</option>
        <option value="Concert">Concert</option>
        <option value="Webinar">Webinar</option>
        <option value="Workshop">Workshop</option>
        <option value="Festival">Festival</option>
        <option value="DJ">DJ</option>
        <option value="Exhibition">Exhibition</option>
        </select>

        {/* Ticket Types */}
        <div>
        <h3 className="text-md font-bold mb-2 text-gray-800">Ticket Types</h3>
        {ticketTypes.map((ticket, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 mb-2">
            {isMultiTicket && (
                <input
                type="text"
                placeholder="Type (VIP, Regular)"
                value={ticket.type}
                onChange={(e) => handleTicketTypeChange(index, 'type', e.target.value)}
                className="col-span-4 px-3 py-2 border rounded-xl"
                required
                />
            )}
            <input
                type="number"
                placeholder="Price (LKR)"
                value={ticket.price}
                onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                className={`${isMultiTicket ? 'col-span-4' : 'col-span-6'} px-3 py-2 border rounded-xl`}
                required
            />
            <input
                type="number"
                placeholder="Count"
                value={ticket.count}
                onChange={(e) => handleTicketTypeChange(index, 'count', e.target.value)}
                className={`${isMultiTicket ? 'col-span-3' : 'col-span-5'} px-3 py-2 border rounded-xl`}
                required
            />
            {isMultiTicket && ticketTypes.length > 1 && (
                <button
                type="button"
                onClick={() => removeTicketType(index)}
                className="col-span-1 text-red-500 hover:text-red-700"
                title="Remove"
                >
                <Trash2 size={18} />
                </button>
            )}
            </div>
        ))}
        {isMultiTicket && (
            <button type="button" onClick={addTicketType} className="text-blue-600 text-sm mt-1 hover:underline">
            + Add Ticket Type
            </button>
        )}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">
        Create Event
        </button>
    </form>

    {/* Image Upload Section */}
    <div className="space-y-4">
        <h3 className="text-md font-bold mb-2 text-gray-800 flex items-center gap-2">
        <ImagePlus size={18} /> Upload Event Image
        </h3>
        <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="border border-gray-300 p-2 rounded-xl w-full"
        />
        {previewURL && (
        <div className="mt-2">
            <img
            src={previewURL}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl border"
            />
        </div>
        )}
    </div>
    </div>

    {/* Toast Notifications */}
    <ToastContainer position="bottom-center" autoClose={2000} />
</div>
);
}

export default CreateEvent;
