import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Import route protection components
import { ProtectedRoute, GuestRoute } from './common/ProtectedRoutes';
import DynamicLayout from './layout/DynamicLayout';

// Import page components
import SignupForm from "./pages/Sign-up/Signup";
import LoginForm from "./pages/Login/Login";
import ForgotPasswordForm from "./pages/Forget-password/ForgotPassword";

import EventsPage from "./Components/EventPages/EventsPage";
import EventDetails from "./Components/EventPages/EventDetails";
import UserProfile from './pages/User/UserProfile';
import BookingHistory from './pages/User/BookingHistory';
import UserLandingPage from './pages/User/UserLandingPage';
import TicketPurchase from './Components/EventPages/TicketPurchase';

import OrganizerLandingPage from './pages/Organizer/OrgLandingPage';
import OrganizerProfile from './pages/Organizer/OrganizerProfile';
import ManageEvents from './pages/Organizer/ManageEvents';
import CreateEventFlow from './pages/Organizer/CreateEventFlow';
import MyEvents from './pages/Organizer/MyEvents';
import AdminDashboard from './pages/Admin/AdminDashboard';


function App() {
  return (
    <Router>
      <Routes>
        
        <Route element={<DynamicLayout />}>
          
          
          <Route path="/sign-up" element={
            <GuestRoute>
              <SignupForm />
            </GuestRoute>
          } />
          
          <Route path="/login" element={
            <GuestRoute>
              <LoginForm />
            </GuestRoute>
          } />
          
          <Route path="/forgot-password" element={
            <GuestRoute>
              <ForgotPasswordForm />
            </GuestRoute>
          } />          
          <Route path="/" element={<UserLandingPage />} />

          {/* Protected Attendee Routes */}
          <Route path="/events-page" element={
            <ProtectedRoute allowedUserType="attendee">
              <EventsPage />
            </ProtectedRoute>
          } />

          <Route path="/event-details/:eventId" element={
            <ProtectedRoute allowedUserType="attendee">
              <EventDetails />
            </ProtectedRoute>
          } />

          <Route path="/ticket-purchase" element={
            <ProtectedRoute allowedUserType="attendee">
              <TicketPurchase />
            </ProtectedRoute>
          } />

          <Route path="/user-profile" element={
            <ProtectedRoute allowedUserType="attendee">
              <UserProfile />
            </ProtectedRoute>
          } />

          <Route path="/booking-history" element={
            <ProtectedRoute allowedUserType="attendee">
              <BookingHistory />
            </ProtectedRoute>
          } />

          {/* Protected Organizer Routes */}
          <Route path="/organizer-dashboard" element={
            <ProtectedRoute allowedUserType="organizer">
              <OrganizerLandingPage />
            </ProtectedRoute>
          } />

          <Route path="/organizer-profile" element={
            <ProtectedRoute allowedUserType="organizer">
              <OrganizerProfile />
            </ProtectedRoute>
          } />

          <Route path="/organizer-create-event" element={
            <ProtectedRoute allowedUserType="organizer">
              <CreateEventFlow/>
            </ProtectedRoute>
          } />


          <Route path="/organizer-manage-events" element={
            <ProtectedRoute allowedUserType="organizer">
              <ManageEvents />
            </ProtectedRoute>
          } />

          <Route path="/organizer-my-events" element={
            <ProtectedRoute allowedUserType="organizer">
              <MyEvents/>
            </ProtectedRoute>
          } />

          {/* Catch all route - redirect to appropriate page */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Route>

        <Route path="/admin-dashboard" element={
              <AdminDashboard />
          } />
      </Routes>
    </Router>
  );
}

export default App;