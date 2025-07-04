import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LoginForm() {
const [showPassword, setShowPassword] = useState(false);
const [form, setForm] = useState({
email: '',
password: '',
rememberMe: false
});
const [errors, setErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);
const navigate = useNavigate();

const handleInputChange = (e) => {
const { name, value, type, checked } = e.target;
setForm(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
}));
if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
}
};

const validateForm = () => {
const newErrors = {};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!form.email) {
    newErrors.email = 'Email is required';
} else if (!emailRegex.test(form.email)) {
    newErrors.email = 'Please enter a valid email';
}

if (!form.password) {
    newErrors.password = 'Password is required';
}

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
e.preventDefault();
if (!validateForm()) return;

setIsLoading(true);
try {
    const response = await axios.post('http://localhost:3000/api/user/login', {
    email: form.email,
    password: form.password
    });

    const { token, userType, fullname } = response.data;

    // Store authentication data
    localStorage.setItem("authToken", token);
    localStorage.setItem("userType", userType);
    localStorage.setItem("fullName", fullname);

    // Navigate based on userType
    if (userType === "organizer") {
    navigate("/organizer-dashboard", { replace: true });
    } else if (userType === "attendee") {
    navigate("/", { replace: true });
    } else {
    setErrors({ general: "Unknown user type received" });
    }

} catch (error) {
    console.error('Login error:', error);
    
    // Handle different error types
    if (error.response?.status === 401) {
    setErrors({ general: "Invalid email or password" });
    } else if (error.response?.status === 400) {
    setErrors({ general: "Please check your credentials" });
    } else {
    setErrors({ general: "Login failed. Please try again." });
    }
} finally {
    setIsLoading(false);
}
};

return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center mt-10">
    <div className="max-w-md w-full">
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 px-8 py-6">
        <h1 className="text-3xl font-bold text-white text-center">Welcome Back</h1>
        <p className="text-blue-100 text-center mt-2">Sign in to your IslandEntry account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pb-6 space-y-6">
        {/* General error message */}
        {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
        )}

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
                } ${isLoading ? 'bg-gray-50' : ''}`}
                placeholder="Enter your email address"
            />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.password ? 'border-red-500' : 'border-gray-300'
                } ${isLoading ? 'bg-gray-50' : ''}`}
                placeholder="Enter your password"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span>Remember me</span>
            </label>
            <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium cursor-pointer disabled:opacity-50"
            >
            Forgot password?
            </button>
        </div>

        <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
            {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="text-center pb-4 mt-4">
            <p className="text-gray-600">
            Don't have an account?{" "}
            <button
                type="button"
                onClick={() => navigate("/sign-up")}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer disabled:opacity-50"
            >
                Create one here
            </button>
            </p>
        </div>
        </form>
    </div>

    <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
        Protected by industry-standard encryption
        </p>
    </div>
    </div>
</div>
);
}

export default LoginForm;