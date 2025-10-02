import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Bell,
  UserPlus,
  CalendarPlus,
  FileText,
  Zap,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    activeEvents: 0,
    pendingBookings: 0,
    todayEvents: 0,
    thisWeekEvents: 0,
    totalRevenue: 0
  })
  const [recentEvents, setRecentEvents] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [pendingBookings, setPendingBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [usersRes, eventsRes, bookingsRes, analyticsRes] = await Promise.all([
        api.get('/users'),
        api.get('/events?limit=100'),
        api.get('/bookings'),
        api.get('/events/analytics/overview').catch(() => ({ data: {} }))
      ])

      const users = usersRes.data
      const events = eventsRes.data.events || eventsRes.data
      const bookings = bookingsRes.data
      const analytics = analyticsRes.data

      // Calculate additional stats
      const today = new Date()
      const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const todayEvents = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === today.toDateString()
      })

      const thisWeekEvents = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= today && eventDate <= thisWeek
      })

      const pendingBookings = bookings.filter(booking => booking.status === 'pending')
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0)

      setStats({
        totalUsers: users.length,
        totalEvents: events.length,
        totalBookings: bookings.length,
        activeEvents: events.filter(event => event.status === 'active').length,
        pendingBookings: pendingBookings.length,
        todayEvents: todayEvents.length,
        thisWeekEvents: thisWeekEvents.length,
        totalRevenue: totalRevenue
      })

      setRecentEvents(events.slice(0, 5))
      setRecentBookings(bookings.slice(0, 5))
      setUpcomingEvents(events.filter(event => new Date(event.date) > today).slice(0, 5))
      setPendingBookings(pendingBookings.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`)
        toast.success('Event deleted successfully')
        loadDashboardData() // Reload all data
      } catch (error) {
        console.error('Error deleting event:', error)
        toast.error('Failed to delete event')
      }
    }
  }

  const handleQuickStatusChange = async (eventId, newStatus) => {
    try {
      await api.put(`/events/${eventId}/status`, { status: newStatus })
      toast.success(`Event status updated to ${newStatus}`)
      loadDashboardData()
    } catch (error) {
      console.error('Error updating event status:', error)
      toast.error('Failed to update event status')
    }
  }

  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case 'export-events':
          const response = await api.get('/events/export/csv', { responseType: 'blob' })
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'events.csv')
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
          toast.success('Events exported successfully')
          break
        case 'refresh-data':
          await loadDashboardData()
          toast.success('Data refreshed successfully')
          break
        default:
          break
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform action')
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
      {/* Admin-Focused Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-primary-600" />
              Admin Control Panel
            </h1>
            <p className="text-gray-600">System administration and management tools</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleBulkAction('refresh-data')}
              className="btn-secondary flex items-center"
            >
              <Zap className="h-4 w-4 mr-2" />
              Refresh System
            </button>
            <button
              onClick={() => handleBulkAction('export-events')}
              className="btn-secondary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
            <Link to="/admin/events/create" className="btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Management Tools */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-primary-600" />
          Admin Management Tools
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link to="/admin/users" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors group">
            <Users className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">User Management</span>
            <span className="text-xs text-gray-500">{stats.totalUsers} users</span>
          </Link>
          <Link to="/admin/events" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors group">
            <Calendar className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Event Management</span>
            <span className="text-xs text-gray-500">{stats.totalEvents} events</span>
          </Link>
          <Link to="/admin/bookings" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors group">
            <BookOpen className="h-8 w-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Booking Control</span>
            <span className="text-xs text-gray-500">{stats.totalBookings} bookings</span>
          </Link>
          <Link to="/admin/pending-bookings" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors group">
            <AlertTriangle className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Pending Actions</span>
            <span className="text-xs text-gray-500">{stats.pendingBookings} pending</span>
          </Link>
          <Link to="/admin/reports" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors group">
            <BarChart3 className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">System Reports</span>
            <span className="text-xs text-gray-500">Analytics</span>
          </Link>
          <Link to="/admin/keys" className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
            <Settings className="h-8 w-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-900">Admin Keys</span>
            <span className="text-xs text-gray-500">Access Control</span>
          </Link>
        </div>
      </div>

      {/* Admin System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">System Users</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
              <p className="text-xs text-blue-600 mt-1">Active accounts</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/users" className="text-blue-700 hover:text-blue-800 text-sm font-medium flex items-center">
              Manage Users <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Event Management</p>
              <p className="text-3xl font-bold text-green-900">{stats.totalEvents}</p>
              <p className="text-xs text-green-600 mt-1">{stats.activeEvents} active</p>
            </div>
            <div className="bg-green-200 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-700" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/events" className="text-green-700 hover:text-green-800 text-sm font-medium flex items-center">
              Control Events <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Booking Control</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.totalBookings}</p>
              <p className="text-xs text-yellow-600 mt-1">{stats.pendingBookings} pending</p>
            </div>
            <div className="bg-yellow-200 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-yellow-700" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/bookings" className="text-yellow-700 hover:text-yellow-800 text-sm font-medium flex items-center">
              Manage Bookings <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">System Revenue</p>
              <p className="text-3xl font-bold text-purple-900">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-purple-600 mt-1">Total earnings</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-700" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/reports" className="text-purple-700 hover:text-purple-800 text-sm font-medium flex items-center">
              View Reports <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Admin System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Today's Schedule</p>
              <p className="text-2xl font-bold text-orange-900">{stats.todayEvents}</p>
              <p className="text-xs text-orange-600 mt-1">Events today</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-3">
            <Link to="/admin/events?date=today" className="text-orange-700 hover:text-orange-800 text-sm font-medium">
              View Today's Events →
            </Link>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Urgent Actions</p>
              <p className="text-2xl font-bold text-red-900">{stats.pendingBookings}</p>
              <p className="text-xs text-red-600 mt-1">Require attention</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-3">
            <Link to="/admin/pending-bookings" className="text-red-700 hover:text-red-800 text-sm font-medium">
              Handle Pending →
            </Link>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-700">This Week</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.thisWeekEvents}</p>
              <p className="text-xs text-indigo-600 mt-1">Upcoming events</p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="mt-3">
            <Link to="/admin/events?upcoming=true" className="text-indigo-700 hover:text-indigo-800 text-sm font-medium">
              View Schedule →
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin Event Control */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-600" />
                Event Administration
              </h2>
              <Link to="/admin/events" className="text-primary-600 hover:text-primary-700 font-medium">
                Manage All Events
              </Link>
          </div>
          
            {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming events</p>
                <Link to="/admin/events/create" className="btn-primary mt-4 inline-block">
                  Create Event
                </Link>
            </div>
          ) : (
            <div className="space-y-4">
                {upcomingEvents.map((event) => (
                <div key={event._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                          event.status === 'active' ? 'bg-green-100 text-green-800' :
                          event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                            {event.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {event.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                            {event.status === 'draft' && <Clock className="h-3 w-3 mr-1" />}
                          {event.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {event.currentAttendees}/{event.maxAttendees} attendees
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                        <Link
                          to={`/events/${event._id}`}
                        className="p-2 text-gray-400 hover:text-primary-600"
                          title="View Event"
                      >
                        <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/events/edit/${event._id}`}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Edit Event"
                      >
                        <Edit className="h-4 w-4" />
                        </Link>
                        {event.status === 'active' ? (
                      <button
                            onClick={() => handleQuickStatusChange(event._id, 'cancelled')}
                        className="p-2 text-gray-400 hover:text-red-600"
                            title="Cancel Event"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatusChange(event._id, 'active')}
                            className="p-2 text-gray-400 hover:text-green-600"
                            title="Activate Event"
                          >
                            <CheckCircle className="h-4 w-4" />
                      </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Control Panel */}
        <div className="space-y-6">
          {/* Admin Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Admin Actions Required
              </h3>
              <Link to="/admin/pending-bookings" className="text-red-600 hover:text-red-700 text-sm font-medium">
                Handle All
              </Link>
            </div>
            
            {pendingBookings.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map((booking) => (
                  <div key={booking._id} className="border-l-4 border-yellow-400 pl-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{booking.event?.title || 'Event'}</p>
                    <p className="text-xs text-gray-600">{booking.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                    </p>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* System Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              System Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm text-green-700">Active Events</span>
                <span className="text-sm font-semibold text-green-900">{stats.activeEvents}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="text-sm text-orange-700">Today's Events</span>
                <span className="text-sm font-semibold text-orange-900">{stats.todayEvents}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm text-blue-700">This Week</span>
                <span className="text-sm font-semibold text-blue-900">{stats.thisWeekEvents}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="text-sm text-purple-700">System Revenue</span>
                <span className="text-sm font-semibold text-purple-900">${stats.totalRevenue.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link to="/admin/reports" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                View Detailed Reports →
              </Link>
            </div>
          </div>

          {/* Booking Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Booking Management
              </h3>
              <Link to="/admin/bookings" className="text-green-600 hover:text-green-700 text-sm font-medium">
                Manage All
              </Link>
            </div>
          
          {recentBookings.length === 0 ? (
              <div className="text-center py-4">
                <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent bookings</p>
            </div>
          ) : (
              <div className="space-y-3">
              {recentBookings.map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">{booking.event?.title || 'Event'}</p>
                    <p className="text-xs text-gray-600">{booking.user?.name || 'User'}</p>
                    <div className="flex items-center justify-between mt-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-xs font-medium text-gray-900">
                        ${booking.amount || 0}
                        </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
