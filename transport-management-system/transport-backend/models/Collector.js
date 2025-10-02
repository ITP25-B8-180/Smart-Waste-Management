const mongoose = require('mongoose');

const collectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'idle', 'offline'],
    default: 'active'
  },
  truck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck',
    default: null
  },
  assignedBins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin'
  }],
  // New: track the current reported location (string or "lat,lng" or readable text)
  currentLocation: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Collector', collectorSchema);
