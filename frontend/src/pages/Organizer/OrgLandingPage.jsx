import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import axios from 'axios';

const OrganizerLandingPage = () => {
const [activeTimeframe, setActiveTimeframe] = useState('7D');
const navigate = useNavigate();

// State for real data
const [stats, setStats] = useState([]);
const [revenueData, setRevenueData] = useState([]);
const [ticketTypeData, setTicketTypeData] = useState([]);
const [salesTrendData, setSalesTrendData] = useState([]);
const [sourceData, setSourceData] = useState([]);
const [recentEvents, setRecentEvents] = useState([]);
const [eventPerformance, setEventPerformance] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const API_BASE_URL = 'http://localhost:3000/api/org/dashboard';

// API calls
const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    setStats(response.data.stats || []);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    setError('Failed to fetch dashboard statistics');
  }
};

const fetchRevenueData = async (timeframe) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/revenue`, {
      params: { timeframe },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    setRevenueData(response.data.revenueData || []);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    setError('Failed to fetch revenue data');
  }
};

const fetchOrganizerEvents = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/events`, {
      params: { limit: 10 },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    setRecentEvents(response.data.events || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    setError('Failed to fetch events');
  }
};

const fetchTicketTypeData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/ticket-types`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    setTicketTypeData(response.data.ticketTypes || []);
  } catch (error) {
    console.error('Error fetching ticket type data:', error);
    setError('Failed to fetch ticket type data');
  }
};

const fetchSalesTrendData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/sales-trend`, {
      params: { period: '30D' },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    setSalesTrendData(response.data.salesTrend || []);
  } catch (error) {
    console.error('Error fetching sales trend data:', error);
    setError('Failed to fetch sales trend data');
  }
};

const fetchTrafficSourcesData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/traffic-sources`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    setSourceData(response.data.trafficSources || []);
  } catch (error) {
    console.error('Error fetching traffic sources data:', error);
    setError('Failed to fetch traffic sources data');
  }
};

const fetchEventPerformance = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${API_BASE_URL}/event-performance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    setEventPerformance(response.data.performance || []);
  } catch (error) {
    console.error('Error fetching event performance data:', error);
    setError('Failed to fetch event performance data');
  }
};

// useEffect to fetch all data on component mount
useEffect(() => {
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRevenueData(activeTimeframe),
        fetchOrganizerEvents(),
        fetchTicketTypeData(),
        fetchSalesTrendData(),
        fetchTrafficSourcesData(),
        fetchEventPerformance()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchAllData();
}, []);

// Fetch revenue data when timeframe changes
useEffect(() => {
  if (!loading) {
    fetchRevenueData(activeTimeframe);
  }
}, [activeTimeframe]);

const getStatusBadge = (status) => {
const statusConfig = {
    'Active': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    'Upcoming': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    'Completed': { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' }
};
return statusConfig[status] || statusConfig['Completed'];
};



// Default stats structure for fallback
const defaultStats = [
{ title: 'Total Events', value: '0', change: '+0%', changeType: 'neutral', icon: '📅', color: 'indigo' },
{ title: 'Tickets Sold', value: '0', change: '+0%', changeType: 'neutral', icon: '🎫', color: 'green' },
{ title: 'Total Revenue', value: 'LKR0', change: '+0%', changeType: 'neutral', icon: '💰', color: 'purple' },
{ title: 'Active Events', value: '0', change: 'No events', changeType: 'neutral', icon: '▶️', color: 'orange' }
];

const fullname = localStorage.getItem('fullName');

function navigateCreateEvent(){
    navigate('/organizer-create-event');
}

if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 mt-10 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 mt-10 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
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
        {(stats.length > 0 ? stats : defaultStats).map((stat, index) => (
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
            <LineChart data={revenueData.length > 0 ? revenueData : [{ month: 'No Data', revenue: 0 }]}>
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
            {recentEvents.length > 0 ? recentEvents.map((event) => {
            const statusStyle = getStatusBadge(event.status);
            return (
                <div key={event.id} className="flex items-center space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all duration-300">
                <img 
                    src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'} 
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
            }) : (
                <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📅</div>
                    <p className="text-gray-500">No events found</p>
                    <p className="text-sm text-gray-400">Create your first event to get started</p>
                </div>
            )}
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
            {eventPerformance.length > 0 ? eventPerformance.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                        event.percentage >= 90 ? 'bg-green-500' :
                        event.percentage >= 70 ? 'bg-blue-500' :
                        event.percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">{event.name}</span>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{event.percentage}%</p>
                    <p className="text-xs text-gray-500">{event.status}</p>
                </div>
                </div>
            )) : (
                <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📊</div>
                    <p className="text-gray-500">No performance data available</p>
                </div>
            )}
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
                data={ticketTypeData.length > 0 ? ticketTypeData : [{ name: 'No Data', value: 1, color: '#e5e7eb' }]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                >
                {(ticketTypeData.length > 0 ? ticketTypeData : [{ name: 'No Data', value: 1, color: '#e5e7eb' }]).map((entry, index) => (
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
            <LineChart data={salesTrendData.length > 0 ? salesTrendData : [{ week: 'No Data', sales: 0 }]}>
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
            <BarChart data={sourceData.length > 0 ? sourceData : [{ source: 'No Data', value: 0 }]}>
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