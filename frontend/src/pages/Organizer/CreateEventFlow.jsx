import React, { useState } from 'react';
import axios from 'axios';
import EventDetailsForm from "./EventDetailsForm";
import TicketCreationForm from "./TicketCreationForm";

const CreateEventFlow = () => {
const [currentStep, setCurrentStep] = useState(1);

const [eventData, setEventData] = useState({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        date: '',
        time: '',
        venue: '',
        maxAttendee: '',
        image: null
});

const [tickets, setTickets] = useState([{
    name: '',
    description: '',
    price: '',
    quantity: '',
    currency: 'LKR',
    maxPerPurchase: 10,
    status: 'active'
}]);

const [isSubmitting, setIsSubmitting] = useState(false);

const handleNext = () => {
    setCurrentStep(2);
};

const handleBack = () => {
    setCurrentStep(1);
};

const resetForm = () => {
    setEventData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        date: '',
        time: '',
        venue: '',
        maxAttendee: '',
        image: null
    });
    setTickets([{
        name: '',
        description: '',
        price: '',
        quantity: '',
        currency: 'LKR',
        maxPerPurchase: 10,
        status: 'active'
        }]);
    setCurrentStep(1);
    };

const handleSubmit = async () => {
    setIsSubmitting(true);

try {
const token = localStorage.getItem('authToken');

if (!token) {
    alert('❌ No token found. Please log in again.');
    setIsSubmitting(false);
    return;
}

// Helper function to convert file to base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    });
};

// Prepare JSON payload
const payload = {
    ...eventData,
    tickets: tickets
};

// Convert image to base64 if it exists
if (eventData.image && eventData.image instanceof File) {
    try {
    const base64Image = await fileToBase64(eventData.image);
    payload.image = base64Image;
    } catch (error) {
    console.error('Error converting image to base64:', error);
    alert('Error processing image. Please try again.');
    setIsSubmitting(false);
    return;
    }
}

// Submit to backend
const response = await axios.post(
    'http://localhost:3000/api/org/create-event',
    payload,
    {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    timeout: 30000
    }
);

console.log('✅ Event created:', response.data);
alert('🎉 Event created successfully!');
resetForm();

} catch (error) {
console.error('Error creating event:', error);

if (error.response) {
    const message = error.response.data?.message || 'Failed to create event';
    alert(`Error: ${message}`);
} else if (error.request) {
    alert('Error: No response from server. Please check your connection.');
} else {
    alert('Error creating event. Please try again.');
}

} finally {
setIsSubmitting(false);
}
};

return (
<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8">
    {currentStep === 1 ? (
    <EventDetailsForm
        eventData={eventData}
        setEventData={setEventData}
        onNext={handleNext}
    />
    ) : (
    <TicketCreationForm
        eventData={eventData}
        tickets={tickets}
        setTickets={setTickets}
        onBack={handleBack}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
    />
    )}
    </div>
    );
};

export default CreateEventFlow;
