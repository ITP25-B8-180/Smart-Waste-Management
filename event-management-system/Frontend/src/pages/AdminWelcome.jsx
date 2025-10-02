import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Shield, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  BookOpen,
  ArrowRight,
  CheckCircle,
  Key
} from 'lucide-react'

const AdminWelcome = () => {
  const { user } = useAuth()

  const adminFeatures = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "User Management",
      description: "Manage all users, view analytics, and control access permissions",
      link: "/admin/users",
      color: "bg-blue-50 border-blue-200"
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "Event Management",
      description: "Create, edit, and manage all events with advanced filtering and analytics",
      link: "/admin/events",
      color: "bg-green-50 border-green-200"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Analytics & Reports",
      description: "View comprehensive reports and analytics for events and users",
      link: "/admin/reports",
      color: "bg-purple-50 border-purple-200"
    },
    {
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      title: "System Settings",
      description: "Configure system settings, notifications, and admin preferences",
      link: "/admin/settings",
      color: "bg-gray-50 border-gray-200"
    },
    {
      icon: <Key className="h-8 w-8 text-orange-600" />,
      title: "Admin Key Manager",
      description: "Generate and manage admin access keys for new administrators",
      link: "/admin/keys",
      color: "bg-orange-50 border-orange-200"
    }
  ]

  const quickActions = [
    {
      title: "Create New Event",
      description: "Set up a new event with all the details",
      link: "/create-event",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      title: "View All Users",
      description: "See all registered users and their activity",
      link: "/admin/users",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Event Analytics",
      description: "Check event performance and statistics",
      link: "/admin/events",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: "System Overview",
      description: "Get a complete overview of the system",
      link: "/admin",
      icon: <Shield className="h-5 w-5" />
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <div className="mx-auto h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center mb-6">
          <Shield className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Admin Dashboard, {user?.name}!
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          You now have full administrative access to the Event Management System. 
          Use the tools below to manage users, events, and system settings.
        </p>
        <div className="flex items-center justify-center mt-4 text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Admin account successfully created</span>
        </div>
      </div>

      {/* Admin Features Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Administrative Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminFeatures.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className={`${feature.color} border rounded-lg p-6 hover:shadow-lg transition-all duration-200 group`}
            >
              <div className="flex items-center justify-between mb-4">
                {feature.icon}
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center mb-3">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  {action.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors ml-auto" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-8">
        <div className="flex items-start">
          <div className="p-3 bg-primary-100 rounded-lg mr-4">
            <BookOpen className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Getting Started Guide
            </h3>
            <p className="text-gray-600 mb-4">
              New to the admin panel? Here's what you can do to get started:
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Create your first event using the Event Management system</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Review and manage user registrations</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Set up system notifications and preferences</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span>Explore analytics and reporting features</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Security Notice
            </h3>
            <p className="text-yellow-700 text-sm">
              As an administrator, you have access to sensitive system data and user information. 
              Please ensure you follow security best practices and only access information necessary for your role.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminWelcome
