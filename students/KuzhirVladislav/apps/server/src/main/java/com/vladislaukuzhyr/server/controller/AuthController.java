package com.vladislaukuzhyr.server.controller;

import com.vladislaukuzhyr.server.dto.AuthRequest;
import com.vladislaukuzhyr.server.dto.AuthResponse;
import com.vladislaukuzhyr.server.dto.user.UserCreateDto;
import com.vladislaukuzhyr.server.dto.user.UserReadDto;
import com.vladislaukuzhyr.server.security.JwtUtils;
import com.vladislaukuzhyr.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthenticationManager authenticationManager;
  private final JwtUtils jwtUtils;
  private final UserService userService;

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(request.username(), request.password())
      );
      var user = userService.findByUsername(request.username());
      if (user.isEmpty()) {
        return ResponseEntity.status(401).build();
      }
      String token = jwtUtils.generateToken(request.username(), user.get().getId());
      return ResponseEntity.ok(new AuthResponse(token));
    } catch (AuthenticationException ex) {
      return ResponseEntity.status(401).build();
    }
  }

  @PostMapping("/register")
  public ResponseEntity<UserReadDto> register(@Valid @RequestBody UserCreateDto dto) {
    UserReadDto read = userService.create(dto);
    return ResponseEntity.ok(read);
  }
}
