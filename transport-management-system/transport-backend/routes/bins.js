const express = require('express');
const router = express.Router();
const binController = require('../controllers/binController');

// Make sure ALL routes are properly defined
router.get('/', binController.getBins);
router.get('/collector/:collectorId', binController.getBinsByCollector);
router.get('/:id', binController.getBin);
router.post('/', binController.createBin);
router.put('/:binId/status', binController.updateBinStatus);
router.put('/:id/assign-collector', binController.assignCollector);
router.put('/:id/reassign', binController.reassignBin); // ← THIS WAS MISSING
router.put('/:id/reset-status', binController.resetBinStatus); // ← THIS WAS MISSING
router.delete('/:id', binController.deleteBin);

module.exports = router;