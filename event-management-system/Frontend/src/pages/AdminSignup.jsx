import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Shield, Building, Key, Copy } from 'lucide-react'

const AdminSignup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showAdminKey, setShowAdminKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm()
  const password = watch('password')

  // Auto-generate admin key when component mounts
  useEffect(() => {
    generateAdminKey()
  }, [])

  const generateAdminKey = async () => {
    setIsGeneratingKey(true)
    try {
      const response = await api.get('/auth/generate-admin-key')
      if (response.data.success) {
        const newKey = response.data.adminKey
        setAdminKey(newKey)
        setValue('adminKey', newKey)
        toast.success('Admin key generated successfully!')
      }
    } catch (error) {
      console.error('Error generating admin key:', error)
      toast.error('Failed to generate admin key')
    } finally {
      setIsGeneratingKey(false)
    }
  }

  const copyAdminKey = () => {
    if (adminKey) {
      navigator.clipboard.writeText(adminKey)
      toast.success('Admin key copied to clipboard!')
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Add admin role and admin key to the registration data
      const adminData = {
        ...data,
        role: 'admin'
      }
      
      const result = await registerUser(adminData)
      if (result.success) {
        toast.success('Admin account created successfully!')
        navigate('/admin-welcome')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An error occurred during admin registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Admin Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create an administrator account to manage the event system
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input-field pl-10"
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input-field pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('address')}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                Organization
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('organization')}
                  type="text"
                  className="input-field pl-10"
                  placeholder="Enter your organization name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Password must contain uppercase, lowercase, number and special character'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10"
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="adminKey" className="block text-sm font-medium text-gray-700">
                Admin Access Key *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                  <input
                    {...register('adminKey', { 
                      required: adminKey ? false : 'Please wait while admin key is being generated...'
                    })}
                    type={showAdminKey ? 'text' : 'password'}
                    className="input-field pl-10 pr-20"
                    placeholder={isGeneratingKey ? "Generating admin key..." : "Admin key will be auto-generated"}
                    value={adminKey}
                    readOnly
                  />
                {isGeneratingKey && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  </div>
                )}
                <div className="absolute inset-y-0 right-0 flex items-center">
                  {adminKey && (
                    <button
                      type="button"
                      onClick={copyAdminKey}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Copy admin key"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                  >
                    {showAdminKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {errors.adminKey && (
                <p className="mt-1 text-sm text-red-600">{errors.adminKey.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {isGeneratingKey ? "Generating your unique admin access key..." : ""}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Admin Account Benefits
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Full access to event management system</li>
                    <li>User management and analytics</li>
                    <li>System configuration and settings</li>
                    <li>Advanced reporting and insights</li>
                    <li>Auto-generated secure access key</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || isGeneratingKey || !adminKey}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isGeneratingKey ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Admin Key...
                </>
              ) : !adminKey ? (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Waiting for Admin Key...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Create Admin Account
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an admin account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Need a regular user account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Register as user
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminSignup
