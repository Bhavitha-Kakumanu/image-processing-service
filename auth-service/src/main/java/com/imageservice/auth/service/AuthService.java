package com.imageservice.auth.service;

import com.imageservice.auth.model.dto.AuthResponse;
import com.imageservice.auth.model.dto.LoginRequest;
import com.imageservice.auth.model.dto.RegisterRequest;
import com.imageservice.auth.model.entity.User;
import com.imageservice.auth.repository.UserRepository;
import com.imageservice.auth.security.JwtUtil;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        sendEmail(request.getEmail(), "Welcome to Image Service!",
                "Hi " + request.getName() + ",\n\nYour account was created successfully!");
        return new AuthResponse(null, "Registration successful!", "USER");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        sendEmail(user.getEmail(), "New Login Alert",
                "Hi " + user.getName() + ",\n\nA new login was detected on your account.");
        return new AuthResponse(token, "Login successful!", user.getRole());
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.out.println("Email could not be sent: " + e.getMessage());
        }
    }

    public String getEmailFromToken(String token) {
        return jwtUtil.extractEmail(token);
    }
}
