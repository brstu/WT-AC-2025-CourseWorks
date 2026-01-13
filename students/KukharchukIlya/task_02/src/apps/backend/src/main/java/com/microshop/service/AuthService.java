package com.microshop.service;

import com.microshop.dto.AuthResponse;
import com.microshop.dto.LoginRequest;
import com.microshop.dto.RegisterRequest;
import com.microshop.model.User;
import com.microshop.repository.UserRepository;
import com.microshop.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        
        user = userRepository.save(user);
        
        String accessToken = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());
        
        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
            user.getId(),
            user.getEmail(),
            user.getRole().name()
        );
        
        return new AuthResponse(accessToken, refreshToken, userDto);
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        String accessToken = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());
        
        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
            user.getId(),
            user.getEmail(),
            user.getRole().name()
        );
        
        return new AuthResponse(accessToken, refreshToken, userDto);
    }
    
    public String refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        
        var userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }
}
