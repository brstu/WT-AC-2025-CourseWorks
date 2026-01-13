package com.microshop.controller;

import com.microshop.dto.AuthResponse;
import com.microshop.dto.LoginRequest;
import com.microshop.dto.RegisterRequest;
import com.microshop.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private AuthService authService;
    
    @Test
    void testRegister() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        
        AuthResponse response = new AuthResponse();
        response.setAccessToken("token");
        response.setRefreshToken("refresh");
        
        when(authService.register(any(RegisterRequest.class))).thenReturn(response);
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists());
    }
    
    @Test
    void testLogin() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        
        AuthResponse response = new AuthResponse();
        response.setAccessToken("token");
        
        when(authService.login(any(LoginRequest.class))).thenReturn(response);
        
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }
}
