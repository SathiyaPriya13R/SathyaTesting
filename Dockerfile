# Build stage
FROM node:20.11.0-alpine as builder
WORKDIR /home
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20.11.0-alpine
WORKDIR /app
COPY --from=builder /home/dist /app
COPY package*.json ./
RUN npm install --only=production

# Install pm2 and configure pm2-logrotate
RUN npm install -g pm2 \
    && pm2 install pm2-logrotate \
    && pm2 set pm2-logrotate:rotateModule true \
    && pm2 set pm2-logrotate:max_size 300M \
    && pm2 set pm2-logrotate:rotateInterval '0 0 */7 * *'

EXPOSE 3000

CMD ["sh", "-c", "pm2-runtime start index.js --name qway-api && pm2 ls && pm2 save && pm2 restart all && pm2 reset all"]