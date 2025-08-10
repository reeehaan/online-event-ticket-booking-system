const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // SMTP Configuration
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Use Gmail's built-in configuration
            auth: {
                user: process.env.SMTP_USER,       
                pass: process.env.SMTP_PASS        
            }
        });
        
        
    }

    // Generate QR Code URL for email
    generateQRCodeURL(qrData, size = 300) {
        const baseURL = 'https://api.qrserver.com/v1/create-qr-code/';
        const params = new URLSearchParams({
            size: `${size}x${size}`,
            data: qrData,
            format: 'png',
            margin: 10,
            ecc: 'H' // High error correction
        });
        return `${baseURL}?${params.toString()}`;
    }

    // Create HTML email template for ticket confirmation
    createTicketConfirmationHTML(purchase, eventData, qrCodeURL) {
        const totalTickets = purchase.tickets.reduce((sum, t) => sum + t.quantity, 0);
        const eventDate = new Date(eventData?.date || purchase.purchaseDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket Confirmation</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    margin: 0; 
                    padding: 0; 
                    background-color: #f4f4f4;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 30px; 
                    text-align: center;
                }
                .header h1 { 
                    margin: 0; 
                    font-size: 28px; 
                    font-weight: bold;
                }
                .header p { 
                    margin: 10px 0 0 0; 
                    font-size: 16px; 
                    opacity: 0.9;
                }
                .content { 
                    padding: 30px;
                }
                .ticket-info { 
                    background: #f8f9ff; 
                    border-left: 4px solid #667eea; 
                    padding: 20px; 
                    margin: 20px 0; 
                    border-radius: 5px;
                }
                .info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin: 8px 0;
                    flex-wrap: wrap;
                }
                .info-label { 
                    font-weight: bold; 
                    color: #333;
                    min-width: 120px;
                }
                .info-value { 
                    color: #666;
                    flex: 1;
                    text-align: right;
                }
                .qr-section { 
                    text-align: center; 
                    padding: 30px; 
                    background: #f8f9ff; 
                    border-radius: 10px; 
                    margin: 20px 0;
                }
                .qr-code { 
                    display: inline-block; 
                    padding: 15px; 
                    background: white; 
                    border-radius: 10px; 
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .qr-code img { 
                    display: block; 
                    max-width: 200px; 
                    height: auto;
                }
                .tickets-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .tickets-table th, .tickets-table td { 
                    padding: 12px; 
                    text-align: left; 
                    border-bottom: 1px solid #eee;
                }
                .tickets-table th { 
                    background: #667eea; 
                    color: white; 
                    font-weight: bold;
                }
                .tickets-table tr:last-child td {
                    border-bottom: none;
                }
                .total-section { 
                    background: #e8f4fd; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0;
                }
                .footer { 
                    background: #333; 
                    color: white; 
                    text-align: center; 
                    padding: 30px;
                }
                .footer p { 
                    margin: 0; 
                    font-size: 14px;
                }
                .important-note { 
                    background: #fff3cd; 
                    border: 1px solid #ffeaa7; 
                    color: #856404; 
                    padding: 15px; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }
                @media (max-width: 600px) {
                    .container { margin: 10px; }
                    .content, .header, .footer { padding: 20px; }
                    .info-row { flex-direction: column; }
                    .info-value { text-align: left; margin-top: 5px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Ticket Confirmation</h1>
                    <p>Your tickets for ${eventData?.title || 'Event'} are confirmed!</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${purchase.userInfo.firstName}!</h2>
                    <p>Thank you for your purchase. Your tickets have been confirmed and are ready to use.</p>
                    
                    <div class="ticket-info">
                        <h3 style="margin-top: 0; color: #667eea;">Event Details</h3>
                        <div class="info-row">
                            <span class="info-label">Event:</span>
                            <span class="info-value">${eventData?.title || 'Event Name'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date & Time:</span>
                            <span class="info-value">${eventDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Venue:</span>
                            <span class="info-value">${eventData?.venue || 'Venue TBA'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Order Reference:</span>
                            <span class="info-value">${purchase.orderReference}</span>
                        </div>
                    </div>

                    <h3>Your Tickets</h3>
                    <table class="tickets-table">
                        <thead>
                            <tr>
                                <th>Ticket Type</th>
                                <th>Quantity</th>
                                <th>Price Each</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${purchase.tickets.map(ticket => `
                                <tr>
                                    <td>${ticket.ticketName}</td>
                                    <td>${ticket.quantity}</td>
                                    <td>LKR ${ticket.pricePerTicket.toLocaleString()}</td>
                                    <td>LKR ${ticket.subtotal.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="info-row">
                            <span class="info-label">Subtotal:</span>
                            <span class="info-value">LKR ${purchase.subtotalAmount.toLocaleString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Convenience Fee:</span>
                            <span class="info-value">LKR ${purchase.convenienceFee.toLocaleString()}</span>
                        </div>
                        <div class="info-row" style="font-size: 18px; font-weight: bold; border-top: 2px solid #667eea; padding-top: 10px; margin-top: 10px;">
                            <span class="info-label">Total Amount:</span>
                            <span class="info-value">LKR ${purchase.totalAmount.toLocaleString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Total Tickets:</span>
                            <span class="info-value">${totalTickets}</span>
                        </div>
                    </div>

                    <div class="qr-section">
                        <h3 style="margin-top: 0; color: #667eea;">Your Entry QR Code</h3>
                        <p>Show this QR code at the event entrance for entry</p>
                        <div class="qr-code">
                            <img src="${qrCodeURL}" alt="Ticket QR Code" />
                        </div>
                        <p style="font-size: 12px; color: #666; margin-top: 15px;">
                            Save this QR code to your phone or take a screenshot for easy access
                        </p>
                    </div>

                    <div class="important-note">
                        <strong>Important Information:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Please arrive at the venue at least 30 minutes before the event start time</li>
                            <li>Bring a valid ID that matches the name on your ticket</li>
                            <li>This QR code is unique to your booking - do not share it</li>
                            <li>Screenshots or printed versions of the QR code are acceptable</li>
                            <li>Contact support if you have any issues with your tickets</li>
                        </ul>
                    </div>

                    <p>We're excited to see you at the event! If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                </div>
                
                <div class="footer">
                    <p>© 2025 IslandEntry. All rights reserved.</p>                                                                         
                    <p>This is an automated confirmation email. Please do not reply to this message.</p>  
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Send ticket confirmation email
    async sendTicketConfirmation(purchase, eventData) {
        try {
            // Generate QR code data - use web link for better phone compatibility  
            const qrData = purchase.qrCodeData?.qrCodeString || JSON.stringify({
                bookingId: purchase._id,
                orderReference: purchase.orderReference,
                customerName: `${purchase.userInfo.firstName} ${purchase.userInfo.lastName}`,
                eventTitle: eventData?.title || 'Event',
                totalTickets: purchase.tickets.reduce((sum, t) => sum + t.quantity, 0),
                totalAmount: purchase.totalAmount
            });

            const qrCodeURL = this.generateQRCodeURL(qrData, 250);

            const htmlContent = this.createTicketConfirmationHTML(purchase, eventData, qrCodeURL);

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Event Ticket Booking System',
                    address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
                },
                to: purchase.userInfo.email,
                subject: `🎫 Ticket Confirmation - ${eventData?.title || 'Your Event'} | Order: ${purchase.orderReference}`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `ticket-qr-${purchase.orderReference}.png`,
                        path: qrCodeURL,
                        cid: 'qr-code'
                    }
                ]
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('Ticket confirmation email sent successfully:', {
                orderReference: purchase.orderReference,
                email: purchase.userInfo.email,
                messageId: info.messageId
            });

            return {
                success: true,
                messageId: info.messageId,
                email: purchase.userInfo.email
            };

        } catch (error) {
            console.error('Error sending ticket confirmation email:', error);
            
            return {
                success: false,
                error: error.message,
                email: purchase.userInfo.email
            };
        }
    }

    // Test email connection
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('SMTP connection verified successfully');
            return true;
        } catch (error) {
            console.error('SMTP connection failed:', error);
            return false;
        }
    }

    // Send test email
    async sendTestEmail(testEmail = 'test@example.com') {
        try {
            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Event Ticket Booking System',
                    address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
                },
                to: testEmail,
                subject: 'Test Email - Event Booking System SMTP',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
                        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                            <h1 style="color: #667eea;">✅ SMTP Test Email</h1>
                            <p>This is a test email from the Event Ticket Booking System.</p>
                            <p><strong>SMTP Configuration Status:</strong> ✅ Working correctly!</p>
                            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                            <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
                            <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</p>
                            <p><strong>SMTP User:</strong> ${process.env.SMTP_USER}</p>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('SMTP test email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };

        } catch (error) {
            console.error('SMTP test email failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();