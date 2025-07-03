import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LoginForm() {
const [showPassword, setShowPassword] = useState(false);
const [form, setForm] = useState({
email: '',
password: '',
rememberMe: false
});
const [errors, setErrors] = useState({});
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

// ❗ Replace this with real API call
const fakeLoginAPI = async (form) => {
return new Promise((resolve) => {
    setTimeout(() => {
    const mockRole = form.email.includes("org") ? "organizer" : "attendee";
    resolve({ token: "sampleToken123", role: mockRole });
    }, 1000);
});
};

const handleSubmit = async (e) => {
e.preventDefault();
if (validateForm()) {
    try {
    const response = await fakeLoginAPI(form);
    const { token, role } = response;

    // Save token to localStorage or cookies
    localStorage.setItem("authToken", token);

    // Navigate based on role
    if (role === "organizer") {
        navigate("/organizer/dashboard");
    } else if (role === "attendee") {
        navigate("/events-page");
    } else {
        alert("Unknown user role");
    }
    } catch (error) {
    alert("Login failed. Please try again.");
    }
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
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your password"
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

        <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span>Remember me</span>
            </label>
            <a
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
            >
            Forgot password?
            </a>
        </div>

        <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
            Sign In
        </button>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                {/* Google Icon */}
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="ml-2">Google</span>
            </button>

            <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                {/* Facebook Icon */}
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="ml-2">Facebook</span>
            </button>
        </div>
        </form>

        <div className="text-center pb-4">
        <p className="text-gray-600">
            Don't have an account?{" "}
            <a
            onClick={() => navigate("/sign-up")}
            className="text-blue-600 hover:text-blue-500 font-medium cursor-pointer"
            >
            Create one here
            </a>
        </p>
        </div>
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
