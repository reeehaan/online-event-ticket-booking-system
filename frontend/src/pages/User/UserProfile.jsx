import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle, XCircle, X, User, CreditCard, Bell, Shield, 
  MapPin, Heart, Settings, Camera, Eye, EyeOff, Plus, Trash2, 
  Edit3, Globe, Smartphone, Mail, Lock, Star, Gift, Users
} from 'lucide-react';
// Using fetch API instead of axios
import 'flag-icons/css/flag-icons.min.css';

function UserProfile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Personal Information State - will be populated from API
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    gender: '',
    country: 'Sri Lanka',
    city: '',
    address: '',
    postalCode: '',
    contactNumber: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    bio: '',
    website: '',
    profilePicture: null
  });

  // Payment Methods State - these would come from a separate payment API
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      last4: '4532',
      brand: 'visa',
      expiryMonth: '12',
      expiryYear: '2026',
      isDefault: true,
      holderName: 'Rehan Hansaja'
    },
    {
      id: 2,
      type: 'card',
      last4: '1234',
      brand: 'mastercard',
      expiryMonth: '09',
      expiryYear: '2025',
      isDefault: false,
      holderName: 'Rehan Hansaja'
    }
  ]);

  // Preferences State - will be populated from API
  const [preferences, setPreferences] = useState({
    favoriteCategories: [],
    emailNotifications: {
      eventReminders: true,
      newEvents: true,
      priceDrops: true,
      marketing: false,
      weeklyDigest: true
    },
    smsNotifications: {
      eventReminders: true,
      ticketUpdates: true,
      emergencyAlerts: true
    },
    privacy: {
      publicProfile: false,
      showAttendingEvents: true,
      allowFriendRequests: true
    },
    accessibility: {
      wheelchairAccess: false,
      signLanguage: false,
      audioDescription: false
    },
    language: 'English',
    timezone: 'Asia/Colombo',
    currency: 'LKR'
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginAlerts: true
  });

  const countryCodes = {
    'Sri Lanka': { code: '+94', flagClass: 'fi fi-lk' },
    'India': { code: '+91', flagClass: 'fi fi-in' },
    'United States': { code: '+1', flagClass: 'fi fi-us' },
    'United Kingdom': { code: '+44', flagClass: 'fi fi-gb' },
    'Canada': { code: '+1', flagClass: 'fi fi-ca' },
    'Australia': { code: '+61', flagClass: 'fi fi-au' },
  };

  const eventCategories = [
    'Concert', 'DJ', 'Electronic', 'Festival', 'Theater', 'Comedy', 
    'Workshop', 'Educational', 'Spiritual', 'Sports', 'Art', 'Food'
  ];

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  // API Configuration
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const API_BASE_URL = 'http://localhost:3000/api/attendee-profile';

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        const profile = data.data;
        
        // Map API data to component state
        setPersonalData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
          location: profile.location || '',
          gender: profile.gender || '',
          country: profile.country || 'Sri Lanka',
          city: profile.city || '',
          address: profile.address || '',
          postalCode: profile.postalCode || '',
          contactNumber: profile.phone || '',
          emergencyContact: {
            name: profile.emergencyContact?.name || '',
            phone: profile.emergencyContact?.phone || '',
            relationship: profile.emergencyContact?.relationship || ''
          },
          bio: profile.bio || '',
          website: profile.website || '',
          profilePicture: profile.profilePicture || null
        });

        setPreferences({
          favoriteCategories: profile.preferences?.favoriteCategories || [],
          emailNotifications: profile.notifications?.email || {
            eventReminders: true,
            newEvents: true,
            priceDrops: true,
            marketing: false,
            weeklyDigest: true
          },
          smsNotifications: profile.notifications?.sms || {
            eventReminders: true,
            ticketUpdates: true,
            emergencyAlerts: true
          },
          privacy: profile.privacy || {
            publicProfile: false,
            showAttendingEvents: true,
            allowFriendRequests: true
          },
          accessibility: profile.preferences?.accessibility || {
            wheelchairAccess: false,
            signLanguage: false,
            audioDescription: false
          },
          language: profile.preferences?.language || 'English',
          timezone: profile.preferences?.timezone || 'Asia/Colombo',
          currency: profile.preferences?.currency || 'LKR'
        });

        setSecurityData(prev => ({
          ...prev,
          twoFactorEnabled: profile.security?.twoFactorEnabled || false,
          loginAlerts: profile.security?.loginAlerts || true
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to load profile data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (section) => {
    setIsSaving(true);
    try {
      let endpoint = '';
      let data = {};

      switch (section) {
        case 'Personal Information':
          endpoint = `${API_BASE_URL}/profile/personal`;
          data = {
            firstName: personalData.firstName,
            lastName: personalData.lastName,
            phone: personalData.phone,
            dateOfBirth: personalData.dateOfBirth,
            location: personalData.location,
            gender: personalData.gender,
            country: personalData.country,
            city: personalData.city,
            address: personalData.address,
            postalCode: personalData.postalCode,
            emergencyContact: personalData.emergencyContact,
            bio: personalData.bio,
            website: personalData.website,
            profilePicture: personalData.profilePicture
          };
          break;

        case 'Preferences':
          endpoint = `${API_BASE_URL}/profile/preferences`;
          data = {
            favoriteCategories: preferences.favoriteCategories,
            accessibility: preferences.accessibility,
            language: preferences.language,
            timezone: preferences.timezone,
            currency: preferences.currency
          };
          break;

        case 'Notification Preferences':
          endpoint = `${API_BASE_URL}/profile/notifications`;
          data = {
            email: preferences.emailNotifications,
            sms: preferences.smsNotifications
          };
          break;

        case 'Security':
          endpoint = `${API_BASE_URL}/profile/security`;
          data = {
            twoFactorEnabled: securityData.twoFactorEnabled,
            loginAlerts: securityData.loginAlerts
          };
          break;

        case 'Password':
          endpoint = `${API_BASE_URL}/profile/change-password`;
          data = {
            currentPassword: securityData.currentPassword,
            newPassword: securityData.newPassword,
            confirmPassword: securityData.confirmPassword
          };
          break;

        default:
          throw new Error('Unknown section');
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        showToast(`${section} updated successfully!`, 'success');
        
        // Clear password fields after successful password change
        if (section === 'Password') {
          setSecurityData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
        }
      } else {
        throw new Error(result.message || 'Update failed');
      }

    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      const errorMessage = error.message || 'Failed to save changes. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setPersonalData(prev => ({ ...prev, profilePicture: base64String }));
        
        // Automatically save the profile picture
        uploadProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (base64String) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/upload-image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          profilePicture: base64String
        })
      });

      const result = await response.json();

      if (result.success) {
        showToast('Profile picture updated successfully!', 'success');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.message || 'Failed to upload profile picture';
      showToast(errorMessage, 'error');
      
      // Revert the profile picture on error
      setPersonalData(prev => ({ ...prev, profilePicture: null }));
    }
  };

  const removeProfilePicture = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/image`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPersonalData(prev => ({ ...prev, profilePicture: null }));
        showToast('Profile picture removed successfully!', 'success');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      showToast('Failed to remove profile picture', 'error');
    }
  };

  const toggleCategory = (category) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCategories: prev.favoriteCategories.includes(category)
        ? prev.favoriteCategories.filter(c => c !== category)
        : [...prev.favoriteCategories, category]
    }));
  };

  const removePaymentMethod = (id) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    showToast('Payment method removed successfully!', 'success');
  };

  const setDefaultPaymentMethod = (id) => {
    setPaymentMethods(prev => 
      prev.map(method => ({ 
        ...method, 
        isDefault: method.id === id 
      }))
    );
    showToast('Default payment method updated!', 'success');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white mt-20 mb-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderPersonalInfo = () => (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {personalData.profilePicture ? (
              <img 
                src={personalData.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  console.error('Error loading profile image');
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {personalData.firstName && personalData.lastName 
                  ? `${personalData.firstName[0]}${personalData.lastName[0]}` 
                  : 'U'}
              </div>
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
          {personalData.profilePicture && (
            <button
              onClick={removeProfilePicture}
              className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full cursor-pointer hover:bg-red-700 transition-colors"
              title="Remove profile picture"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{personalData.firstName} {personalData.lastName}</h3>
          <p className="text-gray-600">Member since August 2024</p>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">Premium Member</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={personalData.firstName}
            onChange={(e) => setPersonalData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={personalData.lastName}
            onChange={(e) => setPersonalData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
            <span className="text-xs text-gray-500 ml-2">(Cannot be changed)</span>
          </label>
          <input
            type="email"
            value={personalData.email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed outline-none"
            title="Email address cannot be changed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={personalData.dateOfBirth}
            onChange={(e) => setPersonalData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={personalData.gender}
            onChange={(e) => setPersonalData(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
          <div className="flex">
            <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
              <span className={`${countryCodes[personalData.country]?.flagClass || 'fi fi-lk'} w-5 h-4 rounded-sm mr-2`} />
              <span className="text-sm">{countryCodes[personalData.country]?.code || '+94'}</span>
            </div>
            <input
              type="tel"
              value={personalData.contactNumber}
              onChange={(e) => setPersonalData(prev => ({ ...prev, contactNumber: e.target.value }))}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <select
            value={personalData.country}
            onChange={(e) => setPersonalData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            {Object.keys(countryCodes).map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={personalData.city}
            onChange={(e) => setPersonalData(prev => ({ ...prev, city: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={personalData.address}
            onChange={(e) => setPersonalData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
          <input
            type="text"
            value={personalData.emergencyContact.name}
            onChange={(e) => setPersonalData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, name: e.target.value }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Number</label>
          <input
            type="tel"
            value={personalData.emergencyContact.phone}
            onChange={(e) => setPersonalData(prev => ({ 
              ...prev, 
              emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={personalData.bio}
            onChange={(e) => setPersonalData(prev => ({ ...prev, bio: e.target.value }))}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            placeholder="Tell others about yourself..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('Personal Information')}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-gray-600">Manage your saved payment methods</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${
                method.brand === 'visa' ? 'bg-blue-600' : 'bg-red-600'
              }`}>
                {method.brand.toUpperCase()}
              </div>
              <div>
                <div className="font-medium">•••• •••• •••• {method.last4}</div>
                <div className="text-sm text-gray-600">
                  Expires {method.expiryMonth}/{method.expiryYear} • {method.holderName}
                </div>
              </div>
              {method.isDefault && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Default
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!method.isDefault && (
                <button
                  onClick={() => setDefaultPaymentMethod(method.id)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Set Default
                </button>
              )}
              <button
                onClick={() => removePaymentMethod(method.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Preferences</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Favorite Event Categories</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {eventCategories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  preferences.favoriteCategories.includes(category)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility Requirements</h3>
        <div className="space-y-3">
          {Object.entries(preferences.accessibility).map(([key, value]) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  accessibility: { ...prev.accessibility, [key]: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                {key === 'wheelchairAccess' && 'Wheelchair Access Required'}
                {key === 'signLanguage' && 'Sign Language Interpretation'}
                {key === 'audioDescription' && 'Audio Description Services'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="English">English</option>
            <option value="Sinhala">Sinhala</option>
            <option value="Tamil">Tamil</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={preferences.currency}
            onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="LKR">Sri Lankan Rupee (LKR)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('Preferences')}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={securityData.newPassword}
              onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={securityData.confirmPassword}
              onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            onClick={() => handleSave('Password')}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityData.twoFactorEnabled}
                onChange={(e) => setSecurityData(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Login Alerts</div>
              <div className="text-sm text-gray-600">Get notified when someone logs into your account</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityData.loginAlerts}
                onChange={(e) => setSecurityData(prev => ({ ...prev, loginAlerts: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => handleSave('Security')}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              'Save Security Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(preferences.emailNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  {key === 'eventReminders' && 'Event Reminders'}
                  {key === 'newEvents' && 'New Events in Your Area'}
                  {key === 'priceDrops' && 'Price Drop Alerts'}
                  {key === 'marketing' && 'Marketing & Promotional Emails'}
                  {key === 'weeklyDigest' && 'Weekly Event Digest'}
                </div>
                <div className="text-sm text-gray-600">
                  {key === 'eventReminders' && 'Get reminded about upcoming events you\'ve booked'}
                  {key === 'newEvents' && 'Be the first to know about new events'}
                  {key === 'priceDrops' && 'Get notified when ticket prices drop'}
                  {key === 'marketing' && 'Special offers and promotional content'}
                  {key === 'weeklyDigest' && 'Weekly roundup of events you might like'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    emailNotifications: { ...prev.emailNotifications, [key]: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
        <div className="space-y-4">
          {Object.entries(preferences.smsNotifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  {key === 'eventReminders' && 'Event Reminders'}
                  {key === 'ticketUpdates' && 'Ticket Updates'}
                  {key === 'emergencyAlerts' && 'Emergency Alerts'}
                </div>
                <div className="text-sm text-gray-600">
                  {key === 'eventReminders' && 'SMS reminders for upcoming events'}
                  {key === 'ticketUpdates' && 'Updates about your tickets and bookings'}
                  {key === 'emergencyAlerts' && 'Important alerts about event changes'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    smsNotifications: { ...prev.smsNotifications, [key]: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('Notification Preferences')}
          disabled={isSaving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalInfo();
      case 'payments': return renderPaymentMethods();
      case 'preferences': return renderPreferences();
      case 'security': return renderSecurity();
      case 'notifications': return renderNotifications();
      default: return renderPersonalInfo();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white mt-20 mb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 rounded-lg p-6 lg:p-8">
          {renderTabContent()}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
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
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;