# Stage 1: Build the frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Create placeholder env file for build (real values should be passed at runtime)
RUN echo "API_KEY=PLACEHOLDER" > ./.env
RUN echo "GEMINI_API_KEY=PLACEHOLDER" >> ./.env

# Build the frontend
RUN npm run build


# Stage 2: Serve with a lightweight server
FROM node:22-alpine

WORKDIR /app

# Install serve to host static files
RUN npm install -g serve

# Copy built frontend assets from the builder stage
COPY --from=builder /app/dist ./dist

# Cloud Run uses the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Use serve to host the static files
# -s enables single-page application mode (all routes serve index.html)
# -l binds to the PORT environment variable
CMD ["sh", "-c", "serve -s dist -l $PORT"]
