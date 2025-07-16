# Use Node.js 18 with Debian slim base
FROM node:18-slim

# Install Python and system dependencies needed for PEAT and Sherlock
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install Node.js dependencies first (for better caching)
COPY backend/package*.json ./backend/
COPY package*.json ./

WORKDIR /app/backend
RUN npm install --production

# Copy and install PEAT Python requirements
COPY backend/requirements.txt ./requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy and install Sherlock as a proper Python package
COPY backend/sherlock/ ./sherlock/
WORKDIR /app/backend/sherlock

# Install Sherlock dependencies only (skip package installation)
RUN if [ -f requirements.txt ]; then pip3 install --no-cache-dir --break-system-packages -r requirements.txt; fi
# Skip pyproject.toml installation - we'll call Sherlock directly

# Copy the rest of the backend application
WORKDIR /app
COPY backend/ ./backend/

# Create non-root user for security
RUN useradd -r -u 1001 -g root peatuser
RUN chown -R peatuser:root /app
USER peatuser

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Set working directory to backend
WORKDIR /app/backend

# Start the application
CMD ["npm", "start"]