# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS frontend-build

# Set build-time environment variables for frontend
ARG VITE_BACKEND_URL
ARG VITE_WS_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_WS_URL=${VITE_WS_URL}

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---------- Stage 2: Build Backend ----------
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build

ARG BACKEND_ENV_FILE=.env
WORKDIR /app/server
COPY server/pom.xml .
RUN mvn dependency:go-offline
COPY server/ ./
# Copy built frontend into Spring Boot static resources
COPY --from=frontend-build /app/client/dist/ src/main/resources/static/
RUN mvn clean package -DskipTests

# ---------- Stage 3: Final image ----------
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app
# Copy backend jar
COPY --from=backend-build /app/server/target/*.jar app.jar

# Expose the port Render sets via environment variable
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]