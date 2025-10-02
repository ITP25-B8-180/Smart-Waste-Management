import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Tag, 
  Share2, 
  Heart,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Globe,
  Twitter,
  Linkedin,
  Instagram,
  Facebook
} from 'lucide-react'

const EventDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [userBooking, setUserBooking] = useState(null)


  useEffect(() => {
    loadEvent()
  }, [id, user])

  const loadEvent = async () => {
    try {
      setLoading(true)
      // Validate event ID
      if (!id || id.length < 10) {
        throw new Error('Invalid event ID')
      }
      
      const response = await api.get(`/events/${id}`)
      setEvent(response.data)
      
      // Check if user has booked this event (only if user is logged in)
      if (user && user.id) {
        try {
          const bookingResponse = await api.get(`/bookings/event/${id}`)
          const bookings = bookingResponse.data
          setIsBooked(bookings.length > 0)
          setUserBooking(bookings.length > 0 ? bookings[0] : null)
        } catch (error) {
          // User hasn't booked this event - this is normal
          setIsBooked(false)
          setUserBooking(null)
        }
      } else {
        // User not logged in - reset booking state
        setIsBooked(false)
        setUserBooking(null)
      }
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error(`Failed to load event details: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to check if registration is open
  const isRegistrationOpen = (event) => {
    if (!event) return false
    if (event.status !== 'active') return false
    if (event.currentAttendees >= event.maxAttendees) return false
    
    // Check if registration deadline has passed
    if (event.registrationDeadline) {
      const deadline = new Date(event.registrationDeadline)
      const now = new Date()
      if (now > deadline) return false
    }
    
    // Check if event date has passed
    const eventDate = new Date(event.date)
    const now = new Date()
    if (now > eventDate) return false
    
    return true
  }

  const handleBookEvent = async () => {
    if (!user) {
      toast.error('Please login to book this event')
      return
    }

    if (isBooked) {
      toast.error('You have already booked this event')
      return
    }

    if (!isRegistrationOpen(event)) {
      toast.error('Registration is not open for this event')
      return
    }

    try {
      setBookingLoading(true)
      await api.post('/bookings', { eventId: id })
      toast.success('Booking request submitted! Waiting for approval.')
      setIsBooked(true)
      // Reload event to update attendee count
      loadEvent()
    } catch (error) {
      console.error('Error booking event:', error)
      toast.error('Failed to book event')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    // TODO: Implement like functionality
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Event link copied to clipboard!')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />
      case 'completed': return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'draft': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'postponed': return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  // Add defensive checks for event properties
  if (!event.title || !event.date || !event.time || !event.location) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Event Data</h2>
          <p className="text-gray-600 mb-6">This event has incomplete information and cannot be displayed.</p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            to="/events"
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status || 'active')}`}>
              {getStatusIcon(event.status || 'active')}
              <span className="ml-2">{event.status || 'active'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title || 'Untitled Event'}</h1>
                <p className="text-gray-600">{event.shortDescription || event.description || 'No description available'}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full ${
                    isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {event.image && (
              <div className="mb-6">
              <img
                src={event.image}
                alt={event.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>
        </div>

          {/* Event Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Date & Time</h3>
                  <p className="text-gray-600">{formatDate(event.date)}</p>
                  <p className="text-gray-600">{formatTime(event.time)}</p>
                  {event.endTime && (
                    <p className="text-gray-600">to {formatTime(event.endTime)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                  {event.venue?.name && (
                    <p className="text-gray-600">{event.venue.name}</p>
                  )}
                  {event.venue?.address && (
                    <p className="text-gray-600">{event.venue.address}</p>
                  )}
                  {event.venue?.city && event.venue?.state && (
                    <p className="text-gray-600">{event.venue.city}, {event.venue.state}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <Users className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Capacity</h3>
                  <p className="text-gray-600">{event.currentAttendees} / {event.maxAttendees} attendees</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-primary-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Price</h3>
                  <p className="text-gray-600">
                    {event.price === 0 ? 'Free' : `${event.currency} ${event.price}`}
                  </p>
                  {event.earlyBirdPrice && event.earlyBirdEndDate && new Date() < new Date(event.earlyBirdEndDate) && (
                    <p className="text-green-600 font-medium">
                      Early Bird: {event.currency} {event.earlyBirdPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Speakers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    {speaker.image && (
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{speaker.name}</h3>
                      {speaker.title && (
                        <p className="text-gray-600">{speaker.title}</p>
                      )}
                      {speaker.company && (
                        <p className="text-gray-600">{speaker.company}</p>
                      )}
                      {speaker.bio && (
                        <p className="text-gray-600 text-sm mt-2">{speaker.bio}</p>
                      )}
                      {speaker.socialLinks && (
                        <div className="flex space-x-2 mt-2">
                          {speaker.socialLinks.linkedin && (
                            <a
                              href={speaker.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {speaker.socialLinks.twitter && (
                            <a
                              href={speaker.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-600"
                            >
                              <Twitter className="h-4 w-4" />
                            </a>
                          )}
                          {speaker.socialLinks.website && (
                            <a
                              href={speaker.socialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Agenda</h2>
              <div className="space-y-4">
                {event.agenda.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">{item.time}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      {item.speaker && (
                        <p className="text-gray-600 text-sm">by {item.speaker}</p>
                      )}
                      {item.description && (
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      )}
                      {item.duration && (
                        <p className="text-gray-500 text-xs mt-1">{item.duration} minutes</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
                  </div>
                  
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {event.price === 0 ? 'Free' : `${event.currency} ${event.price}`}
              </div>
              {event.earlyBirdPrice && event.earlyBirdEndDate && new Date() < new Date(event.earlyBirdEndDate) && (
                <div className="text-green-600 font-medium">
                  Early Bird: {event.currency} {event.earlyBirdPrice}
                </div>
              )}
            </div>

            {event.status === 'cancelled' ? (
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Event Cancelled</h3>
                {event.cancellationReason && (
                  <p className="text-gray-600 text-sm">{event.cancellationReason}</p>
                )}
              </div>
            ) : event.status === 'completed' ? (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Event Completed</h3>
                <p className="text-gray-600 text-sm">This event has already taken place.</p>
              </div>
            ) : !isRegistrationOpen(event) ? (
              <div className="text-center">
                <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Registration Closed</h3>
                <p className="text-gray-600 text-sm">Registration is no longer available for this event.</p>
              </div>
            ) : isBooked ? (
              <div className="text-center">
                {userBooking?.status === 'pending' ? (
                  <>
                    <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Pending</h3>
                    <p className="text-gray-600 text-sm">Your booking request is waiting for approval.</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-4 w-4 mr-1" />
                        Pending Approval
                      </span>
                    </div>
                  </>
                ) : userBooking?.status === 'approved' ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Approved!</h3>
                    <p className="text-gray-600 text-sm">You have successfully registered for this event.</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmed
                      </span>
                    </div>
                  </>
                ) : userBooking?.status === 'rejected' ? (
                  <>
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Rejected</h3>
                    <p className="text-gray-600 text-sm">Your booking request was not approved.</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejected
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">You're Registered!</h3>
                    <p className="text-gray-600 text-sm">You have successfully registered for this event.</p>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleBookEvent}
                disabled={bookingLoading || !user}
                className="w-full btn-primary"
              >
                {bookingLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : !user ? (
                  'Login to Book'
                ) : (
                  'Request Booking'
                )}
              </button>
            )}

            {!user && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Need to login to book this event?</p>
                <Link to="/login" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Sign in here
                </Link>
              </div>
            )}
          </div>

          {/* Organizer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{event.organizer?.name || 'Unknown Organizer'}</h4>
                <p className="text-gray-600 text-sm">{event.organizer?.email || 'No email available'}</p>
              </div>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Tag className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm text-gray-900 ml-2 capitalize">{event.category}</span>
              </div>
              {event.subcategory && (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Subcategory:</span>
                  <span className="text-sm text-gray-900 ml-2">{event.subcategory}</span>
                </div>
              )}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <Tag className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-600">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-7">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
                  </div>
                    </div>
                    
          {/* Social Media */}
          {event.socialMedia && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow This Event</h3>
              <div className="flex space-x-3">
                {event.socialMedia.facebookEvent && (
                  <a
                    href={event.socialMedia.facebookEvent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {event.socialMedia.twitterHandle && (
                  <a
                    href={`https://twitter.com/${event.socialMedia.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {event.socialMedia.instagramHandle && (
                  <a
                    href={`https://instagram.com/${event.socialMedia.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
              {event.socialMedia.hashtags && event.socialMedia.hashtags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Hashtags:</p>
                  <div className="flex flex-wrap gap-1">
                    {event.socialMedia.hashtags.map((hashtag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        #{hashtag}
                      </span>
                    ))}
                  </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetails