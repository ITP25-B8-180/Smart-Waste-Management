import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { Calendar, Users, BookOpen, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalBookings: 0,
    upcomingEvents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get(`/events/user/${user.id}`),
        api.get(`/bookings/user/${user.id}`)
      ])
      
      setEvents(eventsRes.data)
      setBookings(bookingsRes.data)
      
      const upcomingEvents = eventsRes.data.filter(event => 
        new Date(event.date) > new Date() && event.status === 'active'
      ).length
      
      setStats({
        totalEvents: eventsRes.data.length,
        totalBookings: bookingsRes.data.length,
        upcomingEvents
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`)
        setEvents(events.filter(event => event._id !== eventId))
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Events */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
            <Link to="/create-event" className="btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No events created yet</p>
              <Link to="/create-event" className="text-primary-600 hover:text-primary-700 font-medium">
                Create your first event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div key={event._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        event.status === 'active' ? 'bg-green-100 text-green-800' :
                        event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        to={`/events/${event._id}`}
                        className="p-2 text-gray-400 hover:text-primary-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/edit-event/${event._id}`}
                        className="p-2 text-gray-400 hover:text-primary-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {events.length > 5 && (
                <Link to="/events" className="block text-center text-primary-600 hover:text-primary-700 font-medium">
                  View all events
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/bookings" className="text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
          
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bookings yet</p>
              <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium">
                Browse events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{booking.event.title}</h3>
                  <p className="text-sm text-gray-600">{booking.event.location}</p>
                  <p className="text-sm text-gray-500">
                    Booked on {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${booking.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
