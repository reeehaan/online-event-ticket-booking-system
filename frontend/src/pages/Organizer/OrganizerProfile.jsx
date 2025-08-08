import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle, XCircle, X, User, CreditCard, Bell, Shield, 
  Building, Settings, Camera, Eye, EyeOff, Trash2, 
  Globe, Smartphone, Mail, Lock, Star, Users, DollarSign,
  Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';
import axios from 'axios';

function OrganizerProfile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Personal Information State
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    location: '',
    organizationName: '',
    organizationType: 'individual',
    bio: '',
    website: '',
    profilePicture: null,
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  // Business Details State
  const [businessData, setBusinessData] = useState({
    businessRegistrationNumber: '',
    taxIdNumber: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Sri Lanka'
    },
    contactDetails: {
      primaryPhone: '',
      alternatePhone: '',
      businessEmail: '',
      supportEmail: ''
    }
  });

  // Banking Details State
  const [bankingData, setBankingData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    routingNumber: '',
    swiftCode: ''
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    eventCategories: [],
    defaultCurrency: 'LKR',
    defaultTimezone: 'Asia/Colombo',
    language: 'English',
    autoApproveTickets: true,
    allowRefunds: true,
    refundPolicy: '',
    emailNotifications: {
      newTicketSales: true,
      eventUpdates: true,
      paymentNotifications: true,
      systemAlerts: true,
      marketingEmails: false,
      weeklyReports: true
    },
    smsNotifications: {
      urgentAlerts: true,
      paymentConfirmations: true,
      eventReminders: false
    }
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginAlerts: true,
    apiAccessEnabled: false
  });

  const organizationTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'nonprofit', label: 'Non-Profit Organization' },
    { value: 'government', label: 'Government Entity' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'other', label: 'Other' }
  ];

  const eventCategories = [
    'Concert', 'DJ', 'Electronic', 'Festival', 'Theater', 'Comedy', 
    'Workshop', 'Educational', 'Spiritual', 'Sports', 'Art', 'Food',
    'Business', 'Conference', 'Exhibition', 'Community'
  ];

  const currencies = [
    { value: 'LKR', label: 'Sri Lankan Rupee (LKR)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' }
  ];

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'business', label: 'Business Details', icon: Building },
    { id: 'banking', label: 'Banking & Payout', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Settings },
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

  const API_BASE_URL = 'http://localhost:3000/api/organizer-profile';

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const profile = response.data.data;
        
        // Map API data to component state
        setPersonalData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
          location: profile.location || '',
          organizationName: profile.organizationName || '',
          organizationType: profile.organizationType || 'individual',
          bio: profile.bio || '',
          website: profile.website || '',
          profilePicture: profile.profilePicture || null,
          socialMedia: profile.socialMedia || {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
          }
        });

        setBusinessData({
          businessRegistrationNumber: profile.businessDetails?.businessRegistrationNumber || '',
          taxIdNumber: profile.businessDetails?.taxIdNumber || '',
          businessAddress: profile.businessDetails?.businessAddress || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Sri Lanka'
          },
          contactDetails: profile.contactDetails || {
            primaryPhone: '',
            alternatePhone: '',
            businessEmail: '',
            supportEmail: ''
          }
        });

        setBankingData(profile.bankingDetails || {
          bankName: '',
          accountNumber: '',
          accountHolderName: '',
          routingNumber: '',
          swiftCode: ''
        });

        setPreferences({
          eventCategories: profile.preferences?.eventCategories || [],
          defaultCurrency: profile.preferences?.defaultCurrency || 'LKR',
          defaultTimezone: profile.preferences?.defaultTimezone || 'Asia/Colombo',
          language: profile.preferences?.language || 'English',
          autoApproveTickets: profile.preferences?.autoApproveTickets !== undefined ? profile.preferences.autoApproveTickets : true,
          allowRefunds: profile.preferences?.allowRefunds !== undefined ? profile.preferences.allowRefunds : true,
          refundPolicy: profile.preferences?.refundPolicy || '',
          emailNotifications: profile.notifications?.email || {
            newTicketSales: true,
            eventUpdates: true,
            paymentNotifications: true,
            systemAlerts: true,
            marketingEmails: false,
            weeklyReports: true
          },
          smsNotifications: profile.notifications?.sms || {
            urgentAlerts: true,
            paymentConfirmations: true,
            eventReminders: false
          }
        });

        setSecurityData(prev => ({
          ...prev,
          twoFactorEnabled: profile.security?.twoFactorEnabled || false,
          loginAlerts: profile.security?.loginAlerts !== undefined ? profile.security.loginAlerts : true,
          apiAccessEnabled: profile.security?.apiAccessEnabled || false
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
            organizationName: personalData.organizationName,
            organizationType: personalData.organizationType,
            bio: personalData.bio,
            website: personalData.website,
            socialMedia: personalData.socialMedia,
            profilePicture: personalData.profilePicture
          };
          break;

        case 'Business Details':
          endpoint = `${API_BASE_URL}/profile/personal`;
          data = {
            businessDetails: {
              businessRegistrationNumber: businessData.businessRegistrationNumber,
              taxIdNumber: businessData.taxIdNumber,
              businessAddress: businessData.businessAddress
            },
            contactDetails: businessData.contactDetails
          };
          break;

        case 'Banking Details':
          endpoint = `${API_BASE_URL}/profile/banking`;
          data = bankingData;
          break;

        case 'Preferences':
          endpoint = `${API_BASE_URL}/profile/preferences`;
          data = {
            eventCategories: preferences.eventCategories,
            defaultCurrency: preferences.defaultCurrency,
            defaultTimezone: preferences.defaultTimezone,
            language: preferences.language,
            autoApproveTickets: preferences.autoApproveTickets,
            allowRefunds: preferences.allowRefunds,
            refundPolicy: preferences.refundPolicy
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
            loginAlerts: securityData.loginAlerts,
            apiAccessEnabled: securityData.apiAccessEnabled
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

      const response = await axios.put(endpoint, data, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
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
        throw new Error(response.data.message || 'Update failed');
      }

    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save changes. Please try again.';
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
      const response = await axios.post(`${API_BASE_URL}/profile/upload-image`, {
        profilePicture: base64String
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        showToast('Profile picture updated successfully!', 'success');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload profile picture';
      showToast(errorMessage, 'error');
      
      // Revert the profile picture on error
      setPersonalData(prev => ({ ...prev, profilePicture: null }));
    }
  };

  const removeProfilePicture = async () => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/profile/image`, {
        headers: getAuthHeaders()
      });
      
      if (response.data.success) {
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
      eventCategories: prev.eventCategories.includes(category)
        ? prev.eventCategories.filter(c => c !== category)
        : [...prev.eventCategories, category]
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white mt-20 mb-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalInfo = () => (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
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
                  : personalData.organizationName ? personalData.organizationName[0] : 'O'}
              </div>
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
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
          <h3 className="text-xl font-semibold text-gray-900">
            {personalData.organizationName || `${personalData.firstName} ${personalData.lastName}`}
          </h3>
          <p className="text-gray-600">Event Organizer</p>
          <div className="flex items-center mt-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">Verified Organizer</span>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={personalData.lastName}
            onChange={(e) => setPersonalData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={personalData.phone}
            onChange={(e) => setPersonalData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
          <input
            type="text"
            value={personalData.organizationName}
            onChange={(e) => setPersonalData(prev => ({ ...prev, organizationName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
            placeholder="e.g., Event Masters Lanka"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
          <select
            value={personalData.organizationType}
            onChange={(e) => setPersonalData(prev => ({ ...prev, organizationType: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white"
          >
            {organizationTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={personalData.website}
            onChange={(e) => setPersonalData(prev => ({ ...prev, website: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
            placeholder="https://www.yourwebsite.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            value={personalData.location}
            onChange={(e) => setPersonalData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
            placeholder="e.g., Colombo, Sri Lanka"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={personalData.bio}
            onChange={(e) => setPersonalData(prev => ({ ...prev, bio: e.target.value }))}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
            placeholder="Tell people about your organization and what kind of events you create..."
          />
        </div>
      </div>

      {/* Social Media Links */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Facebook className="w-4 h-4 inline mr-2" />
              Facebook
            </label>
            <input
              type="url"
              value={personalData.socialMedia.facebook}
              onChange={(e) => setPersonalData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, facebook: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Twitter className="w-4 h-4 inline mr-2" />
              Twitter
            </label>
            <input
              type="url"
              value={personalData.socialMedia.twitter}
              onChange={(e) => setPersonalData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, twitter: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Instagram className="w-4 h-4 inline mr-2" />
              Instagram
            </label>
            <input
              type="url"
              value={personalData.socialMedia.instagram}
              onChange={(e) => setPersonalData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              placeholder="https://instagram.com/yourprofile"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Linkedin className="w-4 h-4 inline mr-2" />
              LinkedIn
            </label>
            <input
              type="url"
              value={personalData.socialMedia.linkedin}
              onChange={(e) => setPersonalData(prev => ({ 
                ...prev, 
                socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
              }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('Personal Information')}
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

  const renderPreferences = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Event Preferences</h3>
        
        {/* Event Categories */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Event Categories
            <span className="text-xs text-gray-500 ml-2">Select categories you specialize in</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {eventCategories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  preferences.eventCategories.includes(category)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Default Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
            <select
              value={preferences.defaultCurrency}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultCurrency: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white"
            >
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>{currency.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Timezone</label>
            <select
              value={preferences.defaultTimezone}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultTimezone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white"
            >
              <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
              <option value="UTC">UTC (GMT+0:00)</option>
              <option value="America/New_York">America/New_York (GMT-5:00)</option>
              <option value="Europe/London">Europe/London (GMT+0:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white"
            >
              <option value="English">English</option>
              <option value="Sinhala">Sinhala</option>
              <option value="Tamil">Tamil</option>
            </select>
          </div>
        </div>

        {/* Ticket Management */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Ticket Management</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Auto-approve Tickets</h5>
                <p className="text-sm text-gray-600">Automatically approve ticket purchases without manual review</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, autoApproveTickets: !prev.autoApproveTickets }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.autoApproveTickets ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.autoApproveTickets ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Allow Refunds</h5>
                <p className="text-sm text-gray-600">Enable customers to request refunds for tickets</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, allowRefunds: !prev.allowRefunds }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.allowRefunds ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.allowRefunds ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Refund Policy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Refund Policy</label>
          <textarea
            value={preferences.refundPolicy}
            onChange={(e) => setPreferences(prev => ({ ...prev, refundPolicy: e.target.value }))}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
            placeholder="Describe your refund policy for customers..."
          />
          <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('Preferences')}
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

  const renderNotifications = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>
        
        {/* Email Notifications */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-purple-600" />
            Email Notifications
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">New Ticket Sales</h5>
                <p className="text-sm text-gray-600">Get notified when someone purchases tickets</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, newTicketSales: !prev.emailNotifications.newTicketSales }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications.newTicketSales ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications.newTicketSales ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Event Updates</h5>
                <p className="text-sm text-gray-600">Updates about your events and important changes</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, eventUpdates: !prev.emailNotifications.eventUpdates }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications.eventUpdates ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications.eventUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Payment Notifications</h5>
                <p className="text-sm text-gray-600">Payment confirmations and revenue updates</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, paymentNotifications: !prev.emailNotifications.paymentNotifications }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications.paymentNotifications ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications.paymentNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">System Alerts</h5>
                <p className="text-sm text-gray-600">Important system updates and security alerts</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, systemAlerts: !prev.emailNotifications.systemAlerts }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications.systemAlerts ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications.systemAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Marketing Emails</h5>
                <p className="text-sm text-gray-600">Tips, best practices, and promotional content</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, marketingEmails: !prev.emailNotifications.marketingEmails }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications.marketingEmails ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Weekly Reports</h5>
                <p className="text-sm text-gray-600">Weekly summary of your events and sales</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  emailNotifications: { ...prev.emailNotifications, weeklyReports: !prev.emailNotifications.weeklyReports }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications.weeklyReports ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-purple-600" />
            SMS Notifications
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Urgent Alerts</h5>
                <p className="text-sm text-gray-600">Critical issues requiring immediate attention</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  smsNotifications: { ...prev.smsNotifications, urgentAlerts: !prev.smsNotifications.urgentAlerts }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.smsNotifications.urgentAlerts ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.smsNotifications.urgentAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Payment Confirmations</h5>
                <p className="text-sm text-gray-600">SMS confirmations for payments received</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  smsNotifications: { ...prev.smsNotifications, paymentConfirmations: !prev.smsNotifications.paymentConfirmations }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.smsNotifications.paymentConfirmations ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.smsNotifications.paymentConfirmations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Event Reminders</h5>
                <p className="text-sm text-gray-600">Reminders about upcoming events you're organizing</p>
              </div>
              <button
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  smsNotifications: { ...prev.smsNotifications, eventReminders: !prev.smsNotifications.eventReminders }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.smsNotifications.eventReminders ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.smsNotifications.eventReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('Notification Preferences')}
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save Notification Settings'
          )}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h3>
        
        {/* Change Password */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-purple-600" />
            Change Password
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={securityData.newPassword}
                onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                placeholder="Enter new password (minimum 6 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                placeholder="Confirm your new password"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('Password')}
                disabled={isSaving || !securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Changing...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securityData.twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securityData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Login Alerts</h5>
              <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
            </div>
            <button
              onClick={() => setSecurityData(prev => ({ ...prev, loginAlerts: !prev.loginAlerts }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securityData.loginAlerts ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securityData.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">API Access</h5>
              <p className="text-sm text-gray-600">Enable API access for third-party integrations</p>
            </div>
            <button
              onClick={() => setSecurityData(prev => ({ ...prev, apiAccessEnabled: !prev.apiAccessEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securityData.apiAccessEnabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securityData.apiAccessEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => handleSave('Security')}
            disabled={isSaving}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalInfo();
      case 'business': return <div className="text-center py-8 text-gray-500">Business Details - Coming Soon</div>;
      case 'banking': return <div className="text-center py-8 text-gray-500">Banking Details - Coming Soon</div>;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizer Profile</h1>
        <p className="text-gray-600">Manage your organizer account and event settings</p>
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
                      ? 'bg-purple-600 text-white'
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

export default OrganizerProfile;
