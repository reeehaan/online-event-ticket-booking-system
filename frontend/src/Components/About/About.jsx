import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Shield, 
  Zap, 
  Users, 
  MapPin, 
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Heart,
  Award
} from 'lucide-react';

const AboutPage = () => {

const navigate = useNavigate();

const handleContactUsClick = () =>{
  navigate('/contact')
}
  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Seamless Booking",
      description: "Book tickets for any event in just a few clicks with our intuitive platform"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Payments",
      description: "PayHere integration ensures your transactions are safe and secure"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Confirmation",
      description: "Get immediate booking confirmation and digital tickets"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Event Discovery",
      description: "Discover amazing events happening across Sri Lanka"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "1000+", label: "Events Hosted" },
    { number: "25+", label: "Cities Covered" },
    { number: "99.9%", label: "Uptime" }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Community First",
      description: "We believe in bringing people together through amazing experiences and fostering connections that last."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description: "We strive for perfection in every aspect of our platform, from user experience to customer service."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Innovation",
      description: "Constantly evolving with the latest technology to provide the best ticketing experience possible."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              About <span className="text-blue-200">islandEntry</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your gateway to extraordinary experiences across the beautiful island of Sri Lanka
            </p>
            <div className="flex justify-center">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full px-8 py-4 border border-white border-opacity-30">
                <p className="text-black font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Connecting Sri Lanka, One Event at a Time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Our <span className="text-blue-600">Mission</span>
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                At islandEntry, we're passionate about making event discovery and ticket booking 
                as simple and enjoyable as the events themselves. We believe that every moment 
                matters, and every experience should be accessible to everyone.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                From intimate concerts to grand festivals, cultural celebrations to corporate events, 
                we're here to ensure you never miss out on what makes Sri Lanka's event scene so vibrant and unique.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Trusted Platform</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Local Expertise</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl transform rotate-3"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-blue-600">islandEntry?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most comprehensive and user-friendly event ticketing platform in Sri Lanka
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-blue-600">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Discover Amazing Events?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of event-goers who trust islandEntry for their ticketing needs. 
            Your next unforgettable experience is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center gap-2 group">
              Browse Events
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button 
            onClick={handleContactUsClick}
            className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-300">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      
    
    </div>
  );
};

export default AboutPage;