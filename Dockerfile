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
FROM node:18-alpine

RUN apk add --no-cache \
    libc6-compat \
    libjson-c

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
COPY --from=builder /app/bin/a ./bin/a
COPY --from=builder /app/bin/vmd ./bin/vmd

RUN chmod +x bin/a bin/vmd

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
