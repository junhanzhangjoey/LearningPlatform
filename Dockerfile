# Use Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies (for building some npm packages)
RUN apk add --no-cache python3 make g++

# Copy package files for root, frontend, and backend
COPY package*.json ./
COPY LMS-Frontend/package*.json ./LMS-Frontend/
COPY LMS-Backend/package*.json ./LMS-Backend/

# Install dependencies for all parts of the project
RUN npm install
RUN cd LMS-Frontend && npm install
RUN cd LMS-Backend && npm install

# Copy the rest of the application code
COPY . .

# Build frontend and backend applications
RUN cd LMS-Frontend && npm run build
RUN cd LMS-Backend && npm run build

# Expose the ports that your frontend and backend applications will listen on
EXPOSE 3000 3001

# Set environment variables (e.g., for development mode)
ENV NODE_ENV=development

# Command to start both frontend and backend services in development mode
CMD ["npm", "run", "dev"]