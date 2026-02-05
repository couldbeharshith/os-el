# Build stage for C backend
FROM ubuntu:22.04 as builder

RUN apt-get update && apt-get install -y \
    build-essential \
    libjson-c-dev \
    make \
    gcc

WORKDIR /app
COPY bin/ ./bin/

RUN cd bin && make

# Final stage
FROM node:18-slim

RUN apt-get update && apt-get install -y \
    libjson-c5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
COPY --from=builder /app/bin/a ./bin/a
COPY --from=builder /app/bin/vmd ./bin/vmd

RUN chmod +x bin/a bin/vmd

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
