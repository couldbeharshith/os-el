# Build stage for C backend
FROM ubuntu:22.04 as builder

RUN apt-get update && apt-get install -y \
    build-essential \
    libjson-c-dev \
    make \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY bin/ ./bin/

RUN cd bin && make

# Final stage
FROM node:18-slim

RUN apt-get update && apt-get install -y \
    libjson-c5 \
    procps \
    stress-ng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Copy compiled C binaries from builder
COPY --from=builder /app/bin/a ./bin/a
COPY --from=builder /app/bin/vmd ./bin/vmd

RUN chmod +x bin/a bin/vmd

# Set environment variable for refresh interval
ENV NEXT_PUBLIC_REFRESH_INTERVAL=400

# Build Next.js app
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
