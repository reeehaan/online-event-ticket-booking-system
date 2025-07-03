import React, { useState } from 'react';
import { ChevronDown, Package } from 'lucide-react';

const BookingHistory = () => {
const [activeTab, setActiveTab] = useState('All');

const bookings = [
{
    eventName: 'Night Beats',
    date: 'Aug 01, 2025',
    time: '07.00 PM IST',
    orderId: '6863e5dfcde91c6356221784',
    status: 'Pending',
    tickets: 1,
    price: 2020,
},
{
    eventName: 'Jazz Night',
    date: 'Jul 22, 2025',
    time: '08.00 PM IST',
    orderId: 'bd3e5ddf33231c1ab211',
    status: 'Confirmed',
    tickets: 2,
    price: 4000,
},
{
    eventName: 'EDM Party',
    date: 'Jul 18, 2025',
    time: '09.30 PM IST',
    orderId: 'ff11c12ccaa1c133ffa1',
    status: 'Cancelled',
    tickets: 1,
    price: 1500,
},
{
    eventName: 'Classic Gala',
    date: 'Jun 30, 2025',
    time: '06.00 PM IST',
    orderId: '9912aaefccdde1000192',
    status: 'Transferred',
    tickets: 3,
    price: 6000,
},
{
    eventName: 'Rock Show',
    date: 'Jun 01, 2025',
    time: '08.30 PM IST',
    orderId: '77dd99bb33ee2299342',
    status: 'Completed',
    tickets: 2,
    price: 3200,
},
];

const currency = 'LKR';

const getStatusStyle = (status) => {
switch (status) {
    case 'Pending':
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'Confirmed':
    return 'bg-green-100 text-green-700 border border-green-200';
    case 'Cancelled':
    return 'bg-red-100 text-red-700 border border-red-200';
    case 'Transferred':
    return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'Completed':
    return 'bg-gray-100 text-gray-700 border border-gray-300';
    default:
    return 'bg-gray-50 text-gray-600 border border-gray-200';
}
};

// Filter logic
const filteredBookings =
activeTab === 'All'
    ? bookings
    : bookings.filter((b) => b.status === 'Transferred');

return (
<div className="max-w-4xl mx-auto mt-15 mb-20 px-4">
    <h1 className="text-3xl font-bold mb-6">Booking History</h1>

    {/* Tabs */}
    <div className="flex gap-2 mb-6">
    {['All', 'Transferred'].map((tab) => (
        <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === tab
            ? 'bg-white border border-gray-300 shadow-sm text-gray-900'
            : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
        }`}
        >
        {tab === 'All' ? 'All Tickets' : 'Transferred'}
        </button>
    ))}
    </div>

    {/* Booking Cards */}
    {filteredBookings.map((booking, index) => (
    <div
        key={index}
        className="bg-white border rounded-xl shadow-sm p-5 mb-6"
    >
        <div className="flex justify-between items-start">
        <div>
            <h2 className="text-lg font-medium text-gray-900">
            {booking.eventName}
            </h2>
            <p className="text-sm text-gray-500">
            {booking.date} • {booking.time}
            </p>
            <div className="flex items-center gap-2 mt-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-sm line-through text-gray-600">
                {booking.orderId}
            </span>
            </div>
        </div>

        <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-medium text-gray-600">
            {booking.tickets} Ticket(s) •{' '}
            {booking.price.toLocaleString()} {currency}
            </span>
            <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusStyle(
                booking.status
            )}`}
            >
            {booking.status}
            </span>
        </div>
        </div>

        <div className="flex justify-start mt-4">
        <button className="rounded-full bg-gray-100 hover:bg-gray-200 w-9 h-9 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
        </div>
    </div>
    ))}

    {filteredBookings.length === 0 ? (
    <p className="text-center text-gray-400 mt-10">No bookings to show.</p>
    ) : (
    <p className="text-center text-sm text-gray-400 mt-4">
        ~ You've reached the end! ~
    </p>
    )}
</div>
);
};

export default BookingHistory;
