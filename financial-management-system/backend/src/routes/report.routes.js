import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

const router = Router();

router.get('/summary', asyncHandler(async (req, res) => {
	const now = new Date();
	const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
	const startYear = new Date(now.getFullYear(), 0, 1);
	const endYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

	const [expMonth] = await Expense.aggregate([
		{ $match: { date: { $gte: startMonth, $lte: endMonth } } },
		{ $group: { _id: null, total: { $sum: '$amount' } } },
	]);
	const [incMonth] = await Income.aggregate([
		{ $match: { date: { $gte: startMonth, $lte: endMonth } } },
		{ $group: { _id: null, total: { $sum: '$amount' } } },
	]);
	const [expYear] = await Expense.aggregate([
		{ $match: { date: { $gte: startYear, $lte: endYear } } },
		{ $group: { _id: null, total: { $sum: '$amount' } } },
	]);
	const [incYear] = await Income.aggregate([
		{ $match: { date: { $gte: startYear, $lte: endYear } } },
		{ $group: { _id: null, total: { $sum: '$amount' } } },
	]);

	res.json({
		monthly: { expenses: expMonth?.total || 0, incomes: incMonth?.total || 0 },
		yearly: { expenses: expYear?.total || 0, incomes: incYear?.total || 0 },
	});
}));

export default router;
