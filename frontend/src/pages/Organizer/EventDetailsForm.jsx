import React, { useState } from 'react';
import {
Calendar,
Clock,
MapPin,
Plus,
ImagePlus,
ArrowRight,
Image,
Users,
Tag,
FileText
} from 'lucide-react';

const EventDetailsForm = ({ eventData, setEventData, onNext }) => {
const [image, setImage] = useState(null);
const [previewURL, setPreviewURL] = useState(null);
const [errors, setErrors] = useState({});

const subcategoryOptions = {
Event: ['Concert', 'DJ', 'Festival', 'Electronic'],
Theater: ['Drama', 'Comedy']
};

const handleChange = (e) => {
const { name, value } = e.target;

setEventData(prev => ({
    ...prev,
    [name]: value,
    ...(name === 'category' && { subcategory: '' }) // Reset subcategory when category changes
}));

if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
}
};

const handleImageChange = (e) => {
const file = e.target.files[0];
if (file) {
    setImage(file);
    setPreviewURL(URL.createObjectURL(file));
    setEventData(prev => ({ ...prev, image: file }));
}
};

const validateForm = () => {
const newErrors = {};

if (!eventData.title?.trim()) newErrors.title = 'Title is required';
if (!eventData.description?.trim()) newErrors.description = 'Description is required';
if (!eventData.category) newErrors.category = 'Category is required';
if (!eventData.subcategory?.trim()) newErrors.subcategory = 'Subcategory is required';
if (!eventData.date) newErrors.date = 'Date is required';
if (!eventData.time) newErrors.time = 'Time is required';
if (!eventData.venue?.trim()) newErrors.venue = 'Venue is required';
if (!eventData.maxAttendee || eventData.maxAttendee <= 0)
    newErrors.maxAttendee = 'Max attendees must be greater than 0';

// Date must be in the future
if (eventData.date) {
    const eventDate = new Date(eventData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
    newErrors.date = 'Event date must be in the future';
    }
}

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

const handleNext = () => {
if (validateForm()) {
    onNext();
}
};

return (
<div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
    <div className="mb-8">
    <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
        <Plus className="text-purple-600" size={28} />
        </div>
        Create New Event
    </h2>
    <p className="text-gray-600">Step 1 of 2: Event Details</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Form Section */}
    <div className="lg:col-span-2 space-y-6">
        {/* Title */}
        <div className="space-y-2">
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <FileText size={20} className="text-purple-600" />
            Event Title
        </label>
        <input
            name="title"
            value={eventData.title || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
            errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your event title"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <FileText size={20} className="text-purple-600" />
            Description
        </label>
        <textarea
            name="description"
            value={eventData.description || ''}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your event in detail..."
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Tag size={20} className="text-purple-600" />
            Category
            </label>
            <select
            name="category"
            value={eventData.category || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            >
            <option value="">Select Category</option>
            <option value="Event">Event</option>
            <option value="Theater">Theater</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
        </div>

        <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Tag size={20} className="text-purple-600" />
            Subcategory
            </label>
            <select
            name="subcategory"
            value={eventData.subcategory || ''}
            onChange={handleChange}
            disabled={!eventData.category}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                errors.subcategory ? 'border-red-500' : 'border-gray-300'
            }`}
            >
            <option value="">Select Subcategory</option>
            {subcategoryOptions[eventData.category]?.map((sub, index) => (
                <option key={index} value={sub}>
                {sub}
                </option>
            ))}
            </select>
            {errors.subcategory && (
            <p className="text-red-500 text-sm">{errors.subcategory}</p>
            )}
        </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Calendar size={20} className="text-purple-600" />
            Date
            </label>
            <input
            type="date"
            name="date"
            value={eventData.date || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Clock size={20} className="text-purple-600" />
            Time
            </label>
            <input
            type="time"
            name="time"
            value={eventData.time || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
            />
            {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
        </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <MapPin size={20} className="text-purple-600" />
            Venue
        </label>
        <input
            name="venue"
            value={eventData.venue || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
            errors.venue ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter venue name and address"
        />
        {errors.venue && <p className="text-red-500 text-sm">{errors.venue}</p>}
        </div>

        {/* Max Attendees */}
        <div className="space-y-2">
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Users size={20} className="text-purple-600" />
            Maximum Attendees
        </label>
        <input
            type="number"
            name="maxAttendee"
            value={eventData.maxAttendee || ''}
            onChange={handleChange}
            min="1"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
            errors.maxAttendee ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter maximum number of attendees"
        />
        {errors.maxAttendee && <p className="text-red-500 text-sm">{errors.maxAttendee}</p>}
        </div>
    </div>

    {/* Image Upload Section */}
    <div className="space-y-4">
        <label className="flex items-center gap-2 text-lg font-semibold text-gray-700">
        <ImagePlus size={20} className="text-purple-600" />
        Event Image
        </label>
        <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
        <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer">
            {previewURL ? (
            <div className="space-y-2">
                <img
                src={previewURL}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                />
                <p className="text-sm text-gray-600">Click to change image</p>
            </div>
            ) : (
            <div className="space-y-2">
                <Image size={48} className="mx-auto text-purple-400" />
                <p className="text-gray-600">Click to upload image</p>
                <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
            </div>
            )}
        </label>
        </div>
    </div>
    </div>

    {/* Next Button */}
    <div className="flex justify-end mt-8">
    <button
        onClick={handleNext}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
    >
        Next: Set Tickets
        <ArrowRight size={20} />
    </button>
    </div>
</div>
);
};

export default EventDetailsForm;
