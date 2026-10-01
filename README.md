# Online Event Ticket Booking System

A full-stack event ticketing platform (MERN) supporting three roles —
attendees who buy tickets, organizers who create and manage events, and
admins who oversee the platform — with real payment processing and
QR-coded digital tickets.

## Stack

**Backend:** Node.js, Express 5, MongoDB + Mongoose, JWT auth, bcryptjs,
Nodemailer

**Frontend:** React 19 + Vite, React Router 7, Axios, Tailwind CSS 4,
Recharts, react-qr-code, react-toastify

## Features

- **Multi-tier ticketing** — organizers define ticket types per event (e.g.
  General, VIP, Early Bird) with independent pricing and inventory;
  attendees can buy multiple types in a single order
- **Payment processing** — integrated with PayHere (Sri Lanka), including
  MD5 hash-signed transactions so payment callbacks can be verified
  server-side rather than trusted blindly
- **QR-coded tickets** — each completed purchase generates a unique QR
  payload embedding event/ticket data, emailed to the buyer for entry
  scanning
- **Role-based access control** — `attendee` / `organizer` / `admin`
  middleware on top of JWT auth; the token is re-checked against the live
  user record on every request, so a deleted or deactivated account is
  denied even with a still-valid token
- **Organizer dashboard** — event management and sales analytics
  (Recharts)
- **Email notifications** — booking confirmations and account flows via
  Nodemailer

## Architecture

Routes → Service layer → Mongoose models, kept deliberately separate so
request handling, business logic, and data access don't blur together
(e.g. `TicketService` owns purchase/payment logic and QR generation;
routes stay thin).
