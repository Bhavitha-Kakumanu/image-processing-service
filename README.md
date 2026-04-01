# Image Processing Service — Microservices Architecture

## Table of Contents
1. [Project Overview](#project-overview)
2. [High Level Architecture](#high-level-architecture)
3. [Low Level Architecture](#low-level-architecture)
4. [Features](#features)
5. [Tech Stack](#tech-stack)
6. [Frontend Explained](#frontend-explained)
7. [How to Run](#how-to-run)
8. [API Endpoints](#api-endpoints)

---

## Project Overview

A full-stack image processing service built using a **microservices architecture**. Users can register, log in, upload images, and apply transformations such as resize, crop, rotate, watermark, and format conversion. The system is secured with JWT authentication and sends email alerts on registration and login.

---

## High Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│              (localhost:3000)                        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌─────────────────────────────────────────────────────┐
│                  API Gateway                         │
│              (localhost:8080)                        │
│     Routes /api/auth/** → Auth Service              │
│     Routes /api/images/** → Image Service           │
└────────────┬────────────────────┬───────────────────┘
             │                    │
             ▼                    ▼
┌────────────────────┐  ┌────────────────────┐
│    Auth Service    │  │   Image Service    │
│   (port 8081)      │  │   (port 8082)      │
│                    │  │                    │
│ - Register         │  │ - Upload           │
│ - Login            │  │ - List images      │
│ - JWT tokens       │  │ - Delete images    │
│ - Email alerts     │  │ - Resize           │
│ - Admin users      │  │ - Crop             │
└────────┬───────────┘  │ - Rotate           │
         │              │ - Watermark        │
         ▼              │ - Convert format   │
┌────────────────┐      └────────┬───────────┘
│   auth_db      │               │
│  (PostgreSQL)  │               ▼
│                │      ┌────────────────┐
│  users table   │      │   image_db     │
└────────────────┘      │  (PostgreSQL)  │
                        │               │
                        │ images table  │
                        └───────────────┘
                        
         ┌──────────────────────────┐
         │      Eureka Server       │
         │      (port 8761)         │
         │  Service Registry —      │
         │  all services register   │
         │  here so they can find   │
         │  each other              │
         └──────────────────────────┘
```

### What Each Layer Does

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React JS | User interface — forms, image display, transformation controls |
| API Gateway | Spring Cloud Gateway | Single entry point — routes requests to correct service |
| Auth Service | Spring Boot | User registration, login, JWT token generation, email alerts |
| Image Service | Spring Boot | Image upload, storage, all transformations |
| Eureka Server | Netflix Eureka | Service registry — services find each other by name |
| Databases | PostgreSQL | Persistent storage — separate DB per service |

---

## Low Level Architecture

### Auth Service — Internal Structure

```
com.imageservice.auth
├── controller/
│   └── AuthController.java        ← receives HTTP requests
│                                    POST /api/auth/register
│                                    POST /api/auth/login
│                                    GET  /api/auth/admin/users
│
├── service/
│   └── AuthService.java           ← business logic
│                                    validates input
│                                    encodes passwords (BCrypt)
│                                    sends emails (JavaMailSender)
│                                    generates JWT tokens
│
├── repository/
│   └── UserRepository.java        ← talks to PostgreSQL
│                                    findByEmail()
│                                    existsByEmail()
│
├── model/
│   ├── entity/
│   │   └── User.java              ← maps to 'users' table
│   └── dto/
│       ├── RegisterRequest.java   ← incoming registration data
│       ├── LoginRequest.java      ← incoming login data
│       └── AuthResponse.java      ← outgoing response (token + message)
│
├── security/
│   ├── JwtUtil.java               ← creates and validates JWT tokens
│   └── JwtFilter.java             ← runs on every request
│                                    reads Authorization header
│                                    validates token
│                                    sets user identity
│
└── config/
    └── SecurityConfig.java        ← Spring Security rules
                                     /api/auth/** = public
                                     everything else = needs token
```

### Image Service — Internal Structure

```
com.imageservice.image
├── controller/
│   └── ImageController.java       ← HTTP endpoints
│                                    POST /api/images/upload
│                                    POST /api/images/upload/bulk
│                                    GET  /api/images
│                                    DELETE /api/images/{id}
│                                    GET  /api/images/{id}/resize
│                                    GET  /api/images/{id}/crop
│                                    GET  /api/images/{id}/rotate
│                                    GET  /api/images/{id}/watermark
│                                    GET  /api/images/{id}/convert
│                                    GET  /api/images/{id}/retrieve
│
├── service/
│   ├── ImageService.java          ← upload, list, delete logic
│   │                                saves files to disk
│   │                                saves metadata to DB
│   └── TransformService.java      ← all image transformations
│                                    uses Thumbnailator library
│                                    uses Java ImageIO
│
├── repository/
│   └── ImageRepository.java       ← talks to PostgreSQL
│                                    findByOwnerEmail()
│                                    findByIdAndOwnerEmail()
│
├── model/
│   ├── entity/
│   │   └── ImageMetadata.java     ← maps to 'images' table
│   └── dto/
│       └── ImageResponse.java     ← outgoing image data
│
└── security/
    ├── JwtUtil.java               ← validates tokens
    ├── JwtFilter.java             ← protects all endpoints
    └── config/SecurityConfig.java ← all endpoints require auth
```

### JWT Authentication Flow

```
1. User sends POST /api/auth/login with email + password
2. AuthService finds user in database
3. BCrypt checks if password matches stored hash
4. JwtUtil generates a token containing user's email
   Token looks like: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGdtYWlsLmNvbSJ9...
   Token contains: { email, issuedAt, expiry (24 hours) }
5. Token returned to browser
6. Browser stores token in localStorage
7. Every future request includes header: Authorization: Bearer <token>
8. JwtFilter intercepts request, validates token, sets user identity
9. Controller receives request with authenticated user
```

### Database Schema

**auth_db — users table**
```sql
CREATE TABLE users (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,    -- BCrypt hash, never plain text
    role        VARCHAR(255) DEFAULT 'USER',
    created_at  TIMESTAMP
);
```

**image_db — images table**
```sql
CREATE TABLE images (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    filename      VARCHAR(255),    -- UUID_originalname.jpg
    original_name VARCHAR(255),    -- what user uploaded
    content_type  VARCHAR(255),    -- image/jpeg etc
    file_size     BIGINT,          -- bytes
    storage_path  VARCHAR(255),    -- path on disk
    owner_email   VARCHAR(255),    -- which user owns this
    uploaded_at   TIMESTAMP
);
```

---

## Features

| # | Feature | Service | Description |
|---|---|---|---|
| 1 | Sign-Up | Auth | Register with name, email, password. Welcome email sent. |
| 2 | Log-In | Auth | Login returns JWT token. Login alert email sent. |
| 3 | JWT Auth | Auth + Image | All image endpoints secured. Token required. |
| 4 | Upload Image | Image | Single image upload. File saved to disk. Metadata saved to DB. |
| 5 | Resize | Image | Resize to any width/height using Thumbnailator. |
| 6 | Crop | Image | Crop at x, y coordinates with width/height. |
| 7 | Rotate | Image | Rotate by any angle 0-360 degrees. |
| 8 | Watermark | Image | Add text watermark to bottom of image. |
| 9 | Format Convert | Image | Convert to PNG, JPG, WEBP, GIF. |
| 10 | List Images | Image | List all images uploaded by logged-in user with metadata. |
| 11 | Delete Image | Image | Delete single image from disk and database. |
| 12 | Bulk Upload | Image | Upload multiple images at once. |
| 13 | Bulk Transform | Image | Apply same transformation to multiple images. |
| 14 | Admin Panel | Auth | See all registered users (admin only). |

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Programming language |
| Spring Boot 3.2 | Framework for building services |
| Spring MVC | Handles HTTP requests and routing |
| Spring Data JPA | Database access without writing SQL |
| Spring Security | JWT authentication and authorization |
| Spring Cloud Gateway | API Gateway for routing requests |
| Netflix Eureka | Service discovery and registry |
| JavaMailSender | Sending email notifications |
| JWT (jjwt 0.11.5) | Generating and validating tokens |
| Thumbnailator | Image resizing, rotating, format conversion |
| Java ImageIO | Image cropping and watermarking |
| PostgreSQL | Relational database |
| Maven | Build tool and dependency management |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router 6 | Client-side page navigation |
| Axios | HTTP requests to backend |
| Bootstrap 5 | CSS framework for styling |
| Context API | Global state management (auth token) |

---

## Frontend Explained

The frontend is a React application with the following structure:

```
src/
├── api/
│   └── api.js              ← All API calls in one place
│                             authApi talks to port 8081
│                             imageApi talks to port 8082
│                             imageApi automatically adds JWT token
│
├── context/
│   └── AuthContext.js      ← Global auth state
│                             stores token, email, role in localStorage
│                             login() / logout() functions
│                             any component can access via useAuth()
│
├── components/
│   ├── Navbar.jsx          ← Top navigation bar
│   │                         shows/hides Admin link based on role
│   └── ImageCard.jsx       ← Single image card on dashboard
│                             loads preview image
│                             Transform and Delete buttons
│
└── pages/
    ├── Login.jsx           ← Login form
    │                         calls loginUser() from api.js
    │                         stores token in AuthContext
    │                         redirects to dashboard
    │
    ├── Register.jsx        ← Registration form
    │                         calls registerUser() from api.js
    │                         redirects to login on success
    │
    ├── Dashboard.jsx       ← Main page showing all images
    │                         loads images on mount
    │                         Clear All button
    │                         Upload New button
    │
    ├── Upload.jsx          ← Upload page
    │                         drag and drop support
    │                         multiple file selection
    │                         preview before upload
    │
    ├── Transform.jsx       ← Single image transformation
    │                         tabs for each transform type
    │                         sliders for resize/rotate
    │                         result preview + download
    │
    ├── BulkTransform.jsx   ← Apply transform to many images
    │                         checkbox selection
    │                         Select All button
    │                         Download All results
    │
    └── Admin.jsx           ← Admin only page
                              shows all registered users
                              only visible if role === 'ADMIN'
```

### How React Communicates with Backend

```
User clicks button
       ↓
Component calls function from api.js
       ↓
api.js uses axios to make HTTP request
Adds Authorization: Bearer <token> header automatically
       ↓
Request goes to localhost:8081 or 8082
       ↓
Spring Boot processes request
Returns JSON response
       ↓
React updates state with response data
Component re-renders showing new data
```

### Key React Concepts Used

**useState** — stores data that changes over time
```javascript
const [images, setImages] = useState([]);
// images starts empty, setImages updates the list
```

**useEffect** — runs code when component loads
```javascript
useEffect(() => {
  listImages().then(res => setImages(res.data));
}, []); // [] means run once when page loads
```

**Context API** — shares data across all components without passing props
```javascript
// Any component can get the token:
const { token, userEmail } = useAuth();
```

**Protected Routes** — redirects to login if not authenticated
```javascript
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};
```

---

## How to Run

### Prerequisites
- Java 21
- Maven
- PostgreSQL 15
- Node.js 18+

### Database Setup
```bash
psql postgres
CREATE DATABASE auth_db;
CREATE DATABASE image_db;
CREATE USER imguser WITH PASSWORD 'imgpassword123';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO imguser;
GRANT ALL PRIVILEGES ON DATABASE image_db TO imguser;
\q
```

### Start Order (important — must follow this order)
```bash
# Terminal 1
cd eureka-server && mvn spring-boot:run

# Terminal 2 (wait for eureka to start first)
cd auth-service && mvn spring-boot:run

# Terminal 3
cd image-service && mvn spring-boot:run

# Terminal 4
cd api-gateway && mvn spring-boot:run

# Terminal 5
cd image-frontend && npm install && npm start
```

### Set Admin Role
```bash
psql -d auth_db -U imguser -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

---

## API Endpoints

All endpoints go through the gateway at `http://localhost:8080`

### Auth Endpoints (no token required)
| Method | URL | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT token |

### Auth Endpoints (token required)
| Method | URL | Description |
|---|---|---|
| GET | /api/auth/admin/users | List all users (admin only) |

### Image Endpoints (token required)
| Method | URL | Description |
|---|---|---|
| POST | /api/images/upload | Upload single image |
| POST | /api/images/upload/bulk | Upload multiple images |
| GET | /api/images | List all my images |
| DELETE | /api/images/{id} | Delete an image |
| GET | /api/images/{id}/resize?width=&height= | Resize image |
| GET | /api/images/{id}/crop?x=&y=&width=&height= | Crop image |
| GET | /api/images/{id}/rotate?angle= | Rotate image |
| GET | /api/images/{id}/watermark?text= | Add watermark |
| GET | /api/images/{id}/convert?format= | Convert format |
| GET | /api/images/{id}/retrieve | Get original image |
