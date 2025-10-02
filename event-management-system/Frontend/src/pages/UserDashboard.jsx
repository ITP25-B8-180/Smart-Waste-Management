import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Settings,
  Bell
} from 'lucide-react'
import { format } from 'date-fns'

const UserDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState({
    notifications: { email: true, push: true },
    theme: 'light'
  })

  useEffect(() => {
    loadUserStats()
    loadUserPreferences()
  }, [])

  const loadUserStats = async () => {
    try {
      const response = await api.get(`/users/${user.id}/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserPreferences = async () => {
    try {
      // For now, we'll use default preferences
      // In a real app, you'd fetch from the API
      setPreferences({
        notifications: { email: true, push: true },
        theme: 'light'
      })
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const updatePreferences = async (newPreferences) => {
    try {
      await api.put(`/users/${user.id}/preferences`, newPreferences)
      setPreferences(newPreferences)
    } catch (error) {
      console.error('Error updating preferences:', error)
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
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {/* User Profile Card */}
      <div className="card mb-8">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
                {user.isEmailVerified ? (
                  <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 ml-1 text-yellow-500" />
                )}
              </div>
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {user.phone}
                </div>
              )}
              {user.address && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {user.address}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
              <span>Member since {format(new Date(user.createdAt || stats?.memberSince), 'MMM yyyy')}</span>
              {stats?.lastLogin && (
                <span>Last login {format(new Date(stats.lastLogin), 'MMM dd, yyyy')}</span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="btn-secondary">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.approvedBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${stats?.totalSpent || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/events" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Browse Events</p>
                <p className="text-sm text-gray-600">Discover new events to attend</p>
              </div>
            </a>
            <a href="/bookings" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Bookings</p>
                <p className="text-sm text-gray-600">Manage your event bookings</p>
              </div>
            </a>
            <a href="/profile" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <User className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Edit Profile</p>
                <p className="text-sm text-gray-600">Update your personal information</p>
              </div>
            </a>
          </div>
        </div>

        {/* Account Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Email Verification</span>
              </div>
              {user.isEmailVerified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pending
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Account Status</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">Notifications</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
