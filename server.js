// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const { explainAttack } = require('./utils/explainAttack');
const connectToMongo = require('./utils/mongo');
const errorHandler = require('./utils/errorHandler');
const { getCacheStats } = require('./utils/exposureService');

const app = express();

// Routes
const scanRoute = require('./routes/scan');
const reportRoutes = require('./routes/report');

// ======================
// CORS Configuration
// ======================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173', // Vite dev server
  'https://localhost:3000',
  process.env.FRONTEND_URL, // From environment variable
  // Add your actual Vercel domain here after deployment
  // 'https://your-peat-app.vercel.app'
];

// Remove undefined values from allowedOrigins
const validOrigins = allowedOrigins.filter(origin => origin && origin !== 'undefined');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (validOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// ======================
// Enhanced Rate Limiting
// ======================

// General API rate limiting - more permissive for regular requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

// Strict rate limiting for scan endpoints
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 scans per 15 minutes per IP
  message: {
    error: 'Too many scan requests. Please wait 15 minutes before trying again.',
    retryAfter: '15 minutes',
    tip: 'Scans are resource-intensive. Please use them responsibly.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  }
});

// PDF generation rate limiting - very strict
const pdfLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 PDFs per minute per IP
  message: {
    error: 'PDF generation rate limit exceeded. Please wait 1 minute.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  }
});

// AI explanation rate limiting - moderate
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 AI requests per 5 minutes per IP
  message: {
    error: 'AI analysis rate limit exceeded. Please wait 5 minutes.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  }
});

// ======================
// Middleware
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📝 ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ======================
// Utility Functions
// ======================
const checkDatabaseConnection = () => {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve(true);
    } else {
      reject(new Error('Database not connected'));
    }
  });
};

// ======================
// Routes
// ======================

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🌱 PEAT backend is up and running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'healthy'
  });
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    service: 'PEAT Backend API',
    version: '1.0.0',
    description: 'Web Scanner with Sherlock & Holehe integration',
    features: ['Username scanning', 'Email scanning', 'AI explanations', 'PDF reports'],
    endpoints: {
      health: '/health',
      info: '/api/info',
      scan: '/api/scan',
      quickScan: '/api/scan/quick',
      report: '/api/report/pdf',
      explain: '/api/explain-attack',
      scrape: '/api/scrape',
      cacheStats: '/api/cache-stats',
      logScan: '/api/log-scan'
    },
    rateLimit: {
      general: '100 requests per 15 minutes',
      scan: '10 requests per 15 minutes',
      pdf: '3 requests per minute',
      ai: '20 requests per 5 minutes'
    },
    cors: {
      enabled: true,
      allowedOrigins: validOrigins
    }
  });
});

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    await checkDatabaseConnection();
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: 'Connected',
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      apiKeys: {
        openai: !!process.env.OPENAI_API_KEY,
        serpapi: !!process.env.SERPAPI_KEY,
        hibp: !!process.env.HIBP_API_KEY
      }
    };

    res.json(health);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(503).json({
      status: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Apply specific rate limiting to routes
app.use('/api/scan', scanLimiter, scanRoute);
app.use('/api/report', pdfLimiter, reportRoutes);

// Cache stats endpoint
app.get('/api/cache-stats', (req, res) => {
  try {
    const stats = getCacheStats();
    res.json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve cache statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Scrape route with enhanced validation
app.post('/api/scrape', (req, res) => {
  try {
    const { profile } = req.body;

    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ 
        error: 'Missing or invalid profile in request body',
        expected: 'Provide a profile object with required fields',
        example: {
          profile: {
            email: 'user@example.com',
            fullName: 'John Doe'
          }
        }
      });
    }

    // Basic input validation
    if (!profile.email && !profile.fullName) {
      return res.status(400).json({
        error: 'Profile must contain at least email or fullName',
        received: Object.keys(profile)
      });
    }

    // Sanitize and validate inputs
    const sanitizedProfile = {
      fullName: profile.fullName ? String(profile.fullName).trim() : '',
      email: profile.email ? String(profile.email).trim().toLowerCase() : '',
      city: profile.city ? String(profile.city).trim() : '',
      country: profile.country ? String(profile.country).trim() : '',
      jobTitle: profile.jobTitle ? String(profile.jobTitle).trim() : '',
      company: profile.company ? String(profile.company).trim() : ''
    };

    // Basic email validation if provided
    if (sanitizedProfile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedProfile.email)) {
      return res.status(400).json({
        error: 'Invalid email format provided'
      });
    }

    res.json({
      success: true,
      data: {
        fullName: sanitizedProfile.fullName,
        email: sanitizedProfile.email,
        piiExposed: [], // Will be implemented based on actual scraping logic
        potentialRisks: [],
        profileMeta: {
          city: sanitizedProfile.city,
          country: sanitizedProfile.country,
          jobTitle: sanitizedProfile.jobTitle,
          company: sanitizedProfile.company
        },
        scannedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ 
      error: 'Internal server error during profile scraping',
      timestamp: new Date().toISOString()
    });
  }
});

// GPT-powered phishing explanation with AI rate limiting
app.post('/api/explain-attack', aiLimiter, async (req, res) => {
  try {
    // Enhanced input validation
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        error: 'Request body required for AI analysis',
        expected: 'Provide scan results or attack data for explanation'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'AI service not configured',
        message: 'OpenAI API key not found'
      });
    }

    console.log('🤖 Generating AI explanation...');
    const explanation = await explainAttack(req.body);
    
    res.json({ 
      success: true,
      explanation,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ GPT error:', err);
    
    // Better error handling with specific error types
    if (err.status === 429 || err.code === 'rate_limit_exceeded') {
      res.status(429).json({ 
        error: 'AI service temporarily overloaded',
        message: 'Please try again in a few minutes.',
        retryAfter: 300 // 5 minutes
      });
    } else if (err.status === 401 || err.code === 'invalid_api_key') {
      res.status(503).json({
        error: 'AI service configuration error',
        message: 'Please contact administrator'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate explanation',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Scan logging with enhanced validation and security
app.post('/api/log-scan', (req, res) => {
  try {
    // Validate and sanitize log data
    const logData = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      endpoint: req.path,
      // Only log safe, non-sensitive data
      data: {
        scanType: req.body.scanType,
        targetCount: req.body.results ? req.body.results.length : 0,
        success: !!req.body.success,
        duration: req.body.duration
      }
    };
    
    console.log('📦 Scan logged:', JSON.stringify(logData, null, 2));
    res.status(200).json({ 
      success: true,
      message: 'Scan logged successfully',
      logId: Date.now().toString(36) // Simple log ID
    });
  } catch (err) {
    console.error('❌ Logging error:', err);
    res.status(500).json({ 
      error: 'Failed to log scan',
      timestamp: new Date().toISOString()
    });
  }
});

// ======================
// Error Handling
// ======================

// Handle 404s with helpful information
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/info',
      'GET /api/cache-stats',
      'POST /api/scan',
      'GET /api/scan/quick',
      'POST /api/report/pdf',
      'POST /api/explain-attack',
      'POST /api/scrape',
      'POST /api/log-scan'
    ],
    documentation: 'Visit /api/info for detailed endpoint information'
  });
});

// Global error handler
app.use(errorHandler);

// ======================
// Graceful Shutdown Handling
// ======================
const gracefulShutdown = (signal) => {
  console.log(`🔄 ${signal} received, shutting down gracefully...`);
  
  // Stop accepting new connections
  server.close(() => {
    console.log('🔒 HTTP server closed');
    
    // Close database connection
    mongoose.connection.close(() => {
      console.log('📦 Database connection closed');
      process.exit(0);
    });
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ======================
// Server Startup
// ======================
const PORT = process.env.PORT || 3000;
let server;

// Enhanced startup with better error handling
connectToMongo().then(() => {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🎉 ===============================');
    console.log('✅ PEAT Backend Server Started');
    console.log('================================');
    console.log(`🌍 Port: ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Rate limiting: ${process.env.NODE_ENV === 'development' ? 'DISABLED' : 'ENABLED'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API info: http://localhost:${PORT}/api/info`);
    console.log(`🎯 CORS origins: ${validOrigins.length} configured`);
    console.log('================================\n');
  });
}).catch((err) => {
  console.error('❌ Failed to start server:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});