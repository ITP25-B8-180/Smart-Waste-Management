import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign,
  Filter,
  Search,
  Eye,
  Users,
  AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'

const AdminPendingBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bookings/pending')
      setBookings(response.data)
    } catch (error) {
      console.error('Error loading pending bookings:', error)
      toast.error('Failed to load pending bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveBooking = async (bookingId) => {
    try {
      setProcessingId(bookingId)
      await api.put(`/bookings/${bookingId}/approve`)
      toast.success('Booking approved successfully!')
      loadBookings() // Reload to update the list
    } catch (error) {
      console.error('Error approving booking:', error)
      toast.error('Failed to approve booking')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      try {
        setProcessingId(bookingId)
        await api.put(`/bookings/${bookingId}/reject`)
        toast.success('Booking rejected successfully!')
        loadBookings() // Reload to update the list
      } catch (error) {
        console.error('Error rejecting booking:', error)
        toast.error('Failed to reject booking')
      } finally {
        setProcessingId(null)
      }
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const searchMatch = !searchTerm || 
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    return searchMatch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-8 w-8 mr-3 text-yellow-600" />
          Pending Bookings
        </h1>
        <p className="text-gray-600">Review and approve booking requests from users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{bookings.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-blue-600">
                {bookings.filter(b => {
                  const bookingDate = new Date(b.bookingDate)
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return bookingDate >= weekAgo
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${bookings.reduce((sum, b) => sum + (b.amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by user, event, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bookings.length === 0 ? 'No pending bookings' : 'No bookings match your search'}
          </h3>
          <p className="text-gray-500">
            {bookings.length === 0 
              ? 'All booking requests have been processed!' 
              : 'Try adjusting your search criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
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
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.user.name}</p>
                        <p className="text-xs text-gray-500">{booking.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(booking.event.date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">{booking.event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                      <span className="font-medium text-gray-900">{booking.event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
                      <span className="font-medium text-gray-900">${booking.amount}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-600">
                      <p className="text-xs">Booked on</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(booking.bookingDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    
                    <div className="text-gray-600">
                      <p className="text-xs">Event Capacity</p>
                      <p className="font-medium text-gray-900">
                        {booking.event.currentAttendees} / {booking.event.maxAttendees} attendees
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">User Notes:</span> {booking.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                  <a
                    href={`/events/${booking.event._id}`}
                    className="btn-secondary flex items-center justify-center text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Event
                  </a>
                  
                  <button
                    onClick={() => handleApproveBooking(booking._id)}
                    disabled={processingId === booking._id}
                    className="btn-primary flex items-center justify-center text-sm"
                  >
                    {processingId === booking._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </button>
                  
                  <button
                    onClick={() => handleRejectBooking(booking._id)}
                    disabled={processingId === booking._id}
                    className="btn-danger flex items-center justify-center text-sm"
                  >
                    {processingId === booking._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminPendingBookings
