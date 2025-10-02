const Bin = require('../models/Bin');
const Collector = require('../models/Collector');

// CREATE a new bin
const createBin = async (req, res) => {
  try {
    const { location, city, reportedAt } = req.body;

    if (!location || !city || !reportedAt) {
      return res.status(400).json({ success: false, message: "Location, city, and reportedAt are required" });
    }

    const bin = await Bin.create({ location, city, reportedAt });
    res.status(201).json({ success: true, message: "Bin created successfully", data: bin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all bins (with filters)
const getBins = async (req, res) => {
  try {
    const { city, status } = req.query;
    let filter = {};
    if (city && city !== 'all') filter.city = city;
    if (status && status !== 'all') filter.status = status;

    const bins = await Bin.find(filter)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bins.length, data: bins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET bins assigned to specific collector
const getBinsByCollector = async (req, res) => {
  try {
    const { collectorId } = req.params;
    
    const collector = await Collector.findById(collectorId);
    if (!collector) {
      return res.status(404).json({ success: false, message: 'Collector not found' });
    }

    const bins = await Bin.find({ assignedTo: collectorId })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bins.length, data: bins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single bin
const getBin = async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id).populate('assignedTo', 'name');
    if (!bin) return res.status(404).json({ success: false, message: 'Bin not found' });
    res.status(200).json({ success: true, data: bin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE bin status
const updateBinStatus = async (req, res) => {
  try {
    const { status, collectorId } = req.body;
    const { binId } = req.params;

    const bin = await Bin.findById(binId).populate('assignedTo', 'name');
    if (!bin) return res.status(404).json({ success: false, message: 'Bin not found' });

    if (bin.assignedTo && bin.assignedTo._id.toString() !== collectorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this bin' 
      });
    }

    const updatedBin = await Bin.findByIdAndUpdate(
      binId, 
      { 
        status,
        ...(status === 'Collected' && { collectedAt: new Date() }),
        ...(status === 'Skipped' && { skippedAt: new Date() })
      }, 
      { new: true }
    ).populate('assignedTo', 'name');

    if (updatedBin.assignedTo && (status === 'Collected' || status === 'Skipped')) {
      await Collector.findByIdAndUpdate(updatedBin.assignedTo._id, {
        $pull: { assignedBins: updatedBin._id }
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Bin status updated successfully', 
      data: updatedBin 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ASSIGN collector
const assignCollector = async (req, res) => {
  try {
    const { collectorId } = req.body;
    const collector = await Collector.findById(collectorId);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    const bin = await Bin.findByIdAndUpdate(
      req.params.id,
      { assignedTo: collectorId, status: 'Assigned', assignedAt: new Date() },
      { new: true }
    ).populate('assignedTo', 'name');

    if (!bin) return res.status(404).json({ success: false, message: 'Bin not found' });

    if (!collector.assignedBins.includes(bin._id)) {
      collector.assignedBins.push(bin._id);
      await collector.save();
    }

    res.status(200).json({ success: true, message: 'Collector assigned', data: bin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REASSIGN skipped bin - FIXED
const reassignBin = async (req, res) => {
  try {
    const { collectorId, status } = req.body;
    const { id } = req.params;

    console.log('Reassigning bin:', { id, collectorId, status });

    if (!collectorId) {
      return res.status(400).json({ success: false, message: 'Collector ID is required' });
    }

    const collector = await Collector.findById(collectorId);
    if (!collector) return res.status(404).json({ success: false, message: 'Collector not found' });

    const bin = await Bin.findById(id);
    if (!bin) return res.status(404).json({ success: false, message: 'Bin not found' });

    // Remove from previous collector
    if (bin.assignedTo) {
      await Collector.findByIdAndUpdate(bin.assignedTo, {
        $pull: { assignedBins: bin._id }
      });
    }

    // Assign to new collector
    const updatedBin = await Bin.findByIdAndUpdate(
      id,
      { 
        assignedTo: collectorId, 
        status: status || 'Assigned',
        assignedAt: new Date(),
        skippedAt: null
      },
      { new: true }
    ).populate('assignedTo', 'name');

    // Add to new collector's assignedBins
    if (!collector.assignedBins.includes(bin._id)) {
      collector.assignedBins.push(bin._id);
      await collector.save();
    }

    res.status(200).json({ 
      success: true, 
      message: 'Bin reassigned successfully', 
      data: updatedBin 
    });
  } catch (error) {
    console.error('Reassign bin error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// RESET bin status to Pending - FIXED
const resetBinStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    console.log('Resetting bin status:', { id, status });

    const bin = await Bin.findById(id);
    if (!bin) return res.status(404).json({ success: false, message: 'Bin not found' });

    // Remove from current collector
    if (bin.assignedTo) {
      await Collector.findByIdAndUpdate(bin.assignedTo, {
        $pull: { assignedBins: bin._id }
      });
    }

    const updatedBin = await Bin.findByIdAndUpdate(
      id,
      { 
        status: status || 'Pending',
        assignedTo: null,
        assignedAt: null,
        skippedAt: null,
        collectedAt: null
      },
      { new: true }
    ).populate('assignedTo', 'name');

    res.status(200).json({ 
      success: true, 
      message: 'Bin status reset successfully', 
      data: updatedBin 
    });
  } catch (error) {
    console.error('Reset bin status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE bin
const deleteBin = async (req, res) => {
  try {
    const bin = await Bin.findByIdAndDelete(req.params.id);
    if (!bin) return res.status(404).json({ success: false, message: 'Bin not found' });

    if (bin.assignedTo) {
      await Collector.findByIdAndUpdate(bin.assignedTo, { $pull: { assignedBins: bin._id } });
    }

    res.status(200).json({ success: true, message: 'Bin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getBins, 
  getBin, 
  getBinsByCollector,
  createBin, 
  updateBinStatus, 
  assignCollector, 
  reassignBin,
  resetBinStatus,
  deleteBin 
};