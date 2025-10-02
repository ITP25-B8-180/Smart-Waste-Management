import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import Budget from '../models/Budget.js';

const router = Router();

// Get current budget (latest)
router.get('/', asyncHandler(async (req, res) => {
	const latest = await Budget.findOne().sort({ createdAt: -1 });
	res.json(latest || { amount: 0 });
}));

// Set/update budget (creates a new version)
router.post('/', asyncHandler(async (req, res) => {
	const amount = Number(req.body.amount);
	if (Number.isNaN(amount) || amount < 0) return res.status(400).json({ message: 'Invalid amount' });
	const saved = await Budget.create({ amount });
	res.status(201).json(saved);
}));

export default router;


