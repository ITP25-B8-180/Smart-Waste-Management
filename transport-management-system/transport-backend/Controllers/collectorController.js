const Collector = require('../models/Collector');
const Truck = require('../models/Truck');
const Bin = require('../models/Bin');

// Get all collectors
const getCollectors = async (req, res) => {
  try {
    const collectors = await Collector.find()
      .populate('truck', 'plateNumber capacity')
      .populate('assignedBins', 'location city status reportedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: collectors.length, data: collectors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single collector
const getCollector = async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id)
      .populate('truck', 'plateNumber capacity')
      .populate('assignedBins', 'location city status reportedAt');

    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });
    res.status(200).json({ success: true, data: collector });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create collector
const createCollector = async (req, res) => {
  try {
    const { name, city, status, truck } = req.body;

    const collectorData = {
      name,
      city,
      status: status || 'active',
      currentLocation: ''
    };

    if (truck) {
      const truckExists = await Truck.findById(truck);
      if (!truckExists) {
        return res.status(404).json({ success: false, message: 'Truck not found' });
      }
      if (truckExists.assignedTo) {
        return res.status(400).json({ success: false, message: 'Truck already assigned' });
      }
      collectorData.truck = truck;
    }

    const collector = await Collector.create(collectorData);

    if (truck) {
      await Truck.findByIdAndUpdate(truck, { assignedTo: collector._id });
    }

    await collector.populate('truck', 'plateNumber capacity');
    res.status(201).json({ success: true, message: 'Collector created', data: collector });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update collector
const updateCollector = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, status, truck, currentLocation } = req.body;

    const collector = await Collector.findById(id);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (city !== undefined) updates.city = city;
    if (status !== undefined) updates.status = status;
    if (currentLocation !== undefined) updates.currentLocation = currentLocation;

    if (truck !== undefined) {
      if (!truck) {
        if (collector.truck) {
          await Truck.findByIdAndUpdate(collector.truck, { assignedTo: null });
        }
        updates.truck = null;
      } else {
        const newTruck = await Truck.findById(truck);
        if (!newTruck) return res.status(404).json({ success: false, message: 'Truck not found' });
        if (newTruck.assignedTo && newTruck.assignedTo.toString() !== id) {
          return res.status(400).json({ success: false, message: 'Truck already assigned' });
        }
        if (collector.truck && collector.truck.toString() !== truck) {
          await Truck.findByIdAndUpdate(collector.truck, { assignedTo: null });
        }
        await Truck.findByIdAndUpdate(truck, { assignedTo: id });
        updates.truck = truck;
      }
    }

    const updatedCollector = await Collector.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate('truck', 'plateNumber capacity')
      .populate('assignedBins', 'location city status reportedAt');

    res.status(200).json({ success: true, message: 'Collector updated', data: updatedCollector });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update collector location
const updateCollectorLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;
    if (!location) return res.status(400).json({ success: false, message: 'Location required' });

    const updated = await Collector.findByIdAndUpdate(id, { currentLocation: location }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Collector not found' });

    res.status(200).json({ success: true, message: 'Location updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete collector
const deleteCollector = async (req, res) => {
  try {
    const collector = await Collector.findById(req.params.id);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    if (collector.truck) {
      await Truck.findByIdAndUpdate(collector.truck, { assignedTo: null });
    }

    if (collector.assignedBins.length) {
      await Bin.updateMany(
        { _id: { $in: collector.assignedBins } },
        { $set: { assignedTo: null, status: 'Pending' } }
      );
    }

    await Collector.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Collector deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCollectors,
  getCollector,
  createCollector,
  updateCollector,
  updateCollectorLocation,
  deleteCollector
};