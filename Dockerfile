FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy backend code
COPY backend ./backend
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Back to app root
WORKDIR /app

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start backend
CMD ["node", "backend/server.js"]
