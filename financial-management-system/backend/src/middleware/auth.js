import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
	const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
	if (!token) return res.status(401).json({ message: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
		req.user = payload;
		next();
	} catch (e) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}
