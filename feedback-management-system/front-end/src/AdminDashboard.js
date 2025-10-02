import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// Base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [feedbacks, setFeedbacks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterIssueType, setFilterIssueType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [addingNotes, setAddingNotes] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [feedbacksResponse, complaintsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/feedbacks`),
        fetch(`${API_BASE_URL}/complaints`)
      ]);

      if (feedbacksResponse.ok) {
        const feedbacksData = await feedbacksResponse.json();
        setFeedbacks(feedbacksData.data || []);
      }

      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json();
        setComplaints(complaintsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics data calculations
  const totalFeedbacks = feedbacks.length;
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
  
  // Sentiment distribution
  const positiveFeedbacks = feedbacks.filter(f => f.rating >= 4).length;
  const neutralFeedbacks = feedbacks.filter(f => f.rating === 3).length;
  const negativeFeedbacks = feedbacks.filter(f => f.rating <= 2).length;
  
  // Complaint by category
  const binIssues = complaints.filter(c => c.issueType === 'Bin Issues').length;
  const transportIssues = complaints.filter(c => c.issueType === 'Transport Issues').length;
  const financeIssues = complaints.filter(c => c.issueType === 'Finance Issues').length;
  const otherIssues = complaints.filter(c => c.issueType === 'Others').length;
  
  // Response time metrics (mock data)
  const averageResponseTime = '1.8 days';
  const responseTimeDistribution = [
    { range: 'Under 1 day', percentage: 48 },
    { range: '1-2 days', percentage: 35 },
    { range: '3-5 days', percentage: 12 },
    { range: 'Over 5 days', percentage: 5 }
  ];
  
  // Top feedback topics (mock data)
  const topTopics = [
    { topic: 'Collection Timing', count: 24 },
    { topic: 'Bin Quality', count: 18 },
    { topic: 'Staff Behavior', count: 15 },
    { topic: 'Mobile App', count: 12 },
    { topic: 'Billing Issues', count: 8 }
  ];

  const maxTopicCount = topTopics.length > 0 ? Math.max(...topTopics.map(topic => topic.count)) : 0;

  // Pie chart data
  const pieChartData = [
    { name: 'Bin Issues', value: binIssues, color: '#4caf50' },
    { name: 'Transport Issues', value: transportIssues, color: '#2196f3' },
    { name: 'Finance Issues', value: financeIssues, color: '#f44336' },
    { name: 'Others', value: otherIssues, color: '#9e9e9e' }
  ];

  const pieChartDataWithPercentages = pieChartData.map(item => ({
    ...item,
    percentage: totalComplaints > 0 ? (item.value / totalComplaints) * 100 : 0
  }));

  let cumulativePercentage = 0;
  const pieSegments = pieChartDataWithPercentages.map(item => {
    const segment = {
      ...item,
      startPercentage: cumulativePercentage,
      endPercentage: cumulativePercentage + item.percentage
    };
    cumulativePercentage += item.percentage;
    return segment;
  });

  const pieChartGradient = pieSegments
    .filter(segment => segment.percentage > 0)
    .map(segment => {
      const startDegree = (segment.startPercentage / 100) * 360;
      const endDegree = (segment.endPercentage / 100) * 360;
      return `${segment.color} ${startDegree}deg ${endDegree}deg`;
    })
    .join(', ');

  const filteredFeedbacks = feedbacks
    .filter(feedback => {
      if (filterRating !== 'all' && feedback.rating !== parseInt(filterRating)) {
        return false;
      }
      if (searchTerm && !feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !feedback.date.includes(searchTerm)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredComplaints = complaints
    .filter(complaint => {
      if (filterStatus !== 'all' && complaint.status !== filterStatus) {
        return false;
      }
      if (filterIssueType !== 'all' && complaint.issueType !== filterIssueType) {
        return false;
      }
      if (searchTerm && !complaint.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !complaint.date.includes(searchTerm) &&
          !complaint.issueType.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Handle reply submission
  const handleReplySubmit = async (feedbackId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin: 'Admin User',
          text: replyText
        }),
      });

      if (response.ok) {
        fetchData();
        setReplyText('');
        setReplyingTo(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert(error.message || 'There was an error submitting your reply. Please try again.');
    }
  };

  // Handle reply update
  const handleReplyUpdate = async (feedbackId, replyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}/reply/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: editReplyText
        }),
      });

      if (response.ok) {
        fetchData();
        setEditReplyText('');
        setEditingReply(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update reply');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      alert(error.message || 'There was an error updating the reply. Please try again.');
    }
  };

  // Handle reply deletion
  const handleReplyDelete = async (feedbackId, replyId) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}/reply/${replyId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchData();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete reply');
        }
      } catch (error) {
        console.error('Error deleting reply:', error);
        alert(error.message || 'There was an error deleting the reply. Please try again.');
      }
    }
  };

  // Handle feedback deletion
  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchData();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete feedback');
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
        alert(error.message || 'There was an error deleting the feedback. Please try again.');
      }
    }
  };

  const handleStatusChange = async (complaintId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'There was an error updating the status. Please try again.');
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchData();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete complaint');
        }
      } catch (error) {
        console.error('Error deleting complaint:', error);
        alert(error.message || 'There was an error deleting the complaint. Please try again.');
      }
    }
  };

  const handleViewComplaint = (complaint) => {
    setViewingComplaint(complaint);
  };

  const handleAddNotes = (complaint) => {
    setAddingNotes(complaint);
    setNoteText(complaint.notes || '');
  };

  const handleSaveNotes = async (complaintId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: noteText }),
      });

      if (response.ok) {
        fetchData();
        setAddingNotes(null);
        setNoteText('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert(error.message || 'There was an error saving the notes. Please try again.');
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getIssueTypeColor = (issueType) => {
    switch(issueType) {
      case 'Bin Issues':
        return '#4caf50';
      case 'Transport Issues':
        return '#2196f3';
      case 'Finance Issues':
        return '#f44336';
      case 'Others':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Analytics page rendering
  const renderAnalyticsPage = () => {
    const sentimentBarWidth = (count, total) => {
      return total > 0 ? (count / total) * 100 : 0;
    };

    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h2>Feedback & Complaints Analytics</h2>
          <p>Comprehensive overview of customer feedback and complaint metrics</p>
        </div>

        <div className="analytics-grid">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">
                <i className="fas fa-comments"></i>
              </div>
              <div className="card-content">
                <h3>{totalFeedbacks}</h3>
                <p>Total Feedback</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="card-content">
                <h3>{totalComplaints}</h3>
                <p>Total Complaints</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="card-content">
                <h3>{resolvedComplaints}</h3>
                <p>Resolved Complaints</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="card-content">
                <h3>{resolutionRate}%</h3>
                <p>Resolution Rate</p>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Complaints by Category</h3>
              </div>
              <div className="chart-content">
                <div className="pie-chart-container">
                  <div 
                    className="pie-chart"
                    style={{
                      background: totalComplaints > 0 ? `conic-gradient(${pieChartGradient})` : '#f5f5f5'
                    }}
                  >
                    <div className="pie-center">
                      <div className="pie-value">{totalComplaints}</div>
                      <div className="pie-label">Total</div>
                    </div>
                  </div>
                  <div className="pie-legend">
                    {pieSegments.map((segment, index) => (
                      <div key={index} className="legend-item">
                        <div 
                          className="legend-color" 
                          style={{backgroundColor: segment.color}}
                        ></div>
                        <span className="legend-label">{segment.name}</span>
                        <span className="legend-value">
                          {segment.value} ({Math.round(segment.percentage)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {totalComplaints === 0 && <p className="no-data">No complaint data available</p>}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Sentiment Distribution</h3>
              </div>
              <div className="chart-content">
                <div className="sentiment-chart">
                  <div className="sentiment-item">
                    <div 
                      className="sentiment-bar positive" 
                      style={{width: `${sentimentBarWidth(positiveFeedbacks, totalFeedbacks)}%`}}
                    ></div>
                    <div className="sentiment-info">
                      <span>Positive (4-5 stars)</span>
                      <span>{positiveFeedbacks} ({totalFeedbacks > 0 ? Math.round((positiveFeedbacks/totalFeedbacks)*100) : 0}%)</span>
                    </div>
                  </div>
                  <div className="sentiment-item">
                    <div 
                      className="sentiment-bar neutral" 
                      style={{width: `${sentimentBarWidth(neutralFeedbacks, totalFeedbacks)}%`}}
                    ></div>
                    <div className="sentiment-info">
                      <span>Neutral (3 stars)</span>
                      <span>{neutralFeedbacks} ({totalFeedbacks > 0 ? Math.round((neutralFeedbacks/totalFeedbacks)*100) : 0}%)</span>
                    </div>
                  </div>
                  <div className="sentiment-item">
                    <div 
                      className="sentiment-bar negative" 
                      style={{width: `${sentimentBarWidth(negativeFeedbacks, totalFeedbacks)}%`}}
                    ></div>
                    <div className="sentiment-info">
                      <span>Negative (1-2 stars)</span>
                      <span>{negativeFeedbacks} ({totalFeedbacks > 0 ? Math.round((negativeFeedbacks/totalFeedbacks)*100) : 0}%)</span>
                    </div>
                  </div>
                </div>
                {totalFeedbacks === 0 && <p className="no-data">No feedback data available</p>}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Feedback Topics</h3>
              </div>
              <div className="chart-content">
                <div className="topics-bar-chart">
                  {topTopics.map((topic, index) => (
                    <div key={index} className="bar-chart-item">
                      <div className="bar-label">{topic.topic}</div>
                      <div className="bar-container">
                        <div 
                          className="bar" 
                          style={{width: `${maxTopicCount > 0 ? (topic.count / maxTopicCount) * 100 : 0}%`}}
                        >
                          <span className="bar-value">{topic.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="chart-note">Sample data - based on common feedback patterns</p>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Response Time Metrics</h3>
              </div>
              <div className="chart-content">
                <div className="response-time-grid">
                  <div className="response-time-metric">
                    <div className="metric-value">{averageResponseTime}</div>
                    <div className="metric-label">Average First Response Time</div>
                  </div>
                  
                  <div className="response-time-distribution">
                    {responseTimeDistribution.map((item, index) => (
                      <div key={index} className="distribution-item">
                        <div className="distribution-header">
                          <span>{item.range}</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="distribution-bar">
                          <div 
                            className="distribution-progress" 
                            style={{width: `${item.percentage}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="chart-note">Sample data - based on industry standards</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <h1>Feedback & Complaints Dashboard</h1>
      <div className="admin-container">
        <div className="content-tabs">
          <ul className="nav-menu">
            <li className={activeTab === 'feedbacks' ? 'active' : ''}>
              <button onClick={() => setActiveTab('feedbacks')}>
                <i className="fas fa-comments"></i> Feedbacks
                <span className="count-badge">{feedbacks.length}</span>
              </button>
            </li>
            <li className={activeTab === 'complaints' ? 'active' : ''}>
              <button onClick={() => setActiveTab('complaints')}>
                <i className="fas fa-exclamation-circle"></i> Complaints
                <span className="count-badge">{complaints.length}</span>
              </button>
            </li>
            <li className={activeTab === 'analytics' ? 'active' : ''}>
              <button onClick={() => setActiveTab('analytics')}>
                <i className="fas fa-chart-bar"></i> Analytics
              </button>
            </li>
          </ul>
        </div>

        <main className="admin-main">
          {isLoading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i> Loading data...
            </div>
          ) : (
            <>
              {activeTab === 'analytics' ? (
                renderAnalyticsPage()
              ) : (
                <>
                
                  <div className="toolbar">
                    <div className="search-box">
                      <i className="fas fa-search"></i>
                      <input
                        type="text"
                        placeholder={`Search ${activeTab} by name, date, or issue type...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="filters">
                      {activeTab === 'feedbacks' ? (
                        <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                          <option value="all">All Ratings</option>
                          <option value="5">5 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="2">2 Stars</option>
                          <option value="1">1 Star</option>
                        </select>
                      ) : (
                        <>
                      

                          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          <select value={filterIssueType} onChange={(e) => setFilterIssueType(e.target.value)}>
                            <option value="all">All Issue Types</option>
                            <option value="Bin Issues">Bin Issues</option>
                            <option value="Transport Issues">Transport Issues</option>
                            <option value="Finance Issues">Finance Issues</option>
                            <option value="Others">Others</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>

                  {activeTab === 'feedbacks' && (
                    <div className="content-section">
                      <h2>Customer Feedbacks</h2>
                      <div className="cards-container">
                        {filteredFeedbacks.length > 0 ? (
                          filteredFeedbacks.map(feedback => (
                            <div key={feedback._id} className="feedback-card">
                              <div className="card-header">
                                <div className="user-info">
                                  <h3>{feedback.name}</h3>
                                  <button 
                                    className="btn-icon delete" 
                                    title="Delete Feedback"
                                    onClick={() => handleDeleteFeedback(feedback._id)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                                <div className="feedback-meta">
                                  <div className="rating">{renderStars(feedback.rating)}</div>
                                  <span className="date">{formatDate(feedback.date)}</span>
                                </div>
                              </div>
                              <div className="card-body">
                                <p>{feedback.comment}</p>
                              </div>
                              {feedback.replies && feedback.replies.length > 0 && (
                                <div className="replies">
                                  <h4>Admin Replies:</h4>
                                  {feedback.replies.map(reply => (
                                    <div key={reply._id} className="reply">
                                      <div className="reply-header">
                                        <strong>{reply.admin}</strong>
                                        <span>{formatDate(reply.date)}</span>
                                        <div className="reply-actions">
                                          <button 
                                            className="btn-icon" 
                                            title="Edit Reply"
                                            onClick={() => {
                                              setEditingReply({ feedbackId: feedback._id, replyId: reply._id });
                                              setEditReplyText(reply.text);
                                            }}
                                          >
                                            <i className="fas fa-edit"></i>
                                          </button>
                                          <button 
                                            className="btn-icon delete" 
                                            title="Delete Reply"
                                            onClick={() => handleReplyDelete(feedback._id, reply._id)}
                                          >
                                            <i className="fas fa-trash"></i>
                                          </button>
                                        </div>
                                      </div>
                                      {editingReply && editingReply.replyId === reply._id ? (
                                        <div className="edit-reply-form">
                                          <textarea
                                            value={editReplyText}
                                            onChange={(e) => setEditReplyText(e.target.value)}
                                            placeholder="Edit your reply..."
                                          />
                                          <div className="form-actions">
                                            <button 
                                              className="btn-primary"
                                              onClick={() => handleReplyUpdate(feedback._id, reply._id)}
                                            >
                                              Update
                                            </button>
                                            <button 
                                              className="btn-secondary"
                                              onClick={() => setEditingReply(null)}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p>{reply.text}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="card-actions">
                                {replyingTo === feedback._id ? (
                                  <div className="reply-form">
                                    <textarea
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Type your response here..."
                                    />
                                    <div className="form-actions">
                                      <button 
                                        className="btn-primary"
                                        onClick={() => handleReplySubmit(feedback._id)}
                                      >
                                        Send Reply
                                      </button>
                                      <button 
                                        className="btn-secondary"
                                        onClick={() => setReplyingTo(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button 
                                    className="btn-primary"
                                    onClick={() => setReplyingTo(feedback._id)}
                                  >
                                    <i className="fas fa-reply"></i> Reply
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-data">
                            <i className="fas fa-inbox"></i>
                            <p>No feedbacks found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'complaints' && (
                    <div className="content-section">
                      <h2>Customer Complaints</h2>
                      <div className="table-container">
                        {filteredComplaints.length > 0 ? (
                          <table className="complaints-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Issue</th>
                                <th>Issue Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredComplaints.map(complaint => (
                                <tr key={complaint._id}>
                                  <td>
                                    <div className="user-info">
                                      <strong>{complaint.name}</strong>
                                      <span>{complaint.address}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="contact-info">
                                      <span>{complaint.email}</span>
                                      <span>{complaint.phone || 'N/A'}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="issue-preview">
                                      {complaint.problem.length > 100 
                                        ? `${complaint.problem.substring(0, 100)}...` 
                                        : complaint.problem
                                      }
                                    </div>
                                    {complaint.files && complaint.files.length > 0 && (
                                      <div className="file-attachments">
                                        <i className="fas fa-paperclip"></i>
                                        {complaint.files.length} file(s)
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <span 
                                      className="issue-type-badge"
                                      style={{backgroundColor: getIssueTypeColor(complaint.issueType)}}
                                    >
                                      {complaint.issueType}
                                    </span>
                                  </td>
                                  <td>{formatDate(complaint.date)}</td>
                                  <td>
                                    <select 
                                      value={complaint.status} 
                                      onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                                      className={`status-select ${complaint.status}`}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="in-progress">In Progress</option>
                                      <option value="resolved">Resolved</option>
                                    </select>
                                  </td>
                                  <td>
                                    <div className="table-actions">
                                      <button 
                                        className="btn-icon" 
                                        title="View Details"
                                        onClick={() => handleViewComplaint(complaint)}
                                      >
                                        <i className="fas fa-eye"></i>
                                      </button>
                                      <button 
                                        className="btn-icon" 
                                        title="Add Notes"
                                        onClick={() => handleAddNotes(complaint)}
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button 
                                        className="btn-icon delete" 
                                        title="Delete Complaint"
                                        onClick={() => handleDeleteComplaint(complaint._id)}
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="no-data">
                            <i className="fas fa-inbox"></i>
                            <p>No complaints found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Modals */}
          {viewingComplaint && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Complaint Details</h3>
                  <button className="modal-close" onClick={() => setViewingComplaint(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="complaint-detail">
                    <div className="detail-row">
                      <label>Name:</label>
                      <span>{viewingComplaint.name}</span>
                    </div>
                    <div className="detail-row">
                      <label>Email:</label>
                      <span>{viewingComplaint.email}</span>
                    </div>
                    <div className="detail-row">
                      <label>Phone:</label>
                      <span>{viewingComplaint.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Address:</label>
                      <span>{viewingComplaint.address}</span>
                    </div>
                    <div className="detail-row">
                      <label>Issue Type:</label>
                      <span 
                        className="issue-type-badge"
                        style={{backgroundColor: getIssueTypeColor(viewingComplaint.issueType)}}
                      >
                        {viewingComplaint.issueType}
                      </span>
                    </div>
                    <div className="detail-row">
                      <label>Date:</label>
                      <span>{formatDate(viewingComplaint.date)}</span>
                    </div>
                    <div className="detail-row full-width">
                      <label>Problem Description:</label>
                      <p>{viewingComplaint.problem}</p>
                    </div>
                    {viewingComplaint.files && viewingComplaint.files.length > 0 && (
                      <div className="detail-row full-width">
                        <label>Attachments:</label>
                        <div className="file-list">
                          {viewingComplaint.files.map((file, index) => (
                            <div key={index} className="file-item">
                              <i className="fas fa-paperclip"></i>
                              <span>{file}</span>
                              <button 
                                className="btn-download"
                                onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/uploads/${file}`, '_blank')}
                              >
                                <i className="fas fa-download"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="detail-row">
                      <label>Status:</label>
                      <span className={`status-badge ${viewingComplaint.status}`}>
                        {viewingComplaint.status}
                      </span>
                    </div>
                    {viewingComplaint.notes && (
                      <div className="detail-row full-width">
                        <label>Notes:</label>
                        <p className="notes-text">{viewingComplaint.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setViewingComplaint(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {addingNotes && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Add Notes for {addingNotes.name}'s Complaint</h3>
                  <button className="modal-close" onClick={() => setAddingNotes(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="notes-form">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter your notes or response here..."
                      rows="6"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setAddingNotes(null)}>
                    Cancel
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleSaveNotes(addingNotes._id)}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;