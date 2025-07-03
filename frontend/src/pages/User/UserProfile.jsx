import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, X } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';

function UserProfile() {
const [formData, setFormData] = useState({
firstName: 'Rehan',
lastName: 'Hansaja',
dateOfBirth: '2002-11-04',
email: 'rehan22104@gmail.com',
country: 'Sri Lanka',
contactNumber: '712066122',
});

const [originalData] = useState({ ...formData });
const [hasChanges, setHasChanges] = useState(false);
const [toast, setToast] = useState(null);
const [isSaving, setIsSaving] = useState(false);
const [showDropdown, setShowDropdown] = useState(false);

const countryCodes = {
'Sri Lanka': { code: '+94', flagClass: 'fi fi-lk' },
India: { code: '+91', flagClass: 'fi fi-in' },
'United States': { code: '+1', flagClass: 'fi fi-us' },
'United Kingdom': { code: '+44', flagClass: 'fi fi-gb' },
Canada: { code: '+1', flagClass: 'fi fi-ca' },
Australia: { code: '+61', flagClass: 'fi fi-au' },
};

const currentCountryData = countryCodes[formData.country] || countryCodes['Sri Lanka'];

const showToast = (message, type = 'success') => {
setToast({ message, type });
setTimeout(() => setToast(null), 3000);
};

const handleInputChange = (field, value) => {
const newFormData = { ...formData, [field]: value };
setFormData(newFormData);
const changed = Object.keys(newFormData).some(
    (key) => newFormData[key] !== originalData[key]
);
setHasChanges(changed);
};

const handleDiscard = () => {
setFormData(originalData);
setHasChanges(false);
};

const handleSave = async () => {
setIsSaving(true);
try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const success = Math.random() > 0.2;

    if (success) {
    const fullContactNumber = `${currentCountryData.code}${formData.contactNumber}`;
    const updatedData = { ...formData, contactNumber: fullContactNumber };
    console.log('Updated data:', updatedData);
    setHasChanges(false);
    showToast('Profile updated successfully!', 'success');
    } else {
    throw new Error('Failed to save');
    }
} catch {
    showToast('Failed to save changes. Please try again.', 'error');
} finally {
    setIsSaving(false);
}
};

const closeToast = () => setToast(null);

return (
<div className="max-w-4xl mx-auto p-6 bg-white mt-15 mb-40">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

    <div className="bg-gray-50 rounded-lg p-6">
    <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">My Details</h2>
        <div className="flex gap-3">
        {hasChanges && (
            <button
            onClick={handleDiscard}
            disabled={isSaving}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Discard
            </button>
        )}
        <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {isSaving ? (
            <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
            </>
            ) : (
            'Save'
            )}
        </button>
        </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
        <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
        <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
        <div className="relative">
            <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
        <div className="flex items-center relative">
            <div className="relative">
            <button
                className="flex items-center gap-2 px-3 py-3 bg-gray-100 border border-gray-300 rounded-l-lg focus:outline-none text-sm font-medium"
                onClick={(e) => {
                e.preventDefault();
                setShowDropdown((prev) => !prev);
                }}
            >
                <span className={`${currentCountryData.flagClass} w-5 h-4 rounded-sm`} />
                <span>{currentCountryData.code}</span>
            </button>

            {showDropdown && (
                <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-y-auto w-56">
                {Object.entries(countryCodes).map(([country, data]) => (
                    <div
                    key={country}
                    onClick={() => {
                        handleInputChange('country', country);
                        setShowDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                    <span className={`${data.flagClass} w-5 h-4 rounded-sm`} />
                    <span className="text-sm">{`${data.code} ${country}`}</span>
                    </div>
                ))}
                </div>
            )}
            </div>

            <input
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
            placeholder="Enter phone number"
            className="flex-1 px-3 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
        </div>
        </div>

        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
        <select
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
        >
            {Object.keys(countryCodes).map((country) => (
            <option key={country} value={country}>
                {country}
            </option>
            ))}
        </select>
        </div>
    </div>
    </div>

    {toast && (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
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
        <button onClick={closeToast} className="ml-2 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
        </button>
        </div>
    </div>
    )}
</div>
);
}

export default UserProfile;
