import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const OrganizerLandingPage = () => {
const [activeTimeframe, setActiveTimeframe] = useState('7D');
const navigate = useNavigate();


const revenueData = [
{ month: 'Jan', revenue: 12000 },
{ month: 'Feb', revenue: 19000 },
{ month: 'Mar', revenue: 15000 },
{ month: 'Apr', revenue: 25000 },
{ month: 'May', revenue: 22000 },
{ month: 'Jun', revenue: 30000 },
{ month: 'Jul', revenue: 28000 }
];

const ticketTypeData = [
{ name: 'VIP', value: 15, color: '#6366f1' },
{ name: 'Premium', value: 30, color: '#8b5cf6' },
{ name: 'Regular', value: 45, color: '#06b6d4' },
{ name: 'Student', value: 10, color: '#10b981' }
];

const salesTrendData = [
{ week: 'Week 1', sales: 120 },
{ week: 'Week 2', sales: 190 },
{ week: 'Week 3', sales: 300 },
{ week: 'Week 4', sales: 250 }
];

const sourceData = [
{ source: 'Direct', value: 40, color: '#f59e0b' },
{ source: 'Social', value: 25, color: '#ef4444' },
{ source: 'Email', value: 20, color: '#8b5cf6' },
{ source: 'Referral', value: 15, color: '#06b6d4' }
];

const recentEvents = [
{ id: 1, name: 'Tech Summit 2024', date: 'Dec 15, 2024', attendees: 245, status: 'Active', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
{ id: 2, name: 'Music Festival', date: 'Dec 20, 2024', attendees: 1200, status: 'Upcoming', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
{ id: 3, name: 'Business Conference', date: 'Dec 10, 2024', attendees: 89, status: 'Completed', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' }
];

const getStatusBadge = (status) => {
const statusConfig = {
    'Active': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    'Upcoming': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    'Completed': { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' }
};
return statusConfig[status] || statusConfig['Completed'];
};



const stats = [
{ title: 'Total Events', value: '42', change: '+12%', changeType: 'positive', icon: '📅', color: 'indigo' },
{ title: 'Tickets Sold', value: '1,247', change: '+8%', changeType: 'positive', icon: '🎫', color: 'green' },
{ title: 'Total Revenue', value: '$89,432', change: '+15%', changeType: 'positive', icon: '💰', color: 'purple' },
{ title: 'Active Events', value: '8', change: '2 ending soon', changeType: 'neutral', icon: '▶️', color: 'orange' }
];

const fullname = localStorage.getItem('fullName');

function navigateCreateEvent(){
    navigate('/organizer-create-event');
}

return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 mt-10">
    {/* Header */}
    <header className="bg-white backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
    <div className="px-6 py-4">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            IslandEntry Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {fullname}! Here's what's happening with your events.</p>
        </div>

        </div>
    </div>
    </header>

    {/* Main Content */}
    <main className="p-6 space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
        <div key={index} className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm mt-2 flex items-center ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-orange-600'
                }`}>
                {stat.changeType === 'positive' && '↗️'}
                {stat.changeType === 'negative' && '↘️'}
                {stat.changeType === 'neutral' && '⏰'}
                <span className="ml-1">{stat.change}</span>
                </p>
            </div>
            <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${
                stat.color === 'indigo' ? 'from-indigo-100 to-indigo-200' :
                stat.color === 'green' ? 'from-green-100 to-green-200' :
                stat.color === 'purple' ? 'from-purple-100 to-purple-200' :
                'from-orange-100 to-orange-200'
            }`}>
                {stat.icon}
            </div>
            </div>
        </div>
        ))}
    </div>

    {/* Charts and Quick Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex space-x-2">
            {['7D', '30D', '90D'].map((period) => (
                <button
                key={period}
                onClick={() => setActiveTimeframe(period)}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    activeTimeframe === period 
                    ? 'bg-indigo-100 text-indigo-700 shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                >
                {period}
                </button>
            ))}
            </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
                contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' 
                }}
            />
            <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#6366f1' }}
            />
            </LineChart>
        </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="space-y-4">
            <button 
            onClick={navigateCreateEvent}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
            ➕ Create New Event
            </button>
            <button className="w-full bg-white/80 backdrop-blur-sm border-2 border-indigo-200 text-indigo-600 py-3 px-4 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-medium">
            📤 Import Attendees
            </button>
            <button className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium">
            📊 Export Reports
            </button>
            <button className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium">
            🔗 Share Event
            </button>
        </div>
        </div>
    </div>

    {/* Recent Events and Analytics */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Events</h3>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline">
            View all
            </button>
        </div>
        <div className="space-y-4">
            {recentEvents.map((event) => {
            const statusStyle = getStatusBadge(event.status);
            return (
                <div key={event.id} className="flex items-center space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all duration-300">
                <img 
                    src={event.image} 
                    alt={event.name} 
                    className="w-14 h-14 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{event.name}</h4>
                    <p className="text-sm text-gray-600">{event.date} • {event.attendees} attendees</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`${statusStyle.bg} ${statusStyle.text} text-xs px-3 py-1 rounded-full font-medium`}>
                    {event.status}
                    </span>
                    {event.status === 'Active' && (
                    <span className={`w-2 h-2 ${statusStyle.dot} rounded-full animate-pulse`}></span>
                    )}
                </div>
                </div>
            );
            })}
        </div>
        </div>

        {/* Event Performance */}
        <div className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Event Performance</h3>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:underline">
            View details
            </button>
        </div>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl">
            <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Tech Summit 2024</span>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">94%</p>
                <p className="text-xs text-gray-500">Sold out</p>
            </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl">
            <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Music Festival</span>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">85%</p>
                <p className="text-xs text-gray-500">Selling fast</p>
            </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl">
            <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Business Conference</span>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">67%</p>
                <p className="text-xs text-gray-500">On track</p>
            </div>
            </div>
        </div>
        </div>
    </div>

    {/* Analytics Charts */}
    <div className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Analytics Overview</h3>
        <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white/50 backdrop-blur-sm">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
        </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Ticket Types</h4>
            <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie
                data={ticketTypeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                >
                {ticketTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                </Pie>
                <Tooltip />
            </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Sales Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Traffic Sources</h4>
            <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="source" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
        </div>
    </div>
    </main>
</div>
);
};

export default OrganizerLandingPage;