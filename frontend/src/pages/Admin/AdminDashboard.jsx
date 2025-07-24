// =============================================================================
// SHARED COMPONENTS
// =============================================================================

import React, { useState } from 'react';
import {
  LayoutDashboard, Calendar, Users, CreditCard, Settings, BarChart3,
  Bell, Search, Filter, Plus, Edit, Trash2, Eye, Download, Mail,
  Phone, MapPin, Clock, TrendingUp, TrendingDown, DollarSign,
  UserCheck, AlertCircle, CheckCircle, XCircle, MoreVertical,
  LogOut, Menu, X, User, Ticket, Shield, MessageSquare, FileText,
  Globe, Zap, RefreshCw, Activity
} from 'lucide-react';

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

const StatCard = ({ title, value, change, icon: Icon, trend, color = "blue" }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {change}
          </div>
        )}
      </div>
      <div className={`p-3 bg-${color}-50 rounded-full`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, variant = "primary", onClick, size = "sm", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      variant === "primary" 
        ? "bg-blue-600 text-white hover:bg-blue-700" 
        : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : variant === "success"
        ? "bg-green-600 text-white hover:bg-green-700"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    <Icon size={16} className="mr-2" />
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
    processing: "bg-blue-100 text-blue-800"
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SearchAndFilter = ({ searchTerm, onSearchChange, filters = [], onFilterChange, extraActions = [] }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      {filters.map((filter, index) => (
        <select
          key={index}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          value={filter.value}
        >
          {filter.options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ))}
      
      {extraActions.map((action, index) => (
        <ActionButton key={index} {...action} />
      ))}
    </div>
  </div>
);

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

const Sidebar = ({ currentPage, onPageChange, sidebarOpen, onToggleSidebar }) => {
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'tickets', name: 'Ticket Management', icon: Ticket },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'transactions', name: 'Transactions', icon: CreditCard },
    { id: 'payhere', name: 'PayHere Settings', icon: DollarSign },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3 },
    { id: 'approvals', name: 'Event Approvals', icon: Shield },
    { id: 'support', name: 'Customer Support', icon: MessageSquare },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">IslandEntry Admin</h1>
        <button
          onClick={() => onToggleSidebar(!sidebarOpen)}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="mt-6">
        {navigation.map(item => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
              currentPage === item.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <item.icon size={20} className="mr-3" />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
        <button className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

const TopNavigation = ({ onToggleSidebar }) => (
  <div className="bg-white shadow-sm border-b border-gray-200">
    <div className="flex items-center justify-between h-16 px-6">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden text-gray-600 hover:text-gray-900"
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="text-gray-600 hover:text-gray-900 cursor-pointer" size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            8
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@islandentry.com</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// PAGE COMPONENTS
// =============================================================================

const DashboardContent = () => {
  const stats = {
    totalEvents: 156,
    totalUsers: 12847,
    totalRevenue: 2450000,
    activeEvents: 23,
    pendingApprovals: 8,
    ticketsSold: 5432,
    paymentSuccess: 98.5,
    avgTicketPrice: 4500
  };

  const recentEvents = [
    { id: 1, title: "Tech Conference 2025", organizer: "TechSL", date: "2025-08-15", status: "active", ticketsSold: 245 },
    { id: 2, title: "Music Festival", organizer: "EventPro", date: "2025-09-20", status: "pending", ticketsSold: 0 },
    { id: 3, title: "Food Expo", organizer: "Foodie Events", date: "2025-07-30", status: "completed", ticketsSold: 156 }
  ];

  const recentTransactions = [
    { id: "TXN001", event: "Tech Conference 2025", customer: "John Doe", amount: 15000, status: "completed" },
    { id: "TXN002", event: "Music Festival", customer: "Jane Smith", amount: 8000, status: "pending" },
    { id: "TXN003", event: "Food Expo", customer: "Bob Johnson", amount: 5000, status: "failed" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <ActionButton icon={Download} label="Export Report" variant="secondary" />
          <ActionButton icon={RefreshCw} label="Refresh Data" />
        </div>
      </div>

      {/* Key Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Events" value={stats.totalEvents} change="+12% from last month" trend="up" icon={Calendar} />
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} change="+8% from last month" trend="up" icon={Users} />
        <StatCard title="Revenue (LKR)" value={stats.totalRevenue.toLocaleString()} change="+15% from last month" trend="up" icon={DollarSign} />
        <StatCard title="Tickets Sold" value={stats.ticketsSold.toLocaleString()} change="+22% from last month" trend="up" icon={Ticket} />
      </div>

      {/* PayHere Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Payment Success Rate" value={`${stats.paymentSuccess}%`} change="+0.3% improvement" trend="up" icon={CheckCircle} color="green" />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={AlertCircle} color="yellow" />
        <StatCard title="Avg Ticket Price" value={`LKR ${stats.avgTicketPrice}`} change="+5% from last month" trend="up" icon={DollarSign} />
        <StatCard title="Active Events" value={stats.activeEvents} icon={Activity} color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Shield className="text-blue-600 mb-2" size={24} />
            <h3 className="font-medium">Approve Events</h3>
            <p className="text-sm text-gray-600">Review pending event submissions</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <CreditCard className="text-green-600 mb-2" size={24} />
            <h3 className="font-medium">PayHere Transactions</h3>
            <p className="text-sm text-gray-600">Monitor payment gateway activity</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <MessageSquare className="text-purple-600 mb-2" size={24} />
            <h3 className="font-medium">Customer Support</h3>
            <p className="text-sm text-gray-600">Handle user inquiries and issues</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <BarChart3 className="text-orange-600 mb-2" size={24} />
            <h3 className="font-medium">Generate Reports</h3>
            <p className="text-sm text-gray-600">Export platform analytics</p>
          </button>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Events</h2>
          <div className="space-y-4">
            {recentEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.organizer} • {event.date}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <h3 className="font-medium">LKR {transaction.amount.toLocaleString()}</h3>
                  <p className="text-sm text-gray-600">{transaction.customer} • {transaction.event}</p>
                </div>
                <StatusBadge status={transaction.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', category: 'all' });

  const events = [
    {
      id: 1, title: "Tech Conference 2025", organizer: "TechSL", date: "2025-08-15",
      location: "BMICH, Colombo", status: "active", ticketsSold: 245, revenue: 125000,
      category: "Technology", capacity: 500, approvalStatus: "approved"
    },
    {
      id: 2, title: "Music Festival", organizer: "EventPro", date: "2025-09-20",
      location: "Galle Face", status: "pending", ticketsSold: 0, revenue: 0,
      category: "Music", capacity: 1000, approvalStatus: "pending"
    }
  ];

  const filterOptions = [
    {
      key: 'status',
      value: filters.status,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' }
      ]
    },
    {
      key: 'category',
      value: filters.category,
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'technology', label: 'Technology' },
        { value: 'music', label: 'Music' },
        { value: 'food', label: 'Food' }
      ]
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
        <div className="flex space-x-3">
          <ActionButton icon={Download} label="Export Events" variant="secondary" />
          <ActionButton icon={Plus} label="Create Event" />
        </div>
      </div>

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        extraActions={[
          { icon: Filter, label: "Advanced Filters", variant: "secondary" }
        ]}
      />

      {/* Events Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Events" value="156" icon={Calendar} />
        <StatCard title="Pending Approval" value="8" icon={AlertCircle} color="yellow" />
        <StatCard title="Active Events" value="23" icon={CheckCircle} color="green" />
        <StatCard title="This Month" value="12" change="+3 from last month" trend="up" icon={Plus} />
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.category} • {event.capacity} capacity</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{event.organizer}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{event.date}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={event.status} />
                    <div className="mt-1">
                      <StatusBadge status={event.approvalStatus} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{event.ticketsSold}</div>
                    <div className="text-sm text-gray-500">{((event.ticketsSold / event.capacity) * 100).toFixed(1)}% sold</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">LKR {event.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800" title="View Details">
                        <Eye size={16} />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-800" title="Edit Event">
                        <Edit size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-800" title="Approve Event">
                        <CheckCircle size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="Delete Event">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN ADMIN DASHBOARD COMPONENT
// =============================================================================

function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent />;
      case 'events':
        return <EventsContent />;
      case 'tickets':
        return <TicketManagementContent />;
      case 'users':
        return <UsersContent />;
      case 'transactions':
        return <TransactionsContent />;
      case 'payhere':
        return <PayHereSettingsContent />;
      case 'reports':
        return <ReportsContent />;
      case 'approvals':
        return <EventApprovalsContent />;
      case 'support':
        return <CustomerSupportContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={setSidebarOpen}
      />

      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <TopNavigation onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-6">
          {renderPageContent()}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// =============================================================================
// PLACEHOLDER COMPONENTS (To be implemented)
// =============================================================================

const TicketManagementContent = () => (
  <div className="text-center p-12">
    <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
    <h2 className="text-xl font-semibold text-gray-700">Ticket Management</h2>
    <p className="text-gray-500">Manage ticket types, pricing, and availability</p>
  </div>
);

const UsersContent = () => (
  <div className="text-center p-12">
    <Users size={48} className="mx-auto text-gray-400 mb-4" />
    <h2 className="text-xl font-semibold text-gray-700">User Management</h2>
    <p className="text-gray-500">Manage attendees, organizers, and admin users</p>
  </div>
);

const TransactionsContent = () => (
  <div className="text-center p-12">
    <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
    <h2 className="text-xl font-semibold text-gray-700">Transactions</h2>
    <p className="text-gray-500">Monitor PayHere payments and refunds</p>
  </div>
);

const PayHereSettingsContent = () => (
  <div className="text-center p-12">
    <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
    <h2 className="text-xl font-semibold text-gray-700">PayHere Configuration</h2>
    <p className="text-gray-500">Configure payment gateway settings</p>
  </div>
);

const ReportsContent = () => (
  <div className="text-center p-12">
    <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
    <h2 className="text-xl font-semibant text-gray-700">Reports & Analytics</h2>
    <p className="text-gray-500">View detailed platform analytics and reports</p>
  </div>
);

const EventApprovalsContent = () => (
  <div className="text-center p-12">
    <Shield size={48} className="mx-auto text-gray-400 mb-4" />
    <h2 className="text-xl font-semibold text-gray-700">Event Approvals</h2>
    <p className="text-gray-500">Review and approve pending event submissions</p>
  </div>
);

const CustomerSupportContent = () => (
  <div className="text-center p-12">
    <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
    <h2 className="text-xl font-semibold text-gray-700">Customer Support</h2>
    <p className="text-gray-500">Handle customer inquiries and support tickets</p>
  </div>
);

const SettingsContent = () => (
  <div className="text-center p-12">
    <Settings size={48} className="mx-auto text-gray-400 mb-4" />
    <h2 className="text-xl font-semibold text-gray-700">Platform Settings</h2>
    <p className="text-gray-500">Configure platform-wide settings and preferences</p>
  </div>
);

export default AdminDashboard;