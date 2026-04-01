package com.imageservice.auth.controller;

import com.imageservice.auth.model.dto.AuthResponse;
import com.imageservice.auth.model.dto.LoginRequest;
import com.imageservice.auth.model.dto.RegisterRequest;
import com.imageservice.auth.model.entity.User;
import com.imageservice.auth.repository.UserRepository;
import com.imageservice.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService,
            UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, e.getMessage(), null));
        }
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader("Authorization") String authHeader) {
        String email = authService.getEmailFromToken(authHeader.substring(7));
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!requester.getRole().equals("ADMIN")) {
            return ResponseEntity.status(403)
                    .body("Access denied. Admins only.");
        }
        return ResponseEntity.ok(userRepository.findAll());
    }
}