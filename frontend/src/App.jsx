import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import SignupForm from "./pages/Sign-up/Signup";
import LoginForm from "./pages/Login/Login";
import ForgotPasswordForm from "./pages/Forget-password/ForgotPassword";
import Layout from './layout/Layout';
import ProtectedRoute from './common/ProjectedRoutes';

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
        <Route element={<Layout/>}>
          <Route path="/sign-up" element={<SignupForm/>}/>
          <Route path="/login" element={<LoginForm/>}/>
          <Route path="/forgot-password" element={<ForgotPasswordForm/>}/>
          <Route path="/" element={<UserLandingPage/>}/>
          
          <Route element={<ProtectedRoute allowedUserType='attendee' />}>
          {/* User's Routes */}
          
          <Route path="/events-page" element={<EventsPage/>}/>
          <Route path="/event-details" element={<EventDetails/>}/>
          <Route path="/user-profile" element={<UserProfile/>}/>
          <Route path="/booking-history" element={<BookingHistory/>}/>
        </Route>

        <Route element={<ProtectedRoute allowedUserType='organizer' />}>
          {/* Org's Routes */}
          <Route path="/" element={<OrganizerLandingPage/>}/>
          <Route path="/organizer-profile" element={<OrganizerProfile/>}/>
          <Route path="/organizer-create-event" element={<CreateEvent/>}/>
          <Route path="/organizer-manage-events" element={<ManageEvents/>}/>
        </Route>
        
        </Route>
        
      </Routes>
      
    </Router>
  
  )
}

export default App
