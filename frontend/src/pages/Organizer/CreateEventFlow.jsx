import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, X } from 'lucide-react';
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
const [toast, setToast] = useState(null);

const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
};

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
    showToast('No token found. Please log in again.', 'error');
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
    showToast('Error processing image. Please try again.', 'error');
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
showToast('🎉 Event created successfully!', 'success');
resetForm();

} catch (error) {
console.error('Error creating event:', error);

if (error.response) {
    const message = error.response.data?.message || 'Failed to create event';
    showToast(message, 'error');
} else if (error.request) {
    showToast('No response from server. Please check your connection.', 'error');
} else {
    showToast('Error creating event. Please try again.', 'error');
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

    {/* Toast Notification */}
    {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div
                className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
                    toast.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}
            >
                {toast.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">{toast.message}</span>
                <button 
                    onClick={() => setToast(null)} 
                    className="ml-2 hover:opacity-70 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )}
    </div>
    );
};

export default CreateEventFlow;
