import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { Calendar, MapPin, DollarSign, X, Eye, Download, Filter, Search } from 'lucide-react'
import { format } from 'date-fns'

const Bookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const response = await api.get(`/bookings/user/${user.id}`)
      setBookings(response.data)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/bookings/${bookingId}`)
        setBookings(bookings.filter(booking => booking._id !== bookingId))
      } catch (error) {
        console.error('Error cancelling booking:', error)
      }
    }
  }

  const filteredBookings = bookings.filter(booking => {
    // Status filter
    const statusMatch = filter === 'all' || booking.status === filter
    
    // Search filter
    const searchMatch = !searchTerm || 
      booking.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Date filter
    let dateMatch = true
    if (dateFilter !== 'all') {
      const bookingDate = new Date(booking.event.date)
      const now = new Date()
      
      switch (dateFilter) {
        case 'upcoming':
          dateMatch = bookingDate > now
          break
        case 'past':
          dateMatch = bookingDate < now
          break
        case 'thisMonth':
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          dateMatch = bookingDate >= thisMonth && bookingDate < nextMonth
          break
        default:
          dateMatch = true
      }
    }
    
    return statusMatch && searchMatch && dateMatch
  })

  const exportBookings = () => {
    const csvContent = [
      ['Event Title', 'Date', 'Location', 'Amount', 'Status', 'Payment Status', 'Booking Date'],
      ...filteredBookings.map(booking => [
        booking.event.title,
        format(new Date(booking.event.date), 'yyyy-MM-dd'),
        booking.event.location,
        booking.amount,
        booking.status,
        booking.paymentStatus,
        format(new Date(booking.bookingDate), 'yyyy-MM-dd')
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }

  const paymentStatusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    refunded: 'bg-blue-100 text-blue-800'
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
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600">Manage your event bookings and reservations</p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="thisMonth">This Month</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              onClick={exportBookings}
              className="btn-secondary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Bookings', count: bookings.length },
              { key: 'approved', label: 'Approved', count: bookings.filter(b => b.status === 'approved').length },
              { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
              { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No bookings found' : `No ${filter} bookings`}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? 'You haven\'t booked any events yet.' 
              : `You don't have any ${filter} bookings.`
            }
          </p>
          <a
            href="/events"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Browse Events
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {booking.event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {booking.event.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[booking.status]}`}>
                      {booking.status === 'approved' ? 'Approved' :
                       booking.status === 'rejected' ? 'Rejected' :
                       booking.status === 'cancelled' ? 'Cancelled' :
                       'Pending Approval'}
                    </span>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(booking.event.date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs">{booking.event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-medium text-gray-900">{booking.event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="font-medium text-gray-900">${booking.amount}</span>
                    </div>

                    <div className="text-gray-600">
                      <p className="text-xs">Booked on</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Notes:</span> {booking.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 mt-4 lg:mt-0 lg:ml-6">
                  <a
                    href={`/events/${booking.event._id}`}
                    className="btn-secondary flex items-center justify-center text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Event
                  </a>
                  
                  {booking.status === 'approved' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn-danger flex items-center justify-center text-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              ${bookings.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.amount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings
