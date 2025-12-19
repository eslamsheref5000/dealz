FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules (python3, make, g++)
RUN apk add --no-cache python3 make g++

# Install dependencies (Copy from backend directory)
COPY backend/package*.json ./
RUN npm install

# Copy source code (Copy from backend directory)
COPY backend/ .

# Build the application
RUN npm run build

# Expose the port that Hugging Face Spaces expects
EXPOSE 7860

# Start the application
CMD ["npm", "run", "start"]
