import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:3000/api/org';

  // Helper function to convert base64 to displayable image URL
  const getImageUrl = (imageData) => {
    if (!imageData) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }
    
    // If it's already a URL, return it
    if (imageData.startsWith('http') || imageData.startsWith('/')) {
      return imageData;
    }
    
    // If it's base64 data, convert it
    if (imageData.startsWith('data:image')) {
      return imageData;
    }
    
    // If it's base64 without prefix, add the prefix
    return `data:image/jpeg;base64,${imageData}`;
  };

  // Fetch organizer's events with ticket sales data
  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching events with token:', token?.substring(0, 20) + '...');
      
      const response = await axios.get(`${API_BASE_URL}/get-my-events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Events API response:', response.data);
      
      // Handle different possible response structures
      let events = [];
      
      if (response.data?.data?.events && Array.isArray(response.data.data.events)) {
        events = response.data.data.events;
      } else if (response.data?.events && Array.isArray(response.data.events)) {
        events = response.data.events;
      } else if (Array.isArray(response.data)) {
        events = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        events = response.data.data;
      } else {
        console.error('Events data structure:', response.data);
        console.error('Expected array but got:', typeof response.data);
        setError(`Invalid events data format. Got: ${typeof response.data}`);
        setLoading(false);
        return;
      }
      
      console.log('Parsed events array:', events);
      
      // For each event, fetch ticket sales data
      const eventsWithSales = await Promise.all(
        events.map(async (event) => {
          try {
            const ticketsResponse = await axios.get(`${API_BASE_URL}/get-event-tickets/${event._id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log(`Tickets for event ${event._id}:`, ticketsResponse.data);
            
            // Calculate sales data for each event
            let tickets = [];
            if (ticketsResponse.data?.data?.tickets && Array.isArray(ticketsResponse.data.data.tickets)) {
              tickets = ticketsResponse.data.data.tickets;
            } else if (ticketsResponse.data?.tickets && Array.isArray(ticketsResponse.data.tickets)) {
              tickets = ticketsResponse.data.tickets;
            } else if (Array.isArray(ticketsResponse.data)) {
              tickets = ticketsResponse.data;
            }
            
            const totalTicketsAvailable = tickets.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0);
            const totalTicketsSold = tickets.reduce((sum, ticket) => sum + (ticket.sold || 0), 0);
            const totalRevenue = tickets.reduce((sum, ticket) => sum + ((ticket.sold || 0) * (ticket.price || 0)), 0);
            
            return {
              ...event,
              tickets,
              totalTicketsAvailable,
              totalTicketsSold,
              totalRevenue,
              salesPercentage: totalTicketsAvailable > 0 ? Math.round((totalTicketsSold / totalTicketsAvailable) * 100) : 0
            };
          } catch (error) {
            console.error(`Error fetching tickets for event ${event._id}:`, error.response?.data || error.message);
            return {
              ...event,
              tickets: [],
              totalTicketsAvailable: 0,
              totalTicketsSold: 0,
              totalRevenue: 0,
              salesPercentage: 0
            };
          }
        })
      );
      
      console.log('Final events with sales data:', eventsWithSales);
      setEvents(eventsWithSales);
    } catch (error) {
      console.error('Error fetching events:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setError('Events endpoint not found. Please check the API.');
      } else {
        setError(`Failed to fetch events: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);


  const handleViewEvent = async (event) => {
    try {
      setSelectedEvent(event);
      setShowTicketModal(true);
      setLoadingTickets(true);
      
      // Fetch detailed ticket information using the dedicated endpoint
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/get-event-tickets/${event._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Event tickets response:', response.data);
      
      // Update the selected event with detailed ticket information
      let detailedTickets = [];
      if (response.data?.data?.tickets && Array.isArray(response.data.data.tickets)) {
        detailedTickets = response.data.data.tickets;
      } else if (response.data?.tickets && Array.isArray(response.data.tickets)) {
        detailedTickets = response.data.tickets;
      } else if (Array.isArray(response.data)) {
        detailedTickets = response.data;
      }
      
      console.log('Detailed tickets:', detailedTickets);
      
      // Update the selected event with the detailed ticket information
      const updatedEvent = {
        ...event,
        tickets: detailedTickets,
        // Recalculate totals based on detailed ticket data
        totalTicketsAvailable: detailedTickets.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0),
        totalTicketsSold: detailedTickets.reduce((sum, ticket) => sum + (ticket.sold || 0), 0),
        totalRevenue: detailedTickets.reduce((sum, ticket) => sum + ((ticket.sold || 0) * (ticket.price || 0)), 0)
      };
      
      setSelectedEvent(updatedEvent);
    } catch (error) {
      console.error('Error fetching event tickets:', error);
      // Still show the modal with existing data even if the API call fails
      setSelectedEvent(event);
      setShowTicketModal(true);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleCloseModal = () => {
    setShowTicketModal(false);
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && event.status?.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white mt-10 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-600 border-opacity-75 mx-auto"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-20 w-20 border border-purple-400 opacity-20"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl font-semibold text-black">Loading Your Events</p>
            <p className="text-gray-600">Fetching event data and sales analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white mt-10 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <div className="text-red-600 text-4xl">⚠️</div>
          </div>
          <h2 className="text-3xl font-bold text-black mb-4">Error Loading Events</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 mt-10 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-purple-600">
                My Events
              </h1>
              <p className="text-black mt-2 text-lg">Manage your events, track sales, and analyze performance</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 pl-12 text-black placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all w-full sm:w-80"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
              
              {/* Create Event Button */}
              <button 
                onClick={() => navigate('/organizer-create-event')}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-lg">➕</span>
                Create Event
              </button>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {['all', 'published', 'draft', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 capitalize ${
                  filter === status
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {status} ({events.filter(e => status === 'all' || e.status?.toLowerCase() === status).length})
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-6">🎪</div>
            <h3 className="text-2xl font-bold text-black mb-4">
              {searchTerm || filter !== 'all' ? 'No events match your criteria' : 'No events created yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter settings'
                : 'Start by creating your first event to engage with your audience'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <button 
                onClick={() => navigate('/organizer-create-event')}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
              >
                Create Your First Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event._id} className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl shadow-lg">
                
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={getImageUrl(event.image)} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-purple-200 text-purple-700">
                    {event.status || 'Draft'}
                  </div>
                  
                  {/* Sales Percentage */}
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-purple-200">
                    <div className="text-black text-sm font-semibold">{event.salesPercentage}% Sold</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${event.salesPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-purple-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  {/* Event Meta */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-700 text-sm">
                      <span className="mr-2">📅</span>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center text-gray-700 text-sm">
                      <span className="mr-2">📍</span>
                      {event.venue}
                    </div>
                  </div>

                  {/* Revenue & Sales Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="text-purple-700 text-xl font-bold">LKR {event.totalRevenue.toLocaleString()}</div>
                      <div className="text-gray-600 text-xs">Total Revenue</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="text-purple-700 text-xl font-bold">{event.totalTicketsSold}</div>
                      <div className="text-gray-600 text-xs">Tickets Sold</div>
                    </div>
                  </div>

                  {/* Ticket Types Breakdown */}
                  {event.tickets.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-purple-600 font-semibold mb-3 text-sm">Ticket Sales Breakdown</h4>
                      <div className="space-y-2">
                        {event.tickets.map((ticket) => (
                          <div key={ticket._id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <div>
                              <div className="text-black text-sm font-medium">{ticket.name}</div>
                              <div className="text-gray-600 text-xs">LKR {ticket.price.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-black text-sm font-semibold">{ticket.sold}/{ticket.quantity}</div>
                              <div className="text-gray-600 text-xs">
                                {ticket.quantity > 0 ? Math.round((ticket.sold / ticket.quantity) * 100) : 0}% sold
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewEvent(event)}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 transition-all duration-300 text-sm font-semibold"
                    >
                      👁️ View Tickets
                    </button>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Ticket Details Modal */}
      {showTicketModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden m-20">
            {/* Modal Header */}
            <div className="bg-purple-600 text-white p-6 ">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                  <p className="text-purple-100 mt-1">Ticket Sales Overview</p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="text-white hover:bg-purple-700 rounded-full p-2 transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Event Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="text-purple-700 text-2xl font-bold">{selectedEvent.totalTicketsSold}</div>
                  <div className="text-gray-600 text-sm">Total Tickets Sold</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="text-purple-700 text-2xl font-bold">{selectedEvent.totalTicketsAvailable}</div>
                  <div className="text-gray-600 text-sm">Total Available</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="text-purple-700 text-2xl font-bold">LKR {selectedEvent.totalRevenue.toLocaleString()}</div>
                  <div className="text-gray-600 text-sm">Total Revenue</div>
                </div>
              </div>

              {/* Ticket Types Details */}
              <div>
                <h3 className="text-xl font-bold text-black mb-4">Ticket Types & Sales</h3>
                
                {loadingTickets ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-opacity-75 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading ticket details...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedEvent.tickets.map((ticket) => {
                    const soldPercentage = ticket.quantity > 0 ? Math.round((ticket.sold / ticket.quantity) * 100) : 0;
                    const remainingTickets = ticket.quantity - (ticket.sold || 0);
                    
                    return (
                      <div key={ticket._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-black">{ticket.name}</h4>
                            <p className="text-purple-600 font-bold text-xl">LKR {ticket.price.toLocaleString()}</p>
                            {ticket.description && (
                              <p className="text-gray-600 text-sm mt-1">{ticket.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-black">{ticket.sold || 0}/{ticket.quantity}</div>
                            <div className="text-sm text-gray-600">tickets sold</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-black">Sales Progress</span>
                            <span className="text-sm font-bold text-purple-600">{soldPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${soldPercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Revenue:</span>
                            <div className="font-semibold text-black">LKR {((ticket.sold || 0) * ticket.price).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Remaining:</span>
                            <div className="font-semibold text-black">{remainingTickets}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <div className={`font-semibold ${ticket.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                              {ticket.status || 'Active'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Max per purchase:</span>
                            <div className="font-semibold text-black">{ticket.maxPerPurchase || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}

                {/* No Tickets Message */}
                {!loadingTickets && selectedEvent.tickets.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">🎫</div>
                    <p className="text-gray-500">No tickets found for this event</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end">
                <button 
                  onClick={handleCloseModal}
                  className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;