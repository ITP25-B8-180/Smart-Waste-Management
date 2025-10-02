const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  location: { type: String, required: true },
  city: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Collected', 'Skipped'],
    default: 'Pending',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', default: null },
  reportedAt: { type: Date, required: true },
  assignedAt: { type: Date, default: null },
  collectedAt: { type: Date, default: null },
  skippedAt: { type: Date, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Bin', binSchema);
