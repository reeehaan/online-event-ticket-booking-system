import React, { useEffect, useState } from 'react';
import { 
    Trash2, 
    Pencil, 
    Plus, 
    X, 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    Save,
    AlertCircle,
    Check,
    FileText,
    Ticket
} from 'lucide-react';

function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingTickets, setEditingTickets] = useState(null);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [notifications, setNotifications] = useState([]);
    const [deletingEventId, setDeletingEventId] = useState(null);
    const [savingTickets, setSavingTickets] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(null);


    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    };
    const showNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const getAuthToken = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No auth token found in localStorage');
            return null;
        }
        return token;
    };
    const apiCall = async (url, options = {}) => {
        const token = getAuthToken();
        
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    };

    // Fetch all events
    const fetchEvents = async () => {
        try {
            setLoading(true);
            
            const response = await apiCall('http://localhost:3000/api/org/get-my-events');

            if (response.success) {
                const eventsWithTickets = response.data.events.map(event => {
                    let imageUrl = null;
                    if (event.image) {
                        try {
                            if (event.image.startsWith('data:image/')) {
                                imageUrl = event.image;
                            } else {
                                imageUrl = `data:image/jpeg;base64,${event.image}`;
                            }
                        } catch (imageError) {
                            console.error('Error processing image for event:', event._id, imageError);
                            imageUrl = null;
                        }
                    }

                    return {
                        ...event,
                        image: imageUrl,
                        ticketTypes: event.tickets || []
                    };
                });

                setEvents(eventsWithTickets);
            } else {
                throw new Error(response.message || 'Failed to fetch events');
            }
        } catch (err) {
            if (err.message.includes('401')) {
                alert('Session expired. Please login again.');
                return;
            }
            setError(err.message || 'Failed to fetch events');   
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete event
    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone and will also delete all associated tickets.')) {
            return;
        }

        try {
            setDeletingEventId(eventId);

            const response = await apiCall(`http://localhost:3000/api/org/delete-event/${eventId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                setEvents(prev => prev.filter(e => e._id !== eventId));
                const deletedTicketsCount = response.deletedTicketsCount || 0;
                showNotification(
                    `Event deleted successfully! ${deletedTicketsCount} associated tickets were also removed.`,
                    'success'
                );
            } else {
                throw new Error(response.message || 'Failed to delete event');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            
            if (err.message.includes('401')) {
                alert('Session expired. Please login again.');
            } else if (err.message.includes('403')) {
                showNotification('You can only delete your own events', 'error');
            } else if (err.message.includes('404')) {
                showNotification('Event not found', 'error');
            } else {
                showNotification(
                    err.message || 'Failed to delete event',
                    'error'
                );
            }
        } finally {
            setDeletingEventId(null);
        }
    };

    // Update event status
    const handleEventStatusUpdate = async (eventId, newStatus) => {
        try {
            const response = await apiCall(
                `http://localhost:3000/api/org/update-event/${eventId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (response.success) {
                setEvents(prev => 
                    prev.map(e => e._id === eventId ? { ...e, status: newStatus } : e)
                );
                showNotification(`Event status updated to ${newStatus}`);
            } else {
                throw new Error(response.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error updating event status:', err);
            showNotification('Failed to update event status', 'error');
        }
    };

    // Save event updates
    const handleSaveEvent = async () => {
        if (!editingEvent.title?.trim()) {
            showNotification('Event title is required', 'error');
            return;
        }

        try {
            const response = await apiCall(
                `http://localhost:3000/api/org/update-event/${editingEvent._id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        title: editingEvent.title,
                        description: editingEvent.description,
                        category: editingEvent.category,
                        subcategory: editingEvent.subcategory,
                        date: editingEvent.date,
                        time: editingEvent.time,
                        venue: editingEvent.venue,
                        maxAttendee: editingEvent.maxAttendee
                    })
                }
            );

            if (response.success) {
                setEvents(prev => prev.map(e => e._id === editingEvent._id ? { ...e, ...editingEvent } : e));
                setEditingEvent(null);
                setViewMode('list');
                showNotification('Event updated successfully');
            } else {
                throw new Error(response.message || 'Failed to update event');
            }
        } catch (err) {
            console.error('Error updating event:', err);
            showNotification('Failed to update event', 'error');
        }
    };

    // Save tickets with individual API calls
    const handleSaveTickets = async () => {
        // Validation
        const hasInvalidTickets = editingTickets.ticketTypes.some(ticket => 
            !ticket.name.trim() || 
            ticket.price === '' || ticket.price < 0 || 
            ticket.quantity === '' || ticket.quantity < 0 ||
            ticket.maxPerPurchase === '' || ticket.maxPerPurchase < 1
        );

        if (hasInvalidTickets) {
            showNotification('Please fill all required fields with valid values', 'error');
            return;
        }

        const totalTickets = editingTickets.ticketTypes.reduce((sum, ticket) => 
            sum + parseInt(ticket.quantity || 0) + parseInt(ticket.sold || 0), 0
        );

        if (totalTickets > editingTickets.maxAttendee) {
            showNotification(`Total tickets (${totalTickets}) cannot exceed max attendees (${editingTickets.maxAttendee})`, 'error');
            return;
        }

        try {
            setSavingTickets(true);
            
            let createdCount = 0;
            let updatedCount = 0;
            const allTickets = [];

            // Process each ticket individually
            for (const ticket of editingTickets.ticketTypes) {
                if (ticket._id.startsWith('new_')) {
                    // Create new ticket
                    try {
                        const ticketData = {
                            name: ticket.name,
                            description: ticket.description || '',
                            price: parseInt(ticket.price) || 0,
                            quantity: parseInt(ticket.quantity) || 0,
                            maxPerPurchase: parseInt(ticket.maxPerPurchase) || 1,
                            status: ticket.status || 'active',
                            currency: ticket.currency || 'LKR'
                        };

                        const response = await apiCall(
                            `http://localhost:3000/api/org/add-ticket/${editingTickets._id}`,
                            {
                                method: 'POST',
                                body: JSON.stringify(ticketData)
                            }
                        );

                        if (response.success) {
                            allTickets.push(response.data.ticket);
                            createdCount++;
                        }
                    } catch (err) {
                        console.error('Error creating ticket:', err);
                        throw new Error(`Failed to create ticket "${ticket.name}": ${err.message}`);
                    }
                } else {
                    // Update existing ticket
                    try {
                        const ticketData = {
                            name: ticket.name,
                            description: ticket.description || '',
                            price: parseInt(ticket.price) || 0,
                            quantity: parseInt(ticket.quantity) || 0,
                            maxPerPurchase: parseInt(ticket.maxPerPurchase) || 1,
                            status: ticket.status || 'active',
                            currency: ticket.currency || 'LKR'
                        };

                        const response = await apiCall(
                            `http://localhost:3000/api/org/update-ticket/${editingTickets._id}/${ticket._id}`,
                            {
                                method: 'PATCH',
                                body: JSON.stringify(ticketData)
                            }
                        );

                        if (response.success) {
                            allTickets.push({...ticket, ...ticketData});
                            updatedCount++;
                        }
                    } catch (err) {
                        console.error('Error updating ticket:', err);
                        // If update fails, try to include the original ticket
                        allTickets.push(ticket);
                        showNotification(`Warning: Failed to update ticket "${ticket.name}"`, 'error');
                    }
                }
            }

            // Update the events state with the new ticket data
            setEvents(prev => 
                prev.map(e => e._id === editingTickets._id 
                    ? { ...e, ticketTypes: allTickets }
                    : e
                )
            );
            
            setEditingTickets(null);
            
            // Show success message
            let message = 'Tickets saved successfully!';
            if (createdCount > 0 || updatedCount > 0) {
                message += ` (${updatedCount} updated, ${createdCount} created)`;
            }
            
            showNotification(message, 'success');

        } catch (err) {
            console.error('Error saving tickets:', err);
            
            if (err.message.includes('401')) {
                alert('Session expired. Please login again.');
            } else {
                showNotification(
                    err.message || 'Failed to save tickets',
                    'error'
                );
            }
        } finally {
            setSavingTickets(false);
        }
    };

    // Event handlers
    const handleEditEvent = (event) => {
        setEditingEvent({ ...event });
        setViewMode('edit');
    };

    const handleEventFieldChange = (field, value) => {
        setEditingEvent(prev => ({ ...prev, [field]: value }));
    };

    const handleManageTickets = (event) => {
        setEditingTickets({ ...event });
    };

    const handleTicketChange = (ticketId, field, value) => {
        setEditingTickets(prev => ({
            ...prev,
            ticketTypes: prev.ticketTypes.map(ticket => 
                ticket._id === ticketId ? { ...ticket, [field]: value } : ticket
            )
        }));
    };

    const handleAddTicket = () => {
        const newTicket = {
            _id: 'new_' + Date.now(),
            name: '',
            description: '',
            price: '',
            quantity: '',
            sold: 0,
            maxPerPurchase: '',
            status: 'active'
        };

        setEditingTickets(prev => ({
            ...prev,
            ticketTypes: [...prev.ticketTypes, newTicket]
        }));
    };

    const handleRemoveTicket = async (ticketId) => {
        if (editingTickets.ticketTypes.length === 1) {
            showNotification('Cannot remove the last ticket type', 'error');
            return;
        }

        // Don't delete tickets that are newly created (haven't been saved to backend yet)
        if (ticketId.startsWith('new_')) {
            setEditingTickets(prev => ({
                ...prev,
                ticketTypes: prev.ticketTypes.filter(t => t._id !== ticketId)
            }));
            showNotification('Ticket removed', 'success');
            return;
        }

        if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await apiCall(
                `http://localhost:3000/api/org/delete-ticket/${editingTickets._id}/${ticketId}`,
                {
                    method: 'DELETE'
                }
            );

            if (response.success) {
                // Remove from local state only after successful deletion
                setEditingTickets(prev => ({
                    ...prev,
                    ticketTypes: prev.ticketTypes.filter(t => t._id !== ticketId)
                }));
                
                // Also update the main events state
                setEvents(prev => 
                    prev.map(e => e._id === editingTickets._id 
                        ? { ...e, ticketTypes: e.ticketTypes.filter(t => t._id !== ticketId) }
                        : e
                    )
                );
                
                showNotification('Ticket deleted successfully', 'success');
            } else {
                throw new Error(response.message || 'Failed to delete ticket');
            }
        } catch (err) {
            console.error('Error deleting ticket:', err);
            
            if (err.message.includes('401')) {
                alert('Session expired. Please login again.');
            } else if (err.message.includes('403')) {
                showNotification('You can only delete tickets from your own events', 'error');
            } else if (err.message.includes('404')) {
                showNotification('Ticket not found', 'error');
            } else if (err.message.includes('400')) {
                showNotification('Cannot delete the last ticket type', 'error');
            } else {
                showNotification(
                    err.message || 'Failed to delete ticket',
                    'error'
                );
            }
        }
    };

    // Toggle ticket status with backend save
    const handleTicketStatusToggle = async (ticketId) => {
        const currentTicket = editingTickets.ticketTypes.find(t => t._id === ticketId);
        if (!currentTicket) return;

        // Don't toggle status for new tickets that haven't been saved yet
        if (ticketId.startsWith('new_')) {
            const newStatus = currentTicket.status === 'active' ? 'inactive' : 'active';
            setEditingTickets(prev => ({
                ...prev,
                ticketTypes: prev.ticketTypes.map(ticket => 
                    ticket._id === ticketId 
                        ? { ...ticket, status: newStatus }
                        : ticket
                )
            }));
            showNotification(`Ticket status updated to ${newStatus} (will be saved when you click Save Tickets)`, 'success');
            return;
        }

        const newStatus = currentTicket.status === 'active' ? 'inactive' : 'active';

        try {
            setTogglingStatus(ticketId);
            
            const response = await apiCall(
                `http://localhost:3000/api/org/toggle-ticket-status/${editingTickets._id}/${ticketId}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (response.success) {
                // Update local state
                setEditingTickets(prev => ({
                    ...prev,
                    ticketTypes: prev.ticketTypes.map(ticket => 
                        ticket._id === ticketId 
                            ? { ...ticket, status: newStatus }
                            : ticket
                    )
                }));

                // Also update the main events state
                setEvents(prev => 
                    prev.map(e => e._id === editingTickets._id 
                        ? { 
                            ...e, 
                            ticketTypes: e.ticketTypes.map(t => 
                                t._id === ticketId ? { ...t, status: newStatus } : t
                            )
                        }
                        : e
                    )
                );

                showNotification(`Ticket status updated to ${newStatus}`, 'success');
            } else {
                throw new Error(response.message || 'Failed to update ticket status');
            }
        } catch (err) {
            console.error('Error updating ticket status:', err);
            
            if (err.message.includes('401')) {
                alert('Session expired. Please login again.');
            } else {
                showNotification(
                    err.message || 'Failed to update ticket status',
                    'error'
                );
            }
        } finally {
            setTogglingStatus(null);
        }
    };

    // Utility functions
    const getEventStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTicketStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'sold_out': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Load events on component mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-15 relative">
            {/* Toast Notifications - Higher z-index to appear above modal */}
            {notifications.length > 0 && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] space-y-2">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all transform animate-bounce max-w-md ${
                                notification.type === 'success' ? 'bg-green-500 text-white' :
                                notification.type === 'error' ? 'bg-red-500 text-white' :
                                'bg-blue-500 text-white'
                            }`}
                        >
                            {notification.type === 'success' && <Check size={20} />}
                            {notification.type === 'error' && <AlertCircle size={20} />}
                            <span className="font-medium">{notification.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="text-purple-600" size={28} />
                    </div>
                    Event Management
                </h2>

                {viewMode === 'edit' && (
                    <button
                        onClick={() => {
                            setEditingEvent(null);
                            setViewMode('list');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <X size={16} />
                        Back to List
                    </button>
                )}
            </div>

            {viewMode === 'list' ? (
                /* Events List View */
                <>
                    {events.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                                <Calendar className="text-gray-400" size={32} />
                            </div>
                            <p className="text-gray-500 text-lg">You haven't created any events yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {events.map((event) => {
                                const totalTickets = event.ticketTypes.reduce((sum, t) => sum + (t.quantity || 0) + (t.sold || 0), 0);
                                const soldTickets = event.ticketTypes.reduce((sum, t) => sum + (t.sold || 0), 0);
                                const availableTickets = event.ticketTypes.reduce((sum, t) => sum + (t.quantity || 0), 0);
                                const isDeleting = deletingEventId === event._id;
                                
                                return (
                                    <div
                                        key={event._id}
                                        className={`border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow ${
                                            isDeleting ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col lg:flex-row gap-6">
                                                <div className="lg:w-48 h-48 flex-shrink-0">
                                                    <img
                                                        src={event.image || '/api/placeholder/400/300'}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventStatusColor(event.status)}`}>
                                                            {event.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar size={16} className="text-purple-600" />
                                                            {formatDate(event.date)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Clock size={16} className="text-purple-600" />
                                                            {formatTime(event.time)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <MapPin size={16} className="text-purple-600" />
                                                            {event.venue}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Users size={16} className="text-purple-600" />
                                                            {soldTickets}/{event.maxAttendee} attendees
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                            <Ticket size={16} className="text-purple-600" />
                                                            Ticket Summary
                                                        </h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-600">Total Tickets</p>
                                                                <p className="font-semibold">{totalTickets}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600">Sold</p>
                                                                <p className="font-semibold text-green-600">{soldTickets}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600">Available</p>
                                                                <p className="font-semibold text-blue-600">{availableTickets}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-600">Revenue</p>
                                                                <p className="font-semibold text-purple-600">
                                                                    LKR {event.ticketTypes.reduce((sum, t) => sum + ((t.price || 0) * (t.sold || 0)), 0).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => handleEditEvent(event)}
                                                            disabled={isDeleting}
                                                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Pencil size={14} />
                                                            Edit Event
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => handleManageTickets(event)}
                                                            disabled={isDeleting}
                                                            className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Ticket size={14} />
                                                            Manage Tickets
                                                        </button>
                                                        
                                                        <select
                                                            value={event.status}
                                                            onChange={(e) => handleEventStatusUpdate(event._id, e.target.value)}
                                                            disabled={isDeleting}
                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <option value="published">Published</option>
                                                            <option value="draft">Draft</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                        
                                                        <button
                                                            onClick={() => handleDeleteEvent(event._id)}
                                                            disabled={isDeleting}
                                                            className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <Trash2 size={14} />
                                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                /* Edit Event View */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    value={editingEvent?.title || ''}
                                    onChange={(e) => handleEventFieldChange('title', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    value={editingEvent?.description || ''}
                                    onChange={(e) => handleEventFieldChange('description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={editingEvent?.category || ''}
                                        onChange={(e) => handleEventFieldChange('category', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Event">Event</option>
                                        <option value="Theater">Theater</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                                    <input
                                        type="text"
                                        value={editingEvent?.subcategory || ''}
                                        onChange={(e) => handleEventFieldChange('subcategory', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={editingEvent?.date || ''}
                                        onChange={(e) => handleEventFieldChange('date', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={editingEvent?.time || ''}
                                        onChange={(e) => handleEventFieldChange('time', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                                <input
                                    type="text"
                                    value={editingEvent?.venue || ''}
                                    onChange={(e) => handleEventFieldChange('venue', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees</label>
                                <input
                                    type="number"
                                    value={editingEvent?.maxAttendee || ''}
                                    onChange={(e) => handleEventFieldChange('maxAttendee', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            onClick={handleSaveEvent}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* Ticket Management Modal */}
            {editingTickets && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 mt-25">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Manage Tickets - {editingTickets.title}</h3>
                                <button
                                    onClick={() => setEditingTickets(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Note:</span> Fields marked with * are required. Sold tickets are automatically tracked by the system.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {editingTickets.ticketTypes.map((ticket) => (
                                    <div key={ticket._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">
                                                    Ticket Type {ticket._id.startsWith('new_') && (
                                                        <span className="text-sm text-orange-600 font-normal">(New - not saved yet)</span>
                                                    )}
                                                </h4>
                                                {(ticket.sold || 0) > 0 && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <span className="font-medium">{ticket.sold || 0}</span> tickets sold
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTicketStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                                <button
                                                    onClick={() => handleTicketStatusToggle(ticket._id)}
                                                    disabled={togglingStatus === ticket._id}
                                                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {togglingStatus === ticket._id ? 'Updating...' : 'Toggle Status'}
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveTicket(ticket._id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                                <input
                                                    type="text"
                                                    value={ticket.name}
                                                    onChange={(e) => handleTicketChange(ticket._id, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="Enter ticket name"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR) *</label>
                                                <input
                                                    type="number"
                                                    value={ticket.price}
                                                    onChange={(e) => handleTicketChange(ticket._id, 'price', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    min="0"
                                                    placeholder="Enter price"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Available Quantity *</label>
                                                <input
                                                    type="number"
                                                    value={ticket.quantity}
                                                    onChange={(e) => handleTicketChange(ticket._id, 'quantity', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    min="0"
                                                    placeholder="Enter quantity"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Per Purchase *</label>
                                                <input
                                                    type="number"
                                                    value={ticket.maxPerPurchase}
                                                    onChange={(e) => handleTicketChange(ticket._id, 'maxPerPurchase', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    min="1"
                                                    placeholder="Enter max per purchase"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                rows={2}
                                                value={ticket.description}
                                                onChange={(e) => handleTicketChange(ticket._id, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                placeholder="Optional description of ticket benefits"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={handleAddTicket}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Ticket Type
                                </button>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditingTickets(null)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveTickets}
                                        disabled={savingTickets}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={16} />
                                        {savingTickets ? 'Saving...' : 'Save Tickets'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageEvents;