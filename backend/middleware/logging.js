// middleware/logging.js - NEW FILE
const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
require('fs').mkdirSync(logsDir, { recursive: true });

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'peat-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error logs - separate file for errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    
    // Scan-specific logs
    new winston.transports.File({
      filename: path.join(logsDir, 'scans.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      )
    })
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    )
  }));
}

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object for tracking
  req.requestId = requestId;
  req.startTime = startTime;
  
  // Extract useful request info
  const requestInfo = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent') || 'unknown',
    ip: getClientIP(req),
    timestamp: new Date().toISOString()
  };
  
  // Log request start
  logger.info('Request started', requestInfo);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseInfo = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: getClientIP(req),
      contentLength: res.get('Content-Length') || 0,
      userAgent: req.get('User-Agent') || 'unknown'
    };
    
    // Different log levels based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', responseInfo);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', responseInfo);
    } else if (duration > 10000) { // Slow requests > 10s
      logger.warn('Slow request detected', responseInfo);
    } else {
      logger.info('Request completed', responseInfo);
    }
  });
  
  res.on('error', (error) => {
    logger.error('Response error', {
      requestId,
      error: error.message,
      stack: error.stack
    });
  });
  
  next();
};

/**
 * Scan-specific logging middleware
 */
const scanLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log scan results
    if (req.originalUrl.includes('/api/scan')) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        
        const scanInfo = {
          requestId: req.requestId,
          endpoint: req.originalUrl,
          email: req.query.email ? maskEmail(req.query.email) : null,
          username: req.query.username || null,
          breachCount: parsedData.breaches?.length || 0,
          platformCount: parsedData.used_on?.length || 0,
          sherlockCount: parsedData.sherlock?.length || 0,
          cached: parsedData._meta?.cached || false,
          success: !parsedData.error,
          duration: Date.now() - req.startTime
        };
        
        logger.info('Scan completed', scanInfo);
        
        // Log high-risk scans separately
        if (scanInfo.breachCount > 50) {
          logger.warn('High-risk email detected', {
            ...scanInfo,
            riskLevel: 'HIGH',
            breachCount: scanInfo.breachCount
          });
        }
        
      } catch (parseError) {
        logger.error('Failed to parse scan response for logging', {
          requestId: req.requestId,
          parseError: parseError.message
        });
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Security logging middleware
 */
const securityLogger = (req, res, next) => {
  // Log suspicious activity
  const userAgent = req.get('User-Agent') || '';
  const ip = getClientIP(req);
  
  // Check for bot/suspicious patterns
  const suspiciousPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python-requests/i, /postman/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious) {
    logger.warn('Suspicious user agent detected', {
      ip,
      userAgent,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  // Log potential injection attempts
  const queryString = JSON.stringify(req.query);
  const bodyString = JSON.stringify(req.body);
  
  const injectionPatterns = [
    /<script/i, /javascript:/i, /onload/i, /onerror/i,
    /union.*select/i, /drop.*table/i, /exec.*\(/i,
    /\.\.\//g, /\/etc\/passwd/i, /cmd\.exe/i
  ];
  
  const hasInjection = injectionPatterns.some(pattern => 
    pattern.test(queryString) || pattern.test(bodyString)
  );
  
  if (hasInjection) {
    logger.error('Potential injection attempt detected', {
      ip,
      userAgent,
      url: req.originalUrl,
      method: req.method,
      query: req.query,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
  const errorInfo = {
    requestId: req.requestId,
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: getClientIP(req),
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date().toISOString()
  };
  
  // Log different error types at different levels
  if (err.statusCode && err.statusCode < 500) {
    logger.warn('Client error occurred', errorInfo);
  } else {
    logger.error('Server error occurred', errorInfo);
  }
  
  next(err);
};

/**
 * Performance monitoring
 */
const performanceLogger = () => {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    logger.info('Performance metrics', {
      memory: {
        rss: formatBytes(memUsage.rss),
        heapTotal: formatBytes(memUsage.heapTotal),
        heapUsed: formatBytes(memUsage.heapUsed),
        external: formatBytes(memUsage.external)
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }, 5 * 60 * 1000); // Every 5 minutes
};

// Utility functions
function generateRequestId() {
  return Math.random().toString(36).substr(2, 9);
}

function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'unknown';
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'invalid';
  
  const maskedLocal = local.length > 2 
    ? local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
    : local.charAt(0) + '*';
    
  return `${maskedLocal}@${domain}`;
}

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  performanceLogger();
}

module.exports = {
  logger,
  requestLogger,
  scanLogger,
  securityLogger,
  errorLogger
};