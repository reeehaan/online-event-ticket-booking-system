import { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, User, Calendar, MapPin, Clock, CreditCard, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logoutUser } from '../../utils/authUtils';
import axios from 'axios';

const Header = ({ userType = 'guest' }) => {
    // UI State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
    
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [currentUserType, setCurrentUserType] = useState(userType);
    
    // Recent Events State
    const [recentEvents, setRecentEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState('');

    const navigate = useNavigate();

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mobile menu resize handler
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobileMenuOpen]);

    // Update current user type when prop changes
    useEffect(() => {
        setCurrentUserType(userType);
    }, [userType]);

    // Authentication status checker
    useEffect(() => {
        const checkAuthStatus = () => {
            const fullname = localStorage.getItem('fullName');
            const token = localStorage.getItem('authToken');
            
            if (userType !== 'guest' && (fullname || token)) {
                setIsLoggedIn(true);
                setUserName(fullname || 'User');
            } else {
                setIsLoggedIn(false);
                setUserName('');
            }
        };

        checkAuthStatus();

        // Listen for localStorage changes from other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'fullName' || e.key === 'authToken') {
                checkAuthStatus();
            }
        };

        // Listen for localStorage changes from same tab
        const handleLocalStorageUpdate = () => {
            checkAuthStatus();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('localStorageUpdate', handleLocalStorageUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('localStorageUpdate', handleLocalStorageUpdate);
        };
    }, [userType]);

    // Fetch recent events
    useEffect(() => {
        const fetchRecentEvents = async () => {
            try {
                setEventsLoading(true);
                setEventsError('');
                
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:3000/api/attendee/recent-events', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                setRecentEvents(response.data.data || []);
            } catch (error) {
                console.error('Failed to fetch recent events:', error);
                setEventsError('Failed to load recent events');
                setRecentEvents([]);
            } finally {
                setEventsLoading(false);
            }
        };

        fetchRecentEvents();
    }, []);

    const handleRecentEventClick = (event) => {
    // Close all dropdowns and menus
    setHoveredItem(null);
    setIsMobileMenuOpen(false);
    setExpandedMobileCategory(null);
    
    // Navigate to event details page with event data
    navigate(`/event-details/${event._id}`, {
        state: { event }
    });
};

    // Navigation items for different user types
    const getNavigationItems = () => {
        const navItems = {
            attendee: [
                { name: 'Events', hasDropdown: true },
                { name: 'Theater', hasDropdown: true },
                { name: 'Other', hasDropdown: true }
            ],
            organizer: [
                { name: 'Dashboard', hasDropdown: false },
                { name: 'Create Event', hasDropdown: false },
                { name: 'Manage Events', hasDropdown: false },
                { name: 'My Events', hasDropdown: false }
            ],
            guest: [
                { name: 'Events', hasDropdown: true },
                { name: 'Theater', hasDropdown: true },
                { name: 'About', hasDropdown: false },
                { name: 'Contact', hasDropdown: false }
            ]
        };

        return navItems[currentUserType] || navItems.guest;
    };

    // Dropdown categories
    const dropdownCategories = {
        Events: ['Concert', 'DJ', 'Electronic', 'Festival'],
        Theater: ['Drama', 'Comedy'],
        Other: ['Workshops', 'Educational', 'Spiritual'],
        'Browse Events': ['All Events', 'My Events', 'Popular Events'],
    };

    // Date formatter
    const formatDate = (isoDateString) => {
        const date = new Date(isoDateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Navigation handlers
    const handleCategoryClick = (mainCategory, subCategory = null) => {
        const categoryToPass = subCategory || mainCategory;

        // Close all dropdowns and menus
        setHoveredItem(null);
        setIsMobileMenuOpen(false);
        setExpandedMobileCategory(null);

        // Handle navigation based on user type
        if (currentUserType === 'organizer') {
            const organizerRoutes = {
                'Dashboard': '/organizer-dashboard',
                'Create Event': '/organizer-create-event',
                'Manage Events': '/organizer-manage-events',
                'My Events': '/organizer-my-events'
            };
            navigate(organizerRoutes[mainCategory] || '/organizer-dashboard');
        } else if (currentUserType === 'attendee') {
            const categoryRoutes = ['Events', 'Theater', 'Other'];
            if (categoryRoutes.includes(mainCategory)) {
                navigate(`/events-page?category=${encodeURIComponent(categoryToPass)}`);
            } else {
                navigate(`/events-page?category=${encodeURIComponent(categoryToPass)}`);
            }
        } else {
            // Guest navigation
            const guestRoutes = {
                'About': '/about',
                'Contact': '/contact',
                'Deals': '/deals'
            };
            navigate(guestRoutes[mainCategory] || `/events-page?category=${encodeURIComponent(categoryToPass)}`);
        }
    };

    const handleNavItemClick = (item) => {
        if (!item.hasDropdown) {
            handleCategoryClick(item.name);
        }
    };

    const toggleMobileCategory = (categoryName) => {
        setExpandedMobileCategory(
            expandedMobileCategory === categoryName ? null : categoryName
        );
    };

    const handleLogout = () => {
        logoutUser();
        setIsLoggedIn(false);
        setUserName('');
        setIsProfileOpen(false);
        
        // Notify other components about logout
        window.dispatchEvent(new CustomEvent('localStorageUpdate'));
        
        navigate('/');
    };

    const handleHomeClick = () => {
        if (currentUserType === "attendee") {
            navigate('/');
        } else if (currentUserType === "organizer") {
            navigate('/organizer-dashboard');
        } else {
            navigate('/');
        }
    };

    // Get current navigation items
    const navItems = getNavigationItems();

    // Dynamic styles based on scroll and user type
    const getHeaderStyles = () => {
        if (isScrolled) {
            return 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200/50';
        }
        return currentUserType === 'organizer' ? 'bg-purple-600' : 'bg-blue-600';
    };

    const getTextStyles = (hover = false) => {
        const base = isScrolled ? 'text-gray-700' : 'text-white';
        const hoverClass = isScrolled ? 'hover:text-blue-600 hover:bg-blue-50' : 'hover:bg-white/20';
        return hover ? `${base} ${hoverClass}` : base;
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${getHeaderStyles()}`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20 relative">
                    {/* Logo */}
                    <div className="flex-shrink-0 group">
                        <div className="flex items-center">
                            <button 
                                onClick={handleHomeClick}
                                className={`text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 ${getTextStyles()}`}
                            >
                                IslandEntry
                            </button>
                            <span className={`text-xs ml-1 align-top transition-colors duration-300 ${isScrolled ? 'text-gray-500' : 'text-white/80'}`}>
                                LK
                            </span>
                        </div>
                        <div className={`text-xs font-medium transition-colors duration-300 hidden sm:block ${isScrolled ? 'text-blue-600' : 'text-white/90'}`}>
                            {currentUserType === 'organizer' ? 'Organize. Manage. Grow.' : 'Discover. Book. Experience.'}
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex space-x-1 xl:space-x-2 relative z-10">
                        {navItems.map((item) => (
                            <div 
                                key={item.name} 
                                className="relative" 
                                onMouseEnter={() => setHoveredItem(item.hasDropdown ? item.name : null)}
                            >
                                <button
                                    onClick={() => handleNavItemClick(item)}
                                    className={`group flex items-center space-x-1 px-2 xl:px-4 py-2 xl:py-3 rounded-xl transition-all duration-300 font-medium text-sm xl:text-base ${getTextStyles(true)} ${hoveredItem === item.name ? 'bg-white/20' : ''}`}
                                >
                                    <span>{item.name}</span>
                                    {item.hasDropdown && (
                                        <ChevronDown className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-200 ${hoveredItem === item.name ? 'rotate-180' : ''}`} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </nav>

                    {/* Auth Section */}
                    <div className="hidden sm:flex items-center space-x-2 lg:space-x-3 relative">
                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`flex items-center gap-2 p-2 rounded-full transition-all duration-300 ${getTextStyles(true)}`}
                                >
                                    <User className="w-5 h-5 lg:w-6 lg:h-6" />
                                    <span className="text-m font-extrabold hidden md:inline">{userName}</span>
                                    <span className="text-xs bg-blue-100 text-blue-400 px-2 py-1 rounded-full hidden lg:inline">
                                        {currentUserType}
                                    </span>
                                </button>
                                
                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                                        {/* Booking History - Only show for attendee users */}
                                        {currentUserType === 'attendee' && (
                                            <button
                                                onClick={() => {
                                                    navigate('/booking-history');
                                                    setIsProfileOpen(false);
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 w-full text-left rounded-t-xl"
                                            >
                                                <CreditCard size={16} />
                                                Booking History
                                            </button>
                                        )}
                                        
                                        {/* Settings */}
                                        <button
                                            onClick={() => {
                                                if (currentUserType === 'organizer') {
                                                    navigate('/organizer-profile');
                                                } else {
                                                    navigate('/user-profile');
                                                }
                                                setIsProfileOpen(false);
                                            }}
                                            className={`flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 w-full text-left ${currentUserType === 'attendee' ? '' : 'rounded-t-xl'}`}
                                        >
                                            <Settings size={16} />
                                            Settings
                                        </button>
                                        
                                        {/* Logout */}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 w-full text-left rounded-b-xl"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/sign-up')}
                                    className={`px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base transition-all duration-300 ${getTextStyles(true)}`}
                                >
                                    Register
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className={`px-3 lg:px-4 py-2 rounded-lg border font-medium text-sm lg:text-base transition-all duration-300 ${isScrolled ? 'border-gray-300 hover:border-blue-600 text-gray-700 hover:bg-blue-200' : 'border-white/30 hover:border-white/50 text-white hover:bg-white/20'}`}
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${getTextStyles(true)}`}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Dropdown */}
            {hoveredItem && (
                <div 
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-[90vw] max-w-[800px] bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl z-[9999] transition-all duration-300 overflow-hidden hidden lg:block" 
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <div className="flex h-[520px]">
                        {/* Categories Section */}
                        <div className="w-1/2 p-6 xl:p-8 border-r border-gray-100/50">
                            <h4 className="text-lg xl:text-xl font-bold text-gray-900 mb-4 xl:mb-6">
                                {hoveredItem}
                            </h4>
                            <div className="space-y-2 xl:space-y-3">
                                {(dropdownCategories[hoveredItem] || []).map((cat, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleCategoryClick(hoveredItem, cat)}
                                        className="flex items-center justify-between w-full p-2 xl:p-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group text-sm xl:text-base"
                                    >
                                        <span className="font-medium">{cat}</span>
                                        <ChevronDown className="w-3 h-3 xl:w-4 xl:h-4 opacity-0 group-hover:opacity-100 -rotate-90 transition-all duration-200" />
                                    </button>
                                ))}
                            </div>
                            <div className="pt-4 xl:pt-6 border-t border-gray-100 mt-4 xl:mt-6">
                                <button
                                    onClick={() => handleCategoryClick(hoveredItem)}
                                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold group text-sm xl:text-base"
                                >
                                    <span>Explore All {hoveredItem}</span>
                                    <ChevronDown className="w-3 h-3 xl:w-4 xl:h-4 -rotate-90 group-hover:translate-x-1 transition-transform duration-200" />
                                </button>
                            </div>
                        </div>

                        {/* Recent Events Section */}
                        <div className="w-1/2 p-4 xl:p-6 space-y-3 xl:space-y-4 overflow-y-auto">
                            <h5 className="text-base xl:text-lg font-semibold text-gray-900 mb-3 xl:mb-4">
                                Recent Events
                            </h5>
                            
                            {eventsLoading ? (
                                <div className="text-center text-gray-500 py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2">Loading events...</p>
                                </div>
                            ) : eventsError ? (
                                <div className="text-center text-red-500 py-8">
                                    <p>{eventsError}</p>
                                </div>
                            ) : recentEvents.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <p>No recent events found</p>
                                </div>
                            ) : (
                                recentEvents.map((event, idx) => (
                                    <div 
                                    key={idx} 
                                    onClick={() => handleRecentEventClick(event)}
                                    className="group bg-white hover:bg-gradient-to-r hover:from-blue-25 hover:to-purple-25 border border-gray-100 hover:border-blue-200 rounded-2xl p-3 xl:p-4 transition-all duration-300 hover:shadow-lg cursor-pointer">
                                        <div className="flex gap-3 xl:gap-4">
                                            <div className="relative overflow-hidden rounded-xl flex-shrink-0">
                                                <img 
                                                    src={event.image} 
                                                    alt={event.title} 
                                                    className="w-16 h-16 xl:w-20 xl:h-20 object-cover group-hover:scale-105 transition-transform duration-300" 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-xs xl:text-sm text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
                                                    {event.title}
                                                </h4>
                                                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatDate(event.date)}</span>
                                                    <Clock className="w-3 h-3 ml-2" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{event.venue}</span>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-blue-600 font-bold text-xs xl:text-sm">
                                                        {event.firstTicketPrice}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 max-h-[80vh] overflow-y-auto">
                    <div className="py-4 sm:py-6 space-y-1 sm:space-y-2 px-3 sm:px-4">
                        {navItems.map((item) => (
                            <div key={item.name}>
                                <button 
                                    onClick={() => {
                                        if (item.hasDropdown) {
                                            toggleMobileCategory(item.name);
                                        } else {
                                            handleNavItemClick(item);
                                        }
                                    }}
                                    className="flex items-center justify-between w-full p-3 sm:p-4 text-left rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                >
                                    <span className="font-medium text-sm sm:text-base">{item.name}</span>
                                    {item.hasDropdown && (
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMobileCategory === item.name ? 'rotate-180' : ''}`} />
                                    )}
                                </button>
                                
                                {/* Mobile dropdown categories */}
                                {item.hasDropdown && expandedMobileCategory === item.name && (
                                    <div className="ml-2 sm:ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                        {(dropdownCategories[item.name] || []).map((cat, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleCategoryClick(item.name, cat)}
                                                className="block w-full text-left p-2 sm:p-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm"
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handleCategoryClick(item.name)}
                                            className="block w-full text-left p-2 sm:p-3 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                                        >
                                            View All {item.name}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Mobile Auth Section */}
                        <div className="pt-4 border-t border-gray-200 space-y-2">
                            {isLoggedIn ? (
                                <div className="space-y-2">
                                    {/* Booking History - Only show for attendee users */}
                                    {currentUserType === 'attendee' && (
                                        <button 
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                navigate('/booking-history');
                                            }}
                                            className="block w-full text-left p-3 sm:p-4 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                        >
                                            Booking History
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            if (currentUserType === 'organizer') {
                                                navigate('/organizer-profile');
                                            } else {
                                                navigate('/user-profile');
                                            }
                                        }}
                                        className="block w-full text-left p-3 sm:p-4 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                    >
                                        Settings
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="block w-full text-left p-3 sm:p-4 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate('/sign-up');
                                        }}
                                        className="block w-full text-center p-3 sm:p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 font-medium"
                                    >
                                        Register
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate('/login');
                                        }}
                                        className="block w-full text-center p-3 sm:p-4 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 font-medium"
                                    >
                                        Login
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

Header.propTypes = {
    userType: PropTypes.oneOf(['attendee', 'organizer', 'guest'])
};

export default Header;