import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Income from '../models/Income.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
	}
});

const upload = multer({ storage });

function coerceIncomeBody(body) {
	const out = {};
	if (body.date) out.date = new Date(body.date);
	if (body.category) out.category = body.category;
	if (body.description !== undefined) out.description = body.description;
	if (body.amount !== undefined) out.amount = Number(body.amount);
	return out;
}

router.post('/', upload.single('document'), asyncHandler(async (req, res) => {
	const data = coerceIncomeBody(req.body);
	const income = await Income.create({
		...data,
		documentPath: req.file ? '/uploads/' + req.file.filename : undefined,
  // createdBy removed since auth is disabled
  createdBy: undefined,
	});
	res.status(201).json(income);
}));

router.get('/', asyncHandler(async (req, res) => {
	const items = await Income.find().sort({ date: -1 });
	res.json(items);
}));

router.get('/:id', asyncHandler(async (req, res) => {
	const it = await Income.findById(req.params.id);
	if (!it) return res.status(404).json({ message: 'Not found' });
	res.json(it);
}));

router.put('/:id', upload.single('document'), asyncHandler(async (req, res) => {
	const update = coerceIncomeBody(req.body);
	if (req.file) update.documentPath = '/uploads/' + req.file.filename;
	const it = await Income.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
	if (!it) return res.status(404).json({ message: 'Not found' });
	res.json(it);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
	await Income.findByIdAndDelete(req.params.id);
	res.json({ ok: true });
}));

export default router;
