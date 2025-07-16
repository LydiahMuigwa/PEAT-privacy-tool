function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message);

  const statusCode = err.statusCode || 500;
  const response = {
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
}

module.exports = errorHandler;