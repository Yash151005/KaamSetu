require('dotenv').config();
const express = require('express');
const cors = require('cors');

const aiRoutes = require('./routes/ai');
const workerRoutes = require('./routes/worker');
const schemeRoutes = require('./routes/schemes');
const policyRoutes = require('./routes/policy');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KaamSetu Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes
app.use('/api/ai', aiRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/policy', policyRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`\n🔧 KaamSetu Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
});
