import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Download,
  Copy,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Settings
} from 'lucide-react'

const AdminEvents = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [analytics, setAnalytics] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [quickEditData, setQuickEditData] = useState({})

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    city: '',
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: ''
  })

  const categories = [
    'conference', 'workshop', 'seminar', 'meeting', 'party', 
    'networking', 'training', 'exhibition', 'concert', 'sports', 'other'
  ]

  const statuses = ['draft', 'active', 'cancelled', 'completed', 'postponed']

  useEffect(() => {
    loadEvents()
    loadAnalytics()
  }, [currentPage, filters, sortBy, sortOrder])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        sortOrder
      })

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/events?${params}`)
      setEvents(response.data.events)
      setTotalPages(response.data.pagination.totalPages)
      setTotalEvents(response.data.pagination.total)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/events/analytics/overview')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return

      try {
        await api.delete(`/events/${eventId}`)
      toast.success('Event deleted successfully')
      loadEvents()
      } catch (error) {
        console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await api.put(`/events/${eventId}/status`, { status: newStatus })
      toast.success(`Event status updated to ${newStatus}`)
      loadEvents()
    } catch (error) {
      console.error('Error updating event status:', error)
      toast.error('Failed to update event status')
    }
  }

  const handleDuplicateEvent = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/duplicate`)
      toast.success('Event duplicated successfully')
      loadEvents()
    } catch (error) {
      console.error('Error duplicating event:', error)
      toast.error('Failed to duplicate event')
    }
  }

  const handleExportEvents = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await api.get(`/events/export/csv?${params}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'events.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Events exported successfully')
    } catch (error) {
      console.error('Error exporting events:', error)
      toast.error('Failed to export events')
    }
  }

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedEvents.length === 0) return

    try {
      const promises = selectedEvents.map(eventId => 
        api.put(`/events/${eventId}/status`, { status: newStatus })
      )
      await Promise.all(promises)
      toast.success(`Updated ${selectedEvents.length} events to ${newStatus}`)
      setSelectedEvents([])
      loadEvents()
    } catch (error) {
      console.error('Error updating events:', error)
      toast.error('Failed to update events')
    }
  }

  const handleSelectEvent = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleSelectAll = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(events.map(event => event._id))
    }
  }

  const handleViewEventDetails = async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`)
      setSelectedEvent(response.data)
      setShowEventDetails(true)
    } catch (error) {
      console.error('Error loading event details:', error)
      toast.error('Failed to load event details')
    }
  }

  const handleQuickEdit = (event) => {
    setEditingEvent(event._id)
    setQuickEditData({
      title: event.title,
      description: event.description,
      time: event.time,
      location: event.location,
      maxAttendees: event.maxAttendees
    })
  }

  const handleQuickEditSave = async (eventId) => {
    try {
      await api.put(`/events/${eventId}`, quickEditData)
      toast.success('Event updated successfully!')
      setEditingEvent(null)
      setQuickEditData({})
      loadEvents()
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    }
  }

  const handleQuickEditCancel = () => {
    setEditingEvent(null)
    setQuickEditData({})
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'postponed': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'postponed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-primary-600" />
              Event Management
            </h1>
            <p className="text-gray-600">Manage all events in your system</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="btn-secondary flex items-center"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics
            </button>
            <button
              onClick={handleExportEvents}
              className="btn-secondary flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
            <Link to="/admin/events/create" className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && analytics && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalEvents}</div>
              <div className="text-sm text-blue-600">Total Events</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.activeEvents}</div>
              <div className="text-sm text-green-600">Active Events</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analytics.draftEvents}</div>
              <div className="text-sm text-yellow-600">Draft Events</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.totalAttendees}</div>
              <div className="text-sm text-purple-600">Total Attendees</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="price">Price</option>
              <option value="createdAt">Created</option>
              <option value="views">Views</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedEvents.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedEvents.length} event(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkStatusChange('active')}
                className="btn-sm bg-green-600 text-white hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkStatusChange('cancelled')}
                className="btn-sm bg-red-600 text-white hover:bg-red-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setSelectedEvents([])}
                className="btn-sm bg-gray-600 text-white hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first event.</p>
            <Link to="/admin/events/create" className="btn-primary">
              Create Event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEvents.length === events.length && events.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event._id)}
                        onChange={() => handleSelectEvent(event._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {event.image ? (
                            <img className="h-12 w-12 rounded-lg object-cover" src={event.image} alt={event.title} />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {editingEvent === event._id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={quickEditData.title}
                                onChange={(e) => setQuickEditData({...quickEditData, title: e.target.value})}
                                className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                              />
                              <textarea
                                value={quickEditData.description}
                                onChange={(e) => setQuickEditData({...quickEditData, description: e.target.value})}
                                className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                                rows={2}
                              />
                            </div>
                          ) : (
                            <>
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.category}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                      {editingEvent === event._id ? (
                        <input
                          type="time"
                          value={quickEditData.time}
                          onChange={(e) => setQuickEditData({...quickEditData, time: e.target.value})}
                          className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{formatTime(event.time)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEvent === event._id ? (
                        <input
                          type="text"
                          value={quickEditData.location}
                          onChange={(e) => setQuickEditData({...quickEditData, location: e.target.value})}
                          className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {event.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingEvent === event._id ? (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-500">Current: {event.currentAttendees}</div>
                          <input
                            type="number"
                            value={quickEditData.maxAttendees}
                            onChange={(e) => setQuickEditData({...quickEditData, maxAttendees: parseInt(e.target.value)})}
                            className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                            min="1"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {event.currentAttendees}/{event.maxAttendees}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)}
                        <span className="ml-1">{event.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingEvent === event._id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuickEditSave(event._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Save Changes"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleQuickEditCancel}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewEventDetails(event._id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Event Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleQuickEdit(event)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Quick Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/admin/events/edit/${event._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Full Edit"
                          >
                            <Settings className="h-4 w-4" />
                          </Link>
                          <div className="relative">
                            <button
                              className="text-gray-600 hover:text-gray-900"
                              title="More Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                              <div className="py-1">
                                <button
                                  onClick={() => handleDuplicateEvent(event._id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Copy className="h-4 w-4 inline mr-2" />
                                  Duplicate
                                </button>
                                {event.status === 'active' ? (
                                  <button
                                    onClick={() => handleStatusChange(event._id, 'cancelled')}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    <XCircle className="h-4 w-4 inline mr-2" />
                                    Cancel
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStatusChange(event._id, 'active')}
                                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                  >
                                    <CheckCircle className="h-4 w-4 inline mr-2" />
                                    Publish
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteEvent(event._id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                  <Trash2 className="h-4 w-4 inline mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalEvents)} of {totalEvents} events
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Event Details</h3>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
                </div>

              {/* Event Content */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-2">
                      <p><span className="font-medium">Title:</span> {selectedEvent.title}</p>
                      <p><span className="font-medium">Category:</span> {selectedEvent.category}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                          {getStatusIcon(selectedEvent.status)}
                          <span className="ml-1">{selectedEvent.status}</span>
                        </span>
                      </p>
                      <p><span className="font-medium">Visibility:</span> {selectedEvent.visibility}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Date & Time</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Date:</span> {formatDate(selectedEvent.date)}</p>
                      <p><span className="font-medium">Time:</span> {formatTime(selectedEvent.time)}</p>
                      {selectedEvent.endTime && (
                        <p><span className="font-medium">End Time:</span> {formatTime(selectedEvent.endTime)}</p>
                      )}
                      {selectedEvent.endDate && (
                        <p><span className="font-medium">End Date:</span> {formatDate(selectedEvent.endDate)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Location</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Location:</span> {selectedEvent.location}</p>
                    {selectedEvent.venue?.name && (
                      <p><span className="font-medium">Venue:</span> {selectedEvent.venue.name}</p>
                    )}
                    {selectedEvent.venue?.address && (
                      <p><span className="font-medium">Address:</span> {selectedEvent.venue.address}</p>
                    )}
                    {selectedEvent.venue?.city && (
                      <p><span className="font-medium">City:</span> {selectedEvent.venue.city}</p>
                    )}
                    {selectedEvent.venue?.capacity && (
                      <p><span className="font-medium">Capacity:</span> {selectedEvent.venue.capacity}</p>
                    )}
                  </div>
                  </div>
                  
                {/* Capacity & Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Capacity</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Max Attendees:</span> {selectedEvent.maxAttendees}</p>
                      <p><span className="font-medium">Current Attendees:</span> {selectedEvent.currentAttendees}</p>
                      <p><span className="font-medium">Available Spots:</span> {selectedEvent.maxAttendees - selectedEvent.currentAttendees}</p>
                      <p><span className="font-medium">Waitlist Count:</span> {selectedEvent.waitlistCount}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">Price:</span> {selectedEvent.price === 0 ? 'Free' : `${selectedEvent.currency} ${selectedEvent.price}`}</p>
                      {selectedEvent.earlyBirdPrice && (
                        <p><span className="font-medium">Early Bird Price:</span> {selectedEvent.currency} {selectedEvent.earlyBirdPrice}</p>
                      )}
                      {selectedEvent.earlyBirdEndDate && (
                        <p><span className="font-medium">Early Bird End:</span> {formatDate(selectedEvent.earlyBirdEndDate)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>

                {/* Organizer */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Organizer</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedEvent.organizer?.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedEvent.organizer?.email}</p>
                    {selectedEvent.organizer?.phone && (
                      <p><span className="font-medium">Phone:</span> {selectedEvent.organizer.phone}</p>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedEvent.statistics?.views || 0}</div>
                      <div className="text-sm text-blue-600">Views</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedEvent.statistics?.shares || 0}</div>
                      <div className="text-sm text-green-600">Shares</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedEvent.statistics?.likes || 0}</div>
                      <div className="text-sm text-red-600">Likes</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedEvent.statistics?.registrationRate || 0}%</div>
                      <div className="text-sm text-purple-600">Registration Rate</div>
                    </div>
                  </div>
                </div>

                {/* Created/Updated Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Created</h4>
                    <p>{new Date(selectedEvent.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Last Updated</h4>
                    <p>{new Date(selectedEvent.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <Link
                  to={`/admin/events/edit/${selectedEvent._id}`}
                  className="btn-primary"
                  onClick={() => setShowEventDetails(false)}
                >
                  Edit Event
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminEvents