import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import authRoutes from './src/routes/auth.routes.js';
import expenseRoutes from './src/routes/expense.routes.js';
import incomeRoutes from './src/routes/income.routes.js';
import reportRoutes from './src/routes/report.routes.js';
import budgetRoutes from './src/routes/budget.routes.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Looser CORS for local development to avoid browser blocking successful requests
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/budget', budgetRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// error handler
app.use((err, req, res, next) => {
	const status = err.status || 500;
	const message = err.message || 'Server error';
	res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

async function start() {
	const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartwaste';
	await mongoose.connect(mongoUri);
	app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

start().catch((err) => {
	console.error('Failed to start server', err);
	process.exit(1);
});
