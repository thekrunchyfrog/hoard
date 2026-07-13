FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk --no-cache add curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY index.html ./
COPY vite.config.js ./

# Copy environment file
COPY .env .env

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Start Vite dev server
CMD ["npm", "run", "dev"]
