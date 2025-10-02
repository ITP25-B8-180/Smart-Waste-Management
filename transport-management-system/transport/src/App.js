// src/App.js
import React, { useState, useEffect } from 'react';
import { MapPin, Users, Truck, TrendingUp, Filter, Plus, Edit, Trash2, Eye, Clock, RotateCcw, Search } from 'lucide-react';
import './App.css';
import api from './api';

function App() {
  const [activeTab, setActiveTab] = useState('bins');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for data from backend
  const [fullBins, setFullBins] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [binsResponse, collectorsResponse, trucksResponse] = await Promise.all([
        api.get('/bins'),
        api.get('/collectors'),
        api.get('/trucks')
      ]);

      console.log('Bins response:', binsResponse);
      console.log('Collectors response:', collectorsResponse);
      console.log('Trucks response:', trucksResponse);

      const unwrap = (r) => (r.data && r.data.success !== undefined)
        ? (r.data.success ? r.data.data : [])
        : r.data;

      setFullBins(unwrap(binsResponse) || []);
      setCollectors(unwrap(collectorsResponse) || []);
      setTrucks(unwrap(trucksResponse) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Backend request failed. Check server and routes.');
    } finally {
      setLoading(false);
    }
  };

  // ========== BIN MANAGEMENT FUNCTIONS ==========
  // Assign collector to a bin (for Pending/Assigned bins)
  const assignCollector = async (binId, collectorId) => {
    try {
      // ========== VALIDATION: Check if collector is selected ==========
      if (!collectorId) {
        alert('Please select a collector');
        return;
      }

      console.log('Assigning collector:', { binId, collectorId });

      const response = await api.put(`/bins/${binId}/assign-collector`, { 
        collectorId
      });
      
      const { data } = response;
      console.log('Assign response:', data);

      if (data.success) {
        fetchData();
        alert('Collector assigned successfully!');
      } else {
        alert(data.message || 'Failed to assign collector');
      }
    } catch (error) {
      console.error('Error assigning collector:', error);
      alert('Error assigning collector. Please try again.');
    }
  };

  // Reassign collector to a skipped bin
  const reassignSkippedBin = async (binId, collectorId) => {
    try {
      // ========== VALIDATION: Check if collector is selected ==========
      if (!collectorId) {
        alert('Please select a collector');
        return;
      }

      console.log('Reassigning skipped bin:', { binId, collectorId });

      const response = await api.put(`/bins/${binId}/reassign`, { 
        collectorId,
        status: 'Assigned' // Set status to Assigned when reassigning
      });
      
      const { data } = response;
      console.log('Reassign response:', data);

      if (data.success) {
        fetchData();
        alert('Skipped bin reassigned successfully!');
      } else {
        alert(data.message || 'Failed to reassign bin: ' + data.message);
      }
    } catch (error) {
      console.error('Error reassigning bin:', error);
      console.log('Error details:', error.response?.data);
      alert('Error reassigning bin. Please check console for details.');
    }
  };

  // Reset bin status to Pending (for reassignment)
  const resetBinStatus = async (binId) => {
    try {
      console.log('Resetting bin status:', binId);

      const response = await api.put(`/bins/${binId}/reset-status`, {
        status: 'Pending'
      });
      
      const { data } = response;
      console.log('Reset status response:', data);

      if (data.success) {
        fetchData();
        alert('Bin status reset to Pending!');
      } else {
        alert(data.message || 'Failed to reset bin status');
      }
    } catch (error) {
      console.error('Error resetting bin status:', error);
      alert('Error resetting bin status. Please try again.');
    }
  };

  const deleteBin = async (id) => {
    // ========== VALIDATION: Confirmation dialog ==========
    if (!window.confirm('Are you sure you want to delete this bin?')) return;

    try {
      const response = await api.delete(`/bins/${id}`);
      const { data } = response;

      if (data.success) {
        fetchData();
        alert('Bin deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete bin');
      }
    } catch (error) {
      console.error('Error deleting bin:', error);
      alert('Error deleting bin. Please try again.');
    }
  };

  // ========== COLLECTOR MANAGEMENT FUNCTIONS ==========
  const addCollector = async (formData) => {
    try {
      // ========== VALIDATION: Check if truck is assigned ==========
      if (!formData.truck) {
        alert('Please assign a truck to the collector');
        return;
      }

      const response = await api.post('/collectors', formData);
      const { data } = response;

      if (data.success) {
        closeModal();
        fetchData();
        alert('Collector added successfully!');
      } else {
        alert(data.message || 'Failed to add collector');
      }
    } catch (error) {
      console.error('Error adding collector:', error);
      alert('Error adding collector. Please try again.');
    }
  };

  const updateCollector = async (formData) => {
    try {
      // For updates, truck assignment is optional (can keep existing truck)
      const response = await api.put(`/collectors/${editingItem._id}`, formData);
      const { data } = response;

      if (data.success) {
        closeModal();
        fetchData();
        alert('Collector updated successfully!');
      } else {
        alert(data.message || 'Failed to update collector');
      }
    } catch (error) {
      console.error('Error updating collector:', error);
      alert('Error updating collector. Please try again.');
    }
  };

  const deleteCollector = async (id) => {
    // ========== VALIDATION: Confirmation dialog ==========
    if (!window.confirm('Are you sure you want to delete this collector?')) return;

    try {
      const response = await api.delete(`/collectors/${id}`);
      const { data } = response;

      if (data.success) {
        fetchData();
        alert('Collector deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete collector');
      }
    } catch (error) {
      console.error('Error deleting collector:', error);
      alert('Error deleting collector. Please try again.');
    }
  };

  // ========== TRUCK MANAGEMENT FUNCTIONS ==========
  const addTruck = async (formData) => {
    try {
      const response = await api.post('/trucks', formData);
      const { data } = response;

      if (data.success) {
        closeModal();
        fetchData();
        alert('Truck added successfully!');
      } else {
        alert(data.message || 'Failed to add truck');
      }
    } catch (error) {
      console.error('Error adding truck:', error);
      alert('Error adding truck. Please try again.');
    }
  };

  const updateTruck = async (formData) => {
    try {
      const response = await api.put(`/trucks/${editingItem._id}`, formData);
      const { data } = response;

      if (data.success) {
        closeModal();
        fetchData();
        alert('Truck updated successfully!');
      } else {
        alert(data.message || 'Failed to update truck');
      }
    } catch (error) {
      console.error('Error updating truck:', error);
      alert('Error updating truck. Please try again.');
    }
  };

  const deleteTruck = async (id) => {
    // ========== VALIDATION: Confirmation dialog ==========
    if (!window.confirm('Are you sure you want to delete this truck?')) return;

    try {
      const response = await api.delete(`/trucks/${id}`);
      const { data } = response;

      if (data.success) {
        fetchData();
        alert('Truck deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete truck');
      }
    } catch (error) {
      console.error('Error deleting truck:', error);
      alert('Error deleting truck. Please try again.');
    }
  };

  // ========== MODAL MANAGEMENT ==========
  // Open modal
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowAddModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowAddModal(false);
    setModalType('');
    setEditingItem(null);
  };

  // ========== UI HELPER FUNCTIONS ==========
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'status-pending';
      case 'Assigned': return 'status-assigned';
      case 'Collected': return 'status-collected';
      case 'Skipped': return 'status-skipped';
      default: return 'status-default';
    }
  };

  // Get collector status color
  const getCollectorStatusColor = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'collecting': return 'status-collecting';
      case 'idle': return 'status-idle';
      case 'offline': return 'status-offline';
      default: return 'status-default';
    }
  };

  // Calculate collector performance percentage
  const calculatePerformance = (collector) => {
    const assignedBins = collector.assignedBins || [];
    if (assignedBins.length === 0) return 0;
    
    const collectedBins = assignedBins.filter(bin => bin.status === 'Collected').length;
    return Math.round((collectedBins / assignedBins.length) * 100);
  };

  // ========== DATA FILTERING AND PROCESSING ==========
  // Filter bins by city and search term
  const filteredBins = fullBins.filter(bin => {
    const matchesCity = selectedCity === 'all' || bin.city === selectedCity;
    const matchesSearch = searchTerm === '' || 
      bin.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bin.assignedTo && bin.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      bin.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCity && matchesSearch;
  });

  // Get unique cities from bins
  const cities = [...new Set(fullBins.map(bin => bin.city))];

  // Get available trucks (not assigned to any collector)
  const availableTrucks = trucks.filter(truck => !truck.assignedTo);

  // Get available collectors for assignment (active and not already assigned to this bin)
  const getAvailableCollectors = (bin) => {
    return collectors.filter(collector => 
      collector.city === bin.city && 
      (collector.status === 'active' || collector.status === 'idle') &&
      collector._id !== bin.assignedTo?._id
    );
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>Transport Manager Dashboard</h1>
            <p>Manage waste collection operations</p>
          </div>
          <div className="header-stats">
            <div className="stat-badge pending">
              {fullBins.filter(bin => bin.status === 'Pending' || bin.status === 'Assigned').length} Pending Bins
            </div>
            <div className="stat-badge active">
              {collectors.filter(c => c.status === 'active' || c.status === 'collecting').length} Active Collectors
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="navigation">
        <div className="nav-content">
          {[
            { key: 'bins', label: 'Full Bins', icon: MapPin },
            { key: 'collectors', label: 'Collectors', icon: Users },
            { key: 'trucks', label: 'Trucks', icon: Truck },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`nav-tab ${activeTab === key ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="main-content">
        {/* ========== FULL BINS TAB ========== */}
        {activeTab === 'bins' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Full Bins Dashboard</h2>
                <div className="card-actions">
                  <div className="search-container">
                    <div className="search-input-wrapper">
                      <Search className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search by location, city, collector, or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      {searchTerm && (
                        <button onClick={clearSearch} className="clear-search">
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <Filter className="filter-icon" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="form-select city-filter"
                  >
                    <option value="all">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>City</th>
                      <th>Reported</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBins.map(bin => (
                      <tr key={bin._id}>
                        <td>{bin.location}</td>
                        <td>{bin.city}</td>
                        <td className="reported-time">
                          {new Date(bin.reportedAt).toLocaleString()}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(bin.status)}`}>
                            {bin.status}
                          </span>
                        </td>
                        <td>
                          {bin.assignedTo ? bin.assignedTo.name : 'Not assigned'}
                        </td>
                        <td>
                          <div className="actions">
                            {(bin.status === 'Pending' || bin.status === 'Assigned') && (
                              <select
                                onChange={(e) => assignCollector(bin._id, e.target.value)}
                                className="form-select assign-select"
                                value={bin.assignedTo?._id || ''}
                              >
                                <option value="" disabled>Assign Collector</option>
                                {getAvailableCollectors(bin).map(collector => (
                                  <option key={collector._id} value={collector._id}>
                                    {collector.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            {bin.status === 'Skipped' && (
                              <div className="skipped-bin-actions">
                                <select
                                  onChange={(e) => reassignSkippedBin(bin._id, e.target.value)}
                                  className="form-select reassign-select"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Reassign Collector</option>
                                  {getAvailableCollectors(bin).map(collector => (
                                    <option key={collector._id} value={collector._id}>
                                      {collector.name}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => resetBinStatus(bin._id)}
                                  className="action-btn reset"
                                  title="Reset to Pending"
                                >
                                  <RotateCcw className="action-icon" />
                                </button>
                                <button
                                  onClick={() => deleteBin(bin._id)}
                                  className="action-btn delete"
                                >
                                  <Trash2 className="action-icon" />
                                </button>
                              </div>
                            )}
                            {bin.status === 'Collected' && (
                              <div className="collected-bin-actions">
                                <span className="completed-text">
                                  Completed
                                </span>
                                <button
                                  onClick={() => deleteBin(bin._id)}
                                  className="action-btn delete"
                                >
                                  <Trash2 className="action-icon" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBins.length === 0 && (
                  <div className="empty-state">
                    <MapPin size={48} />
                    <p>
                      {searchTerm || selectedCity !== 'all' 
                        ? 'No bins found matching your search criteria.' 
                        : 'No bins found. Add some bins to get started.'
                      }
                    </p>
                    {(searchTerm || selectedCity !== 'all') && (
                      <button 
                        onClick={() => { setSearchTerm(''); setSelectedCity('all'); }} 
                        className="btn btn-secondary"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== COLLECTORS TAB ========== */}
        {activeTab === 'collectors' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Collectors Management</h2>
                <button
                  onClick={() => openModal('collector')}
                  className="btn btn-primary"
                  // ========== VALIDATION: Disable button if no trucks available ==========
                  disabled={availableTrucks.length === 0}
                  title={availableTrucks.length === 0 ? "No available trucks. Please add a truck first." : ""}
                >
                  <Plus className="btn-icon" />
                  Add Collector
                </button>
              </div>
              {/* ========== VALIDATION: Warning alert when no trucks available ========== */}
              {availableTrucks.length === 0 && (
                <div className="alert alert-warning">
                  <strong>No available trucks!</strong> Please add trucks before creating collectors.
                </div>
              )}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Truck</th>
                      <th>Assigned Bins</th>
                      <th>Current Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collectors.map(collector => (
                      <tr key={collector._id}>
                        <td className="collector-name">{collector.name}</td>
                        <td>{collector.city}</td>
                        <td>
                          <span className={`status-badge ${getCollectorStatusColor(collector.status)}`}>
                            {collector.status.charAt(0).toUpperCase() + collector.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {collector.truck ? (
                            <span className="truck-assigned">
                              {collector.truck.plateNumber}
                            </span>
                          ) : (
                            <span className="no-truck">No truck assigned</span>
                          )}
                        </td>
                        <td>
                          <div className="assigned-bins-cell">
                            <strong>{collector.assignedBins?.length || 0}</strong>
                            {collector.assignedBins && collector.assignedBins.length > 0 && (
                              <div className="assigned-bins-list">
                                {collector.assignedBins.slice(0, 3).map(bin => (
                                  <div key={bin._id} className="assigned-bin-item">
                                    {bin.location} ({bin.status})
                                  </div>
                                ))}
                                {collector.assignedBins.length > 3 && <div className="more">+{collector.assignedBins.length - 3} more</div>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {collector.currentLocation || 'Unknown'}
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() => openModal('collector', collector)}
                              className="action-btn edit"
                            >
                              <Edit className="action-icon" />
                            </button>
                            <button
                              onClick={() => deleteCollector(collector._id)}
                              className="action-btn delete"
                            >
                              <Trash2 className="action-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {collectors.length === 0 && (
                  <div className="empty-state">
                    <Users size={48} />
                    <p>
                      {/* ========== VALIDATION: Contextual empty state message ========== */}
                      {availableTrucks.length === 0 
                        ? "No collectors found. Add trucks first to create collectors." 
                        : "No collectors found. Add one to get started."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== TRUCKS TAB ========== */}
        {activeTab === 'trucks' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Trucks Management</h2>
                <button
                  onClick={() => openModal('truck')}
                  className="btn btn-primary"
                >
                  <Plus className="btn-icon" />
                  Add Truck
                </button>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Plate Number</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map(truck => (
                      <tr key={truck._id}>
                        <td className="plate-number">{truck.plateNumber}</td>
                        <td>{truck.capacity}</td>
                        <td>
                          <span className={`status-badge status-${truck.status}`}>
                            {truck.status.charAt(0).toUpperCase() + truck.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {truck.assignedTo ? (
                            <span className="assigned-to">{truck.assignedTo.name}</span>
                          ) : (
                            <span className="not-assigned">Available</span>
                          )}
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              onClick={() => openModal('truck', truck)}
                              className="action-btn edit"
                            >
                              <Edit className="action-icon" />
                            </button>
                            <button
                              onClick={() => deleteTruck(truck._id)}
                              className="action-btn delete"
                            >
                              <Trash2 className="action-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trucks.length === 0 && (
                  <div className="empty-state">
                    <Truck size={48} />
                    <p>No trucks found. Add one to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== ANALYTICS TAB ========== */}
        {activeTab === 'analytics' && (
          <div className="tab-content">
            <div className="analytics-grid">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Collection Status Overview</h3>
                </div>
                <div className="metrics-grid">
                  <div className="metric-card metric-pending">
                    <Clock className="metric-icon" />
                    <div className="metric-value">
                      {fullBins.filter(bin => bin.status === 'Pending').length}
                    </div>
                    <div className="metric-label">Pending</div>
                  </div>
                  <div className="metric-card metric-assigned">
                    <Eye className="metric-icon" />
                    <div className="metric-value">
                      {fullBins.filter(bin => bin.status === 'Assigned').length}
                    </div>
                    <div className="metric-label">Assigned</div>
                  </div>
                  <div className="metric-card metric-collected">
                    <div className="metric-icon">✓</div>
                    <div className="metric-value">
                      {fullBins.filter(bin => bin.status === 'Collected').length}
                    </div>
                    <div className="metric-label">Collected</div>
                  </div>
                  <div className="metric-card metric-skipped">
                    <div className="metric-icon">✕</div>
                    <div className="metric-value">
                      {fullBins.filter(bin => bin.status === 'Skipped').length}
                    </div>
                    <div className="metric-label">Skipped</div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Top Performing Collectors</h3>
                </div>
                <div className="performers-list">
                  {collectors
                    .slice()
                    .sort((a, b) => calculatePerformance(b) - calculatePerformance(a))
                    .slice(0, 4)
                    .map((collector, index) => (
                      <div key={collector._id} className="performer-item">
                        <div className="performer-info">
                          <div className={`performer-rank rank-${index + 1}`}>
                            {index + 1}
                          </div>
                          <div className="performer-details">
                            <div className="performer-name">{collector.name}</div>
                            <div className="performer-city">{collector.city}</div>
                          </div>
                        </div>
                        <div className="performer-score">
                          {calculatePerformance(collector)}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== MODAL COMPONENT ========== */}
      {showAddModal && (
        <Modal 
          type={modalType} 
          item={editingItem} 
          onClose={closeModal} 
          onSubmit={
            editingItem 
              ? (modalType === 'collector' ? updateCollector : updateTruck)
              : (modalType === 'collector' ? addCollector : addTruck)
          }
          trucks={availableTrucks}
          isEditing={!!editingItem}
        />
      )}
    </div>
  );
}

// ========== MODAL COMPONENT WITH VALIDATION ==========
const Modal = ({ type, item, onClose, onSubmit, trucks, isEditing }) => {
  const [formData, setFormData] = useState(
    item || (type === 'collector' 
      ? { name: '', city: '', status: 'active', truck: '' }
      : { plateNumber: '', capacity: '', status: 'active' }
    )
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(item || (type === 'collector' 
      ? { name: '', city: '', status: 'active', truck: '' }
      : { plateNumber: '', capacity: '', status: 'active' }
    ));
    setErrors({});
  }, [item, type]);

  // ========== VALIDATION: Form validation function ==========
  const validateForm = () => {
    const newErrors = {};

    if (type === 'collector') {
      // ========== VALIDATION: Name required ==========
     if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (/\d/.test(formData.name)) {
      newErrors.name = 'Name should not contain numbers';
    }
      // ========== VALIDATION: City required ==========
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      // ========== VALIDATION: Truck required only for new collectors ==========
      if (!isEditing && !formData.truck) {
        newErrors.truck = 'Truck assignment is required';
      }
    } else {
      // ========== VALIDATION: Plate number required ==========
      if (!formData.plateNumber.trim()) {
        newErrors.plateNumber = 'Plate number is required';
      }
      // ========== VALIDATION: Capacity required ==========
      if (!formData.capacity.trim()) {
        newErrors.capacity = 'Capacity is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ========== VALIDATION: Validate before submitting ==========
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // ========== VALIDATION: Clear error when user starts typing ==========
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">
          {isEditing ? 'Edit' : 'Add'} {type === 'collector' ? 'Collector' : 'Truck'}
        </h3>
        <form onSubmit={handleSubmit} className="modal-form">
          {type === 'collector' && (
            <>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  // ========== VALIDATION: Error styling ==========
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter collector's name"
                />
                {/* ========== VALIDATION: Error message display ========== */}
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  // ========== VALIDATION: Error styling ==========
                  className={`form-input ${errors.city ? 'error' : ''}`}
                  placeholder="Enter city"
                />
                {/* ========== VALIDATION: Error message display ========== */}
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status || 'active'}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Assign Truck {!isEditing && '*'}
                  {/* ========== VALIDATION: No trucks warning ========== */}
                  {trucks.length === 0 && !isEditing && (
                    <span className="no-trucks-warning"> (No available trucks)</span>
                  )}
                </label>
                <select
                  name="truck"
                  value={formData.truck || ''}
                  onChange={handleChange}
                  // ========== VALIDATION: Error styling ==========
                  className={`form-select ${errors.truck ? 'error' : ''}`}
                  // ========== VALIDATION: Disable if no trucks available ==========
                  disabled={trucks.length === 0 && !isEditing}
                >
                  <option value="">{isEditing ? 'Keep current truck' : 'Select a truck'}</option>
                  {trucks.map(truck => (
                    <option key={truck._id} value={truck._id}>
                      {truck.plateNumber} - {truck.capacity}
                    </option>
                  ))}
                </select>
                {/* ========== VALIDATION: Error message display ========== */}
                {errors.truck && <span className="error-message">{errors.truck}</span>}
                {/* ========== VALIDATION: No trucks available message ========== */}
                {trucks.length === 0 && !isEditing && (
                  <span className="error-message">
                    No available trucks. Please add trucks first.
                  </span>
                )}
              </div>
            </>
          )}
          {type === 'truck' && (
            <>
              <div className="form-group">
                <label className="form-label">Plate Number *</label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber || ''}
                  onChange={handleChange}
                  // ========== VALIDATION: Error styling ==========
                  className={`form-input ${errors.plateNumber ? 'error' : ''}`}
                  placeholder="e.g., TR-005"
                />
                {/* ========== VALIDATION: Error message display ========== */}
                {errors.plateNumber && <span className="error-message">{errors.plateNumber}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input
                  type="text"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleChange}
                  // ========== VALIDATION: Error styling ==========
                  className={`form-input ${errors.capacity ? 'error' : ''}`}
                  placeholder="e.g., 15 tons"
                />
                {/* ========== VALIDATION: Error message display ========== */}
                {errors.capacity && <span className="error-message">{errors.capacity}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status || 'active'}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </>
          )}
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;