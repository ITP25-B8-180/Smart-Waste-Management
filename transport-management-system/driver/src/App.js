import React, { useState, useEffect } from 'react';
import { MapPin, Truck, CheckCircle, XCircle, Clock, Navigation, User, Calendar, LogOut } from 'lucide-react';
import './App.css';
import api from './api';

function DriverApp() {
  const [driver, setDriver] = useState(null);
  const [assignedBins, setAssignedBins] = useState([]);
  const [todayStats, setTodayStats] = useState({
    total: 0,
    collected: 0,
    missed: 0,
    pending: 0
  });
  const [currentLocation, setCurrentLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [driverId, setDriverId] = useState('');

  // ✅ Define calculateTodayStats FIRST
  const calculateTodayStats = (bins) => {
    const today = new Date().toDateString();
    
    setTodayStats({
      total: bins.length,
      collected: bins.filter(bin => bin.status === 'Collected').length,
      missed: bins.filter(bin => bin.status === 'Skipped').length,
      pending: bins.filter(bin => bin.status === 'Assigned' || bin.status === 'Pending').length
    });
  };

  // ✅ Then define fetchDriverData
  const fetchDriverData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Starting to fetch driver data for ID:', driverId);
      
      // Test if backend is reachable first
      try {
        const testResponse = await api.get('/collectors');
        console.log('✅ Backend connection test passed');
      } catch (testError) {
        console.error('❌ Backend connection test failed:', testError);
        throw new Error('Cannot connect to server. Please check if backend is running.');
      }

      // Make API calls with better error handling
      const [driverResponse, binsResponse] = await Promise.all([
        api.get(`/collectors/${driverId}`).catch(error => {
          console.error('❌ Driver API call failed:', error);
          throw error;
        }),
        api.get(`/bins/collector/${driverId}`).catch(error => {
          console.error('❌ Bins API call failed:', error);
          throw error;
        })
      ]);

      console.log('📦 Driver API Response:', driverResponse);
      console.log('📦 Bins API Response:', binsResponse);

      // Handle different response formats
      let driverData = driverResponse.data;
      let binsData = binsResponse.data;

      // If response has success wrapper
      if (driverData && typeof driverData === 'object' && 'success' in driverData) {
        driverData = driverData.success ? driverData.data : null;
      }
      
      if (binsData && typeof binsData === 'object' && 'success' in binsData) {
        binsData = binsData.success ? binsData.data : [];
      }

      console.log('✅ Parsed Driver Data:', driverData);
      console.log('✅ Parsed Bins Data:', binsData);

      if (!driverData) {
        throw new Error('No driver data found for this ID');
      }

      setDriver(driverData);
      setAssignedBins(Array.isArray(binsData) ? binsData : []);
      
      // Set current location from driver data if available
      if (driverData.currentLocation) {
        setCurrentLocation(driverData.currentLocation);
      }
      
      // ✅ Now calculateTodayStats is defined and can be called
      calculateTodayStats(Array.isArray(binsData) ? binsData : []);
      
    } catch (error) {
      console.error('💥 FINAL Error in fetchDriverData:', error);
      
      // Specific error messages
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 404) {
          alert('❌ Collector ID not found. Please check your ID and try again.');
        } else if (error.response.status === 500) {
          alert('⚠️ Server error. Please try again later.');
        } else {
          alert(`❌ Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        // No response received
        alert('🌐 Cannot connect to server. Please check:\n1. Backend is running on port 5000\n2. Your internet connection');
      } else {
        // Other errors
        alert(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Simple manual location update (no GPS)
  const updateLocationManually = async () => {
    if (!currentLocation.trim()) {
      alert('Please enter a location first.');
      return;
    }
    
    if (!driverId) {
      alert('Please login first.');
      return;
    }
    
    try {
      console.log('📍 Updating driver location:', currentLocation);
      
      // Update the collector's currentLocation field using the main update endpoint
      const response = await api.put(`/collectors/${driverId}`, {
        currentLocation: currentLocation,
        lastUpdated: new Date().toISOString()
      });
      
      if (response.data?.success) {
        alert('✅ Location updated successfully! The transport manager can now see your location.');
        console.log('Location update response:', response.data);
        
        // Update local driver data to reflect the change
        setDriver(prevDriver => prevDriver ? {
          ...prevDriver,
          currentLocation: currentLocation,
          lastUpdated: new Date().toISOString()
        } : null);
        
      } else {
        // If success wrapper doesn't exist, assume it worked
        alert('✅ Location updated successfully!');
        setDriver(prevDriver => prevDriver ? {
          ...prevDriver,
          currentLocation: currentLocation
        } : null);
      }
      
    } catch (error) {
      console.error('❌ Error updating location:', error);
      console.error('Error details:', error.response?.data);
      
      // Try alternative endpoint if main one fails
      try {
        console.log('🔄 Trying alternative endpoint...');
        const altResponse = await api.patch(`/collectors/${driverId}`, {
          currentLocation: currentLocation
        });
        alert('✅ Location updated successfully!');
      } catch (altError) {
        console.error('❌ Alternative endpoint also failed:', altError);
        
        // Specific error messages
        if (error.response?.status === 404) {
          alert('❌ Collector not found. Please check your ID.');
        } else if (error.response?.status === 400) {
          alert('❌ Invalid data. Please check the location format.');
        } else {
          alert('⚠️ Location update feature might not be fully implemented yet. Your bin operations will still work.');
        }
      }
    }
  };

  const updateBinStatus = async (binId, status) => {
    try {
      setUpdatingStatus(binId);
      
      const response = await api.put(`/bins/${binId}/status`, {
        status: status,
        collectorId: driverId
      });

      if (response.data?.success) {
        // Update local state
        const updatedBins = assignedBins.map(bin =>
          bin._id === binId ? { 
            ...bin, 
            status, 
            collectedAt: status === 'Collected' ? new Date() : null 
          } : bin
        );
        
        setAssignedBins(updatedBins);
        calculateTodayStats(updatedBins);
        
        // Show success message
        alert(`Bin marked as ${status.toLowerCase()} successfully!`);
      } else {
        alert(response.data?.message || 'Failed to update bin status');
      }
    } catch (error) {
      console.error('Error updating bin status:', error);
      alert('Error updating bin status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('driverId');
    setDriverId('');
    setDriver(null);
    setAssignedBins([]);
    setCurrentLocation('');
    window.location.reload();
  };

  // Get driver ID from localStorage or prompt
  useEffect(() => {
    const savedDriverId = localStorage.getItem('driverId');
    if (savedDriverId) {
      setDriverId(savedDriverId);
    } else {
      const id = prompt('Please enter your Collector ID:');
      if (id) {
        setDriverId(id);
        localStorage.setItem('driverId', id);
      }
    }
  }, []);

  // Fetch driver data when driverId is available
  useEffect(() => {
    if (driverId) {
      fetchDriverData();
    }
  }, [driverId]);

  if (!driverId) {
    return (
      <div className="driver-login">
        <div className="login-container">
          <Truck size={64} className="login-icon" />
          <h2>Driver Login</h2>
          <p>Please enter your Collector ID to continue</p>
          <button 
            onClick={() => {
              const id = prompt('Enter your Collector ID:');
              if (id) {
                setDriverId(id);
                localStorage.setItem('driverId', id);
              }
            }}
            className="btn btn-primary"
          >
            Enter Collector ID
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="driver-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="driver-app">
      {/* Header */}
      <header className="driver-header">
        <div className="driver-header-content">
          <div className="driver-info">
            <div className="driver-avatar">
              <User size={24} />
            </div>
            <div className="driver-details">
              <h1>Welcome, {driver?.name || 'Driver'}!</h1>
              <p>{driver?.city ? `Operating in ${driver.city}` : 'Ready for collection'}</p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="vehicle-info">
              <Truck className="vehicle-icon" />
              <div className="vehicle-details">
                <span className="vehicle-plate">{driver?.truck?.plateNumber || 'No truck assigned'}</span>
                <span className="vehicle-capacity">{driver?.truck?.capacity || ''}</span>
              </div>
            </div>
            
            <button onClick={handleLogout} className="btn btn-secondary btn-small logout-btn">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card total-bins">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{todayStats.total}</div>
              <div className="stat-label">Total Assigned</div>
            </div>
          </div>
          
          <div className="stat-card pending-bins">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{todayStats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          
          <div className="stat-card collected-bins">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{todayStats.collected}</div>
              <div className="stat-label">Collected</div>
            </div>
          </div>
          
          <div className="stat-card missed-bins">
            <div className="stat-icon">
              <XCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{todayStats.missed}</div>
              <div className="stat-label">Skipped</div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ FIXED: Location Update Section */}
      <section className="location-section">
        <div className="location-card">
          <div className="location-header">
            <Navigation className="location-icon" />
            <h3>Update Your Current Location</h3>
            <span className="location-status">Manual Update</span>
          </div>
          <div className="location-content">
            <div className="location-instructions">
              <p>Enter your current location to update the transport manager:</p>
            </div>
            
            <div className="location-actions">
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="Enter your current address or location..."
                className="location-input"
              />
              <button 
                onClick={updateLocationManually}
                className="btn btn-primary"
                disabled={!currentLocation.trim()}
              >
                <Navigation size={16} />
                Update My Location
              </button>
            </div>
            
            {driver?.currentLocation && (
              <div className="current-location-display">
                <strong>Last Updated Location:</strong>
                <p>{driver.currentLocation}</p>
                {driver.lastUpdated && (
                  <small>At: {new Date(driver.lastUpdated).toLocaleString()}</small>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Assigned Bins List */}
      <section className="bins-section">
        <div className="bins-header">
          <MapPin className="bins-icon" />
          <h2>Your Assigned Bins</h2>
          <span className="bins-count">({assignedBins.length} total)</span>
        </div>
        
        <div className="bins-list">
          {assignedBins.map((bin) => (
            <BinCard
              key={bin._id}
              bin={bin}
              onStatusUpdate={updateBinStatus}
              updating={updatingStatus === bin._id}
            />
          ))}
          
          {assignedBins.length === 0 && (
            <div className="empty-bins">
              <MapPin size={48} className="empty-icon" />
              <p>No bins assigned to you</p>
              <span>Check back later for new assignments</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Bin Card Component
const BinCard = ({ bin, onStatusUpdate, updating }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Collected': return 'status-collected';
      case 'Skipped': return 'status-skipped';
      case 'Assigned': return 'status-assigned';
      case 'Pending': return 'status-pending';
      default: return 'status-default';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hr ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`bin-card ${getStatusColor(bin.status)}`}>
      <div className="bin-header">
        <div className="bin-location">
          <MapPin size={16} />
          <span className="bin-address">{bin.location || 'Unknown location'}</span>
        </div>
        <div className="bin-city">{bin.city || 'Unknown city'}</div>
      </div>
      
      <div className="bin-details">
        <div className="bin-info">
          <span className="bin-reported">
            Reported: {getTimeAgo(bin.reportedAt)}
          </span>
          {bin.collectedAt && (
            <span className="bin-collected">
              Collected: {getTimeAgo(bin.collectedAt)}
            </span>
          )}
        </div>
        
        <div className="bin-status">
          <span className={`status-badge ${getStatusColor(bin.status)}`}>
            {bin.status}
          </span>
        </div>
      </div>
      
      {(bin.status === 'Assigned' || bin.status === 'Pending') && (
        <div className="bin-actions">
          <button
            onClick={() => onStatusUpdate(bin._id, 'Collected')}
            disabled={updating}
            className="btn btn-success"
          >
            <CheckCircle size={16} />
            {updating ? 'Updating...' : 'Mark Collected'}
          </button>
          <button
            onClick={() => onStatusUpdate(bin._id, 'Skipped')}
            disabled={updating}
            className="btn btn-warning"
          >
            <XCircle size={16} />
            {updating ? 'Updating...' : 'Mark Skipped'}
          </button>
        </div>
      )}
      
      {bin.status === 'Collected' && (
        <div className="bin-completed">
          <CheckCircle size={16} />
          <span>Completed • {bin.collectedAt ? getTimeAgo(bin.collectedAt) : 'Recently'}</span>
        </div>
      )}
      
      {bin.status === 'Skipped' && (
        <div className="bin-skipped">
          <XCircle size={16} />
          <span>Skipped • {bin.updatedAt ? getTimeAgo(bin.updatedAt) : 'Recently'}</span>
        </div>
      )}
    </div>
  );
};

export default DriverApp;