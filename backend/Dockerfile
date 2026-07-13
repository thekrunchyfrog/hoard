FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src ./src

# Copy environment file
COPY .env .env

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
