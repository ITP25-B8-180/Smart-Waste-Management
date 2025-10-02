const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  time: {
    type: String,
    required: true
  },
  endTime: {
    type: String
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    name: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      }
    },
    capacity: {
      type: Number,
      min: 1
    },
    amenities: [{
      type: String,
      trim: true
    }]
  },
  category: {
    type: String,
    required: true,
    enum: ['conference', 'workshop', 'seminar', 'meeting', 'party', 'networking', 'training', 'exhibition', 'concert', 'sports', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  maxAttendees: {
    type: Number,
    required: true,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  waitlistCount: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  earlyBirdPrice: {
    type: Number,
    min: 0
  },
  earlyBirdEndDate: {
    type: Date
  },
  groupDiscount: {
    enabled: {
      type: Boolean,
      default: false
    },
    minGroupSize: {
      type: Number,
      default: 5
    },
    discountPercentage: {
      type: Number,
      default: 10
    }
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coOrganizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  speakers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    image: {
      type: String
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String
    }
  }],
  agenda: [{
    time: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    speaker: {
      type: String,
      trim: true
    },
    duration: {
      type: Number,
      default: 30
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'cancelled', 'completed', 'postponed'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  registrationDeadline: {
    type: Date
  },
  cancellationDeadline: {
    type: Date
  },
  requirements: {
    type: String,
    trim: true
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'other'],
      default: 'document'
    },
    url: {
      type: String
    },
    description: {
      type: String,
      trim: true
    }
  }],
  socialMedia: {
    hashtags: [{
      type: String,
      trim: true
    }],
    facebookEvent: {
      type: String
    },
    twitterHandle: {
      type: String,
      trim: true
    },
    instagramHandle: {
      type: String,
      trim: true
    }
  },
  settings: {
    allowWaitlist: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowCancellation: {
      type: Boolean,
      default: true
    },
    sendReminders: {
      type: Boolean,
      default: true
    },
    reminderDays: [{
      type: Number,
      default: [7, 1]
    }]
  },
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    registrationRate: {
      type: Number,
      default: 0
    }
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancellationDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.maxAttendees - this.currentAttendees;
});

// Virtual for registration rate
eventSchema.virtual('registrationRate').get(function() {
  if (this.maxAttendees === 0) return 0;
  return Math.round((this.currentAttendees / this.maxAttendees) * 100);
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.currentAttendees >= this.maxAttendees;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return new Date(this.date) > new Date();
});

// Virtual for checking if event is past
eventSchema.virtual('isPast').get(function() {
  return new Date(this.date) < new Date();
});

// Method to check if registration is open
eventSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  const deadline = this.registrationDeadline ? new Date(this.registrationDeadline) : eventDate;
  
  return this.status === 'active' && 
         now < deadline && 
         this.currentAttendees < this.maxAttendees;
};

// Method to check if cancellation is allowed
eventSchema.methods.isCancellationAllowed = function() {
  const now = new Date();
  const deadline = this.cancellationDeadline ? new Date(this.cancellationDeadline) : new Date(this.date);
  
  return this.settings.allowCancellation && now < deadline;
};

// Method to increment views
eventSchema.methods.incrementViews = function() {
  this.statistics.views += 1;
  return this.save();
};

// Method to get current price (considering early bird)
eventSchema.methods.getCurrentPrice = function() {
  const now = new Date();
  if (this.earlyBirdPrice && this.earlyBirdEndDate && now < new Date(this.earlyBirdEndDate)) {
    return this.earlyBirdPrice;
  }
  return this.price;
};

// Static method to get events by date range
eventSchema.statics.getEventsByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    },
    status: 'active'
  }).populate('organizer', 'name email');
};

// Static method to get popular events
eventSchema.statics.getPopularEvents = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'statistics.views': -1, 'currentAttendees': -1 })
    .limit(limit)
    .populate('organizer', 'name email');
};

// Static method to get events by category
eventSchema.statics.getEventsByCategory = function(category, limit = 10) {
  return this.find({ 
    category: category,
    status: 'active'
  })
  .sort({ date: 1 })
  .limit(limit)
  .populate('organizer', 'name email');
};

// Index for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ 'venue.city': 1 });
eventSchema.index({ tags: 1 });

module.exports = mongoose.model('Event', eventSchema);