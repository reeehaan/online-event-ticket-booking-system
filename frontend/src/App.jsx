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

import OrganizerLandingPage from './pages/Organizer/OrgLandingPage';
import OrganizerProfile from './pages/Organizer/OrganizerProfile';
import CreateEvent from './pages/Organizer/CreateEvent';
import ManageEvents from './pages/Organizer/ManageEvents';

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout wrapper with dynamic user type detection */}
        <Route element={<DynamicLayout />}>
          
          {/* Guest Routes - Only accessible when not logged in */}
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

          {/* Public Landing Page - accessible to guests and attendees */}
          <Route path="/" element={<UserLandingPage />} />

          {/* Protected Attendee Routes */}
          <Route path="/events-page" element={
            <ProtectedRoute allowedUserType="attendee">
              <EventsPage />
            </ProtectedRoute>
          } />

          <Route path="/event-details" element={
            <ProtectedRoute allowedUserType="attendee">
              <EventDetails />
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
              <CreateEvent />
            </ProtectedRoute>
          } />

          <Route path="/organizer-manage-events" element={
            <ProtectedRoute allowedUserType="organizer">
              <ManageEvents />
            </ProtectedRoute>
          } />

          {/* Catch all route - redirect to appropriate page */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;