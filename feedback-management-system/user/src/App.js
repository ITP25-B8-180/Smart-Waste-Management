import React, { useState, useEffect } from 'react';
import './App.css';

// Base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeForm, setActiveForm] = useState('feedback');
  const [selectedFiles, setSelectedFiles] = useState(0);
  const [previousFeedbacks, setPreviousFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPreviousFeedbacks();
  }, []);

  const fetchPreviousFeedbacks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks?limit=3`);
      if (response.ok) {
        const data = await response.json();
        setPreviousFeedbacks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const handleFormSwitch = (formType) => {
    setActiveForm(formType);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const feedbackData = {
      name: formData.get('name'),
      rating: parseInt(formData.get('rating')),
      comment: formData.get('comment'),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        alert('Thank you for your feedback! We appreciate your input.');
        e.target.reset();

        // Reset stars
        const stars = document.querySelectorAll('input[name="rating"]');
        stars.forEach((star) => (star.checked = false));

        fetchPreviousFeedbacks();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(error.message || 'There was an error submitting your feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const phone = formData.get('phone');
    const weight = formData.get('weight');

    // Validation: Phone must be digits only
    const phoneRegex = /^[0-9]*$/;
    if (phone && !phoneRegex.test(phone)) {
      alert('Phone number must contain numbers only.');
      setIsLoading(false);
      return;
    }

    // Validation: Weight must be a number if provided
    if (weight && isNaN(weight)) {
      alert('Volume of Waste must be a valid number.');
      setIsLoading(false);
      return;
    }

    const complaintData = {
      name: formData.get('cname'),
      email: formData.get('email'),
      phone: phone,
      address: formData.get('address'),
      issueType: formData.get('waste-type'),
      weight: weight ? parseFloat(weight) : null,
      problem: formData.get('problem'),
    };

    try {
      const uploadData = new FormData();
      Object.keys(complaintData).forEach((key) => {
        if (complaintData[key] !== null && complaintData[key] !== undefined) {
          uploadData.append(key, complaintData[key]);
        }
      });

      const fileInput = document.getElementById('file-input');
      if (fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach((file) => {
          uploadData.append('files', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        alert('Your complaint has been submitted. Our team will address it shortly.');
        e.target.reset();
        setSelectedFiles(0);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert(error.message || 'There was an error submitting your complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files.length);
  };

  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="App">
      <main className="main-content">
        <div className="container">
          <div className="page-title">
            <h2>Share Your Experience With Us</h2>
            <p>Your feedback helps us improve our waste management services and create a cleaner environment for everyone.</p>
          </div>

          <div className="tabs">
            <button
              className={`tab-btn ${activeForm === 'feedback' ? 'active' : ''}`}
              onClick={() => handleFormSwitch('feedback')}
            >
              <i className="fas fa-comment"></i> Feedback
            </button>
            <button
              className={`tab-btn ${activeForm === 'complaint' ? 'active' : ''}`}
              onClick={() => handleFormSwitch('complaint')}
            >
              <i className="fas fa-exclamation-circle"></i> Complaint
            </button>
          </div>

          {/* Feedback Form */}
          <div id="feedback-form" className={`form-container ${activeForm !== 'feedback' ? 'hidden' : ''}`}>
            <h2 className="form-title">
              <i className="fas fa-comment-dots"></i> Share Your Feedback
            </h2>
            <form id="feedbackForm" onSubmit={handleFeedbackSubmit}>
              <div className="form-group">
                <label htmlFor="name"><i className="fas fa-user"></i> Name</label>
                <input type="text" id="name" name="name" className="input-control" required placeholder="Your full name" />
              </div>

              <div className="form-group">
                <label><i className="fas fa-star"></i> Rating</label>
                <div className="rating">
                  <input type="radio" id="star1" name="rating" value="1" required /><label htmlFor="star1">★</label>
                  <input type="radio" id="star2" name="rating" value="2" /><label htmlFor="star2">★</label>
                  <input type="radio" id="star3" name="rating" value="3" /><label htmlFor="star3">★</label>
                  <input type="radio" id="star4" name="rating" value="4" /><label htmlFor="star4">★</label>
                  <input type="radio" id="star5" name="rating" value="5" /><label htmlFor="star5">★</label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comment"><i className="fas fa-edit"></i> Comment</label>
                <textarea id="comment" name="comment" className="input-control" required placeholder="Share your experience with our service"></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                <i className="fas fa-paper-plane"></i> {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>

            <div className="feedback-list">
              <h3><i className="fas fa-history"></i> Recent Feedback</h3>
              {previousFeedbacks.length > 0 ? (
                previousFeedbacks.map((feedback) => (
                  <div key={feedback._id} className="feedback-item">
                    <div className="feedback-header">
                      <span className="feedback-name">{feedback.name}</span>
                      <span className="feedback-date">{formatDate(feedback.date)}</span>
                    </div>
                    <div className="feedback-rating">{renderStars(feedback.rating)}</div>
                    <p className="feedback-comment">{feedback.comment}</p>
                    {feedback.replies && feedback.replies.length > 0 && (
                      <div className="feedback-replies">
                        <h4>Admin Response:</h4>
                        {feedback.replies.map((reply) => (
                          <div key={reply._id} className="feedback-reply">
                            <p>{reply.text}</p>
                            <span className="reply-date">{formatDate(reply.date)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No feedback yet. Be the first to share your experience!</p>
              )}
            </div>
          </div>

          {/* Complaint Form */}
          <div id="complaint-form" className={`form-container ${activeForm !== 'complaint' ? 'hidden' : ''}`}>
            <h2 className="form-title"><i className="fas fa-exclamation-triangle"></i> File a Complaint</h2>
            <form id="complaintForm" onSubmit={handleComplaintSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="cname"><i className="fas fa-user"></i> Name</label>
                  <input type="text" id="cname" name="cname" className="input-control" required placeholder="Your full name" />
                </div>

                <div className="form-group">
                  <label htmlFor="email"><i className="fas fa-envelope"></i> Email</label>
                  <input type="email" id="email" name="email" className="input-control" required placeholder="Your email address" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="phone"><i className="fas fa-phone"></i> Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="input-control"
                    placeholder="Your phone number"
                    onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              
                <div className="form-group">
                  <label htmlFor="address"><i className="fas fa-map-marker-alt"></i> City/Address</label>
                  <input type="text" id="address" name="address" className="input-control" required placeholder="Your city or full address" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="waste-type"><i className="fas fa-trash"></i> Type of Issue</label>
                  <select id="waste-type" name="waste-type" className="input-control" required>
                    <option value="">Select issue type...</option>
                    <option value="Bin Issues">Bin Issues</option>
                    <option value="Transport Issues">Transport Issues</option>
                    <option value="Finance Issues">Finance Issues</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="weight"><i className="fas fa-weight-hanging"></i> Volume of Waste (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    className="input-control"
                    placeholder="Enter approximate weight"
                    min="0"
                    step="0.1"
                    onInput={(e) => {
                      if (isNaN(e.target.value)) e.target.value = '';
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="problem"><i className="fas fa-question-circle"></i> Problem/Message</label>
                <textarea id="problem" name="problem" className="input-control" placeholder="Describe your problem in detail..." required></textarea>
              </div>

              <div className="file-upload" onClick={() => document.getElementById('file-input').click()}>
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Add Files</p>
                <span>{selectedFiles > 0 ? `${selectedFiles} file(s) selected` : 'Choose Files'}</span>
                <input type="file" id="file-input" hidden onChange={handleFileChange} multiple />
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                <i className="fas fa-paper-plane"></i> {isLoading ? 'Submitting...' : 'SUBMIT PROBLEM'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
