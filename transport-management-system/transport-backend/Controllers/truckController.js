const Truck = require('../models/Truck');
const Collector = require('../models/Collector');

// Get all trucks
const getTrucks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const trucks = await Truck.find(filter).populate('assignedTo', 'name city');
    res.status(200).json({ success: true, count: trucks.length, data: trucks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single truck
const getTruck = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id).populate('assignedTo', 'name city');
    if (!truck) return res.status(404).json({ success: false, message: 'Truck not found' });
    res.status(200).json({ success: true, data: truck });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new truck
const createTruck = async (req, res) => {
  try {
    const { plateNumber, capacity, status } = req.body;

    const existingTruck = await Truck.findOne({ plateNumber });
    if (existingTruck)
      return res.status(400).json({ success: false, message: 'Truck with this plate number already exists' });

    const truck = await Truck.create({ plateNumber, capacity, status: status || 'active' });
    res.status(201).json({ success: true, message: 'Truck created', data: truck });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update truck (including currentLocation) and propagate location to assigned collector
const updateTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const { plateNumber, capacity, status, assignedTo, currentLocation } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Truck ID is required' });
    }

    const truck = await Truck.findById(id);
    if (!truck) {
      return res.status(404).json({ success: false, message: 'Truck not found' });
    }

    // Check duplicate plate number change
    if (plateNumber && plateNumber !== truck.plateNumber) {
      const existingTruck = await Truck.findOne({ plateNumber });
      if (existingTruck) {
        return res.status(400).json({ success: false, message: 'Truck with this plate number already exists' });
      }
    }

    const updates = {};
    if (plateNumber !== undefined) updates.plateNumber = plateNumber;
    if (capacity !== undefined) updates.capacity = capacity;
    if (status !== undefined) updates.status = status;

    // Handle currentLocation update: update truck and update collector.currentLocation if assigned
    if (currentLocation !== undefined) {
      updates.currentLocation = currentLocation;
      if (truck.assignedTo) {
        try {
          await Collector.findByIdAndUpdate(truck.assignedTo, { currentLocation });
        } catch (err) {
          console.error('Failed to update collector currentLocation:', err);
        }
      }
    }

    // Handle assignedTo changes
    if (assignedTo !== undefined) {
      if (!assignedTo) {
        if (truck.assignedTo) {
          await Collector.findByIdAndUpdate(truck.assignedTo, { $unset: { truck: '' } });
        }
        updates.assignedTo = null;
      } else {
        const collector = await Collector.findById(assignedTo);
        if (!collector) {
          return res.status(404).json({ success: false, message: 'Collector not found' });
        }

        // If collector already has a different truck, blocking
        if (collector.truck && collector.truck.toString() !== id) {
          return res.status(400).json({ success: false, message: 'Collector is already assigned to another truck' });
        }

        if (truck.assignedTo && truck.assignedTo.toString() !== assignedTo) {
          await Collector.findByIdAndUpdate(truck.assignedTo, { $unset: { truck: '' } });
        }

        await Collector.findByIdAndUpdate(assignedTo, { truck: id });
        updates.assignedTo = assignedTo;
      }
    }

    const updatedTruck = await Truck.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('assignedTo', 'name city');
    res.status(200).json({ success: true, message: 'Truck updated successfully', data: updatedTruck });

  } catch (err) {
    console.error('Update truck error:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Plate number already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// Delete truck
const deleteTruck = async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);
    if (!truck) return res.status(404).json({ success: false, message: 'Truck not found' });

    if (truck.assignedTo) {
      await Collector.findByIdAndUpdate(truck.assignedTo, { truck: null });
    }

    await Truck.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Truck deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTrucks, getTruck, createTruck, updateTruck, deleteTruck };
