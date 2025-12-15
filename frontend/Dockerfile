# Base on Node 20 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set port environment variable
ENV PORT 11038

# Copy package files first (for better caching)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install --force

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Set production mode after build
ENV NODE_ENV production

# Expose the port the app runs on
EXPOSE 11038

# Start the application
CMD ["npm", "start"]