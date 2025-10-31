# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---------- Stage 2: Build Backend ----------
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build

WORKDIR /app/server
COPY server/pom.xml .
RUN mvn dependency:go-offline
COPY server/ ./
# Copy built frontend into backend static resources
COPY --from=frontend-build /app/client/dist/ src/main/resources/static/
RUN mvn clean package -DskipTests

# ---------- Stage 3: Final image ----------
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app
# Copy the backend jar
COPY --from=backend-build /app/server/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]