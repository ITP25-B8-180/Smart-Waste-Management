import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import Bookings from './pages/Bookings'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminEvents from './pages/AdminEvents'
import AdminBookings from './pages/AdminBookings'
import AdminPendingBookings from './pages/AdminPendingBookings'
import AdminReports from './pages/AdminReports'
import Notifications from './pages/Notifications'
import UserDashboard from './pages/UserDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminSignup from './pages/AdminSignup'
import AdminWelcome from './pages/AdminWelcome'
import AdminKeyManager from './pages/AdminKeyManager'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/create-event" element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              } />
              
              <Route path="/edit-event/:id" element={
                <ProtectedRoute>
                  <EditEvent />
                </ProtectedRoute>
              } />
              
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              } />
              
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-welcome" element={
                <ProtectedRoute adminOnly>
                  <AdminWelcome />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute adminOnly>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/events" element={
                <ProtectedRoute adminOnly>
                  <AdminEvents />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/events/create" element={
                <ProtectedRoute adminOnly>
                  <CreateEvent />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/events/edit/:id" element={
                <ProtectedRoute adminOnly>
                  <EditEvent />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/bookings" element={
                <ProtectedRoute adminOnly>
                  <AdminBookings />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/pending-bookings" element={
                <ProtectedRoute adminOnly>
                  <AdminPendingBookings />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/reports" element={
                <ProtectedRoute adminOnly>
                  <AdminReports />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/keys" element={
                <ProtectedRoute adminOnly>
                  <AdminKeyManager />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
