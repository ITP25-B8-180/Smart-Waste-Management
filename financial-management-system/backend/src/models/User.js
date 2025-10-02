import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['admin', 'financial_officer', 'driver', 'user', 'event_manager'], default: 'financial_officer' },
	},
	{ timestamps: true }
);

export default mongoose.model('User', userSchema);
