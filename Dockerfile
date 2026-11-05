FROM node:26-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_USE_API_PROXY=true
RUN npm run build
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY proxy_params /etc/nginx/proxy_params_inteliagent
