import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPasswordForm() {
const [step, setStep] = useState(1); // 1: email verification, 2: password reset, 3: success
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const [form, setForm] = useState({
email: "",
password: "",
confirmPassword: ""
});

const [errors, setErrors] = useState({});

const navigate = useNavigate();

const handleInputChange = (e) => {
const { name, value } = e.target;
setForm(prev => ({
    ...prev,
    [name]: value
}));

// Clear error for the field being edited
if (errors[name]) {
    setErrors(prev => ({
    ...prev,
    [name]: ""
    }));
}
};

const validateEmail = () => {
const newErrors = {};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!form.email) {
    newErrors.email = "Email is required";
} else if (!emailRegex.test(form.email)) {
    newErrors.email = "Please enter a valid email address";
}

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

const validatePasswords = () => {
const newErrors = {};

if (!form.password) {
    newErrors.password = "Password is required";
} else if (form.password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
}

if (!form.confirmPassword) {
    newErrors.confirmPassword = "Please confirm your password";
} else if (form.password !== form.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
}

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

const handleEmailVerification = async () => {
if (!validateEmail()) return;

setIsLoading(true);

try {
    const response = await axios.post('http://localhost:3000/api/user/forget-password', {
    email: form.email,
    step: 'verify_email'
    });

    if (response.data.success) {
    setStep(2); // Move to password reset step
    } else {
    setErrors({ email: response.data.message });
    }
} catch (error) {
    console.error('Email verification error:', error);
    const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
    setErrors({ email: errorMessage });
} finally {
    setIsLoading(false);
}
};

const handlePasswordReset = async () => {
if (!validatePasswords()) return;

setIsLoading(true);

try {
    const response = await axios.post('http://localhost:3000/api/user/forget-password', {
    email: form.email,
    password: form.password,
    step: 'reset_password'
    });

    if (response.data.success) {
    setStep(3); // Move to success step
    } else {
    setErrors({ password: response.data.message });
    }
} catch (error) {
    console.error('Password reset error:', error);
    const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
    setErrors({ password: errorMessage });
} finally {
    setIsLoading(false);
}
};

const handleBackToLogin = () => {
// Reset form and redirect to login
setForm({
    email: "",
    password: "",
    confirmPassword: ""
});
setStep(1);

navigate('/login');
};

const handleBackToEmail = () => {
setStep(1);
setErrors({});
};

// Success Screen
if (step === 3) {
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 flex items-center justify-center">
    <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white text-center">Password Reset</h1>
        </div>
        
        <div className="p-8 text-center">
            <div className="mb-6">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Password Reset Successfully!</h2>
            <p className="text-gray-600 mb-4">
                Your password has been updated for:
            </p>
            <p className="font-medium text-blue-600 mb-6">{form.email}</p>
            <p className="text-sm text-gray-500 mb-6">
                You can now sign in with your new password.
            </p>
            </div>

            <button
            onClick={handleBackToLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
            Sign In Now
            </button>
        </div>
        </div>
    </div>
    </div>
);
}

return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 flex items-center justify-center">
    <div className="max-w-md mx-auto">
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 px-8 py-6">
        <h1 className="text-2xl font-bold text-white text-center">
            {step === 1 ? "Forgot Password" : "Reset Password"}
        </h1>
        <p className="text-blue-100 text-center mt-2">
            {step === 1 
            ? "Enter your email to verify your account" 
            : "Create your new password"
            }
        </p>
        </div>

        <div className="p-8">
        {step === 1 && (
            <>
            <div className="mb-6">
                <p className="text-gray-600 text-center">
                Enter your email address to verify your account and reset your password.
                </p>
            </div>

            <div className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                    disabled={isLoading}
                    />
                </div>
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
                </div>

                <button
                onClick={handleEmailVerification}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying Email...
                    </div>
                ) : (
                    "Verify Email"
                )}
                </button>
            </div>

            <div className="mt-6 text-center">
                <button
                onClick={handleBackToLogin}
                className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
                >
                <ArrowLeft size={16} className="mr-1" />
                Back to Sign In
                </button>
            </div>
            </>
        )}

        {step === 2 && (
            <>
            <div className="mb-6">
                <p className="text-gray-600 text-center mb-2">
                Email verified! Now create your new password for:
                </p>
                <p className="font-medium text-blue-600 text-center">{form.email}</p>
            </div>

            <div className="space-y-6">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your new password"
                    disabled={isLoading}
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Confirm your new password"
                    disabled={isLoading}
                    />
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
                </div>

                <button
                onClick={handlePasswordReset}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating Password...
                    </div>
                ) : (
                    "Update Password"
                )}
                </button>
            </div>

            <div className="mt-6 text-center">
                <button
                onClick={handleBackToEmail}
                className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
                >
                <ArrowLeft size={16} className="mr-1" />
                Back to Email
                </button>
            </div>
            </>
        )}

        {step === 1 && (
            <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <button
                onClick={() => console.log('Navigate to sign up')}
                className="text-blue-600 hover:text-blue-500 font-medium"
                >
                Create one here
                </button>
            </p>
            </div>
        )}
        </div>
    </div>
    </div>
</div>
);
}

export default ForgotPasswordForm;