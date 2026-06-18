import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing       from "./pages/Landing";
import Login         from "./pages/login";
import Register      from "./pages/Register";

import UserHome         from "./pages/user/Home";
import EventDetail      from "./pages/user/EventDetail";
import SeatSelection    from "./pages/user/SeatSelection";
import Checkout         from "./pages/user/Checkout";
import MyBookings       from "./pages/user/MyBookings";

import OrgDashboard     from "./pages/organizer/Dashboard";
import CreateEvent      from "./pages/organizer/CreateEvent";
import MyEvents         from "./pages/organizer/MyEvents";
import EventAnalytics   from "./pages/organizer/EventAnalytics";

import AdminDashboard       from "./pages/admin/Dashboard";
import ManageUsers          from "./pages/admin/ManageUsers";
import ManageEvents         from "./pages/admin/ManageEvents";
import ManageOrganizers     from "./pages/admin/ManageOrganizers";

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER */}
        <Route path="/home"              element={<ProtectedRoute roles={["user"]}><UserHome /></ProtectedRoute>} />
        <Route path="/event/:id"         element={<ProtectedRoute roles={["user"]}><EventDetail /></ProtectedRoute>} />
        <Route path="/seats/:id"         element={<ProtectedRoute roles={["user"]}><SeatSelection /></ProtectedRoute>} />
        <Route path="/checkout"          element={<ProtectedRoute roles={["user"]}><Checkout /></ProtectedRoute>} />
        <Route path="/my-bookings"       element={<ProtectedRoute roles={["user"]}><MyBookings /></ProtectedRoute>} />

        {/* ORGANIZER */}
        <Route path="/org/dashboard"     element={<ProtectedRoute roles={["organizer"]}><OrgDashboard /></ProtectedRoute>} />
        <Route path="/org/create"        element={<ProtectedRoute roles={["organizer"]}><CreateEvent /></ProtectedRoute>} />
        <Route path="/org/events"        element={<ProtectedRoute roles={["organizer"]}><MyEvents /></ProtectedRoute>} />
        <Route path="/org/analytics/:id" element={<ProtectedRoute roles={["organizer"]}><EventAnalytics /></ProtectedRoute>} />

        {/* ADMIN */}
        <Route path="/admin/dashboard"   element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"       element={<ProtectedRoute roles={["admin"]}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/events"      element={<ProtectedRoute roles={["admin"]}><ManageEvents /></ProtectedRoute>} />
        <Route path="/admin/organizers"  element={<ProtectedRoute roles={["admin"]}><ManageOrganizers /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}