const Event = require('../Models/Event');
const Ticket = require('../Models/Ticket');
const Purchase = require('../Models/Purchase');
const { User, Organizer } = require('../Models/User');

class OrgLandingPageServices {
  
  // Get dashboard statistics for organizer
  static async getDashboardStats(userId) {
    try {
      // Get organizer's events using createdBy field
      const events = await Event.find({ createdBy: userId });
      const eventIds = events.map(event => event._id);

      // Get tickets for all events  
      const tickets = await Ticket.find({ eventId: { $in: eventIds } });
      
      // Get all purchases for these tickets
      const ticketIds = tickets.map(ticket => ticket._id);
      const purchases = await Purchase.find({ 
        'tickets.ticketId': { $in: ticketIds },
        paymentStatus: 'completed'
      });

      // Calculate statistics
      const totalEvents = events.length;
      const activeEvents = events.filter(event => 
        event.status === 'published' && new Date(event.date) > new Date()
      ).length;
      
      // Count total tickets sold from all purchases
      const totalTicketsSold = purchases.reduce((sum, purchase) => {
        return sum + purchase.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0);
      }, 0);
      
      const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

      // Calculate changes (mock data for now - in real app, compare with previous period)
      const stats = [
        {
          title: 'Total Events',
          value: totalEvents.toString(),
          change: '+12%', // This would be calculated based on previous period
          changeType: 'positive',
          icon: '📅',
          color: 'indigo'
        },
        {
          title: 'Tickets Sold',
          value: totalTicketsSold.toLocaleString(),
          change: '+8%',
          changeType: 'positive',
          icon: '🎫',
          color: 'green'
        },
        {
          title: 'Total Revenue',
          value: `LKR ${totalRevenue.toLocaleString()}`,
          change: '+15%',
          changeType: 'positive',
          icon: '💰',
          color: 'purple'
        },
        {
          title: 'Active Events',
          value: activeEvents.toString(),
          change: activeEvents === 0 ? 'No active events' : `${activeEvents} active`,
          changeType: 'neutral',
          icon: '▶️',
          color: 'orange'
        }
      ];

      return { success: true, stats };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  // Get revenue data for charts
  static async getRevenueData(userId, timeframe = '7D') {
    try {
      // Calculate date range based on timeframe
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case '7D':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30D':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90D':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get organizer's events
      const events = await Event.find({ createdBy: userId });
      const eventIds = events.map(event => event._id);

      // Get tickets for these events
      const tickets = await Ticket.find({ eventId: { $in: eventIds } });
      const ticketIds = tickets.map(ticket => ticket._id);

      // Get purchases within the timeframe
      const purchases = await Purchase.find({
        'tickets.ticketId': { $in: ticketIds },
        paymentStatus: 'completed',
        purchaseDate: { $gte: startDate, $lte: now }
      });

      // Group revenue by time period
      const revenueData = [];
      if (timeframe === '7D') {
        // Group by days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(date.setHours(0, 0, 0, 0));
          const dayEnd = new Date(date.setHours(23, 59, 59, 999));
          
          const dayPurchases = purchases.filter(p => 
            p.purchaseDate >= dayStart && p.purchaseDate <= dayEnd
          );
          const dayRevenue = dayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
          
          revenueData.push({
            month: date.toLocaleDateString('en', { weekday: 'short' }),
            revenue: dayRevenue
          });
        }
      } else {
        // For 30D and 90D, group by weeks or months
        const periods = timeframe === '30D' ? 4 : 12;
        const periodLength = timeframe === '30D' ? 7 : 7; // days per period
        
        for (let i = periods - 1; i >= 0; i--) {
          const periodEnd = new Date(now.getTime() - i * periodLength * 24 * 60 * 60 * 1000);
          const periodStart = new Date(periodEnd.getTime() - periodLength * 24 * 60 * 60 * 1000);
          
          const periodPurchases = purchases.filter(p => 
            p.purchaseDate >= periodStart && p.purchaseDate <= periodEnd
          );
          const periodRevenue = periodPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
          
          revenueData.push({
            month: periodEnd.toLocaleDateString('en', { month: 'short' }),
            revenue: periodRevenue
          });
        }
      }

      return { success: true, revenueData };
    } catch (error) {
      console.error('Error in getRevenueData:', error);
      throw new Error('Failed to fetch revenue data');
    }
  }

  // Get organizer's events
  static async getOrganizerEvents(userId, limit = 10) {
    try {
      const events = await Event.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      // Get attendee count for each event
      const eventsWithAttendees = await Promise.all(
        events.map(async (event) => {
          const tickets = await Ticket.find({ eventId: event._id });
          const ticketIds = tickets.map(ticket => ticket._id);
          
          // Count total attendees from completed purchases
          const purchases = await Purchase.find({ 
            'tickets.ticketId': { $in: ticketIds },
            paymentStatus: 'completed'
          });
          
          const attendees = purchases.reduce((sum, purchase) => {
            return sum + purchase.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0);
          }, 0);
          
          return {
            id: event._id,
            name: event.title,
            date: event.date,
            attendees,
            status: event.status || 'Active',
            image: event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
          };
        })
      );

      return { success: true, events: eventsWithAttendees };
    } catch (error) {
      console.error('Error in getOrganizerEvents:', error);
      throw new Error('Failed to fetch events');
    }
  }

  // Get ticket type distribution
  static async getTicketTypeData(userId) {
    try {
      // Get organizer's events
      const events = await Event.find({ createdBy: userId });
      const eventIds = events.map(event => event._id);

      // Get all tickets for these events
      const tickets = await Ticket.find({ eventId: { $in: eventIds } });

      // Group tickets by name (ticket type)
      const ticketTypeCount = {};
      const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
      
      tickets.forEach(ticket => {
        const type = ticket.name || 'Regular';
        ticketTypeCount[type] = (ticketTypeCount[type] || 0) + ticket.sold;
      });

      const ticketTypes = Object.keys(ticketTypeCount).map((type, index) => ({
        name: type,
        value: ticketTypeCount[type],
        color: colors[index % colors.length]
      }));

      return { success: true, ticketTypes };
    } catch (error) {
      console.error('Error in getTicketTypeData:', error);
      throw new Error('Failed to fetch ticket type data');
    }
  }

  // Get sales trend data
  static async getSalesTrendData(userId, period = '30D') {
    try {
      // Get organizer's events
      const events = await Event.find({ createdBy: userId });
      const eventIds = events.map(event => event._id);

      // Get tickets for these events
      const tickets = await Ticket.find({ eventId: { $in: eventIds } });
      const ticketIds = tickets.map(ticket => ticket._id);

      // Get purchases for the last 4 weeks
      const now = new Date();
      const startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000); // 4 weeks ago

      const purchases = await Purchase.find({
        'tickets.ticketId': { $in: ticketIds },
        paymentStatus: 'completed',
        purchaseDate: { $gte: startDate, $lte: now }
      });

      // Group sales by week
      const salesTrend = [];
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weekPurchases = purchases.filter(p => 
          p.purchaseDate >= weekStart && p.purchaseDate <= weekEnd
        );
        
        // Count total tickets sold in this week
        const weekSales = weekPurchases.reduce((sum, purchase) => {
          return sum + purchase.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0);
        }, 0);
        
        salesTrend.push({
          week: `Week ${4 - i}`,
          sales: weekSales
        });
      }

      return { success: true, salesTrend };
    } catch (error) {
      console.error('Error in getSalesTrendData:', error);
      throw new Error('Failed to fetch sales trend data');
    }
  }

  // Get traffic sources data (mock data for now)
  static async getTrafficSourcesData(userId) {
    try {
      // This would typically come from analytics data
      // For now, returning mock data
      const trafficSources = [
        { source: 'Direct', value: 40, color: '#f59e0b' },
        { source: 'Social', value: 25, color: '#ef4444' },
        { source: 'Email', value: 20, color: '#8b5cf6' },
        { source: 'Referral', value: 15, color: '#06b6d4' }
      ];

      return { success: true, trafficSources };
    } catch (error) {
      console.error('Error in getTrafficSourcesData:', error);
      throw new Error('Failed to fetch traffic sources data');
    }
  }

  // Get event performance data
  static async getEventPerformance(userId) {
    try {
      // Get organizer's events
      const events = await Event.find({ createdBy: userId }).limit(5);

      const performance = await Promise.all(
        events.map(async (event) => {
          // Get tickets for this event
          const tickets = await Ticket.find({ eventId: event._id });
          const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
          
          // Get sold tickets from completed purchases
          const ticketIds = tickets.map(ticket => ticket._id);
          const purchases = await Purchase.find({ 
            'tickets.ticketId': { $in: ticketIds },
            paymentStatus: 'completed'
          });
          
          const soldTickets = purchases.reduce((sum, purchase) => {
            return sum + purchase.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0);
          }, 0);
          
          const percentage = totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;
          
          let status;
          if (percentage >= 90) status = 'Sold out';
          else if (percentage >= 70) status = 'Selling fast';
          else if (percentage >= 50) status = 'On track';
          else status = 'Slow sales';

          return {
            name: event.title,
            percentage,
            status
          };
        })
      );

      return { success: true, performance };
    } catch (error) {
      console.error('Error in getEventPerformance:', error);
      throw new Error('Failed to fetch event performance data');
    }
  }
}

module.exports = OrgLandingPageServices;