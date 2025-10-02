import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { Bell, Check, CheckCheck, Trash2, Calendar, BookOpen, X } from 'lucide-react'
import { format } from 'date-fns'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadNotifications()
  }, [filter])

  const loadNotifications = async () => {
    try {
      const params = new URLSearchParams()
      if (filter === 'unread') params.append('unreadOnly', 'true')
      
      const response = await api.get(`/notifications?${params}`)
      setNotifications(response.data.notifications)
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications(notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications(notifications.filter(notification => notification._id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_approved':
        return <Check className="h-5 w-5 text-green-600" />
      case 'booking_rejected':
        return <X className="h-5 w-5 text-red-600" />
      case 'booking_cancelled':
        return <X className="h-5 w-5 text-red-600" />
      case 'event_updated':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'event_cancelled':
        return <X className="h-5 w-5 text-red-600" />
      case 'event_reminder':
        return <Bell className="h-5 w-5 text-yellow-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_approved':
        return 'bg-green-50 border-green-200'
      case 'booking_rejected':
        return 'bg-red-50 border-red-200'
      case 'booking_cancelled':
        return 'bg-red-50 border-red-200'
      case 'event_updated':
        return 'bg-blue-50 border-blue-200'
      case 'event_cancelled':
        return 'bg-red-50 border-red-200'
      case 'event_reminder':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with your bookings and events</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-secondary flex items-center"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Notifications', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount }
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

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </h3>
          <p className="text-gray-500">
            {filter === 'unread' 
              ? 'You\'re all caught up!' 
              : 'You\'ll see notifications about your bookings and events here.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                notification.isRead ? 'bg-white' : 'bg-blue-50'
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'
                    }`}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </p>
                  
                  {notification.relatedEvent && (
                    <div className="mt-2">
                      <a
                        href={`/events/${notification.relatedEvent._id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Event Details →
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-1 text-gray-400 hover:text-primary-600"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
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

export default Notifications
