const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collector',
    default: null
  },
  // New: track current location (driver updates this)
  currentLocation: {
    type: String,
    default: ''
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Truck', truckSchema);
