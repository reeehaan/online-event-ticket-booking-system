import { useState } from 'react';
import { 
Facebook, 
Twitter, 
Instagram, 
Youtube, 
Linkedin, 
MessageCircle, 
Mail, 
Phone,
MapPin,
Shield,
Award,
Users,
Calendar,
ArrowUp,
ExternalLink,
Star,
CheckCircle
} from 'lucide-react';

const Footer = () => {
const [hoveredSocial, setHoveredSocial] = useState(null);

const socialLinks = [
{ icon: Facebook, name: 'Facebook', color: 'hover:bg-primary-600', href: '#' },
{ icon: Twitter, name: 'Twitter', color: 'hover:bg-secondary-500', href: '#' },
{ icon: Instagram, name: 'Instagram', color: 'hover:bg-accent-500', href: '#' },
{ icon: Youtube, name: 'YouTube', color: 'hover:bg-error-500', href: '#' },
{ icon: Linkedin, name: 'LinkedIn', color: 'hover:bg-primary-700', href: '#' },
];

const stats = [
{ number: '50K+', label: 'Happy Customers', icon: Users, color: 'from-success-500 to-success-600' },
{ number: '1000+', label: 'Events Hosted', icon: Calendar, color: 'from-primary-500 to-primary-600' },
{ number: '5★', label: 'Average Rating', icon: Star, color: 'from-warning-400 to-warning-500' },
];

const scrollToTop = () => {
window.scrollTo({ top: 0, behavior: 'smooth' });
};

return (
<footer className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-secondary-900 text-white overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-5">
    <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
    }}></div>
    </div>

    {/* Main Footer Content */}
    <div className="relative section-padding">
    <div className="container-custom">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 pb-8 border-b border-white/10">
        {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
            <div key={index} className="text-center group fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-white/20 border-2 border-blue-300/50 rounded-2xl mb-4 hover-lift">
                <IconComponent className="w-8 h-8 text-blue-300" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                {stat.number}
                </div>
                <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
            </div>
            );
        })}
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Logo & Description */}
        <div className="space-y-6 md:col-span-1">
            <div className="group">
            <div className="flex items-center space-x-3 mb-4">
                <div>
                <h2 className="text-2xl font-bold text-white">
                    IslandEntry
                    <sup className="text-xs ml-1 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                    LK
                    </sup>
                </h2>
                <div className="text-xs text-primary-300 font-medium">
                    Sri Lanka's #1 Event Platform
                </div>
                </div>
            </div>
            
            <p className="text-sm text-gray-300 leading-relaxed">
                IslandEntry, Sri Lanka's premier and most trusted online ticket partner,
                serves as the official marketplace providing a secure and safe platform
                for purchasing tickets to all entertainment events in Sri Lanka.
            </p>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 hover:bg-white/20 transition-all duration-200">
                <Shield className="w-4 h-4 text-blue-200" />
                <span className="text-xs font-medium">Secure</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 hover:bg-white/20 transition-all duration-200">
                <CheckCircle className="w-4 h-4 text-blue-200" />
                <span className="text-xs font-medium">Trusted</span>
            </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Follow Us</h4>
            <div className="flex items-center space-x-3">
                {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                    <a
                    key={index}
                    href={social.href}
                    className={`group relative w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover-lift ${social.color}`}
                    onMouseEnter={() => setHoveredSocial(social.name)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    >
                    <IconComponent size={18} className="text-blue-100" />
                    {hoveredSocial === social.name && (
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-tooltip">
                        {social.name}
                        </div>
                    )}
                    </a>
                );
                })}
            </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">We Accept</h4>
            <div className="flex gap-3">
                <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center hover-lift">
                <span className="text-xs font-bold text-primary-600">VISA</span>
                </div>
                <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center hover-lift">
                <span className="text-xs font-bold text-error-600">MC</span>
                </div>
                <div className="w-12 h-8 bg-white rounded-lg flex items-center justify-center hover-lift">
                <span className="text-xs font-bold text-success-600">PayPal</span>
                </div>
            </div>
            </div>
        </div>

        {/* Helpful Links */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full"></div>
            <span>Helpful Links</span>
            </h3>
            <ul className="space-y-3">
            {[
                { name: 'All Events', href: '#' },
                { name: 'IslandEntry Deals', href: '#' },
                { name: 'My Account', href: '#' },
                { name: 'Refund Policy', href: '#' },
                { name: 'Event Organizers', href: '#' },
                { name: 'Mobile App', href: '#' }
            ].map((link, index) => (
                <li key={index}>
                <a 
                    href={link.href} 
                    className="text-sm text-gray-300 hover:text-primary-300 flex items-center space-x-2 group transition-all duration-200"
                >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </a>
                </li>
            ))}
            </ul>
        </div>

        {/* About Us */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full"></div>
            <span>About Us</span>
            </h3>
            <ul className="space-y-3">
            {[
                { name: 'Who We Are', href: '#' },
                { name: 'FAQ', href: '#' },
                { name: 'Contact Us', href: '#' },
                { name: 'Press & Media', href: '#' },
                { name: 'Careers', href: '#' },
                { name: 'Partner With Us', href: '#' }
            ].map((link, index) => (
                <li key={index}>
                <a 
                    href={link.href} 
                    className="text-sm text-gray-300 hover:text-primary-300 flex items-center space-x-2 group transition-all duration-200"
                >
                    <span>{link.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </a>
                </li>
            ))}
            </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-secondary-400 rounded-full"></div>
            <span>Get In Touch</span>
            </h3>
            
            <div className="space-y-4">
            <div className="event-info-card bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border-0 p-4">
                <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-blue-100" />
                </div>
                <span className="text-sm font-medium text-white">WhatsApp Support</span>
                </div>
                <p className="text-xs text-gray-300 ml-11">
                Text-only service for quick assistance
                </p>
            </div>

            <div className="event-info-card bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border-0 p-4">
                <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-100" />
                </div>
                <span className="text-sm font-medium text-white">Email Support</span>
                </div>
                <p className="text-xs text-primary-300 ml-11 font-medium">
                support@islandentry.lk
                </p>
            </div>

            <div className="event-info-card bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border-0 p-4">
                <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-100" />
                </div>
                <span className="text-sm font-medium text-white">Visit Us</span>
                </div>
                <p className="text-xs text-gray-300 ml-11">
                Colombo, Sri Lanka
                </p>
            </div>
            </div>
        </div>
        </div>
    </div>
    </div>

    {/* Bottom Bar */}
    <div className="relative border-t border-white/10 bg-black/20 backdrop-blur-sm">
    <div className="container-custom py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
            {[
            'Privacy Policy',
            'Cookie Policy', 
            'Terms and Conditions',
            'Accessibility'
            ].map((link, index) => (
            <a 
                key={index}
                href="#" 
                className="text-gray-300 hover:text-primary-300 transition-colors duration-200 hover:underline"
            >
                {link}
            </a>
            ))}
        </div>
        
        <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
            Copyright 2014–2025 © IslandEntry All Rights Reserved
            </div>
            
            <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center hover-lift hover-glow group"
            >
            <ArrowUp className="w-5 h-5 text-blue-100 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
        </div>
        </div>
    </div>
    </div>
</footer>
);
};

export default Footer;