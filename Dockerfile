# Stage 1: Build the Angular app
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: serve static files with nginx
FROM nginx:stable-alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/roster-web/browser /usr/share/nginx/html

EXPOSE 80