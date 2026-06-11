# Tahap 1: Build aplikasi
FROM node:18-alpine AS builder

WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies (production only lebih cepat & ringkas)
RUN npm ci

# Salin seluruh kode
COPY . .

# Build aplikasi Vite (hasilnya di folder 'dist')
RUN npm run build

# Tahap 2: Deploy dengan Nginx
FROM nginx:alpine

# Hapus default html nginx
RUN rm -rf /usr/share/nginx/html/*

# Salin hasil build dari tahap builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Salin konfigurasi nginx khusus untuk SPA (client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]