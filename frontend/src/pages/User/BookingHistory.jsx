import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Download, 
  Share, 
  Eye,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';

const BookingHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingQR, setDownloadingQR] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:3000/api/attendee';

  // Fetch booking history 
  const fetchPurchases = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await axios.get(`${API_BASE_URL}/booking-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          page,
          limit
        }
      });

      if (response.data.success) {
        setPurchases(response.data.data.purchases);
        setPagination(response.data.data.pagination);
        setCurrentPage(page);
      } else {
        throw new Error(response.data.message || 'Failed to fetch booking history');
      }

    } catch (err) {
      console.error('Error fetching purchases:', err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        setError('Your session has expired. Please login again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        setError('Access denied. Please check your permissions.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to load booking history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking statistics
  const fetchBookingStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/booking-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookingStats(data.data);
      }

    } catch (err) {
      console.error('Error fetching booking stats:', err);
      // Don't show error for stats, it's optional
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPurchases();
    fetchBookingStats();
  }, []);

  const openQRModal = (purchase) => {
    setSelectedTicket(purchase);
    setQrLoading(true);
    setShowQRModal(true);
  };

  // Generate QR Code using online API service
  const generateQRCodeURL = (text, size = 250) => {
    const baseURL = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({
      size: `${size}x${size}`,
      data: text,
      format: 'png',
      margin: 10,
      ecc: 'H' // High error correction
    });
    return `${baseURL}?${params.toString()}`;
  };

  // Generate fallback QR data for purchases without proper QR codes
  const generateFallbackQRData = (purchase) => {
    const fallbackData = {
      bookingId: purchase._id,
      orderReference: purchase.orderReference,
      customerName: `${purchase.userInfo?.firstName || ''} ${purchase.userInfo?.lastName || ''}`.trim(),
      customerEmail: purchase.userInfo?.email || '',
      customerPhone: purchase.userInfo?.phoneNo || '',
      customerNIC: purchase.userInfo?.nicPassport || '',
      eventTitle: purchase.eventId?.title || purchase.event?.title || 'Event',
      eventDate: purchase.eventId?.date || purchase.event?.date || purchase.purchaseDate,
      eventVenue: purchase.eventId?.venue || purchase.event?.venue || 'Venue TBA',
      totalTickets: purchase.tickets?.reduce((sum, t) => sum + t.quantity, 0) || 0,
      totalAmount: purchase.totalAmount || 0,
      paymentStatus: purchase.paymentStatus || 'pending',
      purchaseDate: purchase.purchaseDate,
      ticketDetails: purchase.tickets?.map(ticket => ({
        ticketType: ticket.ticketName,
        quantity: ticket.quantity,
        price: ticket.pricePerTicket
      })) || []
    };
    
    return JSON.stringify(fallbackData);
  };

  // Share QR Code
  const shareQRCode = async (purchase) => {
    try {
      const qrData = purchase.qrCodeData?.qrCodeString || generateFallbackQRData(purchase);
      
      if (navigator.share) {
        // Use Web Share API if available (mobile devices)
        await navigator.share({
          title: `Ticket for ${purchase.eventId?.title || purchase.event?.title || 'Event'}`,
          text: `My ticket QR code for ${purchase.eventId?.title || purchase.event?.title || 'the event'}`,
          url: generateQRCodeURL(qrData, 300)
        });
      } else {
        // Fallback: Copy QR code URL to clipboard
        const qrURL = generateQRCodeURL(qrData, 300);
        await navigator.clipboard.writeText(qrURL);
        alert('QR code link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // Additional fallback: just copy the QR data
      try {
        const qrData = purchase.qrCodeData?.qrCodeString || generateFallbackQRData(purchase);
        await navigator.clipboard.writeText(qrData);
        alert('QR code data copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  // Download QR Code
  const downloadQRCode = async (purchase) => {
    try {
      setDownloadingQR(purchase._id);
      const qrData = purchase.qrCodeData?.qrCodeString || generateFallbackQRData(purchase);
      const qrCodeURL = generateQRCodeURL(qrData, 300);
      
      const link = document.createElement('a');
      link.href = qrCodeURL;
      link.download = `ticket-${purchase.orderReference}.png`;
      link.target = '_blank';
      
      const response = await fetch(qrCodeURL);
      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);
      
      link.href = blobURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(blobURL), 100);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      // Fallback: open in new tab
      const qrData = purchase.qrCodeData?.qrCodeString || generateFallbackQRData(purchase);
      const qrCodeURL = generateQRCodeURL(qrData, 300);
      window.open(qrCodeURL, '_blank');
    } finally {
      setDownloadingQR(null);
    }
  };


  const formatDate = (dateString, timeString = null) => {
    if (timeString && dateString) {
      // Combine date and time properly
      const dateOnly = dateString.split('T')[0]; // Get just the date part (YYYY-MM-DD)
      const combinedDateTime = new Date(`${dateOnly}T${timeString}`);
      
      // Check if the combined date is valid
      if (!isNaN(combinedDateTime.getTime())) {
        return combinedDateTime.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
    
    // Fallback: show only date without time if time is not available or invalid
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'completed' && status === 'active') {
      return 'bg-green-100 text-green-800';
    } else if (paymentStatus === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (status === 'cancelled' || paymentStatus === 'failed') {
      return 'bg-red-100 text-red-800';
    } else if (status === 'used') {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (status, paymentStatus) => {
    if (paymentStatus === 'completed' && status === 'active') {
      return 'Confirmed';
    } else if (paymentStatus === 'pending') {
      return 'Pending Payment';
    } else if (status === 'cancelled' || paymentStatus === 'failed') {
      return 'Cancelled';
    } else if (status === 'used') {
      return 'Used';
    }
    return 'Processing';
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      fetchPurchases(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => fetchPurchases()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 mt-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">My Bookings</h1>
              <p className="text-xl text-blue-100">Your event tickets and booking history</p>
            </div>
            <button
              onClick={() => fetchPurchases(currentPage)}
              disabled={loading}
              className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg px-6 py-3 border border-white border-opacity-30 text-black font-semibold hover:bg-opacity-30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {bookingStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Ticket className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookingStats.totalBookings}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">LKR {bookingStats.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{bookingStats.totalTickets}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900">{bookingStats.upcomingEvents}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {purchases.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-8">You haven't booked any events yet.</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <div key={purchase._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Event Info */}
                    <div className="flex-1 mb-6 lg:mb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          <Calendar className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {purchase.event?.name || 'Event Name'}
                          </h3>
                          <div className="space-y-1 text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(purchase.event?.date || purchase.purchaseDate, purchase.event?.time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{purchase.event?.venue || 'Location TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Ticket className="w-4 h-4" />
                              <span>{purchase.qrCodeData?.totalTickets || purchase.tickets?.length || 0} ticket(s)</span>
                            </div>
                            {purchase.event?.organizer && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>
                                  {purchase.event.organizer.organizationName || 
                                   `${purchase.event.organizer.firstName} ${purchase.event.organizer.lastName}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="lg:text-right">
                      <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(purchase.status, purchase.paymentStatus)}`}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {getStatusText(purchase.status, purchase.paymentStatus)}
                        </span>
                      </div>
                      <div className="text-right mb-4">
                        <p className="text-2xl font-bold text-gray-900">
                          LKR {purchase.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Order: {purchase.orderReference}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Purchased: {formatDate(purchase.purchaseDate)}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      {purchase.paymentStatus === 'completed' && purchase.status === 'active' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => openQRModal(purchase)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View QR
                          </button>
                          <button
                            onClick={() => downloadQRCode(purchase)}
                            disabled={downloadingQR === purchase._id}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingQR === purchase._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Download
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Ticket Details</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {purchase.tickets.map((ticket, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium text-gray-900">{ticket.ticketName}</p>
                          <p className="text-sm text-gray-600">Quantity: {ticket.quantity}</p>
                          <p className="text-sm text-gray-600">
                            Price: LKR {ticket.pricePerTicket.toLocaleString()} each
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            Subtotal: LKR {ticket.subtotal.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Payment Details */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Payment Method:</span>
                          <span className="ml-2 text-gray-600 capitalize">
                            {purchase.paymentMethod}
                          </span>
                        </div>
                        {purchase.paymentTransactionId && (
                          <div>
                            <span className="font-medium text-gray-700">Transaction ID:</span>
                            <span className="ml-2 text-gray-600 font-mono text-xs">
                              {purchase.paymentTransactionId}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Subtotal:</span>
                          <span className="ml-2 text-gray-600">
                            LKR {purchase.subtotalAmount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Total Amount:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            LKR {purchase.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            
            <span className="ml-4 text-sm text-gray-600">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalCount)} of {pagination.totalCount} results
            </span>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Ticket QR Code</h3>
              <p className="text-gray-600">Show this QR code at the event entrance</p>
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                {qrLoading && (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}
                <img
                  src={generateQRCodeURL(selectedTicket.qrCodeData?.qrCodeString || generateFallbackQRData(selectedTicket), 250)}
                  alt="Ticket QR Code"
                  className={`w-64 h-64 block ${qrLoading ? 'hidden' : ''}`}
                  onLoad={() => setQrLoading(false)}
                  onLoadStart={() => setQrLoading(true)}
                  onError={(e) => {
                    console.error('Error loading QR code image');
                    setQrLoading(false);
                    // Fallback placeholder
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-64 h-64 bg-gray-100 rounded-lg items-center justify-center text-gray-500 hidden">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p>QR Code Unavailable</p>
                    <p className="text-sm">Please try again later</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Name:</span>
                <span>{selectedTicket.qrCodeData?.userInfo?.name || selectedTicket.userInfo?.firstName + ' ' + selectedTicket.userInfo?.lastName || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Email:</span>
                <span>{selectedTicket.qrCodeData?.userInfo?.email || selectedTicket.userInfo?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Phone:</span>
                <span>{selectedTicket.qrCodeData?.userInfo?.phone || selectedTicket.userInfo?.phoneNo || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="font-medium">NIC/Passport:</span>
                <span>{selectedTicket.qrCodeData?.userInfo?.nicPassport || selectedTicket.userInfo?.nicPassport || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Ticket className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Order:</span>
                <span>{selectedTicket.orderReference}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Total Amount:</span>
                <span>LKR {selectedTicket.totalAmount?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>

            {/* QR Data Preview (for debugging - can be removed in production) */}
            {selectedTicket.qrCodeData?.qrCodeString && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">QR Code Contains:</h5>
                <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                  {selectedTicket.qrCodeData.qrCodeString.length > 200 
                    ? selectedTicket.qrCodeData.qrCodeString.substring(0, 200) + '...' 
                    : selectedTicket.qrCodeData.qrCodeString}
                </div>
                <p className="text-xs text-green-600 mt-1">✓ Contains complete booking details</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => downloadQRCode(selectedTicket)}
                disabled={downloadingQR === selectedTicket._id}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingQR === selectedTicket._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download
                  </>
                )}
              </button>
              <button
                onClick={() => shareQRCode(selectedTicket)}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;