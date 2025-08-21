# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /usr/src/app

# 1) Instalar solo dependencias de producción (cache-friendly)
COPY delivery-app/package*.json ./
# Usa npm ci si hay package-lock; si no, npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --only=production; fi

# 2) Copiar código y frontend estático
COPY delivery-app/src ./src
COPY delivery-app/public ./public

# 3) Config por defecto (se puede sobrescribir con -e o .env)
ENV NODE_ENV=production \
    APP_PORT=3000

EXPOSE 3000

CMD ["node", "src/index.js"]
