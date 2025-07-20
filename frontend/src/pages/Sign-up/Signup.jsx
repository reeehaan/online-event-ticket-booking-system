import React, { useState } from "react";
import {
User,
Mail,
Lock,
Phone,
Calendar,
Eye,
EyeOff,
Building,
MapPin,
Users,
ArrowLeft,
Check,
CreditCard,
Globe,
Camera
} from "lucide-react";

import  axios  from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

function SignupForm() {
const [currentStep, setCurrentStep] = useState('userType'); // 'userType', 'attendeeForm', 'organizerForm'
const [selectedUserType, setSelectedUserType] = useState('');
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const navigate = useNavigate();

const [attendeeForm, setAttendeeForm] = useState({
email: "",
password: "",
confirmPassword: "",
phone: "",
firstName: "",
lastName: "",
dateOfBirth: "",
interests: [],
location: ""
});

const [organizerForm, setOrganizerForm] = useState({
email: "",
password: "",
confirmPassword: "",
phone: "",
firstName: "",
lastName: "",
organizationName: "",
organizationType: "",
description: "",
address: "",
city: "",
});

const [errors, setErrors] = useState({});

const interestOptions = [
"Music & Concerts", "Sports", "Food & Dining", "Art & Culture",
"Technology", "Business", "Education", "Health & Wellness",
"Travel", "Photography", "Fashion", "Gaming"
];

const organizationTypes = [
"Event Management Company", "Corporate", "Non-Profit", "Educational Institution",
"Entertainment", "Sports Club", "Restaurant/Bar", "Art Gallery", "Other"
];

const handleUserTypeSelection = (type) => {
setSelectedUserType(type);
setCurrentStep(type === 'attendee' ? 'attendeeForm' : 'organizerForm');
};

const handleAttendeeInputChange = (e) => {
const { name, value } = e.target;
setAttendeeForm((prev) => ({
    ...prev,
    [name]: value,
}));
if (errors[name]) {
    setErrors((prev) => ({
    ...prev,
    [name]: "",
    }));
}
};

const handleOrganizerInputChange = (e) => {
const { name, value } = e.target;
if (name.startsWith('social.')) {
    const socialPlatform = name.split('.')[1];
    setOrganizerForm((prev) => ({
    ...prev,
    socialMediaLinks: {
        ...prev.socialMediaLinks,
        [socialPlatform]: value
    }
    }));
} else {
    setOrganizerForm((prev) => ({
    ...prev,
    [name]: value,
    }));
}
if (errors[name]) {
    setErrors((prev) => ({
    ...prev,
    [name]: "",
    }));
}
};

const handleInterestToggle = (interest) => {
setAttendeeForm((prev) => ({
    ...prev,
    interests: prev.interests.includes(interest)
    ? prev.interests.filter(i => i !== interest)
    : [...prev.interests, interest]
}));
};

const validateAttendeeForm = () => {
const newErrors = {};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!attendeeForm.email) newErrors.email = "Email is required";
else if (!emailRegex.test(attendeeForm.email)) newErrors.email = "Please enter a valid email";

if (!attendeeForm.password) newErrors.password = "Password is required";
else if (attendeeForm.password.length < 8) newErrors.password = "Password must be at least 8 characters";

if (attendeeForm.password !== attendeeForm.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

if (!attendeeForm.phone) newErrors.phone = "Phone number is required";
if (!attendeeForm.firstName.trim()) newErrors.firstName = "First name is required";
if (!attendeeForm.lastName.trim()) newErrors.lastName = "Last name is required";
if (!attendeeForm.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
if (!attendeeForm.location.trim()) newErrors.location = "Location is required";

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

const validateOrganizerForm = () => {
const newErrors = {};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!organizerForm.email) newErrors.email = "Email is required";
else if (!emailRegex.test(organizerForm.email)) newErrors.email = "Please enter a valid email";

if (!organizerForm.password) newErrors.password = "Password is required";
else if (organizerForm.password.length < 8) newErrors.password = "Password must be at least 8 characters";

if (organizerForm.password !== organizerForm.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

if (!organizerForm.phone) newErrors.phone = "Phone number is required";
if (!organizerForm.firstName.trim()) newErrors.firstName = "First name is required";
if (!organizerForm.lastName.trim()) newErrors.lastName = "Last name is required";
if (!organizerForm.organizationName.trim()) newErrors.organizationName = "Organization name is required";
if (!organizerForm.organizationType) newErrors.organizationType = "Organization type is required";

if (!organizerForm.address.trim()) newErrors.address = "Address is required";
if (!organizerForm.city.trim()) newErrors.city = "City is required";
if (!organizerForm.description.trim()) newErrors.description = "Organization description is required";

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

//registration function 
const handleRegistration = async (formData, userType) => {
setIsLoading(true);
try {
    const response = await axios.post('http://localhost:3000/api/user/register', {
    ...formData,
    userType: userType
    });
    
    if (response.status === 200 || response.status === 201) {
    toast.success(`${userType} registration successful! Redirecting to login...`);
    
    setTimeout(() => {
        navigate('/login');
    }, 2000);
    }
    
} catch (error) {
    console.error('Registration error:', error);
    
    if (error.response) {
    toast.error(`Registration failed: ${error.response.data.message || 'Please try again'}`);
    } else if (error.request) {
    toast.error('Network error. Please check your connection and try again.');
    } else {
    toast.error('Registration failed. Please try again.');
    }
} finally {
    setIsLoading(false);
}
};
const handleAttendeeSubmit = async (e) => {
    e.preventDefault();
        if (validateAttendeeForm()) {
        await handleRegistration(attendeeForm, 'attendee');
    }
};

const handleOrganizerSubmit = async (e) => {
    e.preventDefault();
    if (validateOrganizerForm()) {
        await handleRegistration(organizerForm, 'organizer');
    }
};

const goBack = () => {
setCurrentStep('userType');
setSelectedUserType('');
setErrors({});
};

// User Type Selection Screen
if (currentStep === 'userType') {
return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-12 px-4">
    <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to IslandEntry</h1>
        <p className="text-xl text-gray-600">Choose how you'd like to join our community</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Attendee Card */}
        <div 
            onClick={() => handleUserTypeSelection('attendee')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-blue-200"
        >
            <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm an Attendee</h2>
            <p className="text-gray-600 mb-6">Join as an event attendee to discover and book amazing events happening around you.</p>
            
            <div className="text-left space-y-3 mb-8">
                <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                <span className="text-sm">Browse and discover events</span>
                </div>
                <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                <span className="text-sm">Easy booking and payment</span>
                </div>
                <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                <span className="text-sm">Personalized recommendations</span>
                </div>
                <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                <span className="text-sm">Connect with like-minded people</span>
                </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all">
                Join as Attendee
            </button>
            </div>
        </div>

        {/* Organizer Card */}
        <div 
            onClick={() => handleUserTypeSelection('organizer')}
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-purple-200"
        >
            <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">I'm an Organizer</h2>
            <p className="text-gray-600 mb-6">Join as an event organizer to create, manage, and promote your events to a wider audience.</p>
            
            <div className="text-left space-y-3 mb-8">
                <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                <span className="text-sm">Create and manage events</span>
                </div>
                <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                <span className="text-sm">Advanced analytics and insights</span>
                </div>
                <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                <span className="text-sm">Marketing and promotional tools</span>
                </div>
                <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                <span className="text-sm">Secure payment processing</span>
                </div>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all">
                Join as Organizer
            </button>
            </div>
        </div>
        </div>
    </div>
    </div>
);
}

// Attendee Form
if (currentStep === 'attendeeForm') {
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
    <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <button 
            onClick={goBack}
            className="text-white hover:text-blue-100 mb-4 flex items-center"
            >
            <ArrowLeft size={20} className="mr-2" />
            Back to selection
            </button>
            <h1 className="text-3xl font-bold text-white">Join as Attendee</h1>
            <p className="text-blue-100 mt-2">Create your account to start discovering events</p>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleAttendeeSubmit}>
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                type="text"
                name="firstName"
                value={attendeeForm.firstName}
                onChange={handleAttendeeInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                type="text"
                name="lastName"
                value={attendeeForm.lastName}
                onChange={handleAttendeeInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
            </div>

            {/* Date of Birth */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                type="date"
                name="dateOfBirth"
                value={attendeeForm.dateOfBirth}
                onChange={handleAttendeeInputChange}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                }`}
                />
            </div>
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>

            {/* Contact Information */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                type="email"
                name="email"
                value={attendeeForm.email}
                onChange={handleAttendeeInputChange}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email address"
                />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                type="tel"
                name="phone"
                value={attendeeForm.phone}
                onChange={handleAttendeeInputChange}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your phone number"
                />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Location */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                type="text"
                name="location"
                value={attendeeForm.location}
                onChange={handleAttendeeInputChange}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.location ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your city/location"
                />
            </div>
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Interests */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests (Optional)</label>
            <p className="text-sm text-gray-500 mb-4">Select your interests to get personalized event recommendations</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {interestOptions.map((interest) => (
                <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    attendeeForm.interests.includes(interest)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {interest}
                </button>
                ))}
            </div>
            </div>

            {/* Password Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={attendeeForm.password}
                    onChange={handleAttendeeInputChange}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Create a password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={attendeeForm.confirmPassword}
                    onChange={handleAttendeeInputChange}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Confirm your password"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-3">
            <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                Terms of Service
                </a>{' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                Privacy Policy
                </a>
            </label>
            </div>

            <button
            onClick={() => handleAttendeeSubmit}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
            Create Account
            </button>
        </form>
        </div>
    </div>
    <ToastContainer position="bottom-center" autoClose={2000} />
    </div>
);
}

// Organizer Form
if (currentStep === 'organizerForm') {
return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-12 px-4">
    <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
            <button 
            onClick={goBack}
            className="text-white hover:text-purple-100 mb-4 flex items-center"
            >
            <ArrowLeft size={20} className="mr-2" />
            Back to selection
            </button>
            <h1 className="text-3xl font-bold text-white">Join as Organizer</h1>
            <p className="text-purple-100 mt-2">Create your organizer account to start hosting events</p>
        </div>

        <form className="p-8 space-y-8" onSubmit={handleOrganizerSubmit}>
            {/* Personal Information Section */}
            <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 text-purple-600" size={20} />
                Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                    type="text"
                    name="firstName"
                    value={organizerForm.firstName}
                    onChange={handleOrganizerInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                    type="text"
                    name="lastName"
                    value={organizerForm.lastName}
                    onChange={handleOrganizerInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type="email"
                    name="email"
                    value={organizerForm.email}
                    onChange={handleOrganizerInputChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                    />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type="tel"
                    name="phone"
                    value={organizerForm.phone}
                    onChange={handleOrganizerInputChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your phone number"
                    />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
            </div>
            </div>

            {/* Organization Information */}
            <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2 text-purple-600" size={20} />
                Organization Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                <input
                    type="text"
                    name="organizationName"
                    value={organizerForm.organizationName}
                    onChange={handleOrganizerInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.organizationName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter organization name"
                />
                {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type *</label>
                <select
                    name="organizationType"
                    value={organizerForm.organizationType}
                    onChange={handleOrganizerInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.organizationType ? "border-red-500" : "border-gray-300"
                    }`}
                >
                    <option value="">Select organization type</option>
                    {organizationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                {errors.organizationType && <p className="text-red-500 text-sm mt-1">{errors.organizationType}</p>}
                </div>
            </div>

            

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Description *</label>
                <textarea
                name="description"
                value={organizerForm.description}
                onChange={handleOrganizerInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe your organization and the types of events you organize..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            </div>

            {/* Address Information */}
            <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 text-purple-600" size={20} />
                Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                    type="text"
                    name="address"
                    value={organizerForm.address}
                    onChange={handleOrganizerInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                    type="text"
                    name="city"
                    value={organizerForm.city}
                    onChange={handleOrganizerInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your city"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
            </div>
            </div>

            

            {/* Password Section */}
            <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="mr-2 text-purple-600" size={20} />
                Account Security
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={organizerForm.password}
                    onChange={handleOrganizerInputChange}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Create a password"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={organizerForm.confirmPassword}
                    onChange={handleOrganizerInputChange}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Confirm your password"
                    />
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-start space-x-3">
                <input
                type="checkbox"
                id="organizerTerms"
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                required
                />
                <label htmlFor="organizerTerms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-purple-600 hover:text-purple-500 font-medium">
                    Terms of Service
                </a>,{' '}
                <a href="#" className="text-purple-600 hover:text-purple-500 font-medium">
                    Privacy Policy
                </a>, and{' '}
                <a href="#" className="text-purple-600 hover:text-purple-500 font-medium">
                    Organizer Guidelines
                </a>
                </label>
            </div>
            <div className="flex items-start space-x-3 mt-3">
                <input
                type="checkbox"
                id="verification"
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                required
                />
                <label htmlFor="verification" className="text-sm text-gray-600">
                I understand that my organizer account will be subject to verification and approval before I can create events.
                </label>
            </div>
            </div>

            <button
            onClick={()=> handleOrganizerSubmit}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
            Create  Account
            </button>

            <div className="text-center">
            <p className="text-sm text-gray-600">
                Your account will be reviewed within 24 hours. You'll receive an email notification once approved.
            </p>
            </div>
        </form>
        </div>
    </div>
    <ToastContainer position="bottom-center" autoClose={2000} />
    </div>

);
}

return null;
}

export default SignupForm;