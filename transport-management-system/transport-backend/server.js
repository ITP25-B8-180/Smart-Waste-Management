// backend/server.js - UPDATE THIS
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

dotenv.config();
const app = express();

// ✅ CRITICAL: Fix CORS like this
app.use(cors({
  origin: true, // Allow all origins during development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Your existing routes...
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const binsRouter = require('./routes/bins');
const collectorsRouter = require('./routes/collectors');
const trucksRouter = require('./routes/trucks');

app.use('/api/bins', binsRouter);
app.use('/api/collectors', collectorsRouter);
app.use('/api/trucks', trucksRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`✅ CORS enabled for all origins`);
});