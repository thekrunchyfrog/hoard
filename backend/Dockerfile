FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src ./src

# Copy environment file
COPY .env .env

# Create images directory
RUN mkdir -p /app/images

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
