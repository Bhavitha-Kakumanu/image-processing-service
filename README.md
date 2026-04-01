# Image Processing Service — Microservices

## Prerequisites
- Java 21
- Maven
- PostgreSQL 15
- Node.js 18+

## Database Setup
Open Terminal and run:
```
psql postgres
CREATE DATABASE auth_db;
CREATE DATABASE image_db;
CREATE USER imguser WITH PASSWORD 'imgpassword123';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO imguser;
GRANT ALL PRIVILEGES ON DATABASE image_db TO imguser;
\q
```

## IMPORTANT: Update Email Settings
In auth-service/src/main/resources/application.properties, replace:
  spring.mail.username=your@gmail.com
  spring.mail.password=your_app_password
with your real Gmail and App Password.

## Start Order (MUST follow this order)
1. eureka-server   → port 8761
2. auth-service    → port 8081
3. image-service   → port 8082
4. api-gateway     → port 8080

## Start Backend (each in its own terminal)
cd eureka-server  && mvn spring-boot:run
cd auth-service   && mvn spring-boot:run
cd image-service  && mvn spring-boot:run
cd api-gateway    && mvn spring-boot:run

## Start Frontend
cd image-frontend
npm install
npm start
→ Opens at http://localhost:3000

## API Endpoints (all through gateway port 8080)
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login, returns JWT token
POST /api/images/upload   - Upload image (requires token)
GET  /api/images          - List all images (requires token)
GET  /api/images/{id}/resize?width=300&height=300
GET  /api/images/{id}/crop?x=0&y=0&width=200&height=200
GET  /api/images/{id}/rotate?angle=90
GET  /api/images/{id}/watermark?text=MyBrand
GET  /api/images/{id}/convert?format=png
GET  /api/images/{id}/retrieve
