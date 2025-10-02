const express = require('express');
const router = express.Router();
const collectorController = require('../Controllers/collectorController');

router.get('/', collectorController.getCollectors);
router.get('/:id', collectorController.getCollector);
router.post('/', collectorController.createCollector);
router.put('/:id', collectorController.updateCollector);
router.put('/:id/location', collectorController.updateCollectorLocation); // optional direct location update
router.delete('/:id', collectorController.deleteCollector);

module.exports = router;
