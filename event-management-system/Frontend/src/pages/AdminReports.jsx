import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { BarChart3, Users, Calendar, BookOpen, DollarSign, TrendingUp, Eye } from 'lucide-react'
import { format } from 'date-fns'

const AdminReports = () => {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadReports()
  }, [dateRange])

  const loadReports = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      
      const response = await api.get(`/reports/dashboard?${params}`)
      setReports(response.data)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEventParticipation = async () => {
    try {
      const response = await api.get('/reports/events')
      return response.data
    } catch (error) {
      console.error('Error loading event participation:', error)
      return []
    }
  }

  const loadUserActivity = async () => {
    try {
      const response = await api.get('/reports/users')
      return response.data
    } catch (error) {
      console.error('Error loading user activity:', error)
      return []
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!reports) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load reports</h2>
        <p className="text-gray-600">Please try again later</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into your event management system</p>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ startDate: '', endDate: '' })}
              className="btn-secondary"
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{reports.overview.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{reports.overview.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{reports.overview.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${reports.overview.totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{reports.overview.activeEvents}</div>
          <div className="text-sm text-gray-600">Active Events</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{reports.overview.pendingBookings}</div>
          <div className="text-sm text-gray-600">Pending Bookings</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{reports.overview.approvedBookings}</div>
          <div className="text-sm text-gray-600">Approved Bookings</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Events</h3>
          <div className="space-y-4">
            {reports.recentActivity.events.slice(0, 5).map((event) => (
              <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-600">by {event.organizer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(event.createdAt), 'MMM dd')}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    event.status === 'active' ? 'bg-green-100 text-green-800' :
                    event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Bookings</h3>
          <div className="space-y-4">
            {reports.recentActivity.bookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{booking.event.title}</h4>
                  <p className="text-sm text-gray-600">{booking.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(booking.bookingDate), 'MMM dd')}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Participation by Category */}
      {reports.analytics.eventParticipation.length > 0 && (
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Event Participation by Category</h3>
          <div className="space-y-4">
            {reports.analytics.eventParticipation.map((category, index) => (
              <div key={category._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary-600 mr-3"></div>
                  <span className="font-medium text-gray-900 capitalize">{category._id}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{category.count} events</span>
                  <span className="text-sm text-gray-600">{category.totalAttendees} attendees</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Booking Trends */}
      {reports.analytics.monthlyBookings.length > 0 && (
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Booking Trends</h3>
          <div className="space-y-4">
            {reports.analytics.monthlyBookings.slice(0, 6).map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{month.count} bookings</span>
                  <span className="text-sm text-gray-600">${month.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports
