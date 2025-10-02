const express = require('express');
const router = express.Router();
const { getTrucks, getTruck, createTruck, updateTruck, deleteTruck } = require('../Controllers/truckController');

router.get('/', getTrucks);
router.get('/:id', getTruck);
router.post('/', createTruck);
router.put('/:id', updateTruck);
router.delete('/:id', deleteTruck);

module.exports = router;
