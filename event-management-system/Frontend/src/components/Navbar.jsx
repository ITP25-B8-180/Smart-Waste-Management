import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, Calendar, User, LogOut, Settings, Users, BarChart3, Bell, BookOpen } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsProfileOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">EventManager</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Events
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/bookings" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  My Bookings
                </Link>
                <Link to="/notifications" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <Bell className="h-4 w-4 mr-1" />
                  Notifications
                </Link>
                
                {isAdmin && (
                  <div className="relative group">
                    <button className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      Admin
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                      <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link to="/admin/users" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Users className="h-4 w-4 mr-2" />
                        Users
                      </Link>
                      <Link to="/admin/events" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Calendar className="h-4 w-4 mr-2" />
                        Events
                      </Link>
                      <Link to="/admin/pending-bookings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Pending Bookings
                      </Link>
                      <Link to="/admin/reports" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Reports
                      </Link>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <User className="h-5 w-5" />
                    <span>{user?.name}</span>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link to="/" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                Home
              </Link>
              <Link to="/events" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                Events
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                    Dashboard
                  </Link>
                  <Link to="/bookings" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                    My Bookings
                  </Link>
                  <Link to="/notifications" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <Link to="/admin" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/users" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                        Manage Users
                      </Link>
                      <Link to="/admin/events" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                        Manage Events
                      </Link>
                      <Link to="/admin/pending-bookings" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                        Pending Bookings
                      </Link>
                      <Link to="/admin/reports" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                        Reports & Analytics
                      </Link>
                    </>
                  )}
                  
                  <Link to="/profile" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white block px-3 py-2 rounded-md text-base font-medium">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
