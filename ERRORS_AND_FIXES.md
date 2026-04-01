# Errors Encountered and How We Fixed Them

This document records every significant error that occurred during development, why it happened, and how it was resolved.

---

## 1. Failed to determine a suitable driver class

**When:** First run of Spring Boot after setup  
**Error:**
```
Reason: Failed to determine a suitable driver class
Consider the following: If you want an embedded database (H2, HSQL or Derby), please put it on the classpath.
```
**Why it happened:** Spring Boot detected a database dependency (PostgreSQL) but no database connection was configured yet. It didn't know where to connect.  
**Fix:** Added `application.properties` with the PostgreSQL connection URL, username, password, and driver class name.

---

## 2. Lombok annotations not working — getters/setters undefined

**When:** Building Auth Service  
**Error:**
```
The method getEmail() is undefined for type RegisterRequest
The blank final field authService may not have been initialized
```
**Why it happened:** Lombok is a library that auto-generates getters, setters, and constructors using annotations like `@Data` and `@RequiredArgsConstructor`. For it to work in Eclipse, a special Lombok plugin must be installed. Without the plugin, Eclipse compiles the code without generating the methods.  
**Fix:** Removed all Lombok annotations and wrote getters, setters, and constructors manually for every class. This is more code but works in any IDE without plugins.

---

## 3. JWT library version conflicts

**When:** Adding JWT dependency  
**Error:** Various `NoSuchMethodError` and `ClassNotFoundException` for JWT classes  
**Why it happened:** The JWT library `jjwt` has two different APIs — the old `0.9.x` version and the newer `0.11.x` version. They are completely different APIs and cannot be mixed.  
**Fix:** Used `jjwt-api`, `jjwt-impl`, and `jjwt-jackson` all at version `0.11.5` and used the newer `Jwts.parserBuilder()` API instead of the old `Jwts.parser()`.

---

## 4. Eureka — Cannot execute request on any known server

**When:** Starting services with Eureka Discovery Client  
**Error:**
```
DiscoveryClient was unable to send heartbeat!
Cannot execute request on any known server
```
**Why it happened:** The Eureka client dependency was added to auth-service and image-service, so they automatically try to register themselves with Eureka on port 8761. But the Eureka server was not started before the other services.  
**Fix:** Always start services in this strict order: Eureka Server first → then Auth Service → then Image Service → then API Gateway.

---

## 5. Spring Cloud Gateway — missing version in pom.xml

**When:** Running api-gateway  
**Error:**
```
'dependencies.dependency.version' for org.springframework.cloud:spring-cloud-starter-gateway-server-webmvc:jar is missing
```
**Why it happened:** Spring Cloud dependencies get their versions from a Bill of Materials (BOM) called `spring-cloud-dependencies`. Without the `<dependencyManagement>` block that imports this BOM, Maven doesn't know what version to use.  
**Fix:** Added the `<dependencyManagement>` block to `api-gateway/pom.xml` with the correct `spring-cloud.version` property.

---

## 6. Gateway — NoClassDefFoundError: ClientHttpRequestFactorySettings$Redirects

**When:** Running api-gateway after adding gateway dependency  
**Error:**
```
java.lang.NoClassDefFoundError: org/springframework/boot/http/client/ClientHttpRequestFactorySettings$Redirects
```
**Why it happened:** `spring-cloud-starter-gateway-server-webmvc` version `4.3.0` requires Spring Boot `3.4.x` or higher. The project was using Spring Boot `3.2.5` which doesn't have the `ClientHttpRequestFactorySettings.Redirects` class.  
**Fix:** Upgraded Spring Boot version in api-gateway `pom.xml` from `3.2.5` to `3.4.0`.

---

## 7. API Gateway 404 — routes not found

**When:** Testing registration through gateway  
**Error:**
```json
{ "status": 404, "error": "Not Found", "path": "/api/auth/register" }
```
**Why it happened:** Two issues combined:
1. The MVC Gateway uses `spring.cloud.gateway.mvc.routes` in properties (not `spring.cloud.gateway.routes`)
2. The `lb://` load balancer prefix requires Eureka to be working correctly  
**Fix:** Switched to Java-based route configuration using `GatewayRouterFunctions` and `LoadBalancerFilterFunctions.lb()` which correctly resolves service names through Eureka.

---

## 8. CORS — Access-Control-Allow-Origin contains multiple values

**When:** Connecting React frontend to backend  
**Error:**
```
The 'Access-Control-Allow-Origin' header contains multiple values 'http://localhost:3000, http://localhost:3000', but only one is allowed
```
**Why it happened:** CORS headers were being added twice — once by the `CorsFilter` in the gateway, and once by the `CorsConfigurationSource` bean in auth-service's `SecurityConfig`. Both ran on every request, doubling the header.  
**Fix:** Removed the `CorsConfigurationSource` bean from individual services and kept CORS handling only in the gateway's `CorsFilter`.

---

## 9. Spring Security 403 on auth-service

**When:** Browser registration requests  
**Error:**
```
POST http://localhost:8081/api/auth/register 403 Forbidden
```
**Why it happened:** The OPTIONS preflight request (which browsers send before every cross-origin POST) was being blocked by Spring Security. Spring Security was checking authentication on OPTIONS requests even though they should be allowed through without authentication.  
**Fix:** Added `requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` as the first rule in `SecurityConfig`, so OPTIONS requests are always allowed through before any other security checks run.

---

## 10. Eureka — Unable to set redirect follow using reflection

**When:** Running api-gateway with Java 25  
**Error:**
```
WARN: Request execution failed with message: Unable to set redirect follow using reflection
```
**Why it happened:** The Eureka client uses Java reflection to configure HTTP redirect following. In Java 21+, certain reflection operations are restricted by default as part of the Java module system security improvements. Java 25 is stricter than Java 21 about this.  
**Fix:** Switched from Java 25 to Java 21 using Homebrew (`brew install openjdk@21`) and updated the `JAVA_HOME` environment variable.

---

## 11. node_modules corruption — No file content

**When:** Setting up React frontend  
**Error:**
```
Module not found: Error: package.json (directory description file): Error: No file content
export 'useState' was not found in 'react'
```
**Why it happened:** `npm install` was run while `rm -rf node_modules` was still in progress. Some package.json files inside node_modules were deleted or left empty mid-operation, corrupting the installation.  
**Fix:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install react@18.2.0 react-dom@18.2.0 react-scripts@5.0.1 ...
```
Clearing the npm cache and specifying exact versions ensured a clean reinstall.

---

## 12. Email not sending — Authentication failed

**When:** Registration and login  
**Error (in console):**
```
Email could not be sent: Authentication failed
```
**Why it happened:** Gmail blocks regular passwords for third-party app connections. The `spring.mail.password` was set to a regular Gmail password which Google rejects.  
**Fix:** Created a Gmail App Password:
1. Enable 2-Step Verification on Google Account
2. Go to Security → App Passwords
3. Generate a 16-character app password
4. Use that password in `application.properties` instead of the regular Gmail password

---

## 13. Email already in use — showing as 500 error in browser

**When:** Trying to register with an existing email  
**Error:** Browser showed "Registration failed" but auth-service log showed a `RuntimeException`  
**Why it happened:** When `AuthService.register()` throws a `RuntimeException("Email already in use")`, Spring Boot converts unhandled exceptions to HTTP 500. The browser received 500 but the React error handler showed a generic message.  
**Fix:** Wrapped the service call in a try-catch in `AuthController` and returned HTTP 400 with the error message:
```java
try {
    return ResponseEntity.ok(authService.register(request));
} catch (RuntimeException e) {
    return ResponseEntity.badRequest().body(new AuthResponse(null, e.getMessage(), null));
}
```

---

## 14. role column does not exist

**When:** Trying to set admin role  
**Error:**
```
ERROR: column "role" does not exist
```
**Why it happened:** The `role` field was added to `User.java` but the file was being edited in the wrong project folder. There were two copies of the project — one in `Downloads/` and one in `Training Project/`. The auth-service was running from `Downloads/` but edits were being made to `Training Project/`.  
**Fix:**
1. Used `find` command to locate all copies of `User.java`
2. Identified which copy the running service was using from the startup log
3. Edited the correct file in `Downloads/Image-Processing-Project/`
4. When Hibernate still didn't add the column, added it manually:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(255) DEFAULT 'USER';
```

---

## 15. Mac running out of RAM — Spring Tools freezing

**When:** Running all 4 services + Eclipse + React simultaneously  
**Symptoms:** Eclipse not responding, `PhysMem: 7469M used, 162M unused`, Load Avg: 21  
**Why it happened:** Each Spring Boot service uses ~500MB RAM. Running 4 services + Eclipse (1.5GB) + npm left almost no RAM free, causing the OS to swap to disk and freeze the machine.  
**Fix:**
1. Switched from Eclipse to VS Code (uses ~200MB vs ~1.5GB)
2. Only run services needed for current task (skip Eureka/Gateway when testing React)
3. Restarted Mac to clear memory before working sessions
