import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
	{
		date: { type: Date, required: true },
		category: { type: String, required: true },
		description: { type: String },
		amount: { type: Number, required: true, min: 0 },
		documentPath: { type: String },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	},
	{ timestamps: true }
);

export default mongoose.model('Income', incomeSchema);
