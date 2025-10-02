import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Tag, 
  Image, 
  Save, 
  ArrowLeft,
  Plus,
  Trash2,
  Upload
} from 'lucide-react'

const EditEvent = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [images, setImages] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [agenda, setAgenda] = useState([])

  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm()

  const categories = [
    'conference', 'workshop', 'seminar', 'meeting', 'party', 
    'networking', 'training', 'exhibition', 'concert', 'sports', 'other'
  ]

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  const statuses = ['draft', 'active', 'cancelled', 'completed', 'postponed']
  const visibilityOptions = ['public', 'private', 'invite-only']

  useEffect(() => {
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      setLoadingEvent(true)
      const response = await api.get(`/events/${id}`)
      const event = response.data

      // Check if user is authorized to edit this event
      if (user.role !== 'admin' && event.organizer._id !== user.id) {
        toast.error('You are not authorized to edit this event')
        navigate('/admin/events')
        return
      }

      // Set form values
      reset({
        title: event.title,
        description: event.description,
        shortDescription: event.shortDescription,
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        time: event.time,
        endTime: event.endTime,
        location: event.location,
        category: event.category,
        subcategory: event.subcategory,
        tags: event.tags ? event.tags.join(', ') : '',
        maxAttendees: event.maxAttendees,
        price: event.price,
        currency: event.currency,
        earlyBirdPrice: event.earlyBirdPrice,
        earlyBirdEndDate: event.earlyBirdEndDate ? new Date(event.earlyBirdEndDate).toISOString().split('T')[0] : '',
        status: event.status,
        visibility: event.visibility,
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
        cancellationDeadline: event.cancellationDeadline ? new Date(event.cancellationDeadline).toISOString().slice(0, 16) : '',
        allowWaitlist: event.settings?.allowWaitlist,
        allowCancellation: event.settings?.allowCancellation,
        sendReminders: event.settings?.sendReminders,
        // Venue fields
        'venue.name': event.venue?.name,
        'venue.capacity': event.venue?.capacity,
        'venue.address': event.venue?.address,
        'venue.city': event.venue?.city,
        'venue.state': event.venue?.state,
        'venue.zipCode': event.venue?.zipCode,
        'venue.country': event.venue?.country
      })

      // Set images, speakers, and agenda
      setImages(event.images || [])
      setSpeakers(event.speakers || [])
      setAgenda(event.agenda || [])
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event')
      navigate('/admin/events')
    } finally {
      setLoadingEvent(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Process tags
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        images,
        speakers,
        agenda
      }

      const response = await api.put(`/events/${id}`, processedData)
      toast.success('Event updated successfully!')
      navigate('/admin/events')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    } finally {
      setIsLoading(false)
    }
  }

  const addSpeaker = () => {
    setSpeakers([...speakers, {
      name: '',
      title: '',
      company: '',
      bio: '',
      image: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        website: ''
      }
    }])
  }

  const updateSpeaker = (index, field, value) => {
    const updatedSpeakers = [...speakers]
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      updatedSpeakers[index][parent][child] = value
    } else {
      updatedSpeakers[index][field] = value
    }
    setSpeakers(updatedSpeakers)
  }

  const removeSpeaker = (index) => {
    setSpeakers(speakers.filter((_, i) => i !== index))
  }

  const addAgendaItem = () => {
    setAgenda([...agenda, {
      time: '',
      title: '',
      description: '',
      speaker: '',
      duration: 30
    }])
  }

  const updateAgendaItem = (index, field, value) => {
    const updatedAgenda = [...agenda]
    updatedAgenda[index][field] = value
    setAgenda(updatedAgenda)
  }

  const removeAgendaItem = (index) => {
    setAgenda(agenda.filter((_, i) => i !== index))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      isPrimary: images.length === 0
    }))
    setImages([...images, ...newImages])
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const setPrimaryImage = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    setImages(updatedImages)
  }

  if (loadingEvent) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/events')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-primary-600" />
                Edit Event
              </h1>
              <p className="text-gray-600">Update event details and settings</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="input-field"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="input-field"
                placeholder="Describe your event"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                {...register('shortDescription')}
                type="text"
                className="input-field"
                placeholder="Brief description (max 200 chars)"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                {...register('subcategory')}
                type="text"
                className="input-field"
                placeholder="e.g., Tech Conference, Music Festival"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input-field"
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary-600" />
            Date & Time
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
                <input
                {...register('date', { required: 'Date is required' })}
                  type="date"
                className="input-field"
                />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                {...register('endDate')}
                type="date"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                {...register('time', { required: 'Time is required' })}
                type="time"
                className="input-field"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                {...register('endTime')}
                type="time"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
            Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
                <input
                {...register('location', { required: 'Location is required' })}
                  type="text"
                className="input-field"
                  placeholder="Enter event location"
                />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name
              </label>
              <input
                {...register('venue.name')}
                type="text"
                className="input-field"
                placeholder="e.g., Convention Center"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Capacity
              </label>
              <input
                {...register('venue.capacity', { valueAsNumber: true })}
                type="number"
                className="input-field"
                placeholder="Maximum capacity"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                {...register('venue.address')}
                type="text"
                className="input-field"
                placeholder="Street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                {...register('venue.city')}
                type="text"
                className="input-field"
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                {...register('venue.state')}
                type="text"
                className="input-field"
                placeholder="State/Province"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                {...register('venue.zipCode')}
                type="text"
                className="input-field"
                placeholder="ZIP/Postal code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                {...register('venue.country')}
                type="text"
                className="input-field"
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* Capacity & Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary-600" />
            Capacity & Pricing
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Attendees *
              </label>
                <input
                  {...register('maxAttendees', { 
                  required: 'Max attendees is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be at least 1' }
                  })}
                  type="number"
                className="input-field"
                placeholder="Maximum number of attendees"
                  min="1"
                />
              {errors.maxAttendees && (
                <p className="mt-1 text-sm text-red-600">{errors.maxAttendees.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="flex">
                <select
                  {...register('currency')}
                  className="border border-gray-300 rounded-l-md px-3 py-2 border-r-0"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
                <input
                  {...register('price', { valueAsNumber: true, min: 0 })}
                  type="number"
                  className="input-field rounded-l-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Early Bird Price
              </label>
              <input
                {...register('earlyBirdPrice', { valueAsNumber: true, min: 0 })}
                type="number"
                className="input-field"
                placeholder="Early bird price"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Early Bird End Date
              </label>
              <input
                {...register('earlyBirdEndDate')}
                type="date"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Event Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Tag className="h-5 w-5 mr-2 text-primary-600" />
            Event Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="input-field"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                {...register('visibility')}
                className="input-field"
              >
                {visibilityOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
                </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Deadline
              </label>
              <input
                {...register('registrationDeadline')}
                type="datetime-local"
                className="input-field"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Deadline
              </label>
              <input
                {...register('cancellationDeadline')}
                type="datetime-local"
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                {...register('allowWaitlist')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Allow waitlist when event is full
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register('allowCancellation')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Allow attendees to cancel their registration
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register('sendReminders')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Send reminder emails to attendees
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Image className="h-5 w-5 mr-2 text-primary-600" />
            Event Images
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="input-field"
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="bg-blue-600 text-white p-1 rounded text-xs"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-600 text-white p-1 rounded text-xs"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {image.isPrimary && (
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Speakers */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Speakers</h2>
            <button
              type="button"
              onClick={addSpeaker}
              className="btn-secondary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Speaker
            </button>
          </div>

          {speakers.map((speaker, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Speaker {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeSpeaker(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={speaker.name}
                    onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                    className="input-field"
                    placeholder="Speaker name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={speaker.title}
                    onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                    className="input-field"
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={speaker.company}
                    onChange={(e) => updateSpeaker(index, 'company', e.target.value)}
                    className="input-field"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={speaker.image}
                    onChange={(e) => updateSpeaker(index, 'image', e.target.value)}
                    className="input-field"
                    placeholder="Speaker image URL"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={speaker.bio}
                    onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Speaker biography"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Agenda */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Event Agenda</h2>
            <button
              type="button"
              onClick={addAgendaItem}
              className="btn-secondary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Agenda Item
            </button>
          </div>

          {agenda.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Agenda Item {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeAgendaItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={item.time}
                    onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={item.duration}
                    onChange={(e) => updateAgendaItem(index, 'duration', parseInt(e.target.value))}
                    className="input-field"
                    min="1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                    className="input-field"
                    placeholder="Session title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speaker
                  </label>
                  <input
                    type="text"
                    value={item.speaker}
                    onChange={(e) => updateAgendaItem(index, 'speaker', e.target.value)}
                    className="input-field"
                    placeholder="Speaker name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Session description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Update Event
            </button>
          </div>
        </form>
    </div>
  )
}

export default EditEvent