package com.microshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private UUID id;
        private String email;
        private String role;
    }
}
