import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

function sign(user) {
	const payload = { id: user._id, email: user.email, role: user.role };
	return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
}

router.post('/register', asyncHandler(async (req, res) => {
	const { name, email, password, role } = req.body;
	const exists = await User.findOne({ email });
	if (exists) return res.status(400).json({ message: 'Email already in use' });
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({ name, email, passwordHash, role });
	res.status(201).json({ id: user._id, email: user.email });
}));

router.post('/login', asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (!user) return res.status(401).json({ message: 'Invalid credentials' });
	const valid = await bcrypt.compare(password, user.passwordHash);
	if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
	const token = sign(user);
	res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
	res.json({ token });
}));

router.post('/logout', (req, res) => {
	res.clearCookie('token');
	res.json({ ok: true });
});

export default router;
